# services/user.py
from pydantic import BaseModel
from typing import Optional
from database import db_get, db_put, db_patch
from utils import now_ms
from config import get_settings

settings = get_settings()

class User(BaseModel):
    id: str
    name: str = "Player"
    username: Optional[str] = None
    photo_url: Optional[str] = None
    balance: int = settings.DEFAULT_BALANCE
    gamesPlayed: int = 0
    gamesWon: int = 0
    totalWinnings: int = 0
    totalLosses: int = 0
    lastSeen: int = 0

    model_config = {"extra": "ignore"}

class UserService:
    @staticmethod
    async def get_or_create(tg_user: dict) -> User:
        """
        Получить пользователя или создать нового если не существует
        Обновляет lastSeen и данные профиля при каждом вызове
        """
        user_id = str(tg_user["id"])
        
        # Пытаемся получить существующего пользователя
        data = await db_get(f"users/{user_id}")

        if not data:
            # Создаём нового пользователя
            data = {
                "id": user_id,
                "name": tg_user.get("first_name", "Player"),
                "username": tg_user.get("username"),
                "photo_url": tg_user.get("photo_url"),
                "balance": settings.DEFAULT_BALANCE,
                "gamesPlayed": 0,
                "gamesWon": 0,
                "totalWinnings": 0,
                "totalLosses": 0,
                "lastSeen": now_ms()
            }
            await db_put(f"users/{user_id}", data)
        else:
            # Обновляем профиль существующего пользователя
            updates = {
                "lastSeen": now_ms(),
                "name": tg_user.get("first_name", data.get("name", "Player"))
            }
            
            # Обновляем фото если есть
            if tg_user.get("photo_url"):
                updates["photo_url"] = tg_user["photo_url"]
            
            await db_patch(f"users/{user_id}", updates)
            
            # Обновляем локальные данные
            data.update(updates)

        return User(**data)