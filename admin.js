// admin.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  remove
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
  onAuthStateChanged(auth, user => {
    if (!user) {
      alert('Brak dostępu!');
      return window.location.href = 'index.html';
    }
    get(ref(db, `users/${user.uid}/role`))
      .then(snap => {
        if (snap.val() === 'admin') {
          loadUsers();
          loadBookmarks();
        } else {
          alert('Brak dostępu!');
          window.location.href = 'index.html';
        }
      });
  });

  document.getElementById('logout-btn').onclick = () =>
    signOut(auth).then(() => window.location.href = 'index.html');

  document.getElementById('back-to-main').onclick = () =>
    window.location.href = 'index.html';
});

function loadUsers() {
  get(ref(db, 'users')).then(snap => {
    const tbody = document.getElementById('user-table-body');
    tbody.innerHTML = '';
    if (!snap.exists()) return;
    Object.entries(snap.val()).forEach(([uid, u]) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${u.username || '—'}</td>
        <td>${u.role     || 'user'}</td>
        <td>${u.createdAt?
            new Date(u.createdAt).toLocaleString('pl-PL') : '—'}</td>
        <td>${u.lastActive?
            new Date(u.lastActive).toLocaleString('pl-PL') : '—'}</td>
        <td>${u.copies      ?? 0}</td>
        <td>${u.calculations?? 0}</td>
        <td>${u.logins      ?? 0}</td>
        <td><button class="admin-btn" onclick="deleteUser('${uid}')">Usuń</button></td>
      `;
      tbody.appendChild(tr);
    });
  });
}

window.deleteUser = uid => {
  if (!confirm('Na pewno usunąć?')) return;
  remove(ref(db, 'users/' + uid)).then(loadUsers)
    .catch(e => alert('Błąd usuwania: ' + e.message));
};

function loadBookmarks() {
  get(ref(db, 'bookmarks')).then(snap => {
    const tbody = document.getElementById('bookmark-table-body');
    tbody.innerHTML = '';
    if (!snap.exists()) return;
    Object.entries(snap.val()).forEach(([key, b]) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${b.label}</td>
        <td><pre style="white-space: pre-wrap;">${b.data}</pre></td>
        <td><button class="admin-btn" onclick="deleteBookmark('${key}')">Usuń</button></td>
      `;
      tbody.appendChild(tr);
    });
  });
}

window.deleteBookmark = key => {
  if (!confirm('Na pewno usunąć tę zakładkę?')) return;
  remove(ref(db, 'bookmarks/' + key)).then(loadBookmarks)
    .catch(e => alert('Błąd usuwania: ' + e.message));
};
