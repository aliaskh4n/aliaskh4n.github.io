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

    // Set up Lottie animation for the emblem
    setupLottieAnimation();
    
    // Set up report link
    setupReportLink();
});

// Function to set up Lottie animation
function setupLottieAnimation() {
    // Default TGS animation for the emblem
    const defaultTgsUrl = 'https://assets9.lottiefiles.com/packages/lf20_jR229r.json';
    
    // Try to load a custom TGS file if provided
    const customTgsUrl = getParameterByName('tgs');
    const tgsUrl = customTgsUrl || defaultTgsUrl;
    
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
    // Error report link
    document.querySelector('.report').addEventListener('click', function() {
        tg.showConfirm('Сообщить об ошибке в превью?', function(confirmed) {
            if (confirmed) {
                tg.showAlert('Спасибо за сообщение об ошибке');
            }
        });
    });
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

// Expose function to global scope for external calls
window.loadCustomTgs = loadCustomTgs; 