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

// Получение user_id из Telegram WebApp или из параметров URL
let currentUserId = null;
if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
    currentUserId = tg.initDataUnsafe.user.id;
} else {
    // Для тестирования можно использовать параметр URL
    currentUserId = getParameterByName('user_id');
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    setupLottieAnimation();
    loadUserRecords();
    setupTelegramButtons();
});

// Настройка кнопок Telegram
function setupTelegramButtons() {
    tg.BackButton.hide();
    tg.MainButton.hide();
}

// Загрузка анимации
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

// Загрузка записей пользователя
async function loadUserRecords() {
    try {
        const recordsContainer = document.getElementById('user-records');
        recordsContainer.innerHTML = '<div class="loading">Загрузка записей...</div>';
        
        // Получение данных из localStorage
        const usersData = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Если currentUserId не задан, показываем все записи
        let userRecords = [];
        if (currentUserId) {
            userRecords = usersData.filter(user => user.creator_id === currentUserId);
        } else {
            userRecords = usersData;
        }
        
        if (userRecords.length === 0) {
            recordsContainer.innerHTML = '<div class="no-records">У вас пока нет записей. Создайте новую запись!</div>';
            return;
        }
        
        // Отображение записей
        recordsContainer.innerHTML = '';
        userRecords.forEach(record => {
            const recordElement = createRecordElement(record);
            recordsContainer.appendChild(recordElement);
        });
    } catch (error) {
        console.error('Ошибка при загрузке записей:', error);
        document.getElementById('user-records').innerHTML = 
            '<div class="error">Ошибка при загрузке записей. Пожалуйста, попробуйте позже.</div>';
    }
}

// Создание элемента записи
function createRecordElement(record) {
    const recordDiv = document.createElement('div');
    recordDiv.className = 'record-item';
    
    const recordLink = `${window.location.origin}/view.html?id=${record.id}`;
    
    recordDiv.innerHTML = `
        <div class="record-info">
            <div class="record-username">${record.username}</div>
            <div class="record-handle">${record.handle}</div>
            <div class="record-date">${record.date}</div>
        </div>
        <div class="record-actions">
            <button class="record-button view" data-id="${record.id}">Просмотр</button>
            <button class="record-button edit" data-id="${record.id}">Редактировать</button>
            <button class="record-button copy" data-link="${recordLink}">Копировать ссылку</button>
        </div>
    `;
    
    // Добавление обработчиков событий
    recordDiv.querySelector('.record-button.view').addEventListener('click', () => {
        window.location.href = `view.html?id=${record.id}`;
    });
    
    recordDiv.querySelector('.record-button.edit').addEventListener('click', () => {
        window.location.href = `create.html?edit=${record.id}`;
    });
    
    recordDiv.querySelector('.record-button.copy').addEventListener('click', (e) => {
        const link = e.target.getAttribute('data-link');
        copyToClipboard(link);
        showAlert('Ссылка скопирована!');
    });
    
    return recordDiv;
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