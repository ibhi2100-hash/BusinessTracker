
import {
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  ShieldCheck,
  Gauge,
  LockKeyhole,
  Users,
  Search,
  Layers3,
  Building2,
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  Database,
  ChevronRight,
  KeyRound,
} from "lucide-react";

import { GlassCard } from "../../../components/ui/GlassCard";
import { GlassIcon } from "../../../components/ui/GlassIcon";

import {
  entitlementDefinitionsMock,
  tenantEntitlementsMock,
  accessRolesMock,
} from "./data/entitlements.mock";

/* ------------------------------------------------------------------ */
/* TYPES                                                              */
/* ------------------------------------------------------------------ */

type EntitlementTab =
  | "definitions"
  | "assignments"
  | "roles";

type AssignmentFilter =
  | "ALL"
  | "ACTIVE"
  | "INACTIVE";

/* ------------------------------------------------------------------ */
/* CONSTANTS                                                          */
/* ------------------------------------------------------------------ */

const TABS: {
  id: EntitlementTab;
  label: string;
  icon: typeof Layers3;
}[] = [
  {
    id: "definitions",
    label: "Definitions",
    icon: Layers3,
  },
  {
    id: "assignments",
    label: "Tenant Assignments",
    icon: Building2,
  },
  {
    id: "roles",
    label: "Access Roles",
    icon: KeyRound,
  },
];

/* ------------------------------------------------------------------ */
/* HELPERS                                                            */
/* ------------------------------------------------------------------ */

function normalizeSearch(value: unknown): string {
  return String(value ?? "").toLowerCase().trim();
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Enabled" : "Disabled";
  }

  if (typeof value === "number") {
    return new Intl.NumberFormat().format(value);
  }

  return String(value);
}

/* ------------------------------------------------------------------ */
/* SECTION HEADER                                                     */
/* ------------------------------------------------------------------ */

function SectionHeader({
  title,
  description,
  count,
}: {
  title: string;
  description: string;
  count: number;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-5">
      <div>
        <h2 className="font-semibold text-white">
          {title}
        </h2>

        <p className="mt-1 text-xs text-white/40">
          {description}
        </p>
      </div>

      <span className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-white/60">
        {count} records
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SEARCH INPUT                                                       */
/* ------------------------------------------------------------------ */

function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative min-w-0 flex-1">
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
      />

      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Search records"
        className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-teal-400/40 focus:bg-white/[0.05]"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* STATUS BADGE                                                       */
/* ------------------------------------------------------------------ */

function StatusBadge({
  active,
}: {
  active: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        active
          ? "border-teal-400/20 bg-teal-400/[0.08] text-teal-300"
          : "border-red-400/20 bg-red-400/[0.08] text-red-300"
      }`}
    >
      {active ? (
        <CheckCircle2 size={12} />
      ) : (
        <XCircle size={12} />
      )}

      {active ? "Active" : "Inactive"}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* EMPTY STATE                                                        */
/* ------------------------------------------------------------------ */

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: typeof Search;
  title: string;
  description: string;
}) {
  const Icon = icon;

  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
        <Icon size={21} className="text-white/40" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 max-w-sm text-xs leading-5 text-white/40">
        {description}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* METRIC CARD                                                        */
/* ------------------------------------------------------------------ */

function Metric({
  label,
  value,
  icon,
  description,
}: {
  label: string;
  value: string | number;
  icon: typeof Gauge;
  description: string;
}) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-white/45">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-white">
            {value}
          </p>
        </div>

        <GlassIcon
          icon={icon}
          size="md"
          variant="primary"
        />
      </div>

      <p className="mt-3 text-[11px] text-white/35">
        {description}
      </p>
    </GlassCard>
  );
}

/* ------------------------------------------------------------------ */
/* TABLE WRAPPER                                                      */
/* ------------------------------------------------------------------ */

function TableContainer({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* TABLE HEADER                                                       */
/* ------------------------------------------------------------------ */

function TableHeader({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <thead className="bg-white/[0.015] text-left text-[11px] font-semibold uppercase tracking-wider text-white/35">
      {children}
    </thead>
  );
}

/* ------------------------------------------------------------------ */
/* TABLE CELL                                                         */
/* ------------------------------------------------------------------ */

function TableCell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td
      className={`px-5 py-4 align-middle ${className}`}
    >
      {children}
    </td>
  );
}

/* ------------------------------------------------------------------ */
/* MAIN PAGE                                                          */
/* ------------------------------------------------------------------ */

export  default function EntitlementManagementPage() {

  /* ================================================================ */
  /* STATE                                                            */
  /* ================================================================ */

  const [tab, setTab] =
    useState<EntitlementTab>("definitions");

  const [search, setSearch] =
    useState("");

  const [assignmentFilter, setAssignmentFilter] =
    useState<AssignmentFilter>("ALL");

  /* ================================================================ */
  /* METRICS                                                          */
  /* ================================================================ */

  const activeAssignments = useMemo(
    () =>
      tenantEntitlementsMock.filter(
        (item) => item.active,
      ).length,
    [],
  );

  const assignedAdministrators = useMemo(
    () =>
      accessRolesMock.reduce(
        (sum, role) => sum + role.assignedUsers,
        0,
      ),
    [],
  );

  const systemRoles = useMemo(
    () =>
      accessRolesMock.filter(
        (role) => role.systemRole,
      ).length,
    [],
  );

  /* ================================================================ */
  /* SEARCH                                                            */
  /* ================================================================ */

  const normalizedSearch = normalizeSearch(search);

  const filteredDefinitions = useMemo(
    () =>
      entitlementDefinitionsMock.filter((item) => {

        const searchable = [
          item.name,
          item.key,
          item.description,
          item.type,
          item.unit,
        ];

        return searchable.some((value) =>
          normalizeSearch(value).includes(normalizedSearch),
        );
      }),
    [normalizedSearch],
  );

  const filteredAssignments = useMemo(
    () =>
      tenantEntitlementsMock.filter((item) => {

        const matchesSearch = [
          item.businessName,
          item.name,
          item.source,
          item.allowedValue,
          item.consumedValue,
        ].some((value) =>
          normalizeSearch(value).includes(normalizedSearch),
        );

        const matchesStatus =
          assignmentFilter === "ALL" ||
          (assignmentFilter === "ACTIVE" && item.active) ||
          (assignmentFilter === "INACTIVE" && !item.active);

        return matchesSearch && matchesStatus;
      }),
    [normalizedSearch, assignmentFilter],
  );

  const filteredRoles = useMemo(
    () =>
      accessRolesMock.filter((role) => {

        const searchable = [
          role.name,
          role.description,
          role.systemRole ? "system role" : "custom role",
        ];

        return searchable.some((value) =>
          normalizeSearch(value).includes(normalizedSearch),
        );
      }),
    [normalizedSearch],
  );

  /* ================================================================ */
  /* TAB COUNTS                                                       */
  /* ================================================================ */

  const tabCounts: Record<EntitlementTab, number> = {
    definitions: entitlementDefinitionsMock.length,
    assignments: tenantEntitlementsMock.length,
    roles: accessRolesMock.length,
  };

  /* ================================================================ */
  /* CURRENT RESULTS                                                  */
  /* ================================================================ */

  const currentCount = {
    definitions: filteredDefinitions.length,
    assignments: filteredAssignments.length,
    roles: filteredRoles.length,
  }[tab];

  /* ================================================================ */
  /* RENDER                                                           */
  /* ================================================================ */

  return (
    <div className="space-y-7 pb-10">

      {/* ------------------------------------------------------------ */}
      {/* PAGE HEADER                                                  */}
      {/* ------------------------------------------------------------ */}

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">

        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />

            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-400">
              Platform Authorization
            </p>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
            Entitlements & Access
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
            Manage platform capabilities, tenant resource limits,
            and administrative access policies.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2">
          <ShieldCheck
            size={16}
            className="text-teal-400"
          />

          <span className="text-xs text-white/55">
            Platform authorization
          </span>
        </div>

      </div>

      {/* ------------------------------------------------------------ */}
      {/* METRICS                                                      */}
      {/* ------------------------------------------------------------ */}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">

        <Metric
          label="Entitlement Types"
          value={entitlementDefinitionsMock.length}
          icon={Gauge}
          description="Defined platform capabilities"
        />

        <Metric
          label="Active Assignments"
          value={activeAssignments}
          icon={ShieldCheck}
          description={`Of ${tenantEntitlementsMock.length} tenant assignments`}
        />

        <Metric
          label="Access Roles"
          value={accessRolesMock.length}
          icon={LockKeyhole}
          description={`${systemRoles} system-defined roles`}
        />

        <Metric
          label="Assigned Administrators"
          value={assignedAdministrators}
          icon={Users}
          description="Across configured access roles"
        />

      </div>

      {/* ------------------------------------------------------------ */}
      {/* MANAGEMENT PANEL                                             */}
      {/* ------------------------------------------------------------ */}

      <GlassCard className="overflow-hidden p-0">

        {/* ---------------------------------------------------------- */}
        {/* TABS                                                       */}
        {/* ---------------------------------------------------------- */}

        <div className="border-b border-white/[0.07] px-4 pt-4 md:px-5">

          <div
            className="flex gap-2 overflow-x-auto"
            role="tablist"
            aria-label="Entitlement management sections"
          >

            {TABS.map((item) => {

              const Icon = item.icon;

              const selected = tab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`entitlement-tab-${item.id}`}
                  aria-selected={selected}
                  aria-controls={`entitlement-panel-${item.id}`}
                  onClick={() => {
                    setTab(item.id);
                    setSearch("");
                    setAssignmentFilter("ALL");
                  }}
                  className={`flex shrink-0 items-center gap-2 rounded-t-xl border-b-2 px-3 py-3 text-xs font-semibold transition md:px-4 ${
                    selected
                      ? "border-teal-400 bg-teal-400/[0.06] text-teal-300"
                      : "border-transparent text-white/45 hover:bg-white/[0.03] hover:text-white/80"
                  }`}
                >
                  <Icon size={15} />

                  {item.label}

                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                      selected
                        ? "bg-teal-400/15 text-teal-300"
                        : "bg-white/[0.05] text-white/40"
                    }`}
                  >
                    {tabCounts[item.id]}
                  </span>
                </button>
              );
            })}

          </div>

        </div>

        {/* ---------------------------------------------------------- */}
        {/* TOOLBAR                                                    */}
        {/* ---------------------------------------------------------- */}

        <div className="flex flex-col gap-3 border-b border-white/[0.06] p-4 md:flex-row md:items-center md:justify-between md:px-5">

          <div>
            <p className="text-sm font-semibold text-white">
              {tab === "definitions" && "Entitlement Definitions"}

              {tab === "assignments" && "Tenant Assignments"}

              {tab === "roles" && "Access Roles"}
            </p>

            <p className="mt-1 text-xs text-white/40">
              Showing {currentCount} of {tabCounts[tab]} records
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

            <SearchField
              value={search}
              onChange={setSearch}
              placeholder={
                tab === "definitions"
                  ? "Search entitlements..."
                  : tab === "assignments"
                    ? "Search businesses..."
                    : "Search roles..."
              }
            />

            {tab === "assignments" && (
              <div className="relative shrink-0">
                <SlidersHorizontal
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                />

                <select
                  value={assignmentFilter}
                  onChange={(event) =>
                    setAssignmentFilter(
                      event.target.value as AssignmentFilter,
                    )
                  }
                  aria-label="Filter assignments by status"
                  className="h-10 w-full appearance-none rounded-xl border border-white/[0.08] bg-neutral-900 pl-9 pr-8 text-xs text-white outline-none transition focus:border-teal-400/40 sm:w-auto"
                >
                  <option value="ALL">All statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            )}

          </div>

        </div>

        {/* ---------------------------------------------------------- */}
        {/* DEFINITIONS TAB                                            */}
        {/* ---------------------------------------------------------- */}

        {tab === "definitions" && (

          <div
            role="tabpanel"
            id="entitlement-panel-definitions"
            aria-labelledby="entitlement-tab-definitions"
          >

            {filteredDefinitions.length === 0 ? (

              <EmptyState
                icon={Database}
                title="No entitlement definitions found"
                description="Try changing your search terms to find the entitlement definition you're looking for."
              />

            ) : (

              <TableContainer>

                <table className="w-full min-w-[720px] text-left">

                  <TableHeader>
                    <tr>
                      <th className="px-5 py-4">Entitlement</th>
                      <th className="px-5 py-4">Key</th>
                      <th className="px-5 py-4">Type</th>
                      <th className="px-5 py-4">Unit</th>
                    </tr>
                  </TableHeader>

                  <tbody>

                    {filteredDefinitions.map((item) => (

                      <tr
                        key={item.id}
                        className="border-t border-white/[0.05] transition hover:bg-white/[0.025]"
                      >

                        <TableCell>
                          <p className="text-sm font-medium text-white">
                            {item.name}
                          </p>

                          <p className="mt-1 max-w-md text-xs leading-5 text-white/40">
                            {item.description || "No description provided"}
                          </p>
                        </TableCell>

                        <TableCell>
                          <code className="rounded-md bg-teal-400/[0.06] px-2 py-1 font-mono text-xs text-teal-300">
                            {item.key}
                          </code>
                        </TableCell>

                        <TableCell>
                          <span className="rounded-lg border border-white/[0.08] bg-white/[0.025] px-2.5 py-1 text-xs text-white/65">
                            {item.type}
                          </span>
                        </TableCell>

                        <TableCell className="text-xs text-white/55">
                          {item.unit ?? "—"}
                        </TableCell>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </TableContainer>

            )}

          </div>

        )}

        {/* ---------------------------------------------------------- */}
        {/* ASSIGNMENTS TAB                                            */}
        {/* ---------------------------------------------------------- */}

        {tab === "assignments" && (

          <div
            role="tabpanel"
            id="entitlement-panel-assignments"
            aria-labelledby="entitlement-tab-assignments"
          >

            {filteredAssignments.length === 0 ? (

              <EmptyState
                icon={Building2}
                title="No tenant assignments found"
                description="No assignments match the current search and status filters."
              />

            ) : (

              <TableContainer>

                <table className="w-full min-w-[900px] text-left">

                  <TableHeader>
                    <tr>
                      <th className="px-5 py-4">Business</th>
                      <th className="px-5 py-4">Entitlement</th>
                      <th className="px-5 py-4">Source</th>
                      <th className="px-5 py-4">Allowed</th>
                      <th className="px-5 py-4">Consumed</th>
                      <th className="px-5 py-4">Status</th>
                    </tr>
                  </TableHeader>

                  <tbody>

                    {filteredAssignments.map((item) => (

                      <tr
                        key={item.id}
                        className="border-t border-white/[0.05] transition hover:bg-white/[0.025]"
                      >

                        <TableCell>
                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03]">
                              <Building2
                                size={15}
                                className="text-white/45"
                              />
                            </div>

                            <span className="text-sm font-medium text-white">
                              {item.businessName}
                            </span>

                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="text-sm text-white/70">
                            {item.name}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span className="rounded-md border border-white/[0.07] bg-white/[0.025] px-2 py-1 text-[11px] text-white/55">
                            {item.source}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span className="text-sm font-semibold tabular-nums text-white">
                            {formatValue(item.allowedValue)}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span className="text-sm tabular-nums text-white/65">
                            {formatValue(item.consumedValue)}
                          </span>
                        </TableCell>

                        <TableCell>
                          <StatusBadge active={item.active} />
                        </TableCell>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </TableContainer>

            )}

          </div>

        )}

        {/* ---------------------------------------------------------- */}
        {/* ACCESS ROLES TAB                                           */}
        {/* ---------------------------------------------------------- */}

        {tab === "roles" && (

          <div
            role="tabpanel"
            id="entitlement-panel-roles"
            aria-labelledby="entitlement-tab-roles"
            className="p-4 md:p-5"
          >

            {filteredRoles.length === 0 ? (

              <EmptyState
                icon={KeyRound}
                title="No access roles found"
                description="Try searching for another role or changing your search terms."
              />

            ) : (

              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">

                {filteredRoles.map((role) => (

                  <GlassCard
                    key={role.id}
                    className="p-5 transition hover:border-teal-400/20"
                  >

                    {/* Role heading */}

                    <div className="flex items-start justify-between gap-3">

                      <div className="flex min-w-0 items-center gap-3">

                        <GlassIcon
                          icon={ShieldCheck}
                          size="lg"
                          variant="primary"
                        />

                        <div className="min-w-0">

                          <h3 className="truncate text-sm font-semibold text-white">
                            {role.name}
                          </h3>

                          <p className="mt-1 text-[11px] text-white/40">
                            {role.systemRole
                              ? "System-defined role"
                              : "Custom role"}
                          </p>

                        </div>

                      </div>

                      <span
                        className={`shrink-0 rounded-lg border px-2.5 py-1 text-[10px] font-medium ${
                          role.systemRole
                            ? "border-teal-400/20 bg-teal-400/[0.06] text-teal-300"
                            : "border-white/[0.09] bg-white/[0.03] text-white/55"
                        }`}
                      >
                        {role.systemRole ? "SYSTEM" : "CUSTOM"}
                      </span>

                    </div>

                    {/* Description */}

                    <p className="mt-4 min-h-[40px] text-xs leading-5 text-white/45">
                      {role.description || "No role description provided."}
                    </p>

                    {/* Metrics */}

                    <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/[0.07] pt-4">

                      <div>
                        <div className="flex items-center gap-2 text-white/40">
                          <LockKeyhole size={13} />

                          <span className="text-[11px]">
                            Permissions
                          </span>
                        </div>

                        <p className="mt-2 text-lg font-semibold text-white">
                          {role.permissionCount}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-white/40">
                          <Users size={13} />

                          <span className="text-[11px]">
                            Assigned users
                          </span>
                        </div>

                        <p className="mt-2 text-lg font-semibold text-white">
                          {role.assignedUsers}
                        </p>
                      </div>

                    </div>

                    {/* Footer */}

                    <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">

                      <span className="text-[11px] text-white/35">
                        Access policy
                      </span>

                      <span className="flex items-center gap-1 text-[11px] text-teal-300">
                        Role configuration

                        <ChevronRight size={13} />
                      </span>

                    </div>

                  </GlassCard>

                ))}

              </div>

            )}

          </div>

        )}

      </GlassCard>

      {/* ------------------------------------------------------------ */}
      {/* INFORMATION FOOTER                                           */}
      {/* ------------------------------------------------------------ */}

      <div className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">

        <ShieldCheck
          size={17}
          className="mt-0.5 shrink-0 text-teal-400"
        />

        <div>
          <p className="text-xs font-semibold text-white/75">
            Platform authorization policy
          </p>

          <p className="mt-1 text-xs leading-5 text-white/40">
            Entitlement definitions describe available capabilities.
            Tenant assignments determine the limits granted to each
            business, while access roles determine administrative
            permissions. Actual authorization must always be enforced
            by the backend.
          </p>
        </div>

      </div>

    </div>
  );
}
