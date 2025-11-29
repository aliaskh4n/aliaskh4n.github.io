# config.py
from typing import Final, Dict, List
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    BOT_TOKEN: str = Field(..., env="BOT_TOKEN")
    SLOT_CHAT_ID: int = Field(..., env="SLOT_CHAT_ID")
    MINES_CHAT_ID: int = Field(..., env="MINES_CHAT_ID")
    BOT_USERNAME: str = Field(..., env="BOT_USERNAME")

    DEFAULT_BALANCE: int = 1000
    HTTP_TIMEOUT: float = 10.0

    DICE_TO_SYMBOLS: Final[Dict[int, List[str]]] = {
        1: ['bell','bell','bell'], 2: ['cherry','bell','bell'], 3: ['lemon','bell','bell'], 4: ['7','bell','bell'],
        5: ['bell','cherry','bell'], 6: ['cherry','cherry','bell'], 7: ['lemon','cherry','bell'], 8: ['7','cherry','bell'],
        9: ['bell','lemon','bell'], 10: ['cherry','lemon','bell'], 11: ['lemon','lemon','bell'], 12: ['7','lemon','bell'],
        13: ['bell','7','bell'], 14: ['cherry','7','bell'], 15: ['lemon','7','bell'], 16: ['7','7','bell'],
        17: ['bell','bell','cherry'], 18: ['cherry','bell','cherry'], 19: ['lemon','bell','cherry'], 20: ['7','bell','cherry'],
        21: ['bell','cherry','cherry'], 22: ['cherry','cherry','cherry'], 23: ['lemon','cherry','cherry'], 24: ['7','cherry','cherry'],
        25: ['bell','lemon','cherry'], 26: ['cherry','lemon','cherry'], 27: ['lemon','lemon','cherry'], 28: ['7','lemon','cherry'],
        29: ['bell','7','cherry'], 30: ['cherry','7','cherry'], 31: ['lemon','7','cherry'], 32: ['7','7','cherry'],
        33: ['bell','bell','lemon'], 34: ['cherry','bell','lemon'], 35: ['lemon','bell','lemon'], 36: ['7','bell','lemon'],
        37: ['bell','cherry','lemon'], 38: ['cherry','cherry','lemon'], 39: ['lemon','cherry','lemon'], 40: ['7','cherry','lemon'],
        41: ['bell','lemon','lemon'], 42: ['cherry','lemon','lemon'], 43: ['lemon','lemon','lemon'], 44: ['7','lemon','lemon'],
        45: ['bell','7','lemon'], 46: ['cherry','7','lemon'], 47: ['lemon','7','lemon'], 48: ['7','7','lemon'],
        49: ['bell','bell','7'], 50: ['cherry','bell','7'], 51: ['lemon','bell','7'], 52: ['7','bell','7'],
        53: ['bell','cherry','7'], 54: ['cherry','cherry','7'], 55: ['lemon','cherry','7'], 56: ['7','cherry','7'],
        57: ['bell','lemon','7'], 58: ['cherry','lemon','7'], 59: ['lemon','lemon','7'], 60: ['7','lemon','7'],
        61: ['bell','7','7'], 62: ['cherry','7','7'], 63: ['lemon','7','7'], 64: ['7','7','7']
    }

    SLOT_MULTIPLIERS: Final[Dict[str, float]] = {
        'jackpot_777': 12.40,
        'jackpot_lemon': 6.20,
        'jackpot_cherry': 3.72,
        'jackpot_bell': 2.48,
        'pair': 1.00,
        'lose': 0.00
    }

    MINES_MULTIPLIERS: Final[Dict[int, List[float]]] = {
        3: [1.2, 1.5, 1.9, 2.4, 3.0, 3.8, 4.8, 6.0, 7.5, 9.4, 11.8, 14.8, 18.5, 23.1, 28.9, 36.1, 45.2, 56.5, 70.6, 88.3, 110.4, 138.0],
        5: [1.3, 1.7, 2.2, 2.9, 3.8, 5.0, 6.5, 8.5, 11.1, 14.5, 18.9, 24.6, 32.0, 41.6, 54.1, 70.4, 91.5, 119.0, 154.7, 201.1],
        7: [1.4, 1.9, 2.6, 3.5, 4.8, 6.5, 8.8, 12.0, 16.3, 22.1, 30.0, 40.8, 55.4, 75.3, 102.3, 139.0, 188.9, 256.7]
    }

    EMOJI_MAP: Final[Dict[str, str]] = {
        'bell': 'bell', 'cherry': 'cherry', 'lemon': 'lemon', '7': '7'
    }

    class Config:
        env_file = ".env"
        case_sensitive = False


def get_settings():
    return Settings()