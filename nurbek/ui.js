/**
 * Класс для работы с пользовательским интерфейсом
 */
class UI {
    /**
     * Загрузка анимации Lottie
     * @param {string} containerId - ID контейнера для анимации
     * @param {string} animationUrl - URL анимации
     */
    static loadAnimation(containerId, animationUrl = 'https://assets9.lottiefiles.com/packages/lf20_jhlaooj5.json') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        try {
            const animation = lottie.loadAnimation({
                container: container,
                renderer: 'svg',
                loop: true,
                autoplay: true,
                path: animationUrl
            });
            
            animation.addEventListener('DOMLoaded', () => {
                container.classList.add('loaded');
            });
            
            return animation;
        } catch (error) {
            console.error('Ошибка при загрузке анимации:', error);
            return null;
        }
    }

    /**
     * Показать уведомление
     * @param {string} message - Текст уведомления
     * @param {number} duration - Длительность отображения в миллисекундах
     */
    static showAlert(message, duration = 2000) {
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
        }, duration);
    }

    /**
     * Показать уведомление со ссылкой
     * @param {string} message - Текст уведомления
     * @param {string} link - Ссылка
     * @param {number} duration - Длительность отображения в миллисекундах
     */
    static showLinkAlert(message, link, duration = 5000) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert link-alert';
        
        alertDiv.innerHTML = `
            <div class="alert-message">${message}</div>
            <div class="alert-link">${link}</div>
            <button class="alert-copy-button">Копировать ссылку</button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Добавление обработчика для кнопки копирования
        alertDiv.querySelector('.alert-copy-button').addEventListener('click', () => {
            UI.copyToClipboard(link);
            UI.showAlert('Ссылка скопирована!');
        });
        
        setTimeout(() => {
            alertDiv.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(alertDiv);
            }, 300);
        }, duration);
    }

    /**
     * Копировать текст в буфер обмена
     * @param {string} text - Текст для копирования
     * @returns {boolean} Успешно ли скопирован текст
     */
    static copyToClipboard(text) {
        try {
            // Современный способ копирования (если поддерживается)
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text);
                return true;
            }
            
            // Запасной вариант для старых браузеров
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            
            const result = document.execCommand('copy');
            document.body.removeChild(textarea);
            return result;
        } catch (error) {
            console.error('Ошибка при копировании в буфер обмена:', error);
            return false;
        }
    }

    /**
     * Форматировать число (например, для просмотров)
     * @param {number} number - Число для форматирования
     * @returns {string} Отформатированное число
     */
    static formatNumber(number) {
        return new Intl.NumberFormat('ru-RU').format(number);
    }

    /**
     * Форматировать дату
     * @param {string|Date} date - Дата для форматирования
     * @returns {string} Отформатированная дата
     */
    static formatDate(date) {
        if (!date) {
            date = new Date();
        } else if (typeof date === 'string') {
            date = new Date(date);
        }
        
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('ru-RU', options);
    }

    /**
     * Получить параметр из URL
     * @param {string} name - Имя параметра
     * @param {string} url - URL (по умолчанию текущий URL)
     * @returns {string|null} Значение параметра или null, если параметр не найден
     */
    static getParameterByName(name, url = window.location.href) {
        name = name.replace(/[\[\]]/g, '\\$&');
        const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
        const results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    /**
     * Показать индикатор загрузки
     * @param {string} containerId - ID контейнера для индикатора загрузки
     * @param {string} message - Текст сообщения
     */
    static showLoading(containerId, message = 'Загрузка...') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = `<div class="loading">${message}</div>`;
    }

    /**
     * Показать сообщение об ошибке
     * @param {string} containerId - ID контейнера для сообщения
     * @param {string} message - Текст сообщения
     */
    static showError(containerId, message = 'Произошла ошибка. Пожалуйста, попробуйте позже.') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = `<div class="error">${message}</div>`;
    }
} 