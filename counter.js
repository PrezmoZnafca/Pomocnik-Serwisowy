// counter.js
import {
  getDatabase,
  ref,
  update,
  increment,
  get,
  onValue,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

const db   = getDatabase();
const auth = getAuth();

// ———————— STATYSTYKI —————————

// Po zalogowaniu włączamy real-time nasłuch zmian (kopii i obliczeń)
onAuthStateChanged(auth, user => {
  if (user) {
    const userRef = ref(db, `users/${user.uid}`);
    onValue(userRef, snap => {
      const d = snap.val() || {};
      document.getElementById('copy-count').innerText =
        `Skopiowano: ${d.copies ?? 0} razy`;
      document.getElementById('calc-count').innerText =
        `Obliczeń: ${d.calculations ?? 0} razy`;
    });
  }
});

// Zwiększa licznik kopiowań
export function incrementCopy() {
  const u = auth.currentUser;
  if (!u) return;
  update(ref(db, `users/${u.uid}`), {
    copies: increment(1),
    lastActive: serverTimestamp()
  });
}

// Zwiększa licznik obliczeń
export function incrementCalc() {
  const u = auth.currentUser;
  if (!u) return;
  update(ref(db, `users/${u.uid}`), {
    calculations: increment(1),
    lastActive: serverTimestamp()
  });
}


// ———————— KOPIOWANIE —————————

window.copyData = text => {
  const formatted = text.replace(/\|\s*/g, '\n');
  if (!navigator.clipboard) {
    alert('Clipboard API niedostępne!');
    return;
  }
  navigator.clipboard.writeText(formatted)
    .then(() => {
      window.showToast('Skopiowano numery części!');
      incrementCopy();
    })
    .catch(() => window.showToast('Błąd kopiowania!'));
};


// ———————— OBLICZANIE CZASU —————————

// Wewnętrzna funkcja, która tylko wyświetla czasy (bez inkrementacji ani zapisu)
function performCalculateTime(v) {
  const now     = new Date();
  const [h, m]  = v.split(':').map(Number);
  const arrival = new Date(now);
  arrival.setHours(h, m, 0, 0);

  // 8h15min pracy
  const workMs   = (8 * 60 + 15) * 60 * 1000;
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
    return `${String(hh).padStart(2,'0')}:` +
           `${String(mm).padStart(2,'0')}`;
  };

  document.getElementById('workedTime').innerText    =
    `Przepracowano: ${formatDur(workedMs)}`;
  document.getElementById('remainingTime').innerText =
    `Pozostało: ${formatDur(remainingMs)}`;
}

// Funkcja wywoływana przez przycisk – wyświetla czasy, zapisuje do localStorage i inkrementuje
window.calculateTime = () => {
  const v = document.getElementById('arrivalTime').value;
  if (!v) {
    window.showToast('Podaj czas przyjścia!');
    return;
  }

  // pokazujemy czasy
  performCalculateTime(v);

  // zapisujemy na cały dzień
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem('lastArrivalDate', today);
  localStorage.setItem('lastArrivalTime', v);

  // inkrementujemy w bazie
  incrementCalc();
};


// ———————— WCZYTYWANIE ZAPISANEGO CZASU —————————

document.addEventListener('DOMContentLoaded', () => {
  const today       = new Date().toISOString().split('T')[0];
  const storedDate  = localStorage.getItem('lastArrivalDate');
  const storedTime  = localStorage.getItem('lastArrivalTime');

  if (storedDate === today && storedTime) {
    const input = document.getElementById('arrivalTime');
    if (input) {
      // ustawiamy wartość w polu i od razu pokazujemy czasy
      input.value = storedTime;
      performCalculateTime(storedTime);
    }
  }
});
