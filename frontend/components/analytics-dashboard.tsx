"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ModernCircularProgress,
  SecurityProgress,
  ConfidenceProgress,
  RiskProgress,
} from "@/components/modern-circular-progress";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Target,
  Database,
  Shield,
  Layers,
  Activity,
} from "lucide-react";

interface AnalyticsData {
  totalRecords: number;
  secureCount: number;
  positivePredicitions: number;
  negativePredicitions: number;
  successRate: number;
  averageConfidence: number;
  totalGIIP: number;
  suitableGIIP: number;
  topFormations: Array<{
    name: string;
    confidence: number;
    prediction: string;
    giip: number;
  }>;
  regionalData: Array<{
    name: string;
    total: number;
    suitable: number;
    successRate: number;
    avgGIIP: number;
    avgDepth: number;
    avgConfidence: number;
  }>;
  depthRanges: Array<{
    range: string;
    count: number;
    suitable: number;
  }>;
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const {
    totalRecords,
    secureCount,
    positivePredicitions,
    negativePredicitions,
    successRate,
    averageConfidence,
    totalGIIP,
    suitableGIIP,
    topFormations,
    regionalData,
    depthRanges,
  } = data;

  const securityPercentage =
    totalRecords > 0 ? (secureCount / totalRecords) * 100 : 0;
  const riskPercentage = 100 - averageConfidence;

  return (
    <div className="space-y-6">
      {/* Key Metrics with Circular Progress */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ModernCircularProgress
              value={successRate}
              color="primary"
              size={100}
            >
              <div className="text-center">
                <div className="text-xl font-bold text-primary">
                  {successRate.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {positivePredicitions} suitable
                </div>
              </div>
            </ModernCircularProgress>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Model Confidence
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ConfidenceProgress value={averageConfidence} size={100} />
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Security Level
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <SecurityProgress value={securityPercentage} size={100} />
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <RiskProgress value={riskPercentage} size={100} />
          </CardContent>
        </Card>
      </div>

      {/* GIIP Summary Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total GIIP</p>
                <p className="text-3xl font-bold text-green-600">
                  {(totalGIIP / 1000).toFixed(1)}Gt
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Gas Initially In Place
                </p>
              </div>
              <Database className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Suitable GIIP</p>
                <p className="text-3xl font-bold text-blue-600">
                  {(suitableGIIP / 1000).toFixed(1)}Gt
                </p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {((suitableGIIP / totalGIIP) * 100).toFixed(1)}% of total
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Formations
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  {totalRecords}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Analyzed formations
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>  */}

      {/* Top Formations Table */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Top Formations by Confidence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Formation Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Confidence</TableHead>
                <TableHead className="text-right">GIIP (Mt)</TableHead>
                <TableHead className="text-right">Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topFormations.slice(0, 10).map((formation, index) => (
                <TableRow key={formation.name} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      {formation.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        formation.prediction === "Suitable"
                          ? "default"
                          : "destructive"
                      }
                      className="text-xs"
                    >
                      {formation.prediction === "Suitable" ? (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      ) : (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {formation.prediction}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-medium">
                        {formation.confidence}%
                      </span>
                      <div className="w-12">
                        <Progress
                          value={formation.confidence}
                          className="h-2"
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formation.giip.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formation.confidence >= 80 ? (
                      <div className="flex items-center justify-end text-green-600">
                        <ArrowUp className="w-4 h-4 mr-1" />
                        <span className="text-sm">Excellent</span>
                      </div>
                    ) : formation.confidence >= 60 ? (
                      <div className="flex items-center justify-end text-yellow-600">
                        <ChevronUp className="w-4 h-4 mr-1" />
                        <span className="text-sm">Good</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end text-red-600">
                        <ArrowDown className="w-4 h-4 mr-1" />
                        <span className="text-sm">Poor</span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card> */}

      {/* Regional Analysis Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Regional Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Region</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Suitable</TableHead>
                <TableHead className="text-right">Success Rate</TableHead>
                <TableHead className="text-right">Avg GIIP (Mt)</TableHead>
                <TableHead className="text-right">Avg Depth (m)</TableHead>
                <TableHead className="text-right">Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {regionalData.slice(0, 8).map((region, index) => (
                <TableRow key={region.name} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xs font-bold">
                        {region.name.charAt(0)}
                      </div>
                      {region.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {region.total}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span>{region.suitable}</span>
                      <div className="w-16">
                        <Progress
                          value={(region.suitable / region.total) * 100}
                          className="h-2"
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        region.successRate > 50 ? "default" : "secondary"
                      }
                    >
                      {region.successRate.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {region.avgGIIP.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {region.avgDepth.toFixed(0)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm">
                        {region.avgConfidence.toFixed(1)}%
                      </span>
                      <div className="w-12">
                        <Progress
                          value={region.avgConfidence}
                          className="h-2"
                        />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Depth Analysis Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Layers className="w-5 h-5 mr-2" />
            Formation Depth Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Depth Range</TableHead>
                <TableHead className="text-right">Total Formations</TableHead>
                <TableHead className="text-right">Suitable</TableHead>
                <TableHead className="text-right">Success Rate</TableHead>
                <TableHead className="text-right">Distribution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {depthRanges.map((range, index) => {
                const successRate =
                  range.count > 0 ? (range.suitable / range.count) * 100 : 0;
                const distribution =
                  totalRecords > 0 ? (range.count / totalRecords) * 100 : 0;

                return (
                  <TableRow key={range.range} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-6 bg-gradient-to-b from-blue-500 to-blue-700 rounded-sm" />
                        {range.range}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {range.count}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-green-600 font-medium">
                          {range.suitable}
                        </span>
                        <span className="text-muted-foreground">
                          / {range.count}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={successRate > 50 ? "default" : "secondary"}
                      >
                        {successRate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-sm">
                          {distribution.toFixed(1)}%
                        </span>
                        <div className="w-16">
                          <Progress value={distribution} className="h-2" />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
