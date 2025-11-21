// mini-games/dice.js — ФИНАЛЬНАЯ ВЕРСИЯ (21.11.2025)

let db = null;
let currentRoom = null;
let isCreator = false;
let userId = null;

// Ждём полной загрузки Telegram WebApp + Firebase
async function initGame() {
  // Ждём Telegram WebApp
  while (!window.Telegram || !window.Telegram.WebApp || !window.Telegram.WebApp.initDataUnsafe || !window.Telegram.WebApp.initDataUnsafe.user) {
    await new Promise(r => setTimeout(r, 50));
  }

  // Ждём Firebase
  while (!window.updateBalance) {
    await new Promise(r => setTimeout(r, 50));
  }

  const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
  userId = tgUser.id.toString();

  db = firebase.database(); // Теперь точно есть!

  console.log('Dice game инициализирован для пользователя:', userId);

  // Теперь можно запускать всю логику
  setupEventListeners();
  loadOpenRooms();
  setInterval(loadOpenRooms, 5000);
}

const screens = {
  menu: document.getElementById('menu'),
  waiting: document.getElementById('waiting'),
  game: document.getElementById('game'),
  result: document.getElementById('result')
};

function showScreen(id) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[id].classList.add('active');
}

// ====================== ВСЯ ЛОГИКА ======================
function setupEventListeners() {
  document.getElementById('createGame').onclick = async () => {
    const bet = parseInt(document.getElementById('betAmount').value);
    if (!bet || bet < 10 || bet > window.currentUserBalance) return alert('Неверная ставка!');

    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    isCreator = true;
    currentRoom = roomId;

    await db.ref('rooms/' + roomId).set({
      bet,
      creatorId: userId,
      status: 'waiting',
      createdAt: Date.now()
    });

    document.getElementById('roomIdDisplay').textContent = roomId;
    showScreen('waiting');
    listenToRoom(roomId);
  };

  document.getElementById('joinGame').onclick = async () => {
    const code = document.getElementById('roomCode').value.trim().toUpperCase();
    if (!code) return alert('Введите код');

    const roomRef = db.ref('rooms/' + code);
    const snap = await roomRef.once('value');
    const room = snap.val();

    if (!room || room.status !== 'waiting' || room.opponentId) return alert('Комната занята');
    if (room.bet > window.currentUserBalance) return alert('Недостаточно средств!');

    await roomRef.update({ opponentId: userId, status: 'full' });
    currentRoom = code;
    isCreator = false;
    await startGame(code, room.bet, room.creatorId, userId);
  };

  window.quickJoin = (id) => {
    document.getElementById('roomCode').value = id;
    document.getElementById('joinGame').click();
  };

  ['cancelRoom', 'leaveGame', 'playAgain'].forEach(id => {
    document.getElementById(id).onclick = () => {
      if (currentRoom) db.ref('rooms/' + currentRoom).remove();
      location.reload();
    };
  });
}

function listenToRoom(roomId) {
  db.ref('rooms/' + roomId).on('value', snap => {
    const room = snap.val();
    if (room && room.status === 'full' && room.opponentId && isCreator) {
      startGame(roomId, room.bet, userId, room.opponentId);
    }
  });
}

async function startGame(roomId, bet, p1Id, p2Id) {
  currentRoom = roomId;
  document.getElementById('gameBet').textContent = bet;

  const [p1, p2] = await Promise.all([
    db.ref('users/' + p1Id).once('value').then(s => s.val() || { name: 'Игрок' }),
    db.ref('users/' + p2Id).once('value').then(s => s.val() || { name: 'Игрок' })
  ]);

  const iAmP1 = p1Id === userId;
  const my = iAmP1 ? p1 : p2;
  const opp = iAmP1 ? p2 : p1;

  document.getElementById('myAvatar').src = my.photo_url || `https://ui-avatars.com/api/?name=${my.name || 'You'}&background=2481cc&color=fff`;
  document.getElementById('oppAvatar').src = opp.photo_url || `https://ui-avatars.com/api/?name=${opp.name || 'Opp'}&background=666&color=fff`;
  document.getElementById('mypName').textContent = (my.name || 'Вы') + (my.username ? ` @${my.username}` : '');
  document.getElementById('oppName').textContent = (opp.name || 'Соперник') + (opp.username ? ` @${opp.username}` : '');

  showScreen('game');
  document.getElementById('rollBtn').disabled = !isCreator;
  document.getElementById('rollBtn').textContent = isCreator ? 'Бросить кости!' : 'Ожидаем...';

  listenToRolls();
}

document.getElementById('rollBtn').onclick = () => {
  if (!isCreator || document.getElementById('rollBtn').disabled) return;
  document.getElementById('rollBtn').disabled = true;
  document.getElementById('rollBtn').textContent = 'Бросаем...';

  const rolls = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
  db.ref('rooms/' + currentRoom).update({
    player1Roll: isCreator ? rolls[0] : rolls[1],
    player2Roll: isCreator ? rolls[1] : rolls[0],
    rolledAt: Date.now()
  });
};

function listenToRolls() {
  db.ref('rooms/' + currentRoom).on('value', snap => {
    const room = snap.val();
    if (!room || !room.player1Roll || document.getElementById('yourResult').textContent !== '-') return;

    const myRoll = isCreator ? room.player1Roll : room.player2Roll;
    const oppRoll = isCreator ? room.player2Roll : room.player1Roll;

    document.getElementById('yourDice').classList.add('rolling');
    document.getElementById('opponentDice').classList.add('rolling');

    setTimeout(() => {
      const faces = ['⚀','⚁','⚂','⚃','⚄','⚅'];
      document.getElementById('yourDice').textContent = faces[myRoll-1];
      document.getElementById('opponentDice').textContent = faces[oppRoll-1];
      document.getElementById('yourResult').textContent = myRoll;
      document.getElementById('opponentResult').textContent = oppRoll;
      document.getElementById('yourDice').classList.remove('rolling');
      document.getElementById('opponentDice').classList.remove('rolling');

      if (myRoll > oppRoll) {
        window.updateBalance(+room.bet);
        document.getElementById('resultText').textContent = 'Вы выиграли! 🎉';
        document.getElementById('winAmount').textContent = '+' + room.bet + ' 💰';
      } else if (myRoll < oppRoll) {
        window.updateBalance(-room.bet);
        document.getElementById('resultText').textContent = 'Вы проиграли 😢';
        document.getElementById('winAmount').textContent = '-' + room.bet + ' 💰';
      } else {
        document.getElementById('resultText').textContent = 'Ничья! 🤝';
        document.getElementById('winAmount').textContent = '0 💰';
      }

      db.ref('rooms/' + currentRoom).remove();
      setTimeout(() => showScreen('result'), 3000);
    }, 1200);
  });
}

async function loadOpenRooms() {
  const snap = await db.ref('rooms').orderByChild('status').equalTo('waiting').once('value');
  const list = document.getElementById('roomsList');
  list.innerHTML = snap.val() ? '' : '<div style="text-align:center;color:#999;padding:20px">Нет активных комнат</div>';

  snap.forEach(child => {
    const room = child.val();
    db.ref('users/' + room.creatorId).once('value').then(usnap => {
      const creator = usnap.val() || { name: 'Игрок' };
      const div = document.createElement('div');
      div.className = 'room-item';
      div.innerHTML = `
        <div><strong>${child.key}</strong> — ${room.bet} 💰<br>
        <small>${creator.name}${creator.username ? ' @'+creator.username : ''}</small></div>
        <button class="btn" style="padding:8px 16px" onclick="quickJoin('${child.key}')">Войти</button>
      `;
      list.appendChild(div);
    });
  });
}

// ====================== ЗАПУСК ======================
initGame();
