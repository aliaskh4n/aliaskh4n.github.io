import { DOM } from './DOM.js';
import { Requester } from './Requester.js';

import { wins_reload_interval, reload_interval, games_path } from './constants.js';

// ========== STATE AND DOM ==========
const app = {
    state: {
        user: null,
        token: null,
        tg: window.Telegram.WebApp,
    },
    dom: {
        container:  DOM.document_get_id('games-container'),
        balance:    DOM.document_get_id('balance'),
        userMenu:   DOM.document_get_id('user-menu'),
        userAvatar: DOM.document_get_id('user-avatar'),
        winsScroll: DOM.document_get_id('wins-scroll'),
    }
};

const medals = ['🥇', '🥈', '🥉', '⭐', '✨', '💫', '🌟', '💎', '👑', '🏆'];
const requester = new Requester(app);

const set_avatar_text = () => {
    app.dom.userAvatar.innerHTML = `<div class="user-avatar-placeholder">${app.state.user.name?.charAt(0).toUpperCase() || '👤'}</div>`;
}

const load_leaderboard = async () => {
    try {
        const res = await requester.send_request('/stats/leaderboard');

        if (!res.leaderboard || res.leaderboard.length === 0) {
            app.dom.winsScroll.innerHTML = '<div class="win-empty">Нет игроков</div>';
            return;
        }

        const richestPlayers = res.leaderboard.slice(0, 10);

        if (richestPlayers.length === 0) {
            app.dom.winsScroll.innerHTML = '<div class="win-empty">Нет данных</div>';
            return;
        }
        
        app.dom.winsScroll.innerHTML = richestPlayers.map((player, i) => {
            const medal = medals[i];
            let avatar = `<span>${ player.name?.charAt(0).toUpperCase() || '👤' }</span>`;

            if(player.photo_url) {
                avatar = `<img src="${ player.photo_url }" alt="${ player.name }" onerror="this.style.display='none'">`;
            }

            return `
                <div class="win-card">
                    <div class="win-medal">${medal}</div>
                    <div class="win-avatar">${avatar}</div>
                    <div class="win-player">${player.name}</div>
                    <div class="win-amount">💰 ${player.balance.toLocaleString()}</div>
                </div>
            `;
            }).join('');

    } catch (e) {
        console.error('Wins load error:', e);
        app.dom.winsScroll.innerHTML = '<div class="win-empty">Ошибка загрузки</div>';
    }
}

const update_ui = () => {
    app.dom.balance.textContent = app.state.user.balance.toLocaleString();

    const avatar = app.dom.userAvatar;

    if (app.state.user.photo_url) {
        const img = document.createElement('img');
        img.src = app.state.user.photo_url;
        img.onerror = set_avatar_text;

        avatar.innerHTML = '';
        avatar.appendChild(img);
    } else set_avatar_text();

    app.dom.userMenu.onclick = () => app.state.tg.showAlert(
        `👤 ${app.state.user.name}\n` + 
        `💰 ${app.state.user.balance}\n` +
        `🎮 ${app.state.user.gamesPlayed}\n` +
        `🏆 ${app.state.user.gamesWon}`
    );
}

const auth = async () => {
    try {
        app.dom.container.innerHTML = '<div class="message"><div class="loading-spinner"></div></div>';

        const res = await requester.send_request('/auth/init', 'POST', { initData: app.state.tg.initData });

        app.state.user = res.user;
        app.state.token = res.token;

        localStorage.setItem('token',           app.state.token);
        localStorage.setItem('user_id',         app.state.user.id);
        localStorage.setItem('user_balance',    app.state.user.balance);

        update_ui();
        load_games();
        load_leaderboard();

        setInterval(load_games, reload_interval);
        setInterval(load_leaderboard, wins_reload_interval);
    } catch (e) {
        app.dom.container.innerHTML = `<div class="message">⌛ ${e.message}</div>`;
    }
}

const create_card = (g) => {
    const ready = g.ready !== false;
    const style = g.gradient ? `--g1: ${g.gradient[0]}; --g2: ${g.gradient[1]};` : '';

    return `
    <div class="game-card ${!ready ? 'disabled' : ''}">
        <a href="${ready ? `./mini-games/${g.id}.html` : '#'}"
            class="game-link"
            ${ready ? '' : 'onclick="return false"'}>
            
        <div class="game-thumb" style="${style}">
            <div class="game-lottie" id="lottie-${g.id}"></div>
        </div>

        <div class="game-info">
            <div class="game-title">${g.title}</div>
            <div class="game-desc">${g.desc}</div>
        </div>

        ${!ready ? '<div class="soon-badge">SOON</div>' : ''}
        </a>
    </div>
    `;
}

// ========== LOAD GAMES + LOTTIE ==========
const load_games = async () => {
    try {
        const res = await fetch(`${games_path}?t=${Date.now()}`);
        const games = await res.json();

        if (!games?.length) {
            app.dom.container.innerHTML = '<div class="message">Нет игр</div>';
            return;
        }

        app.dom.container.innerHTML = games.map(create_card).join('');

        // Подключение Lottie-анимаций
        games.forEach(g => {
            if (g.animation) {
                const container = document.getElementById(`lottie-${g.id}`);

                if (container) {
                    lottie.loadAnimation({
                        container,
                        renderer: "svg",
                        loop: true,
                        autoplay: true,
                        path: g.animation
                    });
                }
            }
        });

    } catch (e) {
        console.log(e.message);
        
        app.dom.container.innerHTML = `<div class="message">⌛ ${e.message}</div>`;
    }
}

// ========== START ==========
app.state.tg.ready();
app.state.tg.expand();

auth();