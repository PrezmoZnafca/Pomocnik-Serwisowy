import {
  getDatabase, ref, update, increment, get
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";
import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

const db   = getDatabase();
const auth = getAuth();

// Po zalogowaniu pobierz od razu statystyki i wyświetl
onAuthStateChanged(auth, user => {
  if (user) fetchStats(user.uid);
});

export function incrementCopy() {
  const u = auth.currentUser;
  if (!u) return;
  // Zapisz w users/{uid}/copies
  update(ref(db, `users/${u.uid}`), {
    copies: increment(1)
  });
}

export function incrementCalc() {
  const u = auth.currentUser;
  if (!u) return;
  // Zapisz w users/{uid}/calculations
  update(ref(db, `users/${u.uid}`), {
    calculations: increment(1)
  });
}

function fetchStats(uid) {
  get(ref(db, `users/${uid}`)).then(snap => {
    if (!snap.exists()) return;
    const d = snap.val();
    document.getElementById('copy-count').innerText =
      `Skopiowano: ${d.copies ?? 0} razy`;
    document.getElementById('calc-count').innerText =
      `Obliczeń: ${d.calculations ?? 0} razy`;
  });
}

// Globalne funkcje dla UI
window.copyData = text => {
  if (!navigator.clipboard) {
    alert('Clipboard API niedostępne!');
    return;
  }
  navigator.clipboard.writeText(text)
    .then(() => { window.showToast('Skopiowano numery części!'); incrementCopy(); })
    .catch(() => window.showToast('Błąd kopiowania!'));
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
  const fmt = t =>
    `${String(t.getHours()).padStart(2,'0')}:` +
    `${String(t.getMinutes()).padStart(2,'0')}`;
  document.getElementById('outputTime').innerText = fmt(exitTime);

  const workedMs    = Math.max(0, now - arrival);
  const remainingMs = Math.max(0, exitTime - now);
  const formatDur = ms => {
    const mins = Math.floor(ms / 60000),
          hh   = Math.floor(mins / 60),
          mm   = mins % 60;
    return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
  };
  document.getElementById('workedTime').innerText    =
    `Przepracowano: ${formatDur(workedMs)}`;
  document.getElementById('remainingTime').innerText =
    `Pozostało: ${formatDur(remainingMs)}`;

  incrementCalc();
};
