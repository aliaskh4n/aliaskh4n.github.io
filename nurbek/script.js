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

    // Load data from database
    loadDataFromDatabase();
    
    // Set up report link
    setupReportLink();
    
    // Setup Telegram WebApp buttons for view mode
    setupViewButtons();
});

// Setup Telegram WebApp buttons for view mode
function setupViewButtons() {
    try {
        // Hide main button in view mode
        if (tg.MainButton) {
            tg.MainButton.hide();
        }
        
        // Handle incoming data from bot if any
        tg.onEvent('viewportChanged', function() {
            // Reload data when viewport changes
            loadDataFromDatabase();
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
        
        <div class="create-button-container">
            <a href="create.html" class="create-button">Создать новую запись</a>
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