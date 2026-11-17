
import {
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  Activity,
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Building2,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  Coins,
  Download,
  History,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";

import { toast } from "sonner";

import { GlassCard } from "../../components/ui/GlassCard";

/* ================================================================
   TYPES
================================================================ */

type BranchStatus = "ACTIVE" | "WARNING" | "INACTIVE";

type Branch = {
  id: string;
  name: string;
  location: string;
  manager: string;
  status: BranchStatus;
  allocatedCapital: number;
  availableCapital: number;
  inventoryValue: number;
  totalSales: number;
  expenses: number;
  staffCount: number;
};

type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: Record<string, number>;
  unitCost: number;
};

type CapitalTransaction = {
  id: string;
  type: "ALLOCATION" | "ADJUSTMENT" | "TRANSFER_IN" | "TRANSFER_OUT";
  branchId: string;
  amount: number;
  description: string;
  date: string;
  reference: string;
};

type StockTransaction = {
  id: string;
  productId: string;
  sourceBranchId: string;
  destinationBranchId: string;
  quantity: number;
  date: string;
  status: "COMPLETED" | "PENDING";
  reference: string;
};

/* ================================================================
   DUMMY DATA
================================================================ */

const initialBranches: Branch[] = [
  {
    id: "branch-001",
    name: "Wuse Branch",
    location: "Wuse 2, Abuja",
    manager: "David Okafor",
    status: "ACTIVE",
    allocatedCapital: 2500000,
    availableCapital: 850000,
    inventoryValue: 1850000,
    totalSales: 4200000,
    expenses: 780000,
    staffCount: 5,
  },
  {
    id: "branch-002",
    name: "Garki Branch",
    location: "Garki Area 11, Abuja",
    manager: "Samuel James",
    status: "ACTIVE",
    allocatedCapital: 1800000,
    availableCapital: 420000,
    inventoryValue: 1380000,
    totalSales: 3100000,
    expenses: 620000,
    staffCount: 4,
  },
  {
    id: "branch-003",
    name: "Kubwa Branch",
    location: "Kubwa, Abuja",
    manager: "Mary Ibrahim",
    status: "WARNING",
    allocatedCapital: 1200000,
    availableCapital: 95000,
    inventoryValue: 1105000,
    totalSales: 1950000,
    expenses: 510000,
    staffCount: 3,
  },
];

const initialProducts: Product[] = [
  {
    id: "product-001",
    name: "iPhone 13",
    sku: "APL-IP13-128",
    category: "Smartphones",
    quantity: {
      "branch-001": 12,
      "branch-002": 5,
      "branch-003": 2,
    },
    unitCost: 450000,
  },
  {
    id: "product-002",
    name: "Samsung A15",
    sku: "SAM-A15-128",
    category: "Smartphones",
    quantity: {
      "branch-001": 20,
      "branch-002": 14,
      "branch-003": 4,
    },
    unitCost: 165000,
  },
  {
    id: "product-003",
    name: "Oraimo FreePods",
    sku: "ORA-FP-01",
    category: "Accessories",
    quantity: {
      "branch-001": 35,
      "branch-002": 8,
      "branch-003": 3,
    },
    unitCost: 18000,
  },
  {
    id: "product-004",
    name: "Tecno Spark 20",
    sku: "TEC-SP20",
    category: "Smartphones",
    quantity: {
      "branch-001": 8,
      "branch-002": 3,
      "branch-003": 10,
    },
    unitCost: 145000,
  },
];

const initialCapitalTransactions: CapitalTransaction[] = [
  {
    id: "cap-001",
    type: "ALLOCATION",
    branchId: "branch-001",
    amount: 2500000,
    description: "Initial branch capital",
    date: "2026-11-15",
    reference: "CAP-001",
  },
  {
    id: "cap-002",
    type: "ALLOCATION",
    branchId: "branch-002",
    amount: 1800000,
    description: "Initial branch capital",
    date: "2026-11-14",
    reference: "CAP-002",
  },
  {
    id: "cap-003",
    type: "ALLOCATION",
    branchId: "branch-003",
    amount: 1200000,
    description: "Initial branch capital",
    date: "2026-11-13",
    reference: "CAP-003",
  },
];

const initialStockTransactions: StockTransaction[] = [
  {
    id: "stk-001",
    productId: "product-001",
    sourceBranchId: "branch-001",
    destinationBranchId: "branch-002",
    quantity: 3,
    date: "2026-11-16",
    status: "COMPLETED",
    reference: "STK-001",
  },
];

/* ================================================================
   HELPERS
================================================================ */

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

const formatNumber = (amount: number) =>
  new Intl.NumberFormat("en-NG").format(amount);

const today = () => new Date().toISOString().slice(0, 10);

const makeReference = (prefix: string) =>
  `${prefix}-${Date.now().toString().slice(-8)}`;

function getBranchName(branches: Branch[], id: string) {
  return branches.find((branch) => branch.id === id)?.name ?? "Unknown branch";
}

function getProductName(products: Product[], id: string) {
  return products.find((product) => product.id === id)?.name ?? "Unknown product";
}

/* ================================================================
   SMALL REUSABLE UI COMPONENTS
================================================================ */

function Metric({
  label,
  value,
  icon: Icon,
  detail,
  accent = "teal",
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  detail?: string;
  accent?: "teal" | "blue" | "green" | "orange";
}) {
  const accentClasses = {
    teal: "bg-teal-500/10 text-teal-400",
    blue: "bg-blue-500/10 text-blue-400",
    green: "bg-emerald-500/10 text-emerald-400",
    orange: "bg-orange-500/10 text-orange-400",
  };

  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-white/45">{label}</p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            {value}
          </h3>
          {detail && (
            <p className="mt-1 text-[11px] text-white/40">{detail}</p>
          )}
        </div>

        <div className={`rounded-xl p-2.5 ${accentClasses[accent]}`}>
          <Icon size={19} />
        </div>
      </div>
    </GlassCard>
  );
}

function StatusBadge({ status }: { status: BranchStatus }) {
  const styles = {
    ACTIVE: "bg-emerald-500/10 text-emerald-400",
    WARNING: "bg-orange-500/10 text-orange-400",
    INACTIVE: "bg-white/10 text-white/45",
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}

function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        {description && (
          <p className="mt-1 text-xs text-white/40">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/75 transition hover:bg-white/[0.08]"
    >
      {children}
    </button>
  );
}

/* ================================================================
   MAIN PAGE
================================================================ */

type Tab = "OVERVIEW" | "CAPITAL" | "STOCK" | "ACTIVITY";

type ModalType = "CAPITAL" | "ADJUSTMENT" | "CAPITAL_TRANSFER" | "STOCK_TRANSFER" | null;

export default function BranchControlRoomPage() {
  const [branches, setBranches] = useState(initialBranches);
  const [products, setProducts] = useState(initialProducts);

  const [capitalTransactions, setCapitalTransactions] = useState(
    initialCapitalTransactions
  );

  const [stockTransactions, setStockTransactions] = useState(
    initialStockTransactions
  );

  const [selectedBranchId, setSelectedBranchId] = useState("branch-001");
  const [activeTab, setActiveTab] = useState<Tab>("OVERVIEW");
  const [modal, setModal] = useState<ModalType>(null);
  const [search, setSearch] = useState("");

  const selectedBranch = branches.find(
    (branch) => branch.id === selectedBranchId
  )!;

  const totalCapital = branches.reduce(
    (sum, branch) => sum + branch.allocatedCapital,
    0
  );

  const totalAvailableCapital = branches.reduce(
    (sum, branch) => sum + branch.availableCapital,
    0
  );

  const totalInventoryValue = branches.reduce(
    (sum, branch) => sum + branch.inventoryValue,
    0
  );

  const totalSales = branches.reduce(
    (sum, branch) => sum + branch.totalSales,
    0
  );

  const selectedStock = useMemo(() => {
    return products.map((product) => ({
      ...product,
      branchQuantity: product.quantity[selectedBranchId] ?? 0,
    }));
  }, [products, selectedBranchId]);

  const filteredStock = selectedStock.filter((product) =>
    `${product.name} ${product.sku} ${product.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  /* ================================================================
     CAPITAL OPERATIONS
  ================================================================ */

  const allocateCapital = (
    branchId: string,
    amount: number,
    description: string
  ) => {
    if (amount <= 0 || !Number.isFinite(amount)) {
      toast.error("Enter a valid capital amount.");
      return;
    }

    setBranches((current) =>
      current.map((branch) =>
        branch.id === branchId
          ? {
              ...branch,
              allocatedCapital: branch.allocatedCapital + amount,
              availableCapital: branch.availableCapital + amount,
            }
          : branch
      )
    );

    setCapitalTransactions((current) => [
      {
        id: crypto.randomUUID(),
        type: "ALLOCATION",
        branchId,
        amount,
        description,
        date: today(),
        reference: makeReference("CAP"),
      },
      ...current,
    ]);

    setModal(null);
    toast.success("Capital allocated successfully.");
  };

  const adjustCapital = (
    branchId: string,
    amount: number,
    direction: "INCREASE" | "DECREASE",
    description: string
  ) => {
    if (amount <= 0 || !Number.isFinite(amount)) {
      toast.error("Enter a valid amount.");
      return;
    }

    const branch = branches.find((item) => item.id === branchId);

    if (!branch) return;

    if (direction === "DECREASE" && amount > branch.availableCapital) {
      toast.error("Cannot reduce capital below the available balance.");
      return;
    }

    setBranches((current) =>
      current.map((item) => {
        if (item.id !== branchId) return item;

        return {
          ...item,
          allocatedCapital:
            item.allocatedCapital +
            (direction === "INCREASE" ? amount : -amount),
          availableCapital:
            item.availableCapital +
            (direction === "INCREASE" ? amount : -amount),
        };
      })
    );

    setCapitalTransactions((current) => [
      {
        id: crypto.randomUUID(),
        type: "ADJUSTMENT",
        branchId,
        amount: direction === "INCREASE" ? amount : -amount,
        description,
        date: today(),
        reference: makeReference("ADJ"),
      },
      ...current,
    ]);

    setModal(null);
    toast.success("Capital adjustment recorded.");
  };

  const transferCapital = (
    sourceId: string,
    destinationId: string,
    amount: number,
    description: string
  ) => {
    if (sourceId === destinationId) {
      toast.error("Select two different branches.");
      return;
    }

    if (amount <= 0 || !Number.isFinite(amount)) {
      toast.error("Enter a valid transfer amount.");
      return;
    }

    const source = branches.find((item) => item.id === sourceId);
    const destination = branches.find((item) => item.id === destinationId);

    if (!source || !destination) return;

    if (amount > source.availableCapital) {
      toast.error("Insufficient available capital in source branch.");
      return;
    }

    setBranches((current) =>
      current.map((branch) => {
        if (branch.id === sourceId) {
          return {
            ...branch,
            allocatedCapital: branch.allocatedCapital - amount,
            availableCapital: branch.availableCapital - amount,
          };
        }

        if (branch.id === destinationId) {
          return {
            ...branch,
            allocatedCapital: branch.allocatedCapital + amount,
            availableCapital: branch.availableCapital + amount,
          };
        }

        return branch;
      })
    );

    const reference = makeReference("TRF");

    setCapitalTransactions((current) => [
      {
        id: crypto.randomUUID(),
        type: "TRANSFER_IN",
        branchId: destinationId,
        amount,
        description: `Capital received from ${source.name}: ${description}`,
        date: today(),
        reference,
      },
      {
        id: crypto.randomUUID(),
        type: "TRANSFER_OUT",
        branchId: sourceId,
        amount: -amount,
        description: `Capital transferred to ${destination.name}: ${description}`,
        date: today(),
        reference,
      },
      ...current,
    ]);

    setModal(null);
    toast.success("Capital transfer completed.");
  };

  /* ================================================================
     STOCK OPERATIONS
  ================================================================ */

  const transferStock = (
    productId: string,
    sourceId: string,
    destinationId: string,
    quantity: number
  ) => {
    if (sourceId === destinationId) {
      toast.error("Source and destination must be different.");
      return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      toast.error("Enter a valid whole-number quantity.");
      return;
    }

    const product = products.find((item) => item.id === productId);

    if (!product) return;

    const sourceQuantity = product.quantity[sourceId] ?? 0;

    if (quantity > sourceQuantity) {
      toast.error("Insufficient stock at source branch.");
      return;
    }

    setProducts((current) =>
      current.map((item) => {
        if (item.id !== productId) return item;

        return {
          ...item,
          quantity: {
            ...item.quantity,
            [sourceId]: sourceQuantity - quantity,
            [destinationId]:
              (item.quantity[destinationId] ?? 0) + quantity,
          },
        };
      })
    );

    const reference = makeReference("STK");

    setStockTransactions((current) => [
      {
        id: crypto.randomUUID(),
        productId,
        sourceBranchId: sourceId,
        destinationBranchId: destinationId,
        quantity,
        date: today(),
        status: "COMPLETED",
        reference,
      },
      ...current,
    ]);

    setModal(null);
    toast.success("Stock transfer completed.");
  };

  /* ================================================================
     TAB NAVIGATION
  ================================================================ */

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "OVERVIEW", label: "Overview", icon: Building2 },
    { id: "CAPITAL", label: "Capital", icon: Wallet },
    { id: "STOCK", label: "Stock Control", icon: Package },
    { id: "ACTIVITY", label: "Activity", icon: History },
  ];

  return (
    <div className="space-y-6 pb-10">

      {/* PAGE HEADER */}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-teal-400">
            <ShieldCheck size={15} />
            CEO CONTROL CENTRE
            <span className="text-white/25">/</span>
            BRANCH MANAGEMENT
          </div>

          <h1 className="text-2xl font-bold text-white md:text-3xl">
            Branch Control Room
          </h1>

          <p className="mt-2 max-w-xl text-sm text-white/45">
            Manage branch capital, redistribute inventory and monitor
            the financial position of every branch.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <SecondaryButton onClick={() => toast.info("Demo data is currently being used.")}>
            <RefreshCw size={15} />
            Refresh
          </SecondaryButton>

          <PrimaryButton onClick={() => setModal("CAPITAL")}>
            <Plus size={16} />
            Add Capital
          </PrimaryButton>
        </div>
      </div>

      {/* BUSINESS-WIDE SUMMARY */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Total allocated capital"
          value={formatMoney(totalCapital)}
          icon={Coins}
          detail="Across all branches"
          accent="teal"
        />

        <Metric
          label="Available capital"
          value={formatMoney(totalAvailableCapital)}
          icon={Wallet}
          detail="Currently available balances"
          accent="green"
        />

        <Metric
          label="Total inventory value"
          value={formatMoney(totalInventoryValue)}
          icon={Package}
          detail="Stock held across branches"
          accent="blue"
        />

        <Metric
          label="Combined sales"
          value={formatMoney(totalSales)}
          icon={TrendingUp}
          detail="Demo cumulative sales"
          accent="orange"
        />
      </div>

      {/* BRANCH SELECTOR */}

      <GlassCard className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-teal-500/10 p-3 text-teal-400">
              <Building2 size={22} />
            </div>

            <div>
              <p className="text-xs text-white/40">CURRENTLY CONTROLLING</p>
              <h2 className="mt-1 font-semibold text-white">
                {selectedBranch.name}
              </h2>
              <p className="text-xs text-white/40">
                {selectedBranch.location}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={selectedBranch.status} />

            <div className="relative">
              <select
                value={selectedBranchId}
                onChange={(event) => setSelectedBranchId(event.target.value)}
                className="min-w-[190px] appearance-none rounded-xl border border-white/10 bg-[#101b22] px-4 py-3 pr-10 text-sm text-white outline-none focus:border-teal-500/50"
              >
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40"
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* TABS */}

      <div className="flex gap-2 overflow-x-auto border-b border-white/[0.07] pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm transition ${
                active
                  ? "bg-teal-500/15 text-teal-300"
                  : "text-white/45 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ============================================================
          OVERVIEW TAB
      ============================================================ */}

      {activeTab === "OVERVIEW" && (
        <div className="space-y-5">

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              label="Allocated capital"
              value={formatMoney(selectedBranch.allocatedCapital)}
              icon={Banknote}
            />

            <Metric
              label="Available capital"
              value={formatMoney(selectedBranch.availableCapital)}
              icon={Wallet}
              accent="green"
            />

            <Metric
              label="Inventory value"
              value={formatMoney(selectedBranch.inventoryValue)}
              icon={Package}
              accent="blue"
            />

            <Metric
              label="Branch expenses"
              value={formatMoney(selectedBranch.expenses)}
              icon={ArrowUpRight}
              accent="orange"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">

            {/* BRANCH FINANCIAL POSITION */}

            <GlassCard className="p-5 xl:col-span-2">
              <SectionHeading
                title="Branch financial position"
                description="How the branch's allocated resources are distributed."
              />

              <div className="mb-5">
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-white/50">Available capital</span>
                  <span className="text-white">
                    {formatMoney(selectedBranch.availableCapital)}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className="h-full rounded-full bg-teal-400"
                    style={{
                      width: `${
                        selectedBranch.allocatedCapital > 0
                          ? Math.min(
                              100,
                              (selectedBranch.availableCapital /
                                selectedBranch.allocatedCapital) *
                                100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-white/[0.035] p-3">
                  <p className="text-xs text-white/40">Capital</p>
                  <p className="mt-2 font-semibold text-white">
                    {formatMoney(selectedBranch.allocatedCapital)}
                  </p>
                </div>

                <div className="rounded-xl bg-white/[0.035] p-3">
                  <p className="text-xs text-white/40">Inventory</p>
                  <p className="mt-2 font-semibold text-white">
                    {formatMoney(selectedBranch.inventoryValue)}
                  </p>
                </div>

                <div className="rounded-xl bg-white/[0.035] p-3">
                  <p className="text-xs text-white/40">Available</p>
                  <p className="mt-2 font-semibold text-emerald-400">
                    {formatMoney(selectedBranch.availableCapital)}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <PrimaryButton onClick={() => setModal("CAPITAL")}>
                  <Plus size={15} />
                  Inject Capital
                </PrimaryButton>

                <SecondaryButton onClick={() => setModal("ADJUSTMENT")}>
                  <RefreshCw size={15} />
                  Adjust Capital
                </SecondaryButton>

                <SecondaryButton onClick={() => setModal("CAPITAL_TRANSFER")}>
                  <ArrowLeftRight size={15} />
                  Transfer Capital
                </SecondaryButton>
              </div>
            </GlassCard>

            {/* BRANCH INFORMATION */}

            <GlassCard className="p-5">
              <SectionHeading title="Branch information" />

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-white/40">Branch manager</p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {selectedBranch.manager}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-white/40">Location</p>
                  <p className="mt-1 text-sm text-white">
                    {selectedBranch.location}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-white/40">Employees</p>
                  <p className="mt-1 text-sm text-white">
                    {selectedBranch.staffCount} employees
                  </p>
                </div>

                <div>
                  <p className="text-xs text-white/40">Total sales</p>
                  <p className="mt-1 text-sm font-semibold text-emerald-400">
                    {formatMoney(selectedBranch.totalSales)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-white/40">Operating status</p>
                  <div className="mt-2">
                    <StatusBadge status={selectedBranch.status} />
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* BRANCH COMPARISON */}

          <GlassCard className="p-5">
            <SectionHeading
              title="Branch comparison"
              description="Compare the capital positions of all business branches."
            />

            <div className="space-y-4">
              {branches.map((branch) => {
                const percentage =
                  branch.allocatedCapital > 0
                    ? (branch.availableCapital / branch.allocatedCapital) * 100
                    : 0;

                return (
                  <div key={branch.id}>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {branch.name}
                        </p>
                        <p className="text-[11px] text-white/40">
                          {branch.location}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-medium text-white">
                          {formatMoney(branch.availableCapital)}
                        </p>
                        <p className="text-[11px] text-white/40">
                          {percentage.toFixed(1)}% available
                        </p>
                      </div>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
                      <div
                        className={`h-full rounded-full ${
                          percentage < 15
                            ? "bg-orange-400"
                            : "bg-teal-400"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      )}

      {/* ============================================================
          CAPITAL TAB
      ============================================================ */}

      {activeTab === "CAPITAL" && (
        <div className="space-y-5">

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Metric
              label="Branch allocation"
              value={formatMoney(selectedBranch.allocatedCapital)}
              icon={Coins}
            />
            <Metric
              label="Available balance"
              value={formatMoney(selectedBranch.availableCapital)}
              icon={Wallet}
              accent="green"
            />
            <Metric
              label="Utilized / committed"
              value={formatMoney(
                Math.max(
                  0,
                  selectedBranch.allocatedCapital -
                    selectedBranch.availableCapital
                )
              )}
              icon={TrendingUp}
              accent="orange"
            />
          </div>

          <GlassCard className="p-5">
            <SectionHeading
              title="Capital control"
              description={`Manage financial resources allocated to ${selectedBranch.name}.`}
            />

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <button
                onClick={() => setModal("CAPITAL")}
                className="rounded-xl border border-teal-500/20 bg-teal-500/[0.07] p-4 text-left transition hover:bg-teal-500/[0.12]"
              >
                <div className="mb-4 inline-flex rounded-xl bg-teal-500/10 p-3 text-teal-400">
                  <Plus size={20} />
                </div>
                <p className="font-semibold text-white">Inject capital</p>
                <p className="mt-1 text-xs leading-5 text-white/40">
                  Add fresh business capital to this branch.
                </p>
              </button>

              <button
                onClick={() => setModal("ADJUSTMENT")}
                className="rounded-xl border border-white/10 bg-white/[0.025] p-4 text-left transition hover:bg-white/[0.06]"
              >
                <div className="mb-4 inline-flex rounded-xl bg-blue-500/10 p-3 text-blue-400">
                  <RefreshCw size={20} />
                </div>
                <p className="font-semibold text-white">Adjust allocation</p>
                <p className="mt-1 text-xs leading-5 text-white/40">
                  Increase or reduce the branch's allocated capital.
                </p>
              </button>

              <button
                onClick={() => setModal("CAPITAL_TRANSFER")}
                className="rounded-xl border border-white/10 bg-white/[0.025] p-4 text-left transition hover:bg-white/[0.06]"
              >
                <div className="mb-4 inline-flex rounded-xl bg-orange-500/10 p-3 text-orange-400">
                  <ArrowLeftRight size={20} />
                </div>
                <p className="font-semibold text-white">Transfer capital</p>
                <p className="mt-1 text-xs leading-5 text-white/40">
                  Move available capital between two branches.
                </p>
              </button>
            </div>
          </GlassCard>

          <GlassCard className="overflow-hidden">
            <div className="p-5">
              <SectionHeading
                title="Capital ledger"
                description="Record of branch capital allocations and movements."
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-white/[0.025] text-xs text-white/40">
                  <tr>
                    <th className="px-5 py-3 font-medium">Reference</th>
                    <th className="px-5 py-3 font-medium">Description</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 text-right font-medium">Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {capitalTransactions
                    .filter((item) => item.branchId === selectedBranchId)
                    .map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-t border-white/[0.06]"
                      >
                        <td className="px-5 py-4 text-xs text-white/50">
                          {transaction.reference}
                        </td>

                        <td className="px-5 py-4 text-white">
                          {transaction.description}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-white/[0.06] px-2 py-1 text-[10px] text-white/60">
                            {transaction.type.replaceAll("_", " ")}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-xs text-white/45">
                          {transaction.date}
                        </td>

                        <td
                          className={`px-5 py-4 text-right font-medium ${
                            transaction.amount < 0
                              ? "text-orange-400"
                              : "text-emerald-400"
                          }`}
                        >
                          {transaction.amount < 0 ? "-" : "+"}
                          {formatMoney(Math.abs(transaction.amount))}
                        </td>
                      </tr>
                    ))}

                  {capitalTransactions.filter(
                    (item) => item.branchId === selectedBranchId
                  ).length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-white/35">
                        No capital transactions yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}

      {/* ============================================================
          STOCK CONTROL TAB
      ============================================================ */}

      {activeTab === "STOCK" && (
        <div className="space-y-5">

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Metric
              label="Products in branch"
              value={formatNumber(selectedStock.length)}
              icon={Package}
            />

            <Metric
              label="Total stock units"
              value={formatNumber(
                selectedStock.reduce(
                  (sum, product) => sum + product.branchQuantity,
                  0
                )
              )}
              icon={Coins}
              accent="blue"
            />

            <Metric
              label="Low-stock products"
              value={formatNumber(
                selectedStock.filter(
                  (product) => product.branchQuantity <= 5
                ).length
              )}
              icon={CircleAlert}
              accent="orange"
            />
          </div>

          <GlassCard className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-white">
                  Inter-branch stock control
                </h3>
                <p className="mt-1 text-xs text-white/40">
                  Redistribute products according to branch demand.
                </p>
              </div>

              <PrimaryButton onClick={() => setModal("STOCK_TRANSFER")}>
                <ArrowLeftRight size={15} />
                Transfer Stock
              </PrimaryButton>
            </div>

            <div className="relative mt-5">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products or SKU..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.035] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-teal-500/40"
              />
            </div>
          </GlassCard>

          <GlassCard className="overflow-hidden">
            <div className="p-5">
              <SectionHeading
                title={`${selectedBranch.name} inventory`}
                description="Stock quantities available at this branch."
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="bg-white/[0.025] text-xs text-white/40">
                  <tr>
                    <th className="px-5 py-3 font-medium">Product</th>
                    <th className="px-5 py-3 font-medium">SKU</th>
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 text-center font-medium">Quantity</th>
                    <th className="px-5 py-3 text-right font-medium">Stock value</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStock.map((product) => (
                    <tr
                      key={product.id}
                      className="border-t border-white/[0.06]"
                    >
                      <td className="px-5 py-4 font-medium text-white">
                        {product.name}
                      </td>

                      <td className="px-5 py-4 text-xs text-white/40">
                        {product.sku}
                      </td>

                      <td className="px-5 py-4 text-xs text-white/50">
                        {product.category}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            product.branchQuantity <= 5
                              ? "bg-orange-500/10 text-orange-400"
                              : "bg-emerald-500/10 text-emerald-400"
                          }`}
                        >
                          {product.branchQuantity}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right text-white/70">
                        {formatMoney(
                          product.branchQuantity * product.unitCost
                        )}
                      </td>
                    </tr>
                  ))}

                  {filteredStock.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-white/35">
                        No matching products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* STOCK DISTRIBUTION */}

          <GlassCard className="p-5">
            <SectionHeading
              title="Stock distribution across branches"
              description="Compare quantities before deciding where to transfer products."
            />

            <div className="space-y-5">
              {products.map((product) => (
                <div key={product.id}>
                  <p className="mb-3 text-sm font-medium text-white">
                    {product.name}
                  </p>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {branches.map((branch) => (
                      <div
                        key={branch.id}
                        className="rounded-xl bg-white/[0.035] p-3"
                      >
                        <p className="text-xs text-white/40">{branch.name}</p>
                        <p className="mt-1 text-lg font-semibold text-white">
                          {product.quantity[branch.id] ?? 0}
                          <span className="ml-1 text-xs font-normal text-white/35">
                            units
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* STOCK TRANSFER HISTORY */}

          <GlassCard className="p-5">
            <SectionHeading
              title="Recent stock transfers"
              description="Track products moving between business branches."
            />

            <div className="space-y-3">
              {stockTransactions.slice(0, 8).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/[0.035] p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                      <ArrowLeftRight size={17} />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-white">
                        {getProductName(products, transaction.productId)}
                      </p>
                      <p className="mt-1 text-xs text-white/40">
                        {getBranchName(branches, transaction.sourceBranchId)}
                        {" → "}
                        {getBranchName(branches, transaction.destinationBranchId)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">
                      {transaction.quantity} units
                    </p>
                    <p className="text-[10px] text-emerald-400">
                      {transaction.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* ============================================================
          ACTIVITY TAB
      ============================================================ */}

      {activeTab === "ACTIVITY" && (
        <div className="space-y-5">
          <GlassCard className="p-5">
            <SectionHeading
              title="Branch activity timeline"
              description="Capital and stock movements for the selected branch."
            />

            <div className="space-y-4">
              {[
                ...capitalTransactions
                  .filter((item) => item.branchId === selectedBranchId)
                  .map((item) => ({
                    id: item.id,
                    date: item.date,
                    title: item.description,
                    detail: item.reference,
                    amount: item.amount,
                    icon: Wallet,
                    category: "CAPITAL",
                  })),

                ...stockTransactions
                  .filter(
                    (item) =>
                      item.sourceBranchId === selectedBranchId ||
                      item.destinationBranchId === selectedBranchId
                  )
                  .map((item) => ({
                    id: item.id,
                    date: item.date,
                    title: `${getProductName(products, item.productId)} stock transfer`,
                    detail: `${getBranchName(branches, item.sourceBranchId)} → ${getBranchName(branches, item.destinationBranchId)}`,
                    amount: 0,
                    icon: Package,
                    category: "STOCK",
                  })),
              ]
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 border-b border-white/[0.06] pb-4 last:border-0"
                    >
                      <div className="rounded-xl bg-teal-500/10 p-3 text-teal-400">
                        <Icon size={17} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs text-white/40">
                          {item.detail}
                        </p>
                        <p className="mt-1 text-[10px] text-white/30">
                          {item.date} · {item.category}
                        </p>
                      </div>

                      {item.amount !== 0 && (
                        <p
                          className={`text-sm font-medium ${
                            item.amount > 0
                              ? "text-emerald-400"
                              : "text-orange-400"
                          }`}
                        >
                          {item.amount > 0 ? "+" : "-"}
                          {formatMoney(Math.abs(item.amount))}
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>
          </GlassCard>
        </div>
      )}

      {/* ============================================================
          MODALS
      ============================================================ */}

      {modal && (
        <OperationModal
          type={modal}
          branches={branches}
          products={products}
          selectedBranchId={selectedBranchId}
          onClose={() => setModal(null)}
          onAllocate={allocateCapital}
          onAdjust={adjustCapital}
          onCapitalTransfer={transferCapital}
          onStockTransfer={transferStock}
        />
      )}
    </div>
  );
}

/* ================================================================
   OPERATION MODAL
================================================================ */

function OperationModal({
  type,
  branches,
  products,
  selectedBranchId,
  onClose,
  onAllocate,
  onAdjust,
  onCapitalTransfer,
  onStockTransfer,
}: {
  type: Exclude<ModalType, null>;
  branches: Branch[];
  products: Product[];
  selectedBranchId: string;
  onClose: () => void;
  onAllocate: (branchId: string, amount: number, description: string) => void;
  onAdjust: (
    branchId: string,
    amount: number,
    direction: "INCREASE" | "DECREASE",
    description: string
  ) => void;
  onCapitalTransfer: (
    sourceId: string,
    destinationId: string,
    amount: number,
    description: string
  ) => void;
  onStockTransfer: (
    productId: string,
    sourceId: string,
    destinationId: string,
    quantity: number
  ) => void;
}) {
  const [branchId, setBranchId] = useState(selectedBranchId);
  const [sourceId, setSourceId] = useState(selectedBranchId);
  const [destinationId, setDestinationId] = useState(
    branches.find((branch) => branch.id !== selectedBranchId)?.id ?? ""
  );

  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState("");
  const [direction, setDirection] = useState<"INCREASE" | "DECREASE">("INCREASE");
  const [description, setDescription] = useState("");

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/10 bg-[#101b22] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-teal-500/50";

  const labelClass = "text-xs font-medium text-white/55";

  const selectedProduct = products.find((item) => item.id === productId);

  const sourceQuantity = selectedProduct?.quantity[sourceId] ?? 0;

  const titles: Record<Exclude<ModalType, null>, string> = {
    CAPITAL: "Inject Branch Capital",
    ADJUSTMENT: "Adjust Capital Allocation",
    CAPITAL_TRANSFER: "Transfer Capital Between Branches",
    STOCK_TRANSFER: "Transfer Stock Between Branches",
  };

  const submit = () => {
    const numericAmount = Number(amount);
    const numericQuantity = Number(quantity);

    if (type === "CAPITAL") {
      onAllocate(
        branchId,
        numericAmount,
        description.trim() || "Capital injected by CEO"
      );
    }

    if (type === "ADJUSTMENT") {
      onAdjust(
        branchId,
        numericAmount,
        direction,
        description.trim() || "Capital allocation adjustment"
      );
    }

    if (type === "CAPITAL_TRANSFER") {
      onCapitalTransfer(
        sourceId,
        destinationId,
        numericAmount,
        description.trim() || "Inter-branch capital transfer"
      );
    }

    if (type === "STOCK_TRANSFER") {
      onStockTransfer(
        productId,
        sourceId,
        destinationId,
        numericQuantity
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#111c24] shadow-2xl">

        <div className="flex items-center justify-between border-b border-white/[0.07] p-5">
          <div>
            <h2 className="font-semibold text-white">{titles[type]}</h2>
            <p className="mt-1 text-xs text-white/40">
              Branch resource management
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/50 hover:bg-white/[0.07] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-5">

          {/* INJECT CAPITAL */}

          {type === "CAPITAL" && (
            <>
              <label className={labelClass}>
                Destination branch
                <select
                  value={branchId}
                  onChange={(event) => setBranchId(event.target.value)}
                  className={inputClass}
                >
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClass}>
                Capital amount (NGN)
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="e.g. 500000"
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                Description
                <input
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Reason for capital allocation"
                  className={inputClass}
                />
              </label>
            </>
          )}

          {/* ADJUST CAPITAL */}

          {type === "ADJUSTMENT" && (
            <>
              <label className={labelClass}>
                Branch
                <select
                  value={branchId}
                  onChange={(event) => setBranchId(event.target.value)}
                  className={inputClass}
                >
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDirection("INCREASE")}
                  className={`rounded-xl border p-3 text-sm ${
                    direction === "INCREASE"
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                      : "border-white/10 text-white/45"
                  }`}
                >
                  Increase
                </button>

                <button
                  onClick={() => setDirection("DECREASE")}
                  className={`rounded-xl border p-3 text-sm ${
                    direction === "DECREASE"
                      ? "border-orange-500/40 bg-orange-500/10 text-orange-400"
                      : "border-white/10 text-white/45"
                  }`}
                >
                  Reduce
                </button>
              </div>

              <label className={labelClass}>
                Amount (NGN)
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="Enter amount"
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                Reason
                <input
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Reason for adjustment"
                  className={inputClass}
                />
              </label>
            </>
          )}

          {/* CAPITAL TRANSFER */}

          {type === "CAPITAL_TRANSFER" && (
            <>
              <label className={labelClass}>
                Source branch
                <select
                  value={sourceId}
                  onChange={(event) => setSourceId(event.target.value)}
                  className={inputClass}
                >
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name} — {formatMoney(branch.availableCapital)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex justify-center text-teal-400">
                <ArrowDownLeft size={20} />
              </div>

              <label className={labelClass}>
                Destination branch
                <select
                  value={destinationId}
                  onChange={(event) => setDestinationId(event.target.value)}
                  className={inputClass}
                >
                  {branches
                    .filter((branch) => branch.id !== sourceId)
                    .map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                </select>
              </label>

              <label className={labelClass}>
                Transfer amount (NGN)
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="Enter amount"
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                Transfer reason
                <input
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Why are you moving this capital?"
                  className={inputClass}
                />
              </label>
            </>
          )}

          {/* STOCK TRANSFER */}

          {type === "STOCK_TRANSFER" && (
            <>
              <label className={labelClass}>
                Select product
                <select
                  value={productId}
                  onChange={(event) => setProductId(event.target.value)}
                  className={inputClass}
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClass}>
                Source branch
                <select
                  value={sourceId}
                  onChange={(event) => setSourceId(event.target.value)}
                  className={inputClass}
                >
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-xl border border-teal-500/15 bg-teal-500/[0.05] p-3">
                <p className="text-xs text-white/40">
                  Available source stock
                </p>
                <p className="mt-1 text-lg font-semibold text-teal-400">
                  {formatNumber(sourceQuantity)} units
                </p>
              </div>

              <label className={labelClass}>
                Destination branch
                <select
                  value={destinationId}
                  onChange={(event) => setDestinationId(event.target.value)}
                  className={inputClass}
                >
                  {branches
                    .filter((branch) => branch.id !== sourceId)
                    .map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                </select>
              </label>

              <label className={labelClass}>
                Quantity to transfer
                <input
                  type="number"
                  min="1"
                  max={sourceQuantity}
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  placeholder="Number of units"
                  className={inputClass}
                />
              </label>

              <div className="rounded-xl bg-white/[0.035] p-3">
                <p className="text-xs leading-5 text-white/45">
                  This transfer will reduce the source branch's stock and
                  increase the destination branch's stock by the same quantity.
                </p>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm text-white/65 hover:bg-white/[0.05]"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={submit}
              disabled={
                type === "CAPITAL_TRANSFER" &&
                sourceId === destinationId
                  ? true
                  : type === "STOCK_TRANSFER" &&
                    sourceId === destinationId
              }
              className="flex-1 rounded-xl bg-teal-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Confirm Operation
            </button>
          </div>

          <p className="text-center text-[10px] text-white/25">
            Prototype only · Changes are stored in local React state.
          </p>
        </div>
      </div>
    </div>
  );
}
