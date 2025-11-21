const firebaseConfig = {
    apiKey: "AIzaSyDXBs307gpMVuBvB04NOnmj9MAGpmeiNiM",
    authDomain: "nekros-6c4c6.firebaseapp.com",
    databaseURL: "https://nekros-6c4c6-default-rtdb.firebaseio.com",
    projectId: "nekros-6c4c6",
    storageBucket: "nekros-6c4c6.firebasestorage.app",
    messagingSenderId: "463680863272",
    appId: "1:463680863272:web:54adedc76edf8060e6891d",
    measurementId: "G-2SBTNP19E5"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let currentUser = null;
let currentRoom = null;
let isCreator = false;

// ====================== АВТОРИЗАЦИЯ ======================
Telegram.WebApp.ready();
Telegram.WebApp.expand();

if (Telegram.WebApp.initDataUnsafe.user) {
  const tg = Telegram.WebApp.initDataUnsafe.user;
  currentUser = {
    id: tg.id.toString(),
    name: tg.first_name || "Игрок",
    username: tg.username || null,
    photo_url: tg.photo_url || `https://t.me/i/userpic/320/${tg.id}.jpg?t=${Date.now()}`,
    is_premium: tg.is_premium || false
  };
} else {
  alert("Запускайте через Telegram!");
  currentUser = { id: "guest_" + Date.now(), name: "Гость", photo_url: null };
}

// Загрузка/создание профиля
async function loadOrCreateUser() {
  const userRef = db.ref('users/' + currentUser.id);
  const snapshot = await userRef.once('value');

  if (snapshot.exists()) {
    const data = snapshot.val();
    currentUser.balance = data.balance || 1000;
    currentUser.gamesPlayed = data.gamesPlayed || 0;
    currentUser.gamesWon = data.gamesWon || 0;
  } else {
    currentUser.balance = 1000;
    currentUser.gamesPlayed = 0;
    currentUser.gamesWon = 0;
    await userRef.set({
      ...currentUser,
      lastSeen: Date.now()
    });
  }
  document.getElementById('balance').textContent = currentUser.balance;
}
loadOrCreateUser();

// ====================== ВСПОМОГАТЕЛЬНЫЕ ======================
function updateUserBalance(amount) {
  currentUser.balance += amount;
  db.ref('users/' + currentUser.id).update({
    balance: currentUser.balance,
    lastSeen: Date.now()
  });
  document.getElementById('balance').textContent = currentUser.balance;
}

function updateStats(won) {
  db.ref('users/' + currentUser.id).transaction(data => {
    if (data) {
      data.gamesPlayed = (data.gamesPlayed || 0) + 1;
      if (won) data.gamesWon = (data.gamesWon || 0) + 1;
      data.lastSeen = Date.now();
    }
    return data;
  });
}

const screens = { menu: document.getElementById('menu'), waiting: document.getElementById('waiting'), game: document.getElementById('game'), result: document.getElementById('result') };
function showScreen(id) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[id].classList.add('active');
}

// ====================== СОЗДАНИЕ КОМНАТЫ ======================
document.getElementById('createGame').addEventListener('click', async () => {
  const bet = parseInt(document.getElementById('betAmount').value);
  if (!bet || bet < 10 || bet > currentUser.balance) return alert('Неверная ставка!');

  const roomId = Math.random().toString(36).substr(2, 6).toUpperCase();
  isCreator = true;

  await db.ref('rooms/' + roomId).set({
    bet,
    creatorId: currentUser.id,
    status: 'waiting',
    createdAt: Date.now()
  });

  currentRoom = roomId;
  document.getElementById('roomIdDisplay').textContent = roomId;
  showScreen('waiting');
  listenToRoom(roomId);
});

// ====================== ПРИСОЕДИНЕНИЕ ======================
document.getElementById('joinGame').addEventListener('click', async () => {
  const code = document.getElementById('roomCode').value.trim().toUpperCase();
  if (!code) return alert('Введите код');

  const roomRef = db.ref('rooms/' + code);
  const snapshot = await roomRef.once('value');
  const room = snapshot.val();

  if (!room || room.status !== 'waiting' || room.opponentId) {
    return alert('Комната не найдена или уже занята');
  }
  if (room.bet > currentUser.balance) return alert('Недостаточно средств!');

  await roomRef.update({
    opponentId: currentUser.id,
    status: 'full'
  });

  currentRoom = code;
  isCreator = false;
  await startGame(code, room.bet, room.creatorId, currentUser.id);
});

// ====================== ПРОСЛУШИВАНИЕ ======================
function listenToRoom(roomId) {
  db.ref('rooms/' + roomId).on('value', async snapshot => {
    const room = snapshot.val();
    if (room && room.status === 'full' && room.opponentId && isCreator) {
      await startGame(roomId, room.bet, currentUser.id, room.opponentId);
    }
  });
}

// ====================== СТАРТ ИГРЫ ======================
async function startGame(roomId, bet, player1Id, player2Id) {
  currentRoom = roomId;
  document.getElementById('gameBet').textContent = bet;

  const [p1Snap, p2Snap] = await Promise.all([
    db.ref('users/' + player1Id).once('value'),
    db.ref('users/' + player2Id).once('value')
  ]);

  const p1 = p1Snap.val() || { name: 'Игрок', photo_url: null };
  const p2 = p2Snap.val() || { name: 'Игрок', photo_url: null };

  const iAmPlayer1 = player1Id === currentUser.id;
  const myData = iAmPlayer1 ? p1 : p2;
  const oppData = iAmPlayer1 ? p2 : p1;

  // Аватарки с fallback
  document.getElementById('myAvatar').src = myData.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(myData.name)}&background=2481cc&color=fff&size=128`;
  document.getElementById('oppAvatar').src = oppData.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(oppData.name)}&background=666&color=fff&size=128`;

  document.getElementById('mypName').textContent = myData.name + (myData.username ? ` @${myData.username}` : '');
  document.getElementById('oppName').textContent = oppData.name + (oppData.username ? ` @${oppData.username}` : '');

  showScreen('game');

  const btn = document.getElementById('rollBtn');
  btn.disabled = !isCreator;
  btn.textContent = isCreator ? 'Бросить кости!' : 'Ожидаем броска...';

  listenToRolls();
}

// ====================== БРОСОК ======================
document.getElementById('rollBtn').addEventListener('click', () => {
  if (!isCreator || document.getElementById('rollBtn').disabled) return;

  document.getElementById('rollBtn').disabled = true;
  document.getElementById('rollBtn').textContent = 'Бросаем...';

  const p1Roll = Math.floor(Math.random() * 6) + 1;
  const p2Roll = Math.floor(Math.random() * 6) + 1;

  db.ref('rooms/' + currentRoom).update({
    player1Roll: p1Roll,
    player2Roll: p2Roll,
    rolledAt: Date.now()
  });
});

// ====================== РЕЗУЛЬТАТ ======================
function listenToRolls() {
  db.ref('rooms/' + currentRoom).on('value', async snapshot => {
    const room = snapshot.val();
    if (!room || !room.player1Roll || !room.player2Roll) return;
    if (document.getElementById('yourResult').textContent !== '-') return;

    const myRoll = isCreator ? room.player1Roll : room.player2Roll;
    const oppRoll = isCreator ? room.player2Roll : room.player1Roll;

    document.getElementById('yourDice').classList.add('rolling');
    document.getElementById('opponentDice').classList.add('rolling');

    setTimeout(() => {
      const faces = ['⚀','⚁','⚂','⚃','⚄','⚅'];
      document.getElementById('yourDice').textContent = faces[myRoll - 1];
      document.getElementById('opponentDice').textContent = faces[oppRoll - 1];
      document.getElementById('yourResult').textContent = myRoll;
      document.getElementById('opponentResult').textContent = oppRoll;

      document.getElementById('yourDice').classList.remove('rolling');
      document.getElementById('opponentDice').classList.remove('rolling');

      const bet = room.bet;
      let resultText = '', amount = 0;

      if (myRoll > oppRoll) {
        updateUserBalance(+bet);
        resultText = 'Вы выиграли! 🎉';
        amount = +bet;
        updateStats(true);
      } else if (myRoll < oppRoll) {
        updateUserBalance(-bet);
        resultText = 'Вы проиграли 😢';
        amount = -bet;
        updateStats(false);
      } else {
        resultText = 'Ничья! 🤝';
        updateStats(false);
      }

      document.getElementById('resultText').textContent = resultText;
      document.getElementById('winAmount').textContent = (amount > 0 ? '+' : '') + amount + ' 💰';

      db.ref('rooms/' + currentRoom).remove();
      setTimeout(() => showScreen('result'), 3000);
    }, 1000);
  });
}

// ====================== СПИСОК КОМНАТ ======================
async function loadOpenRooms() {
  const snapshot = await db.ref('rooms').orderByChild('status').equalTo('waiting').once('value');
  const list = document.getElementById('roomsList');
  list.innerHTML = snapshot.exists() ? '' : '<div class="placeholder">Нет активных комнат</div>';

  snapshot.forEach(child => {
    const room = child.val();
    db.ref('users/' + room.creatorId).once('value').then(snap => {
      const creator = snap.val() || { name: 'Игрок', username: '' };
      const div = document.createElement('div');
      div.className = 'room-item';
      div.innerHTML = `
        <div>
          <div><strong>${child.key}</strong> — ${room.bet} 💰</div>
          <div style="font-size:14px;opacity:0.7;">${creator.name}${creator.username ? ' @'+creator.username : ''}</div>
        </div>
        <button class="btn primary small" onclick="quickJoin('${child.key}')">Войти</button>
      `;
      list.appendChild(div);
    });
  });
}

window.quickJoin = (id) => {
  document.getElementById('roomCode').value = id;
  document.getElementById('joinGame').click();
};

// ====================== ВЫХОД ======================
document.getElementById('cancelRoom').onclick =
document.getElementById('leaveGame').onclick =
document.getElementById('playAgain').onclick = () => {
  if (currentRoom) db.ref('rooms/' + currentRoom).remove();
  location.reload();
};

// ====================== ЗАПУСК ======================
loadOpenRooms();
setInterval(loadOpenRooms, 5000);