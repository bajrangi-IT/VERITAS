import {
  ResearchSession,
  SystemHealth,
  Report,
  Source,
  Claim,
  ConflictRecord,
  ResearchDomain,
  ResearchDepth,
  SSEEventPayload
} from '../types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<SystemHealth> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function fetchRecentSessions(): Promise<ResearchSession[]> {
  const res = await fetch(`${API_BASE}/research`);
  if (!res.ok) throw new Error(`Failed to load sessions: ${res.statusText}`);
  return res.json();
}

export async function createResearch(params: {
  query: string;
  domain?: ResearchDomain;
  research_depth?: ResearchDepth;
  maximum_sources?: number;
}): Promise<ResearchSession> {
  const res = await fetch(`${API_BASE}/research`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: params.query,
      domain: params.domain || 'general',
      research_depth: params.research_depth || 'standard',
      maximum_sources: params.maximum_sources || 8,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Research request failed' }));
    throw new Error(errorData.detail || `Server error (${res.status})`);
  }
  return res.json();
}

export async function fetchSession(sessionId: string): Promise<ResearchSession> {
  const res = await fetch(`${API_BASE}/research/${sessionId}`);
  if (!res.ok) throw new Error(`Session ${sessionId} not found`);
  return res.json();
}

export async function fetchReport(sessionId: string): Promise<Report> {
  const res = await fetch(`${API_BASE}/research/${sessionId}/report`);
  if (!res.ok) throw new Error(`Report not available yet (${res.status})`);
  return res.json();
}

export async function fetchSources(sessionId: string): Promise<Source[]> {
  const res = await fetch(`${API_BASE}/research/${sessionId}/sources`);
  if (!res.ok) throw new Error(`Failed to load sources (${res.status})`);
  return res.json();
}

export async function fetchClaims(sessionId: string): Promise<Claim[]> {
  const res = await fetch(`${API_BASE}/research/${sessionId}/claims`);
  if (!res.ok) throw new Error(`Failed to load claims (${res.status})`);
  return res.json();
}

export async function fetchConflicts(sessionId: string): Promise<ConflictRecord[]> {
  const res = await fetch(`${API_BASE}/research/${sessionId}/conflicts`);
  if (!res.ok) throw new Error(`Failed to load conflicts (${res.status})`);
  return res.json();
}

export async function cancelSession(sessionId: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/research/${sessionId}/cancel`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to cancel session (${res.status})`);
  return res.json();
}

export function subscribeToEvents(
  sessionId: string,
  onEvent: (event: SSEEventPayload) => void,
  onError?: (err: any) => void
): () => void {
  const eventSource = new EventSource(`${API_BASE}/research/${sessionId}/events`);

  eventSource.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      onEvent(data);
    } catch (err) {
      // ignore unparseable or heartbeats
    }
  };

  const eventTypes = [
    'research_started',
    'query_decomposed',
    'agent_started',
    'agent_progress',
    'source_discovered',
    'claim_extracted',
    'claim_verified',
    'conflict_detected',
    'agent_completed',
    'research_completed',
    'research_failed',
    'research_cancelled',
  ];

  eventTypes.forEach((eventType) => {
    eventSource.addEventListener(eventType, (e: any) => {
      try {
        const payload: SSEEventPayload = JSON.parse(e.data);
        onEvent(payload);
      } catch (err) {
        console.error('Failed to parse SSE payload', err);
      }
    });
  });

  eventSource.onerror = (err) => {
    if (onError) onError(err);
  };

  return () => {
    eventSource.close();
  };
}
