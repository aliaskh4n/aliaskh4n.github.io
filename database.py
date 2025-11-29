# database.py
import json
from pathlib import Path
from filelock import FileLock
from typing import Optional, Any

# Vercel позволяет писать только в /tmp
DB_DIR = Path("/tmp/nekros_data")
DB_PATH = DB_DIR / "db.json"
LOCK_PATH = DB_DIR / "db.json.lock"

# Создаём директорию
DB_DIR.mkdir(exist_ok=True, parents=True)

def _init_db():
    """Инициализация базы данных с начальной структурой"""
    if not DB_PATH.exists():
        initial_data = {
            "users": {},
            "activeGames": {},
            "versions": {
                "leaderboard": 0,
                "user_balance": {}
            }
        }
        DB_PATH.write_text(
            json.dumps(initial_data, indent=2, ensure_ascii=False),
            encoding="utf-8"
        )

_init_db()
lock = FileLock(LOCK_PATH, timeout=10)

# ==================== VERSION MANAGEMENT ====================

async def bump_leaderboard_version():
    """Увеличить версию лидерборда"""
    with lock:
        db = _load_db()
        db["versions"]["leaderboard"] = db["versions"].get("leaderboard", 0) + 1
        _save_db(db)

async def bump_user_version(user_id: str):
    """Увеличить версию баланса пользователя"""
    with lock:
        db = _load_db()
        current = db["versions"]["user_balance"].get(user_id, 0)
        db["versions"]["user_balance"][user_id] = current + 1
        _save_db(db)

def get_leaderboard_version() -> int:
    """Получить текущую версию лидерборда"""
    try:
        with lock:
            db = _load_db()
            return db["versions"].get("leaderboard", 0)
    except Exception:
        return 0

def get_user_version(user_id: str) -> int:
    """Получить текущую версию баланса пользователя"""
    try:
        with lock:
            db = _load_db()
            return db["versions"]["user_balance"].get(user_id, 0)
    except Exception:
        return 0

# ==================== CORE DATABASE FUNCTIONS ====================

def _load_db() -> dict:
    """Загрузить базу данных из файла"""
    _init_db()
    with open(DB_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def _save_db(db: dict):
    """Сохранить базу данных в файл"""
    with open(DB_PATH, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=2, ensure_ascii=False)

async def db_get(path: str) -> Optional[Any]:
    """
    Получить данные по пути (например: 'users/123' или 'activeGames/game_1')
    Возвращает None если путь не существует
    """
    with lock:
        db = _load_db()
        current = db
        
        for key in path.split("/"):
            if not isinstance(current, dict) or key not in current:
                return None
            current = current[key]
        
        return current if current != {} else None

async def db_put(path: str, data: dict):
    """
    Записать данные по пути, создавая промежуточные узлы если нужно
    """
    with lock:
        db = _load_db()
        keys = path.split("/")
        current = db
        
        # Создаём промежуточные узлы
        for key in keys[:-1]:
            if key not in current:
                current[key] = {}
            current = current[key]
        
        # Записываем данные
        current[keys[-1]] = data
        _save_db(db)

async def db_patch(path: str, updates: dict):
    """
    Обновить существующие данные по пути
    Если данных нет - создаст новую запись
    """
    with lock:
        db = _load_db()
        keys = path.split("/")
        current = db
        
        # Создаём промежуточные узлы
        for key in keys[:-1]:
            if key not in current:
                current[key] = {}
            current = current[key]
        
        # Получаем или создаём целевой объект
        target = current.get(keys[-1], {})
        
        if isinstance(target, dict):
            target.update(updates)
            current[keys[-1]] = target
        else:
            current[keys[-1]] = updates
        
        _save_db(db)

async def db_delete(path: str):
    """Удалить данные по пути"""
    with lock:
        db = _load_db()
        keys = path.split("/")
        current = db
        
        # Навигация до предпоследнего элемента
        for key in keys[:-1]:
            if key not in current:
                return  # Путь не существует
            current = current[key]
        
        # Удаление последнего элемента
        if keys[-1] in current:
            del current[keys[-1]]
            _save_db(db)

async def close():
    """Закрытие соединения с базой (не требуется для файловой БД)"""
    pass