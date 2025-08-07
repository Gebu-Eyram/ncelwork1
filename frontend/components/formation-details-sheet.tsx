"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Thermometer,
  Gauge,
  Mountain,
  Database,
  Shield,
  Layers,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Globe,
  Zap,
} from "lucide-react";

interface FormationDetailsSheetProps {
  formation: {
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
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function FormationDetailsSheet({
  formation,
  isOpen,
  onClose,
}: FormationDetailsSheetProps) {
  if (!formation) return null;

  const getSuitabilityStatus = () => {
    if (formation.prediction === 1) {
      return {
        status: "Suitable",
        color: "text-green-600",
        icon: CheckCircle,
        bgColor: "bg-green-50 dark:bg-green-950/20",
        borderColor: "border-green-200 dark:border-green-800",
      };
    } else {
      return {
        status: "Not Suitable",
        color: "text-red-600",
        icon: XCircle,
        bgColor: "bg-red-50 dark:bg-red-950/20",
        borderColor: "border-red-200 dark:border-red-800",
      };
    }
  };

  const getConfidenceLevel = () => {
    if (formation.confidence >= 80)
      return { level: "High", color: "text-green-600" };
    if (formation.confidence >= 60)
      return { level: "Medium", color: "text-yellow-600" };
    return { level: "Low", color: "text-red-600" };
  };

  const getRiskLevel = () => {
    const riskScore = 100 - formation.confidence;
    if (riskScore <= 20)
      return { level: "Low Risk", color: "text-green-600", value: riskScore };
    if (riskScore <= 40)
      return {
        level: "Medium Risk",
        color: "text-yellow-600",
        value: riskScore,
      };
    return { level: "High Risk", color: "text-red-600", value: riskScore };
  };

  const suitability = getSuitabilityStatus();
  const confidence = getConfidenceLevel();
  const risk = getRiskLevel();
  const StatusIcon = suitability.icon;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl lg:max-w-3xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <SheetHeader className="border-b border-border pb-4 px-6 pt-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${suitability.bgColor} ${suitability.borderColor} border`}
            >
              <StatusIcon className={`w-5 h-5 ${suitability.color}`} />
            </div>
            <div>
              <SheetTitle className="text-xl font-bold">
                {formation.name}
              </SheetTitle>
              <SheetDescription className="text-sm flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4" />
                {formation.region} • {formation.lat.toFixed(4)}°,{" "}
                {formation.lng.toFixed(4)}°
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Status Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Formation Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Suitability</span>
                <Badge
                  variant={
                    formation.prediction === 1 ? "default" : "destructive"
                  }
                  className="text-sm"
                >
                  {suitability.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Confidence Level</span>
                  <span className={`font-medium ${confidence.color}`}>
                    {confidence.level} ({formation.confidence}%)
                  </span>
                </div>
                <Progress value={formation.confidence} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Risk Assessment</span>
                  <span className={`font-medium ${risk.color}`}>
                    {risk.level} ({risk.value}%)
                  </span>
                </div>
                <Progress value={100 - risk.value} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Location & Geography */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Latitude</div>
                  <div className="font-medium">{formation.lat.toFixed(6)}°</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Longitude</div>
                  <div className="font-medium">{formation.lng.toFixed(6)}°</div>
                </div>
                <div className="space-y-1 col-span-2">
                  <div className="text-sm text-muted-foreground">Region</div>
                  <div className="font-medium">{formation.region}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Geological Parameters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Mountain className="w-5 h-5" />
                Geological Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formation.depth && (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Mountain className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Depth</div>
                      <div className="font-medium">
                        {formation.depth.toLocaleString()} m
                      </div>
                    </div>
                  </div>
                )}

                {formation.pressure && (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Gauge className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Pressure
                      </div>
                      <div className="font-medium">
                        {formation.pressure.toFixed(1)} MPa
                      </div>
                    </div>
                  </div>
                )}

                {formation.temperature && (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                      <Thermometer className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Temperature
                      </div>
                      <div className="font-medium">
                        {formation.temperature.toFixed(1)}°C
                      </div>
                    </div>
                  </div>
                )}

                {formation.co2Density && (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="p-2 bg-teal-100 dark:bg-teal-900/20 rounded-lg">
                      <Database className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        CO₂ Density
                      </div>
                      <div className="font-medium">
                        {formation.co2Density.toFixed(1)} kg/m³
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reservoir Characteristics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Reservoir Characteristics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">
                  Gas Initially In Place (GIIP)
                </div>
                <div className="text-2xl font-bold text-primary">
                  {formation.giip.toFixed(1)} Mt
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formation.sealThickness && (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                      <Shield className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Seal Thickness
                      </div>
                      <div className="font-medium">
                        {formation.sealThickness.toFixed(1)} m
                      </div>
                    </div>
                  </div>
                )}

                {formation.reservoirThickness && (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                      <Layers className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Reservoir Thickness
                      </div>
                      <div className="font-medium">
                        {formation.reservoirThickness.toFixed(1)} m
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Risk Factors */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {typeof formation.fault !== "undefined" && (
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">
                      Fault Risk
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        formation.fault > 0.5
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {formation.fault > 0.5 ? "High" : "Low"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formation.fault.toFixed(2)}
                    </div>
                  </div>
                )}

                {typeof formation.stacked !== "undefined" && (
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">
                      Stacked Risk
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        formation.stacked > 0.5
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {formation.stacked > 0.5 ? "High" : "Low"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formation.stacked.toFixed(2)}
                    </div>
                  </div>
                )}

                {typeof formation.security !== "undefined" && (
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">
                      Security Level
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        formation.security > 0.5
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formation.security > 0.5 ? "High" : "Low"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formation.security.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}
