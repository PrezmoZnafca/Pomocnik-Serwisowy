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

const firebaseConfig = {
  apiKey: "AIzaSyDbQ195yf4-lgLhLCf30SlJn6op7tDb8l0",
  authDomain: "pomocnik-serwisowy.firebaseapp.com",
  databaseURL: "https://pomocnik-serwisowy-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "pomocnik-serwisowy",
  storageBucket: "pomocnik-serwisowy.appspot.com",
  messagingSenderId: "683654368007",
  appId: "1:683654368007:web:d90e76b516275a847153a2"
};

initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase();

document.addEventListener('DOMContentLoaded', () => {
  // przełączanie formularzy
  document.getElementById('show-register').addEventListener('click', () => {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
  });
  document.getElementById('show-login').addEventListener('click', () => {
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
  });

  // rejestracja
  document.getElementById('register-btn').addEventListener('click', () => {
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    if (!username || !password) { alert('Wypełnij wszystkie pola!'); return; }
    if (password.length < 6) { alert('Hasło min. 6 znaków!'); return; }
    const email = `${username}@pomocnik.local`;
    createUserWithEmailAndPassword(auth, email, password)
      .then(({ user }) => {
        return set(ref(db, 'users/' + user.uid), {
          username,
          createdAt: serverTimestamp(),
          lastActive: serverTimestamp(),
          copies: 0,
          calculations: 0,
          logins: 1,
          role: 'user'
        });
      })
      .then(() => window.location.reload())
      .catch(err => alert('Błąd rejestracji: ' + err.message));
  });

  // logowanie
  document.getElementById('login-btn').addEventListener('click', () => {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    if (!username || !password) { alert('Wypełnij wszystkie pola!'); return; }
    const email = `${username}@pomocnik.local`;
    signInWithEmailAndPassword(auth, email, password)
      .then(({ user }) => {
        return update(ref(db, 'users/' + user.uid), {
          lastActive: serverTimestamp(),
          logins: increment(1)
        });
      })
      .catch(err => alert('Błąd logowania: ' + err.message));
  });

  // obsługa stanu auth + pokazanie przycisków
  onAuthStateChanged(auth, user => {
    const aSec = document.getElementById('auth-section');
    const mSec = document.getElementById('main-section');
    const logoutBtn = document.getElementById('logout-btn');
    const adminBtn  = document.getElementById('admin-panel-btn');

    if (user) {
      aSec.classList.add('hidden');
      mSec.classList.remove('hidden');

      // pokaż przycisk wylogowania
      logoutBtn.classList.remove('hidden');
      logoutBtn.onclick = () =>
        signOut(auth).then(() => window.location.reload());

      // pobierz rolę i pokaż admina tylko gdy "admin"
      get(ref(db, 'users/' + user.uid + '/role'))
        .then(snap => {
          if (snap.exists() && snap.val() === 'admin') {
            adminBtn.classList.remove('hidden');
            adminBtn.onclick = () => window.location.href = 'admin.html';
          }
        })
        .catch(() => { /* można dodać log */ });

    } else {
      aSec.classList.remove('hidden');
      mSec.classList.add('hidden');
      logoutBtn.classList.add('hidden');
      adminBtn.classList.add('hidden');
    }
  });
});
