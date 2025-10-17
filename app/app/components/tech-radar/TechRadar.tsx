"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  RadarMeta,
  RadarQuadrantDetail,
  RadarQuadrantResponse,
  RadarQuadrantSummary,
  RadarRing,
  RadarSummaryResponse,
} from "@/app/types/radar";
import Legend from "./Legend";
import QuadrantNavigation from "./QuadrantNavigation";
import RadarChart, { HoverInfo } from "./RadarChart";

const FETCH_OPTIONS: RequestInit = { cache: "no-store" };
const CHART_SIZE = 720;

const TechRadar = () => {
  const [meta, setMeta] = useState<RadarMeta | null>(null);
  const [rings, setRings] = useState<RadarRing[]>([]);
  const [quadrants, setQuadrants] = useState<RadarQuadrantSummary[]>([]);
  const [selectedQuadrantId, setSelectedQuadrantId] = useState<string | null>(null);
  const [quadrantDetails, setQuadrantDetails] = useState<Record<string, RadarQuadrantDetail>>({});
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [loadingById, setLoadingById] = useState<Record<string, boolean>>({});
  const [errorsById, setErrorsById] = useState<Record<string, string | undefined>>({});
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [loadingAll, setLoadingAll] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const isMounted = useRef(true);
  const quadrantDetailsRef = useRef<Record<string, RadarQuadrantDetail>>({});

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    quadrantDetailsRef.current = quadrantDetails;
  }, [quadrantDetails]);

  useEffect(() => {
    let cancelled = false;

    const loadSummary = async () => {
      setLoadingSummary(true);
      setSummaryError(null);
      try {
        const response = await fetch("/api/radar", FETCH_OPTIONS);
        if (!response.ok) {
          throw new Error(`Unable to load radar summary (status ${response.status}).`);
        }
        const data = (await response.json()) as RadarSummaryResponse;
        if (cancelled) {
          return;
        }
        const orderedQuadrants = [...data.quadrants].sort((a, b) => a.order - b.order);
        setMeta(data.meta);
        setRings(data.rings);
        setQuadrants(orderedQuadrants);
        setSelectedQuadrantId((previous) => previous ?? orderedQuadrants[0]?.id ?? null);
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Unknown error";
          setSummaryError(message);
        }
      } finally {
        if (!cancelled) {
          setLoadingSummary(false);
        }
      }
    };

    void loadSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  const loadQuadrant = useCallback(
    async (quadrantId: string) => {
      if (quadrantDetailsRef.current[quadrantId]) {
        return;
      }

      setLoadingById((previous) => ({ ...previous, [quadrantId]: true }));
      setErrorsById((previous) => ({ ...previous, [quadrantId]: undefined }));

      try {
        const response = await fetch(`/api/radar/${encodeURIComponent(quadrantId)}`, FETCH_OPTIONS);
        if (!response.ok) {
          throw new Error(`Unable to load quadrant “${quadrantId}”.`);
        }
        const data = (await response.json()) as RadarQuadrantResponse;
        if (!isMounted.current) {
          return;
        }
        setQuadrantDetails((previous) => ({ ...previous, [quadrantId]: data.quadrant }));
      } catch (error) {
        if (!isMounted.current) {
          return;
        }
        const message = error instanceof Error ? error.message : "Unknown error";
        setErrorsById((previous) => ({ ...previous, [quadrantId]: message }));
      } finally {
        if (!isMounted.current) {
          return;
        }
        setLoadingById((previous) => ({ ...previous, [quadrantId]: false }));
      }
    },
    [],
  );

  useEffect(() => {
    if (!selectedQuadrantId) {
      return;
    }
    void loadQuadrant(selectedQuadrantId);
  }, [selectedQuadrantId, loadQuadrant]);

  const handleSelectQuadrant = useCallback(
    (quadrantId: string) => {
      setSelectedQuadrantId(quadrantId);
      void loadQuadrant(quadrantId);
    },
    [loadQuadrant],
  );

  const handleLoadAll = useCallback(async () => {
    if (loadingAll) {
      return;
    }
    setLoadingAll(true);
    try {
      await Promise.all(quadrants.map((quadrant) => loadQuadrant(quadrant.id)));
    } finally {
      if (isMounted.current) {
        setLoadingAll(false);
      }
    }
  }, [loadingAll, loadQuadrant, quadrants]);

  const loadedQuadrantIds = useMemo(
    () => new Set(Object.keys(quadrantDetails)),
    [quadrantDetails],
  );

  const tooltipPosition = useMemo(() => {
    if (!hoverInfo || !containerRef.current) {
      return null;
    }
    const bounds = containerRef.current.getBoundingClientRect();
    const widthRatio = bounds.width / CHART_SIZE;
    const heightRatio = bounds.height / CHART_SIZE;
    let left = hoverInfo.position.x * widthRatio + 16;
    let top = hoverInfo.position.y * heightRatio + 16;
    const maxLeft = bounds.width - 260;
    const maxTop = bounds.height - 160;
    left = Math.min(left, maxLeft);
    top = Math.min(top, maxTop);
    return { left, top };
  }, [hoverInfo]);

  const handleHover = useCallback((info: HoverInfo | null) => {
    setHoverInfo(info);
  }, []);

  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
        <div className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{meta?.subtitle}</p>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">{meta?.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">{meta?.summary}</p>
        </div>
        {meta && (
          <div className="text-sm text-slate-500 dark:text-slate-400">
            <p>Published {new Date(meta.published).toLocaleDateString()}</p>
            <Link href="#radar" className="mt-2 block text-xs font-medium text-sky-600 hover:underline">
              Skip to visualization
            </Link>
          </div>
        )}
      </header>

      {summaryError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {summaryError}
        </div>
      )}

      {loadingSummary && !summaryError && (
        <div className="rounded-lg border border-slate-200 bg-white/70 p-4 text-sm text-slate-500 shadow-sm">
          Loading radar overview…
        </div>
      )}

      {quadrants.length > 0 && (
        <QuadrantNavigation
          quadrants={quadrants}
          selectedId={selectedQuadrantId}
          loadingById={loadingById}
          loadedQuadrantIds={loadedQuadrantIds}
          errorsById={errorsById}
          onSelect={handleSelectQuadrant}
        />
      )}

      {quadrants.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleLoadAll}
            disabled={loadingAll}
            className="rounded-full border border-slate-300 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-200"
          >
            {loadingAll ? "Loading every quadrant…" : "Load all quadrants"}
          </button>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Quadrant data loads on demand so you only fetch the details you need.
          </p>
        </div>
      )}

      <div
        id="radar"
        ref={containerRef}
        className="relative mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="aspect-square w-full">
          <RadarChart
            rings={rings}
            quadrants={quadrants}
            quadrantDetails={quadrantDetails}
            selectedQuadrantId={selectedQuadrantId}
            onHover={handleHover}
            onSelectQuadrant={handleSelectQuadrant}
            size={CHART_SIZE}
          />
        </div>
        {hoverInfo && tooltipPosition && (
          <div
            className="pointer-events-none absolute z-20 max-w-xs rounded-xl border border-slate-200 bg-white/95 p-4 text-sm text-slate-700 shadow-2xl dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-200"
            style={{ left: tooltipPosition.left, top: tooltipPosition.top }}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {hoverInfo.blip.sequence}. {hoverInfo.blip.name}
              </p>
              <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
                {hoverInfo.ring.name}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {hoverInfo.quadrant.name}
              {hoverInfo.blip.isNew && " · New"}
              {hoverInfo.blip.movement === "up" && " · Moving in"}
              {hoverInfo.blip.movement === "down" && " · Moving out"}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {hoverInfo.blip.description}
            </p>
            <a
              href={hoverInfo.blip.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-sky-600 hover:underline"
            >
              Read more
              <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M12.293 2.293a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L14 5.414V17a1 1 0 11-2 0V5.414L9.707 7.707A1 1 0 118.293 6.293l4-4z" />
              </svg>
            </a>
          </div>
        )}
      </div>

      <Legend />
    </section>
  );
};

export default TechRadar;
