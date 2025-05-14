import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

const DAILY_LIMIT = 8 * 60 + 15; // 8h15m
const toMinutes = hm => {
  const [h, m] = hm.split(':').map(Number);
  return h * 60 + m;
};
const fmt = mins => {
  const h = Math.floor(mins / 60), m = mins % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
};

const auth = getAuth();
const db   = getDatabase();

onAuthStateChanged(auth, user => {
  if (!user) return window.location.href = 'index.html';

  // Pokaż panel
  document.getElementById('worklog-section').classList.remove('hidden');
  document.getElementById('worklog-date').valueAsDate = new Date();

  // Header button
  const btn = document.getElementById('worklog-btn');
  btn.classList.remove('hidden');
  btn.addEventListener('click', () => window.location.href = 'worklog.html');

  // Formularz
  const dateInput    = document.getElementById('worklog-date');
  const startInput   = document.getElementById('start-time');
  const plannedInput = document.getElementById('planned-exit');
  const actualInput  = document.getElementById('actual-exit');
  const rbhInput     = document.getElementById('rbh-input');
  const computeBtn   = document.getElementById('compute-exit');
  const saveBtn      = document.getElementById('save-entry');
  const tbody        = document.getElementById('worklog-body');
  const totalWork    = document.getElementById('total-work');
  const totalOt      = document.getElementById('total-ot');

  // Dynamiczne przeładowanie przy zmianie miesiąca
  dateInput.addEventListener('change', () => loadEntries(dateInput.value.slice(0,7)));

  computeBtn.addEventListener('click', () => {
    if (!startInput.value) return alert('Podaj czas przyjścia!');
    plannedInput.value = fmt(toMinutes(startInput.value) + DAILY_LIMIT);
  });

  saveBtn.addEventListener('click', () => {
    const d      = dateInput.value;
    const start  = startInput.value;
    const planned= plannedInput.value;
    const actual = actualInput.value;
    const rbhVal = rbhInput.value;
    if (!d||!start||!planned||!actual||!rbhVal) return alert('Uzupełnij wszystkie pola!');

    set(ref(db, `worklogs/${user.uid}/${d}`), { date: d, start, planned, actual, rbh: rbhVal })
      .then(() => loadEntries(d.slice(0,7)))
      .catch(e => alert('Błąd: '+e.message));
  });

  function loadEntries(monthKey) {
    const refMonth = ref(db, `worklogs/${user.uid}/${monthKey}`);
    onValue(refMonth, snap => {
      tbody.innerHTML = '';
      let sumWork = 0, sumOt = 0;
      snap.forEach(ch => {
        const { date, start, planned, actual, rbh } = ch.val();
        const worked = toMinutes(actual) - toMinutes(start);
        const work   = Math.min(worked, DAILY_LIMIT);
        const ot     = Math.max(0, worked - DAILY_LIMIT);
        const rbhMin = toMinutes(rbh);

        sumWork += work;
        sumOt   += ot;

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${date}</td>
          <td>${start}</td>
          <td>${planned}</td>
          <td>${actual}</td>
          <td>${fmt(work)}</td>
          <td>${fmt(ot)}</td>
          <td>${fmt(rbhMin)}</td>
        `;
        tbody.appendChild(tr);
      });
      totalWork.innerText = fmt(sumWork);
      totalOt.innerText   = fmt(sumOt);
    });
  }
});