export type ResearchDepth = 'brief' | 'standard' | 'deep';
export type ResearchDomain = 'general' | 'technology' | 'scientific' | 'government' | 'current_affairs' | 'finance';

export type SessionStatus =
  | 'queued'
  | 'initializing'
  | 'researching'
  | 'verifying'
  | 'analyzing'
  | 'synthesizing'
  | 'completed'
  | 'cancelled'
  | 'failed';

export type VerificationStatus =
  | 'SUPPORTED'
  | 'PARTIALLY_SUPPORTED'
  | 'CONTRADICTED'
  | 'INSUFFICIENT_EVIDENCE'
  | 'UNVERIFIABLE';

export type AgentStatus = 'idle' | 'running' | 'completed' | 'failed' | 'skipped';

export interface Source {
  source_id: string;
  title: string;
  url: string;
  publisher: string;
  publication_date?: string;
  retrieved_at: string;
  source_type: string;
  content_excerpt: string;
  credibility_score: number;
  discovered_by_query?: string;
  is_accessible: boolean;
}

export interface Claim {
  claim_id: string;
  claim_text: string;
  verification_status: VerificationStatus;
  supporting_sources: string[];
  contradicting_sources: string[];
  explanation: string;
  confidence_score: number;
  methodology_note?: string;
}

export interface ConflictRecord {
  conflict_id: string;
  proposition: string;
  side_a_assertion: string;
  side_a_sources: string[];
  side_b_assertion: string;
  side_b_sources: string[];
  conflict_type: string;
  explanation: string;
}

export interface AgentExecution {
  agent_id: string;
  agent_name: string;
  status: AgentStatus;
  task: string;
  started_at?: string;
  completed_at?: string;
  duration_ms?: number;
  output_summary?: string;
  error?: string;
}

export interface ReportFinding {
  topic: string;
  finding: string;
  supported_status: string;
}

export interface Report {
  report_id: string;
  session_id: string;
  executive_summary: string;
  methodology: string;
  findings: ReportFinding[];
  conflicts: ConflictRecord[];
  limitations: string[];
  bibliography: Source[];
  generated_at: string;
  evidence_score: number;
}

export interface ResearchSession {
  session_id: string;
  original_query: string;
  domain: ResearchDomain;
  research_depth: ResearchDepth;
  maximum_sources: number;
  status: SessionStatus;
  created_at: string;
  updated_at: string;
  subquestions: string[];
  agents: Record<string, AgentExecution>;
  sources: Source[];
  claims: Claim[];
  conflicts: ConflictRecord[];
  report?: Report;
  error_message?: string;
}

export interface SystemHealth {
  status: string;
  version: string;
  environment: string;
  active_sessions: number;
  search_provider: string;
  llm_connected: boolean;
  timestamp: string;
}

export interface SSEEventPayload {
  event_type: string;
  session_id: string;
  timestamp: string;
  data: Record<string, any>;
  message: string;
}
