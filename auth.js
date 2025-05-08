import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
         onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getDatabase, ref, set, update, serverTimestamp, increment, get } from
       "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

const auth = getAuth();
const db   = getDatabase();

document.addEventListener('DOMContentLoaded', () => {
  // Przełączanie form
  document.getElementById('show-register').addEventListener('click', toggleAuthForms);
  document.getElementById('show-login').addEventListener('click', toggleAuthForms);

  // Rejestracja
  document.getElementById('register-btn').addEventListener('click', () => {
    const u = document.getElementById('register-username').value.trim();
    const p = document.getElementById('register-password').value;
    if (!u || !p)     { showToast('Wypełnij wszystkie pola!'); return; }
    if (p.length < 6) { showToast('Hasło min. 6 znaków!'); return; }
    createUserWithEmailAndPassword(auth, `${u}@pomocnik.local`, p)
      .then(({ user }) => set(ref(db, 'users/' + user.uid), {
        username: u,
        createdAt:   serverTimestamp(),
        lastActive:  serverTimestamp(),
        copies:      0,
        calculations:0,
        logins:      1,
        role:        'user'
      }))
      .then(() => window.location.reload())
      .catch(e => showToast('Błąd rejestracji: ' + e.message));
  });

  // Logowanie
  document.getElementById('login-btn').addEventListener('click', () => {
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value;
    if (!u || !p) { showToast('Wypełnij wszystkie pola!'); return; }
    signInWithEmailAndPassword(auth, `${u}@pomocnik.local`, p)
      .then(({ user }) => update(ref(db, 'users/' + user.uid), {
        lastActive: serverTimestamp(),
        logins:     increment(1)
      }))
      .catch(e => showToast('Błąd logowania: ' + e.message));
  });

  // Stan auth
  onAuthStateChanged(auth, user => {
    const loBtn = document.getElementById('logout-btn');
    const adBtn = document.getElementById('admin-panel-btn');
    const aSec  = document.getElementById('auth-section');
    const mSec  = document.getElementById('main-section');

    if (user) {
      aSec.classList.add('hidden');
      mSec.classList.remove('hidden');
      loBtn.classList.remove('hidden');
      loBtn.addEventListener('click', () => signOut(auth).then(() => window.location.reload()));
      get(ref(db, `users/${user.uid}/role`))
        .then(snap => {
          if (snap.val() === 'admin') {
            adBtn.classList.remove('hidden');
            adBtn.addEventListener('click', () => window.location.href = 'admin.html');
          }
        });
    } else {
      aSec.classList.remove('hidden');
      mSec.classList.add('hidden');
      loBtn.classList.add('hidden');
      adBtn.classList.add('hidden');
    }
  });
});

function toggleAuthForms() {
  document.getElementById('login-form').classList.toggle('hidden');
  document.getElementById('register-form').classList.toggle('hidden');
}
