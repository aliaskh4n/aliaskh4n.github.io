<?php

// Получаем запрошенный путь
$requestPath = $_SERVER['REQUEST_URI'];

// Обрабатываем различные ссылки
switch ($requestPath) {
    case '/main':
        $response = 'Это главная страница';
        break;
    case '/home':
        $response = 'Добро пожаловать на домашнюю страницу';
        break;
    default:
        $response = '404 Страница не найдена';
        break;
}

// Возвращаем ответ
echo $response;

?>
