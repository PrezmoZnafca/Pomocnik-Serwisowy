import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import {
  getDatabase, ref, set, update, serverTimestamp, increment, get
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

const auth = getAuth();
const db   = getDatabase();

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('show-register').addEventListener('click', toggleAuth);
  document.getElementById('show-login').addEventListener('click', toggleAuth);

  document.getElementById('register-btn').addEventListener('click', () => {
    const u = document.getElementById('register-username').value.trim(),
          p = document.getElementById('register-password').value;
    if (!u || !p)     { showToast('Wypełnij wszystkie pola!'); return; }
    if (p.length < 6) { showToast('Hasło min. 6 znaków!'); return; }
    createUserWithEmailAndPassword(auth, `${u}@pomocnik.local`, p)
      .then(({ user }) => set(ref(db, 'users/' + user.uid), {
        username:      u,
        createdAt:     serverTimestamp(),
        lastActive:    serverTimestamp(),
        copies:        0,
        calculations:  0,
        logins:        1,
        role:          'user'
      }))
      .then(() => window.location.reload())
      .catch(e => showToast('Błąd rejestracji: ' + e.message));
  });

  document.getElementById('login-btn').addEventListener('click', () => {
    const u = document.getElementById('login-username').value.trim(),
          p = document.getElementById('login-password').value;
    if (!u || !p) { showToast('Wypełnij wszystkie pola!'); return; }
    signInWithEmailAndPassword(auth, `${u}@pomocnik.local`, p)
      .then(({ user }) => update(ref(db, 'users/' + user.uid), {
        lastActive: serverTimestamp(),
        logins:     increment(1)
      }))
      .catch(e => showToast('Błąd logowania: ' + e.message));
  });

  onAuthStateChanged(auth, user => {
    const lo = document.getElementById('logout-btn'),
          ad = document.getElementById('admin-panel-btn'),
		  cat = document.getElementById('catalog-btn'),
          au = document.getElementById('auth-section'),
          ma = document.getElementById('main-section');
    if (user) {
      au.classList.add('hidden');
      ma.classList.remove('hidden');
      lo.classList.remove('hidden');
      lo.addEventListener('click', () => signOut(auth).then(() => window.location.reload()));
      get(ref(db, `users/${user.uid}/role`)).then(snap => {
        if (snap.val()==='admin') {
          ad.classList.remove('hidden');
          ad.addEventListener('click', ()=>window.location.href='admin.html');
        }
		
		cat.classList.remove('hidden');
    cat.addEventListener('click', () =>
      window.location.href = 'akumulatory.html'
    );
      });
    } else {
      au.classList.remove('hidden');
      ma.classList.add('hidden');
      lo.classList.add('hidden');
      ad.classList.add('hidden');
    cat.classList.add('hidden');
	}
  });
});

function toggleAuth() {
  document.getElementById('login-form').classList.toggle('hidden');
  document.getElementById('register-form').classList.toggle('hidden');
}
