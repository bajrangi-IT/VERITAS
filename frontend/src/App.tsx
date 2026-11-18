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
import { ConfidenceBadge } from './components/ConfidenceBadge';
import {
  ShieldCheck,
  Search,
  Loader2,
  StopCircle,
  Printer,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Compass,
  Scale,
  FileText,
  ChevronRight,
  BookOpen,
  ArrowUpRight,
  Layers,
  Activity,
  Check,
  Pin
} from 'lucide-react';

const AGENT_ICONS: Record<string, React.ReactNode> = {
  orchestrator: <Compass className="w-4 h-4 text-indigo-400" />,
  researcher: <Search className="w-4 h-4 text-cyan-400" />,
  verifier: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  skeptic: <AlertTriangle className="w-4 h-4 text-amber-400" />,
  evidence_analyst: <Scale className="w-4 h-4 text-purple-400" />,
  synthesis: <FileText className="w-4 h-4 text-blue-400" />,
};

const AGENT_TITLES: Record<string, string> = {
  orchestrator: '1. Orchestrator',
  researcher: '2. Researcher',
  verifier: '3. Verifier',
  skeptic: '4. Skeptic',
  evidence_analyst: '5. Evidence Analyst',
  synthesis: '6. Synthesis',
};

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
              ...prev.slice(0, 30),
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

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanQ = query.trim();
    if (!cleanQ || cleanQ.length < 3) return;

    setIsLoading(true);
    setEventLogs([{ time: new Date().toLocaleTimeString(), msg: `Initiating research: "${cleanQ}"`, type: 'init' }]);
    try {
      const newSession = await createResearch({
        query: cleanQ,
        domain,
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
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-400 p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-[#0B0F19] rounded-[6px] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white">
                VERITAS <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono block -mt-1">
                AUTONOMOUS FACT VERIFICATION
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAgentSidebar(!showAgentSidebar)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                showAgentSidebar
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                  : 'bg-surface border-surface-border text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{showAgentSidebar ? 'Hide Agent Monitor' : 'Show Agent Monitor'}</span>
            </button>

            {report && (
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Direct Search Bar */}
        <section className="no-print" aria-label="Search and controls">
          <form onSubmit={handleSearch} role="search" aria-label="Investigation Query Search" className="max-w-4xl mx-auto space-y-2">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" aria-hidden="true" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask any question to verify (e.g. Did NASA confirm water on Mars?)..."
                aria-label="Research query or assertion to verify"
                className="w-full bg-surface-card border border-surface-border rounded-2xl pl-12 pr-32 py-3.5 text-base text-slate-100 placeholder-slate-500 shadow-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
              />
              <div className="absolute right-2.5 flex items-center gap-2">
                {isRunning ? (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 transition-colors"
                  >
                    <StopCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Cancel</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-md shadow-indigo-600/30"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                        <span>Investigate</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Benchmark shortcut */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-2">
              <div className="flex items-center gap-3">
                <span>Domain:</span>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value as ResearchDomain)}
                  className="bg-transparent text-slate-400 hover:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="general" className="bg-[#0B0F19]">General Inquiry</option>
                  <option value="technology" className="bg-[#0B0F19]">Technology</option>
                  <option value="scientific" className="bg-[#0B0F19]">Scientific / Academic</option>
                  <option value="government" className="bg-[#0B0F19]">Government & Policy</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  const q = "Is artificial intelligence replacing software developers, or is it increasing developer productivity?";
                  setQuery(q);
                  createResearch({ query: q, domain: 'technology' }).then(setActiveSession);
                }}
                className="text-slate-500 hover:text-indigo-400 transition-colors underline font-mono text-[11px]"
              >
                Benchmark: AI Developers vs Productivity
              </button>
            </div>
          </form>
        </section>

        {/* 2-Column Responsive Workspace */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Stage (Left / Center - 8 Cols) */}
          <main role="main" aria-label="Investigation Report" className={`${showAgentSidebar ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-6 transition-all`}>
            {activeSession ? (
              <div className="space-y-6">
                {/* Inquiry Title Banner */}
                <div className="border-b border-surface-border pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-800/40">
                      Domain: {activeSession.domain}
                    </span>
                    {report && (
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Evidence Confidence: {(report.evidence_score * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {activeSession.original_query}
                  </h1>
                </div>

                {/* Pipeline Active Loader */}
                {isRunning && (
                  <div className="p-8 rounded-2xl border border-indigo-500/30 bg-surface-card/60 backdrop-blur text-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
                    <h3 className="text-sm font-semibold text-slate-200">
                      Multi-Agent Pipeline Actively Investigating...
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Decomposing inquiry, querying external evidence, cross-verifying propositions, and formulating the direct bottom-line verdict.
                    </p>
                  </div>
                )}

                {/* THE CLEAR, VISIBLE ANSWER STAGE */}
                {report && (
                  <article className="space-y-6">
                    {/* 1. THE MAIN LINE / DIRECT BOTTOM-LINE VERDICT (PROMINENT & UNMISTAKABLE) */}
                    <div role="region" aria-label="Direct Bottom-Line Verdict" className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/70 via-surface-card to-[#0B0F19] border-2 border-indigo-500/50 shadow-2xl relative overflow-hidden">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
                          <Pin className="w-3.5 h-3.5" />
                          <span>Direct Verdict</span>
                        </span>
                        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                          {(report.evidence_score * 100).toFixed(0)}% Evidential Score
                        </span>
                      </div>

                      {/* THE MAIN LINE */}
                      <p className="text-base sm:text-lg font-bold text-white leading-relaxed mb-4">
                        {report.verdict || report.executive_summary.split("\n")[0]}
                      </p>

                      {/* BULLETED TAKEAWAYS */}
                      <div className="pt-3 border-t border-surface-border/60 space-y-2">
                        {report.executive_summary.split("\n").map((line, idx) => {
                          const clean = line.trim();
                          if (!clean) return null;
                          return (
                            <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200 leading-relaxed">
                              <span className="text-cyan-400 font-bold shrink-0 mt-0.5">•</span>
                              <span>{clean.replace(/^[•\-\*]\s*/, '')}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. EMPIRICAL DISCREPANCIES (If Found) */}
                    {report.conflicts && report.conflicts.length > 0 && (
                      <div className="rounded-xl border border-amber-500/30 bg-surface-card p-5 space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Empirical Discrepancies & Nuances Preserved</span>
                        </h3>
                        {report.conflicts.map((conf) => (
                          <div key={conf.conflict_id} className="space-y-2 text-xs">
                            <h4 className="font-semibold text-amber-200">{conf.proposition}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <div className="p-2.5 rounded-lg bg-[#0B0F19] border border-surface-border">
                                <span className="font-semibold text-cyan-400 block mb-0.5 text-[11px]">Position Alpha:</span>
                                <p className="text-slate-300">{conf.side_a_assertion}</p>
                              </div>
                              <div className="p-2.5 rounded-lg bg-[#0B0F19] border border-surface-border">
                                <span className="font-semibold text-rose-400 block mb-0.5 text-[11px]">Counter-Position Beta:</span>
                                <p className="text-slate-300">{conf.side_b_assertion}</p>
                              </div>
                            </div>
                            <p className="text-slate-400 italic text-[11px] pt-0.5">{conf.explanation}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 3. TESTED CLAIMS MATRIX */}
                    <div className="rounded-xl border border-surface-border bg-surface-card p-5 space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Verified Claims & Evidential Proof ({activeSession.claims.length})</span>
                      </h3>
                      <div className="space-y-2">
                        {activeSession.claims.map((claim) => (
                          <div
                            key={claim.claim_id}
                            className="p-3 rounded-lg bg-surface border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex-1">
                              <span className="text-[10px] font-mono text-slate-500 block">Claim #{claim.claim_id}</span>
                              <p className="font-medium text-slate-200 mt-0.5">"{claim.claim_text}"</p>
                              {claim.explanation && (
                                <p className="text-slate-400 mt-1 text-[11px]">{claim.explanation}</p>
                              )}
                            </div>
                            <div className="shrink-0 flex items-center gap-2">
                              <ConfidenceBadge status={claim.verification_status} score={claim.confidence_score} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 4. GATHERED SOURCE BIBLIOGRAPHY */}
                    <div className="rounded-xl border border-surface-border bg-surface-card p-5 space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-cyan-400" />
                        <span>Primary Citations & Evidence Ledger ({activeSession.sources.length})</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {activeSession.sources.map((s) => (
                          <a
                            key={s.source_id}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-xl bg-surface border border-surface-border hover:border-indigo-500/40 transition-colors flex flex-col justify-between group"
                          >
                            <div>
                              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                                <span className="text-indigo-400 truncate max-w-[140px]">{s.publisher}</span>
                                <span>{(s.credibility_score * 100).toFixed(0)}% Authority</span>
                              </div>
                              <h4 className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors line-clamp-1">
                                {s.title}
                              </h4>
                              {s.content_excerpt && (
                                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                                  "{s.content_excerpt}"
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono mt-2 group-hover:text-slate-300">
                              <span>Open Citation Source</span>
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
              <div className="p-16 text-center rounded-2xl border border-surface-border bg-surface-card space-y-3">
                <Search className="w-10 h-10 text-indigo-400 mx-auto opacity-60" />
                <h2 className="text-base font-bold text-white">Enter an Inquiry Above to Begin</h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Type any question to investigate. The autonomous agents will extract citations, verify claims, and present the direct bottom-line verdict clearly.
                </p>
              </div>
            )}
          </main>

          {/* SIDE PANEL: Agentic Workflow Monitor (Right Column - 4 Cols) */}
          {showAgentSidebar && (
            <aside className="lg:col-span-4 space-y-4 no-print sticky top-20">
              <div className="rounded-2xl border border-surface-border bg-surface-card p-4 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-surface-border pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Live Agentic Pipeline
                    </h3>
                  </div>
                  {activeSession && (
                    <span className="text-[10px] font-mono text-indigo-400 uppercase">
                      {activeSession.status}
                    </span>
                  )}
                </div>

                {/* 6 Specialized Agent Cards */}
                <div className="space-y-2">
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
                        className={`p-2.5 rounded-xl border text-xs transition-all ${
                          isRunningAg
                            ? 'bg-indigo-950/70 border-indigo-500 text-indigo-200 animate-pulse shadow-md'
                            : isDoneAg
                            ? 'bg-surface/80 border-surface-border text-slate-200'
                            : 'bg-surface/30 border-surface-border/50 text-slate-500 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <div className="flex items-center gap-2">
                            {AGENT_ICONS[agentId]}
                            <span className="font-semibold text-xs text-slate-100">
                              {AGENT_TITLES[agentId]}
                            </span>
                          </div>

                          <div>
                            {isRunningAg && <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />}
                            {isDoneAg && (
                              <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-400">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                {agent?.duration_ms}ms
                              </span>
                            )}
                          </div>
                        </div>

                        {agent?.output_summary ? (
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {agent.output_summary}
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-500 italic mt-0.5">
                            {isRunningAg ? 'Active...' : 'Standby in pipeline'}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Real-time Telemetry Stream */}
                <div className="pt-2 border-t border-surface-border space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    Execution Telemetry
                  </span>
                  <div className="h-28 overflow-y-auto space-y-1 text-[10px] font-mono text-slate-400 pr-1">
                    {eventLogs.length === 0 ? (
                      <span className="text-slate-600 italic">No telemetry recorded yet.</span>
                    ) : (
                      eventLogs.map((log, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 leading-tight">
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
                <div className="rounded-2xl border border-surface-border bg-surface-card p-4 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Previous Investigations
                  </span>
                  <div className="space-y-1">
                    {recentSessions.slice(1, 4).map((s) => (
                      <button
                        key={s.session_id}
                        onClick={() => setActiveSession(s)}
                        className="w-full text-left p-2 rounded-lg bg-surface hover:bg-surface-hover text-xs text-slate-300 hover:text-white truncate block transition-colors border border-surface-border/50"
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
      <footer className="border-t border-surface-border bg-[#0B0F19] py-4 text-center text-[11px] text-slate-500 no-print">
        VERITAS AI — PromptWars PS03 Autonomous Multi-Agent Research Platform
      </footer>
    </div>
  );
};
