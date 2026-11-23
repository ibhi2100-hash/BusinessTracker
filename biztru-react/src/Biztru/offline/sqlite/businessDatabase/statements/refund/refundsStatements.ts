import type { PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { refundsKeys } from "./refundsStatementKeys";

export class RefundStatement {
  private readonly manager: PreparedStatementManager
  constructor(manager: PreparedStatementManager) {
    this.manager = manager
  }

  get refundUpsert() { return this.manager.get(refundsKeys.refundUpsert); }
  get refundItemUpsert() { return this.manager.get(refundsKeys.refundItemUpsert); }
  get refundPaymentUpsert() { return this.manager.get(refundsKeys.refundPaymentUpsert); }
  get findRefundById() { return this.manager.get(refundsKeys.findRefundById); }
  get findRefundItems() { return this.manager.get(refundsKeys.findRefundItems); }
  get findRefundPayments() { return this.manager.get(refundsKeys.findRefundPayments); }
  get listRefunds() { return this.manager.get(refundsKeys.listRefunds); }
  get countRefunds() { return this.manager.get(refundsKeys.countRefunds); }
  get summaryByDateRange() { return this.manager.get(refundsKeys.summaryByDateRange); }
  get findRefundsBySale() { return this.manager.get(refundsKeys.findRefundsBySale); }
}
