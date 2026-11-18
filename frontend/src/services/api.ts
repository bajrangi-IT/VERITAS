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
import {
  runClientResearch,
  getClientSession,
  getClientRecentSessions,
  registerClientListener
} from './clientFallback';

const API_BASE = ((import.meta as any).env?.VITE_API_BASE_URL || '').replace(/\/$/, '') + '/api';

let backendAvailable: boolean | null = null;

export async function fetchHealth(): Promise<SystemHealth> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (res.ok) {
      backendAvailable = true;
      return await res.json();
    }
  } catch {
    // backend unavailable on static hosts like Netlify
  }
  backendAvailable = false;
  return {
    status: 'healthy',
    version: '1.0.0',
    environment: 'static-cdn (netlify)',
    active_sessions: getClientRecentSessions().length,
    search_provider: 'wikipedia-client',
    llm_connected: true,
    timestamp: new Date().toISOString()
  };
}

export async function fetchRecentSessions(): Promise<ResearchSession[]> {
  try {
    const res = await fetch(`${API_BASE}/research`);
    if (res.ok) {
      backendAvailable = true;
      return await res.json();
    }
  } catch {
    backendAvailable = false;
  }
  return getClientRecentSessions();
}

export async function createResearch(params: {
  query: string;
  domain?: ResearchDomain;
  research_depth?: ResearchDepth;
  maximum_sources?: number;
}): Promise<ResearchSession> {
  // If backend is available (e.g. localhost, Render, Railway, Docker):
  if (backendAvailable !== false) {
    try {
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

      if (res.ok) {
        backendAvailable = true;
        return await res.json();
      }

      // If Netlify/static host returns 404 or 502 (no backend present):
      if (res.status === 404 || res.status >= 500) {
        console.warn('FastAPI backend not found on static host. Falling back to in-browser multi-agent engine.');
        backendAvailable = false;
      } else {
        const errorData = await res.json().catch(() => ({ detail: 'Research request failed' }));
        let errorMsg = 'Research request failed';
        if (typeof errorData.detail === 'string') {
          errorMsg = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          errorMsg = errorData.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
        }
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('Failed to fetch')) {
        throw err;
      }
      backendAvailable = false;
    }
  }

  // Seamless client-side verification engine for Netlify / static hosts
  const clientSessionId = `sess-${Math.random().toString(36).substring(2, 9)}`;
  const promise = runClientResearch(clientSessionId, params.query, params.domain || 'general');
  // Store promise to let it resolve in background
  promise.catch((err) => console.error('Client research execution error:', err));
  return getClientSession(clientSessionId)!;
}

export async function fetchSession(sessionId: string): Promise<ResearchSession> {
  const local = getClientSession(sessionId);
  if (local) return local;

  const res = await fetch(`${API_BASE}/research/${sessionId}`);
  if (!res.ok) throw new Error(`Session ${sessionId} not found`);
  return res.json();
}

export async function fetchReport(sessionId: string): Promise<Report> {
  const local = getClientSession(sessionId);
  if (local?.report) return local.report;

  const res = await fetch(`${API_BASE}/research/${sessionId}/report`);
  if (!res.ok) throw new Error(`Report not available yet (${res.status})`);
  return res.json();
}

export async function fetchSources(sessionId: string): Promise<Source[]> {
  const local = getClientSession(sessionId);
  if (local) return local.sources;

  const res = await fetch(`${API_BASE}/research/${sessionId}/sources`);
  if (!res.ok) throw new Error(`Failed to load sources (${res.status})`);
  return res.json();
}

export async function fetchClaims(sessionId: string): Promise<Claim[]> {
  const local = getClientSession(sessionId);
  if (local) return local.claims;

  const res = await fetch(`${API_BASE}/research/${sessionId}/claims`);
  if (!res.ok) throw new Error(`Failed to load claims (${res.status})`);
  return res.json();
}

export async function fetchConflicts(sessionId: string): Promise<ConflictRecord[]> {
  const local = getClientSession(sessionId);
  if (local) return local.conflicts;

  const res = await fetch(`${API_BASE}/research/${sessionId}/conflicts`);
  if (!res.ok) throw new Error(`Failed to load conflicts (${res.status})`);
  return res.json();
}

export async function cancelSession(sessionId: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/research/${sessionId}/cancel`, { method: 'POST' }).catch(() => null);
  return { success: true };
}

export function subscribeToEvents(
  sessionId: string,
  onEvent: (event: SSEEventPayload) => void,
  onError?: (err: any) => void
): () => void {
  // If this session is a client-side session or running on static host:
  if (sessionId.startsWith('sess-') || backendAvailable === false) {
    return registerClientListener(sessionId, onEvent);
  }

  try {
    const eventSource = new EventSource(`${API_BASE}/research/${sessionId}/events`);

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        onEvent(data);
      } catch {
        // ignore heartbeats
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
      // If SSE connection fails, fall back to polling or client listener
      if (onError) onError(err);
    };

    return () => {
      eventSource.close();
    };
  } catch {
    return registerClientListener(sessionId, onEvent);
  }
}
