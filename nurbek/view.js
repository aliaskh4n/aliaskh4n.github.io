// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// Применение цветов темы Telegram
document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#999999');
document.documentElement.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color || '#2481cc');
document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#2481cc');
document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#f0f0f0');

// Получение ID записи из URL
const recordId = getParameterByName('id');

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    setupTelegramButtons();
    loadRecordData();
    setupCopyLinkButton();
});

// Настройка кнопок Telegram
function setupTelegramButtons() {
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
        window.location.href = 'index.html';
    });
    
    tg.MainButton.hide();
}

// Загрузка данных записи
async function loadRecordData() {
    try {
        if (!recordId) {
            document.getElementById('user-data').innerHTML = 
                '<div class="error">Ошибка: ID записи не указан</div>';
            return;
        }
        
        // Получение данных из localStorage
        const usersData = JSON.parse(localStorage.getItem('users') || '[]');
        const user = usersData.find(u => u.id === parseInt(recordId));
        
        if (!user) {
            document.getElementById('user-data').innerHTML = 
                '<div class="error">Запись не найдена</div>';
            return;
        }
        
        // Отображение данных пользователя
        displayUserData(user);
        
        // Загрузка анимации
        setupLottieAnimation(user.animation);
        
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        document.getElementById('user-data').innerHTML = 
            '<div class="error">Ошибка при загрузке данных. Пожалуйста, попробуйте позже.</div>';
    }
}

// Отображение данных пользователя
function displayUserData(user) {
    const userDataContainer = document.getElementById('user-data');
    
    // Форматирование числа просмотров
    const formattedViews = new Intl.NumberFormat('ru-RU').format(user.views);
    
    userDataContainer.innerHTML = `
        <div class="username">${user.username}</div>
        <div class="handle">${user.handle}</div>
        <div class="date">${user.date}</div>
        <div class="message">${user.message}</div>
        <div class="stats">
            <div class="views">${formattedViews} просмотров</div>
        </div>
    `;
}

// Настройка анимации
function setupLottieAnimation(customTgsUrl = null) {
    const tgsUrl = customTgsUrl || 'https://assets9.lottiefiles.com/packages/lf20_jhlaooj5.json';
    
    const animation = lottie.loadAnimation({
        container: document.getElementById('emblem-animation'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: tgsUrl
    });
    
    animation.addEventListener('DOMLoaded', () => {
        document.getElementById('emblem-animation').classList.add('loaded');
    });
}

// Настройка кнопки копирования ссылки
function setupCopyLinkButton() {
    const copyButton = document.getElementById('copy-link-button');
    
    copyButton.addEventListener('click', () => {
        const currentUrl = window.location.href;
        copyToClipboard(currentUrl);
        showAlert('Ссылка скопирована!');
    });
}

// Функция для копирования в буфер обмена
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        console.log('Текст скопирован в буфер обмена');
    } catch (err) {
        console.error('Не удалось скопировать текст: ', err);
    }
    
    document.body.removeChild(textarea);
}

// Показать уведомление
function showAlert(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert';
    alertDiv.textContent = message;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(alertDiv);
        }, 300);
    }, 2000);
}

// Получение параметра из URL
function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
} 