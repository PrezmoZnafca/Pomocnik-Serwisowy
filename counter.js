import { getDatabase, ref, update, increment, serverTimestamp, get } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

const db = getDatabase();
const auth = getAuth();

// kopiowania
function incrementCopy() {
  onAuthStateChanged(auth, user => {
    if (user) {
      const uRef = ref(db, 'users/' + user.uid);
      update(uRef, {
        copies: increment(1),
        lastActive: serverTimestamp()
      });
      fetchStats(user.uid);
    }
  });
}

// obliczeń
function incrementCalc() {
  onAuthStateChanged(auth, user => {
    if (user) {
      const uRef = ref(db, 'users/' + user.uid);
      update(uRef, {
        calculations: increment(1),
        lastActive: serverTimestamp()
      });
      fetchStats(user.uid);
    }
  });
}

// pobierz oba liczniki
function fetchStats(uid) {
  get(ref(db, 'users/' + uid)).then(snapshot => {
    if (snapshot.exists()) {
      const d = snapshot.val();
      if (d.copies !== undefined) {
        document.getElementById('copy-count').innerText = `Skopiowano: ${d.copies} razy`;
      }
      if (d.calculations !== undefined) {
        document.getElementById('calc-count').innerText = `Obliczeń: ${d.calculations} razy`;
      }
    }
  });
}

onAuthStateChanged(auth, user => {
  if (user) fetchStats(user.uid);
});

window.incrementCopy = incrementCopy;
window.incrementCalc = incrementCalc;
