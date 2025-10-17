import { NextResponse } from "next/server";
import type { RadarQuadrantSummary, RadarSummaryResponse } from "@/app/types/radar";
import { radarDataset } from "./data";

const { meta, rings, quadrants } = radarDataset;

export function GET(): NextResponse<RadarSummaryResponse> {
  const quadrantSummaries: RadarQuadrantSummary[] = quadrants
    .map(({ blips, ...rest }) => rest)
    .sort((a, b) => a.order - b.order);

  return NextResponse.json({
    meta,
    rings: [...rings],
    quadrants: quadrantSummaries,
  });
}
