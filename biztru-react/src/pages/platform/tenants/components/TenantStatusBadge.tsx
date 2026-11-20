
import { StockBadge } from "../../../../components/ui/StockBadge"; 

import type {
  TenantStatus,
} from "../types/tenant.types";

const statusMap: Record<
  TenantStatus,
  { label: string; variant: string }
> = {
  ACTIVE: { label: "Active", variant: "success" },
  TRIAL: { label: "Trial", variant: "primary" },
  SUSPENDED: { label: "Suspended", variant: "danger" },
  PENDING: { label: "Pending", variant: "warning" },
  CANCELLED: { label: "Cancelled", variant: "danger" },
};

export function TenantStatusBadge({
  status,
}: {
  status: TenantStatus;
}) {
  const config = statusMap[status];

  return (
    <StockBadge variant={config.variant as any}>
      {config.label}
    </StockBadge>
  );
}
