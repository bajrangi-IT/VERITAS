import React from 'react';
import { Source } from '../types';
import { ExternalLink, Calendar, ShieldCheck, BookmarkCheck } from 'lucide-react';

interface Props {
  source: Source;
}

export const SourceItem: React.FC<Props> = ({ source }) => {
  const isPeerReviewed = source.source_type === 'peer_reviewed';
  const isOfficial = source.source_type === 'official_doc';

  return (
    <div className="rounded-xl border border-surface-border bg-surface-card p-4 hover:border-slate-700 transition-colors">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-medium text-slate-400 uppercase bg-surface px-2 py-0.5 rounded border border-surface-border">
            ID: {source.source_id}
          </span>
          {isPeerReviewed && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              <ShieldCheck className="w-3 h-3" />
              Peer Reviewed
            </span>
          )}
          {isOfficial && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">
              <BookmarkCheck className="w-3 h-3" />
              Government / Official
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
          Credibility: {(source.credibility_score * 100).toFixed(0)}%
        </div>
      </div>

      <h4 className="text-sm font-semibold text-slate-100 hover:text-indigo-400 transition-colors mb-1.5">
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 group"
        >
          <span>{source.title}</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors shrink-0" />
        </a>
      </h4>

      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-2.5">
        <span className="font-medium text-slate-300">{source.publisher}</span>
        {source.publication_date && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-500" />
            {source.publication_date}
          </span>
        )}
      </div>

      {source.content_excerpt && (
        <p className="text-xs text-slate-300 bg-surface/70 p-3 rounded-lg border border-surface-border/70 italic leading-relaxed">
          "{source.content_excerpt}"
        </p>
      )}

      {source.discovered_by_query && (
        <div className="text-[11px] text-slate-500 font-mono mt-2 truncate">
          Discovered via: "{source.discovered_by_query}"
        </div>
      )}
    </div>
  );
};
