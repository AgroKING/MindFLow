from fastapi import APIRouter
from app.api.v1 import auth, mood, journal, chat, crisis, content, insights, recommendations

api_router = APIRouter()

# Include all routers here
api_router.include_router(auth.router)
api_router.include_router(mood.router)
api_router.include_router(journal.router)
api_router.include_router(chat.router)        # Agent 3
api_router.include_router(crisis.router)      # Agent 3
api_router.include_router(content.router)     # Agent 4
api_router.include_router(insights.router)    # Agent 4
api_router.include_router(recommendations.router) # Agent 4
