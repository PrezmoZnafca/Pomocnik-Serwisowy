import { getAuth, onAuthStateChanged, signOut }
  from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import {
  getDatabase, ref, get, update, push, remove
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

const auth = getAuth(), db = getDatabase();

document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged(auth, user => {
    if (!user) return redirectToLogin();
    get(ref(db, `users/${user.uid}/role`)).then(snap => {
      if (snap.val() !== 'admin') return redirectToLogin();
      loadUsers();
      loadProposals();
      loadGlobalBookmarks();
      loadPersonalBookmarks();
      loadMessages();
    });
  });

  document.getElementById('logout-btn').onclick    = () => signOut(auth).then(redirectToLogin);
  document.getElementById('back-to-main').onclick = () => window.location.href = 'index.html';
});

function redirectToLogin() {
  window.location.href = 'index.html';
}

// — Użytkownicy z możliwością zmiany roli —
function loadUsers() {
  get(ref(db, 'users')).then(snap => {
    const tbody = document.getElementById('user-table-body');
    tbody.innerHTML = '';
    if (!snap.exists()) return;
    Object.entries(snap.val()).forEach(([uid,u]) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${u.username||'—'}</td>
        <td>
          <select data-uid="${uid}" class="role-select">
            <option value="user"${u.role==='user'?' selected':''}>user</option>
            <option value="admin"${u.role==='admin'?' selected':''}>admin</option>
          </select>
        </td>
        <td>${u.createdAt?new Date(u.createdAt).toLocaleString('pl-PL'):'—'}</td>
        <td>${u.lastActive?new Date(u.lastActive).toLocaleString('pl-PL'):'—'}</td>
        <td>${u.copies||0}</td>
        <td>${u.calculations||0}</td>
        <td>${u.logins||0}</td>
        <td><button data-delete-user="${uid}" class="admin-btn">Usuń</button></td>
      `;
      tbody.appendChild(tr);
    });
    tbody.querySelectorAll('.role-select').forEach(sel => {
      sel.onchange = () => changeRole(sel.dataset.uid, sel.value);
    });
    tbody.querySelectorAll('[data-delete-user]').forEach(btn => {
      btn.onclick = () => deleteUser(btn.dataset.deleteUser);
    });
  });
}

function changeRole(uid, role) {
  update(ref(db, `users/${uid}`), { role })
    .then(loadUsers)
    .catch(e => alert('Błąd zmiany roli: ' + e.message));
}

function deleteUser(uid) {
  if (!confirm('Usuń użytkownika?')) return;
  remove(ref(db, `users/${uid}`))
    .then(loadUsers)
    .catch(e => alert('Błąd usuwania: ' + e.message));
}

// — Propozycje globalnych zakładek —
function loadProposals() {
  get(ref(db, 'proposedBookmarks')).then(snap => {
    const tbody = document.getElementById('proposal-table-body');
    tbody.innerHTML = '';
    if (!snap.exists()) return;
    Object.entries(snap.val()).forEach(([key,b]) => {
      get(ref(db, `users/${b.uid}/username`)).then(uSnap => {
        const uname = uSnap.val()||b.uid;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${uname}</td>
          <td>${b.label}</td>
          <td><pre>${b.data}</pre></td>
          <td>
            <button data-accept="${key}" class="admin-btn">Akceptuj</button>
            <button data-reject="${key}" class="admin-btn">Odrzuć</button>
          </td>
        `;
        tbody.appendChild(tr);
        tr.querySelector('[data-accept]').onclick = () => acceptProposal(key);
        tr.querySelector('[data-reject]').onclick = () => rejectProposal(key);
      });
    });
  });
}

function acceptProposal(key) {
  get(ref(db, `proposedBookmarks/${key}`)).then(snap => {
    const b = snap.val();
    push(ref(db, 'bookmarks'), { label:b.label, data:b.data })
      .then(()=>remove(ref(db, `proposedBookmarks/${key}`)))
      .then(()=>{loadProposals(); loadGlobalBookmarks();});
  });
}

function rejectProposal(key) {
  remove(ref(db, `proposedBookmarks/${key}`)).then(loadProposals);
}

// — Globalne zakładki —
function loadGlobalBookmarks() {
  get(ref(db, 'bookmarks')).then(snap => {
    const tbody = document.getElementById('bookmark-table-body');
    tbody.innerHTML = '';
    if (!snap.exists()) return;
    Object.entries(snap.val()).forEach(([key,b]) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${b.label}</td>
        <td><pre>${b.data}</pre></td>
        <td><button data-delete-bm="${key}" class="admin-btn">Usuń</button></td>
      `;
      tbody.appendChild(tr);
      tr.querySelector('[data-delete-bm]').onclick = () => deleteGlobalBookmark(key);
    });
  });
}

function deleteGlobalBookmark(key) {
  if (!confirm('Usuń globalną zakładkę?')) return;
  remove(ref(db, `bookmarks/${key}`)).then(loadGlobalBookmarks);
}

// — Prywatne zakładki użytkowników —  
function loadPersonalBookmarks() {
  get(ref(db,'users')).then(snap=>{
    const tbody=document.getElementById('personal-bookmark-table-body');
    tbody.innerHTML='';
    if(!snap.exists())return;
    Object.entries(snap.val()).forEach(([uid,u])=>{
      if(!u.bookmarks)return;
      const header=document.createElement('tr');
      header.className='group-header';
      header.innerHTML=`<td colspan="3">${u.username}</td>`;
      tbody.appendChild(header);
      Object.entries(u.bookmarks).forEach(([k,b])=>{
        const tr=document.createElement('tr');
        tr.innerHTML=`
          <td>${b.label}</td>
          <td><pre>${b.data}</pre></td>
          <td><button data-delete-pbm="${uid}|${k}" class="admin-btn">Usuń</button></td>
        `;
        tbody.appendChild(tr);
      });
    });
    tbody.querySelectorAll('[data-delete-pbm]').forEach(btn=>{
      const [uid,k]=btn.dataset.deletePbm.split('|');
      btn.onclick=()=>deletePersonalBookmark(uid,k);
    });
  });
}

function deletePersonalBookmark(uid,k) {
  if(!confirm('Usuń prywatną zakładkę?'))return;
  remove(ref(db, `users/${uid}/bookmarks/${k}`)).then(loadPersonalBookmarks);
}

// — Wiadomości od użytkowników —  
function loadMessages() {
  get(ref(db,'messages')).then(snap=>{
    const tbody=document.getElementById('messages-table-body');
    tbody.innerHTML='';
    if(!snap.exists())return;
    Object.entries(snap.val()).forEach(([key,m])=>{
      get(ref(db, `users/${m.uid}/username`)).then(uSnap=>{
        const uname=uSnap.val()||m.uid;
        const tr=document.createElement('tr');
        tr.innerHTML=`
          <td>${uname}</td>
          <td>${m.text}</td>
          <td>${new Date(m.ts).toLocaleString('pl-PL')}</td>
          <td><button data-del-msg="${key}" class="admin-btn">Usuń</button></td>
        `;
        tbody.appendChild(tr);
        tr.querySelector('[data-del-msg]').onclick=()=>{
          remove(ref(db, `messages/${key}`)).then(loadMessages);
        };
      });
    });
  });
}
