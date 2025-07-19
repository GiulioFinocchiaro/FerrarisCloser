from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
import os
import logging
from datetime import datetime, timedelta
import uuid
from typing import Dict, List, Optional
from pydantic import BaseModel
import asyncio
from emergentintegrations.llm.chat import LlmChat, UserMessage

# Enhanced logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Sistema Gestione Lista Elettorale")

# Enhanced CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# MongoDB setup
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'lista_elettorale')

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# Gemini AI setup
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')

# Collections
users_collection = db.users
candidates_collection = db.candidates
campaigns_collection = db.campaigns
programs_collection = db.programs

# Models
class User(BaseModel):
    id: Optional[str] = None
    email: str
    password: str
    name: str
    role: str  # visitor, candidate, admin, grafico
    created_at: Optional[datetime] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class Candidate(BaseModel):
    id: Optional[str] = None
    user_id: str
    name: str
    class_year: str
    description: str
    photo: Optional[str] = None  # base64
    manifesto: Optional[str] = None
    created_at: Optional[datetime] = None

class Campaign(BaseModel):
    id: Optional[str] = None
    candidate_id: str
    title: str
    description: str
    status: str  # draft, active, completed
    events: Optional[List[Dict]] = []
    materials: Optional[List[Dict]] = []
    created_at: Optional[datetime] = None

class ProgramGenerationRequest(BaseModel):
    candidate_name: str
    class_year: str
    main_issues: List[str]
    personal_values: List[str]
    school_context: str

class ElectoralProgram(BaseModel):
    id: Optional[str] = None
    candidate_id: str
    title: str
    content: str
    generated_by_ai: bool = False
    created_at: Optional[datetime] = None

# Auth helpers
def verify_token(token: str):
    # Simple token verification - in production use JWT
    user = users_collection.find_one({"token": token})
    return user

@app.get("/")
async def root():
    return {"message": "Sistema Gestione Lista Elettorale API", "status": "running"}

# Auth endpoints
@app.post("/api/auth/register")
async def register(user: User):
    try:
        user_dict = user.dict()
        user_dict['id'] = str(uuid.uuid4())
        user_dict['created_at'] = datetime.utcnow()
        user_dict['token'] = str(uuid.uuid4())
        
        users_collection.insert_one(user_dict)
        
        return {
            "success": True,
            "user": {
                "id": user_dict['id'],
                "name": user_dict['name'],
                "email": user_dict['email'],
                "role": user_dict['role'],
                "token": user_dict['token']
            }
        }
    except DuplicateKeyError:
        raise HTTPException(status_code=400, detail="Email già registrata")
    except Exception as e:
        logger.error(f"Errore registrazione: {e}")
        raise HTTPException(status_code=500, detail="Errore interno del server")

@app.post("/api/auth/login")
async def login(request: LoginRequest):
    try:
        user = users_collection.find_one({"email": request.email, "password": request.password})
        if not user:
            raise HTTPException(status_code=401, detail="Credenziali non valide")
        
        # Update token
        new_token = str(uuid.uuid4())
        users_collection.update_one({"_id": user["_id"]}, {"$set": {"token": new_token}})
        
        return {
            "success": True,
            "user": {
                "id": user['id'],
                "name": user['name'],
                "email": user['email'],
                "role": user['role'],
                "token": new_token
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Errore login: {e}")
        raise HTTPException(status_code=500, detail="Errore interno del server")

# Candidates endpoints
@app.get("/api/candidates")
async def get_candidates():
    try:
        candidates = list(candidates_collection.find({}))
        for candidate in candidates:
            candidate['_id'] = str(candidate['_id'])
        return {"success": True, "candidates": candidates}
    except Exception as e:
        logger.error(f"Errore recupero candidati: {e}")
        raise HTTPException(status_code=500, detail="Errore interno del server")

@app.post("/api/candidates")
async def create_candidate(candidate: Candidate):
    try:
        candidate_dict = candidate.dict()
        candidate_dict['id'] = str(uuid.uuid4())
        candidate_dict['created_at'] = datetime.utcnow()
        
        result = candidates_collection.insert_one(candidate_dict)
        
        # Remove MongoDB _id from response
        candidate_dict.pop('_id', None)
        
        return {"success": True, "candidate": candidate_dict}
    except Exception as e:
        logger.error(f"Errore creazione candidato: {e}")
        raise HTTPException(status_code=500, detail="Errore interno del server")

@app.get("/api/candidates/{candidate_id}")
async def get_candidate(candidate_id: str):
    try:
        candidate = candidates_collection.find_one({"id": candidate_id})
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidato non trovato")
        
        candidate['_id'] = str(candidate['_id'])
        return {"success": True, "candidate": candidate}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Errore recupero candidato: {e}")
        raise HTTPException(status_code=500, detail="Errore interno del server")

# Campaigns endpoints
@app.get("/api/campaigns/{candidate_id}")
async def get_candidate_campaigns(candidate_id: str):
    try:
        campaigns = list(campaigns_collection.find({"candidate_id": candidate_id}))
        for campaign in campaigns:
            campaign['_id'] = str(campaign['_id'])
        return {"success": True, "campaigns": campaigns}
    except Exception as e:
        logger.error(f"Errore recupero campagne: {e}")
        raise HTTPException(status_code=500, detail="Errore interno del server")

@app.post("/api/campaigns")
async def create_campaign(campaign: Campaign):
    try:
        campaign_dict = campaign.dict()
        campaign_dict['id'] = str(uuid.uuid4())
        campaign_dict['created_at'] = datetime.utcnow()
        
        result = campaigns_collection.insert_one(campaign_dict)
        
        # Remove MongoDB _id from response
        campaign_dict.pop('_id', None)
        
        return {"success": True, "campaign": campaign_dict}
    except Exception as e:
        logger.error(f"Errore creazione campagna: {e}")
        raise HTTPException(status_code=500, detail="Errore interno del server")

# AI Program Generation - THE KILLER FEATURE!
@app.post("/api/generate-program")
async def generate_electoral_program(request: ProgramGenerationRequest):
    try:
        if not GEMINI_API_KEY:
            raise HTTPException(status_code=500, detail="API Key Gemini non configurata")
        
        # Create AI chat instance
        chat = LlmChat(
            api_key=GEMINI_API_KEY,
            session_id=f"program-gen-{uuid.uuid4()}",
            system_message="""Sei un esperto consulente politico per elezioni studentesche italiane. 
            Crei programmi elettorali coinvolgenti, realistici e specifici per studenti delle scuole superiori.
            Il programma deve essere professionale ma accessibile agli studenti, con proposte concrete e realizzabili."""
        ).with_model("gemini", "gemini-2.5-pro-preview-05-06").with_max_tokens(4000)
        
        # Generate program content
        prompt = f"""
        Crea un programma elettorale completo per le elezioni studentesche per:
        - Candidato: {request.candidate_name}
        - Anno scolastico: {request.class_year}
        - Principali questioni: {', '.join(request.main_issues)}
        - Valori personali: {', '.join(request.personal_values)}
        - Contesto scolastico: {request.school_context}
        
        Il programma deve includere:
        1. Titolo accattivante
        2. Presentazione del candidato
        3. Visione per la scuola
        4. 5-7 proposte concrete e specifiche
        5. Conclusione motivante
        
        Scrivi in italiano, stile professionale ma giovanile. Massimo 1500 parole.
        """
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        return {
            "success": True,
            "program": {
                "content": response,
                "generated_at": datetime.utcnow().isoformat(),
                "model_used": "gemini-2.5-pro-preview-05-06"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Errore generazione programma AI: {e}")
        raise HTTPException(status_code=500, detail=f"Errore generazione programma: {str(e)}")

@app.post("/api/programs")
async def save_program(program: ElectoralProgram):
    try:
        program_dict = program.dict()
        program_dict['id'] = str(uuid.uuid4())
        program_dict['created_at'] = datetime.utcnow()
        
        programs_collection.insert_one(program_dict)
        
        return {"success": True, "program": program_dict}
    except Exception as e:
        logger.error(f"Errore salvataggio programma: {e}")
        raise HTTPException(status_code=500, detail="Errore interno del server")

@app.get("/api/programs/{candidate_id}")
async def get_candidate_programs(candidate_id: str):
    try:
        programs = list(programs_collection.find({"candidate_id": candidate_id}))
        for program in programs:
            program['_id'] = str(program['_id'])
        return {"success": True, "programs": programs}
    except Exception as e:
        logger.error(f"Errore recupero programmi: {e}")
        raise HTTPException(status_code=500, detail="Errore interno del server")

# Dashboard stats
@app.get("/api/dashboard/stats")
async def get_dashboard_stats():
    try:
        total_candidates = candidates_collection.count_documents({})
        total_campaigns = campaigns_collection.count_documents({})
        active_campaigns = campaigns_collection.count_documents({"status": "active"})
        total_programs = programs_collection.count_documents({})
        
        return {
            "success": True,
            "stats": {
                "total_candidates": total_candidates,
                "total_campaigns": total_campaigns,
                "active_campaigns": active_campaigns,
                "total_programs": total_programs
            }
        }
    except Exception as e:
        logger.error(f"Errore statistiche dashboard: {e}")
        raise HTTPException(status_code=500, detail="Errore interno del server")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)