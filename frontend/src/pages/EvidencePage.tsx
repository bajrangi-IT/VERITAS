import React, { useState } from 'react';
import { ResearchSession } from '../types';
import { ClaimCard } from '../components/ClaimCard';
import { SourceItem } from '../components/SourceItem';
import { CheckCircle2, BookOpen, Filter, Search, ArrowRight } from 'lucide-react';

interface Props {
  activeSession: ResearchSession | null;
  onNavigate: (tab: string) => void;
}

export const EvidencePage: React.FC<Props> = ({ activeSession, onNavigate }) => {
  const [activeView, setActiveView] = useState<'claims' | 'sources'>('claims');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  if (!activeSession || (activeSession.claims.length === 0 && activeSession.sources.length === 0)) {
    return (
      <div className="p-12 text-center rounded-2xl border border-surface-border bg-surface-card max-w-xl mx-auto space-y-4">
        <BookOpen className="w-12 h-12 text-indigo-400 mx-auto opacity-70" />
        <h3 className="text-lg font-bold text-white">No Evidence Collected Yet</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          The Evidence Ledger catalogs extracted empirical propositions and external source records once an investigation begins.
        </p>
        <button
          onClick={() => onNavigate('workspace')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
        >
          <span>Open Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  const filteredClaims = activeSession.claims.filter((c) => {
    if (filterStatus === 'all') return true;
    return c.verification_status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Sub-navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <span>Evidence Ledger & Provenance Repository</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Traceable proposition verification matrix and normalized external source citations.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-1 rounded-xl bg-surface border border-surface-border">
          <button
            onClick={() => setActiveView('claims')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'claims'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Verified Claims ({activeSession.claims.length})
          </button>
          <button
            onClick={() => setActiveView('sources')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'sources'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Gathered Sources ({activeSession.sources.length})
          </button>
        </div>
      </div>

      {/* Claims View */}
      {activeView === 'claims' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              Filter by status:
            </span>
            {['all', 'SUPPORTED', 'PARTIALLY_SUPPORTED', 'CONTRADICTED', 'INSUFFICIENT_EVIDENCE'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  filterStatus === st
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    : 'bg-surface text-slate-400 hover:text-slate-200 border border-surface-border'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClaims.map((claim) => (
              <ClaimCard
                key={claim.claim_id}
                claim={claim}
                sources={activeSession.sources}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sources View */}
      {activeView === 'sources' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSession.sources.map((source) => (
              <SourceItem key={source.source_id} source={source} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
