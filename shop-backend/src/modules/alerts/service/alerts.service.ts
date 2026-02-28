import { AlertRepository } from "../repository/alerts.repository.js";
import { AlertType, AlertSeverity } from "../../../infrastructure/postgresql/prisma/generated/enums.js";

export class AlertService {
  constructor(private repo: AlertRepository) {}

  /**
   * Create a new alert if not already unresolved for the same type/metadata.
   */
  async createAlert(data: {
    businessId: string;
    branchId: string;
    type: AlertType;
    severity: AlertSeverity;
    title: string;
    message: string;
    metadata?: Record<string, any>;
  }) {
    // Prevent duplicate unresolved alerts
    const existing = await this.repo.findExisting(
      data.businessId,
      data.branchId,
      data.type,
      data.metadata
    );

    if (existing) return existing;

    const alert = await this.repo.create(data);

    // 🔔 Optional real-time broadcast via socket.io
    if ((global as any).io && data.branchId) {
      (global as any).io.to(data.branchId).emit("alert:new", alert);
    }

    return alert;
  }

  /**
   * Resolve an alert by ID and optionally broadcast the resolution.
   */
  async resolve(id: string) {
    const alert = await this.repo.resolve(id);

    // 🔔 Notify clients in real-time that the alert is resolved
    if ((global as any).io && alert.branchId) {
      (global as any).io.to(alert.branchId).emit("alert:resolved", alert.id);
    }

    return alert;
  }

  /**
   * Resolve all alerts of a certain type for a branch (optional)
   */
  async resolveByType(branchId: string, type: AlertType, metadataId?: string) {
    const resolvedAlerts = await this.repo.resolveByType(branchId, type, metadataId);

    // Broadcast resolution for each alert
    if ((global as any).io) {
      resolvedAlerts.forEach((alert) => {
        if (alert.branchId) (global as any).io.to(alert.branchId).emit("alert:resolved", alert.id);
      });
    }

    return resolvedAlerts;
  }
  getBranchAlerts = async (businessId: string, branchId: string)=> {

  }
  markAsRead = async (alertId: String)=> {

  }
}