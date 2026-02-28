import { Request, Response } from "express";
import { AlertService } from "../service/alerts.service.js";

export class AlertController {
  constructor(private alertService: AlertService) {}

  async getBranchAlerts(req: Request, res: Response) {
    try {
      const businessId = req.user?.businessId;
      const branchId = req.user?.branchId;

      if (!businessId || !branchId)
        return res.status(400).json({ message: "Missing identifiers" });

      const alerts = await this.alertService.getBranchAlerts(
        businessId,
        branchId
      );

      res.json(alerts);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const alertId = req.params.id;
       if (!alertId) {
          return res.status(400).json({ message: "Alert id is required" });
        }

        if (Array.isArray(alertId)) {
          return res.status(400).json({ message: "Alert cannot be an array" });
        }
      await this.alertService.markAsRead(alertId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }

  async resolveAlert(req: Request, res: Response) {
    try {
      const alertId = req.params.id;
      if (!alertId) {
          return res.status(400).json({ message: "Alert id is required" });
        }

        if (Array.isArray(alertId)) {
          return res.status(400).json({ message: "Alert cannot be an array" });
        }
      await this.alertService.resolve(alertId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
}