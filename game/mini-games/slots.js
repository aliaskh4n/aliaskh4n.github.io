// mini-games/slots.js — полностью рабочий слот-автомат

const symbols = ['🍒', '🍋', '🍊', '⭐', '💎', '🔔', '7'];
const reels = [document.getElementById('reel1'), document.getElementById('reel2'), document.getElementById('reel3')];
const resultEl = document.getElementById('result');
const spinBtn = document.getElementById('spinBtn');
const betDisplay = document.getElementById('currentBet');

let currentBet = 50;
const minBet = 10;
const maxBet = 500;

document.getElementById('betUp').onclick = () => {
  if (currentBet < maxBet && currentBet * 2 <= window.currentUserBalance) {
    currentBet *= 2;
    betDisplay.textContent = currentBet;
  }
};

document.getElementById('betDown').onclick = () => {
  if (currentBet > minBet) {
    currentBet = Math.max(minBet, currentBet / 2 | 0);
    betDisplay.textContent = currentBet;
  }
};

spinBtn.onclick = async () => {
  if (currentBet > window.currentUserBalance) return alert('Недостаточно средств!');

  spinBtn.disabled = true;
  spinBtn.textContent = 'КРУТИТСЯ...';
  resultEl.textContent = '';

  reels.forEach(r => r.classList.add('spinning'));

  // Имитация вращения
  let spins = 0;
  const interval = setInterval(() => {
    reels.forEach(r => r.textContent = symbols[Math.floor(Math.random() * symbols.length)]);
    spins++;
    if (spins > 20) clearInterval(interval);
  }, 80);

  // Финальные символы
  await new Promise(r => setTimeout(r, 2000));
  clearInterval(interval);
  reels.forEach(r => r.classList.remove('spinning'));

  const result = [];
  reels.forEach((r, i) => {
    const sym = symbols[Math.floor(Math.random() * symbols.length)];
    r.textContent = sym;
    result.push(sym);
  });

  // Проверка выигрыша
  let win = 0;
  let message = '';

  if (result[0] === result[1] && result[1] === result[2]) {
    if (result[0] === '7') {
      win = currentBet * 777;
      message = `ДЖЕКПОТ! +${win} 💰`;
    } else {
      win = currentBet * 10;
      message = `Три в ряд! +${win} 💰`;
    }
  } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
    win = currentBet * 2;
    message = `Две одинаковые! +${win} 💰`;
  } else {
    win = -currentBet;
    message = 'Повезёт в следующий раз 😢';
  }

  window.updateBalance(win);
  resultEl.innerHTML = `<div style="color:${win > 0 ? '#ffd700' : '#ff4444'}">${message}</div>`;

  spinBtn.disabled = false;
  spinBtn.textContent = 'КРУТИТЬ!';
};
