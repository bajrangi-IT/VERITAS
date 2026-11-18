import React, { useState } from 'react';
import {
  ResearchSession,
  ResearchDomain,
  ResearchDepth
} from '../types';
import {
  Search,
  Sparkles,
  Loader2,
  StopCircle,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

interface Props {
  activeSession: ResearchSession | null;
  isLoading: boolean;
  onStartResearch: (params: {
    query: string;
    domain: ResearchDomain;
    research_depth: ResearchDepth;
    maximum_sources: number;
  }) => void;
  onCancelResearch: () => void;
  onNavigate: (tab: string) => void;
}

const SAMPLE_QUESTIONS = [
  "Is artificial intelligence replacing software developers, or is it increasing developer productivity?",
  "Does remote work sustainably maintain engineering velocity and architectural software quality?",
  "What is the measured climate impact of enterprise data centers running generative AI models?",
];

export const WorkspacePage: React.FC<Props> = ({
  activeSession,
  isLoading,
  onStartResearch,
  onCancelResearch,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState<ResearchDomain>('technology');
  const [depth, setDepth] = useState<ResearchDepth>('standard');
  const [maxSources, setMaxSources] = useState<number>(8);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || query.trim().length < 5) return;
    onStartResearch({
      query: query.trim(),
      domain,
      research_depth: depth,
      maximum_sources: maxSources,
    });
  };

  const isSessionRunning =
    activeSession &&
    !['completed', 'cancelled', 'failed'].includes(activeSession.status);

  return (
    <div className="space-y-8">
      {/* Search Input Section */}
      <div className="rounded-2xl border border-surface-border bg-surface-card p-6 shadow-xl">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-indigo-400" />
            <span>Research Investigation Workspace</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Submit a complex inquiry. The six autonomous agents will decompose the proposition, gather external evidence, and evaluate factual integrity.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Research Question or Complex Proposition
            </label>
            <div className="relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Is artificial intelligence replacing software developers, or is it increasing developer productivity?"
                rows={3}
                disabled={isLoading || Boolean(isSessionRunning)}
                className="w-full bg-[#0B0F19] border border-surface-border rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Quick Select Preset Prompts */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              Benchmark Topics:
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setQuery(q)}
                  disabled={Boolean(isSessionRunning)}
                  className="text-xs text-left text-slate-300 hover:text-indigo-300 bg-surface hover:bg-surface-hover px-3 py-1.5 rounded-lg border border-surface-border transition-colors disabled:opacity-50"
                >
                  {q.slice(0, 75)}...
                </button>
              ))}
            </div>
          </div>

          {/* Configuration Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-surface-border">
            {/* Domain Context */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Investigative Domain
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value as ResearchDomain)}
                disabled={Boolean(isSessionRunning)}
                className="w-full bg-[#0B0F19] border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 disabled:opacity-50"
              >
                <option value="general">General Cross-Disciplinary</option>
                <option value="technology">Technology & Engineering</option>
                <option value="scientific">Scientific & Academic</option>
                <option value="government">Government & Policy</option>
                <option value="current_affairs">Current Affairs & Journalism</option>
                <option value="finance">Economics & Finance</option>
              </select>
            </div>

            {/* Depth Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Analytical Depth
              </label>
              <select
                value={depth}
                onChange={(e) => setDepth(e.target.value as ResearchDepth)}
                disabled={Boolean(isSessionRunning)}
                className="w-full bg-[#0B0F19] border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 disabled:opacity-50"
              >
                <option value="brief">Brief (3 Analytical Sub-Tracks)</option>
                <option value="standard">Standard (4 Analytical Sub-Tracks)</option>
                <option value="deep">Deep (6 Analytical Sub-Tracks)</option>
              </select>
            </div>

            {/* Source Ceiling */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Target Sources Limit: {maxSources}
              </label>
              <input
                type="range"
                min="4"
                max="15"
                value={maxSources}
                onChange={(e) => setMaxSources(Number(e.target.value))}
                disabled={Boolean(isSessionRunning)}
                className="w-full accent-indigo-500 mt-2 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Full provenance citations and SSRF guard enforced.</span>
            </span>

            <div className="flex items-center gap-3">
              {isSessionRunning && (
                <button
                  type="button"
                  onClick={onCancelResearch}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 transition-colors"
                >
                  <StopCircle className="w-4 h-4 text-rose-400" />
                  <span>Cancel Active Session</span>
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading || Boolean(isSessionRunning) || !query.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 shadow-lg shadow-indigo-600/30 transition-all focus:outline-none"
              >
                {isLoading || isSessionRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Autonomous Pipeline Running...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Begin Investigation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Active Session Status Card */}
      {activeSession && (
        <div className="rounded-2xl border border-surface-border bg-surface-card p-6 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-mono text-indigo-400 uppercase bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-800/40">
                Active Session: {activeSession.session_id.slice(0, 8)}...
              </span>
              <h3 className="text-base font-bold text-white mt-1.5">
                {activeSession.original_query}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-medium uppercase border bg-surface border-surface-border text-slate-300">
                Status: {activeSession.status}
              </span>
            </div>
          </div>

          {/* Subquestions Decomposed */}
          {activeSession.subquestions.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-slate-300 block mb-2">
                Analytical Sub-Tracks Established by Orchestrator:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {activeSession.subquestions.map((sq, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-surface border border-surface-border text-xs text-slate-300 flex items-start gap-2"
                  >
                    <span className="font-mono text-indigo-400 font-bold shrink-0">{idx + 1}.</span>
                    <span>{sq}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-surface-border text-center">
            <div className="p-2.5 rounded-lg bg-surface">
              <span className="text-xs text-slate-400 block">Sources Retrieved</span>
              <span className="text-lg font-bold text-cyan-400">{activeSession.sources.length}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface">
              <span className="text-xs text-slate-400 block">Claims Extracted</span>
              <span className="text-lg font-bold text-emerald-400">{activeSession.claims.length}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface">
              <span className="text-xs text-slate-400 block">Discrepancies Flagged</span>
              <span className="text-lg font-bold text-amber-400">{activeSession.conflicts.length}</span>
            </div>
          </div>

          {/* Navigation Shortcuts */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Real-time SSE event stream connected</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('agents')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium px-3 py-1.5 rounded-lg bg-surface border border-surface-border hover:border-indigo-500/30 transition-colors"
              >
                Inspect Agents
              </button>
              <button
                onClick={() => onNavigate('evidence')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium px-3 py-1.5 rounded-lg bg-surface border border-surface-border hover:border-cyan-500/30 transition-colors"
              >
                View Evidence
              </button>
              {activeSession.report && (
                <button
                  onClick={() => onNavigate('report')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 transition-colors flex items-center gap-1"
                >
                  <span>Open Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
