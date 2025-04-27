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

// kopiowania
function incrementCopy() {
  onAuthStateChanged(auth, user => {
    if (!user) return;
    const uRef = ref(db, 'users/' + user.uid);
    update(uRef, {
      copies:     increment(1),
      lastActive: serverTimestamp()
    });
    fetchStats(user.uid);
  });
}

// obliczeń czasu
function incrementCalc() {
  onAuthStateChanged(auth, user => {
    if (!user) return;
    const uRef = ref(db, 'users/' + user.uid);
    update(uRef, {
      calculations: increment(1),
      lastActive:   serverTimestamp()
    });
    fetchStats(user.uid);
  });
}

// pobranie statystyk
function fetchStats(uid) {
  get(ref(db, 'users/' + uid)).then(snap => {
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
