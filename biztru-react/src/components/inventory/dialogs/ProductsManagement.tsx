
import {
    Pencil,
    ArrowDownToLine,
    ArrowLeftRight,
    ClipboardList,
    AlertTriangle,
    DollarSign,
    Boxes,
    Barcode,
    Printer,
} from "lucide-react";

import { GlassSheet } from "../../ui/GlassSheet";
import { GlassButton } from "../../ui/GlassButton";
import { DataCard } from "../../ui/DataCard";
import { StockBadge } from "../../ui/StockBadge";

import type { LiveProduct } from "../../../Biztru/offline/sqlite/businessDatabase/repositories/SQLiteProjectionRepository/SQLiteProductRepository";

interface ProductDetailsSheetProps {
    open: boolean;
    onClose: () => void;

    product: LiveProduct | null;

    onEditDetails?: () => void;
    onReceiveStock?: () => void;
    onAdjustStock?: () => void;
    onTransferStock?: () => void;
    onViewHistory?: () => void;

    onPrintLabel?: () => void;
    onGenerateBarcode?: () => void;
}

const currencyFormatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 2,
});

function formatCurrency(value: number): string {
    return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

function formatNumber(value: number): string {
    return numberFormatter.format(Number.isFinite(value) ? value : 0);
}

export default function ProductDetailsSheet({
    open,
    onClose,
    product,
    onEditDetails,
    onReceiveStock,
    onAdjustStock,
    onTransferStock,
    onViewHistory,
    onPrintLabel,
    onGenerateBarcode,
}: ProductDetailsSheetProps) {
    if (!open || !product) {
        return null;
    }

    const quantity = Number(product.quantity) || 0;
    const sellingPrice = Number(product.price) || 0;
    const costPrice = Number(product.costPrice) || 0;

    const inventoryValue = quantity * costPrice;
    const margin = sellingPrice - costPrice;
    const marginPercentage =
        sellingPrice > 0 ? (margin / sellingPrice) * 100 : 0;

    const barcode = String(product.barcode ?? "").trim();
    const hasBarcode = barcode.length > 0;

    const hasManagementActions = Boolean(
        onEditDetails ||
        onReceiveStock ||
        onAdjustStock ||
        onTransferStock ||
        onViewHistory
    );

    return (
        <GlassSheet
            open={open}
            onClose={onClose}
            title={product.name}
            subtitle="Product Management"
            className="
                w-full
                sm:max-w-xl
                lg:max-w-2xl
                xl:max-w-3xl
            "
        >
            <div className="space-y-5">

                {/* PRODUCT OVERVIEW */}

                <DataCard
                    title={product.name}
                    subtitle={product.category || "Uncategorized"}
                    badge={<StockBadge quantity={quantity} />}
                    metrics={[
                        {
                            label: "Selling Price",
                            value: formatCurrency(sellingPrice),
                        },
                        {
                            label: "Cost Price",
                            value: formatCurrency(costPrice),
                        },
                        {
                            label: "Unit Margin",
                            value: formatCurrency(margin),
                        },
                        {
                            label: "Stock Value",
                            value: formatCurrency(inventoryValue),
                        },
                    ]}
                />

                {/* BARCODE AND LABEL MANAGEMENT */}

                <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="mb-3 flex items-center gap-2">
                        <Barcode size={19} className="text-teal-300" />

                        <h3 className="text-sm font-semibold">
                            Barcode & Labels
                        </h3>
                    </div>

                    {hasBarcode ? (
                        <div className="space-y-3">
                            <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                                <p className="mb-1 text-xs text-white/50">
                                    Product barcode
                                </p>

                                <p className="break-all font-mono text-sm font-semibold tracking-wider">
                                    {barcode}
                                </p>
                            </div>

                            {onPrintLabel && (
                                <GlassButton
                                    onClick={onPrintLabel}
                                    className="w-full justify-center"
                                >
                                    <Printer size={17} />
                                    Print Product Label
                                </GlassButton>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-white/60">
                                This product does not have a barcode assigned.
                                Generate one before printing a product label.
                            </p>

                            {onGenerateBarcode && (
                                <GlassButton
                                    onClick={onGenerateBarcode}
                                    className="w-full justify-center"
                                >
                                    <Barcode size={17} />
                                    Generate Product Barcode
                                </GlassButton>
                            )}
                        </div>
                    )}
                </section>

                {/* INVENTORY MANAGEMENT ACTIONS */}

                {hasManagementActions && (
                    <section className="space-y-3">
                        <h3 className="text-sm font-semibold text-white/70">
                            Inventory Actions
                        </h3>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {onEditDetails && (
                                <GlassButton
                                    variant="secondary"
                                    onClick={onEditDetails}
                                    className="justify-start"
                                >
                                    <Pencil size={18} />
                                    Edit Details
                                </GlassButton>
                            )}

                            {onReceiveStock && (
                                <GlassButton
                                    onClick={onReceiveStock}
                                    className="justify-start"
                                >
                                    <ArrowDownToLine size={18} />
                                    Receive Stock
                                </GlassButton>
                            )}

                            {onAdjustStock && (
                                <GlassButton
                                    variant="secondary"
                                    onClick={onAdjustStock}
                                    className="justify-start"
                                >
                                    <AlertTriangle size={18} />
                                    Adjust Stock
                                </GlassButton>
                            )}

                            {onTransferStock && (
                                <GlassButton
                                    variant="secondary"
                                    onClick={onTransferStock}
                                    className="justify-start"
                                >
                                    <ArrowLeftRight size={18} />
                                    Transfer Stock
                                </GlassButton>
                            )}

                            {onViewHistory && (
                                <GlassButton
                                    variant="secondary"
                                    onClick={onViewHistory}
                                    className="justify-start sm:col-span-2"
                                >
                                    <ClipboardList size={18} />
                                    Inventory History
                                </GlassButton>
                            )}
                        </div>
                    </section>
                )}

                {/* QUICK INVENTORY STATISTICS */}

                <section className="space-y-3">
                    <h3 className="text-sm font-semibold text-white/70">
                        Inventory Overview
                    </h3>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <div className="mb-2 flex items-center gap-2 text-white/60">
                                <Boxes size={17} />

                                <span className="text-sm">
                                    Current Stock
                                </span>
                            </div>

                            <p className="text-2xl font-bold">
                                {formatNumber(quantity)}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <div className="mb-2 flex items-center gap-2 text-white/60">
                                <DollarSign size={17} />

                                <span className="text-sm">
                                    Inventory Value
                                </span>
                            </div>

                            <p className="break-words text-2xl font-bold">
                                {formatCurrency(inventoryValue)}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <p className="mb-2 text-sm text-white/60">
                                Unit Profit Margin
                            </p>

                            <p
                                className={`text-xl font-bold ${
                                    margin < 0
                                        ? "text-red-400"
                                        : "text-emerald-400"
                                }`}
                            >
                                {formatCurrency(margin)}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <p className="mb-2 text-sm text-white/60">
                                Margin Percentage
                            </p>

                            <p
                                className={`text-xl font-bold ${
                                    margin < 0
                                        ? "text-red-400"
                                        : "text-emerald-400"
                                }`}
                            >
                                {formatNumber(marginPercentage)}%
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </GlassSheet>
    );
}
