import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getDatabase, ref, set, update, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

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
    // Przełączanie widoku
    document.getElementById('show-register').addEventListener('click', () => {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
    });

    document.getElementById('show-login').addEventListener('click', () => {
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
    });

    // Rejestracja użytkownika
    document.getElementById('register-btn').addEventListener('click', () => {
        const username = document.getElementById('register-username').value.trim();
        const password = document.getElementById('register-password').value;

        if (!username || !password) {
            alert('Proszę wypełnić wszystkie pola!');
            return;
        }
        if (password.length < 6) {
            alert('Hasło musi mieć minimum 6 znaków!');
            return;
        }

        const fakeEmail = `${username}@pomocnik.local`;

        createUserWithEmailAndPassword(auth, fakeEmail, password)
            .then((userCredential) => {
                const user = userCredential.user;
                set(ref(db, 'users/' + user.uid), {
                    username: username,
                    createdAt: serverTimestamp(),
                    lastActive: serverTimestamp(),
                    role: 'user',
                    copies: 0
                });
                location.reload();
            })
            .catch((error) => {
                alert('Błąd rejestracji: ' + error.message);
            });
    });

    // Logowanie użytkownika
    document.getElementById('login-btn').addEventListener('click', () => {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

        if (!username || !password) {
            alert('Proszę wypełnić wszystkie pola!');
            return;
        }

        const fakeEmail = `${username}@pomocnik.local`;

        signInWithEmailAndPassword(auth, fakeEmail, password)
            .then((userCredential) => {
                update(ref(db, 'users/' + userCredential.user.uid), {
                    lastActive: serverTimestamp()
                });
            })
            .catch((error) => {
                alert('Błąd logowania: ' + error.message);
            });
    });

    // Zarządzanie sesją użytkownika
    onAuthStateChanged(auth, (user) => {
        if (user) {
            document.getElementById('auth-section').classList.add('hidden');
            document.getElementById('main-section').classList.remove('hidden');

            const email = user.email;
            const username = email.split('@')[0];

            const adminBtn = document.getElementById('admin-panel-btn');
            if (username === "PPZ" && adminBtn) {
                adminBtn.classList.remove('hidden');
                adminBtn.addEventListener('click', () => {
                    window.location.href = "admin.html";
                });
            }

            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    signOut(auth).then(() => {
                        showToast('Wylogowano pomyślnie!');
                        setTimeout(() => {
                            window.location.href = "index.html";
                        }, 1500);
                    }).catch((error) => {
                        alert('Błąd wylogowania: ' + error.message);
                    });
                });
            }

        } else {
            document.getElementById('auth-section').classList.remove('hidden');
            document.getElementById('main-section').classList.add('hidden');
        }
    });
});

// Toast
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
