// Глобальные переменные
let network = null;
let nodeData = {};

// Функция для отображения загрузки
function showLoading() {
    document.querySelector('.loading-overlay').classList.add('active');
}

// Функция для скрытия загрузки
function hideLoading() {
    document.querySelector('.loading-overlay').classList.remove('active');
}

// Функция для создания визуализации сети
function createNetworkVisualization(numberOfOpticalNodes, numberOfONTs, networkTopology, estimatedEquipmentCost, householdsCount) {
    const container = document.getElementById('networkVisualization');
    container.innerHTML = '';
    
    // Создаем узлы и связи
    const nodes = [];
    const edges = [];
    nodeData = {};
    
    // Добавляем OLT
    nodes.push({
        id: 1,
        label: 'OLT',
        shape: 'box',
        color: {
            background: '#3B82F6',
            border: '#2563EB',
            highlight: {
                background: '#60A5FA',
                border: '#3B82F6'
            }
        },
        font: { color: 'white' }
    });
    
    nodeData[1] = {
        label: 'OLT',
        details: {
            type: 'Оптический линейный терминал',
            'Порты': '16 GPON портов',
            'Пропускная способность': '10 Гбит/с',
            'Мощность передатчика': '+5 дБм'
        }
    };
    
    // Добавляем сплиттеры
    for (let i = 0; i < numberOfOpticalNodes; i++) {
        const splitRatio = document.getElementById('splitRatio').value;
        nodes.push({
            id: i + 2,
            label: `Сплиттер ${i + 1}`,
            shape: 'circle',
            color: {
                background: '#10B981',
                border: '#059669',
                highlight: {
                    background: '#34D399',
                    border: '#10B981'
                }
            }
        });
        
        // Соединяем с OLT
        edges.push({
            from: 1,
            to: i + 2,
            width: 2
        });
        
        nodeData[i + 2] = {
            label: `Сплиттер ${i + 1}`,
            details: {
                type: 'Оптический сплиттер',
                'Коэффициент деления': splitRatio,
                'Вносимые потери': '17.5 дБ',
                'Тип': 'PLC сплиттер'
            }
        };
    }
    
    // Добавляем ONT
    const ontsPerSplitter = Math.ceil(numberOfONTs / numberOfOpticalNodes);
    let ontCount = 0;
    
    for (let i = 0; i < numberOfOpticalNodes; i++) {
        for (let j = 0; j < ontsPerSplitter; j++) {
            if (ontCount < numberOfONTs) {
                const ontId = numberOfOpticalNodes + 2 + ontCount;
                nodes.push({
                    id: ontId,
                    label: `ONT ${ontCount + 1}`,
                    shape: 'circle',
                    color: {
                        background: '#E5E7EB',
                        border: '#9CA3AF',
                        highlight: {
                            background: '#F3F4F6',
                            border: '#D1D5DB'
                        }
                    },
                    size: 15
                });
                
                // Соединяем с соответствующим сплиттером
                edges.push({
                    from: i + 2,
                    to: ontId
                });
                
                nodeData[ontId] = {
                    label: `ONT ${ontCount + 1}`,
                    details: {
                        type: 'Оптический сетевой терминал',
                        'Скорость': '1 Гбит/с',
                        'Чувствительность приемника': '-28 дБм',
                        'Статус': 'Активен'
                    }
                };
                
                ontCount++;
            }
        }
    }
    
    // Добавляем дополнительные связи для разных топологий
    if (networkTopology === 'ring') {
        for (let i = 0; i < numberOfOpticalNodes - 1; i++) {
            edges.push({
                from: i + 2,
                to: i + 3,
                color: { color: '#94A3B8', opacity: 0.6 },
                dashes: [5, 5]
            });
        }
        edges.push({
            from: numberOfOpticalNodes + 1,
            to: 2,
            color: { color: '#94A3B8', opacity: 0.6 },
            dashes: [5, 5]
        });
    } else if (networkTopology === 'mesh') {
        for (let i = 0; i < numberOfOpticalNodes; i++) {
            for (let j = i + 1; j < numberOfOpticalNodes; j++) {
                if (Math.random() > 0.5) {
                    edges.push({
                        from: i + 2,
                        to: j + 2,
                        color: { color: '#94A3B8', opacity: 0.4 },
                        dashes: [5, 5]
                    });
                }
            }
        }
    }
    
    const data = {
        nodes: new vis.DataSet(nodes),
        edges: new vis.DataSet(edges)
    };
    
    const options = {
        nodes: {
            shape: 'dot',
            size: 25,
            font: {
                size: 14
            },
            borderWidth: 2,
            shadow: true
        },
        edges: {
            width: 2,
            smooth: {
                type: 'continuous'
            },
            shadow: true
        },
        physics: {
            enabled: true,
            stabilization: {
                iterations: 200
            },
            barnesHut: {
                gravitationalConstant: -80000,
                springConstant: 0.001,
                springLength: 200
            }
        },
        layout: {
            hierarchical: {
                enabled: networkTopology === 'tree',
                direction: 'UD',
                sortMethod: 'directed',
                nodeSpacing: 150,
                levelSeparation: 200
            }
        },
        interaction: {
            hover: true,
            tooltipDelay: 200,
            zoomView: true,
            dragView: true
        },
        height: '100%',
        width: '100%'
    };
    
    // Создаем новую сеть
    network = new vis.Network(container, data, options);
    
    // Добавляем обработчик события stabilized
    network.once('stabilized', function() {
        network.fit({
            animation: {
                duration: 1000,
                easingFunction: 'easeInOutQuad'
            }
        });
    });
    
    // Обработчики событий для отображения информации об узлах
    const nodeInfo = document.getElementById('nodeInfo');
    
    network.on('hoverNode', function(params) {
        const node = nodeData[params.node];
        if (node && node.details) {
            const details = node.details;
            nodeInfo.innerHTML = `
                <h3>${node.label}</h3>
                <p><strong>Тип:</strong> ${details.type}</p>
                ${Object.entries(details)
                    .filter(([key]) => key !== 'type')
                    .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
                    .join('')}
            `;
            nodeInfo.style.display = 'block';
            nodeInfo.style.left = params.event.clientX + 10 + 'px';
            nodeInfo.style.top = params.event.clientY + 10 + 'px';
        }
    });
    
    network.on('blurNode', function() {
        nodeInfo.style.display = 'none';
    });
    
    // Обновляем статистику
    const splitRatio = document.getElementById('splitRatio').value;
    updateNetworkStats(
        nodes.length, 
        numberOfONTs, 
        estimatedEquipmentCost, 
        householdsCount, 
        numberOfOpticalNodes,
        splitRatio
    );
    
    // Добавляем обработчик изменения размера окна
    window.addEventListener('resize', function() {
        if (network) {
            network.fit({
                animation: {
                    duration: 1000,
                    easingFunction: 'easeInOutQuad'
                }
            });
        }
    });
}

function updateNetworkStats(totalDevices, numberOfONTs, totalCost, householdsCount, numberOfOpticalNodes, splitRatio) {
    document.getElementById('totalDevices').textContent = totalDevices;
    document.getElementById('coverage').textContent = 
        Math.round((numberOfONTs / householdsCount) * 100) + '%';
    document.getElementById('costPerUser').textContent = 
        Math.round(totalCost / householdsCount) + ' руб.';
    
    // Обновляем детальную информацию
    const detailedInfo = document.getElementById('detailedInfo');
    detailedInfo.innerHTML = `
        <h3 style="margin-bottom: 15px; color: var(--primary-color);">Детальная информация о сети</h3>
        <div class="results-grid">
            <div class="result-item">
                <span class="result-label">Общее количество устройств в сети</span>
                <span class="result-value">${totalDevices}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Процент покрытия домохозяйств</span>
                <span class="result-value">${Math.round((numberOfONTs / householdsCount) * 100)}%</span>
            </div>
            <div class="result-item">
                <span class="result-label">Средняя стоимость на абонента</span>
                <span class="result-value">${Math.round(totalCost / householdsCount)} руб.</span>
            </div>
            <div class="result-item">
                <span class="result-label">Эффективность использования сплиттеров</span>
                <span class="result-value">${Math.round((numberOfONTs / (numberOfOpticalNodes * parseInt(splitRatio.split(':')[1], 10))) * 100)}%</span>
            </div>
        </div>
    `;
}

function calculateNetworkParameters() {
    l();
}

function zoomIn() {
    if (network) {
        network.zoom(1.2);
    }
}

function zoomOut() {
    if (network) {
        network.zoom(0.8);
    }
}

function resetView() {
    if (network) {
        network.fit({
            animation: {
                duration: 1000,
                easingFunction: "easeInOutQuad"
            }
        });
    }
}

// Инициализация вкладок
document.addEventListener('DOMContentLoaded', function() {
    // Обработчики для вкладок
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Удаляем активный класс со всех вкладок и секций
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            
            // Добавляем активный класс выбранной вкладке и секции
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Обработчик для кнопки расчета
    document.getElementById('calculateBtn').addEventListener('click', calculateNetworkParameters);
    
    // Обработчики для кнопок управления
    document.getElementById('zoomIn').addEventListener('click', zoomIn);
    document.getElementById('zoomOut').addEventListener('click', zoomOut);
    document.getElementById('resetView').addEventListener('click', resetView);
}); 
