import { getAuth, onAuthStateChanged, signOut } from
  "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getDatabase, ref, get, remove } from
  "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

const auth = getAuth();
const db   = getDatabase();

document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged(auth, user => {
    if (!user) return redirectToLogin();
    get(ref(db, `users/${user.uid}/role`)).then(snap => {
      if (snap.val() !== 'admin') return redirectToLogin();
      loadUsers();
      loadBookmarks();
    });
  });

  document.getElementById('logout-btn')
    .addEventListener('click', () => signOut(auth).then(redirectToLogin));
  document.getElementById('back-to-main')
    .addEventListener('click', () => window.location.href = 'index.html');
});

function redirectToLogin() {
  window.location.href = 'index.html';
}

function loadUsers() {
  get(ref(db, 'users')).then(snap => {
    const tbody = document.getElementById('user-table-body');
    tbody.innerHTML = '';
    if (!snap.exists()) return;
    Object.entries(snap.val()).forEach(([uid, u]) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHTML(u.username)}</td>
        <td>${escapeHTML(u.role)}</td>
        <td>${u.createdAt ? new Date(u.createdAt).toLocaleString('pl-PL') : '—'}</td>
        <td>${u.lastActive ? new Date(u.lastActive).toLocaleString('pl-PL') : '—'}</td>
        <td>${u.copies ?? 0}</td>
        <td>${u.calculations ?? 0}</td>
        <td>${u.logins ?? 0}</td>
        <td><button class="admin-btn" data-delete-user="${uid}">Usuń</button></td>
      `;
      tbody.appendChild(tr);
    });
    tbody.querySelectorAll('[data-delete-user]').forEach(btn => {
      btn.addEventListener('click', () => deleteUser(btn.dataset.deleteUser));
    });
  });
}

function loadBookmarks() {
  get(ref(db, 'bookmarks')).then(snap => {
    const tbody = document.getElementById('bookmark-table-body');
    tbody.innerHTML = '';
    if (!snap.exists()) return;
    Object.entries(snap.val()).forEach(([key, b]) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${escapeHTML(b.label)}</td>`;
      const tdData = document.createElement('td');
      tdData.textContent = b.data;
      tr.appendChild(tdData);
      const tdAct = document.createElement('td');
      const btn = document.createElement('button');
      btn.className = 'admin-btn';
      btn.textContent = 'Usuń';
      btn.addEventListener('click', () => deleteBookmark(key));
      tdAct.appendChild(btn);
      tr.appendChild(tdAct);
      tbody.appendChild(tr);
    });
  });
}

function deleteUser(uid) {
  if (!confirm('Na pewno usunąć?')) return;
  remove(ref(db, 'users/' + uid))
    .then(loadUsers)
    .catch(e => alert('Błąd: ' + e.message));
}

function deleteBookmark(key) {
  if (!confirm('Na pewno usunąć tę zakładkę?')) return;
  remove(ref(db, 'bookmarks/' + key))
    .then(loadBookmarks)
    .catch(e => alert('Błąd: ' + e.message));
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]
  );
}
