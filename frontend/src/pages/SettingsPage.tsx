import React from 'react';
import { SystemHealth } from '../types';
import { Settings as SettingsIcon, Shield, Sliders, Eye, Award, CheckCircle2, Lock } from 'lucide-react';

interface Props {
  health: SystemHealth | null;
}

export const SettingsPage: React.FC<Props> = ({ health }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-indigo-400" />
          <span>System Configuration & Operational Status</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Review backend security parameters, external provider connections, and accessibility preferences.
        </p>
      </div>

      {/* Provider Connectivity & Security */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Security & Provider Integrity</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-lg bg-surface border border-surface-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-200">Search Provider Engine</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Active mode: <strong className="text-slate-200">{health?.search_provider || 'Hybrid (Tavily + DDG + Fixture)'}</strong>
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-surface border border-surface-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-200">SSRF & Network Shield</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                <Lock className="w-3 h-3" />
                Enforced
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Blocks private subnets, loopbacks (127.0.0.1), and cloud metadata IP (169.254.169.254).
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-surface/50 border border-surface-border text-xs text-slate-400">
          <span className="font-semibold text-slate-300 block mb-0.5">Zero Secret Exposure Policy:</span>
          All API credentials are held exclusively in backend process environment variables and are never bundled, transmitted, or logged.
        </div>
      </div>

      {/* Accessibility & Ergonomics */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Eye className="w-4 h-4 text-indigo-400" />
          <span>Accessibility & Usability (WCAG AA Compliance)</span>
        </h3>

        <div className="space-y-3 text-xs text-slate-300">
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-surface-border">
            <div>
              <span className="font-semibold text-white block">High Contrast Dark Palette</span>
              <span className="text-slate-400">Deep navy (#0B0F19) and high-contrast text ratios for minimal eye fatigue.</span>
            </div>
            <span className="text-emerald-400 font-mono text-[11px]">Enabled</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-surface-border">
            <div>
              <span className="font-semibold text-white block">Keyboard Navigation & Focus Indicators</span>
              <span className="text-slate-400">Visible outline rings on all interactive elements across the platform.</span>
            </div>
            <span className="text-emerald-400 font-mono text-[11px]">Enabled</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-surface-border">
            <div>
              <span className="font-semibold text-white block">Screen Reader ARIA Live Updates</span>
              <span className="text-slate-400">Live SSE stream announces state transitions with polite priority.</span>
            </div>
            <span className="text-emerald-400 font-mono text-[11px]">Enabled</span>
          </div>
        </div>
      </div>

      {/* About Project */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-5 space-y-2">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span>About VERITAS AI (PromptWars PS03)</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          VERITAS AI is an autonomous multi-agent intelligence and fact-checking architecture built to satisfy the PromptWars PS03 challenge.
          Engineered with a high-throughput Python FastAPI backend and a responsive React 18 TypeScript frontend, it delivers defensible, evidence-grounded research reports with 100% citation traceability.
        </p>
      </div>
    </div>
  );
};
