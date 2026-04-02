from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import redis
import json
import os
from datetime import datetime

from .services.risk_assessment import RiskAssessmentService
from .services.impact_prediction import ImpactPredictionService
from src.services.evacuation_planner import EvacuationPlanner  # type: ignore
from src.services.llm_service import LLMService  # type: ignore
from src.services.survival_probability import SurvivalProbabilityEngine  # type: ignore

app = FastAPI(title="CrisisIQ AI Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=6379,
    password=os.getenv('REDIS_PASSWORD'),
    decode_responses=True
)

@app.get("/health")
async def health() -> dict:
    mode = "demo" if os.getenv("USE_MOCK_LLM", "false").lower() == "true" else "live"
    return {"status": "ok", "mode": mode}

@app.get("/ready")
async def ready() -> dict:
    # This AI engine has no external hard dependencies to be considered "ready".
    return {"ready": True}

class AlertAnalysisRequest(BaseModel):
    alert_id: str
    alert_type: str
    severity: str
    location: dict
    parameters: Optional[dict] = None

class ScenarioSimulationRequest(BaseModel):
    scenario_id: str
    disaster_type: str
    parameters: dict
    location: dict

class ChatRequest(BaseModel):
    message: str
    context: Optional[dict] = None

class ChatResponse(BaseModel):
    response: str
    
class SurvivalRequest(BaseModel):
    severity: str
    distance_km: float
    building_type: str = "concrete"
    age: int = 30
    
class SurvivalResponse(BaseModel):
    survival_probability_percentage: float
    status_label: str

risk_service = RiskAssessmentService()
impact_service = ImpactPredictionService()
evacuation_service = EvacuationPlanner()
llm_service = LLMService()
survival_engine = SurvivalProbabilityEngine()

def notify_backend(alert_id: str, analysis: dict):
    pass # Stub for notifying backend from background task

@app.post("/analyze/alert")
async def analyze_alert(request: AlertAnalysisRequest, background_tasks: BackgroundTasks):
    """Analyze an alert and generate AI insights"""
    try:
        # Check cache first
        cache_key = f"analysis:{request.alert_id}"
        cached = redis_client.get(cache_key)
        if cached:
            return json.loads(cached)
        
        # Perform analysis
        analysis = await perform_alert_analysis(request)
        
        # Cache results
        redis_client.setex(cache_key, 3600, json.dumps(analysis))
        
        # Notify backend asynchronously
        background_tasks.add_task(notify_backend, request.alert_id, analysis)
        
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def perform_alert_analysis(request: AlertAnalysisRequest) -> dict:
    """Orchestrate all AI analysis components"""
    
    # 1. Risk Assessment
    risk_score = await risk_service.assess_risk(
        disaster_type=request.alert_type,
        severity=request.severity,
        location=request.location
    )
    
    # 2. Impact Prediction
    impact = await impact_service.predict_impact(
        disaster_type=request.alert_type,
        severity=request.severity,
        location=request.location,
        risk_score=risk_score
    )
    
    # 3. Resource Needs Estimation
    resources = await impact_service.estimate_resources(
        estimated_affected=impact['estimated_affected'],
        disaster_type=request.alert_type
    )
    
    # 4. Evacuation Routes
    evacuation_routes = await evacuation_service.plan_routes(
        origin=request.location,
        disaster_type=request.alert_type,
        affected_radius=impact.get('affected_radius', 10)
    )
    
    # 5. LLM-powered Recommendations
    recommendations = await llm_service.generate_recommendations(
        disaster_type=request.alert_type,
        severity=request.severity,
        impact=impact,
        context={
            'risk_score': risk_score,
            'location': request.location
        }
    )
    
    return {
        'risk_score': risk_score,
        'impact_prediction': impact,
        'resource_needs': resources,
        'evacuation_routes': evacuation_routes,
        'recommendations': recommendations,
        'survival_probability': calculate_survival_probability(
            risk_score, request.severity
        ),
        'processed_at': datetime.utcnow().isoformat()
    }

async def get_area_data(location: dict) -> dict:
    return {}

async def simulate_earthquake(magnitude: float, location: dict, area_data: dict) -> dict:
    coords = location.get('coordinates', [0, 0])
    affected_radius = float(10 + magnitude * 3.5)
    affected_zones = [
        {
            'center': coords,
            'disaster_type': 'earthquake',
            'radius': affected_radius
        }
    ]
    return {'affected_zones': affected_zones, 'affected_radius': affected_radius}

async def simulate_flood(water_level: float, location: dict, area_data: dict) -> dict:
    coords = location.get('coordinates', [0, 0])
    affected_radius = float(15 + water_level * 2.5)
    affected_zones = [
        {
            'center': coords,
            'disaster_type': 'flood',
            'radius': affected_radius
        }
    ]
    return {'affected_zones': affected_zones, 'affected_radius': affected_radius}

async def simulate_generic_disaster(disaster_type: str, parameters: dict, location: dict, area_data: dict) -> dict:
    coords = location.get('coordinates', [0, 0])
    affected_radius = float(20)
    affected_zones = [
        {
            'center': coords,
            'disaster_type': disaster_type,
            'radius': affected_radius
        }
    ]
    return {'affected_zones': affected_zones, 'affected_radius': affected_radius}

async def generate_disaster_timeline(disaster_type: str, results: dict) -> list:
    # Keep a small deterministic timeline so the frontend can render without empties.
    safe_zone_note = "Move to pre-identified safe zones and follow official updates."
    evacuate_note = "Prepare to evacuate using designated routes; avoid flooded/blocked roads."
    if disaster_type == 'flood':
        evacuate_note = "Avoid floodwaters; evacuate to higher ground immediately."
    if disaster_type == 'earthquake':
        evacuate_note = "Drop, cover, and hold on; evacuate after shaking stops if structures are unsafe."

    return [
        {
            'hour': 0,
            'event': f'{disaster_type.replace("_", " ").title()} warning issued',
            'recommendation': safe_zone_note
        },
        {
            'hour': 2,
            'event': 'Evacuation planning window',
            'recommendation': evacuate_note
        },
        {
            'hour': 6,
            'event': 'Resource deployment and coordination',
            'recommendation': 'Coordinate with responders, check-in on vulnerable neighbors, and conserve power.'
        }
    ]

@app.post("/simulate/scenario")
async def simulate_scenario(request: ScenarioSimulationRequest):
    """Run a disaster scenario simulation"""
    try:
        simulation = await run_scenario_simulation(request)
        return simulation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def run_scenario_simulation(request: ScenarioSimulationRequest) -> dict:
    """Full scenario simulation with timeline"""
    
    # Get population and infrastructure data
    area_data = await get_area_data(request.location)
    
    # Run simulation based on disaster type
    if request.disaster_type == 'earthquake':
        results = await simulate_earthquake(
            magnitude=request.parameters.get('magnitude', 6.0),
            location=request.location,
            area_data=area_data
        )
    elif request.disaster_type == 'flood':
        results = await simulate_flood(
            water_level=request.parameters.get('water_level', 2.0),
            location=request.location,
            area_data=area_data
        )
    else:
        results = await simulate_generic_disaster(
            request.disaster_type,
            request.parameters,
            request.location,
            area_data
        )
    
    # Generate timeline
    timeline = await generate_disaster_timeline(
        request.disaster_type,
        results
    )
    
    return {
        'scenario_id': request.scenario_id,
        'results': results,
        'timeline': timeline,
        'evacuation_plan': await evacuation_service.create_full_plan(
            request.location,
            results['affected_zones']
        )
    }

@app.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest):
    try:
        # LLM helper expects only the message string (context is ignored in MVP).
        response = await llm_service.chat_with_assistant(request.message)
        return ChatResponse(response=response)  # type: ignore
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/survival", response_model=SurvivalResponse)
async def predict_survival(request: SurvivalRequest):
    try:
        prob = survival_engine.calculate_survival_probability(request.dict())
        label = "Very High"
        if prob < 40:
            label = "Critical Danger"
        elif prob < 70:
            label = "Moderate Risk"
        elif prob < 90:
            label = "Good"
        return SurvivalResponse(  # type: ignore
            survival_probability_percentage=prob,
            status_label=label
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def calculate_survival_probability(risk_score: float, severity: str) -> float:
    """Calculate survival probability based on risk and severity"""
    base_probability = {
        'low': 0.99,
        'medium': 0.95,
        'high': 0.85,
        'critical': 0.70
    }.get(severity, 0.90)
    
    # Adjust based on risk score (0-100)
    adjustment = (100 - risk_score) / 100 * 0.1
    
    return min(0.99, base_probability + adjustment)
