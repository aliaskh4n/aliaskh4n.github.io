// mini-games/slots.js — идеально под твой стиль dice.html

const reels = [document.getElementById('reel1'), document.getElementById('reel2'), document.getElementById('reel3')];
const resultEl = document.getElementById('result');
const spinBtn = document.getElementById('spinBtn');
const betDisplay = document.getElementById('currentBet');

const symbols = ['🍒', '🍋', '🍊', '⭐', '💎', '🔔', '7'];
let currentBet = 50;
const betSteps = [10, 25, 50, 100, 250, 500];

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

spinBtn.onclick = async () => {
  if (currentBet > window.currentUserBalance) {
    alert('Недостаточно средств!');
    return;
  }

  spinBtn.disabled = true;
  spinBtn.textContent = 'КРУТИТСЯ...';
  resultEl.textContent = '';

  reels.forEach(r => r.classList.add('spinning'));

  Telegram.WebApp.HapticFeedback.impactOccurred('medium');

  await new Promise(r => setTimeout(r, 2000));

  reels.forEach(r => r.classList.remove('spinning'));

  const result = [];
  for (let i = 0; i < 3; i++) {
    const sym = symbols[Math.floor(Math.random() * symbols.length)];
    reels[i].textContent = sym;
    result.push(sym);
  }

  let win = 0;
  let message = '';

  if (result[0] === result[1] && result[1] === result[2]) {
    if (result[0] === '7') {
      win = currentBet * 777;
      message = `ДЖЕКПОТ! +${win} 💰`;
      Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    } else {
      win = currentBet * 20;
      message = `Три одинаковых! +${win} 💰`;
    }
  } else if (new Set(result).size === 2) {
    win = currentBet * 3;
    message = `Две одинаковые! +${win} 💰`;
  } else {
    win = -currentBet;
    message = 'Повезёт в следующий раз 😢';
    Telegram.WebApp.HapticFeedback.notificationOccurred('error');
  }

  window.updateBalance(win);
  resultEl.innerHTML = `<div style="color:${win > 0 ? '#4ade80' : '#ef4444'}">${message}</div>`;

  spinBtn.disabled = false;
  spinBtn.textContent = 'КРУТИТЬ!';
};
