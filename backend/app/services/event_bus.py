"""
VERITAS AI - Asynchronous Event Bus & SSE Broadcaster
Broadcasts real-time events to connected clients with buffering and disconnect cleanup.
"""

import asyncio
from typing import Dict, Set, Optional
from backend.app.models.events import StreamEvent
from backend.app.core.logging import logger


class EventBus:
    """Manages active SSE subscriber queues per research session."""
    def __init__(self):
        # session_id -> Set of asyncio.Queue
        self._subscribers: Dict[str, Set[asyncio.Queue]] = {}
        # session_id -> List of historical events for reconnection playback
        self._history: Dict[str, list[StreamEvent]] = {}
        self._lock = asyncio.Lock()

    async def subscribe(self, session_id: str) -> asyncio.Queue:
        """Subscribes an SSE connection to a session stream."""
        queue: asyncio.Queue = asyncio.Queue()
        async with self._lock:
            if session_id not in self._subscribers:
                self._subscribers[session_id] = set()
            self._subscribers[session_id].add(queue)

            # Replay historical events for this session if any exist
            if session_id in self._history:
                for event in self._history[session_id]:
                    await queue.put(event)

        logger.debug(f"Client subscribed to session {session_id}. Total active: {len(self._subscribers.get(session_id, set()))}")
        return queue

    async def unsubscribe(self, session_id: str, queue: asyncio.Queue):
        """Removes a subscriber queue when client disconnects."""
        async with self._lock:
            if session_id in self._subscribers:
                self._subscribers[session_id].discard(queue)
                if not self._subscribers[session_id]:
                    del self._subscribers[session_id]

    async def publish(self, event: StreamEvent):
        """Publishes an event to all active subscribers for the session."""
        session_id = event.session_id
        async with self._lock:
            if session_id not in self._history:
                self._history[session_id] = []
            self._history[session_id].append(event)
            # Bound history size per session to prevent unbounded memory growth
            if len(self._history[session_id]) > 200:
                self._history[session_id] = self._history[session_id][-150:]

            subscribers = self._subscribers.get(session_id, set()).copy()

        for queue in subscribers:
            try:
                queue.put_nowait(event)
            except asyncio.QueueFull:
                logger.warning(f"Subscriber queue full for session {session_id}")


event_bus = EventBus()
