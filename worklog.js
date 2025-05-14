import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

const auth = getAuth();
const db   = getDatabase();
const DAILY_LIMIT = 8*60 + 15; // 8h15m w minutach

const toMinutes = hm => {
  const [h, m] = hm.split(':').map(Number);
  return h*60 + m;
};
const fmt = mins => {
  const h = Math.floor(mins/60);
  const m = mins % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
};

onAuthStateChanged(auth, user => {
  const btn     = document.getElementById('worklog-btn');
  const section = document.getElementById('worklog-section');

  if (!user) {
    btn.classList.add('hidden');
    section.classList.add('hidden');
    return;
  }

  btn.classList.remove('hidden');
  btn.addEventListener('click', () => window.location.href = 'worklog.html');

  if (!section) return;
  section.classList.remove('hidden');

  const dateInput    = document.getElementById('worklog-date');
  const startInput   = document.getElementById('start-time');
  const plannedInput = document.getElementById('planned-exit');
  const actualInput  = document.getElementById('actual-exit');
  const reportSelect = document.getElementById('report-time');
  const computeBtn   = document.getElementById('compute-exit');
  const saveBtn      = document.getElementById('save-entry');
  const tbody        = document.getElementById('worklog-body');
  const totalWork    = document.getElementById('total-work');
  const totalOt      = document.getElementById('total-ot');

  // domyślnie dzisiaj
  dateInput.valueAsDate = new Date();

  computeBtn.addEventListener('click', () => {
    if (!startInput.value) return alert('Podaj godzinę przyjścia!');
    const planMin = toMinutes(startInput.value) + DAILY_LIMIT;
    plannedInput.value = fmt(planMin);
  });

  // odczyt danych miesiąca
  const monthKey = dateInput.value.slice(0,7); // YYYY-MM
  const monthRef = ref(db, `worklogs/${user.uid}/${monthKey}`);

  onValue(monthRef, snap => {
    tbody.innerHTML = '';
    let sumWork = 0;
    let sumOt   = 0;

    snap.forEach(ch => {
      const { date, start, planned, actual, report } = ch.val();
      const workedMin = toMinutes(actual) - toMinutes(start);
      const workMin   = Math.min(workedMin, DAILY_LIMIT);
      const otMin     = Math.max(0, workedMin - DAILY_LIMIT);
      const rbhMin    = Math.max(0, toMinutes(report) - toMinutes(start));

      sumWork += workMin;
      sumOt   += otMin;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${date}</td>
        <td>${start}</td>
        <td>${planned}</td>
        <td>${actual}</td>
        <td>${fmt(workMin)}</td>
        <td>${fmt(otMin)}</td>
        <td>${fmt(rbhMin)}</td>
      `;
      tbody.appendChild(tr);
    });

    totalWork.innerText = fmt(sumWork);
    totalOt.innerText   = fmt(sumOt);
  });

  saveBtn.addEventListener('click', () => {
    const date    = dateInput.value;
    const start   = startInput.value;
    const planned = plannedInput.value;
    const actual  = actualInput.value;
    const report  = reportSelect.value;
    if (!date||!start||!planned||!actual) return alert('Uzupełnij wszystkie pola!');

    set(ref(db, `worklogs/${user.uid}/${date}`), {
      date, start, planned, actual, report
    });
  });
});

// koniec pliku worklog.js