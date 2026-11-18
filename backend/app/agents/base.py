"""
VERITAS AI - Base Autonomous Agent
Provides structured lifecycle execution, performance metrics, and real-time event broadcasting.
"""

import time
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Any, Dict
from backend.app.models.contracts import AgentExecution, AgentStatus, ResearchSession
from backend.app.models.events import StreamEvent, ResearchEventType
from backend.app.services.event_bus import event_bus
from backend.app.core.logging import logger


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class BaseAgent(ABC):
    """Abstract base class for all 6 specialized VERITAS AI agents."""
    def __init__(self, agent_id: str, agent_name: str):
        self.agent_id = agent_id
        self.agent_name = agent_name

    @abstractmethod
    async def process(self, session: ResearchSession) -> Dict[str, Any]:
        """Core execution logic implemented by each specialized agent."""
        pass

    async def run(self, session: ResearchSession, task_description: str) -> Dict[str, Any]:
        """
        Executes agent workflow with performance monitoring, error isolation,
        and real-time event distribution.
        """
        start_time = utc_now()
        start_t0 = time.perf_counter()

        exec_state = AgentExecution(
            agent_id=self.agent_id,
            agent_name=self.agent_name,
            status=AgentStatus.RUNNING,
            task=task_description,
            started_at=start_time
        )
        session.agents[self.agent_id] = exec_state

        await event_bus.publish(StreamEvent(
            event_type=ResearchEventType.AGENT_STARTED,
            session_id=session.session_id,
            data={"agent_id": self.agent_id, "agent_name": self.agent_name, "task": task_description},
            message=f"{self.agent_name} initiated: {task_description}"
        ))

        try:
            result = await self.process(session)
            elapsed_ms = int((time.perf_counter() - start_t0) * 1000)

            exec_state.status = AgentStatus.COMPLETED
            exec_state.completed_at = utc_now()
            exec_state.duration_ms = elapsed_ms
            exec_state.output_summary = result.get("summary", "Task completed successfully.")
            session.agents[self.agent_id] = exec_state

            await event_bus.publish(StreamEvent(
                event_type=ResearchEventType.AGENT_COMPLETED,
                session_id=session.session_id,
                data={
                    "agent_id": self.agent_id,
                    "agent_name": self.agent_name,
                    "duration_ms": elapsed_ms,
                    "summary": exec_state.output_summary
                },
                message=f"{self.agent_name} finished in {elapsed_ms}ms"
            ))
            return result

        except Exception as exc:
            elapsed_ms = int((time.perf_counter() - start_t0) * 1000)
            logger.error(f"Agent {self.agent_name} encountered an error: {str(exc)}", exc_info=True)

            exec_state.status = AgentStatus.FAILED
            exec_state.completed_at = utc_now()
            exec_state.duration_ms = elapsed_ms
            exec_state.error = str(exc)
            session.agents[self.agent_id] = exec_state

            await event_bus.publish(StreamEvent(
                event_type=ResearchEventType.AGENT_PROGRESS,
                session_id=session.session_id,
                data={"agent_id": self.agent_id, "error": str(exc)},
                message=f"{self.agent_name} reported an issue: {str(exc)}"
            ))
            return {"error": str(exc), "summary": f"Recovered from error: {str(exc)}"}
