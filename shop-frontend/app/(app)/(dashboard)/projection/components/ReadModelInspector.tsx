// components/ReadModelInspector.tsx
"use client";

import { useState } from "react";
import { GlassSheet } from "@/components/ui/GlassSheet";
import { useRebuilderStore } from "../store/ProjectionRebuilderStore";

// You can replace this with a real table later
function ReadModelTable({ projection }: { projection: string | null }) {
  if (!projection) return null;

  return (
    <div className="p-6 text-sm text-gray-400">
      <p>
        Showing materialized rows for projection:{" "}
        <span className="font-medium text-white">{projection}</span>
      </p>
      {/* Replace with your real table / data fetching later */}
    </div>
  );
}

export function ReadModelInspector() {
  const [open, setOpen] = useState(false);
  const [selectedProjection, setSelectedProjection] = useState<string | null>(null);

  const projections = useRebuilderStore((s) => s.projections);

  const openInspector = (name: string) => {
    setSelectedProjection(name);
    setOpen(true);
  };

  const closeInspector = () => {
    setOpen(false);
    setSelectedProjection(null);
  };

  // Optional: expose a way for other components (e.g. ProjectionStatusCards)
  // to open the inspector. For now we keep it simple.
  // You can later move this into the Zustand store if you prefer.

  return (
    <>
      {/* This component currently only renders the sheet.
          The trigger buttons live in ProjectionStatusCards. */}
      <GlassSheet
        open={open}
        onClose={closeInspector}
        title={selectedProjection ?? "Read Model"}
        subtitle="Materialized read model"
        size="full"
      >
        <ReadModelTable projection={selectedProjection} />
      </GlassSheet>
    </>
  );
}