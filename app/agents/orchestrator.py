"""Orchestrator - Coordinates all CLEARTHINK agents sequentially."""

from typing import Dict, Any, List
import asyncio

from .problem_framing import ProblemFramingAgent
from .option_generator import OptionGeneratorAgent
from .assumption_detector import AssumptionDetectorAgent
from .second_order_thinking import SecondOrderThinkingAgent
from .bias_detection import BiasDetectionAgent
from .decision_summary import DecisionSummaryAgent


class ClearThinkOrchestrator:
    """Orchestrates all 6 CLEARTHINK agents in sequence."""
    
    def __init__(self):
        self.agents = [
            ProblemFramingAgent(),
            OptionGeneratorAgent(),
            AssumptionDetectorAgent(),
            SecondOrderThinkingAgent(),
            BiasDetectionAgent(),
            DecisionSummaryAgent(),
        ]
    
    async def analyze(self, decision_input: str) -> Dict[str, Any]:
        """
        Run the full CLEARTHINK analysis pipeline.
        
        Args:
            decision_input: The user's decision/problem description
            
        Returns:
            Complete analysis results from all agents
        """
        results: List[Dict[str, Any]] = []
        context: Dict[str, str] = {}
        
        for agent in self.agents:
            try:
                # Run the agent with accumulated context
                result = await agent.run(decision_input, context)
                results.append(result)
                
                # Add this agent's result to context for next agents
                context[agent.name] = result["result"]
                
            except Exception as e:
                results.append({
                    "agent": agent.name,
                    "emoji": agent.emoji,
                    "result": f"Error during analysis: {str(e)}",
                    "error": True
                })
        
        return {
            "input": decision_input,
            "agents": results,
            "agent_count": len(results),
            "success": all(not r.get("error", False) for r in results)
        }
    
    async def analyze_streaming(self, decision_input: str):
        """
        Generator that yields results as each agent completes.
        Useful for real-time UI updates.
        """
        context: Dict[str, str] = {}
        
        for i, agent in enumerate(self.agents):
            yield {
                "status": "processing",
                "current_agent": agent.name,
                "current_emoji": agent.emoji,
                "progress": i / len(self.agents)
            }
            
            try:
                result = await agent.run(decision_input, context)
                context[agent.name] = result["result"]
                
                yield {
                    "status": "agent_complete",
                    "agent": agent.name,
                    "emoji": agent.emoji,
                    "result": result["result"],
                    "progress": (i + 1) / len(self.agents)
                }
                
            except Exception as e:
                yield {
                    "status": "agent_error",
                    "agent": agent.name,
                    "emoji": agent.emoji,
                    "error": str(e),
                    "progress": (i + 1) / len(self.agents)
                }
        
        yield {"status": "complete", "progress": 1.0}
