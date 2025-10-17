import radarData from "@/data/radar.json";
import type { RadarQuadrantDetail, RadarRing, RadarMeta } from "@/app/types/radar";

export interface RadarDataFile {
  meta: RadarMeta;
  rings: RadarRing[];
  quadrants: RadarQuadrantDetail[];
}

export const radarDataset = radarData as RadarDataFile;
