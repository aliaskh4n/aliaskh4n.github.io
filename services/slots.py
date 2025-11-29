# services/slots.py
from config import get_settings
from utils import get_slot_value

settings = get_settings()

async def play_slot(bet: int) -> dict:
    """
    Игра в слоты через Telegram Dice API
    Возвращает результат игры с символами, выигрышем и типом выигрыша
    """
    # Получаем значение dice от Telegram
    dice = await get_slot_value(settings.BOT_TOKEN, settings.SLOT_CHAT_ID)
    
    # Конвертируем dice в символы
    symbols = settings.DICE_TO_SYMBOLS.get(dice, ['bell', 'bell', 'bell'])

    # Определяем тип выигрыша
    if symbols[0] == symbols[1] == symbols[2]:
        # Джекпот - все 3 символа одинаковые
        win_type = {
            '7': 'jackpot_777',
            'lemon': 'jackpot_lemon',
            'cherry': 'jackpot_cherry',
            'bell': 'jackpot_bell'
        }.get(symbols[0], 'jackpot_bell')
        multiplier = settings.SLOT_MULTIPLIERS[win_type]
    elif len(set(symbols)) == 2:
        # Пара - 2 одинаковых символа
        win_type = 'pair'
        multiplier = settings.SLOT_MULTIPLIERS['pair']
    else:
        # Проигрыш
        win_type = 'lose'
        multiplier = 0

    win_amount = int(bet * multiplier)
    
    return {
        "symbols": symbols,
        "diceValue": dice,
        "winAmount": win_amount,
        "winType": win_type,
        "netProfit": win_amount - bet
    }