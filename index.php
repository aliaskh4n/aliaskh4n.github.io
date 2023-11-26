<?php
// Получаем текущий путь из URL
$current_path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Преобразуем путь в название файла (например, /psihology превращается в psyhology.html)
$file_name = trim($current_path, '/').'.html';

// Полный путь к файлу
$file_path = __DIR__.'/'.$file_name;

// Проверяем существование файла
if (file_exists($file_path)) {
    // Открываем файл
    include($file_path);
} else {
    // Выводим сообщение об ошибке, если файл не найден
    echo '404 Not Found';
}
?>
