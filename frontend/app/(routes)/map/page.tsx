"use client";
import { WorldMap } from "@/components/world-map";
import { useData } from "@/contexts/DataContext";
import React, { useCallback, useEffect, useMemo, useState } from "react";

interface FormationRecord {
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

const page = () => {
  const { inputData, predictionData } = useData();
  const [selectedFormation, setSelectedFormation] = useState<any>(null);
  const [focusedLocation, setFocusedLocation] = useState<
    [number, number] | null
  >(null);

  // Update globe focus when a formation is selected
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
        giip: record["GIIP (Mt)"] || 0,
        region: record.Name?.split(" ")[0] || "Unknown",
        depth: record["Depth (m)"] || 0,
        pressure: record["P (MPa)"] || 0,
        temperature: record["T (°C)"] || 0,
      }));
  }, [predictionData]);

  return (
    <div>
      <WorldMap
        formations={worldMapFormations}
        onLocationClick={setSelectedFormation}
        selectedFormation={selectedFormation}
      />
    </div>
  );
};

export default page;
