"use client";

import React, { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Trash2, RefreshCw, Database, Info } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { inputData, predictionData, clearData } = useData();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearAllData = async () => {
    setIsClearing(true);
    try {
      clearData();
      toast.success("All data has been cleared successfully");
    } catch (error) {
      console.error("Error clearing data:", error);
      toast.error("Failed to clear data", {
        description:
          "An error occurred while clearing the data. Please try again.",
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your application settings and data storage
          </p>
        </div>
      </div>

      <Separator />

      <div className="grid gap-6">
        {/* Data Storage Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Storage Overview
            </CardTitle>
            <CardDescription>
              Current data stored in the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Input Records</p>
                  <p className="text-2xl font-bold">{inputData.length}</p>
                </div>
                <Info className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Prediction Records</p>
                  <p className="text-2xl font-bold">{predictionData.length}</p>
                </div>
                <Info className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>Reset your stored data</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                This will remove all input data and predictions. This action
                cannot be undone.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full md:w-auto"
                    disabled={
                      inputData.length === 0 && predictionData.length === 0
                    }
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will permanently delete all your input data (
                      {inputData.length} records) and prediction data (
                      {predictionData.length} records). This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearAllData}
                      disabled={isClearing}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isClearing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Clearing...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear All Data
                        </>
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
