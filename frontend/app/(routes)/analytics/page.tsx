"use client";

import React, { useMemo, useCallback, useState, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { CircularProgress } from "@/components/circular-progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
} from "recharts";
import { WorldMap } from "@/components/world-map";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import {
  ModernCircularProgress,
  SecurityProgress,
} from "@/components/modern-circular-progress";
import {
  AnalyticsLoadingSkeleton,
  AnalyticsConnectionError,
  AnalyticsNoData,
} from "@/components/analytics-loading-skeleton";
import {
  TrendingUp,
  TrendingDown,
  Globe2,
  MapPin,
  Target,
  Activity,
  Zap,
  Database,
  BarChart3,
  PieChart as PieChartIcon,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  CheckCheck,
  AlertTriangleIcon,
  Download,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconShieldFilled } from "@tabler/icons-react";

interface DataRecord {
  "Depth (m)": number;
  "P (MPa)": number;
  "T (°C)": number;
  "CO2 Density (kg/m3)": number;
  "GIIP (Mt)": number;
  "Seal Thickness (m)": number;
  "Reservoir Thickness (m)": number;
  Fault: number;
  Stacked: number;
  Name?: string;
  Longitude?: number;
  Latitude?: number;
  Security?: number;
  prediction?: number;
  probability_0?: number;
  probability_1?: number;
  [key: string]: any;
}

export default function AnalyticsPage() {
  const { inputData, predictionData } = useData();
  const [selectedFormation, setSelectedFormation] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // CSV Download function
  const downloadCSV = useCallback((data: any[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Handle values that might contain commas or quotes
            if (
              typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Calculate comprehensive statistics
  const totalRecords = predictionData.length;
  const secureCount = predictionData.filter(
    (record) => record.Security === 1
  ).length;
  const stackedCount = predictionData.filter(
    (record) => record.Stacked === 1
  ).length;
  const positivePredicitions = predictionData.filter(
    (record) => record.prediction === 1
  ).length;
  const negativePredicitions = totalRecords - positivePredicitions;
  const highConfidencePositive = predictionData.filter(
    (record) => record.prediction === 1 && (record.probability_1 || 0) > 0.8
  ).length;
  const highConfidenceNegative = predictionData.filter(
    (record) => record.prediction === 0 && (record.probability_0 || 0) > 0.8
  ).length;

  const successRate =
    totalRecords > 0 ? (positivePredicitions / totalRecords) * 100 : 0;
  const averageConfidence =
    predictionData.length > 0
      ? (predictionData.reduce(
          (sum, record) =>
            sum +
            Math.max(record.probability_0 || 0, record.probability_1 || 0),
          0
        ) /
          predictionData.length) *
        100
      : 0;

  // Total GIIP (Gas Initially In Place)
  const totalGIIP = predictionData.reduce(
    (sum, record) => sum + (record["GIIP (Mt)"] || 0),
    0
  );
  const suitableGIIP = predictionData
    .filter((record) => record.prediction === 1)
    .reduce((sum, record) => sum + (record["GIIP (Mt)"] || 0), 0);

  // Depth analysis
  const depthRanges = [
    { range: "0-1000m", min: 0, max: 1000, count: 0, suitable: 0 },
    { range: "1000-2000m", min: 1000, max: 2000, count: 0, suitable: 0 },
    { range: "2000-3000m", min: 2000, max: 3000, count: 0, suitable: 0 },
    { range: "3000-4000m", min: 3000, max: 4000, count: 0, suitable: 0 },
    { range: "4000m+", min: 4000, max: Infinity, count: 0, suitable: 0 },
  ];

  predictionData.forEach((record) => {
    const depth = record["Depth (m)"] || 0;
    const range = depthRanges.find((r) => depth >= r.min && depth < r.max);
    if (range) {
      range.count++;
      if (record.prediction === 1) range.suitable++;
    }
  });

  // Regional analysis
  const regionalData = useMemo(() => {
    const regions = predictionData.reduce((acc: any, record) => {
      const region = record.Name?.split(" ")[0] || "Unknown";
      if (!acc[region]) {
        acc[region] = {
          name: region,
          total: 0,
          suitable: 0,
          avgDepth: 0,
          avgGIIP: 0,
          avgConfidence: 0,
          totalDepth: 0,
          totalGIIP: 0,
          totalConfidence: 0,
        };
      }
      acc[region].total += 1;
      if (record.prediction === 1) acc[region].suitable += 1;
      acc[region].totalDepth += record["Depth (m)"] || 0;
      acc[region].totalGIIP += record["GIIP (Mt)"] || 0;
      acc[region].totalConfidence += Math.max(
        record.probability_0 || 0,
        record.probability_1 || 0
      );
      return acc;
    }, {});

    // Calculate averages
    Object.values(regions).forEach((region: any) => {
      region.avgDepth = region.totalDepth / region.total;
      region.avgGIIP = region.totalGIIP / region.total;
      region.avgConfidence = (region.totalConfidence / region.total) * 100;
      region.successRate = (region.suitable / region.total) * 100;
    });

    return Object.values(regions).sort(
      (a: any, b: any) => b.totalGIIP - a.totalGIIP
    ) as Array<{
      name: string;
      total: number;
      suitable: number;
      successRate: number;
      avgGIIP: number;
      avgDepth: number;
      avgConfidence: number;
    }>;
  }, [predictionData]);

  // Prepare world map data
  const worldMapFormations = useMemo(() => {
    return predictionData
      .filter((record) => record.Latitude && record.Longitude)
      .map((record) => ({
        lat: record.Latitude!,
        lng: record.Longitude!,
        name: record.Name || "Unknown Formation",
        prediction: record.prediction || 0,
        confidence: Math.round(
          ((record.prediction === 1
            ? record.probability_1
            : record.probability_0) || 0) * 100
        ),
        giip: record["GIIP (Mt)"] || 0, // Keep as giip for WorldMap component compatibility
        capacity: record["GIIP (Mt)"] || 0, // Also provide as capacity
        region: record.Name?.split(" ")[0] || "Unknown",
        depth: record["Depth (m)"] || 0,
        pressure: record["P (MPa)"] || 0,
        temperature: record["T (°C)"] || 0,
      }));
  }, [predictionData]);

  // Performance metrics over time (simulated historical data)
  const performanceData = useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months.map((month, index) => {
      const baseAccuracy = 75 + Math.sin(index * 0.5) * 10 + Math.random() * 5;
      const discoveries = Math.floor(totalRecords / 12 + Math.random() * 20);
      return {
        month,
        accuracy: Math.round(baseAccuracy),
        discoveries,
        suitable: Math.floor(discoveries * (successRate / 100)),
        confidence: Math.round(averageConfidence + Math.random() * 10 - 5),
      };
    });
  }, [totalRecords, successRate, averageConfidence]);

  // Risk assessment data
  const riskData = [
    {
      name: "Low Risk",
      value: highConfidencePositive,
      color: "hsl(var(--primary))",
    },
    {
      name: "Medium Risk",
      value: positivePredicitions - highConfidencePositive,
      color: "hsl(var(--secondary))",
    },
    {
      name: "High Risk",
      value: negativePredicitions - highConfidenceNegative,
      color: "hsl(var(--destructive))",
    },
    {
      name: "Very High Risk",
      value: highConfidenceNegative,
      color: "hsl(var(--muted))",
    },
  ];

  // Pressure vs Temperature scatter data
  const scatterData = useMemo(() => {
    return predictionData.map((record) => ({
      pressure: record["P (MPa)"] || 0,
      temperature: record["T (°C)"] || 0,
      prediction: record.prediction,
      name: record.Name,
      confidence:
        Math.max(record.probability_0 || 0, record.probability_1 || 0) * 100,
    }));
  }, [predictionData]);

  // Chart configurations
  const chartConfig = {
    suitable: { label: "Suitable", color: "hsl(var(--primary))" },
    unsuitable: { label: "Unsuitable", color: "hsl(var(--destructive))" },
    accuracy: { label: "Accuracy", color: "hsl(var(--primary))" },
    discoveries: { label: "Discoveries", color: "hsl(var(--secondary))" },
    confidence: { label: "Confidence", color: "hsl(var(--muted-foreground))" },
    pressure: { label: "Pressure (MPa)", color: "hsl(var(--primary))" },
    temperature: { label: "Temperature (°C)", color: "hsl(var(--secondary))" },
  };

  // Feature comparison data
  const features = [
    "Depth (m)",
    "P (MPa)",
    "T (°C)",
    "CO2 Density (kg/m3)",
    "GIIP (Mt)",
    "Seal Thickness (m)",
    "Reservoir Thickness (m)",
    "Fault",
    "Stacked",
  ];

  const getAverageFeatureValues = useMemo(() => {
    if (predictionData.length === 0) return [];

    return features.map((feature) => {
      const getValue = (record: any, field: string) => record[field] || 0;

      const inputAvg =
        inputData.length > 0
          ? inputData.reduce(
              (sum, record) => sum + getValue(record, feature),
              0
            ) / inputData.length
          : 0;
      const predictionAvg =
        predictionData.reduce(
          (sum, record) => sum + getValue(record, feature),
          0
        ) / predictionData.length;

      return {
        feature: feature
          .replace(" (m)", "")
          .replace(" (°C)", "")
          .replace(" (MPa)", "")
          .replace(" (kg/m3)", "")
          .replace(" (Mt)", ""),
        input: Number(inputAvg.toFixed(2)),
        prediction: Number(predictionAvg.toFixed(2)),
      };
    });
  }, [predictionData, inputData, features]);

  const featureComparisonData = getAverageFeatureValues;

  // Chart configuration for shadcn

  // All formations by suitability and capacity combined score
  const allFormations = useMemo(() => {
    return predictionData
      .filter((record) => record.Name && record.probability_1 !== undefined)
      .map((record) => {
        // Calculate a combined score considering both suitability and capacity
        const suitabilityWeight = record.prediction === 1 ? 1 : 0; // Only suitable formations get full weight
        const confidenceScore = (record.probability_1 || 0) * suitabilityWeight;
        const capacityScore = (record["GIIP (Mt)"] || 0) / 1000; // Normalize capacity to 0-1 range approximately
        const combinedScore = confidenceScore * 0.6 + capacityScore * 0.4; // 60% confidence, 40% capacity

        return {
          rank: 0, // Will be set after sorting
          name: record.Name || "Unknown Formation",
          confidence: Math.round((record.probability_1 || 0) * 100),
          prediction: record.prediction === 1 ? "Suitable" : "Unsuitable",
          capacity: record["GIIP (Mt)"] || 0,
          depth: record["Depth (m)"] || 0,
          pressure: record["P (MPa)"] || 0,
          temperature: record["T (°C)"] || 0,
          security: record.Security === 1 ? "Secure" : "Insecure",
          stacked: record.Stacked === 1 ? "Yes" : "No",
          combinedScore,
        };
      })
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .map((record, index) => ({
        ...record,
        rank: index + 1,
      }));
  }, [predictionData]);

  // Filtered formations based on search term
  const filteredFormations = useMemo(() => {
    if (!searchTerm) return allFormations;

    return allFormations.filter(
      (formation) =>
        formation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formation.prediction.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formation.security.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allFormations, searchTerm]);

  // Top formations for display (first 5 from filtered results)
  const topFormations = useMemo(() => {
    return filteredFormations.slice(0, 4);
  }, [filteredFormations]);

  // Handle CSV download
  const handleDownloadCSV = useCallback(() => {
    const csvData = filteredFormations.map(
      ({ combinedScore, ...formation }) => ({
        Rank: formation.rank,
        "Formation Name": formation.name,
        Prediction: formation.prediction,
        "Confidence (%)": formation.confidence,
        "Capacity (Mt)": formation.capacity.toFixed(2),
        "Depth (m)": formation.depth.toFixed(1),
        "Pressure (MPa)": formation.pressure.toFixed(2),
        "Temperature (°C)": formation.temperature.toFixed(1),
        Security: formation.security,
        Stacked: formation.stacked,
      })
    );

    downloadCSV(csvData, "top-formations.csv");
  }, [filteredFormations, downloadCSV]);

  if (totalRecords === 0) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">GCS Formation Analytics</h1>
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No prediction data available yet.
            </p>
            <p className="text-muted-foreground mt-2">
              Upload and process CSV data to see analytics.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h2 className="text-xl">Analytics</h2>

        <div className="grid lg:grid-cols-6 gap-4">
          <div className="lg:col-span-4 h-full">
            <WorldMap
              formations={worldMapFormations}
              selectedFormation={selectedFormation}
            />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg">Top Formations</h2>
                <p className="text-sm text-muted-foreground">
                  Ranked by suitability and capacity potential
                </p>
              </div>
              <Button
                onClick={handleDownloadCSV}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                CSV
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search formations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {topFormations.map((formation, index) => (
                <div
                  key={formation.name}
                  className="flex justify-between items-center border-b p-3 last:border-b-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        #{formation.rank}
                      </span>
                      <span className="font-medium truncate">
                        {formation.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formation.confidence}% confidence
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formation.capacity.toFixed(1)} Mt capacity
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={
                      formation.prediction === "Suitable"
                        ? "default"
                        : "secondary"
                    }
                    className="ml-2"
                  >
                    {formation.prediction}
                  </Badge>
                </div>
              ))}
              {filteredFormations.length === 0 && searchTerm && (
                <div className="text-center py-4 text-muted-foreground">
                  No formations found matching "{searchTerm}"
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
          <div className="gap-2 grid border rounded-2xl p-2">
            <div className="flex items-center gap-2">
              <div className="p-2 border rounded-xl">
                <CheckCheck className="inline-block  text-green-600" />
              </div>
              <div className="w-full flex-1 space-y-2">
                <div className="flex justify-between items-center">
                  <p>Success rate</p>
                  <p>{successRate.toFixed(1)}%</p>
                </div>
                <Progress value={successRate} />
              </div>
            </div>
          </div>
          <div className="gap-2 grid border rounded-2xl p-2">
            <div className="flex items-center gap-2">
              <div className="p-2 border rounded-xl">
                <IconShieldFilled className="inline-block  text-sky-600" />
              </div>
              <div className="w-full flex-1 space-y-2">
                <div className="flex justify-between items-center">
                  <p>Secure</p>
                  <p>
                    {secureCount} / {totalRecords}
                  </p>
                </div>
                <Progress value={(secureCount / totalRecords) * 100} />
              </div>
            </div>
          </div>
          <div className="gap-2 grid border rounded-2xl p-2">
            <div className="flex items-center gap-2">
              <div className="p-2 border rounded-xl">
                <AlertTriangleIcon className="inline-block  text-yellow-600" />
              </div>
              <div className="w-full flex-1 space-y-2">
                <div className="flex justify-between items-center">
                  <p>Insecure</p>
                  <p>
                    {(
                      ((totalRecords - secureCount) / totalRecords) *
                      100
                    ).toFixed(1)}
                    %
                  </p>
                </div>
                <Progress
                  value={((totalRecords - secureCount) / totalRecords) * 100}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modern Analytics Dashboard */}
        <AnalyticsDashboard
          data={{
            totalRecords,
            secureCount,
            positivePredicitions,
            negativePredicitions,
            successRate,
            averageConfidence,
            totalGIIP,
            suitableGIIP,
            topFormations: topFormations.map((formation) => ({
              name: formation.name,
              confidence: formation.confidence,
              prediction: formation.prediction,
              giip: formation.capacity, // Map capacity to giip for compatibility
            })),
            regionalData,
            depthRanges,
          }}
        />

        {/* Formation Details */}
      </div>
    </div>
  );
}
