import { describe, expect, it } from 'vitest';
import { resolvePlanActions } from '@/constants/planActions';

describe('resolvePlanActions (§38)', () => {
  it('allows supply planner to calculate and submit calculated plan', () => {
    const draft = resolvePlanActions('SUPPLY_PLANNER', 'DRAFT', ['EDIT', 'CALCULATE', 'SUBMIT']);
    expect(draft).toEqual(expect.arrayContaining(['EDIT', 'CALCULATE']));
    expect(draft).not.toContain('SUBMIT');

    const calculated = resolvePlanActions('SUPPLY_PLANNER', 'CALCULATED', ['EDIT', 'CALCULATE', 'SUBMIT']);
    expect(calculated).toContain('SUBMIT');
  });

  it('allows SCM manager to approve review plan', () => {
    const actions = resolvePlanActions('SUPPLY_CHAIN_MANAGER', 'REVIEW', ['APPROVE', 'REJECT', 'SUBMIT']);
    expect(actions).toEqual(expect.arrayContaining(['APPROVE', 'REJECT']));
    expect(actions).not.toContain('SUBMIT');
  });

  it('adds transport-only actions for logistics manager', () => {
    const actions = resolvePlanActions(
      'LOGISTICS_MANAGER',
      'DRAFT',
      ['CALCULATE', 'RECALCULATE', 'CHANGE_CARRIER'],
      'transport',
    );
    expect(actions).toEqual(expect.arrayContaining(['RECALCULATE', 'CHANGE_CARRIER']));
  });
});
