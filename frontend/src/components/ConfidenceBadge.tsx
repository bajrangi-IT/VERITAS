import React from 'react';
import { VerificationStatus } from '../types';

interface Props {
  status: VerificationStatus;
  score?: number;
}

export const ConfidenceBadge: React.FC<Props> = ({ status, score }) => {
  const configs: Record<VerificationStatus, { bg: string; text: string; border: string; label: string }> = {
    SUPPORTED: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      label: 'Verified Corroborated',
    },
    PARTIALLY_SUPPORTED: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      label: 'Partially Corroborated',
    },
    CONTRADICTED: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
      label: 'Contradicted by Evidence',
    },
    INSUFFICIENT_EVIDENCE: {
      bg: 'bg-slate-500/10',
      text: 'text-slate-400',
      border: 'border-slate-500/30',
      label: 'Insufficient Evidence',
    },
    UNVERIFIABLE: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/30',
      label: 'Unverifiable Statement',
    },
  };

  const c = configs[status] || configs.INSUFFICIENT_EVIDENCE;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}
      title={score !== undefined ? `Confidence Index: ${(score * 100).toFixed(0)}%` : undefined}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {c.label}
      {score !== undefined && (
        <span className="font-mono text-[10px] opacity-80 ml-0.5">({(score * 100).toFixed(0)}%)</span>
      )}
    </span>
  );
};
