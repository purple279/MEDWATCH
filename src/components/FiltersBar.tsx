import React from "react";
import { Medicine } from "../types";
import { Filter, RotateCcw, MapPin, Pill } from "lucide-react";

interface FiltersBarProps {
  medicines: Medicine[];
  selectedMedicineId: string | "ALL";
  onSelectMedicine: (id: string | "ALL") => void;
  districts: string[];
  selectedDistrict: string | "ALL";
  onSelectDistrict: (district: string | "ALL") => void;
  onResetFilters: () => void;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  medicines,
  selectedMedicineId,
  onSelectMedicine,
  districts,
  selectedDistrict,
  onSelectDistrict,
  onResetFilters,
}) => {
  const isFiltered = selectedMedicineId !== "ALL" || selectedDistrict !== "ALL";

  return (
    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
      {/* Medicine Filters */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 mr-1">
          <Pill className="w-3.5 h-3.5 text-slate-400" />
          <span>Medicine:</span>
        </div>
        <button
          onClick={() => onSelectMedicine("ALL")}
          className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            selectedMedicineId === "ALL"
              ? "bg-teal-600 text-white shadow-xs"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          All Medicines
        </button>
        {medicines.map((med) => {
          const isSelected = selectedMedicineId === med.medicine_id;
          return (
            <button
              key={med.medicine_id}
              onClick={() => onSelectMedicine(med.medicine_id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center space-x-1 ${
                isSelected
                  ? "bg-teal-600 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <span>{med.name.split(" ")[0]}</span>
              {med.medicine_id === "med-insulin" && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* District & Reset Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>District:</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onSelectDistrict("ALL")}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              selectedDistrict === "ALL"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            All Districts
          </button>
          {districts.map((dist) => {
            const isSelected = selectedDistrict === dist;
            return (
              <button
                key={dist}
                onClick={() => onSelectDistrict(dist)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {dist}
              </button>
            );
          })}
        </div>

        {isFiltered && (
          <button
            onClick={onResetFilters}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer ml-1"
            title="Reset filters"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
