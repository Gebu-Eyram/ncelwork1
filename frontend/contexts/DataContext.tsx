"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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
}

interface DataContextType {
  inputData: DataRecord[];
  predictionData: DataRecord[];
  setInputData: (data: DataRecord[]) => void;
  setPredictionData: (data: DataRecord[]) => void;
  clearData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [inputData, setInputData] = useState<DataRecord[]>([]);
  const [predictionData, setPredictionData] = useState<DataRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedInputData = localStorage.getItem("gcs-input-data");
        const savedPredictionData = localStorage.getItem("gcs-prediction-data");

        if (savedInputData) {
          const parsedInputData = JSON.parse(savedInputData);
          setInputData(parsedInputData);
          console.log(
            "Loaded input data from localStorage:",
            parsedInputData.length,
            "records"
          );
        }

        if (savedPredictionData) {
          const parsedPredictionData = JSON.parse(savedPredictionData);
          setPredictionData(parsedPredictionData);
          console.log(
            "Loaded prediction data from localStorage:",
            parsedPredictionData.length,
            "records"
          );
        }
      } catch (error) {
        console.error("Error loading data from localStorage:", error);
      }
      setIsLoaded(true);
    }
  }, []);

  // Enhanced setInputData with localStorage persistence
  const handleSetInputData = (data: DataRecord[]) => {
    setInputData(data);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("gcs-input-data", JSON.stringify(data));
        console.log(
          "Saved input data to localStorage:",
          data.length,
          "records"
        );
      } catch (error) {
        console.error("Error saving input data to localStorage:", error);
      }
    }
  };

  // Enhanced setPredictionData with localStorage persistence
  const handleSetPredictionData = (data: DataRecord[]) => {
    setPredictionData(data);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("gcs-prediction-data", JSON.stringify(data));
        console.log(
          "Saved prediction data to localStorage:",
          data.length,
          "records"
        );
      } catch (error) {
        console.error("Error saving prediction data to localStorage:", error);
      }
    }
  };

  const clearData = () => {
    setInputData([]);
    setPredictionData([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("gcs-input-data");
      localStorage.removeItem("gcs-prediction-data");
      console.log("Cleared all data from localStorage");
    }
  };

  return (
    <DataContext.Provider
      value={{
        inputData,
        predictionData,
        setInputData: handleSetInputData,
        setPredictionData: handleSetPredictionData,
        clearData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
