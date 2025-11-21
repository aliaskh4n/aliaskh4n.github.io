// mini-games/slots.js — Профессиональная версия 2025

const symbols = ['🍒', '🍋', '🍊', '⭐', '💎', '🔔', '7'];
const strips = [document.getElementById('strip1'), document.getElementById('strip2'), document.getElementById('strip3')];
const reelsWrapper = document.getElementById('reelsWrapper');
const winLine = document.getElementById('winLine');
const resultEl = document.getElementById('result');
const spinBtn = document.getElementById('spinBtn');
const betDisplay = document.getElementById('currentBet');

let currentBet = 50;
const bets = [10, 25, 50, 100, 250, 500];

// Инициализация полос
function initReels() {
  strips.forEach(strip => {
    strip.innerHTML = '';
    for (let i = 0; i < 30; i++) {
      const sym = symbols[Math.floor(Math.random() * symbols.length)];
      strip.innerHTML += `<div class="symbol">${sym}</div>`;
    }
  });
}

// Крутить!
spinBtn.onclick = async () => {
  if (currentBet > window.currentUserBalance) return alert('Недостаточно монет!');

  spinBtn.disabled = true;
  resultEl.textContent = '';
  winLine.style.opacity = '0';
  reelsWrapper.classList.add('spinning');

  // Звук (вибрация в Telegram)
  Telegram.WebApp.HapticFeedback.impactOccurred('heavy');

  // Случайные финальные символы
  const final = [
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)]
  ];

  // Анимация прокрутки
  await new Promise(r => setTimeout(r, 800));
  strips[0].style.transition = 'transform 2.8s cubic-bezier(0.25, 0.1, 0.25, 1)';
  strips[1].style.transition = 'transform 3.2s cubic-bezier(0.25, 0.1, 0.25, 1)';
  strips[2].style.transition = 'transform 3.6s cubic-bezier(0.25, 0.1, 0.25, 1)';

  strips.forEach((strip, i) => {
    strip.style.transform = `translateY(-${1200 + (i * 120)}px)`;
  });

  // Финальная остановка
  setTimeout(() => {
    strips.forEach((strip, i) => {
      strip.innerHTML = `<div class="symbol">${final[i]}</div>`;
      strip.style.transform = 'translateY(0)';
      strip.style.transition = 'none';
    });

    reelsWrapper.classList.remove('spinning');

    // Проверка выигрыша
    checkWin(final);
  }, 3800);
};

function checkWin(result) {
  let multiplier = 0;
  let message = '';

  if (result[0] === result[1] && result[1] === result[2]) {
    if (result[0] === '7') {
      multiplier = 777;
      message = `ДЖЕКПОТ! +${currentBet * multiplier} 💰`;
      winLine.style.opacity = '1';
      winLine.classList.add('win-glow');
      Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    } else {
      multiplier = 20;
      message = `Три одинаковых! +${currentBet * multiplier} 💰`;
      winLine.style.opacity = '1';
    }
  } else if (new Set(result).size === 2) {
    multiplier = 3;
    message = `Две одинаковые! +${currentBet * multiplier} 💰`;
  } else {
    multiplier = -1;
    message = 'Не повезло...';
    Telegram.WebApp.HapticFeedback.notificationOccurred('error');
  }

  const win = currentBet * multiplier;
  window.updateBalance(win);

  resultEl.innerHTML = `<div style="color:${win > 0 ? '#ffd700' : '#ff6b6b'}">${message}</div>`;

  spinBtn.disabled = false;
}

// Управление ставкой
document.getElementById('betDown').onclick = () => {
  const idx = bets.indexOf(currentBet);
  if (idx > 0) {
    currentBet = bets[idx - 1];
    betDisplay.textContent = currentBet;
  }
};

document.getElementById('betUp').onclick = () => {
  const idx = bets.indexOf(currentBet);
  if (idx < bets.length - 1 && bets[idx + 1] <= window.currentUserBalance) {
    currentBet = bets[idx + 1];
    betDisplay.textContent = currentBet;
  }
};

// Старт
initReels();
