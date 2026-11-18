import React from 'react';
import { ResearchSession, Report } from '../types';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import {
  FileText,
  Printer,
  Download,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface Props {
  activeSession: ResearchSession | null;
  onNavigate: (tab: string) => void;
}

export const ReportPage: React.FC<Props> = ({ activeSession, onNavigate }) => {
  const report = activeSession?.report;

  const handlePrint = () => {
    window.print();
  };

  if (!activeSession || !report) {
    return (
      <div className="p-12 text-center rounded-2xl border border-surface-border bg-surface-card max-w-xl mx-auto space-y-4">
        <FileText className="w-12 h-12 text-blue-400 mx-auto opacity-70" />
        <h3 className="text-lg font-bold text-white">Executive Dossier Not Yet Compiled</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          The Synthesis Agent publishes the final verified research dossier once the autonomous investigation reaches completion.
        </p>
        <button
          onClick={() => onNavigate('workspace')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
        >
          <span>Check Active Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Header - hidden when printing */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>Executive Intelligence Dossier</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Verified analytical report synthesized from multi-agent inquiry and empirical citations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all focus:outline-none"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {/* Main Printable Document Canvas */}
      <article className="rounded-2xl border border-surface-border bg-surface-card p-6 sm:p-10 space-y-8 shadow-2xl printable-document">
        {/* Document Header & Metadata */}
        <div className="border-b border-surface-border pb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-wider text-indigo-400 uppercase">
                VERITAS AI INTELLIGENCE SYSTEM
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono text-slate-400">
                DOSSIER #{report.report_id}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {new Date(report.generated_at).toLocaleDateString()}
              </span>
              <span>Session: {activeSession.session_id.slice(0, 8)}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug mb-4">
            {activeSession.original_query}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
              <span>Evidential Confidence Index: {(report.evidence_score * 100).toFixed(0)}%</span>
            </div>
            <span className="text-slate-400 font-mono">
              Domain: <strong className="text-slate-200 capitalize">{activeSession.domain}</strong>
            </span>
            <span className="text-slate-400 font-mono">
              Depth: <strong className="text-slate-200 capitalize">{activeSession.research_depth}</strong>
            </span>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-xs border-l-2 border-indigo-500 pl-3">
            1. Executive Summary
          </h2>
          <p className="text-sm text-slate-200 leading-relaxed font-normal bg-surface/40 p-4 rounded-xl border border-surface-border/60">
            {report.executive_summary}
          </p>
        </section>

        {/* Section 2: Methodology & Scope */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-xs border-l-2 border-indigo-500 pl-3">
            2. Methodology & Multi-Agent Scope
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            {report.methodology}
          </p>
        </section>

        {/* Section 3: Key Findings */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-xs border-l-2 border-indigo-500 pl-3">
            3. Core Evidential Findings
          </h2>
          <div className="space-y-3">
            {report.findings.map((f, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-surface-border bg-surface flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">{f.topic}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{f.finding}</p>
                </div>
                <span className="shrink-0 px-2 py-0.5 rounded text-[11px] font-mono font-medium uppercase bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 self-start">
                  {f.supported_status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Claim Verification Matrix */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-xs border-l-2 border-indigo-500 pl-3">
            4. Claim Verification Matrix
          </h2>
          <div className="overflow-x-auto rounded-xl border border-surface-border">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-surface text-slate-400 uppercase font-mono text-[10px] border-b border-surface-border">
                <tr>
                  <th className="px-4 py-3">Claim ID</th>
                  <th className="px-4 py-3">Discrete Proposition</th>
                  <th className="px-4 py-3">Verification Outcome</th>
                  <th className="px-4 py-3 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/60">
                {activeSession.claims.map((c) => (
                  <tr key={c.claim_id} className="hover:bg-surface/50">
                    <td className="px-4 py-3 font-mono text-slate-400">#{c.claim_id}</td>
                    <td className="px-4 py-3 font-medium text-slate-200">{c.claim_text}</td>
                    <td className="px-4 py-3">
                      <ConfidenceBadge status={c.verification_status} />
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-300">
                      {(c.confidence_score * 100).toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 5: Empirical Contradictions */}
        {report.conflicts.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white uppercase tracking-wider text-xs border-l-2 border-amber-500 pl-3">
              5. Empirical Contradictions & Nuance Preserved
            </h2>
            <div className="space-y-3">
              {report.conflicts.map((conf) => (
                <div key={conf.conflict_id} className="p-4 rounded-xl border border-amber-500/30 bg-surface space-y-2">
                  <h4 className="text-sm font-bold text-amber-300">{conf.proposition}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-2.5 rounded bg-surface-card border border-surface-border">
                      <span className="font-semibold text-cyan-400 block mb-0.5">Position A:</span>
                      <p className="text-slate-300">{conf.side_a_assertion}</p>
                    </div>
                    <div className="p-2.5 rounded bg-surface-card border border-surface-border">
                      <span className="font-semibold text-rose-400 block mb-0.5">Position B:</span>
                      <p className="text-slate-300">{conf.side_b_assertion}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 italic pt-1">{conf.explanation}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 6: Limitations */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-xs border-l-2 border-indigo-500 pl-3">
            6. Evidential & Methodological Limitations
          </h2>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
            {report.limitations.map((lim, idx) => (
              <li key={idx} className="leading-relaxed">{lim}</li>
            ))}
          </ul>
        </section>

        {/* Section 7: Source Bibliography */}
        <section className="space-y-3 pt-4 border-t border-surface-border">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-xs border-l-2 border-indigo-500 pl-3">
            7. Verified Source Bibliography
          </h2>
          <div className="space-y-2.5">
            {report.bibliography.map((src) => (
              <div key={src.source_id} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="font-mono text-indigo-400 shrink-0">[{src.source_id}]</span>
                <div>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-slate-200 hover:text-indigo-300 underline inline-flex items-center gap-1"
                  >
                    <span>{src.title}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-slate-400 ml-1.5">
                    — {src.publisher} ({src.publication_date || 'Recent'})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
};
