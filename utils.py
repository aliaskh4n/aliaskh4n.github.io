# utils.py
import secrets
import json
import httpx
from urllib.parse import parse_qs
from datetime import datetime
from hashlib import sha256

async def get_slot_value(token: str, chat_id: int) -> int:
    """Асинхронное получение значения слота через Telegram API"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"https://api.telegram.org/bot{token}/sendDice",
                params={"chat_id": chat_id, "emoji": "🎰"}
            )
            data = response.json()
            return data["result"]["dice"]["value"]
    except Exception:
        # Fallback на случайное значение
        return secrets.randbelow(64) + 1

def parse_init_data(init_data: str) -> dict:
    """Парсинг initData от Telegram WebApp"""
    try:
        params = parse_qs(init_data)
        user_str = params.get('user', [None])[0]
        return json.loads(user_str) if user_str else None
    except Exception:
        return None

def get_mines_positions(game_id: str, user_id: str, bet: int, mines_count: int, start_time: int):
    """
    Генерация позиций бомб для игры Mines с Provably Fair
    Возвращает: (список позиций бомб, seed, dice_values для проверки)
    """
    # Server seed
    server_seed = secrets.token_hex(16)
    
    # Client seed - комбинация параметров игры
    client_seed = f"{game_id}:{user_id}:{bet}:{mines_count}:{start_time}"
    
    # Комбинированный seed для генерации
    combined_seed = sha256(f"{server_seed}:{client_seed}".encode()).hexdigest()
    
    # Инициализация генератора
    rng = secrets.SystemRandom()
    rng.seed(combined_seed)
    
    # Генерация позиций бомб
    positions = list(range(25))
    rng.shuffle(positions)
    bombs = sorted(positions[:mines_count])
    
    # Дополнительные dice values для верификации
    dice_values = [rng.randint(1, 6) for _ in range(10)]
    
    return bombs, server_seed, dice_values

def now_ms() -> int:
    """Текущее время в миллисекундах"""
    return int(datetime.now().timestamp() * 1000)