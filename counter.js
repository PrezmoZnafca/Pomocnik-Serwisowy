import {
  getDatabase, ref, update, increment, serverTimestamp, get
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";
import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import {
  getFunctions, httpsCallable
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-functions.js";

const db = getDatabase();
const auth = getAuth();
const functions = getFunctions();
const fetchRcpTime = httpsCallable(functions, 'fetchRcpTime');

// Statystyki użytkownika
onAuthStateChanged(auth, user => {
  if (user) fetchStats(user.uid);
});

export function incrementCopy() {
  const user = auth.currentUser;
  if (!user) return;
  const userRef = ref(db, `stats/${user.uid}`);
  update(userRef, { copies: increment(1), updatedAt: serverTimestamp() });
}

export function incrementCalc() {
  const user = auth.currentUser;
  if (!user) return;
  const userRef = ref(db, `stats/${user.uid}`);
  update(userRef, { calculations: increment(1), updatedAt: serverTimestamp() });
}

function fetchStats(uid) {
  const statsRef = ref(db, `stats/${uid}`);
  get(statsRef).then(snap => {
    if (!snap.exists()) return;
    const d = snap.val();
    document.getElementById('copy-count').innerText =
      `Skopiowano: ${d.copies ?? 0} razy`;
    document.getElementById('calc-count').innerText =
      `Obliczeń: ${d.calculations ?? 0} razy`;
  });
}

// RCPOnline
export function fetchAndSetRcp() {
  const login = document.getElementById('rcp-login').value.trim();
  const pwd   = document.getElementById('rcp-password').value;
  const statusEl = document.getElementById('rcp-status');

  if (!login || !pwd) {
    statusEl.innerText = 'Podaj login i hasło RCP!';
    return;
  }
  statusEl.innerText = 'Ładowanie z RCP…';

  fetchRcpTime({ login, password: pwd })
    .then(result => {
      const time = result.data.time;
      document.getElementById('arrivalTime').value = time;
      statusEl.innerText = `Godzina przyjścia ustawiona: ${time}`;
      const user = auth.currentUser;
      if (user) {
        const rcpRef = ref(db, `rcpTimes/${user.uid}`);
        update(rcpRef, { time, updatedAt: serverTimestamp() });
      }
    })
    .catch(e => {
      console.error('fetchRcpTime error:', e);
      statusEl.innerText = 'Błąd: ' + (e.message || e.details || 'Nieznany');
    });
}

// Globalne funkcje UI
window.incrementCopy = incrementCopy;
window.incrementCalc = incrementCalc;
window.copyData = text => {
  if (!navigator.clipboard) {
    alert('Clipboard API niedostępne!');
    return;
  }
  navigator.clipboard.writeText(text)
    .then(() => { window.showToast('Skopiowano numery części!'); incrementCopy(); })
    .catch(err => { console.error(err); window.showToast('Błąd kopiowania!'); });
};
window.calculateTime = () => {
  const v = document.getElementById('arrivalTime').value;
  if (!v) { window.showToast('Podaj czas przyjścia!'); return; }
  const [h, m] = v.split(':').map(Number);
  const now = new Date();
  const arrival = new Date(now);
  arrival.setHours(h, m, 0, 0);

  const workMs = (8 * 60 + 15) * 60 * 1000;
  const exitTime = new Date(arrival.getTime() + workMs);

  const fmt = t => `${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}`;
  document.getElementById('outputTime').innerText = fmt(exitTime);

  let workedMs = Math.max(0, now - arrival);
  let remainingMs = Math.max(0, exitTime - now);
  const formatDur = ms => {
    const mins = Math.floor(ms / 60000);
    const hh = Math.floor(mins / 60);
    const mm = mins % 60;
    return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
  };
  document.getElementById('workedTime').innerText = `Przepracowano: ${formatDur(workedMs)}`;
  document.getElementById('remainingTime').innerText = `Pozostało: ${formatDur(remainingMs)}`;

  incrementCalc();
};
window.fetchAndSetRcp = fetchAndSetRcp;
