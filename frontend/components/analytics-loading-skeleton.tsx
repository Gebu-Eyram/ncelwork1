"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { XCircle, Database } from "lucide-react";

export function AnalyticsLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Title Skeleton */}
        <Skeleton className="h-8 w-32" />

        {/* Connection Status Skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>

        {/* Main Grid Layout Skeleton */}
        <div className="grid lg:grid-cols-6 gap-4">
          {/* World Map Skeleton */}
          <div className="lg:col-span-4">
            <Card className="h-[500px]">
              <CardContent className="p-6 h-full">
                <div className="flex items-center justify-center h-full">
                  <div className="w-full h-full bg-muted rounded-lg animate-pulse" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Formations Skeleton */}
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Card>
              <CardContent className="p-0">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex justify-between border-b p-4"
                  >
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="p-2">
              <div className="flex items-center gap-2">
                <div className="p-2 border rounded-xl">
                  <Skeleton className="h-6 w-6" />
                </div>
                <div className="w-full flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Analytics Dashboard Skeleton */}
        <div className="space-y-6">
          {/* Charts Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-6" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Large Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tables Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <Skeleton className="h-6 w-36" />
                  <Skeleton className="h-4 w-52" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from({ length: 8 }).map((_, rowIndex) => (
                      <div key={rowIndex} className="flex justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AnalyticsConnectionError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl mb-6">Analytics</h2>

        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center p-8">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-destructive" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Connection Failed</h3>
              <p className="text-muted-foreground mb-6">
                Unable to connect to the backend server. Please ensure the
                Python backend is running and try again.
              </p>
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Retry Connection
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function AnalyticsNoData() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl mb-6">Analytics</h2>

        <div className="text-center py-12">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Database className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
          <p className="text-muted-foreground mb-6">
            No prediction data available yet. Upload and process CSV data to see
            analytics.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Upload Data
          </button>
        </div>
      </div>
    </div>
  );
}
