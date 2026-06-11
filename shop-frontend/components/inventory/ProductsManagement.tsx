import { 
    Package,
    Pencil,
    ArrowDownToLine,
    ArrowLeftRight,
    ClipboardList,
    AlertTriangle,
    DollarSign,
    Boxes
 } from "lucide-react";
import { GlassSheet } from "../ui/GlassSheet";
import { GlassButton } from "../ui/GlassButton";
import { DataCard } from "../ui/DataCard";
import { StockBadge } from "../ui/StockBadge";
import { Product } from "@business/shared-types";

interface ProductDetailsSheetProps {
    open: boolean;
    onclose: () => void;

    product: {
        id: string;
        name: string;
        quantity: number;
        price: number;
        costPrice: number;
        category?: string;
    } | null;

    onEditDetails?: () => void;
    onReceiveStock?: () => void;
    onAdjustStock?: () => void;
    onTransferStock?: () => void;
    onViewHistory?: () => void
}

export default function ProductDetailsSheet({
    open,
    onclose,
    product,
    onEditDetails,
    onReceiveStock,
    onAdjustStock,
    onTransferStock,
    onViewHistory,
}: ProductDetailsSheetProps){
    if(!open || !product) return null;

    const inventoryValue =
        product.quantity * product.costPrice;
    const margin =
        product.price - product.costPrice
    
    return (
        <GlassSheet
            open= {open}
            onClose={onclose}
            title={product.name}
            subtitle="Product Management"
        >
            <div className="space-y-4">
                <DataCard
                    title={product.name}
                    subtitle={product.category || "Uncategorized"}
                    badge={
                        <StockBadge quantity={product.quantity}/>
                    }
                    metrics={[
                        {
                            label: "Selling",
                            value: `₦${product.price.toLocaleString()}`
                        },
                        {
                            label: "Cost",
                            value: `₦${product.costPrice.toLocaleString()}`
                        },
                        {
                            label: "Margin",
                            value: `₦${margin.toLocaleString()}`,
                        },
                        {
                            label: "Value",
                            value: `₦${inventoryValue.toLocaleString()}`
                        }
                    ]}  
                />

                {/* MANAGEMENT ACTIONS*/}

                <div className="grid grid-cols-2 gap-3">
                    <GlassButton
                        variant="secondary"
                        onClick={onEditDetails}
                        className="justify-start"
                        >
                        <Pencil size={18} />
                        Edit Details
                    </GlassButton>
                    <GlassButton
                        onClick={onReceiveStock}
                        className="justify-start"
                        >
                        <ArrowDownToLine size={18}/>
                        Receive Stock
                    </GlassButton>

                    <GlassButton
                        variant="secondary"
                        onClick={onAdjustStock}
                        className="justify-start"
                        >
                        <AlertTriangle size={18}/>
                        Adjust Stock
                    </GlassButton>

                    <GlassButton
                        variant="secondary"
                        onClick={onTransferStock}
                        className="justify-start"
                        >
                        <ArrowLeftRight size={18}/>
                        Transfer Stock
                    </GlassButton>

                    <GlassButton
                        variant="secondary"
                        onClick={onViewHistory}
                        className="justify-start col-span-2"
                        >
                        <ClipboardList size={18}/>
                        InventoryHistory
                    </GlassButton>
                </div>

                {/* QUICK STATS */}

                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/20 p-4 backdrop-blur-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <Boxes size={16}/>
                            <span className="text-sm opacity-70">
                                Current Stock
                            </span>
                        </div>
                        <p className="text-2xl font-bold">
                            {product.quantity}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-white/20 p-4 backdrop-blur-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign size={16}/>
                            <span className="text-sm opacity-70">
                                InventoryValue
                            </span>
                        </div>

                        <p className="text-2xl font-bold">
                            ₦{inventoryValue.toLocaleString()}
                        </p>

                    </div>
                </div>
                
            </div>
        </GlassSheet>
    )
}