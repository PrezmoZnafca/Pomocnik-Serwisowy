import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getDatabase, ref, get, remove } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

// KONFIGURACJA Firebase (wstaw swoje dane!)
const firebaseConfig = {
apiKey: "AIzaSyDbQ195yf4-lgLhLCf30SlJn6op7tDb8l0",
  authDomain: "pomocnik-serwisowy.firebaseapp.com",
  databaseURL: "https://pomocnik-serwisowy-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "pomocnik-serwisowy",
  storageBucket: "pomocnik-serwisowy.firebasestorage.app",
  messagingSenderId: "683654368007",
  appId: "1:683654368007:web:d90e76b516275a847153a2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Funkcja ładowania użytkowników
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

                const usernameTd = document.createElement('td');
                usernameTd.innerText = user.username;

                const createdAtTd = document.createElement('td');
                createdAtTd.innerText = user.createdAt ? formatTimestamp(user.createdAt) : 'Brak danych';

                const lastActiveTd = document.createElement('td');
                lastActiveTd.innerText = user.lastActive ? formatTimestamp(user.lastActive) : 'Brak aktywności';

                const copiesTd = document.createElement('td');
                copiesTd.innerText = user.copies || 0;

                const actionTd = document.createElement('td');
                const deleteBtn = document.createElement('button');
                deleteBtn.innerText = 'Usuń';
                deleteBtn.classList.add('admin-btn');
                deleteBtn.addEventListener('click', () => {
                    if (confirm('Czy na pewno chcesz usunąć tego użytkownika?')) {
                        remove(ref(db, 'users/' + uid)).then(() => {
                            showToast('Użytkownik usunięty!');
                            loadUsers();
                        }).catch((error) => {
                            showToast('Błąd usuwania: ' + error.message);
                        });
                    }
                });

                actionTd.appendChild(deleteBtn);

                tr.appendChild(usernameTd);
                tr.appendChild(createdAtTd);
                tr.appendChild(lastActiveTd);
                tr.appendChild(copiesTd);
                tr.appendChild(actionTd);

                tbody.appendChild(tr);
            });
        }
    }).catch((error) => {
        showToast('Błąd ładowania użytkowników: ' + error.message);
    });
}

// Funkcja formatująca timestamp do czytelnej daty
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

// Toast powiadomienia
function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('hidden');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// Powrót do strony głównej
document.getElementById('back-to-main').addEventListener('click', () => {
    window.location.href = "index.html";
});

// Tylko dla admina
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
