// functions/index.js
const functions = require('firebase-functions');
const axios     = require('axios').default;
const { CookieJar } = require('tough-cookie');
const { wrapper }   = require('axios-cookiejar-support');
const cheerio   = require('cheerio');

exports.fetchRcpTime = functions.https.onCall(async (data, context) => {
  const { login, password } = data;
  if (!login || !password) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Brakuje loginu lub hasła.'
    );
  }

  try {
    const jar    = new CookieJar();
    const client = wrapper(axios.create({ jar, withCredentials: true }));

    // 1) Pobierz CSRF token z /login/
    const loginPage = await client.get('https://panel.rcponline.pl/login/');
    const $login    = cheerio.load(loginPage.data);
    const csrf      = $login('input[name="csrfmiddlewaretoken"]').val() || '';

    // 2) Zaloguj
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

    // 3) Załaduj /app/ i parsuj
    const appPage = await client.get('https://panel.rcponline.pl/app/');
    const $app    = cheerio.load(appPage.data);

    // 4) Szukamy pierwszego <h3 class="mb-2">Dzisiaj XX:XX</h3>
    const header = $app('h3.mb-2:contains("Dzisiaj")').first().text().trim();
    if (!header) {
      throw new Error('Nie znaleziono nagłówka z "Dzisiaj XX:XX".');
    }

    const match = header.match(/(\d{2}:\d{2})/);
    if (!match) {
      throw new Error('Format czasu niezgodny z HH:mm.');
    }

    return { time: match[1] };  // np. { time: "15:09" }

  } catch (err) {
    console.error('fetchRcpTime error:', err);
    throw new functions.https.HttpsError(
      'internal',
      'Błąd podczas pobierania czasu: ' + err.message
    );
  }
});
