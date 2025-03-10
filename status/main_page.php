<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Система отслеживания заказов</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        
        h1 {
            color: #333;
            text-align: center;
        }
        
        .admin-link {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .orders-container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 20px;
        }
        
        .order {
            border: 1px solid #ddd;
            border-radius: 5px;
            margin-bottom: 15px;
            background-color: #fff;
            position: relative;
        }
        
        .order-header {
            display: flex;
            align-items: center;
            padding: 10px 15px;
            background-color: #f9f9f9;
            border-top-left-radius: 5px;
            border-top-right-radius: 5px;
            cursor: pointer;
        }
        
        .order-header h3 {
            margin: 0;
            flex-grow: 1;
        }
        
        .order-status {
            font-weight: bold;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 14px;
            margin-right: 10px;
        }
        
        .status-completed {
            background-color: #d4edda;
            color: #155724;
        }
        
        .status-in-progress {
            background-color: #fff3cd;
            color: #856404;
        }
        
        .status-planned {
            background-color: #cce5ff;
            color: #004085;
        }
        
        .order-details {
            padding: 15px;
            display: none;
            border-top: 1px solid #eee;
        }
        
        .task {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            padding: 5px;
        }
        
        .task-checkbox {
            margin-right: 10px;
            width: 18px;
            height: 18px;
        }
        
        .task-name {
            flex-grow: 1;
        }
        
        .payment-info {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px dashed #ddd;
            font-size: 14px;
        }
        
        .controls {
            margin-top: 15px;
            display: flex;
            justify-content: flex-end;
        }
        
        button {
            padding: 8px 12px;
            background-color: #2196F3;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-left: 10px;
        }
        
        button:hover {
            background-color: #0b7dda;
        }
        
        .last-updated {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
        }
        
        .task-completed {
            text-decoration: line-through;
            color: #6c757d;
        }
        
        .task-in-progress {
            font-weight: bold;
            color: #856404;
        }
        
        .loading {
            text-align: center;
            padding: 20px;
            font-style: italic;
            color: #666;
        }
        
        @media (max-width: 600px) {
            .order-header {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .order-status {
                margin-bottom: 10px;
            }
        }
    </style>
</head>
<body>
    <h1>Система отслеживания заказов</h1>
    
    <div class="admin-link">
        <a href="?page=admin">Перейти в панель администратора</a>
    </div>
    
    <div class="orders-container">
        <div id="orders-list">
            <div class="loading">Загрузка данных...</div>
        </div>
    </div>
    
    <div class="last-updated" id="last-updated"></div>

    <script>
        // Функция для загрузки данных через API
        async function loadOrdersData() {
            try {
                const response = await fetch('?page=api&action=get_orders');
                if (!response.ok) {
                    throw new Error('Не удалось загрузить данные');
                }
                const data = await response.json();
                return data;
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
                document.getElementById('orders-list').innerHTML = 
                    '<div class="loading">Ошибка загрузки данных. Пожалуйста, обновите страницу.</div>';
                return [];
            }
        }

        // Функция для отображения заказов
        function renderOrders(ordersData) {
            const ordersList = document.getElementById('orders-list');
            ordersList.innerHTML = '';
            
            if (!ordersData || ordersData.length === 0) {
                ordersList.innerHTML = '<div class="loading">Нет данных для отображения</div>';
                return;
            }
            
            ordersData.forEach(order => {
                const orderElement = document.createElement('div');
                orderElement.className = 'order';
                orderElement.dataset.id = order.id;
                
                const statusClass = order.status === 'completed' ? 'status-completed' : 
                                   order.status === 'in-progress' ? 'status-in-progress' : 
                                   'status-planned';
                
                const statusText = order.status === 'completed' ? 'Завершено' : 
                                  order.status === 'in-progress' ? 'В процессе' : 
                                  'Запланировано';
                
                orderElement.innerHTML = `
                    <div class="order-header" onclick="toggleOrderDetails(${order.id})">
                        <span class="order-status ${statusClass}">${statusText}</span>
                        <h3>${order.name}</h3>
                    </div>
                    <div class="order-details" id="order-details-${order.id}">
                        <div class="tasks">
                            ${order.tasks.map(task => {
                                const taskStatusClass = task.status === 'completed' ? 'task-completed' : 
                                                       task.status === 'in-progress' ? 'task-in-progress' : '';
                                const checked = task.status === 'completed' ? 'checked' : '';
                                return `
                                    <div class="task" data-task-id="${task.id}">
                                        <input type="checkbox" class="task-checkbox" ${checked} disabled>
                                        <div class="task-name ${taskStatusClass}">${task.name}</div>
                                        <div class="task-status">
                                            ${task.status === 'completed' ? 'Сделано' : 
                                              task.status === 'in-progress' ? 'В процессе' : 
                                              'Запланировано'}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        <div class="payment-info">
                            <strong>Оплата:</strong> ${order.payment}
                        </div>
                        <div class="controls">
                            <button onclick="window.open('${order.link}', '_blank')">Перейти к проекту</button>
                        </div>
                    </div>
                `;
                
                ordersList.appendChild(orderElement);
            });
            
            // Обновляем время последнего обновления
            const lastUpdated = document.getElementById('last-updated');
            const now = new Date();
            lastUpdated.textContent = `Последнее обновление: ${now.toLocaleString()}`;
        }

        // Функция для переключения отображения деталей заказа
        function toggleOrderDetails(orderId) {
            const detailsElement = document.getElementById(`order-details-${orderId}`);
            const isHidden = detailsElement.style.display === 'none' || detailsElement.style.display === '';
            
            // Закрываем все другие детали заказов
            document.querySelectorAll('.order-details').forEach(elem => {
                elem.style.display = 'none';
            });
            
            // Открываем только выбранный заказ
            if (isHidden) {
                detailsElement.style.display = 'block';
            }
        }

        // Функция для автоматического обновления данных каждые X секунд
        function setupAutoRefresh(intervalSeconds) {
            setInterval(async () => {
                const ordersData = await loadOrdersData();
                renderOrders(ordersData);
            }, intervalSeconds * 1000);
        }

        // Инициализация при загрузке страницы
        document.addEventListener('DOMContentLoaded', async function() {
            // Загружаем данные
            const ordersData = await loadOrdersData();
            
            // Отображаем заказы
            renderOrders(ordersData);
            
            // Настраиваем автоматическое обновление каждые 5 минут
            setupAutoRefresh(300);
        });
    </script>
</body>
</html>
