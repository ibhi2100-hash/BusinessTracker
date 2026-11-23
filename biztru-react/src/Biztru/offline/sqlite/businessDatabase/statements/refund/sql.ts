export const REFUND_UPSERT = `
INSERT INTO refunds (
 id,businessId,branchId,originalSaleId,refundNumber,customerId,customerRef,
 reason,status,refundMethod,subtotal,taxAmount,totalAmount,userId,approvedBy,
 mode,createdAt,completedAt,updatedAt
) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
ON CONFLICT(id) DO UPDATE SET
 status=excluded.status,
 reason=excluded.reason,
 refundMethod=excluded.refundMethod,
 subtotal=excluded.subtotal,
 taxAmount=excluded.taxAmount,
 totalAmount=excluded.totalAmount,
 approvedBy=excluded.approvedBy,
 completedAt=excluded.completedAt,
 updatedAt=excluded.updatedAt
`;

export const REFUND_ITEM_UPSERT = `
INSERT INTO refund_items (
 id,refundId,businessId,branchId,originalSaleId,saleItemId,productId,productName,
 quantity,unitPrice,unitCostPrice,lineRefundAmount,lineCostAmount,
 inventoryDisposition,createdAt
) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
ON CONFLICT(id) DO UPDATE SET
 quantity=excluded.quantity,
 lineRefundAmount=excluded.lineRefundAmount,
 lineCostAmount=excluded.lineCostAmount,
 inventoryDisposition=excluded.inventoryDisposition
`;

export const REFUND_PAYMENT_UPSERT = `
INSERT INTO refund_payments (
 id,refundId,businessId,branchId,paymentMethod,amount,status,reference,createdAt,completedAt
) VALUES (?,?,?,?,?,?,?,?,?,?)
ON CONFLICT(id) DO UPDATE SET
 amount=excluded.amount,status=excluded.status,reference=excluded.reference,
 completedAt=excluded.completedAt
`;

export const FIND_REFUND_BY_ID = `SELECT * FROM refunds WHERE id=? LIMIT 1`;
export const FIND_REFUND_ITEMS = `SELECT * FROM refund_items WHERE refundId=? ORDER BY createdAt ASC`;
export const FIND_REFUND_PAYMENTS = `SELECT * FROM refund_payments WHERE refundId=? ORDER BY createdAt ASC`;
export const FIND_REFUNDS_BY_SALE = `SELECT * FROM refunds WHERE businessId=? AND originalSaleId=? ORDER BY createdAt DESC`;

export const LIST_REFUNDS = `
SELECT * FROM refunds
WHERE businessId=?
 AND (? IS NULL OR branchId=?)
 AND (? IS NULL OR originalSaleId=?)
 AND (? IS NULL OR createdAt>=?)
 AND (? IS NULL OR createdAt<=?)
 AND (?='all' OR status=?)
ORDER BY createdAt DESC LIMIT ? OFFSET ?
`;

export const COUNT_REFUNDS = `
SELECT COUNT(*) AS count FROM refunds
WHERE businessId=?
 AND (? IS NULL OR branchId=?)
 AND (? IS NULL OR originalSaleId=?)
 AND (? IS NULL OR createdAt>=?)
 AND (? IS NULL OR createdAt<=?)
 AND (?='all' OR status=?)
`;

export const REFUND_SUMMARY_BY_DATE_RANGE = `
SELECT
 COALESCE(SUM(CASE WHEN status='COMPLETED' THEN totalAmount ELSE 0 END),0) AS completedRefundAmount,
 COALESCE(SUM(CASE WHEN status='COMPLETED' THEN 1 ELSE 0 END),0) AS completedRefundCount,
 COALESCE(SUM(CASE WHEN status='PENDING' OR status='PROCESSING' THEN totalAmount ELSE 0 END),0) AS pendingRefundAmount
FROM refunds
WHERE businessId=? AND createdAt>=? AND createdAt<=?
 AND (? IS NULL OR branchId=?)
`;
