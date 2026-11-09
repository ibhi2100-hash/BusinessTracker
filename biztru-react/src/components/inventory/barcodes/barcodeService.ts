import { generateInternalBarcode } from "./barcodeGenerator";

export interface AssignBarcodeInput {
  productId: string;
  currentBarcode?: string | null;
}

export interface AssignBarcodeCommand {
  productId: string;
  barcode: string;
  barcodeFormat: "CODE128";
  barcodeSource: "INTERNAL";
}

export type AssignBarcodeFunction = (
  command: AssignBarcodeCommand,
) => Promise<void>;

const MAX_BARCODE_ASSIGNMENT_ATTEMPTS = 5;

function getErrorDetails(error: unknown): {
  code?: unknown;
  message?: unknown;
  target?: unknown;
  cause?: unknown;
} {
  if (!error || typeof error !== "object") {
    return {};
  }

  const value = error as Record<string, unknown>;
  const meta =
    value.meta && typeof value.meta === "object"
      ? (value.meta as Record<string, unknown>)
      : undefined;

  return {
    code: value.code,
    message: value.message,
    target: meta?.target,
    cause: value.cause,
  };
}

function isBarcodeUniqueConflict(
  error: unknown,
  depth = 0,
): boolean {
  if (depth > 3) return false;

  const details = getErrorDetails(error);

  if (details.code === "BARCODE_UNIQUE_CONFLICT") {
    return true;
  }

  if (
    typeof details.message === "string" &&
    details.message.includes("BARCODE_UNIQUE_CONFLICT")
  ) {
    return true;
  }

  // Prisma unique-constraint violation.
  if (details.code === "P2002") {
    const target = details.target;

    if (typeof target === "string") {
      return target.toLowerCase().includes("barcode");
    }

    if (Array.isArray(target)) {
      return target.some(
        (field) =>
          typeof field === "string" &&
          field.toLowerCase().includes("barcode"),
      );
    }
  }

  if (details.cause) {
    return isBarcodeUniqueConflict(details.cause, depth + 1);
  }

  return false;
}

export async function assignInternalBarcode(
  input: AssignBarcodeInput,
  assign: AssignBarcodeFunction,
): Promise<string> {
  const productId = input.productId.trim();

  if (!productId) {
    throw new Error("A valid product ID is required.");
  }

  // Preserve an existing manufacturer or internal barcode.
  const existingBarcode = input.currentBarcode?.trim();

  if (existingBarcode) {
    return existingBarcode;
  }

  for (
    let attempt = 1;
    attempt <= MAX_BARCODE_ASSIGNMENT_ATTEMPTS;
    attempt += 1
  ) {
    const barcode = generateInternalBarcode();

    try {
      await assign({
        productId,
        barcode,
        barcodeFormat: "CODE128",
        barcodeSource: "INTERNAL",
      });

      return barcode;
    } catch (error) {
      const canRetry =
        isBarcodeUniqueConflict(error) &&
        attempt < MAX_BARCODE_ASSIGNMENT_ATTEMPTS;

      if (!canRetry) {
        throw error;
      }
    }
  }

  throw new Error("Unable to allocate a unique product barcode.");
}