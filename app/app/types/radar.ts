export type RadarMovement = "steady" | "up" | "down";

export interface RadarMeta {
  title: string;
  subtitle: string;
  published: string;
  summary: string;
}

export interface RadarRing {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface RadarQuadrantSummary {
  id: string;
  name: string;
  description: string;
  order: number;
  startAngle: number;
  color: string;
}

export interface RadarBlip {
  id: string;
  sequence: number;
  name: string;
  ringId: string;
  movement: RadarMovement;
  isNew: boolean;
  description: string;
  link: string;
}

export interface RadarQuadrantDetail extends RadarQuadrantSummary {
  blips: RadarBlip[];
}

export interface RadarSummaryResponse {
  meta: RadarMeta;
  rings: RadarRing[];
  quadrants: RadarQuadrantSummary[];
}

export interface RadarQuadrantResponse {
  quadrant: RadarQuadrantDetail;
}
