
import { useState } from "react";

import {
  LayoutDashboard,
  Layers3,
  CreditCard,
  ShieldCheck,
  Receipt,
  Activity,
  Building2,
  Users,
  Package,
  ArrowUpRight,
  Settings2,
  Plus,
  ChevronRight,
  Clock3,
  Database,
  RefreshCw,
} from "lucide-react";

import { GlassCard } from "../ui/GlassCard";
import { GlassButton } from "../ui/GlassButton";

import { PricingHero } from "./PricingHero";
import { PricingCards } from "./PricingCard";
import { FeatureComparison } from "./FeatureComparison";
import { PricingFAQ } from "./PricingFAQ";
import { PricingCTA } from "./PricingCTA";

type BillingSection =
  | "overview"
  | "plans"
  | "subscriptions"
  | "entitlements"
  | "invoices"
  | "events";

const navigation = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    id: "plans",
    label: "Plans",
    icon: Layers3,
  },
  {
    id: "subscriptions",
    label: "Subscriptions",
    icon: CreditCard,
  },
  {
    id: "entitlements",
    label: "Entitlements",
    icon: ShieldCheck,
  },
  {
    id: "invoices",
    label: "Invoices & Payments",
    icon: Receipt,
  },
  {
    id: "events",
    label: "Event History",
    icon: Activity,
  },
] as const;

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">
          {title}
        </span>

        <Icon size={20} className="text-teal-400" />
      </div>

      <h3 className="mt-4 text-3xl font-bold">
        {value}
      </h3>

      <p className="mt-2 text-xs text-gray-400">
        {description}
      </p>
    </GlassCard>
  );
}

function ModuleCard({
  title,
  description,
  responsibility,
  events,
  icon: Icon,
}: {
  title: string;
  description: string;
  responsibility: string;
  events: string[];
  icon: React.ElementType;
}) {
  return (
    <GlassCard className="p-5 flex flex-col">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">
            {title}
          </h3>

          <p className="text-sm text-gray-400 mt-1">
            {description}
          </p>
        </div>

        <div className="rounded-xl bg-teal-500/10 p-3">
          <Icon size={22} className="text-teal-400" />
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs uppercase tracking-wider text-gray-500">
          Responsibility
        </p>

        <p className="text-sm mt-2">
          {responsibility}
        </p>
      </div>

      <div className="mt-5">
        <p className="text-xs uppercase tracking-wider text-gray-500">
          Domain events
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          {events.map((event) => (
            <span
              key={event}
              className="text-xs rounded-md bg-white/5 px-2 py-1 text-gray-300"
            >
              {event}
            </span>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <GlassCard className="p-10 text-center">
      <Database
        size={32}
        className="mx-auto text-gray-500"
      />

      <h3 className="mt-4 font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm text-gray-400">
        {description}
      </p>
    </GlassCard>
  );
}

function OverviewSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          Billing Overview
        </h2>

        <p className="text-sm text-gray-400 mt-1">
          Monitor plans, subscriptions, entitlements and billing operations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Active Plans"
          value="—"
          description="Published pricing plans"
          icon={Layers3}
        />

        <MetricCard
          title="Subscriptions"
          value="—"
          description="Currently active subscriptions"
          icon={CreditCard}
        />

        <MetricCard
          title="Entitlements"
          value="—"
          description="Active business permissions"
          icon={ShieldCheck}
        />

        <MetricCard
          title="Outstanding Invoices"
          value="—"
          description="Invoices awaiting payment"
          icon={Receipt}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard className="p-6">
          <h3 className="font-semibold text-lg">
            Billing Subsystems
          </h3>

          <p className="text-sm text-gray-400 mt-1">
            Independent domains connected through events.
          </p>

          <div className="mt-6 space-y-4">
            {[
              ["Plans", "Pricing definitions and feature limits", Layers3],
              ["Subscriptions", "Business subscription lifecycle", CreditCard],
              ["Entitlements", "Access control and resource quotas", ShieldCheck],
              ["Billing", "Invoices, payments and renewals", Receipt],
            ].map(([name, description, Icon]: any) => (
              <div
                key={name}
                className="flex items-center gap-4"
              >
                <div className="p-3 rounded-xl bg-white/5">
                  <Icon size={19} />
                </div>

                <div>
                  <p className="font-medium">{name}</p>
                  <p className="text-xs text-gray-400">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="font-semibold text-lg">
            Offline Synchronization
          </h3>

          <p className="text-sm text-gray-400 mt-1">
            Local event processing and remote synchronization.
          </p>

          <div className="mt-6 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-sm">Local event store</span>
              <span className="text-xs text-gray-400">
                SQLite
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Event outbox</span>
              <span className="text-xs text-gray-400">
                Pending projection
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Remote synchronization</span>
              <span className="text-xs text-gray-400">
                Awaiting integration
              </span>
            </div>

            <div className="border-t border-white/10 pt-4">
              <div className="flex gap-2 items-center text-sm text-gray-400">
                <RefreshCw size={16} />
                Synchronization status must come from the sync projection.
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <h3 className="font-semibold text-lg">
          Domain Architecture
        </h3>

        <p className="text-sm text-gray-400 mt-1">
          How billing operations flow through the application.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          {[
            ["01", "Command", "Business operation requested"],
            ["02", "Domain Kernel", "Validate and emit events"],
            ["03", "Event Store", "Atomic SQLite persistence"],
            ["04", "Projection", "Update local read models"],
          ].map(([number, title, description]) => (
            <div
              key={number}
              className="rounded-xl bg-white/5 p-4"
            >
              <span className="text-xs text-teal-400">
                STEP {number}
              </span>

              <h4 className="font-semibold mt-2">
                {title}
              </h4>

              <p className="text-xs text-gray-400 mt-2">
                {description}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function PlansSection() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            Plan Management
          </h2>

          <p className="text-sm text-gray-400 mt-1">
            Define pricing, resource limits and plan capabilities.
          </p>
        </div>

        <GlassButton>
          <Plus size={17} className="mr-2 inline" />
          Create Plan
        </GlassButton>
      </div>

      <PricingHero />

      <PricingCards />

      <FeatureComparison />

      <GlassCard className="p-6">
        <h3 className="font-semibold text-lg">
          Plan Configuration
        </h3>

        <p className="text-sm text-gray-400 mt-2">
          Each plan should be a versioned domain definition,
          not a collection of hardcoded conditions in the UI.
        </p>

        <div className="grid gap-4 mt-6 md:grid-cols-3">
          {[
            ["Pricing", "Amount, currency, billing interval"],
            ["Resource Limits", "Staff, branches, products and storage"],
            ["Feature Flags", "Reports, inventory, API and other capabilities"],
          ].map(([title, description]) => (
            <div key={title} className="rounded-xl bg-white/5 p-4">
              <h4 className="font-semibold">{title}</h4>
              <p className="text-xs text-gray-400 mt-2">
                {description}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>

      <PricingFAQ />

      <PricingCTA />
    </div>
  );
}

function SubscriptionsSection() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            Subscriptions
          </h2>

          <p className="text-sm text-gray-400 mt-1">
            Manage business subscriptions and their lifecycle.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Active"
          value="—"
          description="Active subscriptions"
          icon={CreditCard}
        />

        <MetricCard
          title="Expiring"
          value="—"
          description="Subscriptions approaching expiry"
          icon={Clock3}
        />

        <MetricCard
          title="Cancelled"
          value="—"
          description="Cancelled subscriptions"
          icon={Activity}
        />
      </div>

      <GlassCard className="p-6">
        <h3 className="font-semibold text-lg">
          Subscription Lifecycle
        </h3>

        <div className="grid gap-3 mt-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Pending", "Subscription requested"],
            ["Active", "Subscription activated"],
            ["Past Due", "Payment outstanding"],
            ["Cancelled", "Subscription terminated"],
          ].map(([title, description]) => (
            <div key={title} className="rounded-xl bg-white/5 p-4">
              <h4 className="font-semibold">{title}</h4>
              <p className="text-xs text-gray-400 mt-2">
                {description}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>

      <EmptyState
        title="Subscription records will appear here"
        description="Connect this view to the subscription projection keyed by businessId."
      />
    </div>
  );
}

function EntitlementsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          Entitlement Management
        </h2>

        <p className="text-sm text-gray-400 mt-1">
          Control what each business can access and the resources it can consume.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Feature Permissions"
          value="—"
          description="Enabled capabilities"
          icon={ShieldCheck}
        />

        <MetricCard
          title="Resource Limits"
          value="—"
          description="Configured quotas"
          icon={Package}
        />

        <MetricCard
          title="Businesses"
          value="—"
          description="Businesses with entitlements"
          icon={Building2}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <ModuleCard
          title="Feature Entitlements"
          description="Boolean permissions granted to businesses."
          responsibility="Determine whether a business can use a particular application capability."
          icon={ShieldCheck}
          events={[
            "ENTITLEMENT_GRANTED",
            "ENTITLEMENT_REVOKED",
          ]}
        />

        <ModuleCard
          title="Usage Entitlements"
          description="Quantitative resource limits."
          responsibility="Determine how much of a resource a business is permitted to consume."
          icon={Package}
          events={[
            "QUOTA_CHANGED",
            "USAGE_RECORDED",
          ]}
        />
      </div>

      <GlassCard className="p-6">
        <h3 className="font-semibold text-lg">
          Example Entitlement Definitions
        </h3>

        <div className="overflow-x-auto mt-5">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400">
              <tr className="border-b border-white/10">
                <th className="py-3">Entitlement</th>
                <th>Type</th>
                <th>Example value</th>
              </tr>
            </thead>

            <tbody>
              {[
                ["inventory.enabled", "Boolean", "true"],
                ["reports.advanced", "Boolean", "true"],
                ["branches.max", "Limit", "10"],
                ["staff.max", "Limit", "50"],
                ["products.max", "Limit", "5000"],
                ["api.enabled", "Boolean", "false"],
              ].map(([name, type, value]) => (
                <tr key={name} className="border-b border-white/5">
                  <td className="py-4 font-mono text-xs">
                    {name}
                  </td>
                  <td>{type}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Illustrative definitions only. Actual values must come from the entitlement projection.
        </p>
      </GlassCard>

      <EmptyState
        title="Business entitlement records"
        description="The effective entitlement projection will be displayed here."
      />
    </div>
  );
}

function InvoicesSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          Invoices & Payments
        </h2>

        <p className="text-sm text-gray-400 mt-1">
          Manage billing obligations and payment records.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Invoices"
          value="—"
          description="Generated invoices"
          icon={Receipt}
        />

        <MetricCard
          title="Payments"
          value="—"
          description="Recorded payments"
          icon={CreditCard}
        />

        <MetricCard
          title="Outstanding"
          value="—"
          description="Unpaid invoice balances"
          icon={Clock3}
        />
      </div>

      <GlassCard className="p-6">
        <h3 className="font-semibold text-lg">
          Billing Lifecycle
        </h3>

        <div className="grid gap-3 mt-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Invoice Created", "Billing obligation generated"],
            ["Payment Pending", "Awaiting payment confirmation"],
            ["Payment Received", "Payment successfully recorded"],
            ["Invoice Settled", "Outstanding balance cleared"],
          ].map(([title, description]) => (
            <div key={title} className="rounded-xl bg-white/5 p-4">
              <h4 className="font-semibold">{title}</h4>
              <p className="text-xs text-gray-400 mt-2">
                {description}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>

      <EmptyState
        title="No invoice data connected"
        description="Connect the invoice and payment projections to populate this section."
      />
    </div>
  );
}

function EventsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          Billing Event History
        </h2>

        <p className="text-sm text-gray-400 mt-1">
          Inspect immutable billing domain events and their synchronization state.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Total Events"
          value="—"
          description="Events in billing aggregates"
          icon={Activity}
        />

        <MetricCard
          title="Pending Sync"
          value="—"
          description="Events waiting for acknowledgement"
          icon={RefreshCw}
        />

        <MetricCard
          title="Processed"
          value="—"
          description="Successfully projected events"
          icon={Database}
        />
      </div>

      <GlassCard className="p-6">
        <h3 className="font-semibold text-lg">
          Expected Domain Event Categories
        </h3>

        <div className="grid gap-4 mt-5 md:grid-cols-2">
          <ModuleCard
            title="Plan Events"
            description="Plan definition changes."
            responsibility="Maintain historical plan versions."
            icon={Layers3}
            events={[
              "PLAN_CREATED",
              "PLAN_UPDATED",
              "PLAN_PUBLISHED",
              "PLAN_RETIRED",
            ]}
          />

          <ModuleCard
            title="Subscription Events"
            description="Subscription lifecycle changes."
            responsibility="Maintain business subscription state."
            icon={CreditCard}
            events={[
              "SUBSCRIPTION_CREATED",
              "SUBSCRIPTION_ACTIVATED",
              "SUBSCRIPTION_RENEWED",
              "SUBSCRIPTION_CANCELLED",
            ]}
          />

          <ModuleCard
            title="Entitlement Events"
            description="Permission and quota changes."
            responsibility="Maintain effective business access."
            icon={ShieldCheck}
            events={[
              "ENTITLEMENT_GRANTED",
              "ENTITLEMENT_REVOKED",
              "QUOTA_CHANGED",
            ]}
          />

          <ModuleCard
            title="Billing Events"
            description="Financial billing operations."
            responsibility="Maintain invoices and payment history."
            icon={Receipt}
            events={[
              "INVOICE_CREATED",
              "PAYMENT_RECORDED",
              "INVOICE_SETTLED",
              "PAYMENT_FAILED",
            ]}
          />
        </div>
      </GlassCard>

      <EmptyState
        title="Event stream not connected"
        description="Connect the billing event projection to inspect actual event records."
      />
    </div>
  );
}

export function BillingManagementPage() {
  const [activeSection, setActiveSection] =
    useState<BillingSection>("overview");

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewSection />;

      case "plans":
        return <PlansSection />;

      case "subscriptions":
        return <SubscriptionsSection />;

      case "entitlements":
        return <EntitlementsSection />;

      case "invoices":
        return <InvoicesSection />;

      case "events":
        return <EventsSection />;

      default:
        return <OverviewSection />;
    }
  };

  return (
    <div className="min-h-screen space-y-6 pb-10">
      {/* PAGE HEADER */}

      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Business Administration</span>
            <ChevronRight size={14} />
            <span>Billing</span>
          </div>

          <h1 className="text-3xl font-bold mt-2">
            Billing Management
          </h1>

          <p className="text-sm text-gray-400 mt-2">
            Manage pricing, subscriptions, billing and business entitlements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full px-3 py-2 text-xs bg-emerald-500/10 text-emerald-400">
            Offline-first
          </span>

          <button
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10"
            title="Billing settings"
          >
            <Settings2 size={19} />
          </button>
        </div>
      </div>

      {/* NAVIGATION */}

      <GlassCard className="p-2">
        <div className="flex gap-2 overflow-x-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() =>
                  setActiveSection(item.id)
                }
                className={`
                  flex items-center gap-2
                  whitespace-nowrap
                  rounded-xl
                  px-4 py-3
                  text-sm
                  transition-all
                  ${
                    active
                      ? "bg-teal-500/15 text-teal-400"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <Icon size={17} />
                {item.label}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* ACTIVE SECTION */}

      <div key={activeSection}>
        {renderSection()}
      </div>
    </div>
  );
}
