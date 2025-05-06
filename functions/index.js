// functions/index.js
const functions = require('firebase-functions');
const axios     = require('axios').default;
const { CookieJar }                     = require('tough-cookie');
const { wrapper }                       = require('axios-cookiejar-support');
const cheerio   = require('cheerio');

exports.fetchRcpTime = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    const { login, password } = data;
    if (!login || !password) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Brakuje loginu lub hasła.'
      );
    }

    try {
      // 1) Przygotuj klienta z cookie jar
      const jar    = new CookieJar();
      const client = wrapper(axios.create({ jar, withCredentials: true }));

      // 2) Pobierz CSRF token z /login/
      const loginPage = await client.get('https://panel.rcponline.pl/login/');
      const $login = cheerio.load(loginPage.data);
      const csrf   = $login('input[name="csrfmiddlewaretoken"]').val() || '';

      // 3) Zaloguj się
      await client.post(
        'https://panel.rcponline.pl/login/',
        new URLSearchParams({
          username: login,
          password,
          csrfmiddlewaretoken: csrf
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Referer: 'https://panel.rcponline.pl/login/'
          }
        }
      );

      // 4) Wejdź na /app/ i załaduj HTML
      const appPage = await client.get('https://panel.rcponline.pl/app/');
      const $app    = cheerio.load(appPage.data);

      // 5) Parsuj nagłówek ostatniej aktywności:
      //    selektor bierze pierwszy <h3 class="mb-2"> zawierający "Dzisiaj"
      const header = $app('h3.mb-2:contains("Dzisiaj")').first().text().trim();

      if (!header) {
        throw new Error('Nie udało się znaleźć "Dzisiaj XX:XX" w panelu.');
      }

      // header === "Dzisiaj 15:09" → wyciągamy samą godzinę:
      const timeMatch = header.match(/(\d{2}:\d{2})/);
      if (!timeMatch) {
        throw new Error('Format czasu nie jest zgodny z HH:mm.');
      }

      return { time: timeMatch[1] };  // np. { time: "15:09" }
    } catch (err) {
      console.error('fetchRcpTime error:', err);
      throw new functions.https.HttpsError(
        'internal',
        'Błąd podczas pobierania czasu: ' + err.message
      );
    }
  });
