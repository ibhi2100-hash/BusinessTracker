import {
  RotateCcw,
  Database,
  Activity,
} from "lucide-react";

import { GlassIcon } from "@/components/ui/GlassIcon";

export function RebuilderHeader() {
  return (
    <div className="flex items-center justify-between gap-4">

      <div className="flex items-center gap-4">

        <GlassIcon size="lg">
          <RotateCcw size={26} />
        </GlassIcon>

        <div>
          <h1 className="text-2xl font-bold text-white">
            Projection Laboratory
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Rebuild materialized business reality from immutable events.
          </p>
        </div>

      </div>

      <div className="flex items-center gap-2">

        <div className="
          flex
          items-center
          gap-2
          rounded-xl
          border
          border-white/10
          bg-white/[0.04]
          px-3
          py-2
          text-sm
          text-gray-300
        ">
          <Database size={15} className="text-teal-400" />
          SQLite WASM
        </div>

        <div className="
          flex
          items-center
          gap-2
          rounded-xl
          border
          border-emerald-500/20
          bg-emerald-500/10
          px-3
          py-2
          text-sm
          text-emerald-400
        ">
          <Activity size={15} />
          Local
        </div>

      </div>

    </div>
  );
}