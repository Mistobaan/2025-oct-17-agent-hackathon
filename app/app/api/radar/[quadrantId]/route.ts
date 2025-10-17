import { NextResponse } from "next/server";
import type { RadarQuadrantDetail, RadarQuadrantResponse } from "@/app/types/radar";
import { radarDataset } from "../data";

interface RouteParams {
  params: Promise<{ quadrantId: string }>;
}

export async function GET(
  _: Request,
  context: RouteParams,
): Promise<NextResponse<RadarQuadrantResponse | { message: string }>> {
  const { quadrantId } = await context.params;
  const normalizedId = quadrantId.toLowerCase();
  const quadrant = radarDataset.quadrants.find(
    (entry) => entry.id.toLowerCase() === normalizedId,
  );

  if (!quadrant) {
    return NextResponse.json({ message: `Quadrant '${quadrantId}' not found.` }, { status: 404 });
  }

  const result: RadarQuadrantDetail = {
    ...quadrant,
    blips: [...quadrant.blips].sort((a, b) => a.sequence - b.sequence),
  };

  return NextResponse.json({ quadrant: result });
}
