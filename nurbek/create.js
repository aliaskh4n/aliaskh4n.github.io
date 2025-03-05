// Initialize Telegram WebApp
let tg = window.Telegram.WebApp;

// Expand to the maximum available height
tg.expand();

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Apply Telegram theme colors if available
    if (tg.themeParams) {
        document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color);
        document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color);
        document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color);
        document.documentElement.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color);
        document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color);
    }

    // Set current date as default
    setDefaultDate();

    // Set up event listeners
    setupEventListeners();
});

// Set default date in the format "DD месяца YYYY г."
function setDefaultDate() {
    const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    
    const now = new Date();
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    
    const formattedDate = `${day} ${month} ${year} г.`;
    document.getElementById('date').value = formattedDate;
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

// Save data to database.json
async function saveData() {
    // Get form values
    const username = document.getElementById('username').value.trim();
    const handle = document.getElementById('handle').value.trim();
    const date = document.getElementById('date').value.trim();
    const message = document.getElementById('message').value.trim();
    const views = parseInt(document.getElementById('views').value) || 0;
    const animation = document.getElementById('animation').value.trim();
    
    // Validate form
    if (!username || !handle || !date || !message) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
    }
    
    try {
        // Get current database from localStorage or create new one
        let data;
        const storedData = localStorage.getItem('database');
        
        if (storedData) {
            data = JSON.parse(storedData);
        } else {
            // Initialize with default data
            data = {
                "users": [
                    {
                        "id": 1,
                        "username": "Aliaskhan",
                        "handle": "@al1askh4n",
                        "date": "12 марта 2024 г.",
                        "message": "У этого пользователя разбито сердце другом, потому что он лох. Анимация разбитого сердце символизирует его разбитое сердце и душевную боль.",
                        "views": 922056,
                        "animation": "8_BROKEN_OUT.json"
                    }
                ]
            };
        }
        
        // Generate new ID
        const newId = data.users.length > 0 
            ? Math.max(...data.users.map(user => user.id)) + 1 
            : 1;
        
        // Create new user entry
        const newUser = {
            id: newId,
            username,
            handle,
            date,
            message,
            views,
            animation: animation || '8_BROKEN_OUT.json' // Default animation if none provided
        };
        
        // Add to database
        data.users.push(newUser);
        
        // Save updated database to localStorage
        await saveToDatabase(data);
        
        // Show success message
        alert('Запись успешно сохранена');
        
        // Clear form
        clearForm();
        
    } catch (error) {
        console.error('Error saving data:', error);
        alert('Ошибка при сохранении данных');
    }
}

// Save data to localStorage
async function saveToDatabase(data) {
    try {
        // Save to localStorage
        localStorage.setItem('database', JSON.stringify(data));
        return { success: true };
    } catch (error) {
        console.error('Error saving to database:', error);
        throw error;
    }
}

// Preview the data
function previewData() {
    // Get form values
    const username = document.getElementById('username').value.trim();
    const handle = document.getElementById('handle').value.trim();
    const date = document.getElementById('date').value.trim();
    const message = document.getElementById('message').value.trim();
    const views = parseInt(document.getElementById('views').value) || 0;
    
    // Validate form
    if (!username || !handle || !date || !message) {
        alert('Пожалуйста, заполните все обязательные поля для предпросмотра');
        return;
    }
    
    // Format views number
    const formattedViews = views.toLocaleString('ru-RU');
    
    // Create preview HTML
    const previewHTML = `
        <div class="emblem-container">
            <div id="preview-animation" class="emblem"></div>
        </div>
        
        <div class="info-title">❗❗ Информация ❗❗</div>
        
        <div class="user-info">
            <div class="username">${username}(${handle}) • ${date}</div>
            
            <div class="warning-text">
                ${message}
            </div>
        </div>
        
        <div class="stats">
            <div class="views">${formattedViews} просмотров</div>
        </div>
    `;
    
    // Update preview content
    document.getElementById('preview-content').innerHTML = previewHTML;
    
    // Show preview container
    document.querySelector('.preview-container').style.display = 'block';
    
    // Load animation
    const animationFile = document.getElementById('animation').value.trim() || '8_BROKEN_OUT.json';
    loadPreviewAnimation(animationFile);
    
    // Scroll to preview
    document.querySelector('.preview-container').scrollIntoView({ behavior: 'smooth' });
}

// Load animation for preview
function loadPreviewAnimation(animationFile) {
    // Initialize Lottie animation
    const animation = lottie.loadAnimation({
        container: document.getElementById('preview-animation'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: animationFile
    });
    
    // Handle animation errors
    animation.addEventListener('data_failed', function() {
        console.error('Failed to load TGS animation for preview');
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
    
    // Hide preview
    document.querySelector('.preview-container').style.display = 'none';
} 