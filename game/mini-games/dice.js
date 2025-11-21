// mini-games/dice.js
let currentRoom = null;
let isCreator = false;

const db = firebase.database();

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

// ====================== СОЗДАНИЕ КОМНАТЫ ======================
document.getElementById('createGame').addEventListener('click', async () => {
  const betInput = document.getElementById('betAmount');
  const bet = parseInt(betInput.value);

  if (!bet || bet < 10 || bet > window.currentUserBalance) {
    alert('Неверная ставка! Минимум 10, не больше баланса.');
    return;
  }

  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  isCreator = true;
  currentRoom = roomId;

  await db.ref('rooms/' + roomId).set({
    bet,
    creatorId: Telegram.WebApp.initDataUnsafe.user.id,
    status: 'waiting',
    createdAt: Date.now()
  });

  document.getElementById('roomIdDisplay').textContent = roomId;
  showScreen('waiting');
  listenToRoom(roomId);
});

// ====================== ПРИСОЕДИНЕНИЕ ПО КОДУ ======================
document.getElementById('joinGame').addEventListener('click', async () => {
  const code = document.getElementById('roomCode').value.trim().toUpperCase();
  if (!code) return alert('Введите код комнаты');

  const roomRef = db.ref('rooms/' + code);
  const snapshot = await roomRef.once('value');
  const room = snapshot.val();

  if (!room || room.status !== 'waiting' || room.opponentId) {
    return alert('Комната не найдена или уже занята');
  }
  if (room.bet > window.currentUserBalance) {
    return alert('Недостаточно средств!');
  }

  await roomRef.update({
    opponentId: Telegram.WebApp.initDataUnsafe.user.id,
    status: 'full'
  });

  currentRoom = code;
  isCreator = false;
  await startGame(code, room.bet, room.creatorId, Telegram.WebApp.initDataUnsafe.user.id);
});

// ====================== БЫСТРОЕ ПРИСОЕДИНЕНИЕ ИЗ СПИСКА ======================
window.quickJoin = (roomId) => {
  document.getElementById('roomCode').value = roomId;
  document.getElementById('joinGame').click();
};

// ====================== ПРОСЛУШИВАНИЕ КОМНАТЫ ======================
function listenToRoom(roomId) {
  db.ref('rooms/' + roomId).on('value', async (snapshot) => {
    const room = snapshot.val();
    if (room && room.status === 'full' && room.opponentId && isCreator) {
      await startGame(roomId, room.bet, Telegram.WebApp.initDataUnsafe.user.id, room.opponentId);
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

  const p1 = p1Snap.val() || { name: 'Игрок' };
  const p2 = p2Snap.val() || { name: 'Игрок' };

  const iAmPlayer1 = player1Id === Telegram.WebApp.initDataUnsafe.user.id;
  const myData = iAmPlayer1 ? p1 : p2;
  const oppData = iAmPlayer1 ? p2 : p1;

  // Аватары
  document.getElementById('myAvatar').src = myData.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(myData.name)}&background=2481cc&color=fff&size=128`;
  document.getElementById('oppAvatar').src = oppData.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(oppData.name)}&background=666&color=fff&size=128`;

  document.getElementById('mypName').textContent = myData.name + (myData.username ? ` @${myData.username}` : '');
  document.getElementById('oppName').textContent = oppData.name + (oppData.username ? ` @${oppData.username}` : '');

  showScreen('game');

  const rollBtn = document.getElementById('rollBtn');
  rollBtn.disabled = !isCreator;
  rollBtn.textContent = isCreator ? 'Бросить кости!' : 'Ожидаем броска...';

  listenToRolls();
}

// ====================== БРОСОК КУБИКОВ ======================
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
  const off = db.ref('rooms/' + currentRoom).on('value', (snapshot) => {
    const room = snapshot.val();
    if (!room || !room.player1Roll || !room.player2Roll) return;
    if (document.getElementById('yourResult').textContent !== '-') return;

    db.ref('rooms/' + currentRoom).off('value', off); // отписываемся

    const myRoll = isCreator ? room.player1Roll : room.player2Roll;
    const oppRoll = isCreator ? room.player2Roll : room.player1Roll;

    document.getElementById('yourDice').classList.add('rolling');
    document.getElementById('opponentDice').classList.add('rolling');

    setTimeout(() => {
      const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
      document.getElementById('yourDice').textContent = faces[myRoll - 1];
      document.getElementById('opponentDice').textContent = faces[oppRoll - 1];
      document.getElementById('yourResult').textContent = myRoll;
      document.getElementById('opponentResult').textContent = oppRoll;

      document.getElementById('yourDice').classList.remove('rolling');
      document.getElementById('opponentDice').classList.remove('rolling');

      let resultText = '';
      let amount = 0;

      if (myRoll > oppRoll) {
        updateBalance(+room.bet);
        resultText = 'Вы выиграли! 🎉';
        amount = +room.bet;
        updateStats(true);
      } else if (myRoll < oppRoll) {
        updateBalance(-room.bet);
        resultText = 'Вы проиграли 😢';
        amount = -room.bet;
        updateStats(false);
      } else {
        resultText = 'Ничья! 🤝';
        updateStats(false);
      }

      document.getElementById('resultText').textContent = resultText;
      document.getElementById('winAmount').textContent = (amount > 0 ? '+' : '') + amount + ' 💰';

      db.ref('rooms/' + currentRoom).remove();
      setTimeout(() => showScreen('result'), 3000);
    }, 1200);
  });
}

// ====================== СТАТИСТИКА ======================
function updateStats(won) {
  const userId = Telegram.WebApp.initDataUnsafe.user.id;
  db.ref('users/' + userId).transaction(data => {
    if (data) {
      data.gamesPlayed = (data.gamesPlayed || 0) + 1;
      if (won) data.gamesWon = (data.gamesWon || 0) + 1;
    }
    return data;
  });
}

// ====================== СПИСОК ОТКРЫТЫХ КОМНАТ ======================
async function loadOpenRooms() {
  const snapshot = await db.ref('rooms').orderByChild('status').equalTo('waiting').once('value');
  const list = document.getElementById('roomsList');
  list.innerHTML = snapshot.val() ? '' : '<div style="text-align:center;padding:20px;color:#999">Нет активных комнат</div>';

  snapshot.forEach(child => {
    const room = child.val();
    db.ref('users/' + room.creatorId).once('value').then(snap => {
      const creator = snap.val() || { name: 'Игрок' };
      const div = document.createElement('div');
      div.className = 'room-item';
      div.innerHTML = `
        <div>
          <div><strong>${child.key}</strong> — ${room.bet} 💰</div>
          <div style="font-size:14px;opacity:0.7;margin-top:4px">${creator.name}${creator.username ? ' @' + creator.username : ''}</div>
        </div>
        <button class="btn" style="padding:8px 16px;font-size:15px" onclick="quickJoin('${child.key}')">Войти</button>
      `;
      list.appendChild(div);
    });
  });
}

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