
export type MetricTrend = "up" | "down" | "neutral";

export interface PlatformMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: MetricTrend;
  description: string;
  icon: string;
  variant: "primary" | "success" | "danger";
}

export interface RevenueDataPoint {
  label: string;
  revenue: number;
  previousRevenue: number;
}

export interface TenantGrowthDataPoint {
  label: string;
  tenants: number;
  branches: number;
}

export type PlatformHealthStatus =
  | "OPERATIONAL"
  | "DEGRADED"
  | "OUTAGE";

export interface PlatformServiceHealth {
  id: string;
  name: string;
  description: string;
  status: PlatformHealthStatus;
  uptime: string;
  latency: string;
}

export interface PlatformActivity {
  id: string;
  title: string;
  description: string;
  actor: string;
  timestamp: string;
  category:
    | "TENANT"
    | "BILLING"
    | "SECURITY"
    | "SYSTEM"
    | "ADMIN";
}

export interface PlatformAlert {
  id: string;
  title: string;
  description: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  timestamp: string;
  resolved: boolean;
}

export interface FounderDashboardData {
  metrics: PlatformMetric[];
  revenue: RevenueDataPoint[];
  tenantGrowth: TenantGrowthDataPoint[];
  services: PlatformServiceHealth[];
  activities: PlatformActivity[];
  alerts: PlatformAlert[];
}
