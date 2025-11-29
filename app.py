# app.py
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import asyncio
import uuid
import httpx

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from config import get_settings
from database import db_patch, close, bump_user_version, bump_leaderboard_version
from utils import parse_init_data, now_ms
from services.user import UserService
from services.slots import play_slot
from services.mines import MinesService
from services.leaderboard import get_leaderboard
from services.payment import STAR_PACKS

# Limiter Setup
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Nekros Casino", version="2.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

settings = get_settings()

# Models
class InitRequest(BaseModel):
    initData: str

class SlotPlayRequest(BaseModel):
    userId: str
    bet: int = Field(..., gt=0)

class BuyPackRequest(BaseModel):
    userId: str
    packId: str
    
class MinesStartRequest(BaseModel):
    userId: str
    bet: int = Field(..., gt=0)
    minesCount: int = Field(..., ge=3, le=7)

class MinesRevealRequest(BaseModel):
    userId: str
    gameId: str
    position: int = Field(..., ge=0, le=24)

class MinesCashoutRequest(BaseModel):
    userId: str
    gameId: str

# Auth
@app.post("/api/auth/init")
async def auth_init(req: InitRequest):
    tg_user = parse_init_data(req.initData)
    if not tg_user or "id" not in tg_user:
        raise HTTPException(401, "Invalid initData")
    
    user = await UserService.get_or_create(tg_user)
    return {
        "success": True,
        "user": user.model_dump(),
        "token": f"s_{user.id}_{now_ms()}"
    }

# Slots Game
@app.post("/api/game/slots/play")
@limiter.limit("5/second")
async def slots_play(req: SlotPlayRequest, request: Request):
    user = await UserService.get_or_create({"id": req.userId})
    
    if user.balance < req.bet:
        raise HTTPException(400, "Insufficient balance")

    result = play_slot(req.bet)
    new_balance = user.balance + result["netProfit"]

    updates = {
        "balance": new_balance,
        "gamesPlayed": user.gamesPlayed + 1,
        "lastSeen": now_ms()
    }
    
    if result["winAmount"] > 0:
        updates["gamesWon"] = user.gamesWon + 1
        updates["totalWinnings"] = user.totalWinnings + result["winAmount"]
    else:
        updates["totalLosses"] = user.totalLosses + req.bet

    await db_patch(f"users/{req.userId}", updates)
    await bump_user_version(req.userId)
    
    if result["winAmount"] >= 5000:
        await bump_leaderboard_version()

    return {**result, "newBalance": new_balance, "success": True}

# Mines Game
@app.post("/api/game/mines/start")
@limiter.limit("5/second")
async def mines_start(req: MinesStartRequest, request: Request):
    if req.minesCount not in [3, 5, 7]:
        raise HTTPException(400, "Invalid mines count")

    user = await UserService.get_or_create({"id": req.userId})
    
    if user.balance < req.bet:
        raise HTTPException(400, "Insufficient balance")

    new_balance = user.balance - req.bet
    await db_patch(f"users/{req.userId}", {
        "balance": new_balance,
        "lastSeen": now_ms()
    })
    
    game = await MinesService.start(req.userId, req.bet, req.minesCount)

    return {
        "success": True,
        "gameId": game["gameId"],
        "newBalance": new_balance
    }

@app.post("/api/game/mines/reveal")
@limiter.limit("5/second")
async def mines_reveal(req: MinesRevealRequest, request: Request):
    try:
        result = await MinesService.reveal(req.userId, req.gameId, req.position)
        return {"success": True, **result}
    except ValueError as e:
        raise HTTPException(400, str(e))

@app.post("/api/game/mines/cashout")
@limiter.limit("5/second")
async def mines_cashout(req: MinesCashoutRequest, request: Request):
    try:
        result = await MinesService.cashout(req.userId, req.gameId)
        return {"success": True, **result}
    except ValueError as e:
        raise HTTPException(400, str(e))

# Leaderboard
@app.get("/api/stats/leaderboard")
async def leaderboard():
    data = await get_leaderboard()
    return {"success": True, "leaderboard": data}

# Shop
@app.get("/api/shop/packs")
async def get_shop_packs():
    return {
        "success": True,
        "packs": [
            {
                "id": pid,
                "stars": pack["stars"],
                "coins": pack["bonus_coins"],
                "label": pack["label"],
                "popular": pid == "pack_10000"
            }
            for pid, pack in STAR_PACKS.items()
        ]
    }

@app.post("/api/shop/create_invoice")
async def create_invoice(req: BuyPackRequest):
    if req.packId not in STAR_PACKS:
        raise HTTPException(400, "Invalid pack selected")

    pack = STAR_PACKS[req.packId]
    unique_id = uuid.uuid4().hex[:12]
    payload = f"nekros_{req.userId}_{req.packId}_{unique_id}"

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                f"https://api.telegram.org/bot{settings.BOT_TOKEN}/sendInvoice",
                json={
                    "chat_id": int(req.userId),
                    "title": "Nekros Casino — Пополнение",
                    "description": f"Покупка: {pack['label']}",
                    "payload": payload,
                    "provider_token": "",
                    "currency": "XTR",
                    "prices": [{"label": "Telegram Stars", "amount": pack["stars"]}],
                    "start_parameter": "shop",
                    "photo_url": "https://cdn.pixabay.com/animation/2024/04/19/03/01/03-01-04-742__480.png",
                    "need_name": False,
                    "need_phone_number": False,
                    "need_email": False,
                    "need_shipping_address": False,
                }
            )
            data = response.json()

        if not data.get("ok"):
            error = data.get("description", "Unknown error")
            raise HTTPException(500, f"Telegram API error: {error}")

        result = data["result"]
        invoice_link = result.get("invoice_link") or f"https://t.me/{settings.BOT_USERNAME}?start={payload}"

        return {
            "success": True,
            "invoice_link": invoice_link,
            "payload": payload
        }

    except httpx.HTTPError as e:
        raise HTTPException(500, f"Failed to create invoice: {str(e)}")

# Health Check
@app.get("/api/health")
async def health():
    return {"status": "ok", "timestamp": now_ms()}

@app.on_event("shutdown")
async def shutdown_event():
    await close()