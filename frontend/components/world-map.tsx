"use client";

import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import DottedMap from "dotted-map";
import { useTheme } from "next-themes";
import FormationDetailsSheet from "./formation-details-sheet";

interface FormationPoint {
  lat: number;
  lng: number;
  name: string;
  prediction: number;
  confidence: number;
  giip: number;
  region: string;
  depth?: number;
  pressure?: number;
  temperature?: number;
  sealThickness?: number;
  reservoirThickness?: number;
  fault?: number;
  stacked?: number;
  security?: number;
  co2Density?: number;
}

interface WorldMapProps {
  formations?: FormationPoint[];
  onLocationClick?: (formation: FormationPoint) => void;
  selectedFormation?: FormationPoint | null;
  dots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }>;
  lineColor?: string;
}

// Memoized project point function
const projectPoint = (lat: number, lng: number) => {
  const x = (lng + 180) * (800 / 360);
  const y = (90 - lat) * (400 / 180);
  return { x, y };
};

// Memoized curved path function
const createCurvedPath = (
  start: { x: number; y: number },
  end: { x: number; y: number }
) => {
  const midX = (start.x + end.x) / 2;
  const midY = Math.min(start.y, end.y) - 50;
  return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
};

// Memoized marker color function
const getMarkerColor = (formation: FormationPoint) => {
  if (formation.prediction === 1) {
    return formation.confidence > 80 ? "#10b981" : "#34d399";
  } else {
    return formation.confidence > 80 ? "#ef4444" : "#f87171";
  }
};

// Memoized connection lines component
const ConnectionLines = ({
  dots,
  lineColor,
}: {
  dots: any[];
  lineColor: string;
}) => {
  const pathData = useMemo(
    () =>
      dots.map((dot, i) => {
        const startPoint = projectPoint(dot.start.lat, dot.start.lng);
        const endPoint = projectPoint(dot.end.lat, dot.end.lng);
        return {
          key: i,
          path: createCurvedPath(startPoint, endPoint),
        };
      }),
    [dots]
  );

  return (
    <>
      {pathData.map((data, i) => (
        <motion.path
          key={`path-${data.key}`}
          d={data.path}
          fill="none"
          stroke="url(#path-gradient)"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 1,
            delay: 0.5 * i,
            ease: "easeOut",
          }}
        />
      ))}
    </>
  );
};

// Memoized connection points component
const ConnectionPoints = ({
  dots,
  lineColor,
}: {
  dots: any[];
  lineColor: string;
}) => {
  const pointData = useMemo(
    () =>
      dots.flatMap((dot, i) => [
        { ...projectPoint(dot.start.lat, dot.start.lng), key: `start-${i}` },
        { ...projectPoint(dot.end.lat, dot.end.lng), key: `end-${i}` },
      ]),
    [dots]
  );

  return (
    <>
      {pointData.map((point) => (
        <g key={point.key}>
          <circle cx={point.x} cy={point.y} r="2" fill={lineColor} />
          <circle
            cx={point.x}
            cy={point.y}
            r="2"
            fill={lineColor}
            opacity="0.5"
          >
            <animate
              attributeName="r"
              from="2"
              to="8"
              dur="1.5s"
              begin="0s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              from="0.5"
              to="0"
              dur="1.5s"
              begin="0s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      ))}
    </>
  );
};

// Memoized formation marker component
const FormationMarker = ({
  formation,
  index,
  isSelected,
  isHovered,
  theme,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: {
  formation: FormationPoint;
  index: number;
  isSelected: boolean;
  isHovered: boolean;
  theme: string | undefined;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}) => {
  const point = useMemo(
    () => projectPoint(formation.lat, formation.lng),
    [formation.lat, formation.lng]
  );
  const markerColor = useMemo(
    () => getMarkerColor(formation),
    [formation.prediction, formation.confidence]
  );

  return (
    <g>
      {/* Pulse animation for selected */}
      {isSelected && (
        <circle
          cx={point.x}
          cy={point.y}
          r="8"
          fill={markerColor}
          opacity="0.3"
          filter="url(#glow)"
        >
          <animate
            attributeName="r"
            values="8;16;8"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.3;0;0.3"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Main marker */}
      <circle
        cx={point.x}
        cy={point.y}
        r="4"
        fill={markerColor}
        stroke="white"
        strokeWidth={isSelected ? "3" : isHovered ? "2.5" : "2"}
        className="cursor-pointer transition-all duration-200"
        style={{
          filter: isSelected ? "url(#glow)" : "none",
          transformOrigin: `${point.x}px ${point.y}px`,
          transform: isSelected
            ? "scale(1.5)"
            : isHovered
            ? "scale(1.25)"
            : "scale(1)",
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      />

      {/* Formation label */}
      {(isSelected || isHovered) && (
        <text
          x={point.x}
          y={point.y - 12}
          textAnchor="middle"
          className="text-xs font-medium fill-current pointer-events-none"
          fill={theme === "dark" ? "#f1f5f9" : "#0f172a"}
          style={{
            textShadow:
              theme === "dark"
                ? "1px 1px 2px rgba(0,0,0,0.8)"
                : "1px 1px 2px rgba(255,255,255,0.8)",
          }}
        >
          {formation.name.length > 15
            ? `${formation.name.substring(0, 15)}...`
            : formation.name}
        </text>
      )}

      {/* Confidence indicator ring */}
      {isHovered && (
        <circle
          cx={point.x}
          cy={point.y}
          r="8"
          fill="none"
          stroke={markerColor}
          strokeWidth="1"
          strokeDasharray={`${(formation.confidence / 100) * 50}, 50`}
          opacity="0.7"
        />
      )}
    </g>
  );
};

// Memoized tooltip component
const Tooltip = ({
  formation,
  theme,
}: {
  formation: FormationPoint;
  theme: string | undefined;
}) => {
  const position = useMemo(() => {
    const point = projectPoint(formation.lat, formation.lng);
    return {
      left: `${(point.x / 800) * 100}%`,
      top: `${(point.y / 400) * 100}%`,
    };
  }, [formation.lat, formation.lng]);

  return (
    <div
      className="absolute bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3 pointer-events-none z-20 max-w-xs"
      style={{
        ...position,
        transform: "translate(-50%, -100%)",
        marginTop: "-8px",
      }}
    >
      <div className="text-sm font-semibold text-foreground">
        {formation.name}
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        <div className="flex items-center justify-between">
          <span>Status:</span>
          <span
            className={`font-medium ${
              formation.prediction === 1 ? "text-green-600" : "text-red-600"
            }`}
          >
            {formation.prediction === 1 ? "Suitable" : "Unsuitable"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Confidence:</span>
          <span className="font-medium">{formation.confidence}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span>GIIP:</span>
          <span className="font-medium">{formation.giip.toFixed(1)} Mt</span>
        </div>
        {formation.depth && (
          <div className="flex items-center justify-between">
            <span>Depth:</span>
            <span className="font-medium">{formation.depth.toFixed(0)} m</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span>Region:</span>
          <span className="font-medium">{formation.region}</span>
        </div>
      </div>
    </div>
  );
};

export function WorldMap({
  formations = [],
  onLocationClick,
  selectedFormation,
  dots = [],
  lineColor = "#0ea5e9",
}: WorldMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { theme } = useTheme();
  const [hoveredFormation, setHoveredFormation] =
    useState<FormationPoint | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedFormationDetails, setSelectedFormationDetails] =
    useState<FormationPoint | null>(null);

  // Memoize formation click handler
  const handleFormationClick = useCallback(
    (formation: FormationPoint) => {
      // Clear any pending hover timeouts when clicking
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      setSelectedFormationDetails(formation);
      setDetailsOpen(true);
      onLocationClick?.(formation);
    },
    [onLocationClick]
  );
  const svgMap = useMemo(() => {
    const map = new DottedMap({ height: 100, grid: "diagonal" });
    return map.getSVG({
      radius: 0.22,
      color: theme === "dark" ? "#FFFFFF40" : "#00000040",
      shape: "circle",
      backgroundColor: theme === "dark" ? "black" : "white",
    });
  }, [theme]);

  // Debounced hover handlers to prevent flickering
  const handleMouseEnter = useCallback((formation: FormationPoint) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Small delay to prevent rapid toggling
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredFormation(formation);
    }, 50);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Longer delay before hiding to prevent flickering
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredFormation(null);
    }, 150);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Memoize the dotted map creation and SVG generation
  // Memoize formation handlers map
  const formationHandlers = useMemo(
    () =>
      formations.reduce((acc, formation) => {
        acc[formation.name] = {
          onMouseEnter: () => handleMouseEnter(formation),
          onClick: () => handleFormationClick(formation),
        };
        return acc;
      }, {} as Record<string, { onMouseEnter: () => void; onClick: () => void }>),
    [formations, handleMouseEnter, handleFormationClick]
  );

  return (
    <div className="w-full aspect-[2/1] dark:bg-black bg-white rounded-lg relative font-sans overflow-hidden">
      {/* Dotted World Map Background */}
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        className="h-full w-full [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] pointer-events-none select-none"
        alt="world map"
        height="495"
        width="1056"
        draggable={false}
      />

      {/* Interactive SVG Layer */}
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="w-full h-full absolute inset-0"
      >
        {/* Gradients and Definitions */}
        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>

          {/* Glow filter for selected formations */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connection Lines */}
        {dots.length > 0 && (
          <ConnectionLines dots={dots} lineColor={lineColor} />
        )}

        {/* Connection Points */}
        {dots.length > 0 && (
          <ConnectionPoints dots={dots} lineColor={lineColor} />
        )}

        {/* Formation Markers */}
        {formations.map((formation, i) => (
          <FormationMarker
            key={`formation-${formation.name}-${i}`}
            formation={formation}
            index={i}
            isSelected={selectedFormation?.name === formation.name}
            isHovered={hoveredFormation?.name === formation.name}
            theme={theme}
            onMouseEnter={formationHandlers[formation.name]?.onMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={formationHandlers[formation.name]?.onClick}
          />
        ))}
      </svg>

      {/* Tooltip */}
      {hoveredFormation && (
        <Tooltip formation={hoveredFormation} theme={theme} />
      )}

      {/* Formation Details Sheet */}
      <FormationDetailsSheet
        formation={selectedFormationDetails}
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />
    </div>
  );
}
