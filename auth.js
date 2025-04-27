import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getDatabase, ref, set, update, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

// KONFIGURACJA Firebase
const firebaseConfig = {
    apiKey: "TU_WSTAW_TWOJ_KLUCZ",
    authDomain: "TU_WSTAW_TWOJ_AUTHDOMAIN",
    databaseURL: "TU_WSTAW_TWOJ_DATABASEURL",
    projectId: "TU_WSTAW_TWOJ_PROJECTID",
    storageBucket: "TU_WSTAW_TWOJ_STORAGEBUCKET",
    messagingSenderId: "TU_WSTAW_TWOJ_SENDERID",
    appId: "TU_WSTAW_TWOJ_APPID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Przełączanie formularzy
document.getElementById('show-register').addEventListener('click', () => {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
});

document.getElementById('show-login').addEventListener('click', () => {
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
});

// REJESTRACJA użytkownika
document.getElementById('register-btn').addEventListener('click', () => {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    if (!username || !password) {
        alert('Proszę uzupełnić wszystkie pola!');
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

// LOGOWANIE użytkownika
document.getElementById('login-btn').addEventListener('click', () => {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        alert('Proszę uzupełnić wszystkie pola!');
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

// OBSŁUGA sesji
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('main-section').classList.remove('hidden');

        const uid = user.uid;
        const email = user.email;
        const username = email.split('@')[0];

        if (username === "PPZ") {
            document.getElementById('admin-panel-btn').classList.remove('hidden');
            document.getElementById('admin-panel-btn').addEventListener('click', () => {
                window.location.href = "admin.html";
            });
        }

        // Wylogowanie admina w panelu (przycisk na admin.html)
        if (window.location.pathname.includes('admin.html')) {
            document.getElementById('back-to-main').addEventListener('click', () => {
                window.location.href = "index.html";
            });
        }

    } else {
        document.getElementById('auth-section').classList.remove('hidden');
        document.getElementById('main-section').classList.add('hidden');
    }
});
