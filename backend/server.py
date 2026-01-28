from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest, CheckoutSessionResponse, CheckoutStatusResponse

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'smart_cooking_secret')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

# Stripe Config
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')

# LLM Config
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Subscription Plans
FREE_RECIPES_LIMIT = 50
UNLIMITED_PRICE = 2.99

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    plan: str
    recipes_generated_this_month: int
    created_at: str

class TokenResponse(BaseModel):
    token: str
    user: UserResponse

class RecipeGenerateRequest(BaseModel):
    ingredients: List[str]
    category: str = "salato"  # salato, dolce, veloce
    servings: int = 4

class RecipeResponse(BaseModel):
    id: str
    title: str
    description: str
    ingredients: List[str]
    instructions: List[str]
    prep_time: str
    cook_time: str
    servings: int
    category: str
    tips: Optional[str] = None
    substitutions: Optional[List[str]] = None
    created_at: str
    user_id: str

class SavedRecipeResponse(BaseModel):
    id: str
    recipe_id: str
    title: str
    description: str
    ingredients: List[str]
    instructions: List[str]
    prep_time: str
    cook_time: str
    servings: int
    category: str
    tips: Optional[str] = None
    substitutions: Optional[List[str]] = None
    saved_at: str

class CheckoutRequest(BaseModel):
    origin_url: str

class PaymentStatusResponse(BaseModel):
    status: str
    payment_status: str
    amount_total: float
    currency: str

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Token mancante")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Utente non trovato")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token scaduto")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token non valido")

async def get_optional_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        return user
    except:
        return None

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email già registrata")
    
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    user = {
        "id": user_id,
        "email": data.email,
        "password": hash_password(data.password),
        "name": data.name,
        "plan": "free",
        "recipes_generated_this_month": 0,
        "month_reset": datetime.now(timezone.utc).strftime("%Y-%m"),
        "created_at": now
    }
    
    await db.users.insert_one(user)
    
    token = create_token(user_id)
    user_response = UserResponse(
        id=user_id,
        email=data.email,
        name=data.name,
        plan="free",
        recipes_generated_this_month=0,
        created_at=now
    )
    
    return TokenResponse(token=token, user=user_response)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Credenziali non valide")
    
    # Reset monthly counter if new month
    current_month = datetime.now(timezone.utc).strftime("%Y-%m")
    if user.get("month_reset") != current_month:
        await db.users.update_one(
            {"id": user["id"]},
            {"$set": {"recipes_generated_this_month": 0, "month_reset": current_month}}
        )
        user["recipes_generated_this_month"] = 0
    
    token = create_token(user["id"])
    user_response = UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        plan=user.get("plan", "free"),
        recipes_generated_this_month=user.get("recipes_generated_this_month", 0),
        created_at=user["created_at"]
    )
    
    return TokenResponse(token=token, user=user_response)

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    # Reset monthly counter if new month
    current_month = datetime.now(timezone.utc).strftime("%Y-%m")
    if user.get("month_reset") != current_month:
        await db.users.update_one(
            {"id": user["id"]},
            {"$set": {"recipes_generated_this_month": 0, "month_reset": current_month}}
        )
        user["recipes_generated_this_month"] = 0
    
    return UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        plan=user.get("plan", "free"),
        recipes_generated_this_month=user.get("recipes_generated_this_month", 0),
        created_at=user["created_at"]
    )

# ==================== RECIPE GENERATION ====================

@api_router.post("/recipes/generate", response_model=RecipeResponse)
async def generate_recipe(data: RecipeGenerateRequest, user: dict = Depends(get_current_user)):
    # Check usage limits
    current_month = datetime.now(timezone.utc).strftime("%Y-%m")
    if user.get("month_reset") != current_month:
        await db.users.update_one(
            {"id": user["id"]},
            {"$set": {"recipes_generated_this_month": 0, "month_reset": current_month}}
        )
        user["recipes_generated_this_month"] = 0
    
    if user.get("plan") != "unlimited" and user.get("recipes_generated_this_month", 0) >= FREE_RECIPES_LIMIT:
        raise HTTPException(
            status_code=403, 
            detail=f"Hai raggiunto il limite di {FREE_RECIPES_LIMIT} ricette mensili. Passa a Unlimited per ricette illimitate!"
        )
    
    # Generate recipe with AI
    category_prompts = {
        "salato": "un piatto salato italiano",
        "dolce": "un dolce o dessert italiano",
        "veloce": "un piatto veloce pronto in massimo 20 minuti"
    }
    
    category_desc = category_prompts.get(data.category, "un piatto italiano")
    
    prompt = f"""Sei uno chef italiano esperto. Crea una ricetta per {category_desc} usando questi ingredienti: {', '.join(data.ingredients)}.
    
La ricetta deve essere per {data.servings} persone.

Rispondi SOLO in formato JSON valido con questa struttura esatta:
{{
    "title": "Nome della ricetta",
    "description": "Breve descrizione appetitosa della ricetta (2-3 frasi)",
    "ingredients": ["ingrediente 1 con quantità", "ingrediente 2 con quantità"],
    "instructions": ["Passo 1", "Passo 2", "Passo 3"],
    "prep_time": "tempo di preparazione (es. 15 minuti)",
    "cook_time": "tempo di cottura (es. 30 minuti)",
    "tips": "Un consiglio dello chef per rendere il piatto perfetto",
    "substitutions": ["Puoi sostituire X con Y", "Se non hai Z usa W"]
}}

NON aggiungere testo prima o dopo il JSON."""

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"recipe-{uuid.uuid4()}",
            system_message="Sei uno chef italiano professionista. Rispondi sempre in italiano e solo in formato JSON valido."
        ).with_model("gemini", "gemini-3-flash-preview")
        
        response = await chat.send_message(UserMessage(text=prompt))
        
        # Parse JSON response
        import json
        # Clean response - remove markdown code blocks if present
        clean_response = response.strip()
        if clean_response.startswith("```json"):
            clean_response = clean_response[7:]
        if clean_response.startswith("```"):
            clean_response = clean_response[3:]
        if clean_response.endswith("```"):
            clean_response = clean_response[:-3]
        clean_response = clean_response.strip()
        
        recipe_data = json.loads(clean_response)
        
        recipe_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        recipe = {
            "id": recipe_id,
            "title": recipe_data.get("title", "Ricetta Senza Nome"),
            "description": recipe_data.get("description", ""),
            "ingredients": recipe_data.get("ingredients", data.ingredients),
            "instructions": recipe_data.get("instructions", []),
            "prep_time": recipe_data.get("prep_time", "N/A"),
            "cook_time": recipe_data.get("cook_time", "N/A"),
            "servings": data.servings,
            "category": data.category,
            "tips": recipe_data.get("tips"),
            "substitutions": recipe_data.get("substitutions"),
            "created_at": now,
            "user_id": user["id"]
        }
        
        # Save recipe to history
        await db.recipes.insert_one(recipe)
        
        # Update user's recipe count
        await db.users.update_one(
            {"id": user["id"]},
            {"$inc": {"recipes_generated_this_month": 1}}
        )
        
        return RecipeResponse(**recipe)
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error: {e}, response: {response[:500]}")
        raise HTTPException(status_code=500, detail="Errore nel generare la ricetta. Riprova.")
    except Exception as e:
        logger.error(f"Recipe generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Errore nel generare la ricetta: {str(e)}")

# ==================== SAVED RECIPES ====================

@api_router.post("/recipes/{recipe_id}/save")
async def save_recipe(recipe_id: str, user: dict = Depends(get_current_user)):
    # Check if recipe exists
    recipe = await db.recipes.find_one({"id": recipe_id}, {"_id": 0})
    if not recipe:
        raise HTTPException(status_code=404, detail="Ricetta non trovata")
    
    # Check if already saved
    existing = await db.saved_recipes.find_one({"recipe_id": recipe_id, "user_id": user["id"]})
    if existing:
        raise HTTPException(status_code=400, detail="Ricetta già salvata")
    
    saved = {
        "id": str(uuid.uuid4()),
        "recipe_id": recipe_id,
        "user_id": user["id"],
        "title": recipe["title"],
        "description": recipe["description"],
        "ingredients": recipe["ingredients"],
        "instructions": recipe["instructions"],
        "prep_time": recipe["prep_time"],
        "cook_time": recipe["cook_time"],
        "servings": recipe["servings"],
        "category": recipe["category"],
        "tips": recipe.get("tips"),
        "substitutions": recipe.get("substitutions"),
        "saved_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.saved_recipes.insert_one(saved)
    return {"message": "Ricetta salvata!", "id": saved["id"]}

@api_router.delete("/recipes/saved/{saved_id}")
async def unsave_recipe(saved_id: str, user: dict = Depends(get_current_user)):
    result = await db.saved_recipes.delete_one({"id": saved_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Ricetta salvata non trovata")
    return {"message": "Ricetta rimossa dai preferiti"}

@api_router.get("/recipes/saved", response_model=List[SavedRecipeResponse])
async def get_saved_recipes(user: dict = Depends(get_current_user)):
    saved = await db.saved_recipes.find({"user_id": user["id"]}, {"_id": 0}).sort("saved_at", -1).to_list(100)
    return [SavedRecipeResponse(**s) for s in saved]

@api_router.get("/recipes/history", response_model=List[RecipeResponse])
async def get_recipe_history(user: dict = Depends(get_current_user)):
    recipes = await db.recipes.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return [RecipeResponse(**r) for r in recipes]

# ==================== SHARING ====================

@api_router.get("/recipes/shared/{recipe_id}")
async def get_shared_recipe(recipe_id: str):
    recipe = await db.recipes.find_one({"id": recipe_id}, {"_id": 0, "user_id": 0})
    if not recipe:
        raise HTTPException(status_code=404, detail="Ricetta non trovata")
    return recipe

# ==================== PAYMENTS ====================

@api_router.post("/payments/checkout")
async def create_checkout(data: CheckoutRequest, request: Request, user: dict = Depends(get_current_user)):
    if user.get("plan") == "unlimited":
        raise HTTPException(status_code=400, detail="Hai già un abbonamento Unlimited attivo")
    
    try:
        host_url = str(request.base_url).rstrip('/')
        webhook_url = f"{host_url}/api/webhook/stripe"
        
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        success_url = f"{data.origin_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{data.origin_url}/pricing"
        
        checkout_request = CheckoutSessionRequest(
            amount=UNLIMITED_PRICE,
            currency="eur",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "user_id": user["id"],
                "user_email": user["email"],
                "plan": "unlimited"
            }
        )
        
        session = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Create payment transaction record
        transaction = {
            "id": str(uuid.uuid4()),
            "session_id": session.session_id,
            "user_id": user["id"],
            "user_email": user["email"],
            "amount": UNLIMITED_PRICE,
            "currency": "eur",
            "status": "pending",
            "payment_status": "initiated",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.payment_transactions.insert_one(transaction)
        
        return {"url": session.url, "session_id": session.session_id}
        
    except Exception as e:
        logger.error(f"Checkout error: {e}")
        raise HTTPException(status_code=500, detail=f"Errore nel creare il checkout: {str(e)}")

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, request: Request, user: dict = Depends(get_current_user)):
    try:
        host_url = str(request.base_url).rstrip('/')
        webhook_url = f"{host_url}/api/webhook/stripe"
        
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        status = await stripe_checkout.get_checkout_status(session_id)
        
        # Update transaction status
        transaction = await db.payment_transactions.find_one({"session_id": session_id})
        
        if status.payment_status == "paid" and transaction and transaction.get("payment_status") != "paid":
            # Update transaction
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"status": "complete", "payment_status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            
            # Upgrade user to unlimited
            await db.users.update_one(
                {"id": user["id"]},
                {"$set": {"plan": "unlimited", "upgraded_at": datetime.now(timezone.utc).isoformat()}}
            )
        elif status.status == "expired":
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"status": "expired", "payment_status": "failed"}}
            )
        
        return PaymentStatusResponse(
            status=status.status,
            payment_status=status.payment_status,
            amount_total=status.amount_total / 100,  # Convert from cents
            currency=status.currency
        )
        
    except Exception as e:
        logger.error(f"Payment status error: {e}")
        raise HTTPException(status_code=500, detail=f"Errore nel verificare il pagamento: {str(e)}")

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    try:
        body = await request.body()
        signature = request.headers.get("Stripe-Signature")
        
        host_url = str(request.base_url).rstrip('/')
        webhook_url = f"{host_url}/api/webhook/stripe"
        
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == "paid":
            user_id = webhook_response.metadata.get("user_id")
            if user_id:
                await db.payment_transactions.update_one(
                    {"session_id": webhook_response.session_id},
                    {"$set": {"status": "complete", "payment_status": "paid"}}
                )
                await db.users.update_one(
                    {"id": user_id},
                    {"$set": {"plan": "unlimited", "upgraded_at": datetime.now(timezone.utc).isoformat()}}
                )
        
        return {"received": True}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"received": True}

# ==================== HEALTH CHECK ====================

@api_router.get("/")
async def root():
    return {"message": "Smart Cooking API", "status": "online"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
