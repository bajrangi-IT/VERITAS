# VERITAS AI — Autonomous Multi-Agent Research & Fact-Verification Platform

[![PromptWars](https://img.shields.io/badge/PromptWars-PS03-6366F1.svg)](https://github.com)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.13-3776AB.svg?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **PromptWars PS03 Final Submission**: An enterprise-grade, evidence-grounded intelligence platform orchestrating six specialized autonomous agents to research complex propositions, cross-examine claims against empirical evidence, and uncover hidden statistical discrepancies.

---

## 🚀 1-Click Instant Deployment

VERITAS AI features a unified production runtime serving both the FastAPI REST/SSE API and the React TypeScript frontend from a single port.

| Deployment Target | 1-Click Action | Notes |
| :--- | :--- | :--- |
| **Render Cloud** | [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy) | Auto-detects `render.yaml`, builds multi-stage Docker container |
| **Railway Cloud** | [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new) | Uses `railway.json` with automated `/api/health` monitoring |
| **Local Docker** | `docker compose up --build` | Runs full stack on `http://localhost:8000` |
| **Windows Host** | Double-click `run.bat` | Launches backend, checks UI, opens browser |
| **Linux / macOS** | `./run.sh` or `python start.py` | Universal 1-click execution script |

*For complete deployment instructions, see [DEPLOYMENT.md](file:///z:/PROJECTS/vertis/DEPLOYMENT.md).*

---

## 1. Selected Challenge & Vertical Alignment

- **Challenge Vertical**: **PromptWars PS03 — Autonomous Fact Verification & Multi-Agent Intelligence Engine**
- **Root Problem**: Generic LLMs hallucinate assertions, conflate correlation with causation, and fail to distinguish short-term sprint benchmarks from longitudinal systemic reality. When asked complex empirical questions, standard AI systems fabricate citations, collapse nuances, and ignore conflicting evidence.
- **The VERITAS Solution**: VERITAS AI replaces monolithic prompt generation with a **six-agent distributed verification architecture** enforcing strict Pydantic contracts, SSRF-protected information retrieval, multi-tiered claim classification, and transparent mathematical confidence modeling.

---

## 2. Six Specialized AI Agents Architecture

VERITAS AI deploys six distinct autonomous roles, each governed by an isolated execution boundary and auditable state model:

```
                               ┌──────────────────────────┐
                               │   Inquiry Proposition    │
                               └─────────────┬────────────┘
                                             │
                                             ▼
                               ┌──────────────────────────┐
                               │   AGENT 1: Orchestrator  │
                               │  Decomposes 3-6 tracks   │
                               └─────────────┬────────────┘
                                             │
                                             ▼
                               ┌──────────────────────────┐
                               │   AGENT 2: Researcher    │
                               │  SSRF-Safe Multi-Search  │
                               └─────────────┬────────────┘
                                             │
                                             ▼
                               ┌──────────────────────────┐
                               │   AGENT 3: Verifier      │
                               │  5-Status Classification │
                               └─────────────┬────────────┘
                                             │
                                             ▼
                               ┌──────────────────────────┐
                               │   AGENT 4: Skeptic       │
                               │  Counterevidence Hunt    │
                               └─────────────┬────────────┘
                                             │
                                             ▼
                               ┌──────────────────────────┐
                               │ AGENT 5: Evidence Analyst│
                               │ Provenance & Corroborat. │
                               └─────────────┬────────────┘
                                             │
                                             ▼
                               ┌──────────────────────────┐
                               │   AGENT 6: Synthesis     │
                               │  Nuanced Dossier Report  │
                               └──────────────────────────┘
```

1. **Orchestrator Agent**: Analyzes inquiry intent, classifies domain context (Scientific, Government, Technology, Current Affairs, Finance, General), and decomposes complex inquiries into 3–6 analytical sub-tracks with bounded concurrency.
2. **Researcher Agent**: Executes parallel searches across Tavily API, live DuckDuckGo fallback, or authentic pre-verified research fixtures. Normalizes URLs, strips tracking parameters, and stores provenance excerpts.
3. **Verifier Agent**: Cross-examines individual claims against retrieved source snippets using our 5-status evidential taxonomy:
   - `SUPPORTED`: Direct corroboration across independent high-authority publications.
   - `PARTIALLY_SUPPORTED`: Corroborated in specific contexts but challenged by boundary conditions.
   - `CONTRADICTED`: Explicitly disproven by high-authority counterevidence.
   - `INSUFFICIENT_EVIDENCE`: Uncorroborated by available verified citations.
   - `UNVERIFIABLE`: Subjective or logically untestable assertions.
4. **Skeptic Agent**: Adversarially challenges emergent consensus, uncovering counterevidence, detecting outdated citations, and flagging statistical disparities between isolated benchmarks and longitudinal telemetry.
5. **Evidence Analyst Agent**: Audits publisher authority (`peer_reviewed` = 0.95, `official_doc` = 0.95, `industry_report` = 0.88), evaluates publisher independence ratios, and calculates mathematically grounded confidence scores.
6. **Synthesis Agent**: Harmonizes agent intelligence, preserves empirical contradictions rather than averaging them away, explicitly notes methodological boundaries, and compiles the printable Executive Dossier.

---

## 3. Advanced Fact Verification & Contradiction Detection

### 3.1 Transparent Confidence Calculation
Unlike LLM systems that hallucinate uncalibrated arbitrary percentages, VERITAS AI calculates confidence through a deterministic formula:

$$\text{Confidence} = \left(\frac{1}{N} \sum_{i=1}^N \text{Authority}(S_i) \times \text{Recency}(S_i)\right) \times \min\left(1.0, 0.85 + 0.15 \times (\text{Publishers} - 1)\right) \times \text{Penalty}$$

- **Authority Weights**: Peer-reviewed = 0.95, Government/Official = 0.95, Industry Benchmark = 0.88, Press = 0.80, Web = 0.72.
- **Recency Decay**: $\le 1\text{ year} = 1.0$, $\le 3\text{ years} = 0.95$, $\le 5\text{ years} = 0.88$, $\le 10\text{ years} = 0.78$.
- **Corroboration Factor**: Rewards multiple independent institutional domains.
- **Penalties**: Partially supported findings are penalized by 0.75x to prevent overconfidence.

### 3.2 Nuanced Discrepancy Reconciliation
VERITAS AI distinguishes between:
- **Direct Factual Contradictions**: Mutual logical incompatibility.
- **Statistical Disparities**: Variances resulting from different measurement scopes (e.g. 55% task completion speedup vs 41% code churn increase).
- **Temporal Shifts**: 2023 prototype benchmarks vs 2024 enterprise maintenance telemetry.
- **Contextual Nuances**: Task-level syntax authoring automation vs macro-level software engineering occupational demand.

---

## 4. Benchmark Demonstration Topic

As specified in the hackathon challenge, VERITAS AI includes built-in verified research data for the benchmark question:

> **"Is artificial intelligence replacing software developers, or is it increasing developer productivity?"**

### Findings Summary
1. **Developer Velocity (Corroborated)**:
   - Controlled trials (MIT Economics / Science 2023, Microsoft Research / arXiv 2023) confirm 40%–55% speedups on routine coding and documentation.
2. **Quality & Technical Debt Counterbalance (Skeptic Flagged)**:
   - Repository telemetry analysis (GitClear 2024) across 153M changed lines reveals a **41% increase in code churn** and duplicate boilerplate.
   - Stanford / ACM CCS 2023 study demonstrates developers with AI assistance produce significantly more security vulnerabilities while being more confident in code safety.
3. **Macroeconomic Employment (Corroborated)**:
   - U.S. Bureau of Labor Statistics (BLS 2024) projects **17% employment growth** (140,000+ annual openings) through 2033 for software developers.
4. **Synthesis Conclusion**: AI acts as a **velocity force-multiplier on routine subtasks**, not an occupational replacement for systems architects and security engineers.

---

## 5. Security Architecture (Medium Impact)

- **Server-Side Security**: All API keys and secrets reside strictly in backend environment variables. Zero credentials are exposed in frontend bundles or logs.
- **SSRF Prevention (`ssrf_guard.py`)**: Strict socket address resolution blocks private networks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), loopbacks (`127.0.0.0/8`), link-local metadata endpoints (`169.254.169.254`), and dangerous protocols (`file://`, `gopher://`, `ftp://`).
- **Prompt Injection Defense**: Untrusted external web content is quarantined as raw string excerpts and never executed.
- **Input Sanitization**: Control characters, null bytes, and malicious payloads are filtered out before reaching analytical agents.
- **Resource Constraints**: Bounded concurrency (`asyncio.Semaphore`), 15s request timeouts, 1MB maximum page fetch size, and rate limiting.

---

## 6. Technology Stack & Directory Structure

- **Backend**: Python 3.11+ / FastAPI / Pydantic v2 / HTTPX / SSE-Starlette / Pytest-Asyncio
- **Frontend**: React 18 / TypeScript / Vite / Tailwind CSS / Lucide React
- **Architecture**: Monorepo with separated client and server modules

```
vertis/
├── backend/
│   └── app/
│       ├── api/            # FastAPI routes & SSE streaming
│       ├── agents/         # 6 specialized autonomous agent classes
│       ├── core/           # Configuration, SSRF security, logging, exceptions
│       ├── models/         # Pydantic data contracts & event schemas
│       ├── research/       # Web research engine, deduplication, search providers
│       ├── verification/   # Fact checker, contradiction engine, confidence scorer
│       ├── reporting/      # Dossier generator, Markdown/PDF exporter
│       └── services/       # Session manager, async event bus, coordinator
├── frontend/
│   └── src/
│       ├── components/     # AgentCard, ClaimCard, SourceItem, ConflictAlert, Header
│       ├── pages/          # Dashboard, Workspace, Agents, Evidence, Conflicts, Report, Settings
│       ├── services/       # Typed API client & SSE subscriber
│       ├── types/          # Shared TypeScript interfaces
│       └── styles/         # Tailwind CSS & accessible typography
├── tests/
│   ├── backend/            # Pytest suite (models, security, agents, verification, API)
│   └── frontend/           # Smoke tests
├── package.json            # Monorepo task runner
├── requirements.txt        # Backend dependencies
├── pyproject.toml          # Python project & pytest configuration
├── .env.example            # Environment template
└── README.md               # Technical documentation
```

---

## 7. Installation & Quick Start

### 7.1 Prerequisites
- Python 3.11, 3.12, or 3.13
- Node.js 18+ and npm

### 7.2 Backend Setup
```bash
# Clone the repository
git clone <public-repo-url>
cd vertis

# Install Python backend dependencies
pip install -r requirements.txt

# Configure environment variables (optional: system runs out-of-the-box in hybrid mode)
cp .env.example .env

# Start FastAPI backend server
python -m uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```
*API documentation available at `http://localhost:8000/docs`.*

### 7.3 Frontend Setup
```bash
# Open a new terminal
cd frontend

# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
```
*Application available at `http://localhost:5173`.*

---

## 8. Verification & Test Execution

Run the complete backend test suite:
```bash
python -m pytest tests/backend -v
```

**Test Execution Results**:
```
tests/backend/test_agents.py::test_all_six_agents_pipeline PASSED
tests/backend/test_api.py::test_health_check_endpoint PASSED
tests/backend/test_api.py::test_create_and_get_research_session PASSED
tests/backend/test_api.py::test_nonexistent_session_returns_404 PASSED
tests/backend/test_api.py::test_cancel_session_endpoint PASSED
tests/backend/test_models.py::test_research_request_validation PASSED
tests/backend/test_models.py::test_research_request_rejects_empty_query PASSED
tests/backend/test_models.py::test_research_request_rejects_excessive_sources PASSED
tests/backend/test_models.py::test_source_model_defaults PASSED
tests/backend/test_models.py::test_claim_model_verification_statuses PASSED
tests/backend/test_security.py::test_ssrf_blocks_localhost PASSED
tests/backend/test_security.py::test_ssrf_blocks_private_ranges PASSED
tests/backend/test_security.py::test_ssrf_blocks_cloud_metadata PASSED
tests/backend/test_security.py::test_ssrf_blocks_invalid_schemes PASSED
tests/backend/test_security.py::test_ssrf_allows_public_https_domains PASSED
tests/backend/test_security.py::test_sanitize_input_text PASSED
tests/backend/test_verification.py::test_recency_score_calculation PASSED
tests/backend/test_verification.py::test_fact_checker_classifies_supported PASSED
tests/backend/test_verification.py::test_fact_checker_insufficient_evidence PASSED
tests/backend/test_verification.py::test_contradiction_engine_detects_discrepancies PASSED
============================== 20 passed in 1.43s ==============================
```

Build production frontend:
```bash
npm --prefix frontend run build
```

---

## 9. Evaluator Walkthrough (PromptWars Scoring)

1. **Launch Platform**: Run the backend (`uvicorn backend.app.main:app --port 8000`) and open the frontend (`http://localhost:5173`).
2. **Execute Benchmark**: Click **"Run Verification Benchmark"** on the Overview screen.
3. **Inspect Real-time SSE Stream**: Observe the real-time notification banner as the Orchestrator decomposes the inquiry into sub-tracks.
4. **Audit Autonomous Agents**: Navigate to **"Autonomous Agents"** to inspect each agent's execution status, task trace, duration, and output summary.
5. **Inspect Evidence Ledger**: Navigate to **"Evidence Ledger"** to see extracted claims, 5-tier status badges, and clickable primary citations.
6. **Review Discrepancy Intelligence**: Open **"Discrepancy Intelligence"** to view how empirical conflicts (developer velocity vs code churn and security debt) are analyzed.
7. **Export Executive Dossier**: Navigate to **"Executive Dossier"** and click **"Print / Export PDF"** for an executive-ready formatted report.

---

## 10. Repository Hygiene & Compliance

- **Single Branch**: All code resides on the single `main` branch.
- **Repository Size**: Strictly under **10 MB** (source repository footprint < 1.5 MB).
- **Public Visibility**: Designed for public hackathon evaluation with complete MIT licensing.
- **No Committed Secrets**: Environment variables managed via `.env.example`.
- **Zero Prompt Language in UI**: The entire user interface is designed as a pristine, professional intelligence platform.

---

## 11. Assumptions & Limitations

- **Search Fallback**: When live search provider credentials are not configured, VERITAS AI transparently uses its authenticated empirical fixture database, guaranteeing full evaluability in any offline or air-gapped test environment.
- **Context Boundaries**: Codebase telemetry reflects modern 2023–2024 repository datasets; long-term multi-decade enterprise legacy impacts will require ongoing longitudinal monitoring.

---
*Developed with precision for PromptWars PS03.*
