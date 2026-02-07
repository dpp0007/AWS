"""
FastAPI Backend for Chemistry Teaching Avatar
Pure Gemini API implementation - no Ollama dependency
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import google.generativeai as genai
import json
import asyncio
import os
from dotenv import load_dotenv
import logging
import uuid
import time
from datetime import datetime, timedelta
import functools
import random
import socketio

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger("elixra-backend")

class StructuredLogger:
    @staticmethod
    def log_request(service: str, action: str, params: dict, user_id: str = None, session_id: str = None):
        request_id = str(uuid.uuid4())
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "service": service,
            "request_id": request_id,
            "user_id": user_id,
            "session_id": session_id,
            "action": action,
            "params": params,
            "status": "pending",
            "log_level": "INFO"
        }
        logger.info(json.dumps(log_entry))
        return request_id

    @staticmethod
    def log_response(request_id: str, service: str, status: str, duration: float, response: dict = None, error: str = None):
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "service": service,
            "request_id": request_id,
            "status": status,
            "duration_ms": round(duration * 1000, 2),
            "response": response,
            "error": error,
            "log_level": "ERROR" if status == "error" else "INFO"
        }
        logger.info(json.dumps(log_entry))

# Circuit Breaker Implementation
class CircuitBreaker:
    def __init__(self, failure_threshold: int = 5, recovery_timeout: int = 60):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failures = 0
        self.last_failure_time = 0
        self.state = "CLOSED"  # CLOSED, OPEN, HALF-OPEN

    def record_failure(self):
        self.failures += 1
        self.last_failure_time = time.time()
        if self.failures >= self.failure_threshold:
            self.state = "OPEN"
            logger.warning(json.dumps({
                "event": "circuit_breaker_open",
                "failures": self.failures,
                "timestamp": datetime.utcnow().isoformat()
            }))

    def record_success(self):
        if self.state == "HALF-OPEN":
            self.state = "CLOSED"
            self.failures = 0
            logger.info(json.dumps({
                "event": "circuit_breaker_closed",
                "timestamp": datetime.utcnow().isoformat()
            }))
        elif self.state == "CLOSED":
            self.failures = 0

    def can_execute(self) -> bool:
        if self.state == "CLOSED":
            return True
        
        if self.state == "OPEN":
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = "HALF-OPEN"
                return True
            return False
        
        return True # HALF-OPEN

circuit_breaker = CircuitBreaker()

# Simple In-Memory Cache (L1) & File Cache (L2)
class SpectrumCache:
    def __init__(self):
        self.memory_cache = {}
        self.cache_file = "spectrum_cache.json"
        self.load_disk_cache()

    def load_disk_cache(self):
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, 'r') as f:
                    self.disk_cache = json.load(f)
            except:
                self.disk_cache = {}
        else:
            self.disk_cache = {}

    def save_disk_cache(self):
        try:
            with open(self.cache_file, 'w') as f:
                json.dump(self.disk_cache, f)
        except Exception as e:
            logger.error(f"Failed to save cache: {e}")

    def get(self, key: str) -> Optional[Dict]:
        # L1: Memory
        if key in self.memory_cache:
            entry = self.memory_cache[key]
            if time.time() < entry['expires']:
                return entry['data']
            del self.memory_cache[key]
        
        # L2: Disk
        if key in self.disk_cache:
            entry = self.disk_cache[key]
            # 24 hour TTL for disk cache
            if time.time() - entry['created_at'] < 86400: 
                # Promote to L1
                self.memory_cache[key] = {
                    'data': entry['data'],
                    'expires': time.time() + 3600 # 1 hour memory TTL
                }
                return entry['data']
            del self.disk_cache[key]
            
        return None

    def set(self, key: str, data: Dict):
        timestamp = time.time()
        # L1
        self.memory_cache[key] = {
            'data': data,
            'expires': timestamp + 3600
        }
        # L2
        self.disk_cache[key] = {
            'data': data,
            'created_at': timestamp
        }
        self.save_disk_cache()

spectrum_cache = SpectrumCache()

# --- WebSocket & Collaboration Manager ---
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

class RoomManager:
    def __init__(self):
        self.rooms = {}  # { room_id: { users: {}, active_module: 'lab', created_at: timestamp } }
        self.user_colors = [
            "#2E6B6B", # Bunsen Blue
            "#C97B49", # Copper Flame
            "#C9A9C9", # Indicator Pink
            "#7B9E7B", # Sage Green
            "#C96B49", # Terracotta
            "#9B6BC9", # Amethyst
            "#E8A838", # Amber
            "#2E8B8B"  # Teal
        ]

    def create_room(self, room_id: str):
        if room_id not in self.rooms:
            self.rooms[room_id] = {
                "users": {},
                "active_module": "lab",
                "created_at": time.time(),
                "lab_state": {},
                "quiz_state": {},
                "molecule_state": {}
            }
            logger.info(f"Room created: {room_id}")

    def add_user(self, room_id: str, sid: str, user_info: dict):
        if room_id not in self.rooms:
            self.create_room(room_id)
        
        # Assign color
        used_colors = {u['color'] for u in self.rooms[room_id]['users'].values()}
        available_colors = [c for c in self.user_colors if c not in used_colors]
        color = random.choice(available_colors) if available_colors else random.choice(self.user_colors)
        
        self.rooms[room_id]['users'][sid] = {
            **user_info,
            "color": color,
            "joined_at": time.time(),
            "cursor": {"x": 0, "y": 0}
        }
        return self.rooms[room_id]['users'][sid]

    def remove_user(self, room_id: str, sid: str):
        if room_id in self.rooms and sid in self.rooms[room_id]['users']:
            del self.rooms[room_id]['users'][sid]
            # Cleanup empty rooms after delay (handled by cleanup task usually)
            if not self.rooms[room_id]['users']:
                logger.info(f"Room empty: {room_id}")

    def update_cursor(self, room_id: str, sid: str, x: float, y: float):
        if room_id in self.rooms and sid in self.rooms[room_id]['users']:
            self.rooms[room_id]['users'][sid]['cursor'] = {"x": x, "y": y}

    def get_room_state(self, room_id: str):
        if room_id in self.rooms:
            return self.rooms[room_id]
        return None

room_manager = RoomManager()

# WebSocket Events
@sio.event
async def connect(sid, environ):
    logger.info(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    # Find user's room and remove them
    for room_id, room in room_manager.rooms.items():
        if sid in room['users']:
            room_manager.remove_user(room_id, sid)
            await sio.emit('user_left', {'sid': sid}, room=room_id)
            logger.info(f"Client disconnected: {sid} from room {room_id}")
            break

@sio.event
async def join_room(sid, data):
    # data: { room_id: str, name: str }
    room_id = data.get('room_id')
    name = data.get('name', 'Anonymous')
    
    if not room_id:
        return
    
    sio.enter_room(sid, room_id)
    user = room_manager.add_user(room_id, sid, {"name": name})
    
    # Broadcast to others
    await sio.emit('user_joined', user, room=room_id, skip_sid=sid)
    
    # Send current state to new user
    room_state = room_manager.get_room_state(room_id)
    await sio.emit('room_state', room_state, to=sid)
    
    logger.info(f"User {name} ({sid}) joined room {room_id}")

@sio.event
async def cursor_move(sid, data):
    # data: { room_id: str, x: float, y: float }
    room_id = data.get('room_id')
    x = data.get('x')
    y = data.get('y')
    
    if room_id:
        room_manager.update_cursor(room_id, sid, x, y)
        # Broadcast cursor (volatile for performance)
        await sio.emit('cursor_update', {'sid': sid, 'x': x, 'y': y}, room=room_id, skip_sid=sid)

@sio.event
async def module_change(sid, data):
    # data: { room_id: str, module: str }
    room_id = data.get('room_id')
    module = data.get('module')
    
    if room_id and module:
        room_manager.rooms[room_id]['active_module'] = module
        await sio.emit('module_changed', {'module': module, 'by': sid}, room=room_id)

@sio.event
async def lab_action(sid, data):
    # Generic lab action sync
    room_id = data.get('room_id')
    if room_id:
        await sio.emit('lab_update', data, room=room_id, skip_sid=sid)

@sio.event
async def quiz_action(sid, data):
    # data: { room_id: str, type: 'start'|'answer'|'next', payload: dict }
    room_id = data.get('room_id')
    action_type = data.get('type')
    payload = data.get('payload', {})
    
    if room_id and room_id in room_manager.rooms:
        room = room_manager.rooms[room_id]
        
        if action_type == 'start':
            # Initialize shared quiz state if not present
            if not room['quiz_state'].get('active'):
                # In a real app, generate questions here
                room['quiz_state'] = {
                    'active': True,
                    'current_question': 0,
                    'questions': payload.get('questions', []),
                    'answers': {}, # { question_idx: { user_sid: answer } }
                    'scores': {}
                }
            await sio.emit('quiz_update', {'type': 'start', 'state': room['quiz_state']}, room=room_id)
            
        elif action_type == 'answer':
            q_idx = payload.get('question_index')
            answer = payload.get('answer')
            if 'answers' not in room['quiz_state']:
                room['quiz_state']['answers'] = {}
            if q_idx not in room['quiz_state']['answers']:
                room['quiz_state']['answers'][q_idx] = {}
            
            room['quiz_state']['answers'][q_idx][sid] = answer
            # Broadcast that a user answered (without revealing the answer)
            await sio.emit('quiz_update', {'type': 'user_answered', 'sid': sid, 'question_index': q_idx}, room=room_id)

        elif action_type == 'next':
             room['quiz_state']['current_question'] += 1
             await sio.emit('quiz_update', {'type': 'next_question', 'index': room['quiz_state']['current_question']}, room=room_id)

@sio.event
async def molecule_action(sid, data):
    # data: { room_id: str, type: 'update_structure', structure: dict }
    room_id = data.get('room_id')
    structure = data.get('structure')
    
    if room_id and structure:
        room_manager.rooms[room_id]['molecule_state'] = structure
        await sio.emit('molecule_update', {'structure': structure, 'by': sid}, room=room_id, skip_sid=sid)

app = FastAPI(title="Chemistry Avatar API", version="1.0.0")

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
GEMINI_MODEL = "gemini-2.5-flash"

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class MessageHistory(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None
    chemicals: Optional[List[str]] = None
    equipment: Optional[List[str]] = None
    history: Optional[List[MessageHistory]] = None

class MoleculeGenerationRequest(BaseModel):
    query: str

class AtomRequest(BaseModel):
    id: str
    element: str
    x: float
    y: float
    z: float

class BondRequest(BaseModel):
    id: str
    from_id: str = Field(..., alias="from")
    to_id: str = Field(..., alias="to")
    type: str

class MoleculeAnalysisRequest(BaseModel):
    atoms: List[AtomRequest]
    bonds: List[BondRequest]

class SpectroscopyRequest(BaseModel):
    compound: str
    formula: str
    techniques: List[str] = ["uv-vis", "ir", "nmr"]

# --- Endpoints ---

@app.post("/spectroscopy/generate")
async def generate_spectroscopy(request: SpectroscopyRequest):
    """Generate realistic spectroscopy data for a compound"""
    start_time = time.time()
    request_id = StructuredLogger.log_request(
        service="spectroscopy", 
        action="generate", 
        params={"compound": request.compound, "formula": request.formula}
    )
    
    cache_key = f"{request.compound.lower()}-{request.formula.lower()}"
    cached_data = spectrum_cache.get(cache_key)
    
    if cached_data:
        StructuredLogger.log_response(
            request_id=request_id,
            service="spectroscopy",
            status="success",
            duration=time.time() - start_time,
            response={"source": "cache", "confidence": cached_data.get("confidence")}
        )
        return cached_data

    if not circuit_breaker.can_execute():
        raise HTTPException(status_code=503, detail="Service temporarily unavailable (Circuit Breaker Open)")

    prompt = f"""Generate realistic spectroscopy data for {request.compound} ({request.formula}).
    
    Act as a professional analytical chemist.
    Provide detailed data for the following techniques: {', '.join(request.techniques)}.

    1. UV-Vis Spectroscopy:
       - Wavelength range: 200-800 nm
       - Transitions: π→π*, n→π*, etc.
       - Absorbance: 0.0 to 2.5 AU

    2. IR Spectroscopy:
       - Wavenumber range: 400-4000 cm⁻¹
       - Functional groups
       - Intensity: strong (>80% T), medium (40-80% T), weak (<40% T)
       - NOTE: Transmittance is 0-100%. Strong peaks have LOW transmittance (e.g., 5-20%).

    3. NMR Spectroscopy (1H):
       - Shift range: 0-14 ppm
       - Splitting: singlet, doublet, triplet, quartet, multiplet
       - Integration: relative number of protons
       - J-coupling constants where applicable

    Format as a valid JSON object with this EXACT structure:
    {{
      "compound": "{request.compound}",
      "formula": "{request.formula}",
      "uvVis": {{
        "peaks": [
          {{"wavelength": 254, "absorbance": 1.2, "label": "π→π*", "intensity": "strong", "assignment": "Benzene ring"}}
        ],
        "description": "..."
      }},
      "ir": {{
        "peaks": [
          {{"wavenumber": 1715, "transmittance": 15, "label": "C=O stretch", "intensity": "strong", "assignment": "Carbonyl"}}
        ],
        "description": "..."
      }},
      "nmr": {{
        "peaks": [
          {{"shift": 7.26, "intensity": 90, "label": "Ar-H", "integration": 5, "splitting": "multiplet", "assignment": "Aromatic protons"}}
        ],
        "description": "..."
      }},
      "confidence": 0.95,
      "source": "AI-Generated based on chemical structure principles",
      "alternatives": ["Possible isomer 1", "Possible isomer 2"]
    }}

    IMPORTANT:
    - Ensure scientific accuracy for peak positions.
    - If a technique is not applicable (e.g., UV-Vis for simple alkanes), return empty peaks array.
    - Return ONLY valid JSON.
    """

    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        
        # Exponential backoff retry
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = model.generate_content(
                    prompt,
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.1,
                        response_mime_type="application/json"
                    )
                )
                
                if response.text:
                    text = response.text.strip()
                    if text.startswith("```json"): text = text[7:]
                    if text.startswith("```"): text = text[3:]
                    if text.endswith("```"): text = text[:-3]
                    
                    data = json.loads(text.strip())
                    
                    if "uvVis" not in data or "ir" not in data:
                        raise ValueError("Incomplete data structure")
                        
                    spectrum_cache.set(cache_key, data)
                    circuit_breaker.record_success()

                    duration = time.time() - start_time
                    StructuredLogger.log_response(
                        request_id=request_id,
                        service="spectroscopy",
                        status="success",
                        duration=duration,
                        response={"compound": data.get("compound"), "confidence": data.get("confidence")}
                    )
                    
                    return data
            except Exception as e:
                if attempt == max_retries - 1:
                    raise e
                time.sleep(2 ** attempt)
                
        circuit_breaker.record_failure()
        raise HTTPException(status_code=500, detail="Failed to generate valid spectroscopy data")
        
    except Exception as e:
        circuit_breaker.record_failure()
        duration = time.time() - start_time
        StructuredLogger.log_response(
            request_id=request_id,
            service="spectroscopy",
            status="error",
            duration=duration,
            error=str(e)
        )
        raise HTTPException(status_code=500, detail=f"Spectroscopy generation failed: {str(e)}")

@app.post("/generate-molecule")
async def generate_molecule(request: MoleculeGenerationRequest):
    """Generate 3D molecule structure from query using Gemini"""
    print(f"🧪 Generating molecule for query: '{request.query}'")
    prompt = f"""Generate the 3D molecular structure for: {request.query}
    
    Return a valid JSON object with this EXACT structure:
    {{
      "name": "Molecule Name",
      "formula": "Chemical Formula",
      "description": "Short description",
      "atoms": [
        {{ "id": "a1", "element": "C", "x": 0.0, "y": 0.0, "z": 0.0, "color": "#909090" }}
      ],
      "bonds": [
        {{ "id": "b1", "from": "a1", "to": "a2", "type": "single" }}
      ],
      "molecularWeight": 0.0,
      "difficulty": "intermediate",
      "tags": ["tag1", "tag2"]
    }}
    
    IMPORTANT:
    1. Coordinates (x,y,z) should be in Angstroms, centered at 0,0,0.
    2. Bond types: single, double, triple, aromatic.
    3. Element symbols must be standard (C, H, O, N, etc).
    4. Colors should be standard CPK colors (C: #909090, H: #FFFFFF, O: #FF0D0D, N: #3050F8, etc).
    5. Ensure the structure is chemically valid.
    6. Return ONLY valid JSON.
    """
    
    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.1,
                response_mime_type="application/json"
            )
        )
        
        if response.text:
            text = response.text.strip()
            if text.startswith("```json"): text = text[7:]
            if text.startswith("```"): text = text[3:]
            if text.endswith("```"): text = text[:-3]
            
            data = json.loads(text.strip())
            print(f"✓ Generated: {data.get('name')}")
            return data
            
        raise HTTPException(status_code=500, detail="Empty response from AI")
        
    except Exception as e:
        print(f"Error generating molecule: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-molecule")
async def analyze_molecule(request: MoleculeAnalysisRequest):
    """Analyze a molecule structure using Gemini"""
    start_time = time.time()
    request_id = str(int(time.time() * 1000))
    print(f"[{request_id}] 🧪 ANALYSIS REQUEST STARTED")
    
    try:
        atom_list = ", ".join([f"{a.element} (ID: {a.id})" for a in request.atoms])
        bond_list = ", ".join([f"{b.type} bond between {b.from_id} and {b.to_id}" for b in request.bonds])
        
        prompt = f"""Analyze this molecular structure:
        Atoms: {atom_list}
        Bonds: {bond_list}
        
        Provide a comprehensive analysis in valid JSON format with the following structure:
        {{
          "name": "IUPAC Name or Common Name",
          "formula": "Chemical Formula (e.g. C2H6O)",
          "molecularWeight": 0.0,
          "properties": {{
            "state": "Gas/Liquid/Solid at room temp",
            "solubility": "Solubility description",
            "polarity": "Polar/Non-polar",
            "boilingPoint": "Estimated boiling point in Celsius (number only)",
            "meltingPoint": "Estimated melting point in Celsius (number only)"
          }},
          "stability": "Stable/Unstable",
          "safety": {{
            "flammability": "Low/Medium/High",
            "toxicity": "Description",
            "handling": "Precautions"
          }},
          "uses": ["Industrial use", "Common use", "Research"],
          "description": "A detailed 2-3 sentence description of the molecule and its significance.",
          "functionalGroups": ["Alcohol", "Amine", "Ketone", etc]
        }}
        """
        
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.2,
                response_mime_type="application/json"
            )
        )
        
        if response.text:
            text = response.text.strip()
            if text.startswith("```json"): text = text[7:]
            if text.startswith("```"): text = text[3:]
            if text.endswith("```"): text = text[:-3]
            data = json.loads(text.strip())
            return data
            
        raise HTTPException(status_code=500, detail="Empty response from AI")
        
    except Exception as e:
        print(f"[{request_id}] ✗ ANALYSIS FAILED: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "Chemistry Teaching Avatar",
        "version": "1.0.0",
        "model": GEMINI_MODEL
    }

@app.get("/health")
async def health_check():
    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = model.generate_content("test", stream=False)
        return {"status": "healthy", "gemini": "connected"}
    except Exception as e:
        return {"status": "degraded", "gemini": "disconnected", "error": str(e)}

async def generate_stream(query: str, context: str = "", chemicals: List[str] = None, equipment: List[str] = None, history: List[dict] = None):
    system_prompt = "You are ERA, an expert chemistry teacher..."
    user_prompt = f"Student question: {query}"
    
    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = model.generate_content(
            f"{system_prompt}\\n\\n{user_prompt}",
            stream=True,
            generation_config=genai.types.GenerationConfig(temperature=0.7)
        )
        for chunk in response:
            if chunk.text:
                yield json.dumps({"token": chunk.text}) + "\\n"
    except Exception as e:
        yield json.dumps({"token": str(e), "error": True}) + "\\n"

@app.post("/chat")
async def chat(request: ChatRequest):
    history = [h.dict() if hasattr(h, 'dict') else h for h in (request.history or [])]
    return StreamingResponse(
        generate_stream(request.message, request.context, request.chemicals, request.equipment, history),
        media_type="application/x-ndjson"
    )

@app.post("/analyze-reaction")
async def analyze_reaction(request: ChatRequest):
    if not request.chemicals or len(request.chemicals) < 2:
        raise HTTPException(status_code=400, detail="At least 2 chemicals required")
    
    prompt = f"Analyze this chemical reaction: {', '.join(request.chemicals)}"
    
    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        config = genai.types.GenerationConfig(temperature=0.1, response_mime_type="application/json")
        response = model.generate_content(prompt, generation_config=config)
        
        if response.text:
            text = response.text.strip()
            if text.startswith("```json"): text = text[7:]
            if text.startswith("```"): text = text[3:]
            if text.endswith("```"): text = text[:-3]
            return json.loads(text.strip())
            
        raise HTTPException(status_code=500, detail="No valid response from AI")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            async for token_data in generate_stream(message_data.get('message', '')):
                await websocket.send_text(token_data)
            await websocket.send_text(json.dumps({"done": True}) + "\\n")
    except WebSocketDisconnect:
        pass
    except Exception:
        await websocket.close()

# Quiz Models
class QuizConfig(BaseModel):
    difficulty: str
    num_questions: int
    question_types: List[str]
    include_timer: bool
    time_limit_per_question: Optional[int] = None
    user_id: Optional[str] = None

class QuizSession(BaseModel):
    session_id: str
    config: QuizConfig
    questions: List[Dict] = []
    current_question_index: int = 0
    user_answers: Dict[int, Any] = {}
    completed: bool = False

quiz_sessions = {}

@app.post("/quiz/generate")
async def generate_quiz(config: QuizConfig):
    session_id = str(uuid.uuid4())
    questions = []
    for i in range(config.num_questions):
        questions.append({
            "id": i+1,
            "question_text": f"Sample Question {i+1} ({config.difficulty})",
            "question_type": "mcq",
            "options": ["A", "B", "C", "D"],
            "correct_answer": "A",
            "explanation": "Explanation here",
            "topic": "General Chemistry"
        })
    
    session = QuizSession(session_id=session_id, config=config, questions=questions)
    quiz_sessions[session_id] = session
    return {
        "session_id": session_id,
        "total_questions": len(questions),
        "first_question": questions[0]
    }

# Mount Socket.IO App
app = socketio.ASGIApp(sio, app)

if __name__ == "__main__":
    import uvicorn
    print("=" * 60)
    print("🧪 Chemistry Avatar API Starting...")
    print("=" * 60)
    print(f"✓ Using model: {GEMINI_MODEL}")
    print("✓ Backend URL: http://localhost:8000")
    print("✓ API Docs: http://localhost:8000/docs")
    print("✓ Health Check: http://localhost:8000/health")
    print("=" * 60)
    uvicorn.run(app, host="0.0.0.0", port=8000)
