/**
 * Класс для управления страницей создания/редактирования записи
 */
class CreatePage {
    constructor() {
        this.editId = UI.getParameterByName('edit');
        this.isEditMode = !!this.editId;
        this.creatorId = telegramApp.getUserId() || UI.getParameterByName('user_id') || Math.floor(Math.random() * 1000000);
        
        this.init();
    }

    /**
     * Инициализация страницы
     */
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupPageTitle();
            this.setupTelegramButtons();
            this.setupAnimation();
            this.setDefaultDate();
            this.setupEventListeners();
            
            if (this.isEditMode) {
                this.loadRecordForEditing();
            }
        });
    }

    /**
     * Настройка заголовка страницы
     */
    setupPageTitle() {
        const titleElement = document.getElementById('form-title');
        if (titleElement) {
            titleElement.textContent = this.isEditMode ? 'Редактирование записи' : 'Создание новой записи';
        }
        
        // Также меняем заголовок документа
        document.title = this.isEditMode ? 'Редактирование записи' : 'Создание записи';
    }

    /**
     * Настройка кнопок Telegram
     */
    setupTelegramButtons() {
        telegramApp.setupBackButton(() => {
            window.location.href = 'index.html';
        });
        
        telegramApp.setupMainButton(
            this.isEditMode ? 'Сохранить изменения' : 'Сохранить',
            () => this.saveData()
        );
    }

    /**
     * Загрузка анимации
     */
    setupAnimation() {
        UI.loadAnimation('emblem-animation');
    }

    /**
     * Установка текущей даты по умолчанию
     */
    setDefaultDate() {
        const dateField = document.getElementById('date');
        if (dateField && !dateField.value) {
            dateField.value = UI.formatDate(new Date());
        }
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        const saveButton = document.getElementById('save-button');
        if (saveButton) {
            saveButton.addEventListener('click', () => this.saveData());
        }
        
        const previewButton = document.getElementById('preview-button');
        if (previewButton) {
            previewButton.addEventListener('click', () => this.previewData());
        }
    }

    /**
     * Загрузка записи для редактирования
     */
    loadRecordForEditing() {
        try {
            const record = db.getRecordById(this.editId);
            
            if (!record) {
                UI.showAlert('Запись не найдена');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
                return;
            }
            
            // Заполнение формы данными
            document.getElementById('username').value = record.username || '';
            document.getElementById('handle').value = record.handle || '';
            document.getElementById('date').value = record.date || '';
            document.getElementById('message').value = record.message || '';
            document.getElementById('views').value = record.views || '';
            document.getElementById('animation').value = record.animation || '';
            
        } catch (error) {
            console.error('Ошибка при загрузке данных для редактирования:', error);
            UI.showAlert('Ошибка при загрузке данных');
        }
    }

    /**
     * Сохранение данных
     */
    async saveData() {
        try {
            // Получение данных из формы
            const formData = this.getFormData();
            
            // Валидация данных
            if (!this.validateFormData(formData)) {
                return;
            }
            
            // Сохранение данных
            let savedRecord;
            
            if (this.isEditMode) {
                savedRecord = db.updateRecord(this.editId, formData);
            } else {
                savedRecord = db.saveRecord(formData);
            }
            
            // Показать уведомление со ссылкой
            const recordLink = `${window.location.origin}/view.html?id=${savedRecord.id}`;
            UI.showLinkAlert(
                this.isEditMode ? 'Запись обновлена!' : 'Запись сохранена!', 
                recordLink
            );
            
            // Отправка данных в Telegram
            try {
                telegramApp.sendData({
                    action: this.isEditMode ? 'update_record' : 'new_record',
                    record_id: savedRecord.id
                });
            } catch (e) {
                console.warn('Не удалось отправить данные в Telegram:', e);
            }
            
            // Очистка формы или перенаправление
            if (this.isEditMode) {
                // В режиме редактирования возвращаемся на главную страницу
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                // В режиме создания очищаем форму
                this.clearForm();
            }
            
        } catch (error) {
            console.error('Ошибка при сохранении данных:', error);
            UI.showAlert('Ошибка при сохранении данных');
        }
    }

    /**
     * Получение данных из формы
     * @returns {Object} Данные формы
     */
    getFormData() {
        return {
            username: document.getElementById('username').value.trim(),
            handle: document.getElementById('handle').value.trim(),
            date: document.getElementById('date').value.trim(),
            message: document.getElementById('message').value.trim(),
            views: parseInt(document.getElementById('views').value.trim() || '0'),
            animation: document.getElementById('animation').value.trim() || 'https://assets9.lottiefiles.com/packages/lf20_jhlaooj5.json',
            creator_id: this.creatorId
        };
    }

    /**
     * Валидация данных формы
     * @param {Object} formData - Данные формы
     * @returns {boolean} Валидны ли данные
     */
    validateFormData(formData) {
        if (!formData.username) {
            UI.showAlert('Пожалуйста, введите имя пользователя');
            return false;
        }
        
        if (!formData.handle) {
            UI.showAlert('Пожалуйста, введите никнейм');
            return false;
        }
        
        if (!formData.date) {
            UI.showAlert('Пожалуйста, введите дату');
            return false;
        }
        
        if (!formData.message) {
            UI.showAlert('Пожалуйста, введите сообщение');
            return false;
        }
        
        return true;
    }

    /**
     * Предпросмотр данных
     */
    previewData() {
        try {
            // Получение данных из формы
            const formData = this.getFormData();
            
            // Валидация данных
            if (!this.validateFormData(formData)) {
                return;
            }
            
            // Форматирование числа просмотров
            const formattedViews = UI.formatNumber(formData.views);
            
            // Создание HTML для предпросмотра
            const previewContent = document.getElementById('preview-content');
            previewContent.innerHTML = `
                <div class="emblem-container">
                    <div id="preview-animation" class="emblem"></div>
                </div>
                <div class="info-title">Информация о пользователе</div>
                <div class="user-info">
                    <div class="username">${formData.username}</div>
                    <div class="handle">${formData.handle}</div>
                    <div class="date">${formData.date}</div>
                    <div class="message">${formData.message}</div>
                    <div class="stats">
                        <div class="views">${formattedViews} просмотров</div>
                    </div>
                </div>
            `;
            
            // Показать контейнер предпросмотра
            document.querySelector('.preview-container').style.display = 'block';
            
            // Загрузка анимации для предпросмотра
            UI.loadAnimation('preview-animation', formData.animation);
            
            // Прокрутка к предпросмотру
            document.querySelector('.preview-container').scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            console.error('Ошибка при предпросмотре:', error);
            UI.showAlert('Ошибка при создании предпросмотра');
        }
    }

    /**
     * Очистка формы
     */
    clearForm() {
        document.getElementById('username').value = '';
        document.getElementById('handle').value = '';
        this.setDefaultDate(); // Устанавливаем текущую дату
        document.getElementById('message').value = '';
        document.getElementById('views').value = '';
        document.getElementById('animation').value = '';
        
        // Скрыть предпросмотр
        document.querySelector('.preview-container').style.display = 'none';
    }
}

// Инициализация страницы
const createPage = new CreatePage(); 