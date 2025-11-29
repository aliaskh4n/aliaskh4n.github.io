# services/payment.py
import uuid
from fastapi import HTTPException
from typing import Optional
from config import get_settings
from database import db_patch, bump_user_version
from utils import now_ms

settings = get_settings()

# Цены в Stars (1 Star = 1 единица в Telegram)
STAR_PACKS = {
    "pack_1000": {"stars": 10, "bonus_coins": 1100, "label": "1 100 монет (+10% бонус)"},
    "pack_5000": {"stars": 45, "bonus_coins": 5750, "label": "5 750 монет (+15% бонус)"},
    "pack_10000": {"stars": 85, "bonus_coins": 12000, "label": "12 000 монет (+20% бонус)"},
    "pack_25000": {"stars": 200, "bonus_coins": 32500, "label": "32 500 монет (+30% бонус)"},
}

class PaymentService:
    @staticmethod
    def generate_invoice_link(user_id: str, pack_id: str) -> str:
        """Генерирует ссылку на оплату через Telegram Stars"""
        if pack_id not in STAR_PACKS:
            raise HTTPException(400, "Invalid pack")

        pack = STAR_PACKS[pack_id]
        payload = f"stars_purchase|{user_id}|{pack_id}|{uuid.uuid4().hex[:8]}"

        # Формируем ссылку для Mini App
        link = (
            f"https://t.me/{settings.BOT_USERNAME or 'your_bot'}?startapp=buy_{pack_id}_{user_id}"
            # Или через invoice link (если бот поддерживает payments):
            # f"t.me/{bot_username}?start=pay_{payload}"
        )
        return link

    @staticmethod
    async def process_successful_payment(user_id: str, pack_id: str, transaction_id: str):
        """Вызывается через webhook или pre-checkout (см. ниже) после успешной оплаты"""
        if pack_id not in STAR_PACKS:
            return False

        # Защита от повторного зачисления
        history = await db_get(f"payment_history/{user_id}") or {}
        if transaction_id in history:
            return False  # уже зачислено

        pack = STAR_PACKS[pack_id]
        coins = pack["bonus_coins"]

        # Зачисляем монеты
        await db_patch(f"users/{user_id}", {
            "balance": f"INC({coins})",  # специальный синтаксис для атомарного увеличения
            "totalPurchased": f"INC({coins})"
        })

        # Записываем в историю покупок
        await db_put(f"payment_history/{user_id}/{transaction_id}", {
            "pack_id": pack_id,
            "coins": coins,
            "stars": pack["stars"],
            "timestamp": now_ms(),
            "transaction_id": transaction_id
        })

        await bump_user_version(user_id)
        return True