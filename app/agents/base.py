"""Base agent class for all CLEARTHINK agents."""

from abc import ABC, abstractmethod
from typing import Any, Dict
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from app.config import settings


class BaseAgent(ABC):
    """Abstract base class for all CLEARTHINK agents."""
    
    def __init__(self):
        self.llm = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model_name=settings.MODEL_NAME,
            temperature=0.7,
        )
        self.output_parser = StrOutputParser()
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Agent name for display purposes."""
        pass
    
    @property
    @abstractmethod
    def system_prompt(self) -> str:
        """System prompt that defines the agent's behavior."""
        pass
    
    @property
    def emoji(self) -> str:
        """Emoji icon for the agent."""
        return "🤖"
    
    def create_chain(self, user_input: str, context: Dict[str, Any] = None):
        """Create the LangChain chain for this agent."""
        context = context or {}
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", self.system_prompt),
            ("human", "{input}\n\nContext from previous agents:\n{context}")
        ])
        
        chain = prompt | self.llm | self.output_parser
        return chain
    
    async def run(self, user_input: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Execute the agent's analysis."""
        context = context or {}
        chain = self.create_chain(user_input, context)
        
        context_str = "\n".join([
            f"**{k}**: {v}" for k, v in context.items()
        ]) if context else "No previous context."
        
        result = await chain.ainvoke({
            "input": user_input,
            "context": context_str
        })
        
        return {
            "agent": self.name,
            "emoji": self.emoji,
            "result": result
        }
