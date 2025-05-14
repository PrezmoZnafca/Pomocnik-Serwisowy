import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

const DAILY_LIMIT = 8 * 60 + 15;
const toMinutes = hm => {
  const [h,m] = hm.split(':').map(Number);
  return h*60 + m;
};
const fmt = mins => {
  const h = Math.floor(mins/60), m = mins%60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
};

const auth = getAuth();
const db = getDatabase();

onAuthStateChanged(auth, user => {
  if (!user) return window.location.href = 'index.html';

  const dateInput   = document.getElementById('worklog-date');
  const startInput  = document.getElementById('start-time');
  const plannedInput= document.getElementById('planned-exit');
  const actualInput = document.getElementById('actual-exit');
  const rbhInput    = document.getElementById('rbh-input');
  const reportSel   = document.getElementById('report-time');
  const computeBtn  = document.getElementById('compute-exit');
  const saveBtn     = document.getElementById('save-entry');
  const tbody       = document.getElementById('worklog-body');
  const totalWork   = document.getElementById('total-work');
  const totalOt     = document.getElementById('total-ot');

  dateInput.valueAsDate = new Date();

  computeBtn.onclick = () => {
    if (!startInput.value) return alert('Podaj czas przyjścia!');
    plannedInput.value = fmt(toMinutes(startInput.value) + DAILY_LIMIT);
  };

  function loadEntries() {
    const monthKey = dateInput.value.slice(0,7);
    const monthRef = ref(db, `worklogs/${user.uid}/${monthKey}`);

    onValue(monthRef, snap => {
      const data = snap.val();
      tbody.innerHTML = '';
      let sumWork = 0, sumOt = 0;
      const count = data ? Object.keys(data).length : 0;
      console.log(`Wczytano ${count} wpisów dla ${monthKey}`);

      if (data) for (const entry of Object.values(data)) {
        const { date, start, planned, actual, rbh, reportHour } = entry;
        const worked = toMinutes(actual) - toMinutes(start);
        const workMin = Math.min(worked, DAILY_LIMIT);
        const otMin = Math.max(0, worked - DAILY_LIMIT);

        sumWork += workMin;
        sumOt += otMin;

        const rbhFormatted = parseFloat(rbh).toFixed(1) + 'h';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${date}</td>
          <td>${start}</td>
          <td>${planned}</td>
          <td>${actual}</td>
          <td>${fmt(workMin)}</td>
          <td>${fmt(otMin)}</td>
          <td>${rbhFormatted}</td>
          <td>${reportHour}:05</td>
        `;
        tbody.appendChild(tr);
      }
      totalWork.innerText = fmt(sumWork);
      totalOt.innerText = fmt(sumOt);
    });
  }

  saveBtn.onclick = () => {
    const d = dateInput.value;
    const start = startInput.value;
    const planned = plannedInput.value;
    const actual = actualInput.value;
    const rbhVal = parseFloat(rbhInput.value);
    const reportHour = reportSel.value;

    if (!d||!start||!planned||!actual||isNaN(rbhVal)) {
      return alert('Uzupełnij wszystkie pola!');
    }

    const month = d.slice(0,7);
    set(ref(db, `worklogs/${user.uid}/${month}/${d}`), { date: d, start, planned, actual, rbh: rbhVal, reportHour })
      .then(() => loadEntries())
      .catch(e => alert('Błąd zapisu: '+e.message));
  };

  dateInput.onchange = loadEntries;
  loadEntries();
});