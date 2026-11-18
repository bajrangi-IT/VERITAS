import React, { useState, useEffect, useRef } from 'react';
import {
  ResearchSession,
  SystemHealth,
  ResearchDomain,
  ResearchDepth,
  SSEEventPayload
} from './types';
import {
  fetchHealth,
  fetchRecentSessions,
  createResearch,
  fetchSession,
  cancelSession,
  subscribeToEvents
} from './services/api';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { AgentsPage } from './pages/AgentsPage';
import { EvidencePage } from './pages/EvidencePage';
import { ConflictsPage } from './pages/ConflictsPage';
import { ReportPage } from './pages/ReportPage';
import { SettingsPage } from './pages/SettingsPage';
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [recentSessions, setRecentSessions] = useState<ResearchSession[]>([]);
  const [activeSession, setActiveSession] = useState<ResearchSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);

  const cleanupSseRef = useRef<(() => void) | null>(null);

  // Load initial health and recent sessions
  useEffect(() => {
    loadHealthAndHistory();
  }, []);

  const loadHealthAndHistory = async () => {
    try {
      const [h, sessions] = await Promise.all([
        fetchHealth().catch(() => null),
        fetchRecentSessions().catch(() => [])
      ]);
      if (h) setHealth(h);
      if (sessions && sessions.length > 0) {
        setRecentSessions(sessions);
        if (!activeSession) {
          setActiveSession(sessions[0]);
        }
      }
    } catch (err) {
      console.error('Initialization error:', err);
    }
  };

  // Subscribe to SSE stream when active session changes
  useEffect(() => {
    if (!activeSession) return;

    if (cleanupSseRef.current) {
      cleanupSseRef.current();
      cleanupSseRef.current = null;
    }

    // Only subscribe if not terminated
    if (!['completed', 'cancelled', 'failed'].includes(activeSession.status)) {
      const unsub = subscribeToEvents(
        activeSession.session_id,
        (event: SSEEventPayload) => {
          handleIncomingEvent(event);
        },
        (err) => {
          console.debug('SSE disconnected or completed');
        }
      );
      cleanupSseRef.current = unsub;
    }

    return () => {
      if (cleanupSseRef.current) {
        cleanupSseRef.current();
        cleanupSseRef.current = null;
      }
    };
  }, [activeSession?.session_id]);

  const handleIncomingEvent = async (event: SSEEventPayload) => {
    if (event.message) {
      setNotification({ message: event.message, type: 'info' });
    }

    // Refresh active session state from backend
    if (activeSession) {
      try {
        const updated = await fetchSession(activeSession.session_id);
        setActiveSession(updated);

        if (event.event_type === 'research_completed') {
          setNotification({
            message: 'Investigation completed! Executive report compiled.',
            type: 'success'
          });
          loadHealthAndHistory();
        }
      } catch (err) {
        console.error('Failed to update session from event:', err);
      }
    }
  };

  const handleStartResearch = async (params: {
    query: string;
    domain: ResearchDomain;
    research_depth: ResearchDepth;
    maximum_sources: number;
  }) => {
    setIsLoading(true);
    try {
      const newSession = await createResearch(params);
      setActiveSession(newSession);
      setRecentSessions((prev) => [newSession, ...prev]);
      setCurrentTab('workspace');
      setNotification({
        message: `Investigation started: "${params.query.slice(0, 50)}..."`,
        type: 'info'
      });
    } catch (err: any) {
      setNotification({
        message: err.message || 'Failed to start research investigation',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelResearch = async () => {
    if (!activeSession) return;
    try {
      await cancelSession(activeSession.session_id);
      const updated = await fetchSession(activeSession.session_id);
      setActiveSession(updated);
      setNotification({ message: 'Investigation cancelled.', type: 'info' });
    } catch (err: any) {
      setNotification({ message: 'Cancellation failed.', type: 'error' });
    }
  };

  const handleStartDemo = () => {
    handleStartResearch({
      query: "Is artificial intelligence replacing software developers, or is it increasing developer productivity?",
      domain: "technology",
      research_depth: "standard",
      maximum_sources: 8
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-slate-100">
      {/* Top Navigation */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        health={health}
      />

      {/* Real-time Notification Banner */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className="bg-indigo-950/80 border-b border-indigo-800/40 text-xs px-4 py-2 flex items-center justify-between text-indigo-200 transition-all no-print"
        >
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
            )}
            <span className="truncate">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white p-1"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'dashboard' && (
          <DashboardPage
            health={health}
            recentSessions={recentSessions}
            onStartDemo={handleStartDemo}
            onSelectSession={(s) => {
              setActiveSession(s);
              setCurrentTab('workspace');
            }}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === 'workspace' && (
          <WorkspacePage
            activeSession={activeSession}
            isLoading={isLoading}
            onStartResearch={handleStartResearch}
            onCancelResearch={handleCancelResearch}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === 'agents' && (
          <AgentsPage
            activeSession={activeSession}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === 'evidence' && (
          <EvidencePage
            activeSession={activeSession}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === 'conflicts' && (
          <ConflictsPage
            activeSession={activeSession}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === 'report' && (
          <ReportPage
            activeSession={activeSession}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsPage health={health} />
        )}
      </main>

      {/* Professional Footer */}
      <footer className="border-t border-surface-border bg-surface py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>VERITAS AI — Autonomous Multi-Agent Research & Fact-Verification Platform (PromptWars PS03)</span>
          <div className="flex items-center gap-4">
            <span>FastAPI + React 18</span>
            <span>•</span>
            <span>SSRF Shield</span>
            <span>•</span>
            <span>Single Branch main</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
