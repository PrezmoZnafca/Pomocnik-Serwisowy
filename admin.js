import { getAuth, onAuthStateChanged, signOut }
  from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getDatabase, ref, get, remove }
  from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

const auth = getAuth();
const db   = getDatabase();

document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged(auth, user => {
    if (!user) return redirectToLogin();
    get(ref(db, `users/${user.uid}/role`)).then(snap => {
      if (snap.val() !== 'admin') return redirectToLogin();
      loadUsers();
      loadGlobalBookmarks();
      loadPersonalBookmarks();
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
    Object.entries(snap.val()).forEach(([uid,u]) => {
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
    tbody.querySelectorAll('[data-delete-user]').forEach(btn =>
      btn.addEventListener('click', () => deleteUser(btn.dataset.deleteUser))
    );
  });
}

function loadGlobalBookmarks() {
  get(ref(db, 'bookmarks')).then(snap => {
    const tbody = document.getElementById('bookmark-table-body');
    tbody.innerHTML = '';
    if (!snap.exists()) return;
    Object.entries(snap.val()).forEach(([key,b]) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHTML(b.label)}</td>
        <td><pre>${escapeHTML(b.data)}</pre></td>
        <td><button class="admin-btn" data-delete-bm="${key}">Usuń</button></td>
      `;
      tbody.appendChild(tr);
    });
    tbody.querySelectorAll('[data-delete-bm]').forEach(btn =>
      btn.addEventListener('click', () => deleteGlobalBookmark(btn.dataset.deleteBm))
    );
  });
}

function loadPersonalBookmarks() {
  get(ref(db, 'users')).then(snap => {
    const tbody = document.getElementById('personal-bookmark-table-body');
    tbody.innerHTML = '';
    if (!snap.exists()) return;
    // Dla każdego użytkownika z bookmarks
    Object.entries(snap.val()).forEach(([uid,u]) => {
      if (!u.bookmarks) return;
      // wiersz grupy z nazwą użytkownika
      const headerTr = document.createElement('tr');
      headerTr.className = 'group-header';
      headerTr.innerHTML = `<td colspan="3">${escapeHTML(u.username)}</td>`;
      tbody.appendChild(headerTr);
      // wiersze z jego zakładkami
      Object.entries(u.bookmarks).forEach(([key,b]) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${escapeHTML(b.label)}</td>
          <td><pre>${escapeHTML(b.data)}</pre></td>
          <td><button class="admin-btn" data-delete-pbm="${uid}|${key}">Usuń</button></td>
        `;
        tbody.appendChild(tr);
      });
    });
    tbody.querySelectorAll('[data-delete-pbm]').forEach(btn => {
      const [uid,key] = btn.dataset.deletePbm.split('|');
      btn.addEventListener('click', () => deletePersonalBookmark(uid,key));
    });
  });
}

function deleteUser(uid) {
  if (!confirm('Na pewno usunąć użytkownika?')) return;
  remove(ref(db, 'users/' + uid))
    .then(loadUsers)
    .catch(e => alert('Błąd: ' + e.message));
}

function deleteGlobalBookmark(key) {
  if (!confirm('Na pewno usunąć zakładkę globalną?')) return;
  remove(ref(db, 'bookmarks/' + key))
    .then(loadGlobalBookmarks)
    .catch(e => alert('Błąd: ' + e.message));
}

function deletePersonalBookmark(uid,key) {
  if (!confirm('Na pewno usunąć tę prywatną zakładkę?')) return;
  remove(ref(db, `users/${uid}/bookmarks/${key}`))
    .then(loadPersonalBookmarks)
    .catch(e => alert('Błąd: ' + e.message));
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]
  );
}
