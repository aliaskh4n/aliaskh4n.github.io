/**
 * Класс для работы с Telegram WebApp API
 */
class TelegramApp {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.init();
    }

    /**
     * Инициализация Telegram WebApp
     */
    init() {
        // Расширяем WebApp на всю высоту
        this.tg.expand();
        
        // Применяем цвета темы Telegram
        this.applyThemeColors();
    }

    /**
     * Применение цветов темы Telegram
     */
    applyThemeColors() {
        document.documentElement.style.setProperty('--tg-theme-bg-color', this.tg.themeParams.bg_color || '#ffffff');
        document.documentElement.style.setProperty('--tg-theme-text-color', this.tg.themeParams.text_color || '#000000');
        document.documentElement.style.setProperty('--tg-theme-hint-color', this.tg.themeParams.hint_color || '#999999');
        document.documentElement.style.setProperty('--tg-theme-link-color', this.tg.themeParams.link_color || '#2481cc');
        document.documentElement.style.setProperty('--tg-theme-button-color', this.tg.themeParams.button_color || '#2481cc');
        document.documentElement.style.setProperty('--tg-theme-button-text-color', this.tg.themeParams.button_text_color || '#ffffff');
        document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', this.tg.themeParams.secondary_bg_color || '#f0f0f0');
    }

    /**
     * Получить ID пользователя из Telegram WebApp
     * @returns {number|null} ID пользователя или null, если не удалось получить
     */
    getUserId() {
        if (this.tg.initDataUnsafe && this.tg.initDataUnsafe.user) {
            return this.tg.initDataUnsafe.user.id;
        }
        return null;
    }

    /**
     * Получить имя пользователя из Telegram WebApp
     * @returns {string|null} Имя пользователя или null, если не удалось получить
     */
    getUserName() {
        if (this.tg.initDataUnsafe && this.tg.initDataUnsafe.user) {
            const user = this.tg.initDataUnsafe.user;
            return user.first_name + (user.last_name ? ' ' + user.last_name : '');
        }
        return null;
    }

    /**
     * Получить username пользователя из Telegram WebApp
     * @returns {string|null} Username пользователя или null, если не удалось получить
     */
    getUserUsername() {
        if (this.tg.initDataUnsafe && this.tg.initDataUnsafe.user && this.tg.initDataUnsafe.user.username) {
            return '@' + this.tg.initDataUnsafe.user.username;
        }
        return null;
    }

    /**
     * Настройка кнопки "Назад"
     * @param {Function} callback - Функция, вызываемая при нажатии на кнопку
     */
    setupBackButton(callback) {
        this.tg.BackButton.show();
        this.tg.BackButton.onClick(callback);
    }

    /**
     * Скрыть кнопку "Назад"
     */
    hideBackButton() {
        this.tg.BackButton.hide();
    }

    /**
     * Настройка главной кнопки
     * @param {string} text - Текст кнопки
     * @param {Function} callback - Функция, вызываемая при нажатии на кнопку
     */
    setupMainButton(text, callback) {
        this.tg.MainButton.setText(text);
        this.tg.MainButton.show();
        this.tg.MainButton.onClick(callback);
    }

    /**
     * Скрыть главную кнопку
     */
    hideMainButton() {
        this.tg.MainButton.hide();
    }

    /**
     * Отправить данные в Telegram бот
     * @param {Object} data - Данные для отправки
     */
    sendData(data) {
        try {
            this.tg.sendData(JSON.stringify(data));
        } catch (error) {
            console.error('Ошибка при отправке данных в Telegram:', error);
        }
    }

    /**
     * Закрыть WebApp
     */
    close() {
        this.tg.close();
    }
}

// Экспортируем экземпляр класса для использования в других файлах
const telegramApp = new TelegramApp(); 