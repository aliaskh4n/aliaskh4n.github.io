// mini-games/slots.js — РАБОЧАЯ ВЕРСИЯ ПОД ТВОЙ ДИЗАЙН DICE.HTML

const reels = [
  document.getElementById('reel1'),
  document.getElementById('reel2'),
  document.getElementById('reel3')
];

const resultEl = document.getElementById('result');
const spinBtn = document.getElementById('spinBtn');
const betDisplay = document.getElementById('currentBet');

const symbols = ['🍒', '🍋', '🍊', '⭐', '💎', '🔔', '7'];

let currentBet = 50;
const betSteps = [10, 25, 50, 100, 250, 500];

// Кнопки ставки
document.getElementById('betDown').onclick = () => {
  const idx = betSteps.indexOf(currentBet);
  if (idx > 0) {
    currentBet = betSteps[idx - 1];
    betDisplay.textContent = currentBet;
  }
};

document.getElementById('betUp').onclick = () => {
  const idx = betSteps.indexOf(currentBet);
  if (idx < betSteps.length - 1 && betSteps[idx + 1] <= window.currentUserBalance) {
    currentBet = betSteps[idx + 1];
    betDisplay.textContent = currentBet;
  }
};

// Основная кнопка крутить
spinBtn.onclick = async () => {
  if (currentBet > window.currentUserBalance) {
    alert('Недостаточно средств!');
    return;
  }

  spinBtn.disabled = true;
  spinBtn.textContent = 'КРУТИТСЯ...';
  resultEl.textContent = '';

  // Анимация вращения
  reels.forEach(reel => reel.classList.add('spinning'));
  Telegram.WebApp.HapticFeedback.impactOccurred('medium');

  // Имитация времени прокрутки
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Останавливаем анимацию
  reels.forEach(reel => reel.classList.remove('spinning'));

  // Генерируем результат
  const result = [];
  for (let i = 0; i < 3; i++) {
    const sym = symbols[Math.floor(Math.random() * symbols.length)];
    reels[i].textContent = sym;
    result.push(sym);
  }

  // Проверка выигрыша
  let winAmount = 0;
  let message = '';
  let color = '#ef4444'; // красный по умолчанию

  if (result[0] === result[1] && result[1] === result[2]) {
    if (result[0] === '7') {
      winAmount = currentBet * 777;
      message = `ДЖЕКПОТ! +${winAmount} 💰`;
      Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    } else {
      winAmount = currentBet * 20;
      message = `Три одинаковых! +${winAmount} 💰`;
    }
    color = '#4ade80'; // зелёный
  } else if (new Set(result).size === 2) {
    winAmount = currentBet * 3;
    message = `Две одинаковые! +${winAmount} 💰`;
    color = '#4ade80';
  } else {
    winAmount = -currentBet;
    message = 'Повезёт в следующий раз 😢';
    Telegram.WebApp.HapticFeedback.notificationOccurred('error');
  }

  // Обновляем баланс
  window.updateBalance(winAmount);

  // Показываем результат
  resultEl.innerHTML = `<div style="color:${color}">${message}</div>`;

  // Возвращаем кнопку
  spinBtn.disabled = false;
  spinBtn.textContent = 'КРУТИТЬ!';
};
