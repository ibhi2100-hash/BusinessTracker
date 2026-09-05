"use client";

import {
  CheckCircle2,
  Cloud,
  CloudOff,
  Database,
  History,
  RefreshCw,
  AlertTriangle,
  XCircle,
  Upload,
  Server,
  Activity,
  Clock3,
  Wifi,
  ChevronRight,
} from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassIcon } from "@/components/ui/GlassIcon";
import { StatCard } from "@/components/ui/StatCard";
import { DataCard } from "@/components/ui/DataCard";
import { GlassSheet } from "@/components/ui/GlassSheet";


type SyncStatus =
  | "SYNCED"
  | "PENDING"
  | "SYNCING"
  | "CONFLICT"
  | "ERROR"
  | "OFFLINE";

type SyncActivityStatus =
  | "accepted"
  | "already_accepted"
  | "conflict"
  | "rejected";


interface SyncActivity {
  id: string;

  eventType: string;

  aggregateType: string;

  aggregateId: string;

  status: SyncActivityStatus;

  message: string;

  time: string;

  aggregateVersion?: number;

  globalPosition?: number;
}


interface SyncConflict {
  id: string;

  aggregateType: string;

  aggregateId: string;

  eventType: string;

  expectedVersion: number;

  serverVersion: number;
}


const mockActivities: SyncActivity[] = [
  {
    id: "evt-001",
    eventType: "ProductCreated",
    aggregateType: "PRODUCT",
    aggregateId: "prod-103",
    status: "accepted",
    message: "Product accepted by server",
    time: "9:48:19 PM",
    aggregateVersion: 1,
    globalPosition: 18420,
  },

  {
    id: "evt-002",
    eventType: "InventoryAdjusted",
    aggregateType: "INVENTORY",
    aggregateId: "inv-103",
    status: "accepted",
    message: "Inventory adjustment accepted",
    time: "9:48:19 PM",
    aggregateVersion: 4,
    globalPosition: 18421,
  },

  {
    id: "evt-003",
    eventType: "SaleCreated",
    aggregateType: "SALE",
    aggregateId: "sale-8291",
    status: "accepted",
    message: "Sale accepted by server",
    time: "9:48:20 PM",
    aggregateVersion: 1,
    globalPosition: 18422,
  },

  {
    id: "evt-004",
    eventType: "ProductUpdated",
    aggregateType: "PRODUCT",
    aggregateId: "prod-098",
    status: "conflict",
    message: "Aggregate version conflict",
    time: "9:48:20 PM",
    aggregateVersion: 4,
  },

  {
    id: "evt-005",
    eventType: "BusinessUpdated",
    aggregateType: "BUSINESS",
    aggregateId: "business-001",
    status: "conflict",
    message: "Aggregate version conflict",
    time: "9:48:21 PM",
    aggregateVersion: 7,
  },
];


const mockConflicts: SyncConflict[] = [
  {
    id: "evt-004",
    aggregateType: "PRODUCT",
    aggregateId: "prod-098",
    eventType: "ProductUpdated",
    expectedVersion: 4,
    serverVersion: 5,
  },

  {
    id: "evt-005",
    aggregateType: "BUSINESS",
    aggregateId: "business-001",
    eventType: "BusinessUpdated",
    expectedVersion: 7,
    serverVersion: 8,
  },
];


function StatusBadge({
  status,
}: {
  status: SyncActivityStatus;
}) {
  if (status === "accepted") {
    return (
      <span className="flex items-center gap-1 text-xs text-emerald-400">
        <CheckCircle2 size={14} />
        Accepted
      </span>
    );
  }

  if (status === "already_accepted") {
    return (
      <span className="flex items-center gap-1 text-xs text-gray-400">
        <CheckCircle2 size={14} />
        Already synced
      </span>
    );
  }

  if (status === "conflict") {
    return (
      <span className="flex items-center gap-1 text-xs text-amber-400">
        <AlertTriangle size={14} />
        Conflict
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 text-xs text-red-400">
      <XCircle size={14} />
      Rejected
    </span>
  );
}


function ActivityItem({
  activity,
}: {
  activity: SyncActivity;
}) {
  return (
    <div
      className="
        flex
        items-start
        gap-3
        py-4
        border-b
        border-white/5
        last:border-b-0
      "
    >
      <GlassIcon
        size="sm"
        variant={
          activity.status === "accepted"
            ? "success"
            : activity.status === "conflict"
            ? "primary"
            : "danger"
        }
      >
        {activity.status === "accepted" && (
          <CheckCircle2 size={18} />
        )}

        {activity.status === "conflict" && (
          <AlertTriangle size={18} />
        )}

        {activity.status === "rejected" && (
          <XCircle size={18} />
        )}

        {activity.status === "already_accepted" && (
          <CheckCircle2 size={18} />
        )}
      </GlassIcon>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-white">
              {activity.eventType}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              {activity.aggregateType} · {activity.aggregateId}
            </p>
          </div>

          <span className="text-[11px] text-gray-500 whitespace-nowrap">
            {activity.time}
          </span>
        </div>

        <div className="mt-2">
          <StatusBadge status={activity.status} />
        </div>

        <p className="mt-2 text-xs text-gray-500">
          {activity.message}
        </p>

        {activity.aggregateVersion !== undefined && (
          <div className="mt-2 flex gap-4 text-[10px] text-gray-500">
            <span>
              Version {activity.aggregateVersion}
            </span>

            {activity.globalPosition !== undefined && (
              <span>
                Position {activity.globalPosition}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


export default function SyncManagementPage() {

  const syncStatus: SyncStatus = "SYNCED";

  const pendingEvents = 0;
  const uploadedEvents = 148;
  const acceptedEvents = 146;
  const conflicts = 2;
  const rejectedEvents = 0;

  const handleSync = () => {
    /*
     * Connect this to your SyncApplicationService / SyncEngine.
     */
    console.log("Manual synchronization requested");
  };


  return (
    <div className="w-full space-y-6 pb-10">

      {/* ======================================================
          PAGE HEADER
          ====================================================== */}

      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <div className="flex items-center gap-3">

            <GlassIcon size="md">
              <RefreshCw size={22} />
            </GlassIcon>

            <div>
              <h1 className="text-2xl font-bold text-white">
                Sync Management
              </h1>

              <p className="mt-1 text-sm text-gray-400">
                Manage synchronization between this device
                and BizTru.
              </p>
            </div>

          </div>
        </div>

        <GlassButton
          variant="primary"
          icon={<RefreshCw size={18} />}
          onClick={handleSync}
          disabled={syncStatus === "SYNCING"}
        >
          Sync Now
        </GlassButton>
      </div>


      {/* ======================================================
          SYNC STATUS
          ====================================================== */}

      <GlassCard
        variant="accent"
        className="p-5"
      >
        <div
          className="
            flex
            flex-col
            gap-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <div className="flex items-center gap-4">

            <GlassIcon
              size="lg"
              variant="success"
            >
              <Cloud size={26} />
            </GlassIcon>

            <div>

              <div className="flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                <h2 className="text-lg font-semibold text-white">
                  Synchronized
                </h2>

              </div>

              <p className="mt-1 text-sm text-gray-400">
                Everything is up to date.
              </p>

              <p className="mt-2 text-xs text-gray-500">
                Last synced today at 9:48 PM
              </p>

            </div>

          </div>


          <div
            className="
              flex
              flex-col
              sm:items-end
              gap-1
            "
          >

            <span className="text-xs text-gray-500">
              Server position
            </span>

            <span className="text-lg font-semibold text-white">
              18,429
            </span>

          </div>

        </div>
      </GlassCard>


      {/* ======================================================
          SUMMARY
          ====================================================== */}

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Activity size={16} />
          <h2 className="text-sm font-semibold text-white">
            Sync Summary
          </h2>
        </div>

        <div
          className="
            grid
            grid-cols-2
            gap-3
            lg:grid-cols-5
          "
        >

          <StatCard
            value={pendingEvents}
            label="Pending"
            icon={
              <Upload
                size={20}
                className="text-teal-400"
              />
            }
          />

          <StatCard
            value={uploadedEvents}
            label="Uploaded"
            icon={
              <Cloud
                size={20}
                className="text-teal-400"
              />
            }
          />

          <StatCard
            value={acceptedEvents}
            label="Accepted"
            icon={
              <CheckCircle2
                size={20}
                className="text-emerald-400"
              />
            }
          />

          <StatCard
            value={conflicts}
            label="Conflicts"
            icon={
              <AlertTriangle
                size={20}
                className="text-amber-400"
              />
            }
          />

          <StatCard
            value={rejectedEvents}
            label="Rejected"
            icon={
              <XCircle
                size={20}
                className="text-red-400"
              />
            }
          />

        </div>
      </div>


      {/* ======================================================
          MAIN CONTENT
          ====================================================== */}

      <div
        className="
          grid
          grid-cols-1
          gap-6
          xl:grid-cols-[1.4fr_1fr]
        "
      >

        {/* ====================================================
            ACTIVITY
            ==================================================== */}

        <GlassCard className="p-5">

          <div
            className="
              flex
              items-center
              justify-between
              gap-3
              mb-4
            "
          >

            <div>
              <h2 className="text-base font-semibold text-white">
                Sync Activity
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Recent synchronization activity
              </p>
            </div>

            <GlassIcon size="sm">
              <History size={17} />
            </GlassIcon>

          </div>


          <div>
            {mockActivities.map((activity) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
              />
            ))}
          </div>

        </GlassCard>


        {/* ====================================================
            CONFLICTS
            ==================================================== */}

        <GlassCard className="p-5">

          <div
            className="
              flex
              items-center
              justify-between
              gap-3
              mb-4
            "
          >

            <div>
              <h2 className="text-base font-semibold text-white">
                Conflicts
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Events requiring attention
              </p>
            </div>

            <GlassIcon
              size="sm"
              variant="danger"
            >
              <AlertTriangle size={17} />
            </GlassIcon>

          </div>


          <div className="space-y-3">

            {mockConflicts.map((conflict) => (

              <DataCard
                key={conflict.id}
                title={conflict.eventType}
                subtitle={`${conflict.aggregateType} · ${conflict.aggregateId}`}
                badge={
                  <span
                    className="
                      rounded-full
                      bg-amber-500/10
                      px-2
                      py-1
                      text-[10px]
                      text-amber-400
                    "
                  >
                    Conflict
                  </span>
                }
                metrics={[
                  {
                    label: "Expected",
                    value: conflict.expectedVersion,
                  },
                  {
                    label: "Server",
                    value: conflict.serverVersion,
                  },
                ]}
                actions={
                  <GlassButton
                    variant="secondary"
                    className="w-full"
                    icon={<ChevronRight size={15} />}
                  >
                    Review
                  </GlassButton>
                }
              />

            ))}

          </div>

        </GlassCard>

      </div>


      {/* ======================================================
          CURRENT CONNECTION / DIAGNOSTICS
          ====================================================== */}

      <GlassCard className="p-5">

        <div className="flex items-center gap-3 mb-5">

          <GlassIcon size="sm">
            <Activity size={17} />
          </GlassIcon>

          <div>
            <h2 className="text-base font-semibold text-white">
              Sync Diagnostics
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Technical synchronization state
            </p>
          </div>

        </div>


        <div
          className="
            grid
            grid-cols-2
            gap-3
            lg:grid-cols-4
          "
        >

          <DataCard
            title="Connection"
            subtitle="Network"
            metrics={[
              {
                label: "Status",
                value: "Online",
              },
            ]}
            badge={
              <Wifi
                size={16}
                className="text-emerald-400"
              />
            }
          />

          <DataCard
            title="Device"
            subtitle="Local event store"
            metrics={[
              {
                label: "Position",
                value: "18,429",
              },
              {
                label: "Pending",
                value: pendingEvents,
              },
            ]}
            badge={
              <Database
                size={16}
                className="text-teal-400"
              />
            }
          />

          <DataCard
            title="Server"
            subtitle="Event store"
            metrics={[
              {
                label: "Position",
                value: "18,429",
              },
            ]}
            badge={
              <Server
                size={16}
                className="text-teal-400"
              />
            }
          />

          <DataCard
            title="Last Sync"
            subtitle="Synchronization"
            metrics={[
              {
                label: "Time",
                value: "9:48 PM",
              },
              {
                label: "Duration",
                value: "1.8s",
              },
            ]}
            badge={
              <Clock3
                size={16}
                className="text-teal-400"
              />
            }
          />

        </div>

      </GlassCard>

    </div>
  );
}