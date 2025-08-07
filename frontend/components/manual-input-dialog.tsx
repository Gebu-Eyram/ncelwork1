"use client";

import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Plus } from "lucide-react";
import { toast } from "sonner";

interface ManualInputDialogProps {
  onDataAdd: (newRecord: any) => void;
  editingRecord?: any;
  isEditing?: boolean;
  onEditComplete?: (updatedRecord: any) => void;
  onEditCancel?: () => void;
  noButton?: boolean; // Hide the action buttons when true
}

const fieldSchema = {
  // Primary identification fields (moved to top)
  Name: { type: "text", defaultValue: "Unnamed" },
  Longitude: { type: "number", defaultValue: 0 },
  Latitude: { type: "number", defaultValue: 0 },

  // Geological parameters
  "Depth (m)": { type: "number", defaultValue: 0 },
  "P (MPa)": { type: "number", defaultValue: 0 },
  "T (°C)": { type: "number", defaultValue: 0 },
  "CO2 Density (kg/m3)": { type: "number", defaultValue: 0 },
  "GIIP (Mt)": { type: "number", defaultValue: 0 },
  "Seal Thickness (m)": { type: "number", defaultValue: 0 },
  "Reservoir Thickness (m)": { type: "number", defaultValue: 0 },
  Fault: { type: "number", defaultValue: 0 },
  Stacked: { type: "number", defaultValue: 0 },
  Security: { type: "number", defaultValue: 0 },
};

export default function ManualInputDialog({
  onDataAdd,
  editingRecord,
  isEditing = false,
  onEditComplete,
  onEditCancel,
  noButton = false,
}: ManualInputDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(() => {
    if (isEditing && editingRecord) {
      return { ...editingRecord };
    }
    const initialData: any = {};
    Object.entries(fieldSchema).forEach(([field, config]) => {
      initialData[field] = config.defaultValue;
    });
    return initialData;
  });

  // Update form data when editing record changes
  useEffect(() => {
    if (isEditing && editingRecord) {
      setFormData({ ...editingRecord });
      setOpen(true);
    } else if (!isEditing) {
      setOpen(false);
    }
  }, [isEditing, editingRecord]);

  const handleInputChange = (field: string, value: string) => {
    const fieldConfig = fieldSchema[field as keyof typeof fieldSchema];
    let processedValue: any = value;

    if (fieldConfig.type === "number" && value !== "") {
      processedValue = Number(value);
    }

    setFormData((prev: any) => ({
      ...prev,
      [field]: processedValue,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const missingFields = Object.keys(fieldSchema).filter(
      (field) => formData[field] === "" || formData[field] == null
    );

    if (missingFields.length > 0) {
      toast.error(`Please fill in all fields: ${missingFields.join(", ")}`);
      return;
    }

    if (isEditing && onEditComplete) {
      onEditComplete(formData);
      toast.success("Record updated successfully!");
    } else {
      onDataAdd(formData);
      toast.success("Record added successfully!");
    }

    setOpen(false);

    if (!isEditing) {
      // Only reset form for new records, not when editing
      const resetData: any = {};
      Object.entries(fieldSchema).forEach(([field, config]) => {
        resetData[field] = config.defaultValue;
      });
      setFormData(resetData);
    }
  };

  const handleCancel = () => {
    if (isEditing && onEditCancel) {
      onEditCancel();
    } else {
      setOpen(false);
    }

    if (!isEditing) {
      // Reset form to default values for new records
      const resetData: any = {};
      Object.entries(fieldSchema).forEach(([field, config]) => {
        resetData[field] = config.defaultValue;
      });
      setFormData(resetData);
    }
  };

  const handleReset = () => {
    const resetData: any = {};
    Object.entries(fieldSchema).forEach(([field, config]) => {
      resetData[field] = config.defaultValue;
    });
    setFormData(resetData);
  };

  return (
    <Sheet open={open} onOpenChange={isEditing ? undefined : setOpen}>
      {!isEditing && !noButton && (
        <SheetTrigger asChild>
          <div className="flex bg-foreground text-background text-sm gap-2 items-center justify-center px-4 cursor-pointer py-2 rounded-full">
            Input manually
            <Calculator className="w-4 h-4" />
          </div>
        </SheetTrigger>
      )}
      <SheetContent
        className="w-full sm:max-w-2xl lg:max-w-3xl flex flex-col h-full"
        side="right"
      >
        {/* Fixed Header */}
        <SheetHeader className="border-b border-border pb-4 px-6 pt-6 flex-shrink-0">
          <SheetTitle className="text-lg">
            {isEditing ? "Edit Record" : "Add Data Manually"}
          </SheetTitle>
          <SheetDescription className="text-sm">
            {isEditing
              ? "Update the geological and reservoir parameters."
              : "Enter the geological and reservoir parameters for analysis."}
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto py-6 px-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Full width fields for identification */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground border-b pb-2 mb-4">
                Location & Identification
              </h3>
              <div className="space-y-4">
                {/* Name - Full width */}
                <div className="space-y-2">
                  <Label htmlFor="Name" className="text-sm font-medium">
                    Name
                  </Label>
                  <Input
                    id="Name"
                    type="text"
                    value={formData["Name"] || ""}
                    onChange={(e) => handleInputChange("Name", e.target.value)}
                    placeholder="Enter name"
                    className="w-full h-10"
                  />
                </div>

                {/* Coordinates - Two columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="Longitude" className="text-sm font-medium">
                      Longitude
                    </Label>
                    <Input
                      id="Longitude"
                      type="number"
                      value={formData["Longitude"] || ""}
                      onChange={(e) =>
                        handleInputChange("Longitude", e.target.value)
                      }
                      placeholder="Enter longitude"
                      step="any"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="Latitude" className="text-sm font-medium">
                      Latitude
                    </Label>
                    <Input
                      id="Latitude"
                      type="number"
                      value={formData["Latitude"] || ""}
                      onChange={(e) =>
                        handleInputChange("Latitude", e.target.value)
                      }
                      placeholder="Enter latitude"
                      step="any"
                      className="h-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Geological parameters */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground border-b pb-2 mb-4">
                Geological Parameters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(fieldSchema)
                  .filter(
                    ([field]) =>
                      !["Name", "Longitude", "Latitude"].includes(field)
                  )
                  .map(([field, config]) => (
                    <div key={field} className="space-y-2">
                      <Label htmlFor={field} className="text-sm font-medium">
                        {field}
                      </Label>
                      <Input
                        id={field}
                        type={config.type}
                        value={formData[field] || ""}
                        onChange={(e) =>
                          handleInputChange(field, e.target.value)
                        }
                        placeholder={`Enter ${field.toLowerCase()}`}
                        step={config.type === "number" ? "any" : undefined}
                        className="h-10"
                      />
                    </div>
                  ))}
              </div>
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <SheetFooter className="border-t border-border pt-4 pb-6 px-6 flex-shrink-0">
          <div className="flex justify-end space-x-3 w-full">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="min-w-[120px]"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isEditing ? "Update Record" : "Add Record"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
