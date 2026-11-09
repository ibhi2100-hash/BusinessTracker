export interface LabelTemplate {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  showProductName: boolean;
  showSKU: boolean;
  showPrice: boolean;
  showBusinessName: boolean;
  barcodeHeightMm: number;
}

export const Y50_TEMPLATES: LabelTemplate[] = [
  {
    id: "standard-50x30",
    name: "Standard retail",
    widthMm: 50,
    heightMm: 30,
    showProductName: true,
    showSKU: true,
    showPrice: false,
    showBusinessName: true,
    barcodeHeightMm: 12,
  },
  {
    id: "retail-50x30",
    name: "Retail price",
    widthMm: 50,
    heightMm: 30,
    showProductName: true,
    showSKU: true,
    showPrice: true,
    showBusinessName: false,
    barcodeHeightMm: 10,
  },
  {
    id: "compact-30x20",
    name: "Compact",
    widthMm: 30,
    heightMm: 20,
    showProductName: false,
    showSKU: true,
    showPrice: false,
    showBusinessName: false,
    barcodeHeightMm: 10,
  },
];