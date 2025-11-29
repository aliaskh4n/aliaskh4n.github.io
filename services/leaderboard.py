# services/leaderboard.py
from database import db_get

async def get_leaderboard():
    """
    Получить топ-10 игроков по балансу
    Возвращает список с информацией о каждом игроке
    """
    users_data = await db_get("users") or {}
    
    # Фильтруем только валидных пользователей с балансом > 0
    valid_users = [
        user for user in users_data.values()
        if isinstance(user, dict) and user.get("balance", 0) > 0
    ]
    
    # Сортируем по балансу и берём топ-10
    top_users = sorted(
        valid_users,
        key=lambda x: x.get("balance", 0),
        reverse=True
    )[:10]
    
    # Формируем результат
    result = []
    for user in top_users:
        games_played = max(user.get("gamesPlayed", 1), 1)  # Избегаем деления на 0
        win_rate = round(user.get("gamesWon", 0) / games_played * 100, 1)
        
        result.append({
            "id": user["id"],
            "name": user.get("name", "Player"),
            "photo_url": user.get("photo_url"),
            "balance": user["balance"],
            "gamesWon": user.get("gamesWon", 0),
            "gamesPlayed": games_played,
            "winRate": win_rate
        })
    
    return result