<?php
// Определяем, какой страницей управлять (по умолчанию главная)
$page = isset($_GET['page']) ? $_GET['page'] : 'main';

// Обработка API-запросов
if ($page === 'api') {
    header('Content-Type: application/json');
    
    $action = isset($_GET['action']) ? $_GET['action'] : '';
    $data_file = 'data.json';
    
    // Функция для чтения данных из JSON-файла
    function read_data() {
        global $data_file;
        if (file_exists($data_file)) {
            $json_data = file_get_contents($data_file);
            return json_decode($json_data, true);
        }
        return [];
    }
    
    // Функция для записи данных в JSON-файл
    function write_data($data) {
        global $data_file;
        $json_data = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        return file_put_contents($data_file, $json_data);
    }
    
    // Получение всех заказов
    if ($action === 'get_orders') {
        echo json_encode(read_data());
        exit;
    }
    
    // Получение отдельного заказа
    else if ($action === 'get_order' && isset($_GET['id'])) {
        $orders = read_data();
        $order_id = (int)$_GET['id'];
        
        foreach ($orders as $order) {
            if ($order['id'] === $order_id) {
                echo json_encode($order);
                exit;
            }
        }
        
        http_response_code(404);
        echo json_encode(['error' => 'Заказ не найден']);
        exit;
    }
    
    // Создание нового заказа
    else if ($action === 'create_order' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || !isset($input['name']) || !isset($input['status'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Некорректные данные']);
            exit;
        }
        
        $orders = read_data();
        
        // Определяем новый ID
        $max_id = 0;
        foreach ($orders as $order) {
            if ($order['id'] > $max_id) {
                $max_id = $order['id'];
            }
        }
        
        $input['id'] = $max_id + 1;
        $orders[] = $input;
        
        if (write_data($orders)) {
            echo json_encode($input);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Не удалось сохранить данные']);
        }
        exit;
    }
    
    // Обновление заказа
    else if ($action === 'update_order' && isset($_GET['id']) && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            http_response_code(400);
            echo json_encode(['error' => 'Некорректные данные']);
            exit;
        }
        
        $orders = read_data();
        $order_id = (int)$_GET['id'];
        $updated = false;
        
        for ($i = 0; $i < count($orders); $i++) {
            if ($orders[$i]['id'] === $order_id) {
                $input['id'] = $order_id; // Сохраняем исходный ID
                $orders[$i] = $input;
                $updated = true;
                break;
            }
        }
        
        if ($updated) {
            if (write_data($orders)) {
                echo json_encode($input);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Не удалось сохранить данные']);
            }
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Заказ не найден']);
        }
        exit;
    }
    
    // Удаление заказа
    else if ($action === 'delete_order' && isset($_GET['id'])) {
        $orders = read_data();
        $order_id = (int)$_GET['id'];
        $deleted = false;
        
        for ($i = 0; $i < count($orders); $i++) {
            if ($orders[$i]['id'] === $order_id) {
                array_splice($orders, $i, 1);
                $deleted = true;
                break;
            }
        }
        
        if ($deleted) {
            if (write_data($orders)) {
                echo json_encode(['success' => true]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Не удалось сохранить данные']);
            }
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Заказ не найден']);
        }
        exit;
    }
    
    // Неизвестное действие
    else {
        http_response_code(400);
        echo json_encode(['error' => 'Неизвестное действие']);
        exit;
    }
}

// Отображение нужной страницы
if ($page === 'admin') {
    // Страница администратора
    include 'admin_page.php';
} else {
    // Главная страница
    include 'main_page.php';
}
?>
