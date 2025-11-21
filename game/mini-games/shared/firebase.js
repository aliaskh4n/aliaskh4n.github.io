let currentUser = null;
let db = null;

async function initFirebaseAndBalance() {
  if (window.firebaseInitialized) return;
  window.firebaseInitialized = true;

  const firebaseConfig = {
    apiKey: "AIzaSyDXBs307gpMVuBvB04NOnmj9MAGpmeiNiM",
    authDomain: "nekros-6c4c6.firebaseapp.com",
    databaseURL: "https://nekros-6c4c6-default-rtdb.firebaseio.com",
    projectId: "nekros-6c4c6",
    storageBucket: "nekros-6c4c6.firebasestorage.app",
    messagingSenderId: "463680863272",
    appId: "1:463680863272:web:54adedc76edf8060e6891d"
  };

  firebase.initializeApp(firebaseConfig);
  db = firebase.database();

  Telegram.WebApp.ready();
  Telegram.WebApp.expand();

  const tg = Telegram.WebApp.initDataUnsafe.user || {};
  currentUser = { id: tg.id ? tg.id.toString() : "guest_" + Date.now(), name: tg.first_name || "Гость" };

  const ref = db.ref('users/' + currentUser.id);
  const snap = await ref.once('value');
  if (snap.exists()) {
    currentUser.balance = snap.val().balance || 1000;
  } else {
    currentUser.balance = 1000;
    await ref.set({ balance: 1000, name: currentUser.name, lastSeen: Date.now() });
  }

  document.querySelectorAll('#balance').forEach(el => el.textContent = currentUser.balance.toLocaleString());
}

function updateBalance(delta) {
  if (!currentUser || !db) return;
  currentUser.balance += delta;
  db.ref('users/' + currentUser.id).update({ balance: currentUser.balance });
  document.querySelectorAll('#balance').forEach(el => el.textContent = currentUser.balance.toLocaleString());
}

window.updateBalance = updateBalance;