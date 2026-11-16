
export type BusinessType =
  | "RETAIL"
  | "WHOLESALE"
  | "SERVICES"
  | "MANUFACTURING"
  | "AGRICULTURE"
  | "HOSPITALITY"
  | "CONSTRUCTION"
  | "TRANSPORT"
  | "TECHNOLOGY"
  | "OTHER";

export type LegalStructure =
  | "SOLE_PROPRIETORSHIP"
  | "PARTNERSHIP"
  | "LIMITED_LIABILITY_COMPANY"
  | "CORPORATION"
  | "NON_PROFIT"
  | "OTHER";

export interface CreateBusinessRequest {
  id: string;

  // Business identity
  name: string;
  legalName?: string | null;
  businessType?: BusinessType | null;
  industry?: string | null;
  legalStructure?: LegalStructure | null;

  // Regional settings
  countryCode: string;
  countryName: string;
  currencyCode: string;
  currencyName: string;
  currencySymbol: string;
  timezone: string;

  // Business location
  address?: string | null;

  // Contact information
  email?: string | null;
  phone?: string | null;
  website?: string | null;

  // Legal and tax information
  registrationNumber?: string | null;
  taxId?: string | null;
}
