"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Edit,
  Trash2,
} from "lucide-react";

interface PredictionsDataTableProps {
  data: any[];
  onEdit?: (record: any, index: number) => void;
  onDelete?: (index: number) => void;
}

export default function PredictionsDataTable({
  data,
  onEdit,
  onDelete,
}: PredictionsDataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => setCurrentPage(Math.max(1, currentPage - 1));
  const goToNextPage = () =>
    setCurrentPage(Math.min(totalPages, currentPage + 1));

  // Helper function to format prediction values
  const formatValue = (value: any, column: string) => {
    if (typeof value === "number") {
      // Format numbers with appropriate decimal places
      if (
        column.toLowerCase().includes("prediction") ||
        column.toLowerCase().includes("probability") ||
        column.toLowerCase().includes("score")
      ) {
        return value.toFixed(4);
      }
      return value.toFixed(2);
    }
    return value;
  };

  // Helper function to get prediction status badge
  const getPredictionBadge = (value: any, column: string) => {
    if (
      column.toLowerCase().includes("prediction") &&
      typeof value === "number"
    ) {
      if (value > 0.7) {
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 border-green-300"
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            High
          </Badge>
        );
      } else if (value > 0.3) {
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 border-yellow-300"
          >
            <Minus className="w-3 h-3 mr-1" />
            Medium
          </Badge>
        );
      } else {
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300"
          >
            <TrendingDown className="w-3 h-3 mr-1" />
            Low
          </Badge>
        );
      }
    }
    return null;
  };

  // Helper function to determine if column is a prediction/result column
  const isPredictionColumn = (column: string) => {
    return (
      column.toLowerCase().includes("prediction") ||
      column.toLowerCase().includes("probability") ||
      column.toLowerCase().includes("score") ||
      column.toLowerCase().includes("result")
    );
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No predictions available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column}
                  className={`font-medium ${
                    isPredictionColumn(column)
                      ? "bg-purple-50 text-purple-800"
                      : ""
                  }`}
                >
                  {column}
                </TableHead>
              ))}
              {(onEdit || onDelete) && (
                <TableHead className="font-medium">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((row, rowIndex) => (
              <TableRow key={startIndex + rowIndex} className="hover:bg-muted">
                {columns.map((column) => (
                  <TableCell
                    key={column}
                    className={`${
                      isPredictionColumn(column)
                        ? "bg-purple-25 font-medium"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={
                          isPredictionColumn(column) ? "text-purple-700" : ""
                        }
                      >
                        {formatValue(row[column], column)}
                      </span>
                      {getPredictionBadge(row[column], column)}
                    </div>
                  </TableCell>
                ))}
                {(onEdit || onDelete) && (
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(row, startIndex + rowIndex)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(startIndex + rowIndex)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of{" "}
          {data.length} prediction records
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToFirstPage}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToLastPage}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
