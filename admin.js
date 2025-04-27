import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getDatabase, ref, get, remove } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDbQ195yf4-lgLhLCf30SlJn6op7tDb8l0",
    authDomain: "pomocnik-serwisowy.firebaseapp.com",
    databaseURL: "https://pomocnik-serwisowy-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "pomocnik-serwisowy",
    storageBucket: "pomocnik-serwisowy.appspot.com",
    messagingSenderId: "683654368007",
    appId: "1:683654368007:web:d90e76b516275a847153a2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const username = user.email.split('@')[0];
            if (username !== "PPZ") {
                alert('Brak dostępu!');
                window.location.href = "index.html";
            } else {
                loadUsers();
            }
        } else {
            window.location.href = "index.html";
        }
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.href = "index.html";
        });
    });

    document.getElementById('back-to-main').addEventListener('click', () => {
        window.location.href = "index.html";
    });
});

function loadUsers() {
    const usersRef = ref(db, 'users');
    get(usersRef).then((snapshot) => {
        if (snapshot.exists()) {
            const users = snapshot.val();
            const tbody = document.getElementById('user-table-body');
            tbody.innerHTML = '';

            Object.keys(users).forEach(uid => {
                const user = users[uid];
                const tr = document.createElement('tr');

                tr.innerHTML = `
                    <td>${user.username || 'Brak'}</td>
                    <td>${user.createdAt ? formatTimestamp(user.createdAt) : 'Brak'}</td>
                    <td>${user.lastActive ? formatTimestamp(user.lastActive) : 'Brak'}</td>
                    <td>${user.copies ?? 0}</td>
                    <td>${user.logins ?? 0}</td>
                    <td><button class="admin-btn" onclick="deleteUser('${uid}')">Usuń</button></td>
                `;

                tbody.appendChild(tr);
            });
        }
    }).catch((error) => {
        console.error('Błąd ładowania użytkowników:', error);
    });
}

window.deleteUser = (uid) => {
    if (confirm('Na pewno chcesz usunąć tego użytkownika?')) {
        remove(ref(db, 'users/' + uid)).then(() => {
            alert('Użytkownik usunięty');
            loadUsers();
        }).catch((error) => {
            console.error('Błąd usuwania:', error);
        });
    }
};

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('pl-PL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}
