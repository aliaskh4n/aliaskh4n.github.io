<?php
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data["userId"]) || !isset($data["article"])) {
    echo json_encode(["success" => false, "message" => "Некорректные данные"]);
    exit;
}

$userId = $data["userId"];
$article = $data["article"];

$file = "articles.json";
$articles = [];

if (file_exists($file)) {
    $articles = json_decode(file_get_contents($file), true) ?? [];
}

// Добавляем новую статью в массив
$articles[] = $article;

// Сохраняем в файл
if (file_put_contents($file, json_encode($articles, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
    echo json_encode(["success" => true, "message" => "Статья сохранена"]);
} else {
    echo json_encode(["success" => false, "message" => "Ошибка сохранения"]);
}
?>