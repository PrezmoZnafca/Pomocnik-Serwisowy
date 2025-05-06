const functions = require("firebase-functions");
const admin     = require("firebase-admin");
const fetch     = require("node-fetch");
const cheerio   = require("cheerio");
const crypto    = require("crypto");

// Initialize Firebase Admin SDK
admin.initializeApp();
const db      = admin.firestore();
// AES-256 key stored in functions config (firebase functions:config:set rcp.key)
const AES_KEY = Buffer.from(functions.config().rcp.key, "hex");

/**
 * Zapisuje zaszyfrowane poświadczenia RCPonline (login i hasło) do Firestore.
 * zapisane dane znajdują się pod ścieżką: users/{uid}/rcpCreds/creds
 */
exports.registerCreds = functions
  .region('europe-central2')
  .https.onCall(async (data, context) => {
    // Autoryzacja
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Zaloguj się, aby zapisać poświadczenia");
    }
    const { login, password } = data;
    if (!login || !password) {
      throw new functions.https.HttpsError("invalid-argument", "Brak loginu lub hasła");
    }

    // Szyfrowanie login:password przy użyciu AES-256-CBC
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", AES_KEY, iv);
    const ciphertext = Buffer.concat([
      cipher.update(`${login}:${password}`, "utf8"),
      cipher.final()
    ]);

    // Zapis do Firestore
    await db.doc(`users/${context.auth.uid}/rcpCreds/creds`).set({
      iv: iv.toString("hex"),
      ciphertext: ciphertext.toString("hex")
    });

    return { success: true };
  });

/**
 * Pobiera godzinę przyjścia ze strony RCPonline poprzez scraping
 */
exports.getRcpCheckin = functions
  .region('europe-central2')
  .https.onCall(async (_, context) => {
    // Autoryzacja
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Zaloguj się, aby pobrać godzinę");
    }

    // Odczytaj poświadczenia z Firestore
    const doc = await db.doc(`users/${context.auth.uid}/rcpCreds/creds`).get();
    if (!doc.exists) {
      throw new functions.https.HttpsError("not-found", "Brak zapisanych poświadczeń");
    }
    const { iv, ciphertext } = doc.data();

    // Odszyfrowanie
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      AES_KEY,
      Buffer.from(iv, "hex")
    );
    const decrypted = decipher.update(ciphertext, "hex", "utf8") + decipher.final("utf8");
    const [login, password] = decrypted.split(":");

    // Logowanie do RCPonline (oczekujemy przekierowania 302)
    const loginRes = await fetch("https://rcponline.pl/login", {
      method: "POST",
      redirect: "manual",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `username=${encodeURIComponent(login)}&password=${encodeURIComponent(password)}`
    });
    if (loginRes.status !== 302) {
      throw new functions.https.HttpsError("permission-denied", "Błąd logowania do RCPonline");
    }
    const cookie = loginRes.headers.get("set-cookie");

    // Pobranie panelu użytkownika z godziną przyjścia
    const dashboardRes = await fetch("https://rcponline.pl/dashboard", {
      headers: { Cookie: cookie }
    });
    const html = await dashboardRes.text();
    const $ = cheerio.load(html);
    // Dostosuj selektor do rzeczywistego elementu zawierającego godzinę
    const time = $("#checkin-time").text().trim();
    if (!time) {
      throw new functions.https.HttpsError("unknown", "Nie znaleziono godziny przyjścia na stronie RCPonline");
    }

    return { checkin: time };
  });
