import type { MetricValue } from '@/types/scm/metric';

export interface AnalyticsKpi {
  label: string;
  metric: MetricValue;
  link?: string;
}

export interface AnalyticsChartPoint {
  label: string;
  value: number;
  drillDownLink?: string;
}

export interface AnalyticsOverviewData {
  kpis: AnalyticsKpi[];
  otifTrend: AnalyticsChartPoint[];
  topIssues: { label: string; value: number; link: string }[];
}

export interface AnalyticsSectionData {
  title: string;
  kpis: AnalyticsKpi[];
  chart: AnalyticsChartPoint[];
  drillDownHint?: string;
}
