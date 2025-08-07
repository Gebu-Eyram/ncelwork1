"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ModernCircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
  showPercentage?: boolean;
  color?: "primary" | "secondary" | "success" | "warning" | "danger";
  animated?: boolean;
}

const colorVariants = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary))",
  success: "hsl(142, 76%, 36%)",
  warning: "hsl(38, 92%, 50%)",
  danger: "hsl(0, 84%, 60%)",
};

export function ModernCircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  className,
  children,
  showPercentage = true,
  color = "primary",
  animated = true,
}: ModernCircularProgressProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset =
    circumference - (normalizedValue / 100) * circumference;

  const center = size / 2;
  const strokeColor = colorVariants[color];

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className
      )}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{ filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))" }}
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="transparent"
          opacity={0.3}
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient
            id={`gradient-${color}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={strokeColor} stopOpacity="1" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.6" />
          </linearGradient>

          {/* Glow filter */}
          <filter id={`glow-${color}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={`url(#gradient-${color})`}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          filter={`url(#glow-${color})`}
          className={animated ? "transition-all duration-1000 ease-out" : ""}
          style={{
            transitionProperty: "stroke-dashoffset",
          }}
        />

        {/* Inner glow circle */}
        <circle
          cx={center}
          cy={center}
          r={radius - strokeWidth / 2}
          stroke={strokeColor}
          strokeWidth={1}
          fill="transparent"
          opacity={0.2}
        />
      </svg>

      {/* Content overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children ||
          (showPercentage && (
            <div className="text-center">
              <div
                className="text-2xl font-bold"
                style={{ color: strokeColor }}
              >
                {Math.round(normalizedValue)}%
              </div>
              {size > 80 && (
                <div className="text-xs text-muted-foreground mt-1">
                  Progress
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

// Specialized variants
export function SecurityProgress({
  value,
  size = 100,
}: {
  value: number;
  size?: number;
}) {
  const getColorAndText = (val: number) => {
    if (val >= 80) return { color: "success" as const, text: "High Security" };
    if (val >= 60)
      return { color: "warning" as const, text: "Medium Security" };
    return { color: "danger" as const, text: "Low Security" };
  };

  const { color, text } = getColorAndText(value);

  return (
    <ModernCircularProgress
      value={value}
      size={size}
      color={color}
      className="mx-auto"
    >
      <div className="text-center">
        <div className="text-lg font-bold">{Math.round(value)}%</div>
        <div className="text-xs text-muted-foreground">{text}</div>
      </div>
    </ModernCircularProgress>
  );
}

export function ConfidenceProgress({
  value,
  size = 100,
}: {
  value: number;
  size?: number;
}) {
  const getColor = (val: number) => {
    if (val >= 80) return "success";
    if (val >= 60) return "warning";
    return "danger";
  };

  return (
    <ModernCircularProgress
      value={value}
      size={size}
      color={getColor(value) as any}
      className="mx-auto"
    >
      <div className="text-center">
        <div className="text-lg font-bold">{Math.round(value)}%</div>
        <div className="text-xs text-muted-foreground">Confidence</div>
      </div>
    </ModernCircularProgress>
  );
}

export function RiskProgress({
  value,
  size = 100,
}: {
  value: number;
  size?: number;
}) {
  // Invert the risk value for display (higher risk = lower progress)
  const displayValue = 100 - value;
  const getColor = (val: number) => {
    if (val <= 20) return "danger";
    if (val <= 40) return "warning";
    return "success";
  };

  const getRiskText = (val: number) => {
    if (val <= 20) return "High Risk";
    if (val <= 40) return "Medium Risk";
    return "Low Risk";
  };

  return (
    <ModernCircularProgress
      value={displayValue}
      size={size}
      color={getColor(value) as any}
      className="mx-auto"
    >
      <div className="text-center">
        <div className="text-lg font-bold">{Math.round(value)}%</div>
        <div className="text-xs text-muted-foreground">
          {getRiskText(value)}
        </div>
      </div>
    </ModernCircularProgress>
  );
}
