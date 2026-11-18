import React from 'react';
import { ResearchSession } from '../types';
import { ConflictAlert } from '../components/ConflictAlert';
import { AlertTriangle, CheckCircle, Info, ArrowRight } from 'lucide-react';

interface Props {
  activeSession: ResearchSession | null;
  onNavigate: (tab: string) => void;
}

export const ConflictsPage: React.FC<Props> = ({ activeSession, onNavigate }) => {
  if (!activeSession) {
    return (
      <div className="p-12 text-center rounded-2xl border border-surface-border bg-surface-card max-w-xl mx-auto space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto opacity-70" />
        <h3 className="text-lg font-bold text-white">No Discrepancy Analysis Active</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          The Discrepancy Intelligence engine detects empirical contradictions and differing statistics across independent sources during research.
        </p>
        <button
          onClick={() => onNavigate('workspace')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
        >
          <span>Launch Investigation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  const conflicts = activeSession.conflicts;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <span>Discrepancy & Contradiction Intelligence</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Identifies direct factual contradictions, differing statistics, and methodological divergences without collapsing complexity.
        </p>
      </div>

      {conflicts.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-surface-border bg-surface-card space-y-2">
          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-200">
            High Empirical Concordance Detected
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            The Skeptic Agent identified no statistically significant or methodological contradictions across current gathered sources.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {conflicts.map((conf) => (
            <ConflictAlert key={conf.conflict_id} conflict={conf} />
          ))}
        </div>
      )}

      {/* Methodological Context Note */}
      <div className="p-4 rounded-xl border border-surface-border bg-surface-card/60 text-xs text-slate-400 flex items-start gap-3">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-300 block mb-0.5">
            Nuanced Contradiction Detection Philosophy
          </span>
          Different numerical values do not necessarily indicate falsehood. VERITAS AI separates methodological divergences (e.g. short-term sprint benchmarks vs long-term codebase maintenance telemetry) and context shifts from true factual falsehoods.
        </div>
      </div>
    </div>
  );
};
