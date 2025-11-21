const firebaseConfig = {
  databaseURL: "https://nekros-6c4c6-default-rtdb.firebaseio.com"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let userToken = null;
let userName = "Игрок";
let currentRoom = null;
let isCreator = false;

Telegram.WebApp.ready();
Telegram.WebApp.expand();

// Инициализация имени игрока
if (Telegram.WebApp.initDataUnsafe.user) {
  userName = (Telegram.WebApp.initDataUnsafe.user.first_name || "Игрок").substring(0, 50);
}

// Баланс
let balance = parseInt(localStorage.getItem('diceBalance') || '1000');
document.getElementById('balance').textContent = balance;

// Генерация уникального токена игрока (SHA-256)
async function generateToken() {
  const initData = Telegram.WebApp.initData || "guest_" + Date.now();
  const encoder = new TextEncoder();
  const data = encoder.encode(initData);
  const hash = await crypto.subtle.digest('SHA-256', data);
  userToken = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('');
  
  loadOpenRooms();
  setInterval(loadOpenRooms, 5000);
}

generateToken();

// Создание комнаты
document.getElementById('createGame').onclick = () => {
  const bet = parseInt(document.getElementById('betAmount').value);
  if (bet < 10 || bet > 10000 || bet > balance) return alert('Неверная ставка!');

  const roomId = Math.random().toString(36).substr(2, 6).toUpperCase();
  currentRoom = roomId;
  isCreator = true;

  db.ref('rooms/' + roomId).set({
    bet,
    creatorToken: userToken,
    creatorName: userName,
    status: 'waiting',
    createdAt: firebase.database.ServerValue.TIMESTAMP
  }).then(() => {
    document.getElementById('roomIdDisplay').textContent = roomId;
    showScreen('waiting');
    listenToRoom(roomId);
  });
};

// Присоединение к комнате
document.getElementById('joinGame').onclick = () => {
  const code = document.getElementById('roomCode').value.trim().toUpperCase();
  if (!code) return alert('Введите код');

  db.ref('rooms/' + code).once('value').then(snap => {
    const room = snap.val();
    if (!room || room.status !== 'waiting' || room.opponentToken) return alert('Комната недоступна');

    db.ref('rooms/' + code).update({
      opponentToken: userToken,
      opponentName: userName,
      status: 'full'
    }).then(() => {
      currentRoom = code;
      isCreator = false;
      document.getElementById('gameBet').textContent = room.bet;
      document.getElementById('player1Name').textContent = room.creatorName;
      document.getElementById('player2Name').textContent = userName;
      showScreen('game');
      document.getElementById('rollBtn').disabled = true;
      document.getElementById('rollBtn').textContent = 'Ожидаем броска...';
      listenToRolls();
    });
  });
};

// Бросок кубиков (только создатель)
document.getElementById('rollBtn').onclick = () => {
  if (!isCreator) return;
  document.getElementById('rollBtn').disabled = true;
  document.getElementById('rollBtn').textContent = 'Бросаем...';

  const p1 = Math.floor(Math.random() * 6) + 1;
  const p2 = Math.floor(Math.random() * 6) + 1;

  db.ref('rooms/' + currentRoom).update({
    player1Roll: p1,
    player2Roll: p2
  });
};

// Прослушка результатов
function listenToRolls() {
  db.ref('rooms/' + currentRoom).on('value', snap => {
    const room = snap.val();
    if (!room || !room.player1Roll || document.getElementById('yourResult').textContent !== '-') return;

    const myRoll = isCreator ? room.player1Roll : room.player2Roll;
    const oppRoll = isCreator ? room.player2Roll : room.player1Roll;

    // Анимация кубиков
    document.getElementById('yourDice').classList.add('rolling');
    document.getElementById('opponentDice').classList.add('rolling');

    setTimeout(() => {
      const faces = ['⚀','⚁','⚂','⚃','⚄','⚅'];
      document.getElementById('yourDice').textContent = faces[myRoll-1];
      document.getElementById('opponentDice').textContent = faces[oppRoll-1];
      document.getElementById('yourResult').textContent = myRoll;
      document.getElementById('opponentResult').textContent = oppRoll;

      const bet = room.bet;
      if (myRoll > oppRoll) {
        balance += bet;
        document.getElementById('resultText').textContent = 'Вы выиграли! 🎉';
        document.getElementById('winAmount').textContent = '+' + bet;
      } else if (myRoll < oppRoll) {
        balance -= bet;
        document.getElementById('resultText').textContent = 'Вы проиграли 😢';
        document.getElementById('winAmount').textContent = '-' + bet;
      } else {
        document.getElementById('resultText').textContent = 'Ничья! 🤝';
        document.getElementById('winAmount').textContent = '0';
      }

      localStorage.setItem('diceBalance', balance);
      document.getElementById('balance').textContent = balance;

      db.ref('rooms/' + currentRoom).remove();
      setTimeout(() => showScreen('result'), 3000);
    }, 800);
  });
}

// Прослушка комнаты для создателя
function listenToRoom(roomId) {
  db.ref('rooms/' + roomId).on('value', snap => {
    const room = snap.val();
    if (room && room.status === 'full' && room.opponentToken && isCreator) {
      document.getElementById('gameBet').textContent = room.bet;
      document.getElementById('player1Name').textContent = userName;
      document.getElementById('player2Name').textContent = room.opponentName || 'Игрок';
      showScreen('game');
      document.getElementById('rollBtn').disabled = false;
      document.getElementById('rollBtn').textContent = 'Бросить кости!';
      listenToRolls();
    }
  });
}
