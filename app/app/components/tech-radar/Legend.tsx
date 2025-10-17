"use client";

import type { ReactNode } from "react";

const Legend = () => {
  return (
    <section aria-label="Radar legend" className="mt-6 grid gap-3 sm:grid-cols-2">
      <LegendItem
        title="New blip"
        description="Star icons represent capabilities that are new to this edition."
      >
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
          <polygon
            points="12 2 14.7 8.2 21.5 8.6 16 12.9 18 19.6 12 15.8 6 19.6 8 12.9 2.5 8.6 9.3 8.2"
            fill="#facc15"
            stroke="#92400e"
            strokeWidth="1.2"
          />
        </svg>
      </LegendItem>
      <LegendItem
        title="Moving in"
        description="Upward triangles indicate items that have moved closer to adoption."
      >
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
          <polygon points="12 4 20 20 4 20" fill="#22c55e" stroke="#166534" strokeWidth="1.2" />
        </svg>
      </LegendItem>
      <LegendItem
        title="Moving out"
        description="Downward triangles call out items that are moving away from adoption."
      >
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
          <polygon points="12 20 4 4 20 4" fill="#ef4444" stroke="#991b1b" strokeWidth="1.2" />
        </svg>
      </LegendItem>
      <LegendItem
        title="No change"
        description="Circles show steady-state items that remain in their current ring."
      >
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="8" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.2" />
        </svg>
      </LegendItem>
    </section>
  );
};

interface LegendItemProps {
  title: string;
  description: string;
  children: ReactNode;
}

const LegendItem = ({ title, description, children }: LegendItemProps) => {
  return (
    <div className="flex gap-3 rounded-lg border border-slate-200/70 bg-white/60 p-3 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
      <div className="shrink-0">{children}</div>
      <div>
        <p className="font-semibold text-slate-700 dark:text-slate-100">{title}</p>
        <p className="text-xs leading-snug text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </div>
  );
};

export default Legend;
