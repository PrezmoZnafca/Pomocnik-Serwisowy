import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

const DAILY_LIMIT = 8 * 60 + 15; // 8h15m w minutach
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
    window.location.href = 'index.html';
    return;
  }

  // Pokaż sekcję i ustaw dzisiejszą datę
  const section = document.getElementById('worklog-section');
  section.classList.remove('hidden');
  const dateInput = document.getElementById('worklog-date');
  dateInput.valueAsDate = new Date();

  // Obsługa header button
  const btn = document.getElementById('worklog-btn');
  btn.addEventListener('click', () => window.location.href = 'worklog.html');

  // Elementy formularza
  const startInput   = document.getElementById('start-time');
  const plannedInput = document.getElementById('planned-exit');
  const actualInput  = document.getElementById('actual-exit');
  const rbhInput     = document.getElementById('rbh-input');
  const reportSelect = document.getElementById('report-time');
  const computeBtn   = document.getElementById('compute-exit');
  const saveBtn      = document.getElementById('save-entry');
  const tbody        = document.getElementById('worklog-body');
  const totalWork    = document.getElementById('total-work');
  const totalOt      = document.getElementById('total-ot');

  // Funkcja wczytująca wpisy
  function loadEntries() {
    const monthKey = dateInput.value.slice(0,7); // YYYY-MM
    const monthRef = ref(db, `worklogs/${user.uid}/${monthKey}`);
    onValue(monthRef, snap => {
      tbody.innerHTML = '';
      let sumWork = 0, sumOt = 0;
      snap.forEach(ch => {
        const { date, start, planned, actual, rbh, reportHour } = ch.val();
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
      totalWork.innerText = fmt(sumWork);
      totalOt.innerText   = fmt(sumOt);
    });
  }

  // Oblicz planowane wyjście
  computeBtn.addEventListener('click', () => {
    if (!startInput.value) return alert('Podaj czas przyjścia!');
    plannedInput.value = fmt(toMinutes(startInput.value) + DAILY_LIMIT);
  });

  // Zapis wpisu
  saveBtn.addEventListener('click', () => {
    const dateVal     = dateInput.value;
    const startVal    = startInput.value;
    const plannedVal  = plannedInput.value;
    const actualVal   = actualInput.value;
    const rbhVal      = rbhInput.value;
    const reportHour  = reportSelect.value;
    if (!dateVal || !startVal || !plannedVal || !actualVal || !rbhVal) {
      return alert('Uzupełnij wszystkie pola!');
    }
    // Zapis do bazy: rbh jako liczba (np. 1.5 godziny)
    set(ref(db, `worklogs/${user.uid}/${dateVal}`), {
      date: dateVal,
      start: startVal,
      planned: plannedVal,
      actual: actualVal,
      rbh: parseFloat(rbhVal),
      reportHour: reportHour
    }).then(loadEntries).
      catch(err => alert('Błąd zapisu: ' + err.message));
  });

  // Po zmianie daty przeładuj
  dateInput.addEventListener('change', loadEntries);
  // Pierwsze wczytanie
  loadEntries();
});