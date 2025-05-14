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
  if (!user) {
    console.warn('Nie zalogowano – przekierowanie');
    window.location.href = 'index.html';
    return;
  }

  // Elementy DOM
  const section     = document.getElementById('worklog-section');
  const dateInput   = document.getElementById('worklog-date');
  const startInput  = document.getElementById('start-time');
  const plannedInput= document.getElementById('planned-exit');
  const actualInput = document.getElementById('actual-exit');
  const rbhInput    = document.getElementById('rbh-input');
  const reportSelect= document.getElementById('report-time');
  const computeBtn  = document.getElementById('compute-exit');
  const saveBtn     = document.getElementById('save-entry');
  const tbody       = document.getElementById('worklog-body');
  const totalWork   = document.getElementById('total-work');
  const totalOt     = document.getElementById('total-ot');

  // Pokaż panel i ustaw datę
  section.classList.remove('hidden');
  dateInput.valueAsDate = new Date();

  // Oblicz planowane wyjście
  computeBtn.addEventListener('click', () => {
    if (!startInput.value) return alert('Podaj czas przyjścia!');
    plannedInput.value = fmt(toMinutes(startInput.value) + DAILY_LIMIT);
  });

  // Funkcja wczytująca wpisy dla wybranego miesiąca
  function loadEntries() {
    const monthKey = dateInput.value.slice(0,7);       // "YYYY-MM"
    console.log('Ładowanie wpisów dla:', monthKey);
    const monthRef = ref(db, `worklogs/${user.uid}/${monthKey}`);
    onValue(monthRef, snap => {
      const data = snap.val();
      console.log('Dane z bazy:', data);
      tbody.innerHTML = '';
      let sumWork = 0, sumOt = 0;

      if (data) {
        Object.entries(data).forEach(([dayKey, entry]) => {
          const { date, start, planned, actual, rbh, reportHour } = entry;
          const workedMin = toMinutes(actual) - toMinutes(start);
          const workMin   = Math.min(workedMin, DAILY_LIMIT);
          const otMin     = Math.max(0, workedMin - DAILY_LIMIT);

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
            <td>${rbh}</td>
            <td>${reportHour}:05</td>
          `;
          tbody.appendChild(tr);
        });
      }
      totalWork.innerText = fmt(sumWork);
      totalOt.innerText   = fmt(sumOt);
    });
  }

  // Zapis wpisu w strukturze worklogs/uid/YYYY-MM/YYYY-MM-DD
  saveBtn.addEventListener('click', () => {
    const dateVal    = dateInput.value;                  // YYYY-MM-DD
    const monthKey   = dateVal.slice(0,7);               // YYYY-MM
    const startVal   = startInput.value;
    const plannedVal = plannedInput.value;
    const actualVal  = actualInput.value;
    const rbhVal     = parseFloat(rbhInput.value);
    const reportHour = reportSelect.value;

    if (!dateVal || !startVal || !plannedVal || !actualVal || isNaN(rbhVal)) {
      return alert('Uzupełnij wszystkie pola!');
    }

    const entryRef = ref(db, `worklogs/${user.uid}/${monthKey}/${dateVal}`);
    set(entryRef, {
      date: dateVal,
      start: startVal,
      planned: plannedVal,
      actual: actualVal,
      rbh: rbhVal,
      reportHour: reportHour
    })
    .then(() => {
      console.log('Zapisano wpis:', dateVal);
      loadEntries();
    })
    .catch(err => {
      console.error('Błąd zapisu:', err);
      alert('Błąd zapisu: ' + err.message);
    });
  });

  // Odśwież przy zmianie daty i pierwszy render
  dateInput.addEventListener('change', loadEntries);
  loadEntries();
}
);