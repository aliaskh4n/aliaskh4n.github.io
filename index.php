<?php

// Устанавливаем правильный заголовок
header("Content-Type: text/html");

// Получаем запрашиваемый URI
$request_uri = trim($_SERVER['REQUEST_URI'], '/');

// Формируем путь к файлу
$file_path = __DIR__ . '/' . $request_uri . '.html';

// Проверяем существование файла и выводим его содержимое
if (file_exists($file_path)) {
    readfile($file_path);
} else {
    http_response_code(404);
    echo "Файл не найден";
}

?>
