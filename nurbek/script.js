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
        document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color);
        document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color);
    }

    // Check if we need to show create form or user info
    const page = getParameterByName('page') || 'view';
    
    if (page === 'create') {
        // Load create form
        loadCreateForm();
    } else {
        // Load data from database
        loadDataFromDatabase();
        
        // Set up report link
        setupReportLink();
        
        // Setup Telegram WebApp buttons
        setupTelegramButtons();
    }
});

// Load create form
function loadCreateForm() {
    // Fetch the create form HTML
    fetch('create_form.html')
        .then(response => response.text())
        .then(html => {
            // Insert the form HTML
            document.querySelector('.content').innerHTML = html;
            
            // Initialize form functionality
            initCreateForm();
        })
        .catch(error => {
            console.error('Error loading create form:', error);
            showAlert('Ошибка загрузки формы создания');
        });
}

// Initialize create form functionality
function initCreateForm() {
    // Set current date as default
    setDefaultDate();
    
    // Set up event listeners
    setupCreateEventListeners();
    
    // Setup back button
    try {
        if (tg.BackButton) {
            tg.BackButton.show();
            tg.BackButton.onClick(function() {
                // Go back to view page
                window.location.href = 'index.html';
            });
        }
        
        if (tg.MainButton) {
            tg.MainButton.setText('Сохранить запись');
            tg.MainButton.show();
            tg.MainButton.onClick(saveData);
        }
    } catch (error) {
        console.error('Error setting up Telegram buttons:', error);
    }
}

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

// Set up event listeners for create form
function setupCreateEventListeners() {
    // Save button
    const saveButton = document.getElementById('save-button');
    if (saveButton) {
        saveButton.addEventListener('click', saveData);
    }
    
    // Preview button
    const previewButton = document.getElementById('preview-button');
    if (previewButton) {
        previewButton.addEventListener('click', previewData);
    }
    
    // Animation file input
    const animationFile = document.getElementById('animation-file');
    if (animationFile) {
        animationFile.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                document.getElementById('animation').value = e.target.files[0].name;
            }
        });
    }
}

// Setup Telegram WebApp buttons
function setupTelegramButtons() {
    try {
        // Setup main button
        if (tg.MainButton) {
            tg.MainButton.setText('Создать новую запись');
            tg.MainButton.onClick(function() {
                window.location.href = 'index.html?page=create';
            });
            tg.MainButton.show();
        }
        
        // Handle incoming data from bot if any
        tg.onEvent('viewportChanged', function() {
            // Reload data when viewport changes (e.g., when returning from another page)
            const page = getParameterByName('page') || 'view';
            if (page !== 'create') {
                loadDataFromDatabase();
            }
        });
    } catch (error) {
        console.error('Error setting up Telegram buttons:', error);
    }
}

// Function to load data from localStorage
async function loadDataFromDatabase() {
    try {
        // Get user ID from URL parameter
        const userId = getParameterByName('id') || 1; // Default to first user if no ID provided
        
        // Get data from localStorage or use default
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
            
            // Save default data to localStorage
            localStorage.setItem('database', JSON.stringify(data));
        }
        
        // Find user by ID
        const user = data.users.find(u => u.id == userId);
        
        if (user) {
            // Display user data
            displayUserData(user);
            
            // Update page title with user info
            document.title = `${user.username} - Информация`;
            
            // Add navigation if there are multiple users
            if (data.users.length > 1) {
                addUserNavigation(data.users, userId);
            }
        } else {
            console.error('User not found');
            // Display default user (first in the list)
            if (data.users.length > 0) {
                displayUserData(data.users[0]);
            }
        }
    } catch (error) {
        console.error('Error loading data:', error);
        // If error, set up default animation
        setupLottieAnimation();
    }
}

// Add navigation between users
function addUserNavigation(users, currentUserId) {
    // Convert to number for comparison
    currentUserId = parseInt(currentUserId);
    
    // Find current index
    const currentIndex = users.findIndex(u => u.id === currentUserId);
    if (currentIndex === -1) return;
    
    // Calculate prev and next indices
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : users.length - 1;
    const nextIndex = currentIndex < users.length - 1 ? currentIndex + 1 : 0;
    
    // Create navigation HTML
    const navHTML = `
        <div class="user-navigation">
            <a href="index.html?id=${users[prevIndex].id}" class="nav-button prev-button">← Предыдущий</a>
            <span class="nav-counter">${currentIndex + 1} из ${users.length}</span>
            <a href="index.html?id=${users[nextIndex].id}" class="nav-button next-button">Следующий →</a>
        </div>
    `;
    
    // Create navigation element
    const navElement = document.createElement('div');
    navElement.innerHTML = navHTML;
    
    // Add to page
    document.querySelector('.content').appendChild(navElement.firstElementChild);
}

// Function to display user data
function displayUserData(user) {
    // Format views number
    const formattedViews = user.views.toLocaleString('ru-RU');
    
    // Create HTML content
    const contentHTML = `
        <div class="emblem-container">
            <div id="emblem-animation" class="emblem"></div>
            <img src="russian_emblem.svg" class="emblem-image" style="display: none;" alt="Emblem">
        </div>
        
        <div class="info-title">❗❗ Информация ❗❗</div>
        
        <div class="user-info">
            <div class="username">${user.username}(${user.handle}) • ${user.date}</div>
            
            <div class="warning-text">
                ${user.message}
            </div>
        </div>
        
        <div class="stats">
            <div class="views">${formattedViews} просмотров</div>
        </div>
    `;
    
    // Update content
    document.querySelector('.content').innerHTML = contentHTML;
    
    // Set up Lottie animation with user's animation file
    setupLottieAnimation(user.animation);
}

// Function to set up Lottie animation
function setupLottieAnimation(customTgsUrl) {
    // Default TGS animation for the emblem
    const defaultTgsUrl = '8_BROKEN_OUT.json';
    
    // Try to load a custom TGS file if provided
    const tgsUrl = customTgsUrl || getParameterByName('tgs') || defaultTgsUrl;
    
    // Initialize Lottie animation
    const animation = lottie.loadAnimation({
        container: document.getElementById('emblem-animation'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: tgsUrl
    });
    
    // Handle animation errors
    animation.addEventListener('data_failed', function() {
        console.error('Failed to load TGS animation');
        document.querySelector('.emblem-image').style.display = 'block';
        document.getElementById('emblem-animation').style.display = 'none';
    });
    
    animation.addEventListener('data_ready', function() {
        document.querySelector('.emblem-image').style.display = 'none';
        document.getElementById('emblem-animation').style.display = 'block';
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
        showAlert('Пожалуйста, заполните все обязательные поля');
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
        showAlert('Запись успешно сохранена');
        
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
                entry_id: newId
            }));
            
            // Redirect to view the new entry
            setTimeout(() => {
                window.location.href = `index.html?id=${newId}`;
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
        showAlert('Пожалуйста, заполните все обязательные поля для предпросмотра');
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

// Set up report link
function setupReportLink() {
    // Check if report element exists
    const reportElement = document.querySelector('.report');
    if (reportElement) {
        reportElement.addEventListener('click', function() {
            showAlert('Сообщить об ошибке в превью?');
        });
    }
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

// Helper function to get URL parameters
function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Function to load custom TGS file
function loadCustomTgs(tgsUrl) {
    if (!tgsUrl) return;
    
    // Remove existing animation
    const container = document.getElementById('emblem-animation');
    container.innerHTML = '';
    
    // Create new animation
    const animation = lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: tgsUrl
    });
    
    // Handle animation errors
    animation.addEventListener('data_failed', function() {
        console.error('Failed to load custom TGS animation');
        document.querySelector('.emblem-image').style.display = 'block';
        document.getElementById('emblem-animation').style.display = 'none';
    });
    
    animation.addEventListener('data_ready', function() {
        document.querySelector('.emblem-image').style.display = 'none';
        document.getElementById('emblem-animation').style.display = 'block';
    });
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

// Expose function to global scope for external calls
window.loadCustomTgs = loadCustomTgs; 