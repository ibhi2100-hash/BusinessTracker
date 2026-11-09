
import bwipjs from "bwip-js/browser";

import type { BarcodeFormat } from "./barcodeTypes";

const FORMAT_MAP: Record<BarcodeFormat, string> = {
  CODE128: "code128",
  EAN13: "ean13",
  EAN8: "ean8",
  UPCA: "upca",
};

/**
 * Generates a cryptographically secure six-digit numeric barcode.
 *
 * Examples:
 * 004821
 * 483921
 * 719304
 *
 * IMPORTANT:
 * This function generates a candidate.
 * The database must enforce uniqueness before saving.
 */
export function generateInternalBarcode(): string {
  const cryptoApi = globalThis.crypto;

  if (!cryptoApi?.getRandomValues) {
    throw new Error(
      "Secure random number generation is unavailable in this environment.",
    );
  }

  const MAX = 4_294_000_000;
  const RANGE = 1_000_000;

  const buffer = new Uint32Array(1);

  let number: number;

  do {
    cryptoApi.getRandomValues(buffer);
    number = buffer[0];
  } while (number >= MAX);

  return String(number % RANGE).padStart(6, "0");
}

/**
 * Renders a barcode onto an existing canvas.
 *
 * Internal six-digit barcodes should use CODE128.
 */
export function generateBarcodeCanvas(
  canvas: HTMLCanvasElement,
  value: string,
  format: BarcodeFormat,
): void {
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("A valid canvas element is required.");
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    throw new Error("Barcode is required.");
  }

  const barcodeType = FORMAT_MAP[format];

  if (!barcodeType) {
    throw new Error(`Unsupported barcode format: ${format}`);
  }

  if (
    format === "CODE128" &&
    !/^\d{6}$/.test(normalizedValue)
  ) {
    throw new Error(
      "Internal CODE128 barcodes must contain exactly six digits.",
    );
  }

  try {
    bwipjs.toCanvas(canvas, {
      bcid: barcodeType,
      text: normalizedValue,
      scale: 2,
      height: 12,
      includetext: false,
      backgroundcolor: "FFFFFF",
      barcolor: "000000",
      padding: 2,
    });
  } catch (error) {
    const reason =
      error instanceof Error
        ? error.message
        : "Unknown barcode rendering error.";

    throw new Error(
      `Could not render ${format} barcode: ${reason}`,
    );
  }
}
