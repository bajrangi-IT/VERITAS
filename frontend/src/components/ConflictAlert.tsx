import React from 'react';
import { ConflictRecord } from '../types';
import { AlertTriangle, ArrowRightLeft, GitCompare } from 'lucide-react';

interface Props {
  conflict: ConflictRecord;
}

export const ConflictAlert: React.FC<Props> = ({ conflict }) => {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-surface-card p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500"></div>

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold block">
              Empirical Discrepancy • {conflict.conflict_type.replace('_', ' ')}
            </span>
            <h4 className="text-base font-bold text-slate-100">{conflict.proposition}</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        {/* Side A */}
        <div className="p-3.5 rounded-lg bg-surface border border-surface-border">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 mb-1.5">
            <GitCompare className="w-3.5 h-3.5" />
            <span>Position Alpha</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed mb-2.5">
            {conflict.side_a_assertion}
          </p>
          <div className="text-[11px] text-slate-400 font-mono">
            Sources cited: {conflict.side_a_sources.join(', ') || 'Corroborating trials'}
          </div>
        </div>

        {/* Side B */}
        <div className="p-3.5 rounded-lg bg-surface border border-surface-border">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 mb-1.5">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Position Beta (Counter-Perspective)</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed mb-2.5">
            {conflict.side_b_assertion}
          </p>
          <div className="text-[11px] text-slate-400 font-mono">
            Sources cited: {conflict.side_b_sources.join(', ') || 'Repository telemetry'}
          </div>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-surface-card border border-amber-500/20 text-xs text-slate-300">
        <span className="font-semibold text-amber-300 block mb-1">
          Analytical Resolution:
        </span>
        {conflict.explanation}
      </div>
    </div>
  );
};
