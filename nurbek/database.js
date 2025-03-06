/**
 * Класс для работы с базой данных (localStorage)
 */
class Database {
    constructor() {
        this.storageKey = 'userRecords';
    }

    /**
     * Получить все записи из базы данных
     * @returns {Array} Массив всех записей
     */
    getAllRecords() {
        try {
            const records = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
            return records;
        } catch (error) {
            console.error('Ошибка при получении данных из localStorage:', error);
            return [];
        }
    }

    /**
     * Получить записи конкретного пользователя
     * @param {number|string} userId - ID пользователя
     * @returns {Array} Массив записей пользователя
     */
    getUserRecords(userId) {
        if (!userId) return [];
        
        const records = this.getAllRecords();
        return records.filter(record => record.creator_id === userId);
    }

    /**
     * Получить запись по ID
     * @param {number|string} recordId - ID записи
     * @returns {Object|null} Объект записи или null, если запись не найдена
     */
    getRecordById(recordId) {
        if (!recordId) return null;
        
        const records = this.getAllRecords();
        return records.find(record => record.id === parseInt(recordId)) || null;
    }

    /**
     * Сохранить новую запись
     * @param {Object} recordData - Данные записи
     * @returns {Object} Сохраненная запись с присвоенным ID
     */
    saveRecord(recordData) {
        try {
            const records = this.getAllRecords();
            
            // Создаем новую запись с уникальным ID
            const newRecord = {
                ...recordData,
                id: Date.now(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            // Добавляем запись в массив
            records.push(newRecord);
            
            // Сохраняем обновленный массив
            localStorage.setItem(this.storageKey, JSON.stringify(records));
            
            return newRecord;
        } catch (error) {
            console.error('Ошибка при сохранении записи:', error);
            throw new Error('Не удалось сохранить запись');
        }
    }

    /**
     * Обновить существующую запись
     * @param {number|string} recordId - ID записи
     * @param {Object} recordData - Новые данные записи
     * @returns {Object} Обновленная запись
     */
    updateRecord(recordId, recordData) {
        try {
            const records = this.getAllRecords();
            const index = records.findIndex(record => record.id === parseInt(recordId));
            
            if (index === -1) {
                throw new Error('Запись не найдена');
            }
            
            // Обновляем запись, сохраняя ID и дату создания
            const updatedRecord = {
                ...recordData,
                id: records[index].id,
                creator_id: records[index].creator_id,
                created_at: records[index].created_at,
                updated_at: new Date().toISOString()
            };
            
            // Заменяем старую запись на обновленную
            records[index] = updatedRecord;
            
            // Сохраняем обновленный массив
            localStorage.setItem(this.storageKey, JSON.stringify(records));
            
            return updatedRecord;
        } catch (error) {
            console.error('Ошибка при обновлении записи:', error);
            throw new Error('Не удалось обновить запись');
        }
    }

    /**
     * Удалить запись
     * @param {number|string} recordId - ID записи
     * @returns {boolean} Успешно ли удалена запись
     */
    deleteRecord(recordId) {
        try {
            const records = this.getAllRecords();
            const filteredRecords = records.filter(record => record.id !== parseInt(recordId));
            
            // Если количество записей не изменилось, значит запись не найдена
            if (records.length === filteredRecords.length) {
                return false;
            }
            
            // Сохраняем обновленный массив
            localStorage.setItem(this.storageKey, JSON.stringify(filteredRecords));
            
            return true;
        } catch (error) {
            console.error('Ошибка при удалении записи:', error);
            return false;
        }
    }

    /**
     * Очистить все записи
     * @returns {boolean} Успешно ли очищена база данных
     */
    clearAllRecords() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Ошибка при очистке базы данных:', error);
            return false;
        }
    }
}

// Экспортируем экземпляр класса для использования в других файлах
const db = new Database();