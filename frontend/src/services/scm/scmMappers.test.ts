import { describe, expect, it } from 'vitest';
import {
  mapControlTower,
  mapExceptionSummary,
  mapIncidentComment,
  mapScenarioComparison,
  mapShipmentSummary,
  mapShipmentsPage,
  mapRecommendation,
} from '@/services/scm/scmMappers';

describe('scmMappers', () => {
  it('maps shipments page with 1-based backend pagination', () => {
    const result = mapShipmentsPage({
      items: [
        {
          id: 'SH-0100',
          supplierId: 'sup-1',
          supplierName: 'Supplier A',
          carrierId: 'car-1',
          carrierName: 'Carrier A',
          origin: 'Казань',
          destination: 'Москва',
          status: 'IN_TRANSIT',
          deviationMinutes: 12,
          slaRisk: { label: 'SLA Risk', value: 12, unit: '%', status: 'NORMAL' },
        },
      ],
      pagination: { page: 2, page_size: 25, total: 40, pages: 2 },
    });

    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(25);
    expect(result.total).toBe(40);
    expect(result.items[0]?.id).toBe('SH-0100');
  });

  it('maps snake_case shipment fields', () => {
    const item = mapShipmentSummary({
      id: 'SH-0101',
      supplier_id: 'sup-1',
      supplier_name: 'Supplier B',
      carrier_name: 'Carrier B',
      origin: 'A',
      destination: 'B',
      status: 'ASSIGNED',
      deviation_minutes: 5,
      sla_risk: { label: 'SLA Risk', value: 5, unit: '%', status: 'LOW' },
    });

    expect(item.supplierName).toBe('Supplier B');
    expect(item.deviationMinutes).toBe(5);
  });

  it('maps control tower payload', () => {
    const result = mapControlTower({
      kpis: [{ label: 'OTIF', value: '91.4', unit: '%', status: 'WARNING' }],
      requiresAttention: [],
      insights: [],
      recentActivity: [],
      alertCounts: { exceptions: 2, incidents: 1 },
    });

    expect(result.kpis).toHaveLength(1);
    expect(result.alertCounts.exceptions).toBe(2);
  });

  it('maps exception summary', () => {
    const result = mapExceptionSummary({
      id: 'exc-1',
      shipmentId: 'SH-0100',
      type: 'VEHICLE_STOP',
      severity: 'CRITICAL',
      severityStatus: 'CRITICAL',
      deviation: 'Stop 90m',
      probability: 0.9,
      impact: { label: 'Impact', value: 90, unit: '%', status: 'CRITICAL' },
      owner: '—',
      createdAt: '2026-09-02T10:00:00Z',
      route: 'A → B',
    });

    expect(result.severity).toBe('CRITICAL');
    expect(result.shipmentId).toBe('SH-0100');
  });

  it('maps recommendation from scenario payload', () => {
    const result = mapRecommendation(
      {
        recommendation: {
          action: 'REALLOCATE_SUPPLIER_VOLUME',
          description: 'Move volume',
          effects: {
            otif: { before: 0.79, after: 0.93 },
          },
        },
      },
      '550e8400-e29b-41d4-a716-446655440000',
      0,
    );

    expect(result?.title).toBe('REALLOCATE_SUPPLIER_VOLUME');
    expect(result?.id).toContain('550e8400-e29b-41d4-a716-446655440000');
  });

  it('maps scenario comparison table', () => {
    const result = mapScenarioComparison({
      scenarios: [{ id: 'scn-001', name: 'A' }, { id: 'scn-002', name: 'B' }],
      rows: [
        {
          kpi: 'OTIF',
          baseline: '92%',
          values: { 'scn-001': '79%', 'scn-002': '93%' },
          semantic: { 'scn-002': 'BEST' },
        },
      ],
      best_scenario_id: 'scn-002',
    });

    expect(result.scenarios).toHaveLength(2);
    expect(result.rows[0]?.values['scn-002']).toBe('93%');
    expect(result.bestScenarioId).toBe('scn-002');
  });

  it('maps incident comment payload', () => {
    const result = mapIncidentComment(
      { id: 'c-1', message: 'Hello', created_at: '2026-09-02T10:00:00Z', author: 'Anna', role: 'Manager' },
    );
    expect(result.message).toBe('Hello');
    expect(result.author).toBe('Anna');
  });
});
