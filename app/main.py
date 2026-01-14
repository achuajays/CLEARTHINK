"""FastAPI application for CLEARTHINK."""

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
import json
import asyncio
from typing import Optional

from app.agents import ClearThinkOrchestrator
from app.config import settings


# Request/Response models
class DecisionRequest(BaseModel):
    """Request model for decision analysis."""
    decision: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "decision": "Should I change my career from engineering to product management?"
            }
        }


class AgentResult(BaseModel):
    """Result from a single agent."""
    agent: str
    emoji: str
    result: str
    error: Optional[bool] = False


class AnalysisResponse(BaseModel):
    """Full analysis response."""
    input: str
    agents: list[AgentResult]
    agent_count: int
    success: bool


# Create FastAPI app
app = FastAPI(
    title="CLEARTHINK",
    description="Multi-Agent Decision Making System - Think clearly, decide wisely.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Initialize orchestrator
orchestrator = ClearThinkOrchestrator()


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "CLEARTHINK"}


@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_decision(request: DecisionRequest):
    """
    Analyze a decision using all 6 CLEARTHINK agents.
    
    Process:
    1. Problem Framing - Clarify the decision
    2. Option Generator - Generate realistic options
    3. Assumption Detector - Find hidden assumptions
    4. Second-Order Thinking - Explore consequences
    5. Bias Detection - Identify cognitive biases
    6. Decision Summary - Synthesize recommendations
    """
    if not request.decision.strip():
        raise HTTPException(status_code=400, detail="Decision text cannot be empty")
    
    try:
        settings.validate()
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    result = await orchestrator.analyze(request.decision)
    return result


@app.get("/api/analyze/stream")
async def analyze_decision_stream(decision: str):
    """
    Stream analysis results as each agent completes.
    Uses Server-Sent Events (SSE) for real-time updates.
    """
    if not decision.strip():
        raise HTTPException(status_code=400, detail="Decision text cannot be empty")
    
    try:
        settings.validate()
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    async def generate():
        async for update in orchestrator.analyze_streaming(decision):
            yield f"data: {json.dumps(update)}\n\n"
            await asyncio.sleep(0.1)  # Small delay for client processing
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
async def serve_ui():
    """Serve the main UI."""
    return FileResponse("static/index.html")
