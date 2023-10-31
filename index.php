<?php
// Получаем путь из запроса
$request_uri = $_SERVER['REQUEST_URI'];

// Проверяем путь и отправляем соответствующий файл
if ($request_uri === '/aida') {
    header('aida.html');
    exit();
} elseif ($request_uri === '/nurbo') {
    header('political.html');
    exit();
} else {
    // Если путь не совпадает ни с "/math", ни с "/chem", возвращаем ошибку 404
    header("HTTP/1.0 404 Not Found");
    echo "Страница не найдена";
    exit();
}
?>
