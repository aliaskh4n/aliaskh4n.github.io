/**
 * Класс для управления главной страницей
 */
class IndexPage {
    constructor() {
        this.userId = telegramApp.getUserId() || UI.getParameterByName('user_id');
        this.userName = telegramApp.getUserName() || 'Гость';
        
        this.init();
    }

    /**
     * Инициализация страницы
     */
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupWelcomeMessage();
            this.loadUserRecords();
            this.setupAnimation();
            this.setupTelegramButtons();
        });
    }

    /**
     * Настройка приветственного сообщения
     */
    setupWelcomeMessage() {
        const welcomeContainer = document.getElementById('user-welcome');
        if (welcomeContainer) {
            welcomeContainer.textContent = `Добро пожаловать, ${this.userName}!`;
        }
    }

    /**
     * Настройка кнопок Telegram
     */
    setupTelegramButtons() {
        telegramApp.hideBackButton();
        telegramApp.hideMainButton();
    }

    /**
     * Загрузка анимации
     */
    setupAnimation() {
        UI.loadAnimation('emblem-animation');
    }

    /**
     * Загрузка записей пользователя
     */
    async loadUserRecords() {
        try {
            const recordsContainer = document.getElementById('user-records');
            UI.showLoading('user-records');
            
            // Получение записей пользователя
            let userRecords = [];
            if (this.userId) {
                userRecords = db.getUserRecords(this.userId);
            } else {
                userRecords = db.getAllRecords();
            }
            
            if (userRecords.length === 0) {
                recordsContainer.innerHTML = '<div class="no-records">У вас пока нет записей. Создайте новую запись!</div>';
                return;
            }
            
            // Отображение записей
            recordsContainer.innerHTML = '';
            userRecords.forEach(record => {
                const recordElement = this.createRecordElement(record);
                recordsContainer.appendChild(recordElement);
            });
        } catch (error) {
            console.error('Ошибка при загрузке записей:', error);
            UI.showError('user-records', 'Ошибка при загрузке записей. Пожалуйста, попробуйте позже.');
        }
    }

    /**
     * Создание элемента записи
     * @param {Object} record - Данные записи
     * @returns {HTMLElement} Элемент записи
     */
    createRecordElement(record) {
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
            if (UI.copyToClipboard(link)) {
                UI.showAlert('Ссылка скопирована!');
            } else {
                UI.showAlert('Не удалось скопировать ссылку');
            }
        });
        
        return recordDiv;
    }
}

// Инициализация страницы
const indexPage = new IndexPage(); 