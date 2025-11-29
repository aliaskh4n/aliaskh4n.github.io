# services/mines.py
from config import get_settings
from utils import get_mines_positions, now_ms
from database import db_get, db_put, db_patch, bump_user_version, bump_leaderboard_version
import uuid

settings = get_settings()

class MinesService:
    @staticmethod
    def get_multiplier(mines: int, revealed: int) -> float:
        """Получить множитель для текущего количества открытых клеток"""
        multipliers = settings.MINES_MULTIPLIERS.get(mines, [])
        if not multipliers or revealed < 1:
            return 1.0
        
        index = min(revealed - 1, len(multipliers) - 1)
        return multipliers[index]

    @staticmethod
    async def start(user_id: str, bet: int, mines: int):
        """Начать новую игру в Mines"""
        game_id = f"mines_{user_id}_{uuid.uuid4().hex[:8]}"
        start_time = now_ms()

        # Генерируем позиции бомб с Provably Fair
        bombs, server_seed, dice_values = get_mines_positions(
            game_id=game_id,
            user_id=user_id,
            bet=bet,
            mines_count=mines,
            start_time=start_time
        )

        game = {
            "userId": user_id,
            "bet": bet,
            "minesCount": mines,
            "bombPositions": bombs,
            "revealedPositions": [],
            "active": True,
            "startTime": start_time,
            "gameId": game_id,
            "provablyFair": {
                "serverSeed": server_seed,
                "clientSeed": game_id,
                "diceValues": dice_values
            }
        }

        await db_put(f"activeGames/{game_id}", game)
        return {"gameId": game_id}

    @staticmethod
    async def reveal(user_id: str, game_id: str, pos: int):
        """Открыть клетку в игре"""
        game = await db_get(f"activeGames/{game_id}")
        
        if not game:
            raise ValueError("Game not found")
        
        if not game.get("active"):
            raise ValueError("Game is not active")
        
        if game["userId"] != user_id:
            raise ValueError("Not your game")

        revealed = game.get("revealedPositions", [])
        
        if pos in revealed:
            raise ValueError("Position already revealed")

        # Проверяем, попали ли в бомбу
        if pos in game["bombPositions"]:
            # Игра окончена - попали в мину
            await db_patch(f"activeGames/{game_id}", {"active": False})
            
            user = await db_get(f"users/{user_id}")
            await db_patch(f"users/{user_id}", {
                "gamesPlayed": user.get("gamesPlayed", 0) + 1,
                "totalLosses": user.get("totalLosses", 0) + game["bet"],
                "lastSeen": now_ms()
            })

            await bump_user_version(user_id)

            return {
                "hit": "bomb",
                "newBalance": user["balance"],
                "bombPositions": game["bombPositions"]
            }

        # Безопасная клетка - добавляем к открытым
        revealed.append(pos)
        await db_patch(f"activeGames/{game_id}", {"revealedPositions": revealed})
        
        multiplier = MinesService.get_multiplier(game["minesCount"], len(revealed))
        
        return {
            "hit": "safe",
            "revealedCount": len(revealed),
            "multiplier": multiplier,
            "currentWin": int(game["bet"] * multiplier)
        }

    @staticmethod
    async def cashout(user_id: str, game_id: str):
        """Забрать выигрыш"""
        game = await db_get(f"activeGames/{game_id}")
        
        if not game:
            raise ValueError("Game not found")
        
        if not game.get("active"):
            raise ValueError("Game is not active")
        
        if game["userId"] != user_id:
            raise ValueError("Not your game")

        revealed_count = len(game.get("revealedPositions", []))
        
        if revealed_count == 0:
            raise ValueError("Nothing to cashout")

        # Рассчитываем выигрыш
        multiplier = MinesService.get_multiplier(game["minesCount"], revealed_count)
        win_amount = int(game["bet"] * multiplier)
        
        user = await db_get(f"users/{user_id}")
        new_balance = user["balance"] + win_amount

        # Завершаем игру
        await db_patch(f"activeGames/{game_id}", {"active": False})
        
        # Обновляем статистику пользователя
        await db_patch(f"users/{user_id}", {
            "balance": new_balance,
            "gamesPlayed": user.get("gamesPlayed", 0) + 1,
            "gamesWon": user.get("gamesWon", 0) + 1,
            "totalWinnings": user.get("totalWinnings", 0) + win_amount,
            "lastSeen": now_ms()
        })

        await bump_user_version(user_id)
        
        # Обновляем лидерборд при крупных выигрышах
        if win_amount >= 5000 or new_balance >= 20000:
            await bump_leaderboard_version()

        return {
            "winAmount": win_amount,
            "newBalance": new_balance,
            "multiplier": multiplier,
            "bombPositions": game["bombPositions"]
        }