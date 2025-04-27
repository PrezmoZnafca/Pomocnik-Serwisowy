import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getDatabase, ref, set, update, serverTimestamp, increment } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

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

    document.getElementById('show-register').addEventListener('click', () => {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
    });

    document.getElementById('show-login').addEventListener('click', () => {
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
    });

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
                    copies: 0,
                    logins: 1
                });
                location.reload();
            })
            .catch((error) => {
                alert('Błąd rejestracji: ' + error.message);
            });
    });

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
                const userRef = ref(db, 'users/' + userCredential.user.uid);
                update(userRef, {
                    lastActive: serverTimestamp(),
                    logins: increment(1)
                });
            })
            .catch((error) => {
                alert('Błąd logowania: ' + error.message);
            });
    });

    onAuthStateChanged(auth, (user) => {
        const authSection = document.getElementById('auth-section');
        const mainSection = document.getElementById('main-section');
        const logoutBtn = document.getElementById('logout-btn');
        const adminBtn = document.getElementById('admin-panel-btn');

        if (user) {
            authSection.classList.add('hidden');
            mainSection.classList.remove('hidden');

            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    signOut(auth).then(() => {
                        window.location.reload();
                    }).catch((error) => {
                        alert('Błąd wylogowania: ' + error.message);
                    });
                });
            }

            const username = user.email.split('@')[0];
            if (username === "PPZ" && adminBtn) {
                adminBtn.classList.remove('hidden');
                adminBtn.addEventListener('click', () => {
                    window.location.href = "admin.html";
                });
            }
        } else {
            authSection.classList.remove('hidden');
            mainSection.classList.add('hidden');
        }
    });
});
