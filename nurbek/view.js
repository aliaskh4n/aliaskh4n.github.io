/**
 * Класс для управления страницей просмотра записи
 */
class ViewPage {
    constructor() {
        this.recordId = UI.getParameterByName('id');
        this.record = null;
        
        this.init();
    }

    /**
     * Инициализация страницы
     */
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupTelegramButtons();
            this.loadRecordData();
            this.setupButtons();
        });
    }

    /**
     * Настройка кнопок Telegram
     */
    setupTelegramButtons() {
        telegramApp.setupBackButton(() => {
            window.location.href = 'index.html';
        });
        
        telegramApp.hideMainButton();
    }

    /**
     * Загрузка данных записи
     */
    async loadRecordData() {
        try {
            if (!this.recordId) {
                UI.showError('user-data', 'Ошибка: ID записи не указан');
                return;
            }
            
            // Получение данных записи
            this.record = db.getRecordById(this.recordId);
            
            if (!this.record) {
                UI.showError('user-data', 'Запись не найдена');
                return;
            }
            
            // Отображение данных записи
            this.displayRecordData();
            
            // Загрузка анимации
            UI.loadAnimation('emblem-animation', this.record.animation);
            
        } catch (error) {
            console.error('Ошибка при загрузке данных:', error);
            UI.showError('user-data', 'Ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
        }
    }

    /**
     * Отображение данных записи
     */
    displayRecordData() {
        const userDataContainer = document.getElementById('user-data');
        if (!userDataContainer) return;
        
        // Форматирование числа просмотров
        const formattedViews = UI.formatNumber(this.record.views);
        
        userDataContainer.innerHTML = `
            <div class="username">${this.record.username}</div>
            <div class="handle">${this.record.handle}</div>
            <div class="date">${this.record.date}</div>
            <div class="message">${this.record.message}</div>
            <div class="stats">
                <div class="views">${formattedViews} просмотров</div>
            </div>
        `;
        
        // Добавление даты создания и обновления, если они есть
        if (this.record.created_at || this.record.updated_at) {
            const metaInfo = document.createElement('div');
            metaInfo.className = 'meta-info';
            
            if (this.record.created_at) {
                const createdDate = new Date(this.record.created_at);
                metaInfo.innerHTML += `<div class="meta-item">Создано: ${createdDate.toLocaleString('ru-RU')}</div>`;
            }
            
            if (this.record.updated_at && this.record.updated_at !== this.record.created_at) {
                const updatedDate = new Date(this.record.updated_at);
                metaInfo.innerHTML += `<div class="meta-item">Обновлено: ${updatedDate.toLocaleString('ru-RU')}</div>`;
            }
            
            userDataContainer.appendChild(metaInfo);
        }
    }

    /**
     * Настройка кнопок
     */
    setupButtons() {
        // Кнопка копирования ссылки
        const copyButton = document.getElementById('copy-link-button');
        if (copyButton) {
            copyButton.addEventListener('click', () => {
                const currentUrl = window.location.href;
                if (UI.copyToClipboard(currentUrl)) {
                    UI.showAlert('Ссылка скопирована!');
                } else {
                    UI.showAlert('Не удалось скопировать ссылку');
                }
            });
        }
        
        // Кнопка редактирования
        const editButton = document.getElementById('edit-button');
        if (editButton) {
            editButton.addEventListener('click', () => {
                window.location.href = `create.html?edit=${this.recordId}`;
            });
        }
    }
}

// Инициализация страницы
const viewPage = new ViewPage(); 