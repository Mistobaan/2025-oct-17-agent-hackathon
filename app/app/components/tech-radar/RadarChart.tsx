"use client";

import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import type {
  RadarBlip,
  RadarQuadrantDetail,
  RadarQuadrantSummary,
  RadarRing,
} from "@/app/types/radar";

export interface HoverInfo {
  blip: RadarBlip;
  quadrant: RadarQuadrantSummary;
  ring: RadarRing;
  position: { x: number; y: number };
}

interface RadarChartProps {
  rings: RadarRing[];
  quadrants: RadarQuadrantSummary[];
  quadrantDetails: Record<string, RadarQuadrantDetail | undefined>;
  selectedQuadrantId: string | null;
  onHover?: (payload: HoverInfo | null) => void;
  size?: number;
}

const RING_RATIOS = [0, 0.316, 0.652, 0.832, 1];

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const RadarChart = ({
  rings,
  quadrants,
  quadrantDetails,
  selectedQuadrantId,
  onHover,
  size = 720,
}: RadarChartProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const ringRatios = useMemo(() => {
    if (rings.length + 1 <= RING_RATIOS.length) {
      return RING_RATIOS.slice(0, rings.length + 1);
    }
    const step = 1 / rings.length;
    return Array.from({ length: rings.length + 1 }, (_, index) => index * step);
  }, [rings.length]);

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) {
      return;
    }

    const svg = d3.select(svgElement);
    svg.selectAll("*").remove();

    const width = size;
    const height = size;
    const center = width / 2;
    const radius = center - 32;

    svg.attr("viewBox", `0 0 ${width} ${height}`);
    svg.attr("role", "img");

    const root = svg.append("g").attr("transform", `translate(${center}, ${center})`);

    // Draw concentric rings.
    root
      .append("g")
      .selectAll("circle")
      .data(ringRatios.slice(1))
      .join("circle")
      .attr("class", "radar-ring")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", (ratio) => ratio * radius)
      .attr("fill", "none")
      .attr("stroke", "#cbd5f5")
      .attr("stroke-width", 1.2)
      .attr("stroke-dasharray", "4 4");

    // Draw quadrant boundaries.
    const axes = [0, Math.PI / 2];
    const axisGroup = root.append("g").attr("class", "radar-axes");
    axes.forEach((angle) => {
      axisGroup
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", Math.cos(angle) * radius)
        .attr("y2", Math.sin(angle) * radius)
        .attr("stroke", "#94a3b8")
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", 0.7);
      axisGroup
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", Math.cos(angle + Math.PI) * radius)
        .attr("y2", Math.sin(angle + Math.PI) * radius)
        .attr("stroke", "#94a3b8")
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", 0.7);
    });

    // Quadrant background arcs to highlight selection.
    const quadrantsLayer = root.append("g").attr("class", "radar-quadrants");
    quadrants.forEach((quadrant) => {
      const arc = d3
        .arc<void>()
        .innerRadius(0)
        .outerRadius(radius)
        .startAngle(toRadians(quadrant.startAngle - 90))
        .endAngle(toRadians(quadrant.startAngle));

      const isSelected = quadrant.id === selectedQuadrantId;
      const fillOpacity = isSelected ? 0.18 : 0.08;
      const fillColor = d3.color(quadrant.color) ?? d3.color("#38bdf8")!;

      quadrantsLayer
        .append("path")
        .attr("d", arc)
        .attr("fill", fillColor.copy({ opacity: fillOpacity })!.toString())
        .attr("stroke", fillColor.copy({ opacity: 0.4 })!.toString())
        .attr("stroke-width", isSelected ? 2 : 1)
        .attr("pointer-events", "none");

      const labelRadius = radius + 28;
      const angle = toRadians(quadrant.startAngle - 45);
      quadrantsLayer
        .append("text")
        .attr("x", Math.cos(angle) * labelRadius)
        .attr("y", Math.sin(angle) * labelRadius)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("class", "fill-slate-600 text-sm font-semibold")
        .text(quadrant.name);
    });

    // Draw ring labels near top-right quadrant.
    const labelsLayer = root.append("g").attr("class", "radar-ring-labels");
    rings.forEach((ring, index) => {
      const innerRatio = ringRatios[index];
      const outerRatio = ringRatios[index + 1];
      const radialPosition = (innerRatio + outerRatio) / 2;

      labelsLayer
        .append("text")
        .attr("x", radialPosition * radius + 6)
        .attr("y", -radialPosition * radius - 6)
        .attr("class", "fill-slate-500 text-xs font-medium")
        .text(ring.name);
    });

    // Plot blips per quadrant and ring.
    const ringsById = new Map(rings.map((ring) => [ring.id, ring]));
    const blipLayer = root.append("g").attr("class", "radar-blips");

    quadrants.forEach((quadrant) => {
      const detail = quadrantDetails[quadrant.id];
      if (!detail) {
        return;
      }

      const startAngleRad = toRadians(quadrant.startAngle);
      const angleSpan = Math.PI / 2;

      const blipsByRing = d3.group(detail.blips, (blip) => blip.ringId);

      blipsByRing.forEach((ringBlips, ringId) => {
        const ring = ringsById.get(ringId);
        if (!ring) {
          return;
        }

        const ringIndex = rings.findIndex((entry) => entry.id === ringId);
        const innerRadius = ringRatios[ringIndex] * radius;
        const outerRadius = ringRatios[ringIndex + 1] * radius;
        const angleMin = startAngleRad - angleSpan + 0.25;
        const angleMax = startAngleRad - 0.25;
        const angleStep = ringBlips.length > 0 ? (angleMax - angleMin) / ringBlips.length : 0;

        ringBlips.forEach((blip, index) => {
          const radialFactor = (index + 1) / (ringBlips.length + 1);
          const radialPosition = innerRadius + (outerRadius - innerRadius) * radialFactor;
          const angle = angleMin + angleStep * index + angleStep / 2;
          const x = Math.cos(angle) * radialPosition;
          const y = Math.sin(angle) * radialPosition;

          const group = blipLayer
            .append("g")
            .attr("transform", `translate(${x}, ${y})`)
            .attr("tabindex", 0)
            .attr(
              "aria-label",
              `${blip.sequence}. ${blip.name} — ${ring.name} in ${quadrant.name}`,
            );

          const baseSymbol = d3.symbol().size(160);
          let rotation = 0;

          if (blip.isNew) {
            baseSymbol.type(d3.symbolStar).size(220);
          } else if (blip.movement === "up") {
            baseSymbol.type(d3.symbolTriangle).size(200);
          } else if (blip.movement === "down") {
            baseSymbol.type(d3.symbolTriangle).size(200);
            rotation = 180;
          } else {
            baseSymbol.type(d3.symbolCircle).size(180);
          }

          group
            .append("path")
            .attr("d", baseSymbol())
            .attr("fill", ring.color)
            .attr("stroke", quadrant.id === selectedQuadrantId ? "#0f172a" : "#1e293b")
            .attr("stroke-width", quadrant.id === selectedQuadrantId ? 2 : 1)
            .attr("transform", `rotate(${rotation})`)
            .attr("opacity", blip.movement === "steady" && !blip.isNew ? 0.9 : 1);

          group
            .append("text")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("font-size", "10px")
            .attr("font-weight", 600)
            .attr("fill", "#0f172a")
            .text(blip.sequence);

          const handlePointer = (event: PointerEvent | MouseEvent | FocusEvent) => {
            if (!onHover) return;

            let px: number | null = null;
            let py: number | null = null;

            if ("clientX" in event && "clientY" in event) {
              const [ex, ey] = d3.pointer(event as PointerEvent, svgElement);
              px = ex;
              py = ey;
            } else {
              const node = group.node();
              if (node && svgElement) {
                const blipBounds = (node as SVGGElement).getBoundingClientRect();
                const svgBounds = svgElement.getBoundingClientRect();
                px = blipBounds.left - svgBounds.left + blipBounds.width / 2;
                py = blipBounds.top - svgBounds.top + blipBounds.height / 2;
              }
            }

            if (px === null || py === null) {
              return;
            }

            onHover({ blip, quadrant, ring, position: { x: px, y: py } });
          };

          const handleLeave = () => {
            onHover?.(null);
          };

          group.on("mouseenter", handlePointer);
          group.on("focus", handlePointer);
          group.on("mouseleave", handleLeave);
          group.on("blur", handleLeave);
        });
      });
    });
  }, [quadrants, quadrantDetails, ringRatios, rings, selectedQuadrantId, size, onHover]);

  return <svg ref={svgRef} className="w-full h-full" />;
};

export default RadarChart;
