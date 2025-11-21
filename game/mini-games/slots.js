// mini-games/slots.js — ФИНАЛЬНАЯ ВЕРСИЯ (работает всегда)

let reels, resultEl, spinBtn, betDisplay;
let currentBet = 50;
const betSteps = [10, 25, 50, 100, 250, 500];
const symbols = ['🍒', '🍋', '🍊', '⭐', '💎', '🔔', '7'];

// Ждём полной загрузки страницы + Firebase
document.addEventListener('DOMContentLoaded', () => {
  // Теперь всё точно существует
  reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
  ];
  resultEl = document.getElementById('result');
  spinBtn = document.getElementById('spinBtn');
  betDisplay = document.getElementById('currentBet');

  // Защита от null (на всякий случай)
  if (!reels[0] || !reels[1] || !reels[2] || !spinBtn || !resultEl || !betDisplay) {
    console.error('Не найдены элементы слотов! Проверь ID в HTML');
    return;
  }

  // Кнопки ставки
  document.getElementById('betDown').addEventListener('click', () => {
    const idx = betSteps.indexOf(currentBet);
    if (idx > 0) {
      currentBet = betSteps[idx - 1];
      betDisplay.textContent = currentBet;
    }
  });

  document.getElementById('betUp').addEventListener('click', () => {
    const idx = betSteps.indexOf(currentBet);
    if (idx < betSteps.length - 1) {
      const nextBet = betSteps[idx + 1];
      if (nextBet <= (window.currentUserBalance || 0)) {
        currentBet = nextBet;
        betDisplay.textContent = currentBet;
      }
    }
  });

  // КНОПКА КРУТИТЬ
  spinBtn.addEventListener('click', async () => {
    if (currentBet > (window.currentUserBalance || 0)) {
      alert('Недостаточно монет!');
      return;
    }

    spinBtn.disabled = true;
    spinBtn.textContent = 'КРУТИТСЯ...';
    resultEl.textContent = '';

    // Анимация
    reels.forEach(r => r.classList.add('spinning'));
    if (window.Telegram?.WebApp?.HapticFeedback) {
      Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
    }

    // Ждём 2 секунды
    await new Promise(r => setTimeout(r, 2000));

    // Останавливаем
    reels.forEach(r => r.classList.remove('spinning'));

    // Результат
    const result = [];
    reels.forEach((reel, i) => {
      const sym = symbols[Math.floor(Math.random() * symbols.length)];
      reel.textContent = sym;
      result.push(sym);
    });

    // Выигрыш
    let win = 0;
    let message = 'Повезёт в следующий раз 😢';
    let color = '#ef4444';

    if (result[0] === result[1] && result[1] === result[2]) {
      if (result[0] === '7') {
        win = currentBet * 777;
        message = `ДЖЕКПОТ! +${win} 💰`;
        if (window.Telegram?.WebApp?.HapticFeedback) Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      } else {
        win = currentBet * 20;
        message = `Три одинаковых! +${win} 💰`;
      }
      color = '#4ade80';
    } else if (new Set(result).size === 2) {
      win = currentBet * 3;
      message = `Две одинаковые! +${win} 💰`;
      color = '#4ade80';
    } else {
      win = -currentBet;
      if (window.Telegram?.WebApp?.HapticFeedback) Telegram.WebApp.HapticFeedback.notificationOccurred('error');
    }

    window.updateBalance(win);
    resultEl.innerHTML = `<div style="color:${color}">${message}</div>`;

    spinBtn.disabled = false;
    spinBtn.textContent = 'КРУТИТЬ!';
  });
});
