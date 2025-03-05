// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;

// Expand to the maximum available height
tg.expand();

// Apply Telegram theme colors if available
document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#999999');
document.documentElement.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color || '#2481cc');
document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#2481cc');
document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#f0f0f0');

// Get parameters from URL
const editId = getParameterByName('edit');
let isEditMode = !!editId;

// Get user_id from Telegram WebApp or from URL
let creatorId = null;
if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
    creatorId = tg.initDataUnsafe.user.id;
} else {
    // For testing, you can use a URL parameter
    creatorId = getParameterByName('user_id') || Math.floor(Math.random() * 1000000);
}

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Set current date as default
    setDefaultDate();
    
    // Set up event listeners
    setupEventListeners();
    
    // Setup Telegram WebApp buttons
    setupTelegramButtons();
    
    if (isEditMode) {
        loadRecordForEditing(editId);
    }
});

// Setup Telegram WebApp buttons
function setupTelegramButtons() {
    try {
        // Setup back button
        if (tg.BackButton) {
            tg.BackButton.show();
            tg.BackButton.onClick(function() {
                // Go back to view page
                window.location.href = 'index.html';
            });
        }
        
        // Setup main button
        if (tg.MainButton) {
            tg.MainButton.setText(isEditMode ? 'Сохранить изменения' : 'Сохранить');
            tg.MainButton.show();
            tg.MainButton.onClick(saveData);
        }
    } catch (error) {
        console.error('Error setting up Telegram buttons:', error);
    }
}

// Set default date in the format "DD месяца YYYY г."
function setDefaultDate() {
    const dateField = document.getElementById('date');
    if (!dateField.value) {
        const now = new Date();
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        const formattedDate = now.toLocaleDateString('ru-RU', options);
        dateField.value = formattedDate;
    }
}

// Set up event listeners for buttons
function setupEventListeners() {
    // Save button
    document.getElementById('save-button').addEventListener('click', saveData);
    
    // Preview button
    document.getElementById('preview-button').addEventListener('click', previewData);
    
    // Animation file input
    document.getElementById('animation-file').addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            document.getElementById('animation').value = e.target.files[0].name;
        }
    });
}

// Save data to database
async function saveData() {
    try {
        // Get form values
        const username = document.getElementById('username').value.trim();
        const handle = document.getElementById('handle').value.trim();
        const date = document.getElementById('date').value.trim();
        const message = document.getElementById('message').value.trim();
        const views = parseInt(document.getElementById('views').value.trim() || '0');
        const animation = document.getElementById('animation').value.trim();
        
        // Validate form
        if (!username || !handle || !date || !message) {
            showAlert('Пожалуйста, заполните все обязательные поля');
            return;
        }
        
        // Create new user entry
        const userData = {
            username,
            handle,
            date,
            message,
            views,
            animation: animation || 'https://assets9.lottiefiles.com/packages/lf20_jhlaooj5.json',
            creator_id: creatorId
        };
        
        // Save to database
        const savedRecord = await saveToDatabase(userData);
        
        // Show success message
        const recordLink = `${window.location.origin}/view.html?id=${savedRecord.id}`;
        showLinkAlert('Запись сохранена!', recordLink);
        
        // Clear form
        clearForm();
        
        // Notify Telegram WebApp that data was saved
        try {
            if (tg.MainButton) {
                tg.MainButton.setText('Запись сохранена');
                setTimeout(() => {
                    tg.MainButton.setText('Сохранить запись');
                }, 2000);
            }
            
            // Send data to Telegram Bot if needed
            tg.sendData(JSON.stringify({
                action: 'new_entry',
                entry_id: savedRecord.id
            }));
            
            // Redirect to view the new entry
            setTimeout(() => {
                window.location.href = `index.html?id=${savedRecord.id}`;
            }, 1500);
        } catch (error) {
            console.error('Error interacting with Telegram WebApp:', error);
        }
        
    } catch (error) {
        console.error('Error saving data:', error);
        showAlert('Ошибка при сохранении данных');
    }
}

// Save data to localStorage
async function saveToDatabase(data) {
    try {
        // Get existing data
        const usersData = JSON.parse(localStorage.getItem('users') || '[]');
        
        if (isEditMode) {
            // Update existing record
            const index = usersData.findIndex(u => u.id === parseInt(editId));
            if (index !== -1) {
                data.id = parseInt(editId);
                usersData[index] = data;
            } else {
                throw new Error('Record for editing not found');
            }
        } else {
            // Create new record
            data.id = Date.now(); // Use timestamp as ID
            usersData.push(data);
        }
        
        // Save updated data
        localStorage.setItem('users', JSON.stringify(usersData));
        
        return data;
    } catch (error) {
        console.error('Error saving to database:', error);
        throw error;
    }
}

// Preview the data
function previewData() {
    try {
        // Get form values
        const username = document.getElementById('username').value.trim();
        const handle = document.getElementById('handle').value.trim();
        const date = document.getElementById('date').value.trim();
        const message = document.getElementById('message').value.trim();
        const views = parseInt(document.getElementById('views').value.trim() || '0');
        
        // Validate form
        if (!username || !handle || !date || !message) {
            showAlert('Пожалуйста, заполните все обязательные поля для предпросмотра');
            return;
        }
        
        // Format views number
        const formattedViews = new Intl.NumberFormat('ru-RU').format(views);
        
        // Create preview HTML
        const previewContent = document.getElementById('preview-content');
        previewContent.innerHTML = `
            <div class="emblem-container">
                <div id="preview-animation" class="emblem"></div>
            </div>
            
            <div class="info-title">Информация о пользователе</div>
            
            <div class="user-info">
                <div class="username">${username}</div>
                <div class="handle">${handle}</div>
                <div class="date">${date}</div>
                <div class="message">${message}</div>
                <div class="stats">
                    <div class="views">${formattedViews} просмотров</div>
                </div>
            </div>
        `;
        
        // Show preview container
        document.querySelector('.preview-container').style.display = 'block';
        
        // Load animation
        const animationFile = document.getElementById('animation').value.trim() || 'https://assets9.lottiefiles.com/packages/lf20_jhlaooj5.json';
        loadPreviewAnimation(animationFile);
        
        // Scroll to preview
        document.querySelector('.preview-container').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error previewing data:', error);
        showAlert('Ошибка при создании предпросмотра');
    }
}

// Load animation for preview
function loadPreviewAnimation(animationFile) {
    const tgsUrl = animationFile || 'https://assets9.lottiefiles.com/packages/lf20_jhlaooj5.json';
    
    const animation = lottie.loadAnimation({
        container: document.getElementById('preview-animation'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: tgsUrl
    });
    
    animation.addEventListener('DOMLoaded', () => {
        document.getElementById('preview-animation').classList.add('loaded');
    });
}

// Clear form fields
function clearForm() {
    document.getElementById('username').value = '';
    document.getElementById('handle').value = '';
    setDefaultDate(); // Reset to current date
    document.getElementById('message').value = '';
    document.getElementById('views').value = '';
    document.getElementById('animation').value = '';
    document.getElementById('animation-file').value = '';
    
    // Hide preview
    document.querySelector('.preview-container').style.display = 'none';
}

// Helper function to get URL parameters
function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Show alert with fallback to standard alert
function showAlert(message) {
    try {
        tg.showPopup({
            title: 'Уведомление',
            message: message,
            buttons: [{type: 'ok'}]
        });
    } catch (error) {
        alert(message);
    }
}

// Show link alert
function showLinkAlert(message, link) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert link-alert';
    
    alertDiv.innerHTML = `
        <div class="alert-message">${message}</div>
        <div class="alert-link">${link}</div>
        <button class="alert-copy-button">Копировать ссылку</button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Add copy button event listener
    alertDiv.querySelector('.alert-copy-button').addEventListener('click', () => {
        copyToClipboard(link);
        showAlert('Ссылка скопирована!');
    });
    
    setTimeout(() => {
        alertDiv.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(alertDiv);
        }, 300);
    }, 5000);
}

// Copy text to clipboard
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        console.log('Text copied to clipboard');
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
    
    document.body.removeChild(textarea);
}

// Load record for editing
function loadRecordForEditing(id) {
    try {
        // Get data from localStorage
        const usersData = JSON.parse(localStorage.getItem('users') || '[]');
        const record = usersData.find(u => u.id === parseInt(id));
        
        if (!record) {
            showAlert('Запись не найдена');
            return;
        }
        
        // Fill form with data
        document.getElementById('username').value = record.username || '';
        document.getElementById('handle').value = record.handle || '';
        document.getElementById('date').value = record.date || '';
        document.getElementById('message').value = record.message || '';
        document.getElementById('views').value = record.views || '';
        document.getElementById('animation').value = record.animation || '';
        
    } catch (error) {
        console.error('Error loading record for editing:', error);
        showAlert('Ошибка при загрузке данных');
    }
} 