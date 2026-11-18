import React from 'react';
import { ResearchSession, SystemHealth } from '../types';
import {
  Compass,
  Search,
  CheckCircle2,
  AlertTriangle,
  Scale,
  FileText,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Layers,
  History,
  Zap
} from 'lucide-react';

interface Props {
  health: SystemHealth | null;
  recentSessions: ResearchSession[];
  onStartDemo: () => void;
  onSelectSession: (session: ResearchSession) => void;
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<Props> = ({
  health,
  recentSessions,
  onStartDemo,
  onSelectSession,
  onNavigate,
}) => {
  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative rounded-2xl border border-surface-border bg-gradient-to-b from-surface-card to-surface p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Autonomous Multi-Agent Fact Verification</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Evidence-Grounded Intelligence & Claim Verification
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            VERITAS AI orchestrates six specialized autonomous agents to decompose complex investigative inquiries,
            retrieve authentic external citations, cross-examine propositions against empirical evidence, and uncover
            underlying statistical discrepancies.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('workspace')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all focus:outline-none"
            >
              <span>Launch Investigation</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onStartDemo}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-indigo-300 bg-surface hover:bg-surface-hover border border-indigo-500/30 transition-all focus:outline-none"
            >
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Run Verification Benchmark</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-surface-border bg-surface-card">
          <span className="text-xs text-slate-400 font-medium block mb-1">Autonomous Agents</span>
          <span className="text-2xl font-extrabold text-white">6 Specialized</span>
          <span className="text-[11px] text-indigo-400 block mt-1">Multi-Role Pipeline</span>
        </div>

        <div className="p-4 rounded-xl border border-surface-border bg-surface-card">
          <span className="text-xs text-slate-400 font-medium block mb-1">Verification Rigor</span>
          <span className="text-2xl font-extrabold text-emerald-400">5-Tier</span>
          <span className="text-[11px] text-slate-400 block mt-1">Status Classification</span>
        </div>

        <div className="p-4 rounded-xl border border-surface-border bg-surface-card">
          <span className="text-xs text-slate-400 font-medium block mb-1">Network Protection</span>
          <span className="text-2xl font-extrabold text-cyan-400">SSRF Guard</span>
          <span className="text-[11px] text-slate-400 block mt-1">Isolated HTTP Client</span>
        </div>

        <div className="p-4 rounded-xl border border-surface-border bg-surface-card">
          <span className="text-xs text-slate-400 font-medium block mb-1">Total Investigations</span>
          <span className="text-2xl font-extrabold text-indigo-300">
            {health?.active_sessions ?? recentSessions.length}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Recorded Sessions</span>
        </div>
      </div>

      {/* Six Agent Architecture Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Autonomous Multi-Agent Architecture</span>
          </h2>
          <button
            onClick={() => onNavigate('agents')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            <span>Inspect Live Activity</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-surface-border bg-surface-card">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">1. Orchestrator Agent</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Analyzes inquiry scope, categorizes research domain, and generates 3–6 targeted investigative sub-tracks with bounded dependencies.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-surface-border bg-surface-card">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Search className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">2. Researcher Agent</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Executes parallel external searches, canonicalizes URLs, extracts empirical excerpts, and establishes traceable source records.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-surface-border bg-surface-card">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">3. Verifier Agent</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Cross-examines propositions against extracted citations, classifying each into 5 rigorous evidential categories.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-surface-border bg-surface-card">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">4. Skeptic Agent</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Adversarially probes consensus, uncovers counterevidence, and flags statistical or methodological discrepancies.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-surface-border bg-surface-card">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                <Scale className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">5. Evidence Analyst Agent</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Maps claim-to-source graphs, assesses institutional authority, measures publisher independence, and calculates confidence ratings.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-surface-border bg-surface-card">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">6. Synthesis Agent</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Harmonizes findings, preserves vital nuances and conflicting data, explicitly notes analytical boundaries, and drafts the executive dossier.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Investigations List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-400" />
          <span>Investigation History</span>
        </h2>

        {recentSessions.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-surface-border bg-surface-card text-slate-400 text-xs">
            No research sessions recorded yet. Launch your first investigation above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentSessions.slice(0, 6).map((s) => (
              <div
                key={s.session_id}
                onClick={() => onSelectSession(s)}
                className="p-4 rounded-xl border border-surface-border bg-surface-card hover:border-indigo-500/40 cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-mono text-indigo-400 uppercase bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-800/40">
                    {s.domain}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 uppercase">
                    {s.status}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-100 line-clamp-2 mb-2">
                  {s.original_query}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{s.sources.length} Sources • {s.claims.length} Claims</span>
                  <span>{new Date(s.created_at).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
