import {
  getDatabase,
  ref,
  update,
  increment,
  serverTimestamp,
  get
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

const db   = getDatabase();
const auth = getAuth();

// Zliczanie kopiowań
function incrementCopy() {
  onAuthStateChanged(auth, user => {
    if (!user) return;
    const userRef = ref(db, `stats/${user.uid}`);
    update(userRef, { copies: increment(1), updatedAt: serverTimestamp() });
  });
}

// Zliczanie obliczeń
function incrementCalc() {
  onAuthStateChanged(auth, user => {
    if (!user) return;
    const userRef = ref(db, `stats/${user.uid}`);
    update(userRef, { calculations: increment(1), updatedAt: serverTimestamp() });
  });
}

// Pobranie statystyk (kopiowań, obliczeń)
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

// Gdy użytkownik się zaloguje, pobierz statystyki
onAuthStateChanged(auth, user => {
  if (user) fetchStats(user.uid);
});

// Upublicznij funkcje do globalnego użytku
window.incrementCopy = incrementCopy;
window.incrementCalc  = incrementCalc;

// ---- RCPOnline integration ----
const RCP_WORKER_URL = 'https://rcpworker.prmzke.workers.dev/';

document.addEventListener('DOMContentLoaded', () => {
  const btn    = document.getElementById('rcp-fetch-btn');
  const status = document.getElementById('rcp-status');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const login = document.getElementById('rcp-login').value.trim();
    const pwd   = document.getElementById('rcp-password').value;

    if (!login || !pwd) {
      status.innerText = 'Podaj login i hasło RCP!';
      return;
    }
    status.innerText = 'Ładowanie…';

    try {
      const res = await fetch(RCP_WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password: pwd })
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || res.statusText);
      }
      const { lastActivity } = await res.json();
      const d = new Date(lastActivity);
      const date = d.toLocaleDateString('pl-PL', { day:'2-digit', month:'2-digit' });
      const time = d.toLocaleTimeString('pl-PL', { hour:'2-digit', minute:'2-digit' });
      status.innerText = `Ostatnia aktywność: ${date}, ${time}`;
    } catch (e) {
      console.error(e);
      status.innerText = 'Błąd: ' + e.message;
    }
  });
});
// ---- koniec RCPOnline integration ----
