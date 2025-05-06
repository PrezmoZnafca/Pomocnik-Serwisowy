// counter.js
import {
  getDatabase, ref, update, increment,
  serverTimestamp, get
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

import {
  getFunctions, httpsCallable
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-functions.js";

const db        = getDatabase();
const auth      = getAuth();
const functions = getFunctions();

// 🔥 Tu powinna być nazwa Twojej funkcji onCall
const fetchRcpTime = httpsCallable(functions, 'fetchRcpTime');

// —————— Stats (bez zmian) ——————
function incrementCopy() {
  onAuthStateChanged(auth, user => {
    if (!user) return;
    const userRef = ref(db, `stats/${user.uid}`);
    update(userRef, { copies: increment(1), updatedAt: serverTimestamp() });
  });
}

function incrementCalc() {
  onAuthStateChanged(auth, user => {
    if (!user) return;
    const userRef = ref(db, `stats/${user.uid}`);
    update(userRef, { calculations: increment(1), updatedAt: serverTimestamp() });
  });
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

onAuthStateChanged(auth, user => {
  if (user) fetchStats(user.uid);
});

window.incrementCopy = incrementCopy;
window.incrementCalc  = incrementCalc;

// —————— Integracja z RCP ——————
document.addEventListener('DOMContentLoaded', () => {
  const btn    = document.getElementById('rcp-fetch-btn');
  const status = document.getElementById('rcp-status');
  if (!btn || !status) return;

  btn.addEventListener('click', async () => {
    const login = document.getElementById('rcp-login').value.trim();
    const pwd   = document.getElementById('rcp-password').value;

    if (!login || !pwd) {
      status.innerText = 'Podaj login i hasło RCP!';
      return;
    }
    status.innerText = 'Ładowanie z RCP…';

    try {
      // bezpośrednio wywołujemy jedną funkcję onCall
      const result = await fetchRcpTime({ login, password: pwd });
      const time   = result.data.time;  // oczekujemy formatu "HH:mm"

      // Aktualizujemy UI
      document.getElementById('arrivalTime').value = time;
      status.innerText = `Godzina przyjścia ustawiona: ${time}`;

      // Zapisujemy w RealtimeDB
      onAuthStateChanged(auth, user => {
        if (!user) return;
        const rcpRef = ref(db, `rcpTimes/${user.uid}`);
        update(rcpRef, { time, updatedAt: serverTimestamp() });
      });
    } catch (e) {
      console.error('fetchRcpTime error:', e);
      status.innerText = 'Błąd: ' + (e.message || e.details || 'Nieznany');
    }
  });
});
