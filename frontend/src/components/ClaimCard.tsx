import React from 'react';
import { Claim, Source } from '../types';
import { ConfidenceBadge } from './ConfidenceBadge';
import { Link2, ShieldCheck, Info } from 'lucide-react';

interface Props {
  claim: Claim;
  sources: Source[];
}

export const ClaimCard: React.FC<Props> = ({ claim, sources }) => {
  const sourceMap = new Map<string, Source>();
  sources.forEach((s) => sourceMap.set(s.source_id, s));

  return (
    <div className="rounded-xl border border-surface-border bg-surface-card p-4 hover:border-slate-700 transition-colors">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2.5">
        <span className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider bg-surface px-2 py-0.5 rounded border border-surface-border">
          Claim #{claim.claim_id}
        </span>
        <ConfidenceBadge status={claim.verification_status} score={claim.confidence_score} />
      </div>

      <h4 className="text-sm font-semibold text-slate-100 leading-relaxed mb-3">
        "{claim.claim_text}"
      </h4>

      {claim.explanation && (
        <p className="text-xs text-slate-300 bg-surface/60 p-2.5 rounded-lg border border-surface-border/60 mb-3">
          {claim.explanation}
        </p>
      )}

      {/* Citations section */}
      <div className="space-y-2 pt-2 border-t border-surface-border/60">
        {claim.supporting_sources.length > 0 && (
          <div>
            <span className="text-[11px] font-semibold text-emerald-400 block mb-1">
              Corroborating Citations:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {claim.supporting_sources.map((sid) => {
                const s = sourceMap.get(sid);
                return s ? (
                  <a
                    key={sid}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-indigo-300 hover:text-indigo-200 bg-indigo-950/40 hover:bg-indigo-900/50 px-2 py-1 rounded border border-indigo-800/40 transition-colors"
                  >
                    <Link2 className="w-3 h-3 text-indigo-400" />
                    <span className="truncate max-w-[180px]">{s.publisher || s.title}</span>
                  </a>
                ) : (
                  <span key={sid} className="text-xs text-slate-500 font-mono">
                    [{sid}]
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {claim.contradicting_sources.length > 0 && (
          <div className="mt-2">
            <span className="text-[11px] font-semibold text-rose-400 block mb-1">
              Contradicting Citations:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {claim.contradicting_sources.map((sid) => {
                const s = sourceMap.get(sid);
                return s ? (
                  <a
                    key={sid}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-rose-300 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/50 px-2 py-1 rounded border border-rose-800/40 transition-colors"
                  >
                    <Link2 className="w-3 h-3 text-rose-400" />
                    <span className="truncate max-w-[180px]">{s.publisher || s.title}</span>
                  </a>
                ) : (
                  <span key={sid} className="text-xs text-slate-500 font-mono">
                    [{sid}]
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {claim.methodology_note && (
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2">
            <Info className="w-3 h-3 text-slate-500 shrink-0" />
            <span className="truncate">{claim.methodology_note}</span>
          </div>
        )}
      </div>
    </div>
  );
};
