import { getDatabase, ref, update, increment } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

const db = getDatabase();
const auth = getAuth();

function incrementCopy() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userRef = ref(db, 'users/' + user.uid);
            update(userRef, {
                copies: increment(1),
                lastActive: Date.now()
            });

            fetchUserCopies(user.uid);
        }
    });
}

function fetchUserCopies(uid) {
    const userRef = ref(db, 'users/' + uid);
    import("https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js").then(({ get }) => {
        get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                if (data.copies !== undefined) {
                    document.getElementById('copy-count').innerText = `Skopiowano: ${data.copies} razy`;
                }
            }
        });
    });
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchUserCopies(user.uid);
    }
});

window.incrementCopy = incrementCopy;
