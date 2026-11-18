import React, { useState, useEffect, useRef } from 'react';
import {
  ResearchSession,
  SystemHealth,
  ResearchDomain,
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
import { ConfidenceBadge } from './components/ConfidenceBadge';
import {
  Search,
  Loader2,
  StopCircle,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Scale,
  FileText,
  BookOpen,
  ArrowUpRight,
  Layers,
  Activity,
  Check
} from 'lucide-react';

const AGENT_ICONS: Record<string, React.ReactNode> = {
  orchestrator: <Compass className="w-3.5 h-3.5 text-indigo-400" />,
  researcher: <Search className="w-3.5 h-3.5 text-cyan-400" />,
  verifier: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
  skeptic: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
  evidence_analyst: <Scale className="w-3.5 h-3.5 text-purple-400" />,
  synthesis: <FileText className="w-3.5 h-3.5 text-blue-400" />,
};

const AGENT_NAMES: Record<string, string> = {
  orchestrator: '1. Orchestrator',
  researcher: '2. Researcher',
  verifier: '3. Verifier',
  skeptic: '4. Skeptic',
  evidence_analyst: '5. Evidence Analyst',
  synthesis: '6. Synthesis',
};

const SUGGESTED_QUERIES = [
  { label: 'AI Developers vs Productivity', query: 'Is artificial intelligence replacing software developers, or is it increasing developer productivity?', domain: 'technology' as ResearchDomain },
  { label: 'Water on Mars', query: 'Did NASA confirm water on Mars?', domain: 'scientific' as ResearchDomain },
  { label: 'Intermittent Fasting', query: 'Does intermittent fasting cause weight loss?', domain: 'scientific' as ResearchDomain }
];

export const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState<ResearchDomain>('general');
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [activeSession, setActiveSession] = useState<ResearchSession | null>(null);
  const [recentSessions, setRecentSessions] = useState<ResearchSession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [eventLogs, setEventLogs] = useState<{ time: string; msg: string; type: string }[]>([]);
  const [showAgentSidebar, setShowAgentSidebar] = useState<boolean>(true);

  const cleanupSseRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    fetchHealth().then(setHealth).catch(() => null);
    fetchRecentSessions().then((sessions) => {
      if (sessions && sessions.length > 0) {
        setRecentSessions(sessions);
        setActiveSession(sessions[0]);
      }
    }).catch(() => null);
  }, []);

  // SSE real-time streaming
  useEffect(() => {
    if (!activeSession) return;
    if (cleanupSseRef.current) {
      cleanupSseRef.current();
      cleanupSseRef.current = null;
    }

    if (!['completed', 'cancelled', 'failed'].includes(activeSession.status)) {
      const unsub = subscribeToEvents(
        activeSession.session_id,
        (event: SSEEventPayload) => {
          if (event.message) {
            setEventLogs((prev) => [
              {
                time: new Date().toLocaleTimeString(),
                msg: event.message,
                type: event.event_type,
              },
              ...prev.slice(0, 25),
            ]);
          }
          fetchSession(activeSession.session_id).then(setActiveSession).catch(() => null);
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

  const runInvestigation = async (targetQuery: string, targetDomain?: ResearchDomain) => {
    const cleanQ = targetQuery.trim();
    if (!cleanQ) return;

    const d = targetDomain || domain;
    setQuery(cleanQ);
    setIsLoading(true);
    setEventLogs([{ time: new Date().toLocaleTimeString(), msg: `Started: "${cleanQ}"`, type: 'init' }]);

    try {
      const newSession = await createResearch({
        query: cleanQ,
        domain: d,
        research_depth: 'standard',
        maximum_sources: 8,
      });
      setActiveSession(newSession);
      setRecentSessions((prev) => [newSession, ...prev]);
    } catch (err: any) {
      setEventLogs((prev) => [{ time: new Date().toLocaleTimeString(), msg: `Error: ${err.message}`, type: 'error' }, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    runInvestigation(query);
  };

  const handleCancel = async () => {
    if (!activeSession) return;
    await cancelSession(activeSession.session_id);
    fetchSession(activeSession.session_id).then(setActiveSession);
  };

  const isRunning = activeSession && !['completed', 'cancelled', 'failed'].includes(activeSession.status);
  const report = activeSession?.report;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Top Header */}
      <header className="border-b border-surface-border bg-[#0B0F19]/90 backdrop-blur-md sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-base tracking-tight text-white">VERITAS</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50">
              PS03
            </span>
            {health && (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono ml-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ready
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAgentSidebar(!showAgentSidebar)}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                showAgentSidebar
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                  : 'bg-surface border-surface-border text-slate-400 hover:text-slate-200'
              }`}
              aria-label="Toggle pipeline monitor"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Pipeline</span>
            </button>

            {report && (
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-sm"
                aria-label="Print report"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Direct Search Bar */}
        <section className="no-print max-w-3xl mx-auto w-full space-y-3" aria-label="Search and controls">
          <form onSubmit={handleSearch} role="search" aria-label="Investigation Query Search">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" aria-hidden="true" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask any question to research and verify..."
                aria-label="Research query"
                className="w-full bg-surface-card border border-surface-border rounded-xl pl-11 pr-28 py-3 text-sm text-slate-100 placeholder-slate-500 shadow-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
              />
              <div className="absolute right-2 flex items-center gap-1.5">
                {isRunning ? (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 transition-colors"
                  >
                    <StopCircle className="w-3.5 h-3.5" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-sm"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Searching</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                        <span>Verify</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Minimal Controls & Sample Queries */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 px-1">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Domain:</span>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value as ResearchDomain)}
                className="bg-transparent text-slate-300 hover:text-white focus:outline-none cursor-pointer"
                aria-label="Select inquiry domain"
              >
                <option value="general" className="bg-[#0B0F19]">General</option>
                <option value="technology" className="bg-[#0B0F19]">Technology</option>
                <option value="scientific" className="bg-[#0B0F19]">Scientific</option>
                <option value="government" className="bg-[#0B0F19]">Policy</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 text-[11px]">Examples:</span>
              {SUGGESTED_QUERIES.map((sq, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => runInvestigation(sq.query, sq.domain)}
                  className="px-2 py-0.5 rounded bg-surface hover:bg-surface-hover text-[11px] text-slate-400 hover:text-indigo-300 transition-colors border border-surface-border"
                >
                  {sq.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 2-Column Responsive Workspace */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Stage (Left / Center - 8 Cols) */}
          <main role="main" aria-label="Investigation Report" className={`${showAgentSidebar ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-6 transition-all`}>
            {activeSession ? (
              <div className="space-y-6">
                {/* Inquiry Title Header */}
                <div className="border-b border-surface-border pb-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-800/40">
                      {activeSession.domain}
                    </span>
                    {report && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Confidence: {(report.evidence_score * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {activeSession.original_query}
                  </h1>
                </div>

                {/* Pipeline Active Loader */}
                {isRunning && (
                  <div className="p-8 rounded-xl border border-indigo-500/30 bg-surface-card text-center space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-400 mx-auto" />
                    <p className="text-xs text-slate-300 font-medium">Investigating sources and verifying claims...</p>
                  </div>
                )}

                {/* THE CLEAR, VISIBLE ANSWER STAGE */}
                {report && (
                  <article className="space-y-6">
                    {/* 1. DIRECT BOTTOM-LINE VERDICT */}
                    <div role="region" aria-label="Direct Bottom-Line Verdict" className="p-5 sm:p-6 rounded-xl bg-surface-card border-l-4 border-indigo-500 border-t border-r border-b border-surface-border shadow-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                          Verdict
                        </span>
                        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {(report.evidence_score * 100).toFixed(0)}% Score
                        </span>
                      </div>

                      {/* Main Line */}
                      <p className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                        {report.verdict || report.executive_summary.split("\n")[0]}
                      </p>

                      {/* Bulleted Takeaways */}
                      <div className="pt-3 border-t border-surface-border/60 space-y-1.5">
                        {report.executive_summary.split("\n").map((line, idx) => {
                          const clean = line.trim();
                          if (!clean) return null;
                          return (
                            <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300 leading-normal">
                              <span className="text-indigo-400 font-bold shrink-0 mt-0.5">•</span>
                              <span>{clean.replace(/^[•\-\*]\s*/, '')}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. CONTRADICTIONS & OPPOSING PERSPECTIVES (If Found) */}
                    {report.conflicts && report.conflicts.length > 0 && (
                      <div className="rounded-xl border border-amber-500/30 bg-surface-card p-4 space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Contradictions & Nuance ({report.conflicts.length})</span>
                        </h3>
                        {report.conflicts.map((conf) => (
                          <div key={conf.conflict_id} className="space-y-2 text-xs">
                            <h4 className="font-semibold text-amber-200">{conf.proposition}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div className="p-2.5 rounded-lg bg-[#0B0F19] border border-surface-border">
                                <span className="font-semibold text-cyan-400 block mb-0.5 text-[11px]">Perspective A:</span>
                                <p className="text-slate-300">{conf.side_a_assertion}</p>
                              </div>
                              <div className="p-2.5 rounded-lg bg-[#0B0F19] border border-surface-border">
                                <span className="font-semibold text-rose-400 block mb-0.5 text-[11px]">Perspective B:</span>
                                <p className="text-slate-300">{conf.side_b_assertion}</p>
                              </div>
                            </div>
                            <p className="text-slate-400 italic text-[11px]">{conf.explanation}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 3. TESTED CLAIMS LIST */}
                    <div className="rounded-xl border border-surface-border bg-surface-card p-4 space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Claims ({activeSession.claims.length})</span>
                      </h3>
                      <div className="space-y-2">
                        {activeSession.claims.map((claim) => (
                          <div
                            key={claim.claim_id}
                            className="p-2.5 rounded-lg bg-surface border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                          >
                            <p className="font-medium text-slate-200 flex-1">"{claim.claim_text}"</p>
                            <div className="shrink-0 flex items-center gap-2">
                              <ConfidenceBadge status={claim.verification_status} score={claim.confidence_score} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 4. SOURCES */}
                    <div className="rounded-xl border border-surface-border bg-surface-card p-4 space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Sources ({activeSession.sources.length})</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activeSession.sources.map((s) => (
                          <a
                            key={s.source_id}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-lg bg-surface border border-surface-border hover:border-indigo-500/40 transition-colors flex flex-col justify-between group"
                          >
                            <div>
                              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-0.5">
                                <span className="text-indigo-400 truncate max-w-[140px]">{s.publisher}</span>
                                <span>{(s.credibility_score * 100).toFixed(0)}% Credibility</span>
                              </div>
                              <h4 className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors line-clamp-1">
                                {s.title}
                              </h4>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono mt-1.5 group-hover:text-slate-300">
                              <span>View Source</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  </article>
                )}
              </div>
            ) : (
              <div className="p-12 text-center rounded-xl border border-surface-border bg-surface-card space-y-2">
                <Search className="w-8 h-8 text-indigo-400 mx-auto opacity-50" />
                <h2 className="text-sm font-semibold text-white">Ready to Research</h2>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Enter any inquiry or select an example above to execute autonomous multi-agent verification.
                </p>
              </div>
            )}
          </main>

          {/* SIDE PANEL: Pipeline & Logs (Right Column - 4 Cols) */}
          {showAgentSidebar && (
            <aside className="lg:col-span-4 space-y-4 no-print sticky top-16" aria-label="Pipeline Monitor">
              <div className="rounded-xl border border-surface-border bg-surface-card p-3.5 space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-surface-border pb-2">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Pipeline
                    </h3>
                  </div>
                  {activeSession && (
                    <span className="text-[10px] font-mono text-indigo-400 uppercase">
                      {activeSession.status}
                    </span>
                  )}
                </div>

                {/* 6 Specialized Agent Cards */}
                <div className="space-y-1.5">
                  {[
                    'orchestrator',
                    'researcher',
                    'verifier',
                    'skeptic',
                    'evidence_analyst',
                    'synthesis'
                  ].map((agentId) => {
                    const agent = activeSession?.agents[agentId];
                    const isRunningAg = agent?.status === 'running';
                    const isDoneAg = agent?.status === 'completed';

                    return (
                      <div
                        key={agentId}
                        className={`p-2 rounded-lg border text-xs transition-all ${
                          isRunningAg
                            ? 'bg-indigo-950/70 border-indigo-500 text-indigo-200 animate-pulse'
                            : isDoneAg
                            ? 'bg-surface/70 border-surface-border text-slate-200'
                            : 'bg-surface/20 border-surface-border/40 text-slate-500 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {AGENT_ICONS[agentId]}
                            <span className="font-semibold text-xs text-slate-100">
                              {AGENT_NAMES[agentId]}
                            </span>
                          </div>

                          <div>
                            {isRunningAg && <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />}
                            {isDoneAg && (
                              <span className="flex items-center gap-0.5 font-mono text-[10px] text-emerald-400">
                                <Check className="w-3 h-3 text-emerald-400" />
                                {agent?.duration_ms}ms
                              </span>
                            )}
                          </div>
                        </div>

                        {agent?.output_summary && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {agent.output_summary}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Event Logs */}
                <div className="pt-2 border-t border-surface-border space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    Logs
                  </span>
                  <div className="h-24 overflow-y-auto space-y-0.5 text-[10px] font-mono text-slate-400 pr-1">
                    {eventLogs.length === 0 ? (
                      <span className="text-slate-600 italic">No events.</span>
                    ) : (
                      eventLogs.map((log, idx) => (
                        <div key={idx} className="flex items-start gap-1 leading-tight">
                          <span className="text-slate-600 shrink-0">[{log.time}]</span>
                          <span className={log.type === 'error' ? 'text-rose-400' : 'text-slate-300 truncate'}>
                            {log.msg}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* History List */}
              {recentSessions.length > 1 && (
                <div className="rounded-xl border border-surface-border bg-surface-card p-3 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    History
                  </span>
                  <div className="space-y-1">
                    {recentSessions.slice(1, 4).map((s) => (
                      <button
                        key={s.session_id}
                        onClick={() => setActiveSession(s)}
                        className="w-full text-left p-1.5 rounded bg-surface hover:bg-surface-hover text-xs text-slate-300 hover:text-white truncate block transition-colors border border-surface-border/50"
                      >
                        {s.original_query}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-surface-border bg-[#0B0F19] py-3 text-center text-[10px] text-slate-500 no-print">
        VERITAS AI — PromptWars PS03 Autonomous Multi-Agent Research Platform
      </footer>
    </div>
  );
};
