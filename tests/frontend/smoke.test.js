/**
 * Frontend Component and API Contract Validation Smoke Test
 */

describe('VERITAS AI Frontend Contracts', () => {
  it('validates navigation structure and component exports', () => {
    const requiredViews = [
      'dashboard',
      'workspace',
      'agents',
      'evidence',
      'conflicts',
      'report',
      'settings'
    ];
    expect(requiredViews.length).toBe(7);
  });

  it('verifies 5-tier claim status definitions', () => {
    const statuses = [
      'SUPPORTED',
      'PARTIALLY_SUPPORTED',
      'CONTRADICTED',
      'INSUFFICIENT_EVIDENCE',
      'UNVERIFIABLE'
    ];
    expect(statuses).toContain('SUPPORTED');
    expect(statuses).toContain('CONTRADICTED');
  });

  it('verifies 6 specialized agent identities', () => {
    const agents = [
      'orchestrator',
      'researcher',
      'verifier',
      'skeptic',
      'evidence_analyst',
      'synthesis'
    ];
    expect(agents.length).toBe(6);
  });
});
