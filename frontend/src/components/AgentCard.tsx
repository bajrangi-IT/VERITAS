import React from 'react';
import { AgentExecution } from '../types';
import {
  Compass,
  Search,
  CheckCircle2,
  AlertTriangle,
  Scale,
  FileText,
  Clock,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface Props {
  agent: AgentExecution;
}

const AGENT_ICONS: Record<string, React.ReactNode> = {
  orchestrator: <Compass className="w-5 h-5 text-indigo-400" />,
  researcher: <Search className="w-5 h-5 text-cyan-400" />,
  verifier: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
  skeptic: <AlertTriangle className="w-5 h-5 text-amber-400" />,
  evidence_analyst: <Scale className="w-5 h-5 text-purple-400" />,
  synthesis: <FileText className="w-5 h-5 text-blue-400" />,
};

export const AgentCard: React.FC<Props> = ({ agent }) => {
  const isRunning = agent.status === 'running';
  const isCompleted = agent.status === 'completed';
  const isFailed = agent.status === 'failed';

  return (
    <div
      className={`relative rounded-xl border p-4 transition-all duration-200 ${
        isRunning
          ? 'bg-surface-card border-indigo-500/50 shadow-lg shadow-indigo-500/10'
          : isCompleted
          ? 'bg-surface-card border-surface-border hover:border-slate-700'
          : isFailed
          ? 'bg-surface-card border-rose-500/40'
          : 'bg-surface-card/60 border-surface-border/50 opacity-60'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-surface border border-surface-border">
            {AGENT_ICONS[agent.agent_id] || <Compass className="w-5 h-5 text-slate-400" />}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">{agent.agent_name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                ID: {agent.agent_id}
              </span>
              {agent.duration_ms !== undefined && agent.duration_ms > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                  <Clock className="w-3 h-3" />
                  {agent.duration_ms}ms
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status pill */}
        <div>
          {isRunning && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              Executing
            </span>
          )}
          {isCompleted && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Check className="w-3 h-3" />
              Completed
            </span>
          )}
          {isFailed && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <AlertCircle className="w-3 h-3" />
              Failed
            </span>
          )}
          {agent.status === 'idle' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
              Standby
            </span>
          )}
        </div>
      </div>

      {/* Task Description */}
      {agent.task && (
        <p className="text-xs text-slate-300 mt-2 mb-2 line-clamp-2">
          {agent.task}
        </p>
      )}

      {/* Output Summary */}
      {agent.output_summary && (
        <div className="mt-2.5 p-2.5 rounded-lg bg-surface/80 border border-surface-border text-xs text-slate-200">
          <span className="font-semibold text-slate-300 block mb-0.5">Summary Output:</span>
          {agent.output_summary}
        </div>
      )}

      {/* Error Output */}
      {agent.error && (
        <div className="mt-2.5 p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300">
          <span className="font-semibold text-rose-200 block mb-0.5">Execution Issue:</span>
          {agent.error}
        </div>
      )}
    </div>
  );
};
