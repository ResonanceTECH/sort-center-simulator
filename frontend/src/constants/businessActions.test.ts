import { describe, expect, it } from 'vitest';
import { resolveShipmentActions } from '@/constants/businessActions';

describe('resolveShipmentActions (§40)', () => {
  it('allows logistics manager to change carrier on in-transit shipment', () => {
    const actions = resolveShipmentActions('LOGISTICS_MANAGER', 'IN_TRANSIT', [
      'CHANGE_CARRIER',
      'CREATE_INCIDENT',
      'CANCEL',
    ]);
    expect(actions).toContain('CHANGE_CARRIER');
    expect(actions).toContain('CREATE_INCIDENT');
  });

  it('blocks supplier from internal actions on in-transit', () => {
    const actions = resolveShipmentActions('SUPPLIER', 'IN_TRANSIT', [
      'CHANGE_CARRIER',
      'CONFIRM_READY',
      'REPORT_PROBLEM',
    ]);
    expect(actions).not.toContain('CHANGE_CARRIER');
    expect(actions).toContain('REPORT_PROBLEM');
  });

  it('allows carrier accept/reject on assigned shipment', () => {
    const actions = resolveShipmentActions('CARRIER', 'ASSIGNED', ['ACCEPT', 'REJECT', 'CHANGE_CARRIER']);
    expect(actions).toEqual(expect.arrayContaining(['ACCEPT', 'REJECT']));
    expect(actions).not.toContain('CHANGE_CARRIER');
  });

  it('returns empty when role is missing', () => {
    expect(resolveShipmentActions(undefined, 'IN_TRANSIT', ['CANCEL'])).toEqual([]);
  });
});
