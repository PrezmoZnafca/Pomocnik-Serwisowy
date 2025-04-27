import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getDatabase, ref, increment, get, update } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

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
const db = getDatabase(app);
const counterRef = ref(db, 'visitCounter/');

// Aktualizuj licznik
update(counterRef, { visits: increment(1) });

// Pobierz aktualną wartość
get(counterRef).then((snapshot) => {
    if (snapshot.exists()) {
        document.getElementById('visitCounter').innerText = "Liczba wejść: " + snapshot.val().visits;
    } else {
        document.getElementById('visitCounter').innerText = "Liczba wejść: 0";
    }
}).catch((error) => {
    console.error(error);
});
