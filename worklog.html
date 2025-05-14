<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rejestracja Czasu Pracy</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="icon" href="favicon.png" type="image/png">
  <!-- Firebase init -->
  <script type="module" defer>
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
    const firebaseConfig = {
      apiKey: "AIzaSyDbQ195yf4-lgLhLCf30SlJn6op7tDb8l0",
      authDomain: "pomocnik-serwisowy.firebaseapp.com",
      databaseURL: "https://pomocnik-serwisowy-default-rtdb.europe-west1.firebasedatabase.app",
      projectId: "pomocnik-serwisowy",
      storageBucket: "pomocnik-serwisowy.appspot.com",
      messagingSenderId: "683654368007",
      appId: "1:683654368007:web:d90e76b516275a847153a2"
    };
    initializeApp(firebaseConfig);
  </script>
  <script type="module" src="worklog.js" defer></script>
</head>
<body>
  <header class="header">
    <div class="header-left"><h1>Pomocnik Serwisowy</h1></div>
    <div class="header-right">
      <!-- inne przyciski -->
      <button id="worklog-btn" class="header-btn hidden">Czas pracy</button>
      <div id="clock" class="clock"></div>
    </div>
  </header>
  <main>
    <section id="worklog-section" class="container hidden">
      <h2>Rejestracja czasu pracy (miesiąc bieżący)</h2>
      <div class="worklog-inputs">
        <label>Data: <input type="date" id="worklog-date" /></label>
        <label>Przyjście: <input type="time" id="start-time" /></label>
        <button id="compute-exit" class="action-btn">Oblicz plan. wyjście</button>
        <label>Plan. wyjście: <input type="time" id="planned-exit" readonly /></label>
        <label>Wyjście faktyczne: <input type="time" id="actual-exit" /></label>
        <label>Raport o (RBH): 
          <select id="report-time">
            <option>08:05</option><option>10:05</option><option>12:05</option>
            <option>14:05</option><option>16:05</option><option>18:05</option>
          </select>
        </label>
        <button id="save-entry" class="action-btn">Zapisz wpis</button>
      </div>
      <table class="worklog-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Przyjście</th>
            <th>Plan. wyjście</th>
            <th>Wyj. faktyczne</th>
            <th>Godziny pracy</th>
            <th>Nadgodziny</th>
            <th>RBH</th>
          </tr>
        </thead>
        <tbody id="worklog-body"></tbody>
        <tfoot>
          <tr>
            <th colspan="4">Razem:</th>
            <th id="total-work">00:00</th>
            <th id="total-ot">00:00</th>
            <th></th> <!-- RBH bez sumowania -->
          </tr>
        </tfoot>
      </table>
    </section>
  </main>
</body>
</html>