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
import { AgentCard } from './components/AgentCard';
import { ClaimCard } from './components/ClaimCard';
import { SourceItem } from './components/SourceItem';
import { ConflictAlert } from './components/ConflictAlert';
import { ConfidenceBadge } from './components/ConfidenceBadge';
import {
  ShieldCheck,
  Search,
  Loader2,
  StopCircle,
  Printer,
  Sparkles,
  BookOpen,
  AlertTriangle,
  Layers,
  FileText,
  Calendar,
  ExternalLink,
  History,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState<ResearchDomain>('general');
  const [depth, setDepth] = useState<ResearchDepth>('standard');
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [recentSessions, setRecentSessions] = useState<ResearchSession[]>([]);
  const [activeSession, setActiveSession] = useState<ResearchSession | null>(null);
  const [activeSection, setActiveSection] = useState<'dossier' | 'claims' | 'conflicts' | 'sources' | 'agents'>('dossier');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

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

  // Real-time SSE subscription
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
          if (event.message) setNotification(event.message);
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
    setNotification(`Initiating 6-agent investigation for: "${cleanQ}"`);
    try {
      const newSession = await createResearch({
        query: cleanQ,
        domain,
        research_depth: depth,
        maximum_sources: 8
      });
      setActiveSession(newSession);
      setRecentSessions((prev) => [newSession, ...prev]);
    } catch (err: any) {
      setNotification(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!activeSession) return;
    await cancelSession(activeSession.session_id);
    fetchSession(activeSession.session_id).then(setActiveSession);
    setNotification("Investigation cancelled.");
  };

  const isRunning = activeSession && !['completed', 'cancelled', 'failed'].includes(activeSession.status);
  const report = activeSession?.report;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans">
      {/* Sleek Minimalist Header */}
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
            {report && (
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Export Dossier PDF</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>FastAPI Operational</span>
            </div>
          </div>
        </div>
      </header>

      {/* Live Notification Bar */}
      {notification && (
        <div className="bg-indigo-950/60 border-b border-indigo-800/40 px-4 py-2 text-xs text-indigo-300 text-center no-print">
          <span className="font-mono">{notification}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Core Input Console */}
        <section className="rounded-2xl border border-surface-border bg-surface-card p-5 shadow-xl no-print">
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter any research question or factual claim (e.g. Did NASA confirm water on Mars?)..."
                  className="w-full bg-[#0B0F19] border border-surface-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              {isRunning ? (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/60 transition-colors shrink-0"
                >
                  <StopCircle className="w-4 h-4 text-rose-400" />
                  <span>Cancel</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-md shadow-indigo-600/20 shrink-0"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Investigating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Investigate</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Context & Quick Presets */}
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="text-slate-400">Domain:</span>
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value as ResearchDomain)}
                    className="bg-[#0B0F19] border border-surface-border rounded px-2 py-0.5 text-xs text-slate-200"
                  >
                    <option value="general">General</option>
                    <option value="technology">Technology</option>
                    <option value="scientific">Scientific</option>
                    <option value="government">Government</option>
                  </select>
                </span>

                <span className="flex items-center gap-1.5">
                  <span className="text-slate-400">Depth:</span>
                  <select
                    value={depth}
                    onChange={(e) => setDepth(e.target.value as ResearchDepth)}
                    className="bg-[#0B0F19] border border-surface-border rounded px-2 py-0.5 text-xs text-slate-200"
                  >
                    <option value="brief">Brief (3 Tracks)</option>
                    <option value="standard">Standard (4 Tracks)</option>
                    <option value="deep">Deep (6 Tracks)</option>
                  </select>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500">Benchmark:</span>
                <button
                  type="button"
                  onClick={() => {
                    const q = "Is artificial intelligence replacing software developers, or is it increasing developer productivity?";
                    setQuery(q);
                    createResearch({ query: q, domain: 'technology', research_depth: 'standard' }).then(setActiveSession);
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 underline font-mono"
                >
                  AI Developers vs Productivity (PromptWars PS03)
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Six Autonomous Agents Pipeline Banner */}
        {activeSession && (
          <section className="rounded-xl border border-surface-border bg-surface-card p-4 space-y-3 no-print">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>6 Autonomous Agents Pipeline Trace</span>
              </span>
              <span className="text-xs font-mono uppercase text-slate-400">
                Session: {activeSession.session_id.slice(0, 8)} • Status: <strong className="text-indigo-300">{activeSession.status}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                { id: 'orchestrator', label: '1. Orchestrator' },
                { id: 'researcher', label: '2. Researcher' },
                { id: 'verifier', label: '3. Verifier' },
                { id: 'skeptic', label: '4. Skeptic' },
                { id: 'evidence_analyst', label: '5. Evidence' },
                { id: 'synthesis', label: '6. Synthesis' },
              ].map((agentMeta) => {
                const ag = activeSession.agents[agentMeta.id];
                const isAgRunning = ag?.status === 'running';
                const isAgDone = ag?.status === 'completed';

                return (
                  <div
                    key={agentMeta.id}
                    className={`p-2.5 rounded-lg border text-xs transition-all ${
                      isAgRunning
                        ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200 animate-pulse'
                        : isAgDone
                        ? 'bg-surface border-emerald-500/30 text-emerald-300'
                        : 'bg-surface/50 border-surface-border text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">{agentMeta.label}</span>
                      {isAgRunning && <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />}
                      {isAgDone && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {ag?.duration_ms ? `${ag.duration_ms}ms` : ag?.status || 'idle'}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Results Navigation Tabs */}
        {activeSession && (
          <div className="flex items-center gap-1 border-b border-surface-border no-print overflow-x-auto">
            <button
              onClick={() => setActiveSection('dossier')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                activeSection === 'dossier'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Executive Report</span>
            </button>

            <button
              onClick={() => setActiveSection('claims')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                activeSection === 'claims'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Claims ({activeSession.claims.length})</span>
            </button>

            <button
              onClick={() => setActiveSection('conflicts')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                activeSection === 'conflicts'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Discrepancies ({activeSession.conflicts.length})</span>
            </button>

            <button
              onClick={() => setActiveSection('sources')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                activeSection === 'sources'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Evidence Sources ({activeSession.sources.length})</span>
            </button>

            <button
              onClick={() => setActiveSection('agents')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                activeSection === 'agents'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Agent Activity Log</span>
            </button>
          </div>
        )}

        {/* Main Content Pane */}
        {activeSession ? (
          <div>
            {/* 1. Executive Report */}
            {activeSection === 'dossier' && (
              <article className="rounded-2xl border border-surface-border bg-surface-card p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="border-b border-surface-border pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-indigo-400 uppercase">
                      VERITAS AI EXECUTIVE DOSSIER
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Target Inquiry ID: {activeSession.session_id.slice(0, 8)}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                    {activeSession.original_query}
                  </h1>
                  {report && (
                    <div className="mt-3 flex items-center gap-3">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Evidence Confidence Index: {(report.evidence_score * 100).toFixed(0)}%
                      </span>
                      <span className="text-xs text-slate-400">
                        Synthesized across {activeSession.sources.length} sources and {activeSession.claims.length} claims
                      </span>
                    </div>
                  )}
                </div>

                {report ? (
                  <div className="space-y-6 text-xs text-slate-300 leading-relaxed">
                    <div>
                      <h3 className="font-bold text-sm text-white mb-2 uppercase tracking-wider text-indigo-400">
                        1. Executive Summary
                      </h3>
                      <p className="bg-surface p-4 rounded-xl border border-surface-border text-slate-200 leading-relaxed">
                        {report.executive_summary}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-white mb-2 uppercase tracking-wider text-indigo-400">
                        2. Analytical Methodology & Scope
                      </h3>
                      <p className="p-3 rounded-lg bg-surface/50 border border-surface-border">
                        {report.methodology}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-white mb-2 uppercase tracking-wider text-indigo-400">
                        3. Core Evidential Findings
                      </h3>
                      <div className="space-y-2">
                        {report.findings.map((f, i) => (
                          <div key={i} className="p-3 rounded-lg bg-surface border border-surface-border flex items-start justify-between gap-3">
                            <div>
                              <h4 className="font-semibold text-slate-200">{f.topic}</h4>
                              <p className="text-slate-300 mt-0.5">{f.finding}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 shrink-0">
                              {f.supported_status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {report.conflicts.length > 0 && (
                      <div>
                        <h3 className="font-bold text-sm text-amber-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4" />
                          <span>4. Empirical Discrepancies Preserved</span>
                        </h3>
                        <div className="space-y-2">
                          {report.conflicts.map((c) => (
                            <ConflictAlert key={c.conflict_id} conflict={c} />
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="font-bold text-sm text-white mb-2 uppercase tracking-wider text-indigo-400">
                        5. Research Boundaries & Limitations
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-slate-400">
                        {report.limitations.map((lim, i) => (
                          <li key={i}>{lim}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-400 mb-2" />
                    <span>Agents actively investigating and drafting executive report...</span>
                  </div>
                )}
              </article>
            )}

            {/* 2. Verified Claims */}
            {activeSection === 'claims' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeSession.claims.map((claim) => (
                    <ClaimCard
                      key={claim.claim_id}
                      claim={claim}
                      sources={activeSession.sources}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 3. Conflicts */}
            {activeSection === 'conflicts' && (
              <div className="space-y-4">
                {activeSession.conflicts.length === 0 ? (
                  <div className="p-8 text-center rounded-xl border border-surface-border bg-surface-card text-slate-400 text-xs">
                    No empirical contradictions detected across current sources.
                  </div>
                ) : (
                  activeSession.conflicts.map((c) => (
                    <ConflictAlert key={c.conflict_id} conflict={c} />
                  ))
                )}
              </div>
            )}

            {/* 4. Sources */}
            {activeSection === 'sources' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeSession.sources.map((s) => (
                    <SourceItem key={s.source_id} source={s} />
                  ))}
                </div>
              </div>
            )}

            {/* 5. Agents */}
            {activeSection === 'agents' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(activeSession.agents).map((ag) => (
                  <AgentCard key={ag.agent_id} agent={ag} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-16 text-center rounded-2xl border border-surface-border bg-surface-card space-y-3">
            <Search className="w-10 h-10 text-indigo-400 mx-auto opacity-70" />
            <h2 className="text-lg font-bold text-white">Ready for Investigation</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Type any research question into the search bar above to launch the 6-agent verification pipeline.
            </p>
          </div>
        )}
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="border-t border-surface-border bg-[#0B0F19] py-4 text-center text-[11px] text-slate-500 no-print">
        VERITAS AI — PromptWars PS03 Autonomous Multi-Agent Research Platform
      </footer>
    </div>
  );
};
