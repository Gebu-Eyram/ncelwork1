"use client";

import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import Header from "@/components/header";
import { useData } from "@/contexts/DataContext";
import {
  Brain,
  Calculator,
  Loader2,
  LucideCloudUpload,
  Download,
} from "lucide-react";
import EditableDataTable from "@/components/editable-data-table";
import ManualInputDialog from "@/components/manual-input-dialog";
import PredictionsDataTable from "@/components/predictions-data-table";
import { toast } from "sonner";

export default function CSVMLConverter() {
  const {
    inputData,
    predictionData,
    setInputData,
    setPredictionData,
    clearData,
  } = useData();
  const [csvData, setCsvData] = useState(null);
  const [jsonOutput, setJsonOutput] = useState("");
  const [fileName, setFileName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [predictions, setPredictions] = useState("");
  const [isPredicting, setIsPredicting] = useState(false);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [serverConnected, setServerConnected] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [predictionsData, setPredictionsData] = useState<any[]>([]);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [editingPredictionRecord, setEditingPredictionRecord] =
    useState<any>(null);
  const [editingPredictionIndex, setEditingPredictionIndex] =
    useState<number>(-1);

  // Sync local state with global context
  useEffect(() => {
    if (inputData.length > 0) {
      setTableData(inputData);
      setJsonOutput(JSON.stringify(inputData, null, 2));
    }
  }, [inputData]);

  useEffect(() => {
    if (predictionData.length > 0) {
      setPredictionsData(predictionData);
      setPredictions(JSON.stringify(predictionData, null, 2));
    }
  }, [predictionData]);

  // Check if Flask server is running
  useEffect(() => {
    checkServerConnection();
    const interval = setInterval(checkServerConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Helper function to clear all data
  const clearAllData = () => {
    clearData(); // Clear global context
    setTableData([]);
    setPredictionsData([]);
    setPredictions("");
    setJsonOutput("");
    setError("");
    setFileName("");
    toast.success("All data cleared successfully!");
  };

  // Helper function to update data consistently across all states
  const updateInputDataConsistently = (newData: any[]) => {
    const formattedJson = JSON.stringify(newData, null, 2);

    // Update local states
    setTableData(newData);
    setJsonOutput(formattedJson);

    // Update global context (primary source of truth)
    setInputData(newData);
  };

  // Helper function to update prediction data consistently
  const updatePredictionDataConsistently = (newPredictions: any[]) => {
    const formattedJson = JSON.stringify(newPredictions, null, 2);

    // Update local states
    setPredictionsData(newPredictions);
    setPredictions(formattedJson);

    // Update global context (primary source of truth)
    setPredictionData(newPredictions);
  };

  const checkServerConnection = async () => {
    try {
      const response = await fetch("http://localhost:5000/health");
      if (response.ok) {
        const healthInfo = await response.json();
        setServerConnected(true);

        // Also get detailed model info
        try {
          const modelResponse = await fetch("http://localhost:5000/model-info");
          if (modelResponse.ok) {
            const modelData = await modelResponse.json();
            setModelInfo(modelData);
          } else {
            setModelInfo(healthInfo);
          }
        } catch (modelErr) {
          setModelInfo(healthInfo);
        }
      }
    } catch (err) {
      setServerConnected(false);
      setModelInfo(null);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a CSV file");
      return;
    }

    // Clear all previous data from context and local state
    clearData();
    setFileName(file.name);
    setIsProcessing(true);
    setError("");
    setPredictions(""); // Clear previous predictions
    setPredictionsData([]); // Clear previous predictions data
    setTableData([]); // Clear local table data

    Papa.parse(file, {
      complete: (results) => {
        try {
          // Clean headers by trimming whitespace
          if (results.data.length > 0 && Array.isArray(results.data[0])) {
            const headers = (results.data[0] as any[]).map((header: any) =>
              typeof header === "string" ? header.trim() : header
            );
            results.data[0] = headers;
          }

          setCsvData(results.data as any);

          // Convert to JSON
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            delimitersToGuess: [",", "\t", "|", ";"],
            complete: (jsonResults) => {
              const processedData = jsonResults.data as any[];

              // Update all states consistently
              updateInputDataConsistently(processedData);
              setIsProcessing(false);

              toast.success(
                `Successfully processed ${file.name} with ${processedData.length} records`
              );
            },
            error: (parseError) => {
              setError(`Error parsing CSV: ${parseError.message}`);
              setIsProcessing(false);
            },
          });
        } catch (err: any) {
          setError(`Error processing file: ${err?.message || "Unknown error"}`);
          setIsProcessing(false);
        }
      },
      error: (parseError) => {
        setError(`Error reading file: ${parseError.message}`);
        setIsProcessing(false);
      },
    });
  };

  const makePredictions = async () => {
    // Use the most current data from global context
    const currentData = inputData.length > 0 ? inputData : tableData;

    if (currentData.length === 0) {
      setError(
        "No data to predict on. Please upload a CSV file or add data manually first."
      );
      return;
    }

    if (!serverConnected) {
      setError("Flask server not connected. Please start the Python backend.");
      return;
    }

    setIsPredicting(true);
    setError("");

    try {
      const originalData = [...currentData]; // Create a copy to avoid mutations

      // Columns to exclude from backend processing but keep for final results
      const excludedColumns = ["Latitude", "Longitude", "Name", "Security"];

      // Prepare all data for bulk prediction by removing excluded columns
      const filteredData = originalData.map((row) => {
        const filteredRow: any = {};
        Object.keys(row).forEach((key) => {
          if (
            !excludedColumns.includes(key) &&
            row[key] !== undefined &&
            row[key] !== null
          ) {
            filteredRow[key] = row[key];
          }
        });
        return filteredRow;
      });

      console.log(
        "Sending bulk prediction request for",
        filteredData.length,
        "records"
      );

      // Make prediction for all records at once
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filteredData), // Send all filtered data
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText };
        }
        throw new Error(
          errorData.error ||
            `Bulk prediction failed: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("Bulk prediction result:", result);

      // Get all predictions
      let predictions;
      if (result.predictions && Array.isArray(result.predictions)) {
        predictions = result.predictions;
      } else if (Array.isArray(result)) {
        predictions = result;
      } else {
        throw new Error("Invalid prediction response format");
      }

      if (!predictions || predictions.length !== originalData.length) {
        throw new Error(
          `Prediction count mismatch: expected ${originalData.length}, got ${
            predictions?.length || 0
          }`
        );
      }

      console.log("Processing", predictions.length, "predictions");

      // Combine predictions with original excluded columns
      const enhancedPredictions = predictions.map(
        (prediction: any, index: number) => {
          const originalRow = originalData[index];
          const enhancedRow: any = {};

          // Add back the excluded columns first (these will appear at the beginning)
          excludedColumns.forEach((col) => {
            if (originalRow[col] !== undefined) {
              enhancedRow[col] = originalRow[col];
            }
          });

          // Then add the prediction data
          Object.keys(prediction).forEach((key) => {
            enhancedRow[key] = prediction[key];
          });

          return enhancedRow;
        }
      );

      console.log("Enhanced predictions:", enhancedPredictions);

      // Update all prediction states consistently with complete results
      updatePredictionDataConsistently(enhancedPredictions);

      toast.success(
        `Successfully generated predictions for ${enhancedPredictions.length} records!`
      );
    } catch (err: any) {
      console.error("Prediction error:", err);
      setError(`Prediction error: ${err?.message || "Unknown error"}`);
      toast.error(`Prediction failed: ${err?.message || "Unknown error"}`);
    } finally {
      setIsPredicting(false);
    }
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename} successfully!`);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      toast.error("Failed to copy to clipboard");
    }
  };

  // CSV Download function for predictions
  const downloadPredictionsCSV = () => {
    if (predictionsData.length === 0) {
      toast.error("No prediction data available to download");
      return;
    }

    // Prepare CSV data with proper headers
    const headers = Object.keys(predictionsData[0]);
    const csvContent = [
      headers.join(","),
      ...predictionsData.map((row) =>
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
    link.setAttribute(
      "download",
      `predictions_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Predictions CSV downloaded successfully!");
  };

  const handleManualDataAdd = (newRecord: any) => {
    const updatedData = [...tableData, newRecord];

    // Update all states consistently
    updateInputDataConsistently(updatedData);

    if (!fileName) {
      setFileName("manual_input.csv");
    }
    toast.success("Record added successfully!");
  };

  const handleTableDataChange = (newData: any[]) => {
    // Update all states consistently
    updateInputDataConsistently(newData);
    toast.success("Data updated successfully!");
  };

  const handleEditRecord = (record: any, index: number) => {
    setEditingRecord(record);
    setEditingIndex(index);
  };

  const handleDeleteRecord = (index: number) => {
    const updatedData = tableData.filter((_, i) => i !== index);

    // Update all states consistently
    updateInputDataConsistently(updatedData);
    toast.success("Record deleted successfully!");
  };

  const handleEditComplete = (updatedRecord: any) => {
    if (editingIndex >= 0) {
      const updatedData = [...tableData];
      updatedData[editingIndex] = updatedRecord;

      // Update all states consistently
      updateInputDataConsistently(updatedData);
      toast.success("Record updated successfully!");
    }
    setEditingRecord(null);
    setEditingIndex(-1);
  };

  // Handlers for prediction data editing
  const handleEditPredictionRecord = (record: any, index: number) => {
    setEditingPredictionRecord(record);
    setEditingPredictionIndex(index);
  };

  const handleDeletePredictionRecord = (index: number) => {
    const updatedData = predictionsData.filter((_, i) => i !== index);

    // Update all states consistently
    updatePredictionDataConsistently(updatedData);
    toast.success("Prediction record deleted successfully!");
  };

  const handleEditPredictionComplete = (updatedRecord: any) => {
    if (editingPredictionIndex >= 0) {
      const updatedData = [...predictionsData];
      updatedData[editingPredictionIndex] = updatedRecord;

      // Update all states consistently
      updatePredictionDataConsistently(updatedData);
      toast.success("Prediction record updated successfully!");
    }
    setEditingPredictionRecord(null);
    setEditingPredictionIndex(-1);
  };

  const handleEditPredictionCancel = () => {
    setEditingPredictionRecord(null);
    setEditingPredictionIndex(-1);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 w-full  min-h-screen">
      <div>
        <div className="flex flex-col ">
          <div
            className={`text-xs w-fit p-1 px-2 text-white rounded-full border  ${
              serverConnected ? " bg-primary" : "bg-rose-700 "
            }`}
          >
            {serverConnected ? <p>Connected</p> : <p>Not Connected</p>}
          </div>
          <h1 className="text-xl mt-4  ">GCS Formation Screening Tool</h1>
          <p className="text-muted-foreground">
            Upload your CSV file, convert to JSON, and get ML model predictions
          </p>
        </div>

        {/* File Upload Area */}
        <div className="my-6 flex gap-4 items-center">
          <label className="flex ">
            <div className="flex text-sm border gap-2 items-center justify-center px-4 cursor-pointer py-2 rounded-full">
              {isProcessing ? <p>Processing...</p> : <p>Upload</p>}

              {isProcessing ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <LucideCloudUpload className="w-4 h-4" />
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept=".csv"
              onChange={handleFileUpload}
            />
          </label>

          <ManualInputDialog onDataAdd={handleManualDataAdd} />
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {isProcessing && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
          Processing CSV file...
        </div>
      )}

      {/* Data Table */}
      {tableData.length > 0 && (
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg  flex items-center">Input data</h2>
              <p className="text-muted-foreground text-sm">
                {tableData.length} records found
              </p>
            </div>
            <div className="flex space-x-2">
              <div className="flex justify-center pt-4">
                <button
                  onClick={makePredictions}
                  disabled={isPredicting || !serverConnected}
                  className="px-6 py-3 rounded-full border text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  {isPredicting ? "Analysing..." : "Analyse"}
                </button>
              </div>
            </div>
          </div>

          <EditableDataTable
            data={tableData}
            onDataChange={handleTableDataChange}
            onEdit={handleEditRecord}
            onDelete={handleDeleteRecord}
          />

          {/* Analyse Button */}
        </div>
      )}

      {/* Predictions Output */}
      {predictionsData.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg  flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              Predictions Results ({predictionsData.length} records)
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={downloadPredictionsCSV}
                className="px-4 py-3 rounded-full border transition-colors text-sm flex items-center hover:bg-muted"
                title="Download predictions as CSV"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </button>
              <button
                onClick={() => (window.location.href = "/analytics")}
                className="px-4 py-3 rounded-full border transition-colors text-sm flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                View Analytics
              </button>
              <button
                onClick={() => (window.location.href = "/map")}
                className="px-4 py-3 rounded-full border transition-colors text-sm flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                View Map
              </button>
            </div>
          </div>

          <PredictionsDataTable
            data={predictionsData}
            onEdit={handleEditPredictionRecord}
            onDelete={handleDeletePredictionRecord}
          />
        </div>
      )}

      {isPredicting && (
        <div className="mt-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
          Getting predictions from ML model...
        </div>
      )}

      {/* Manual Input Dialog for Editing Input Data */}
      <ManualInputDialog
        onDataAdd={handleManualDataAdd}
        editingRecord={editingRecord}
        isEditing={editingRecord !== null}
        onEditComplete={handleEditComplete}
        onEditCancel={() => setEditingRecord(null)}
        noButton={true}
      />

      {/* Manual Input Dialog for Editing Predictions */}
      <ManualInputDialog
        onDataAdd={() => {}} // Not used for prediction editing
        editingRecord={editingPredictionRecord}
        isEditing={editingPredictionRecord !== null}
        onEditComplete={handleEditPredictionComplete}
        onEditCancel={handleEditPredictionCancel}
        noButton={true}
      />
    </div>
  );
}
