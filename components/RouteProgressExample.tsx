"use client";

import { useMemo, useState } from "react";
import { Car } from "lucide-react";

const route: [number, number][] = [
  [-122.394, 37.7953],
  [-122.3952, 37.7967],
  [-122.397, 37.7986],
  [-122.3975, 37.7992],
  [-122.3976, 37.7993],
  [-122.3981, 37.799],
  [-122.3984, 37.7989],
  [-122.4066, 37.7979],
  [-122.4071, 37.7981],
  [-122.4072, 37.7982],
  [-122.4072, 37.7984],
  [-122.4082, 37.8034],
  [-122.4064, 37.8037],
  [-122.4063, 37.8036],
  [-122.4063, 37.8034],
  [-122.4067, 37.8032],
  [-122.4067, 37.803],
  [-122.4067, 37.8028],
  [-122.4064, 37.8025],
  [-122.4062, 37.802],
  [-122.406, 37.8019],
  [-122.4058, 37.8018],
  [-122.4056, 37.8018],
  [-122.4055, 37.8019],
  [-122.4054, 37.8021],
  [-122.4056, 37.8025],
];

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 560;
const MAP_PADDING = 56;

function getRoutePoints() {
  const longitudes = route.map(([longitude]) => longitude);
  const latitudes = route.map(([, latitude]) => latitude);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const width = MAP_WIDTH - MAP_PADDING * 2;
  const height = MAP_HEIGHT - MAP_PADDING * 2;

  return route.map(([longitude, latitude]) => ({
    x:
      MAP_PADDING +
      ((longitude - minLongitude) / (maxLongitude - minLongitude)) * width,
    y:
      MAP_PADDING +
      ((maxLatitude - latitude) / (maxLatitude - minLatitude)) * height,
  }));
}

const routePoints = getRoutePoints();
const routePath = routePoints
  .map(({ x, y }, index) => `${index === 0 ? "M" : "L"} ${x} ${y}`)
  .join(" ");
const segmentLengths = routePoints.slice(1).map((point, index) => {
  const previous = routePoints[index];
  return Math.hypot(point.x - previous.x, point.y - previous.y);
});
const totalRouteLength = segmentLengths.reduce((total, length) => total + length, 0);

function getProgressPosition(progress: number) {
  let remainingLength = totalRouteLength * progress;

  for (let index = 0; index < segmentLengths.length; index += 1) {
    const segmentLength = segmentLengths[index];
    if (remainingLength <= segmentLength || index === segmentLengths.length - 1) {
      const start = routePoints[index];
      const end = routePoints[index + 1];
      const segmentProgress = segmentLength === 0 ? 0 : remainingLength / segmentLength;

      return {
        x: start.x + (end.x - start.x) * segmentProgress,
        y: start.y + (end.y - start.y) * segmentProgress,
        angle: Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI),
      };
    }

    remainingLength -= segmentLength;
  }

  return { ...routePoints[routePoints.length - 1], angle: 0 };
}

export function RouteProgressExample() {
  const [progress, setProgress] = useState(0.45);
  const progressPosition = useMemo(
    () => getProgressPosition(progress),
    [progress],
  );

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-xl border border-slate-200 bg-[#eef3f0]">
      <svg
        aria-label="Map showing route progress in San Francisco"
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
        role="img"
      >
        <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="#eef3f0" />

        <path
          d="M 0 70 C 170 120, 140 230, 300 260 S 560 310, 650 225 S 870 160, 1000 210 L 1000 0 L 0 0 Z"
          fill="#d9eaf0"
        />
        <path
          d="M 0 70 C 170 120, 140 230, 300 260 S 560 310, 650 225 S 870 160, 1000 210"
          fill="none"
          stroke="#c1dce5"
          strokeWidth="3"
        />

        <g fill="none" stroke="#ffffff" strokeWidth="16">
          <path d="M -40 450 L 270 200 L 510 100 L 1040 20" />
          <path d="M 30 -20 L 220 580" />
          <path d="M 360 -30 L 420 600" />
          <path d="M 710 -30 L 650 600" />
          <path d="M 960 -20 L 800 590" />
          <path d="M -30 140 L 1030 410" />
          <path d="M -20 330 L 1030 120" />
          <path d="M 120 560 L 910 -20" />
        </g>
        <g fill="none" stroke="#d9e2de" strokeWidth="2">
          <path d="M -40 450 L 270 200 L 510 100 L 1040 20" />
          <path d="M 30 -20 L 220 580" />
          <path d="M 360 -30 L 420 600" />
          <path d="M 710 -30 L 650 600" />
          <path d="M 960 -20 L 800 590" />
          <path d="M -30 140 L 1030 410" />
          <path d="M -20 330 L 1030 120" />
          <path d="M 120 560 L 910 -20" />
        </g>

        <path
          d={routePath}
          pathLength="1"
          fill="none"
          stroke="#94a3b8"
          strokeDasharray="0.005 0.012"
          strokeLinecap="round"
          strokeWidth="8"
        />
        <path
          d={routePath}
          pathLength="1"
          fill="none"
          stroke="#3b82f6"
          strokeDasharray={`${progress} 1`}
          strokeLinecap="round"
          strokeWidth="7"
        />

        <circle
          cx={routePoints[0].x}
          cy={routePoints[0].y}
          r="11"
          fill="white"
          stroke="#334155"
          strokeWidth="4"
        />
        <circle
          cx={routePoints[routePoints.length - 1].x}
          cy={routePoints[routePoints.length - 1].y}
          r="11"
          fill="#334155"
          stroke="white"
          strokeWidth="4"
        />

        <g
          transform={`translate(${progressPosition.x} ${progressPosition.y}) rotate(${progressPosition.angle})`}
        >
          <circle r="19" fill="#3b82f6" stroke="white" strokeWidth="4" />
          <foreignObject x="-10" y="-10" width="20" height="20">
            <div className="grid h-5 w-5 place-items-center text-white">
              <Car className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
          </foreignObject>
        </g>
      </svg>

      <div className="absolute bottom-3 left-3 w-56 rounded-lg border border-slate-200/70 bg-white/95 p-3 shadow-lg backdrop-blur-md">
        <div className="mb-2 flex items-center justify-between text-xs">
          <label htmlFor="route-progress" className="font-medium text-slate-900">
            Progress
          </label>
          <span className="tabular-nums text-slate-500">
            {Math.round(progress * 100)}%
          </span>
        </div>
        <input
          id="route-progress"
          type="range"
          value={progress}
          onChange={(event) => setProgress(Number(event.target.value))}
          min={0}
          max={1}
          step={0.01}
          aria-label="Route progress"
          className="h-2 w-full cursor-pointer accent-blue-500"
        />
      </div>
    </div>
  );
}

export default RouteProgressExample;
