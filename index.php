<?php
// Получаем путь из запроса
$request_uri = $_SERVER['REQUEST_URI'];

// Проверяем путь и отправляем соответствующий файл
if ($request_uri === '/aida') {
    header('index.html');
    exit();
} elseif ($request_uri === '/nurbo') {
    header('political.html');
    exit();
} else {
    header("HTTP/1.0 404 Not Found");
    echo "Страница не найдена";
    exit();
}
?>
