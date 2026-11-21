
import { useCallback, useEffect, useState } from "react";

import {
  Activity,
  RefreshCw,
  Search,
  Database,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import { GlassCard } from "../../../components/ui/GlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";

import type { BillingEvent } from "../../../types/billing/billingeventTypes"; 

export default function BillingEventsPage() {
  const [events, setEvents] = useState<BillingEvent[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [selected, setSelected] = useState<BillingEvent | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/platform/billing/events",
        { credentials: "include" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load events");
      }

      setEvents(data.events);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = events.filter((event) => {
    const term = search.toLowerCase();

    const matches =
      event.eventType.toLowerCase().includes(term) ||
      event.aggregateId.toLowerCase().includes(term) ||
      event.aggregateType.toLowerCase().includes(term);

    return matches &&
      (status === "ALL" || event.synchronizationStatus === status);
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Billing Event History</h1>
          <p className="text-sm text-gray-400 mt-2">
            Inspect actual billing events, processing and synchronization.
          </p>
        </div>

        <GlassButton variant="secondary" onClick={load}>
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </GlassButton>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 text-red-400 p-4 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Total Events", events.length],
          ["Pending", events.filter((e) => e.synchronizationStatus === "PENDING").length],
          ["Failed", events.filter((e) => e.synchronizationStatus === "FAILED").length],
        ].map(([label, value]) => (
          <GlassCard key={String(label)} className="p-5">
            <Activity size={20} className="text-teal-400" />
            <h3 className="text-3xl font-bold mt-4">{value}</h3>
            <p className="text-xs text-gray-400 mt-2">{label}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-5">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-[#111827] border border-white/10 rounded-xl px-4"
          >
            <option value="ALL">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="PROCESSED">Processed</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <div className="overflow-x-auto mt-6">
          <table className="w-full min-w-[750px] text-sm text-left">
            <thead className="text-xs text-gray-500 border-b border-white/10">
              <tr>
                <th className="py-4">Event</th>
                <th>Aggregate</th>
                <th>Version</th>
                <th>Synchronization</th>
                <th>Occurred</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <LoaderCircle className="animate-spin mx-auto text-teal-400" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No events found.
                  </td>
                </tr>
              ) : (
                filtered.map((event) => (
                  <tr key={event.id} className="border-b border-white/5">
                    <td className="py-5 font-mono text-xs">{event.eventType}</td>
                    <td>{event.aggregateType}</td>
                    <td>v{event.eventVersion}</td>
                    <td>{event.synchronizationStatus}</td>
                    <td>{new Date(event.occurredAt).toLocaleString()}</td>
                    <td>
                      <button
                        onClick={() => setSelected(event)}
                        className="text-teal-400 hover:text-teal-300"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {selected && (
        <GlassCard className="p-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <Database className="text-teal-400" size={21} />
              <h2 className="font-semibold">Event Payload</h2>
            </div>

            <button
              onClick={() => setSelected(null)}
              className="text-sm text-gray-400"
            >
              Close
            </button>
          </div>

          <div className="mt-5 space-y-2 text-xs text-gray-400">
            <p>Event ID: {selected.id}</p>
            <p>Aggregate ID: {selected.aggregateId}</p>
            <p>Actor: {selected.actorId ?? "System"}</p>
            <p>Tenant: {selected.tenantId ?? "Platform"}</p>
          </div>

          <pre className="mt-5 overflow-x-auto rounded-xl bg-black/30 p-4 text-xs text-teal-300">
            {JSON.stringify(selected.payload, null, 2)}
          </pre>
        </GlassCard>
      )}
    </div>
  );
}
