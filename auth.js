import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  update,
  get,
  serverTimestamp,
  increment
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

initializeApp({
  apiKey: "AIzaSyDbQ195yf4-lgLhLCf30SlJn6op7tDb8l0",
  authDomain: "pomocnik-serwisowy.firebaseapp.com",
  databaseURL: "https://pomocnik-serwisowy-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "pomocnik-serwisowy",
  storageBucket: "pomocnik-serwisowy.appspot.com",
  messagingSenderId: "683654368007",
  appId: "1:683654368007:web:d90e76b516275a847153a2"
});

const auth = getAuth();
const db   = getDatabase();

document.addEventListener('DOMContentLoaded', () => {
  // przełączanie form
  document.getElementById('show-register').onclick = () => {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
  };
  document.getElementById('show-login').onclick = () => {
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
  };

  // rejestracja
  document.getElementById('register-btn').onclick = () => {
    const u = document.getElementById('register-username').value.trim();
    const p = document.getElementById('register-password').value;
    if (!u||!p) { alert('Wypełnij wszystkie pola!'); return; }
    if (p.length<6) { alert('Hasło min. 6 znaków!'); return; }
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
      .then(()=>window.location.reload())
      .catch(e=>alert('Błąd rejestracji: '+e.message));
  };

  // logowanie
  document.getElementById('login-btn').onclick = () => {
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value;
    if (!u||!p) { alert('Wypełnij wszystkie pola!'); return; }
    signInWithEmailAndPassword(auth, `${u}@pomocnik.local`, p)
      .then(({ user }) => update(ref(db, 'users/' + user.uid), {
        lastActive: serverTimestamp(),
        logins:     increment(1)
      }))
      .catch(e=>alert('Błąd logowania: '+e.message));
  };

  // stan auth
  onAuthStateChanged(auth, user => {
    const loBtn = document.getElementById('logout-btn');
    const adBtn = document.getElementById('admin-panel-btn');
    const aSec  = document.getElementById('auth-section');
    const mSec  = document.getElementById('main-section');

    if (user) {
      aSec.classList.add('hidden');
      mSec.classList.remove('hidden');

      // wyloguj
      loBtn.classList.remove('hidden');
      loBtn.onclick = () => signOut(auth).then(()=>window.location.reload());

      // pokaż admin jeśli rola === 'admin'
      get(ref(db, `users/${user.uid}/role`))
        .then(snap => {
          if (snap.val() === 'admin') {
            adBtn.classList.remove('hidden');
            adBtn.onclick = () => window.location.href = 'admin.html';
          }
        })
        .catch(()=>{/* ignore */});
    } else {
      aSec.classList.remove('hidden');
      mSec.classList.add('hidden');
      loBtn.classList.add('hidden');
      adBtn.classList.add('hidden');
    }
  });
});
