"use client";

import type { RadarQuadrantSummary } from "@/app/types/radar";

interface QuadrantNavigationProps {
  quadrants: RadarQuadrantSummary[];
  selectedId: string | null;
  loadingById: Record<string, boolean>;
  loadedQuadrantIds: Set<string>;
  errorsById: Record<string, string | undefined>;
  onSelect: (quadrantId: string) => void;
}

const QuadrantNavigation = ({
  quadrants,
  selectedId,
  loadingById,
  loadedQuadrantIds,
  errorsById,
  onSelect,
}: QuadrantNavigationProps) => {
  return (
    <nav aria-label="Quadrant navigation" className="flex flex-wrap gap-3">
      {quadrants.map((quadrant) => {
        const isSelected = quadrant.id === selectedId;
        const isLoading = Boolean(loadingById[quadrant.id]);
        const isLoaded = loadedQuadrantIds.has(quadrant.id);
        const error = errorsById[quadrant.id];
        const ringColorClass = isSelected ? "border-slate-900 shadow-lg" : "border-slate-300";

        return (
          <button
            key={quadrant.id}
            type="button"
            onClick={() => onSelect(quadrant.id)}
            title={error ?? `${quadrant.name} quadrant`}
            className={`rounded-xl border ${ringColorClass} bg-white/70 dark:bg-slate-900/80 px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500`}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {quadrant.name}
                </p>
                <p className="mt-1 text-xs text-slate-500 max-w-xs">
                  {quadrant.description}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-slate-300 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                {quadrant.order + 1}
              </span>
            </div>
            <div className="mt-2 text-xs font-medium text-slate-500">
              {error && <span className="text-red-500">Failed · retry</span>}
              {!error && isLoading && <span>Loading…</span>}
              {!error && !isLoading && isLoaded && <span>Ready</span>}
              {!error && !isLoading && !isLoaded && <span>Tap to load</span>}
            </div>
          </button>
        );
      })}
    </nav>
  );
};

export default QuadrantNavigation;
