
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  MapPin,
  Sparkles,
  Loader2,
  Globe2,
  Wallet,
  BriefcaseBusiness,
  FileText,
  Phone,
  Mail,
  Clock3,
  ChevronDown,
  CheckCircle2,
  Hash,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";

import countriesData from "world-countries";
import { Country, State } from "country-state-city";

import { GlassButton } from "../../components/ui/GlassButton";
import { GlassCard } from "../../components/ui/GlassCard";
import { GlassIcon } from "../../components/ui/GlassIcon";
import { GlassInput } from "../../components/ui/GlassInput";

import { useApplication } from "../../Biztru/services/ApplicationService/ApplicationContext";
import { useApplicationSession } from "../../Biztru/context/AplicationSessionContext";

/* ============================================================
   COUNTRY AND CURRENCY DATA
   ============================================================ */

interface CountryRecord {
  cca2: string;
  name: {
    common: string;
  };
  currencies?: Record<
    string,
    {
      name: string;
      symbol?: string;
    }
  >;
  timezones?: string[];
}

const countries = (
  countriesData as unknown as CountryRecord[]
)
  .filter((country) => country.cca2 && country.name?.common)
  .sort((a, b) =>
    a.name.common.localeCompare(b.name.common)
  );

/* ============================================================
   GLOBAL COUNTRY AND STATE DATA
   ============================================================ */

const globalCountries = Country.getAllCountries().sort(
  (a, b) => a.name.localeCompare(b.name)
);

function getGlobalCountry(countryCode: string) {
  return globalCountries.find(
    (country) => country.isoCode === countryCode
  );
}

function getCountryStates(countryCode: string) {
  if (!countryCode) return [];

  return State.getStatesOfCountry(countryCode).sort(
    (a, b) => a.name.localeCompare(b.name)
  );
}

/* ============================================================
   CURRENCY OPTIONS
   ============================================================ */

interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
}

const currencyOptions: CurrencyOption[] = Array.from(
  new Map(
    countries.flatMap((country) =>
      Object.entries(country.currencies ?? {}).map(
        ([code, currency]) => [
          code,
          {
            code,
            name: currency.name,
            symbol: currency.symbol ?? code,
          },
        ]
      )
    )
  ).values()
).sort((a, b) => a.code.localeCompare(b.code));

/* ============================================================
   FORM TYPES
   ============================================================ */

type BusinessType =
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

type LegalStructure =
  | "SOLE_PROPRIETORSHIP"
  | "PARTNERSHIP"
  | "LIMITED_LIABILITY_COMPANY"
  | "CORPORATION"
  | "NON_PROFIT"
  | "OTHER";

interface BusinessForm {
  name: string;
  legalName: string;

  businessType: BusinessType | "";
  industry: string;
  legalStructure: LegalStructure | "";

  countryCode: string;
  currencyCode: string;
  timezone: string;

  address: string;
  city: string;
  state: string;
  postalCode: string;

  email: string;
  phone: string;
  website: string;

  registrationNumber: string;
  taxId: string;

  branchName: string;
}

const BUSINESS_TYPES: {
  value: BusinessType;
  label: string;
}[] = [
  { value: "RETAIL", label: "Retail" },
  { value: "WHOLESALE", label: "Wholesale / Distribution" },
  { value: "SERVICES", label: "Professional / General Services" },
  { value: "MANUFACTURING", label: "Manufacturing" },
  { value: "AGRICULTURE", label: "Agriculture" },
  { value: "HOSPITALITY", label: "Hospitality / Food Services" },
  { value: "CONSTRUCTION", label: "Construction / Real Estate" },
  { value: "TRANSPORT", label: "Transport / Logistics" },
  { value: "TECHNOLOGY", label: "Technology" },
  { value: "OTHER", label: "Other" },
];

const LEGAL_STRUCTURES: {
  value: LegalStructure;
  label: string;
}[] = [
  {
    value: "SOLE_PROPRIETORSHIP",
    label: "Sole Proprietorship",
  },
  {
    value: "PARTNERSHIP",
    label: "Partnership",
  },
  {
    value: "LIMITED_LIABILITY_COMPANY",
    label: "Limited Liability Company",
  },
  {
    value: "CORPORATION",
    label: "Corporation",
  },
  {
    value: "NON_PROFIT",
    label: "Non-profit Organization",
  },
  {
    value: "OTHER",
    label: "Other",
  },
];

/* ============================================================
   HELPERS
   ============================================================ */

function getInitialCountry() {
  const timezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    countries.find((country) =>
      country.timezones?.includes(timezone)
    )?.cca2 ??
    "NG"
  );
}

function getCountry(code: string) {
  return countries.find(
    (country) => country.cca2 === code
  );
}

function getCountryCurrencies(code: string) {
  const country = getCountry(code);

  return Object.entries(country?.currencies ?? {}).map(
    ([currencyCode, currency]) => ({
      code: currencyCode,
      name: currency.name,
      symbol: currency.symbol ?? currencyCode,
    })
  );
}

function getCountryName(code: string) {
  return (
    getGlobalCountry(code)?.name ??
    getCountry(code)?.name.common ??
    ""
  );
}

function getCurrency(code: string) {
  return currencyOptions.find(
    (currency) => currency.code === code
  );
}

function formatCurrencyPreview(
  amount: number,
  currencyCode: string
) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toLocaleString()}`;
  }
}

/* ============================================================
   REUSABLE FORM COMPONENTS
   ============================================================ */

function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <GlassIcon size="sm" variant="primary">
        {icon}
      </GlassIcon>

      <div>
        <h2 className="text-sm font-semibold text-white sm:text-base">
          {title}
        </h2>

        <p className="mt-1 text-xs leading-relaxed text-white/40 sm:text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}

function FieldLabel({
  children,
  optional,
}: {
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label className="mb-2 block text-xs font-medium text-white/60">
      {children}

      {optional && (
        <span className="ml-1 text-white/30">
          (Optional)
        </span>
      )}
    </label>
  );
}

const selectClass = `
  h-12 w-full appearance-none rounded-xl
  border border-white/10
  bg-neutral-900/80
  px-3 pr-10
  text-sm text-white
  outline-none
  transition
  focus:border-teal-400/50
  focus:ring-2 focus:ring-teal-400/10
  disabled:cursor-not-allowed
  disabled:opacity-50
`;

function SelectField({
  label,
  value,
  onChange,
  options,
  disabled,
  optional,
  placeholder = "Select an option",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
  disabled?: boolean;
  optional?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="min-w-0">
      <FieldLabel optional={optional}>
        {label}
      </FieldLabel>

      <div className="relative">
        <select
          value={value}
          disabled={disabled}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className={selectClass}
        >
          <option value="" className="bg-neutral-900">
            {placeholder}
          </option>

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-neutral-900"
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
      </div>
    </div>
  );
}

/* ============================================================
   MAIN PAGE
   ============================================================ */

export default function OnboardingBusinessPage() {
  const navigate = useNavigate();

  const app = useApplication();

  const {
    refreshSession,
    session,
  } = useApplicationSession();

  const initialCountryCode = getInitialCountry();

  const initialCountryCurrencies =
    getCountryCurrencies(initialCountryCode);

  const initialTimezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [form, setForm] = useState<BusinessForm>({
    name: "",
    legalName: "",

    businessType: "",
    industry: "",
    legalStructure: "",

    countryCode: initialCountryCode,
    currencyCode:
      initialCountryCurrencies[0]?.code ?? "",
    timezone: initialTimezone,

    address: "",
    city: "",
    state: "",
    postalCode: "",

    email: "",
    phone: "",
    website: "",

    registrationNumber: "",
    taxId: "",

    branchName: "Main Branch",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(
    null
  );

  /* ============================================================
     DERIVED COUNTRY DATA
     ============================================================ */

  const selectedCountry = useMemo(
    () => getCountry(form.countryCode),
    [form.countryCode]
  );

  const availableCurrencies = useMemo(
    () => getCountryCurrencies(form.countryCode),
    [form.countryCode]
  );

  const selectedCurrency = useMemo(
    () => getCurrency(form.currencyCode),
    [form.currencyCode]
  );

  const availableStates = useMemo(
    () => getCountryStates(form.countryCode),
    [form.countryCode]
  );

  const hasStateOptions = availableStates.length > 0;

  const timezoneOptions = useMemo(() => {
    return (
      selectedCountry?.timezones?.map((timezone) => ({
        value: timezone,
        label: timezone.replaceAll("_", " "),
      })) ?? []
    );
  }, [selectedCountry]);

  /* ============================================================
     FORM UPDATE
     ============================================================ */

  const updateField = <K extends keyof BusinessForm>(
    key: K,
    value: BusinessForm[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    if (error) setError(null);
  };

  /* ============================================================
     COUNTRY CHANGE
     ============================================================ */

  const handleCountryChange = (countryCode: string) => {
    const countryCurrencies =
      getCountryCurrencies(countryCode);

    const country = getCountry(countryCode);

    const localTimezone =
      Intl.DateTimeFormat().resolvedOptions().timeZone;

    const nextTimezone =
      country?.timezones?.includes(localTimezone)
        ? localTimezone
        : country?.timezones?.[0] ?? "";

    setForm((previous) => ({
      ...previous,
      countryCode,

      // State belongs to the previously selected country.
      // Reset it when the country changes.
      state: "",

      // Select the new country's default currency.
      currencyCode:
        countryCurrencies[0]?.code ?? "",

      timezone: nextTimezone,
    }));

    setError(null);
  };

  /* ============================================================
     VALIDATION
     ============================================================ */

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Enter your business name.";
    }

    if (!form.businessType) {
      return "Select your business type.";
    }

    if (!form.industry.trim()) {
      return "Enter your business industry.";
    }

    if (!form.legalStructure) {
      return "Select your legal business structure.";
    }

    if (!form.countryCode) {
      return "Select your country.";
    }

    if (!form.currencyCode) {
      return "Select your business currency.";
    }

    if (!form.timezone) {
      return "Select your business timezone.";
    }

    if (!form.branchName.trim()) {
      return "Enter your primary branch name.";
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim()
      )
    ) {
      return "Enter a valid business email address.";
    }

    if (
      form.website.trim() &&
      !/^https?:\/\/.+/i.test(form.website.trim())
    ) {
      return "Enter your website with https:// or http://.";
    }

    return null;
  };

  /* ============================================================
     CREATE BUSINESS WORKSPACE
     ============================================================ */

  const handleNext = async () => {
    if (loading) return;

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    const businessId = crypto.randomUUID();
    const branchId = crypto.randomUUID();

    const countryName = getCountryName(
      form.countryCode
    );

    const currency = getCurrency(
      form.currencyCode
    );

    if (!currency) {
      setError("The selected currency is not supported.");
      setLoading(false);
      return;
    }

    const fullAddress = [
      form.address.trim(),
      form.city.trim(),
      form.state.trim(),
      form.postalCode.trim(),
      countryName,
    ]
      .filter(Boolean)
      .join(", ");

    try {
      /*
       * ========================================================
       * 1. CREATE BUSINESS
       *
       * Your ApplicationService, event payload, aggregate,
       * reducer and SQLite schema must support these fields.
       * ========================================================
       */

      await app.onboarding.createBusiness({
        id: businessId,

        name: form.name.trim(),
        address: fullAddress,

        legalName: form.legalName.trim() || null,

        businessType: form.businessType,
        industry: form.industry.trim(),
        legalStructure: form.legalStructure,

        countryCode: form.countryCode,
        countryName,

        currencyCode: form.currencyCode,
        currencyName: currency.name,
        currencySymbol: currency.symbol,

        timezone: form.timezone,

        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        website: form.website.trim() || null,

        registrationNumber:
          form.registrationNumber.trim() || null,

        taxId: form.taxId.trim() || null,
      });

      /*
       * ========================================================
       * 2. CREATE PRIMARY BRANCH
       * ========================================================
       */

      await app.onboarding.createMainBranch({
        id: branchId,
        businessId,
        name: form.branchName.trim(),
      });

      /*
       * ========================================================
       * 3. SET ACTIVE BUSINESS
       * ========================================================
       */

      await app.context.setActiveBusiness(
        businessId
      );

      /*
       * ========================================================
       * 4. SET ACTIVE BRANCH
       * ========================================================
       */

      await app.context.setActiveBranch(
        branchId
      );

      /*
       * ========================================================
       * 5. RECONSTRUCT DURABLE SESSION
       * ========================================================
       */

      const nextSession = await refreshSession();

      /*
       * ========================================================
       * 6. VERIFY AUTHENTICATION
       * ========================================================
       */

      if (
        nextSession.status !== "authenticated"
      ) {
        throw new Error(
          "Business was created, but the application session could not be restored."
        );
      }

      if (!nextSession.user) {
        throw new Error(
          "The authenticated user could not be restored."
        );
      }

      if (
        nextSession.user.businessId !== businessId
      ) {
        throw new Error(
          "The restored user is not associated with the newly created business."
        );
      }

      /*
       * ========================================================
       * 7. VERIFY BUSINESS
       * ========================================================
       */

      if (
        !nextSession.business ||
        nextSession.business.id !== businessId
      ) {
        throw new Error(
          "The created business could not be restored from local storage."
        );
      }

      /*
       * ========================================================
       * 8. VERIFY BRANCH
       * ========================================================
       */

      if (
        nextSession.user.branchId !== branchId
      ) {
        throw new Error(
          "The restored user is not associated with the primary branch."
        );
      }

      if (
        !nextSession.branch ||
        nextSession.branch.id !== branchId
      ) {
        throw new Error(
          "The primary branch could not be restored from local storage."
        );
      }

      /*
       * ========================================================
       * 9. SESSION IS VALID
       * ========================================================
       */

      console.info(
        "[Onboarding] Business workspace created",
        {
          userId: nextSession.user.id,
          businessId,
          branchId,
          countryCode: form.countryCode,
          currencyCode: form.currencyCode,
          previousSessionUserId: session.user?.id,
        }
      );

      navigate("/onboarding", {
        replace: true,
      });

    } catch (err) {
      console.error(
        "[Onboarding] Business registration failed:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Could not create your business. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-neutral-950 text-white">

      {/* AMBIENT BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-teal-500/[0.12] blur-[120px]" />

        <div className="absolute -bottom-40 -right-40 h-[450px] w-[450px] rounded-full bg-blue-500/[0.12] blur-[130px]" />

        <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-white/[0.035] blur-[100px]" />
      </div>

      {/* PAGE SHELL */}

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-4xl flex-col px-4 py-6 sm:px-6 sm:py-10 lg:justify-center">

        {/* TOP NAVIGATION */}

        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={loading}
            className="inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-white disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex items-center gap-2">
            <GlassIcon size="sm" variant="primary">
              <Sparkles className="h-4 w-4" />
            </GlassIcon>

            <span className="text-sm font-semibold tracking-wide">
              BizTru
            </span>
          </div>
        </div>

        {/* HEADER */}

        <div className="mb-8 max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-400/15 bg-teal-400/[0.07] px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-teal-400" />

            <span className="text-xs font-medium text-teal-300">
              Business registration · Step 1 of setup
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Let's set up your
            <span className="block text-white/45">
              business workspace.
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/45 sm:text-base">
            Tell us about your business. BizTru will use
            these details to configure your accounting,
            currency, regional settings and branch operations.
          </p>
        </div>

        {/* FORM */}

        <GlassCard
          variant="default"
          className="border-white/10 p-5 sm:p-8"
        >
          <div className="space-y-9">

            {/* ERROR */}

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.08] p-4 text-sm text-red-300"
              >
                <span className="mt-0.5">!</span>
                <p>{error}</p>
              </div>
            )}

            {/* =================================================
                BUSINESS IDENTITY
               ================================================= */}

            <section className="space-y-5">
              <SectionHeading
                icon={<Building2 className="h-4 w-4" />}
                title="Business identity"
                description="The basic information used to identify your business."
              />

              <div className="grid gap-4 sm:grid-cols-2">

                <div className="sm:col-span-2">
                  <FieldLabel>
                    Business / Trading name *
                  </FieldLabel>

                  <GlassInput
                    icon={<Building2 className="h-4 w-4" />}
                    value={form.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    placeholder="e.g. MrShrek Phone Service"
                    autoComplete="organization"
                    disabled={loading}
                  />
                </div>

                <div className="sm:col-span-2">
                  <FieldLabel optional>
                    Registered legal name
                  </FieldLabel>

                  <GlassInput
                    icon={<FileText className="h-4 w-4" />}
                    value={form.legalName}
                    onChange={(event) =>
                      updateField(
                        "legalName",
                        event.target.value
                      )
                    }
                    placeholder="Legal name, if different from trading name"
                    disabled={loading}
                  />
                </div>

                <SelectField
                  label="Business type *"
                  value={form.businessType}
                  disabled={loading}
                  onChange={(value) =>
                    updateField(
                      "businessType",
                      value as BusinessType
                    )
                  }
                  options={BUSINESS_TYPES}
                />

                <div>
                  <FieldLabel>
                    Industry *
                  </FieldLabel>

                  <GlassInput
                    icon={<BriefcaseBusiness className="h-4 w-4" />}
                    value={form.industry}
                    onChange={(event) =>
                      updateField(
                        "industry",
                        event.target.value
                      )
                    }
                    placeholder="e.g. Mobile phone retail"
                    disabled={loading}
                  />
                </div>

                <div className="sm:col-span-2">
                  <SelectField
                    label="Legal business structure *"
                    value={form.legalStructure}
                    disabled={loading}
                    onChange={(value) =>
                      updateField(
                        "legalStructure",
                        value as LegalStructure
                      )
                    }
                    options={LEGAL_STRUCTURES}
                  />
                </div>
              </div>
            </section>

            <div className="border-t border-white/[0.07]" />

            {/* =================================================
                COUNTRY AND CURRENCY
               ================================================= */}

            <section className="space-y-5">
              <SectionHeading
                icon={<Globe2 className="h-4 w-4" />}
                title="Regional and financial settings"
                description="Configure the country, operating currency and local time used by your business."
              />

              <div className="grid gap-4 sm:grid-cols-2">

                {/* COUNTRY */}

                <div>
                  <SelectField
                    label="Country *"
                    value={form.countryCode}
                    disabled={loading}
                    onChange={handleCountryChange}
                    options={globalCountries.map((country) => ({
                      value: country.isoCode,
                      label: country.name,
                    }))}
                    placeholder="Select your country"
                  />

                  <p className="mt-2 text-[11px] text-white/30">
                    Select the country where your business operates.
                  </p>
                </div>

                {/* CURRENCY */}

                <div>
                  <SelectField
                    label="Business currency *"
                    value={form.currencyCode}
                    disabled={loading}
                    onChange={(value) =>
                      updateField("currencyCode", value)
                    }
                    options={currencyOptions.map((currency) => ({
                      value: currency.code,
                      label: `${currency.code} · ${currency.name} (${currency.symbol})`,
                    }))}
                  />

                  <p className="mt-2 text-[11px] text-white/30">
                    Defaulted from your country. You can change it.
                  </p>
                </div>

                {/* TIMEZONE */}

                <div className="sm:col-span-2">
                  <SelectField
                    label="Business timezone *"
                    value={form.timezone}
                    disabled={loading}
                    onChange={(value) =>
                      updateField("timezone", value)
                    }
                    options={timezoneOptions}
                    placeholder="Select business timezone"
                  />
                </div>
              </div>

              {form.currencyCode && selectedCurrency && (
                <div className="rounded-2xl border border-teal-400/15 bg-teal-400/[0.05] p-4">
                  <div className="flex items-start gap-3">
                    <GlassIcon size="sm" variant="success">
                      <Wallet className="h-4 w-4" />
                    </GlassIcon>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-white/45">
                        Currency preview
                      </p>

                      <p className="mt-1 text-lg font-semibold text-white">
                        {formatCurrencyPreview(
                          125000,
                          form.currencyCode
                        )}
                      </p>

                      <p className="mt-1 text-xs text-white/35">
                        {selectedCurrency.name} ·{" "}
                        {selectedCurrency.code} ·{" "}
                        {selectedCurrency.symbol}
                      </p>
                    </div>

                    <CheckCircle2 className="h-5 w-5 shrink-0 text-teal-400" />
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
                <p className="text-xs leading-relaxed text-white/40">
                  <strong className="text-white/65">
                    Accounting configuration:
                  </strong>{" "}
                  Your selected currency becomes the business's
                  base reporting currency. Currency changes
                  after activation should be handled through
                  a controlled accounting configuration process.
                </p>
              </div>
            </section>

            <div className="border-t border-white/[0.07]" />

            {/* =================================================
                BUSINESS ADDRESS
               ================================================= */}

            <section className="space-y-5">
              <SectionHeading
                icon={<MapPin className="h-4 w-4" />}
                title="Business location"
                description="Where your business or head office is located."
              />

              <div className="grid gap-4 sm:grid-cols-2">

                {/* STREET */}

                <div className="sm:col-span-2">
                  <FieldLabel optional>
                    Street address
                  </FieldLabel>

                  <GlassInput
                    icon={<MapPin className="h-4 w-4" />}
                    value={form.address}
                    onChange={(event) =>
                      updateField(
                        "address",
                        event.target.value
                      )
                    }
                    placeholder="Street, building, unit or area"
                    autoComplete="street-address"
                    disabled={loading}
                  />
                </div>

                {/* CITY */}

                <div>
                  <FieldLabel optional>
                    City / Town
                  </FieldLabel>

                  <GlassInput
                    value={form.city}
                    onChange={(event) =>
                      updateField("city", event.target.value)
                    }
                    placeholder="City"
                    autoComplete="address-level2"
                    disabled={loading}
                  />
                </div>

                {/* STATE / PROVINCE */}

                <div>
                  {hasStateOptions ? (
                    <SelectField
                      label="State / Province / Region"
                      value={form.state}
                      disabled={loading}
                      onChange={(value) =>
                        updateField("state", value)
                      }
                      options={availableStates.map((state) => ({
                        value: state.name,
                        label: state.name,
                      }))}
                      optional
                      placeholder="Select state or province"
                    />
                  ) : (
                    <>
                      <FieldLabel optional>
                        State / Province / Region
                      </FieldLabel>

                      <GlassInput
                        value={form.state}
                        onChange={(event) =>
                          updateField("state", event.target.value)
                        }
                        placeholder="Enter state or region"
                        autoComplete="address-level1"
                        disabled={loading}
                      />
                    </>
                  )}
                </div>

                {/* POSTAL CODE */}

                <div className="sm:col-span-2">
                  <FieldLabel optional>
                    Postal / ZIP code
                  </FieldLabel>

                  <GlassInput
                    value={form.postalCode}
                    onChange={(event) =>
                      updateField(
                        "postalCode",
                        event.target.value
                      )
                    }
                    placeholder="Postal code"
                    autoComplete="postal-code"
                    disabled={loading}
                  />
                </div>
              </div>

              {hasStateOptions && (
                <p className="text-[11px] text-white/30">
                  State and province options are provided by
                  the global administrative-region dataset.
                </p>
              )}
            </section>

            <div className="border-t border-white/[0.07]" />

            {/* =================================================
                CONTACT INFORMATION
               ================================================= */}

            <section className="space-y-5">
              <SectionHeading
                icon={<Phone className="h-4 w-4" />}
                title="Business contact"
                description="Contact information for your business. These details can be updated later."
              />

              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <FieldLabel optional>
                    Business email
                  </FieldLabel>

                  <GlassInput
                    icon={<Mail className="h-4 w-4" />}
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    placeholder="business@example.com"
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>

                <div>
                  <FieldLabel optional>
                    Business phone
                  </FieldLabel>

                  <GlassInput
                    icon={<Phone className="h-4 w-4" />}
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      updateField("phone", event.target.value)
                    }
                    placeholder="Include country code"
                    autoComplete="tel"
                    disabled={loading}
                  />
                </div>

                <div className="sm:col-span-2">
                  <FieldLabel optional>
                    Business website
                  </FieldLabel>

                  <GlassInput
                    icon={<ExternalLink className="h-4 w-4" />}
                    value={form.website}
                    onChange={(event) =>
                      updateField(
                        "website",
                        event.target.value
                      )
                    }
                    placeholder="https://www.example.com"
                    autoComplete="url"
                    disabled={loading}
                  />
                </div>
              </div>
            </section>

            <div className="border-t border-white/[0.07]" />

            {/* =================================================
                REGISTRATION DETAILS
               ================================================= */}

            <section className="space-y-5">
              <SectionHeading
                icon={<FileText className="h-4 w-4" />}
                title="Registration details"
                description="Optional legal and tax identification information."
              />

              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <FieldLabel optional>
                    Business registration number
                  </FieldLabel>

                  <GlassInput
                    icon={<Hash className="h-4 w-4" />}
                    value={form.registrationNumber}
                    onChange={(event) =>
                      updateField(
                        "registrationNumber",
                        event.target.value
                      )
                    }
                    placeholder="Registration number"
                    disabled={loading}
                  />
                </div>

                <div>
                  <FieldLabel optional>
                    Tax identification number
                  </FieldLabel>

                  <GlassInput
                    icon={<FileText className="h-4 w-4" />}
                    value={form.taxId}
                    onChange={(event) =>
                      updateField("taxId", event.target.value)
                    }
                    placeholder="Tax ID / VAT number"
                    disabled={loading}
                  />
                </div>
              </div>

              <p className="text-[11px] leading-relaxed text-white/30">
                Registration and tax identifiers vary by
                jurisdiction. Enter the identification
                applicable to your country.
              </p>
            </section>

            <div className="border-t border-white/[0.07]" />

            {/* =================================================
                PRIMARY BRANCH
               ================================================= */}

            <section className="space-y-5">
              <SectionHeading
                icon={<Building2 className="h-4 w-4" />}
                title="Primary branch"
                description="Create the first operational location for your business."
              />

              <div>
                <FieldLabel>
                  Primary branch name *
                </FieldLabel>

                <GlassInput
                  icon={<Building2 className="h-4 w-4" />}
                  value={form.branchName}
                  onChange={(event) =>
                    updateField(
                      "branchName",
                      event.target.value
                    )
                  }
                  placeholder="e.g. Main Branch"
                  disabled={loading}
                />
              </div>

              <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
                <div className="flex items-start gap-3">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />

                  <p className="text-xs leading-relaxed text-white/40">
                    Your business and primary branch will be
                    created in draft mode. You will configure
                    opening inventory, cash, assets and
                    liabilities before activating the workspace.
                  </p>
                </div>
              </div>
            </section>

            {/* =================================================
                SUBMIT
               ================================================= */}

            <div className="space-y-4 pt-2">
              <GlassButton
                variant="primary"
                disabled={loading}
                onClick={handleNext}
                className="h-14 w-full rounded-2xl text-base font-medium"
                icon={
                  loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )
                }
              >
                {loading
                  ? "Creating workspace..."
                  : "Create business workspace"}
              </GlassButton>

              <p className="text-center text-xs leading-relaxed text-white/30">
                Your business information is stored in your
                local BizTru workspace. You can update
                permitted details later.
              </p>
            </div>

          </div>
        </GlassCard>

        {/* FOOTER */}

        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-white/25">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Secure business initialization
        </div>

      </div>
    </div>
  );
}
