import React from 'react';
import { ShieldCheck, Activity, Terminal, ExternalLink } from 'lucide-react';
import { SystemHealth } from '../types';

interface Props {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  health: SystemHealth | null;
}

export const Header: React.FC<Props> = ({ currentTab, onSelectTab, health }) => {
  const navItems = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'workspace', label: 'Workspace' },
    { id: 'agents', label: 'Autonomous Agents' },
    { id: 'evidence', label: 'Evidence Ledger' },
    { id: 'conflicts', label: 'Discrepancy Intelligence' },
    { id: 'report', label: 'Executive Dossier' },
    { id: 'settings', label: 'Configuration' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-surface-border bg-[#0B0F19]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                  VERITAS <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">AI</span>
                </span>
                <span className="text-[10px] font-mono tracking-wider text-slate-400 block -mt-0.5">
                  AUTONOMOUS INTELLIGENCE
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* System status & API docs */}
          <div className="flex items-center gap-3">
            <a
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 bg-surface px-2.5 py-1 rounded-lg border border-surface-border transition-colors"
            >
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>OpenAPI</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="hidden sm:inline font-mono">v1.0.0</span>
              <span className="text-[11px] font-medium">Operational</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
