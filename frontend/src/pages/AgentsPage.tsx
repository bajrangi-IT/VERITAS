import React from 'react';
import { ResearchSession, AgentExecution } from '../types';
import { AgentCard } from '../components/AgentCard';
import { Layers, Activity, AlertCircle, Info } from 'lucide-react';

interface Props {
  activeSession: ResearchSession | null;
  onNavigate: (tab: string) => void;
}

const DEFAULT_AGENTS: AgentExecution[] = [
  {
    agent_id: 'orchestrator',
    agent_name: 'Orchestrator Agent',
    status: 'idle',
    task: 'Formulates domain scope, identifies research goals, and decomposes questions into 3-6 sub-tracks.',
  },
  {
    agent_id: 'researcher',
    agent_name: 'Researcher Agent',
    status: 'idle',
    task: 'Queries external indices, canonicalizes URLs, extracts empirical excerpts, and stores source provenance.',
  },
  {
    agent_id: 'verifier',
    agent_name: 'Verifier Agent',
    status: 'idle',
    task: 'Cross-examines discrete factual claims against retrieved evidence using 5-status classification.',
  },
  {
    agent_id: 'skeptic',
    agent_name: 'Skeptic Agent',
    status: 'idle',
    task: 'Adversarially probes consensus, uncovers counterevidence, and flags empirical or statistical discrepancies.',
  },
  {
    agent_id: 'evidence_analyst',
    agent_name: 'Evidence Analyst Agent',
    status: 'idle',
    task: 'Audits source authority, measures publisher independence, detects duplication, and calculates confidence ratings.',
  },
  {
    agent_id: 'synthesis',
    agent_name: 'Synthesis Agent',
    status: 'idle',
    task: 'Synthesizes multi-agent intelligence, preserves discrepancies, notes limitations, and builds the executive report.',
  },
];

export const AgentsPage: React.FC<Props> = ({ activeSession, onNavigate }) => {
  // Merge active session agent states with defaults
  const agentsList: AgentExecution[] = DEFAULT_AGENTS.map((def) => {
    if (activeSession && activeSession.agents[def.agent_id]) {
      return activeSession.agents[def.agent_id];
    }
    return def;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Autonomous Multi-Agent Activity Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time auditable execution trace for all six specialized autonomous agents.
          </p>
        </div>

        {activeSession ? (
          <div className="flex items-center gap-2 text-xs text-slate-300 bg-surface-card px-3 py-1.5 rounded-lg border border-surface-border">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Session: <strong className="text-white">{activeSession.session_id.slice(0, 8)}...</strong></span>
          </div>
        ) : (
          <div className="text-xs text-slate-400 bg-surface px-3 py-1.5 rounded-lg border border-surface-border flex items-center gap-1.5">
            <Info className="w-4 h-4 text-slate-500" />
            <span>No active session. Launch an investigation in the Workspace.</span>
          </div>
        )}
      </div>

      {/* Grid of 6 Agents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agentsList.map((agent) => (
          <AgentCard key={agent.agent_id} agent={agent} />
        ))}
      </div>

      {/* Orchestration Logic Explanation */}
      <div className="p-5 rounded-xl border border-surface-border bg-surface-card text-xs text-slate-300 space-y-2">
        <h4 className="font-semibold text-slate-200 text-sm">
          Strict Multi-Agent Separation of Concerns
        </h4>
        <p className="leading-relaxed text-slate-400">
          Unlike monolithic LLM prompt chains, VERITAS AI executes discrete autonomous roles with validated Pydantic data boundaries.
          The <strong>Skeptic Agent</strong> actively searches for contradictory evidence to counter confirmation bias, while the <strong>Evidence Analyst</strong> verifies institutional authority before the <strong>Synthesis Agent</strong> publishes the final dossier.
        </p>
      </div>
    </div>
  );
};
