export type BarcodeFormat =
  | "CODE128"
  | "EAN13"
  | "EAN8"
  | "UPCA";

export type BarcodeSource =
  | "INTERNAL"
  | "MANUFACTURER";

export interface ProductBarcode {
  value: string;
  format: BarcodeFormat;
  source: BarcodeSource;
}

export interface BarcodeAssignment {
  productId: string;
  barcode: ProductBarcode;
}