// mini-games/shared/firebase.js
// 100% рабочий на ноябрь 2025

(() => {
  const appScript = document.createElement('script');
  appScript.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js';
  appScript.onload = () => loadDatabase();
  document.head.appendChild(appScript);

  function loadDatabase() {
    const dbScript = document.createElement('script');
    dbScript.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js';
    dbScript.onload = initFirebase;
    document.head.appendChild(dbScript);
  }

  function initFirebase() {
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
    const db = firebase.database();

    Telegram.WebApp.ready();
    Telegram.WebApp.expand();

    const tgUser = Telegram.WebApp.initDataUnsafe?.user || {};
    const userId = tgUser.id ? tgUser.id.toString() : "guest_" + Date.now();
    const userName = tgUser.first_name || "Гость";

    const userRef = db.ref('users/' + userId);

    userRef.once('value').then(snap => {
      let balance = 1000;
      if (snap.exists() && snap.val().balance !== undefined) {
        balance = snap.val().balance;
      } else {
        userRef.set({ balance: 1000, name: userName, lastSeen: Date.now() });
      }

      // Глобальные переменные и функции
      window.currentUserBalance = balance;
      window.updateBalance = (delta) => {
        balance += delta;
        window.currentUserBalance = balance;
        userRef.update({ balance });
        document.querySelectorAll('#balance').forEach(el => el.textContent = balance.toLocaleString());
      };

      // Обновляем баланс сразу
      document.querySelectorAll('#balance').forEach(el => el.textContent = balance.toLocaleString());
    });
  }
})();
