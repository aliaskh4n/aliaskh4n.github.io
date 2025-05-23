# Моделирование загрязнения воздуха от автомобильных выбросов

## Обзор проекта

Данный проект представляет собой веб-приложение для моделирования и визуализации распространения загрязняющих веществ от автомобильных выбросов в городской среде с использованием методов машинного обучения. Приложение позволяет анализировать влияние различных параметров (скорость и направление ветра, температура) на распространение загрязнения от дорожных сетей.

## Содержание

1. [Технологический стек](#технологический-стек)
2. [Архитектура приложения](#архитектура-приложения)
3. [Модель машинного обучения](#модель-машинного-обучения)
4. [Генерация данных](#генерация-данных)
5. [Алгоритм моделирования распространения загрязнения](#алгоритм-моделирования-распространения-загрязнения)
6. [Веб-интерфейс](#веб-интерфейс)
7. [Инструкция по установке и запуску](#инструкция-по-установке-и-запуску)
8. [Возможные улучшения](#возможные-улучшения)

## Технологический стек

В проекте используются следующие технологии и библиотеки:

- **Python 3.x** - основной язык программирования
- **Flask** - веб-фреймворк для создания приложения
- **Scikit-learn** - библиотека машинного обучения
- **NumPy** - для эффективных вычислений с массивами
- **Pandas** - для обработки и анализа данных
- **Matplotlib** - для визуализации данных
- **SciPy** - для научных вычислений и обработки изображений
- **HTML/CSS/JavaScript** - для создания пользовательского интерфейса

## Архитектура приложения

Приложение имеет следующую архитектуру:

1. **Серверная часть (Backend)**
   - Flask-сервер для обработки HTTP-запросов
   - Модуль машинного обучения для прогнозирования распространения загрязнения
   - Модуль визуализации для создания карт загрязнения

2. **Клиентская часть (Frontend)**
   - Интерактивный веб-интерфейс с элементами управления
   - Отображение результатов моделирования
   - Система вкладок для переключения между результатами и информацией о модели

## Модель машинного обучения

### Алгоритм

В проекте используется алгоритм **Random Forest (Случайный лес)** для регрессии. Этот алгоритм был выбран по следующим причинам:

- Высокая точность прогнозирования
- Устойчивость к шуму в данных и переобучению
- Способность обрабатывать нелинейные зависимости
- Способность определять важность признаков

Реализация:

```python
from sklearn.ensemble import RandomForestRegressor
model = RandomForestRegressor(n_estimators=100, random_state=42)
```

Параметр `n_estimators=100` указывает, что ансамбль будет состоять из 100 деревьев решений, что обеспечивает хороший компромисс между точностью и временем вычислений.

### Признаки (входные параметры)

Модель обучается на следующих признаках:

- `traffic_density` - плотность транспортного потока (количество автомобилей)
- `vehicle_speed` - средняя скорость транспорта (км/ч)
- `temperature` - температура воздуха (°C)
- `wind_speed` - скорость ветра (м/с)
- `wind_direction` - направление ветра (градусы)
- `humidity` - влажность воздуха (%)

### Целевая переменная

- `pollution` - уровень загрязнения воздуха

### Предобработка данных

Перед обучением данные нормализуются с помощью StandardScaler из scikit-learn:

```python
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
```

Это необходимо для приведения всех признаков к одному масштабу, что повышает качество обучения модели.

## Генерация данных

Поскольку проект является демонстрационным, в нем используются синтетические данные, генерируемые с учетом реалистичных зависимостей между параметрами:

```python
def generate_synthetic_data(n_samples=1000):
    # Генерация параметров
    traffic_density = np.random.poisson(lam=20, size=n_samples)
    vehicle_speed = np.random.normal(40, 10, n_samples)
    temperature = np.random.normal(15, 8, n_samples)
    wind_speed = np.random.gamma(2, 2, n_samples)
    wind_direction = np.random.uniform(0, 360, n_samples)
    humidity = np.random.normal(70, 15, n_samples)
    
    # Расчет загрязнения на основе этих параметров
    pollution = (
        0.8 * traffic_density +
        -0.3 * vehicle_speed +
        -0.2 * temperature +
        -0.6 * wind_speed +
        0.1 * np.sin(np.radians(wind_direction)) +
        0.1 * humidity
    )
    
    # Добавление шума
    pollution = pollution + np.random.normal(0, 5, n_samples)
    pollution = pollution - pollution.min() + 1
    
    # Создание DataFrame
    data = pd.DataFrame({
        'traffic_density': traffic_density,
        'vehicle_speed': vehicle_speed,
        'temperature': temperature,
        'wind_speed': wind_speed,
        'wind_direction': wind_direction,
        'humidity': humidity,
        'pollution': pollution
    })
    
    return data
```

Данная функция создает синтетические данные, учитывая следующие зависимости:

- Выше плотность трафика → выше загрязнение
- Выше скорость автомобилей → ниже загрязнение
- Выше температура → ниже загрязнение (из-за лучшего вертикального перемешивания воздуха)
- Выше скорость ветра → ниже загрязнение (из-за лучшего рассеивания)
- Направление ветра влияет с синусоидальной зависимостью
- Выше влажность → выше загрязнение (из-за замедления оседания частиц)

## Алгоритм моделирования распространения загрязнения

Алгоритм моделирования загрязнения включает следующие этапы:

1. **Создание сетки города**
   ```python
   grid_size = 50
   traffic = np.zeros((grid_size, grid_size))
   ```

2. **Моделирование дорожной сети**
   ```python
   # Главные дороги (горизонтальные и вертикальные)
   traffic[grid_size//4, :] = np.random.poisson(30, grid_size)
   traffic[grid_size//2, :] = np.random.poisson(40, grid_size)
   traffic[3*grid_size//4, :] = np.random.poisson(25, grid_size)
   
   traffic[:, grid_size//4] = np.random.poisson(35, grid_size)
   traffic[:, grid_size//2] = np.random.poisson(45, grid_size)
   traffic[:, 3*grid_size//4] = np.random.poisson(30, grid_size)
   ```

3. **Сглаживание дорог для реалистичности**
   ```python
   traffic = ndimage.gaussian_filter(traffic, sigma=1.5)
   ```

4. **Применение обученной модели для прогнозирования загрязнения**
   ```python
   pollution_predictions = model.predict(grid_data_scaled)
   ```

5. **Моделирование распространения загрязнения**
   ```python
   # Диффузия загрязнения
   pollution_grid = ndimage.gaussian_filter(pollution_grid, sigma=3)
   
   # Расчет смещения из-за ветра
   wind_rad = np.radians((wind_direction + 180) % 360)
   shift_x = np.cos(wind_rad) * wind_speed / 2
   shift_y = np.sin(wind_rad) * wind_speed / 2
   
   # Смещение загрязнения по направлению ветра
   pollution_grid = ndimage.shift(pollution_grid, (shift_y, shift_x), mode='constant', cval=0)
   ```

## Веб-интерфейс

Веб-интерфейс приложения разработан с использованием современных веб-технологий и включает:

1. **Двухпанельный интерфейс**
   - Панель управления слева
   - Панель результатов справа

2. **Элементы управления для настройки параметров**
   - Скорость ветра (м/с)
   - Направление ветра (градусы)
   - Температура (°C)

3. **Система вкладок для организации контента**
   - Вкладка "Результаты моделирования"
   - Вкладка "Информация о модели"

4. **Визуализация параметров**
   - Карточки с текущими значениями параметров

5. **Отображение результатов**
   - Карта плотности транспортного потока
   - Карта распространения загрязнения

6. **Индикаторы состояния**
   - Анимированный индикатор загрузки при выполнении симуляции

## Маршруты API

Приложение предоставляет следующие API-маршруты:

1. **GET /** - главная страница с интерфейсом
2. **POST /simulate** - запуск симуляции с переданными параметрами

## Инструкция по установке и запуску

### Предварительные требования

- Python 3.6 или выше
- Pip (менеджер пакетов Python)

### Установка зависимостей

```bash
pip install flask numpy pandas matplotlib scikit-learn scipy
```

### Подготовка проекта

1. Создайте директорию для проекта и перейдите в неё:
   ```bash
   mkdir pollution_model
   cd pollution_model
   ```

2. Создайте подпапки для статических файлов и шаблонов:
   ```bash
   mkdir static templates
   ```

3. Создайте файл `app.py` с кодом приложения

4. Создайте файл `templates/index.html` с кодом веб-интерфейса

### Запуск приложения

```bash
python app.py
```

После запуска откройте браузер и перейдите по адресу: http://127.0.0.1:5000/

## Возможные улучшения

Проект может быть расширен и улучшен следующими способами:

1. **Использование реальных данных**
   - Интеграция с API дорожного движения
   - Подключение к API погодных сервисов
   - Использование данных с датчиков качества воздуха

2. **Улучшение физической модели**
   - Учет рельефа местности
   - Учет городской застройки
   - Моделирование атмосферной турбулентности

3. **Расширение машинного обучения**
   - Применение методов глубокого обучения
   - Временные ряды для анализа динамики загрязнения
   - Сравнительный анализ разных алгоритмов ML

4. **Улучшение визуализации**
   - Интерактивные карты (Folium, Plotly)
   - 3D-визуализация распространения загрязнения
   - Анимация изменения загрязнения во времени

5. **Функциональные улучшения**
   - Прогнозирование загрязнения во времени
   - Оптимизация маршрутов с учетом экологической ситуации
   - Рекомендации по снижению загрязнения

## Заключение

Данный проект демонстрирует применение методов машинного обучения для моделирования экологических процессов в городской среде. Проект сочетает алгоритмы машинного обучения, физическое моделирование и интерактивную визуализацию для создания полезного инструмента анализа распространения загрязнения воздуха от автомобильного транспорта.

Хотя проект использует синтетические данные для демонстрации, подход может быть применен к реальным данным для создания полноценной системы мониторинга и прогнозирования качества воздуха в городских условиях.
