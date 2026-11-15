
/**
 * ProductSheet.tsx
 *
 * Product create/edit sheet with:
 * - SKU and barcode metadata
 * - Camera-based barcode scanning
 * - Existing-category selection and inline category creation
 * - Cost/selling price, initial stock and inventory valuation
 * - Android phone purchasing quality inspection
 * - Pass / Fail / Not Tested inspection statuses
 * - Inspection validation before inventory entry
 *
 * Install:
 *   npm install @zxing/browser
 *
 * IMPORTANT:
 * Phone inspection data is included in ProductFormData.
 * The parent command/repository must persist this metadata.
 */

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import {
  Barcode,
  X,
  ChevronDown,
  Package,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Smartphone,
  RotateCcw,
} from "lucide-react";

import { GlassSheet } from "../../ui/GlassSheet";
import { GlassInput } from "../../ui/GlassInput";
import { GlassButton } from "../../ui/GlassButton";

import { BrowserMultiFormatReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";

import type { LiveProduct } from "../../../Biztru/offline/sqlite/businessDatabase/repositories/SQLiteProjectionRepository/SQLiteProductRepository";

/* ============================================================
   PHONE INSPECTION TYPES
   ============================================================ */

export type PhoneInspectionStatus =
  | "not_tested"
  | "passed"
  | "failed";

export interface PhoneInspectionCheck {
  id: string;
  label: string;
  status: PhoneInspectionStatus;
}

export interface PhoneInspectionData {
  version: 1;
  completedAt: string;
  totalChecks: number;
  passedChecks: number;
  checks: PhoneInspectionCheck[];
}

/* ============================================================
   FORM DATA
   ============================================================ */

export interface ProductFormData {
  name: string;
  price: number;
  cost: number;
  quantity: number;
  sku: string;
  barcode: string;
  category: string;
  description: string;
  imageUrl: string;
  reorderLevel: number;

  /**
   * Present when creating an Android phone.
   * Parent must persist this inspection record.
   */
  phoneInspection?: PhoneInspectionData;
}

interface Props {
  open: boolean;
  mode: "create" | "edit" | "manage";
  initialData?: LiveProduct | null;
  initialBarcode?: string;
  categories: string[];
  loading?: boolean;
  readOnly?: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void | Promise<void>;
}

type FormState = {
  name: string;
  costPrice: string;
  sellingPrice: string;
  quantity: string;
  sku: string;
  barcode: string;
  category: string;
  newCategory: string;
  description: string;
  imageUrl: string;
  reorderLevel: string;
};

/* ============================================================
   PHONE INSPECTION CHECKLIST
   ============================================================ */

const PHONE_INSPECTION_GROUPS = [
  {
    title: "Display and physical condition",
    items: [
      {
        id: "touchscreen",
        label: "Touchscreen responds across the entire screen",
      },
      {
        id: "display",
        label: "Display has no lines, dead pixels or abnormal discoloration",
      },
      {
        id: "body",
        label: "Screen and body have no major physical damage",
      },
    ],
  },
  {
    title: "Hardware functionality",
    items: [
      {
        id: "power-buttons",
        label: "Power and volume buttons work correctly",
      },
      {
        id: "charging-port",
        label: "Charging port connects and maintains charging",
      },
      {
        id: "speaker",
        label: "Loudspeaker and earpiece work",
      },
      {
        id: "microphone",
        label: "Microphone records clear audio",
      },
      {
        id: "cameras",
        label: "Front and rear cameras work",
      },
      {
        id: "fingerprint",
        label: "Fingerprint sensor works, if available",
      },
    ],
  },
  {
    title: "Network and connectivity",
    items: [
      {
        id: "sim-network",
        label: "SIM card detects and makes calls",
      },
      {
        id: "mobile-data",
        label: "Mobile data connects successfully",
      },
      {
        id: "wifi",
        label: "Wi-Fi connects successfully",
      },
      {
        id: "bluetooth",
        label: "Bluetooth works",
      },
      {
        id: "gps",
        label: "GPS/location works",
      },
    ],
  },
  {
    title: "Battery and software",
    items: [
      {
        id: "battery",
        label: "Battery charges normally",
      },
      {
        id: "overheating",
        label: "Phone does not overheat abnormally",
      },
      {
        id: "android",
        label: "Android boots and operates normally",
      },
      {
        id: "imei",
        label: "IMEI is verified and matches device information",
      },
      {
        id: "frp",
        label: "Google account and FRP lock are cleared",
      },
      {
        id: "mdm",
        label: "No unknown screen lock or MDM restriction",
      },
    ],
  },
] as const;

const ALL_INSPECTION_CHECKS =
  PHONE_INSPECTION_GROUPS.flatMap(
    group => group.items
  );

const TOTAL_INSPECTION_CHECKS =
  ALL_INSPECTION_CHECKS.length;

const createEmptyInspection = (): Record<
  string,
  PhoneInspectionStatus
> => {
  return Object.fromEntries(
    ALL_INSPECTION_CHECKS.map(check => [
      check.id,
      "not_tested",
    ])
  );
};

/* ============================================================
   EMPTY FORM
   ============================================================ */

const EMPTY_FORM: FormState = {
  name: "",
  costPrice: "",
  sellingPrice: "",
  quantity: "",
  sku: "",
  barcode: "",
  category: "",
  newCategory: "",
  description: "",
  imageUrl: "",
  reorderLevel: "0",
};

/* ============================================================
   COMPONENT
   ============================================================ */

export default function ProductSheet({
  open,
  mode,
  initialData,
  initialBarcode,
  categories,
  loading = false,
  readOnly = false,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<FormState>(
    EMPTY_FORM
  );

  /* ----------------------------------------------------------
     REFERENCES
     ---------------------------------------------------------- */

  const costRef = useRef<HTMLInputElement>(null);

  const sellingRef = useRef<HTMLInputElement>(null);

  const quantityRef = useRef<HTMLInputElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const scannerControlsRef =
    useRef<IScannerControls | null>(null);

  /* ----------------------------------------------------------
     SCANNER STATE
     ---------------------------------------------------------- */

  const [scanning, setScanning] = useState(false);

  const [scannerError, setScannerError] =
    useState("");

  /* ----------------------------------------------------------
     PHONE INSPECTION STATE
     ---------------------------------------------------------- */

  const [phoneInspection, setPhoneInspection] =
    useState<
      Record<string, PhoneInspectionStatus>
    >(createEmptyInspection);

  const [inspectionExpanded, setInspectionExpanded] =
    useState(true);

  /* ==========================================================
     NUMBER FORMATTING
     ========================================================== */

  const formatNumber = (
    value: string | number | null | undefined
  ): string => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "";
    }

    const raw = String(value).replace(/,/g, "");

    if (!/^\d+$/.test(raw)) {
      return "";
    }

    return Number(raw).toLocaleString("en-NG");
  };

  const parseNumber = (value: string): number => {
    const raw = value.replace(/,/g, "");

    if (!raw) {
      return 0;
    }

    const number = Number(raw);

    return Number.isFinite(number) ? number : 0;
  };

  /* ==========================================================
     HYDRATE FORM
     ========================================================== */

  useEffect(() => {
    if (!open) return;

    setPhoneInspection(createEmptyInspection());
    setInspectionExpanded(true);
    setScanning(false);
    setScannerError("");

    if (mode === "edit" && initialData) {
      setForm({
        name: initialData.name ?? "",
        costPrice: formatNumber(
          initialData.costPrice
        ),
        sellingPrice: formatNumber(
          initialData.price
        ),
        quantity: formatNumber(
          initialData.quantity ?? 0
        ),
        sku: initialData.sku ?? "",
        barcode: initialData.barcode ?? "",
        category: initialData.category ?? "",
        newCategory: "",
        description: initialData.description ?? "",
        imageUrl: initialData.imageUrl ?? "",
        reorderLevel: formatNumber(
          initialData.reorderLevel ?? 0
        ),
      });

      return;
    }

    setForm({
      ...EMPTY_FORM,
      barcode: initialBarcode?.trim() ?? "",
    });
  }, [
    open,
    mode,
    initialData,
    initialBarcode,
  ]);

  /* ==========================================================
     BARCODE SCANNER
     ========================================================== */

  useEffect(() => {
    if (readOnly || !scanning || !open) return;

    let cancelled = false;

    const reader = new BrowserMultiFormatReader();

    const startScanner = async () => {
      try {
        const videoElement = videoRef.current;

        if (!videoElement) {
          if (!cancelled) {
            setScannerError(
              "Camera preview is unavailable. Close the scanner and try again."
            );
          }

          return;
        }

        const controls =
          await reader.decodeFromVideoDevice(
            undefined,
            videoElement,
            result => {
              if (cancelled || !result) return;

              const barcode = result.getText();

              setForm(previous => ({
                ...previous,
                barcode,
              }));

              setScanning(false);
            }
          );

        if (cancelled) {
          controls.stop();
          return;
        }

        scannerControlsRef.current = controls;
      } catch {
        if (!cancelled) {
          setScannerError(
            "Unable to start the camera. Check camera permission or enter the barcode manually."
          );
        }
      }
    };

    void startScanner();

    return () => {
      cancelled = true;

      scannerControlsRef.current?.stop();

      scannerControlsRef.current = null;
    };
  }, [scanning, open, readOnly]);

  /* ==========================================================
     FORM FIELD HELPERS
     ========================================================== */

  const updateField = (
    field: keyof FormState,
    value: string
  ) => {
    setForm(previous => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleNumericChange = (
    field:
      | "costPrice"
      | "sellingPrice"
      | "quantity"
      | "reorderLevel",
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value
      .replace(/,/g, "")
      .replace(/\D/g, "");

    setForm(previous => ({
      ...previous,
      [field]: value,
    }));
  };

  /* ==========================================================
     DERIVED VALUES
     ========================================================== */

  const cost = parseNumber(form.costPrice);

  const sellingPrice = parseNumber(
    form.sellingPrice
  );

  const quantity = parseNumber(form.quantity);

  const unitMargin = sellingPrice - cost;

  const marginPercentage =
    sellingPrice > 0
      ? (unitMargin / sellingPrice) * 100
      : 0;

  /* ==========================================================
     ANDROID PHONE DETECTION
     ========================================================== */

  const isPhoneProduct =
    /\b(phone|smartphone|android)\b/i.test(
      `${form.name} ${form.category}`
    );

  /* ==========================================================
     INSPECTION DERIVED VALUES
     ========================================================== */

  const completedInspections =
    ALL_INSPECTION_CHECKS.filter(
      check =>
        phoneInspection[check.id] !==
        "not_tested"
    ).length;

  const passedInspections =
    ALL_INSPECTION_CHECKS.filter(
      check =>
        phoneInspection[check.id] === "passed"
    ).length;

  const failedInspections =
    ALL_INSPECTION_CHECKS.filter(
      check =>
        phoneInspection[check.id] === "failed"
    ).length;

  const inspectionComplete =
    passedInspections === TOTAL_INSPECTION_CHECKS;

  const inspectionHasFailures =
    failedInspections > 0;

  const inspectionProgress =
    (completedInspections /
      TOTAL_INSPECTION_CHECKS) * 100;

  /* ==========================================================
     INSPECTION ACTIONS
     ========================================================== */

  const updateInspection = (
    id: string,
    status: PhoneInspectionStatus
  ) => {
    setPhoneInspection(previous => ({
      ...previous,
      [id]: status,
    }));
  };

  const resetInspection = () => {
    setPhoneInspection(createEmptyInspection());
  };

  /* ==========================================================
     VALIDATION
     ========================================================== */

  const hasName =
    form.name.trim().length > 0;

  const hasSellingPrice =
    sellingPrice > 0;

  const hasQuantity =
    quantity > 0;

  const hasValidCategory =
    form.category !== "__new__" ||
    form.newCategory.trim().length > 0;

  const phoneInspectionValid =
    mode !== "create" ||
    !isPhoneProduct ||
    inspectionComplete;

  const isValid =
    hasName &&
    hasSellingPrice &&
    (mode !== "create" || hasQuantity) &&
    hasValidCategory &&
    phoneInspectionValid;

  /* ==========================================================
     RESET
     ========================================================== */

  const resetForm = () => {
    setForm({
      ...EMPTY_FORM,
    });

    resetInspection();

    setInspectionExpanded(true);

    setScanning(false);

    setScannerError("");

    scannerControlsRef.current?.stop();

    scannerControlsRef.current = null;
  };

  /* ==========================================================
     CLOSE
     ========================================================== */

  const handleClose = () => {
    if (loading) return;

    resetForm();

    onClose();
  };

  /* ==========================================================
     SUBMIT
     ========================================================== */

  const handleSubmit = async () => {
    if (readOnly || loading || !isValid) return;

    const category =
      form.category === "__new__"
        ? form.newCategory.trim()
        : form.category.trim();

    let phoneInspectionData:
      | PhoneInspectionData
      | undefined;

    if (mode === "create" && isPhoneProduct) {
      // Final defensive validation.
      if (!inspectionComplete) return;

      phoneInspectionData = {
        version: 1,
        completedAt: new Date().toISOString(),
        totalChecks: TOTAL_INSPECTION_CHECKS,
        passedChecks: passedInspections,

        checks: ALL_INSPECTION_CHECKS.map(
          check => ({
            id: check.id,
            label: check.label,
            status: phoneInspection[check.id],
          })
        ),
      };
    }

    const payload: ProductFormData = {
      name: form.name.trim(),
      price: sellingPrice,
      cost,
      quantity,
      sku: form.sku.trim(),
      barcode: form.barcode.trim(),
      category,
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
      reorderLevel: parseNumber(
        form.reorderLevel
      ),

      ...(phoneInspectionData && {
        phoneInspection: phoneInspectionData,
      }),
    };

    try {
      await onSubmit(payload);

      // Reset only after successful persistence.
      resetForm();
    } catch {
      // Parent handles displaying the error.
      // Preserve the form and inspection data.
    }
  };

  /* ==========================================================
     STYLES
     ========================================================== */

  const metadataInputClass =
    "w-full rounded-xl border border-white/10 bg-white/5 " +
    "px-3.5 py-3 text-sm text-white outline-none " +
    "placeholder:text-gray-500 focus:border-teal-400/50";

  const numericInputClass = `
    h-24
    w-full
    border-0
    bg-transparent
    pl-14
    pr-5
    text-right
    text-4xl
    font-bold
    leading-none
    tracking-[-0.04em]
    text-white
    shadow-none
    outline-none
    placeholder:text-gray-700
    focus:border-0
    focus:ring-0
    sm:h-28
    sm:pl-16
    sm:pr-6
    sm:text-5xl
  `;

  /* ==========================================================
     RENDER
     ========================================================== */

  if (!open || readOnly) {
    return null;
  }

  return (
    <GlassSheet
      open={open}
      onClose={handleClose}
      title={
        mode !== "create" && initialData
          ? "Edit Product"
          : "Add Product"
      }
      subtitle={
        mode !== "create" && initialData
          ? "Update product information"
          : "Add a product to your inventory"
      }
      className="
        w-full
        sm:max-w-xl
        lg:max-w-2xl
        xl:max-w-3xl
      "
    >
      <div className="space-y-7 pb-4">

        {/* ==================================================
            PRODUCT IDENTITY
            ================================================== */}

        <section className="space-y-2">
          <label className="
            block text-xs font-medium
            uppercase tracking-wider text-gray-500
          ">
            Product
          </label>

          <GlassInput
            value={form.name}
            onChange={event =>
              updateField("name", event.target.value)
            }
            icon={<Package size={18} />}
            placeholder="e.g. USB-C Charger 20W"
            disabled={loading}
            className="h-13 rounded-2xl"
            autoComplete="off"
          />
        </section>

        {/* ==================================================
            SKU
            ================================================== */}

        <section className="space-y-2">
          <label className="
            text-xs uppercase tracking-wider text-gray-500
          ">
            SKU / Product code
          </label>

          <input
            className={metadataInputClass}
            value={form.sku}
            onChange={event =>
              updateField("sku", event.target.value)
            }
            placeholder="e.g. PHN-SAM-A15"
            disabled={loading}
          />
        </section>

        {/* ==================================================
            BARCODE
            ================================================== */}

        <section className="space-y-2">
          <label className="
            text-xs uppercase tracking-wider text-gray-500
          ">
            Barcode
          </label>

          <div className="flex gap-2">
            <input
              className={metadataInputClass}
              value={form.barcode}
              onChange={event =>
                updateField("barcode", event.target.value)
              }
              placeholder="Scan or enter barcode"
              disabled={loading}
            />

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setScannerError("");
                setScanning(true);
              }}
              aria-label="Scan product barcode"
              className="
                flex shrink-0 items-center justify-center
                rounded-xl border border-teal-400/20
                bg-teal-400/10 px-4 text-teal-300
                hover:bg-teal-400/20
              "
            >
              <Barcode size={21} />
            </button>
          </div>

          {scanning && (
            <div className="
              space-y-3 rounded-2xl border
              border-white/10 bg-black/40 p-3
            ">
              <div className="
                flex items-center justify-between
              ">
                <span className="text-sm text-gray-300">
                  Scan a product barcode
                </span>

                <button
                  type="button"
                  onClick={() => setScanning(false)}
                  aria-label="Close barcode scanner"
                  className="text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <video
                ref={videoRef}
                muted
                playsInline
                className="
                  max-h-72 w-full rounded-xl
                  bg-black object-contain
                "
              />

              <p className="text-xs text-gray-500">
                Point the camera at the product's barcode.
              </p>

              {scannerError && (
                <p role="alert" className="text-sm text-red-300">
                  {scannerError}
                </p>
              )}
            </div>
          )}
        </section>

        {/* ==================================================
            CATEGORY
            ================================================== */}

        <section className="space-y-2">
          <label className="
            text-xs uppercase tracking-wider text-gray-500
          ">
            Category
          </label>

          <div className="relative">
            <select
              className={`
                ${metadataInputClass}
                appearance-none pr-10
              `}
              value={form.category}
              onChange={event => {
                updateField("category", event.target.value);
                updateField("newCategory", "");
              }}
              disabled={loading}
            >
              <option value="" className="bg-neutral-900">
                Select a category
              </option>

              {[...new Set([
                ...categories,
                ...(form.category &&
                form.category !== "__new__"
                  ? [form.category]
                  : []),
              ])].map(category => (
                <option
                  key={category}
                  value={category}
                  className="bg-neutral-900"
                >
                  {category}
                </option>
              ))}

              <option
                value="__new__"
                className="bg-neutral-900"
              >
                + Add new category
              </option>
            </select>

            <ChevronDown
              size={16}
              className="
                pointer-events-none absolute right-3
                top-1/2 -translate-y-1/2 text-gray-500
              "
            />
          </div>

          {form.category === "__new__" && (
            <input
              autoFocus
              className={metadataInputClass}
              value={form.newCategory}
              onChange={event =>
                updateField(
                  "newCategory",
                  event.target.value
                )
              }
              placeholder="Enter new category"
              disabled={loading}
            />
          )}
        </section>

        {/* ==================================================
            DESCRIPTION
            ================================================== */}

        <section className="space-y-2">
          <label className="
            text-xs uppercase tracking-wider text-gray-500
          ">
            Description
          </label>

          <textarea
            className={`
              ${metadataInputClass}
              min-h-24 resize-y
            `}
            value={form.description}
            onChange={event =>
              updateField(
                "description",
                event.target.value
              )
            }
            placeholder="Product specifications, model, condition..."
            disabled={loading}
          />
        </section>

        {/* ==================================================
            IMAGE URL
            ================================================== */}

        <section className="space-y-2">
          <label className="
            text-xs uppercase tracking-wider text-gray-500
          ">
            Product image URL
          </label>

          <input
            type="url"
            className={metadataInputClass}
            value={form.imageUrl}
            onChange={event =>
              updateField("imageUrl", event.target.value)
            }
            placeholder="https://..."
            disabled={loading}
          />
        </section>

        {/* ==================================================
            ANDROID PHONE QUALITY INSPECTION
            ================================================== */}

        {mode === "create" && isPhoneProduct && (
          <section className="
            overflow-hidden rounded-2xl
            border border-teal-400/20
            bg-teal-400/[0.035]
          ">

            {/* CARD HEADER */}

            <button
              type="button"
              onClick={() =>
                setInspectionExpanded(previous => !previous)
              }
              aria-expanded={inspectionExpanded}
              className="
                flex w-full items-center
                justify-between gap-3 p-4
                text-left
              "
            >
              <div className="flex items-center gap-3">
                <div className="
                  flex h-11 w-11 shrink-0
                  items-center justify-center
                  rounded-xl bg-teal-400/10
                  text-teal-300
                ">
                  <ClipboardCheck size={22} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Phone Quality Inspection
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Required before inventory entry
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {inspectionComplete ? (
                  <CheckCircle2
                    size={20}
                    className="text-teal-400"
                  />
                ) : inspectionHasFailures ? (
                  <XCircle
                    size={20}
                    className="text-red-400"
                  />
                ) : (
                  <span className="
                    text-xs font-semibold
                    text-amber-400
                  ">
                    {TOTAL_INSPECTION_CHECKS -
                      passedInspections} left
                  </span>
                )}

                <ChevronDown
                  size={18}
                  className={`
                    text-gray-400 transition-transform
                    ${inspectionExpanded ? "rotate-180" : ""}
                  `}
                />
              </div>
            </button>

            {/* CARD BODY */}

            {inspectionExpanded && (
              <div className="
                space-y-5 border-t
                border-white/5 p-4
              ">

                {/* PROGRESS */}

                <div>
                  <div className="
                    mb-2 flex items-center
                    justify-between text-xs
                  ">
                    <span className="text-gray-400">
                      Inspection progress
                    </span>

                    <span className="
                      font-semibold text-teal-300
                    ">
                      {passedInspections}/
                      {TOTAL_INSPECTION_CHECKS} passed
                    </span>
                  </div>

                  <div className="
                    h-1.5 overflow-hidden
                    rounded-full bg-white/10
                  ">
                    <div
                      className="
                        h-full rounded-full
                        bg-teal-400 transition-all duration-300
                      "
                      style={{
                        width: `${
                          (passedInspections /
                            TOTAL_INSPECTION_CHECKS) * 100
                        }%`,
                      }}
                    />
                  </div>

                  <div className="
                    mt-2 flex flex-wrap gap-3
                    text-[10px]
                  ">
                    <span className="text-teal-400">
                      {passedInspections} passed
                    </span>

                    <span className="text-red-400">
                      {failedInspections} failed
                    </span>

                    <span className="text-gray-500">
                      {TOTAL_INSPECTION_CHECKS -
                        completedInspections} not tested
                    </span>
                  </div>
                </div>

                {/* INSTRUCTIONS */}

                <div className="
                  flex gap-2 rounded-xl
                  border border-white/5
                  bg-white/[0.025] p-3
                ">
                  <Smartphone
                    size={17}
                    className="mt-0.5 shrink-0 text-teal-300"
                  />

                  <p className="
                    text-xs leading-5 text-gray-400
                  ">
                    Physically test each function. Mark
                    <span className="text-teal-300">
                      {" "}Pass{" "}
                    </span>
                    only when the function works correctly.
                    Mark failed components as
                    <span className="text-red-400">
                      {" "}Fail.
                    </span>
                  </p>
                </div>

                {/* INSPECTION GROUPS */}

                {PHONE_INSPECTION_GROUPS.map(
                  group => (
                    <div
                      key={group.title}
                      className="space-y-3"
                    >
                      <p className="
                        text-[11px] font-semibold
                        uppercase tracking-wider
                        text-gray-500
                      ">
                        {group.title}
                      </p>

                      <div className="space-y-2">
                        {group.items.map(check => {
                          const status =
                            phoneInspection[check.id] ??
                            "not_tested";

                          return (
                            <div
                              key={check.id}
                              className="
                                rounded-xl border
                                border-white/5
                                bg-white/[0.02] p-3
                              "
                            >
                              <p className="
                                mb-3 text-xs
                                leading-5 text-gray-300
                              ">
                                {check.label}
                              </p>

                              <div className="
                                flex items-center gap-2
                              ">
                                <button
                                  type="button"
                                  disabled={loading}
                                  onClick={() =>
                                    updateInspection(
                                      check.id,
                                      "passed"
                                    )
                                  }
                                  aria-pressed={
                                    status === "passed"
                                  }
                                  className={`
                                    flex flex-1
                                    items-center justify-center
                                    gap-1.5 rounded-lg
                                    border px-2 py-2
                                    text-[11px] font-medium
                                    transition
                                    ${
                                      status === "passed"
                                        ? "border-teal-400/40 bg-teal-400/15 text-teal-300"
                                        : "border-white/10 bg-white/[0.025] text-gray-500 hover:border-teal-400/30 hover:text-teal-300"
                                    }
                                  `}
                                >
                                  <CheckCircle2 size={14} />
                                  Pass
                                </button>

                                <button
                                  type="button"
                                  disabled={loading}
                                  onClick={() =>
                                    updateInspection(
                                      check.id,
                                      "failed"
                                    )
                                  }
                                  aria-pressed={
                                    status === "failed"
                                  }
                                  className={`
                                    flex flex-1
                                    items-center justify-center
                                    gap-1.5 rounded-lg
                                    border px-2 py-2
                                    text-[11px] font-medium
                                    transition
                                    ${
                                      status === "failed"
                                        ? "border-red-400/40 bg-red-400/15 text-red-300"
                                        : "border-white/10 bg-white/[0.025] text-gray-500 hover:border-red-400/30 hover:text-red-300"
                                    }
                                  `}
                                >
                                  <XCircle size={14} />
                                  Fail
                                </button>

                                <button
                                  type="button"
                                  disabled={loading}
                                  onClick={() =>
                                    updateInspection(
                                      check.id,
                                      "not_tested"
                                    )
                                  }
                                  aria-pressed={
                                    status === "not_tested"
                                  }
                                  className={`
                                    flex flex-1
                                    items-center justify-center
                                    gap-1 rounded-lg
                                    border px-2 py-2
                                    text-[11px] font-medium
                                    transition
                                    ${
                                      status === "not_tested"
                                        ? "border-white/20 bg-white/10 text-gray-200"
                                        : "border-white/10 bg-white/[0.025] text-gray-500 hover:text-gray-300"
                                    }
                                  `}
                                >
                                  Not tested
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                )}

                {/* INSPECTION RESULT */}

                <div className={`
                  rounded-xl border p-3
                  ${
                    inspectionComplete
                      ? "border-teal-400/20 bg-teal-400/10"
                      : inspectionHasFailures
                        ? "border-red-400/20 bg-red-400/10"
                        : "border-amber-400/20 bg-amber-400/5"
                  }
                `}>
                  <div className="flex items-start gap-2.5">

                    {inspectionComplete ? (
                      <CheckCircle2
                        size={19}
                        className="mt-0.5 shrink-0 text-teal-400"
                      />
                    ) : inspectionHasFailures ? (
                      <XCircle
                        size={19}
                        className="mt-0.5 shrink-0 text-red-400"
                      />
                    ) : (
                      <AlertTriangle
                        size={19}
                        className="mt-0.5 shrink-0 text-amber-400"
                      />
                    )}

                    <div>
                      <p className={`
                        text-xs font-semibold
                        ${
                          inspectionComplete
                            ? "text-teal-300"
                            : inspectionHasFailures
                              ? "text-red-300"
                              : "text-amber-300"
                        }
                      `}>
                        {inspectionComplete
                          ? "Inspection passed"
                          : inspectionHasFailures
                            ? "Phone failed quality inspection"
                            : "Inspection incomplete"}
                      </p>

                      <p className="
                        mt-1 text-[11px]
                        leading-5 text-gray-400
                      ">
                        {inspectionComplete
                          ? "All required tests passed. This phone can proceed to inventory entry."
                          : inspectionHasFailures
                            ? `${failedInspections} test(s) failed. Do not add this phone to sellable inventory.`
                            : `${TOTAL_INSPECTION_CHECKS - passedInspections} test(s) still require a passing result.`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* RESET INSPECTION */}

                <button
                  type="button"
                  disabled={loading}
                  onClick={resetInspection}
                  className="
                    flex items-center gap-2
                    text-xs text-gray-500
                    transition hover:text-white
                  "
                >
                  <RotateCcw size={13} />
                  Reset inspection
                </button>

              </div>
            )}
          </section>
        )}

        {/* ==================================================
            REORDER LEVEL
            ================================================== */}

        <section className="space-y-2">
          <label className="
            text-xs uppercase tracking-wider text-gray-500
          ">
            Low-stock alert quantity
          </label>

          <input
            inputMode="numeric"
            className={metadataInputClass}
            value={formatNumber(form.reorderLevel)}
            onChange={event =>
              handleNumericChange(
                "reorderLevel",
                event
              )
            }
            placeholder="0"
            disabled={loading}
          />

          <p className="text-xs text-gray-500">
            Alert when available stock reaches this level.
          </p>
        </section>

        {/* ==================================================
            COST PRICE
            ================================================== */}

        <section>
          <label className="
            mb-2 block text-xs font-medium
            uppercase tracking-wider text-gray-500
          ">
            Cost price
          </label>

          <div className="
            relative overflow-hidden
            rounded-[26px] border border-amber-400/20
            bg-black/20 shadow-inner shadow-linear
            transition-all duration-200
            focus-within:border-amber-400/50
            focus-within:shadow-[0_0_0_1px_rgba(245,158,11,0.10),0_20px_70px_rgba(245,158,11,0.10)]
          ">
            <div className="
              pointer-events-none absolute
              inset-x-0 top-0 h-px bg-amber-300/30
            " />

            <span className="
              absolute left-5 top-1/2 z-10
              -translate-y-1/2 text-3xl
              font-medium text-amber-300 sm:text-4xl
            ">
              ₦
            </span>

            <GlassInput
              ref={costRef}
              value={formatNumber(form.costPrice)}
              onChange={event =>
                handleNumericChange(
                  "costPrice",
                  event
                )
              }
              placeholder="0"
              inputMode="numeric"
              autoComplete="off"
              disabled={loading}
              className={numericInputClass}
              aria-label="Cost price"
            />
          </div>

          <div className="
            mt-2 flex items-center
            justify-between px-1
          ">
            <p className="text-[11px] text-gray-600">
              Purchase cost per unit
            </p>

            {cost > 0 && (
              <p className="
                text-[11px] font-medium
                text-amber-400/70
              ">
                ₦{formatNumber(cost)}
              </p>
            )}
          </div>
        </section>

        {/* ==================================================
            SELLING PRICE
            ================================================== */}

        <section>
          <label className="
            mb-2 block text-xs font-medium
            uppercase tracking-wider text-gray-500
          ">
            Selling price
          </label>

          <div className="
            relative overflow-hidden
            rounded-[26px] border border-emerald-400/25
            bg-black/20 shadow-inner shadow-linear
            transition-all duration-200
            focus-within:border-emerald-400/60
            focus-within:shadow-[0_0_0_1px_rgba(16,185,129,0.13),0_24px_80px_rgba(16,185,129,0.12)]
          ">
            <div className="
              pointer-events-none absolute
              inset-x-0 top-0 h-px
              bg-emerald-300/40
            " />

            <span className="
              absolute left-5 top-1/2 z-10
              -translate-y-1/2 text-3xl
              font-medium text-emerald-300 sm:text-4xl
            ">
              ₦
            </span>

            <GlassInput
              ref={sellingRef}
              value={formatNumber(form.sellingPrice)}
              onChange={event =>
                handleNumericChange(
                  "sellingPrice",
                  event
                )
              }
              placeholder="0"
              inputMode="numeric"
              autoComplete="off"
              disabled={loading}
              className={numericInputClass}
              aria-label="Selling price"
            />
          </div>

          <div className="
            mt-2 flex items-center
            justify-between px-1
          ">
            <p className="text-[11px] text-gray-600">
              Customer price per unit
            </p>

            {sellingPrice > 0 && (
              <p className="
                text-[11px] font-medium
                text-emerald-400/70
              ">
                ₦{formatNumber(sellingPrice)}
              </p>
            )}
          </div>

          {/* UNIT ECONOMICS */}

          {sellingPrice > 0 && cost > 0 && (
            <div className="
              mt-3 rounded-2xl
              border border-white/6
              bg-white/2.5 px-4 py-3
            ">
              <div className="
                flex items-center justify-between
              ">
                <span className="text-xs text-gray-500">
                  Unit margin
                </span>

                <span className={`
                  text-sm font-semibold
                  ${
                    unitMargin >= 0
                      ? "text-emerald-300"
                      : "text-red-300"
                  }
                `}>
                  {unitMargin < 0 ? "-" : ""}₦
                  {formatNumber(Math.abs(unitMargin))}
                </span>
              </div>

              <div className="
                mt-2 flex items-center justify-between
              ">
                <span className="text-xs text-gray-600">
                  Gross margin
                </span>

                <span className={`
                  text-xs font-medium
                  ${
                    marginPercentage >= 0
                      ? "text-emerald-400/70"
                      : "text-red-400/70"
                  }
                `}>
                  {marginPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </section>

        {/* ==================================================
            INITIAL QUANTITY
            ================================================== */}

        {mode === "create" && (
          <section>
            <label className="
              mb-2 block text-xs font-medium
              uppercase tracking-wider text-gray-500
            ">
              Initial quantity
            </label>

            <div className="
              relative overflow-hidden
              rounded-[26px] border border-blue-400/20
              bg-black/20 shadow-inner shadow-linear
              transition-all duration-200
              focus-within:border-blue-400/50
              focus-within:shadow-[0_0_0_1px_rgba(59,130,246,0.10),0_20px_70px_rgba(59,130,246,0.10)]
            ">
              <div className="
                pointer-events-none absolute
                inset-x-0 top-0 h-px
                bg-blue-300/30
              " />

              <span className="
                absolute left-5 top-1/2 z-10
                -translate-y-1/2 text-2xl
                font-medium text-blue-300 sm:text-3xl
              ">
                #
              </span>

              <GlassInput
                ref={quantityRef}
                value={formatNumber(form.quantity)}
                onChange={event =>
                  handleNumericChange(
                    "quantity",
                    event
                  )
                }
                placeholder="0"
                inputMode="numeric"
                autoComplete="off"
                disabled={loading}
                className={numericInputClass}
                aria-label="Initial quantity"
              />
            </div>

            <div className="
              mt-2 flex items-center
              justify-between px-1
            ">
              <p className="text-[11px] text-gray-600">
                Units entering inventory
              </p>

              {quantity > 0 && (
                <p className="
                  text-[11px] font-medium
                  text-blue-400/70
                ">
                  {formatNumber(quantity)} units
                </p>
              )}
            </div>
          </section>
        )}

        {/* ==================================================
            CREATE VALUE PREVIEW
            ================================================== */}

        {mode === "create" && cost > 0 && quantity > 0 && (
          <div className="
            rounded-2xl border border-white/6
            bg-white/2 px-4 py-3
          ">
            <div className="
              flex items-center justify-between
            ">
              <span className="text-xs text-gray-500">
                Initial inventory cost
              </span>

              <span className="
                text-sm font-semibold text-gray-200
              ">
                ₦{formatNumber(cost * quantity)}
              </span>
            </div>

            {sellingPrice > 0 && (
              <div className="
                mt-2 flex items-center justify-between
              ">
                <span className="text-xs text-gray-600">
                  Potential sales value
                </span>

                <span className="
                  text-xs font-medium text-gray-400
                ">
                  ₦{formatNumber(
                    sellingPrice * quantity
                  )}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ==================================================
            SAVE ACTION
            ================================================== */}

        <div className="space-y-3 pt-1">

          {mode === "create" &&
            isPhoneProduct &&
            !inspectionComplete && (
              <div className="
                flex items-start gap-2
                rounded-xl border border-amber-400/20
                bg-amber-400/5 p-3
              ">
                <AlertTriangle
                  size={17}
                  className="mt-0.5 shrink-0 text-amber-400"
                />

                <p className="
                  text-xs leading-5 text-amber-200/80
                ">
                  {inspectionHasFailures
                    ? "This phone has failed inspection. It cannot be added to inventory."
                    : "Complete and pass all phone inspection tests before adding this product to inventory."}
                </p>
              </div>
            )}

          <GlassButton
            className="
              h-13 w-full rounded-2xl
              font-semibold
              shadow-[0_8px_30px_rgba(255,255,255,0.06)]
              transition active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
            onClick={handleSubmit}
            disabled={!isValid || loading}
          >
            {loading
              ? "Saving..."
              : mode !== "create" && initialData
                ? "Save Changes"
                : isPhoneProduct &&
                    !inspectionComplete
                  ? "Complete Phone Inspection"
                  : "Save Product"}
          </GlassButton>
        </div>

      </div>
    </GlassSheet>
  );
}
