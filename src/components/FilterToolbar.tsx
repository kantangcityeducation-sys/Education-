import React from 'react';
import {
  Search,
  Filter,
  CheckSquare,
  Download,
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { AssetCondition } from '../types';

interface FilterToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  selectedDepartment: string;
  onDepartmentChange: (value: string) => void;
  departments: string[];
  selectedCondition: string;
  onConditionChange: (value: string) => void;
  anomalyOnly: boolean;
  onAnomalyOnlyToggle: () => void;
  onResetFilters: () => void;
  onOpenBatchModal: () => void;
  onExportCsv: () => void;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  selectedDepartment,
  onDepartmentChange,
  departments,
  selectedCondition,
  onConditionChange,
  anomalyOnly,
  onAnomalyOnlyToggle,
  onResetFilters,
  onOpenBatchModal,
  onExportCsv
}) => {
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
      {/* Search and Main Filters Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ค้นหาชื่อครุภัณฑ์, รหัสสินทรัพย์, รหัส อปท., สเปก/รุ่น, ยี่ห้อ..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="w-full sm:w-48">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="">ทุกประเภทสินทรัพย์</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Department Dropdown */}
        <div className="w-full sm:w-52">
          <select
            value={selectedDepartment}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="">ทุกหน่วยงานรับผิดชอบ</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Condition Filter */}
        <div className="w-full sm:w-44">
          <select
            value={selectedCondition}
            onChange={(e) => onConditionChange(e.target.value)}
            className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="">ทุกสภาพครุภัณฑ์</option>
            <option value="ยังไม่ได้ตรวจสอบ">ยังไม่ได้ตรวจสอบ</option>
            <option value="ปกติ/ใช้งานได้ดี">ปกติ / ใช้งานได้ดี</option>
            <option value="ชำรุดเล็กน้อยยังใช้ได้">ชำรุดเล็กน้อยยังใช้ได้</option>
            <option value="ชำรุดรอซ่อม">ชำรุดรอซ่อม</option>
            <option value="เสื่อมสภาพ/รอจำหน่าย">เสื่อมสภาพ / รอจำหน่าย</option>
            <option value="ไม่พบตัวครุภัณฑ์">ไม่พบตัวครุภัณฑ์</option>
          </select>
        </div>
      </div>

      {/* Secondary Actions & Quick Toggles */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Anomaly Only Toggle */}
          <button
            onClick={onAnomalyOnlyToggle}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              anomalyOnly
                ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-500/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>เฉพาะรายการผิดปกติ/เฝ้าระวัง</span>
          </button>

          {/* Reset Filters */}
          {(searchTerm || selectedCategory || selectedDepartment || selectedCondition || anomalyOnly) && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>ล้างตัวกรอง</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Batch Audit Button */}
          <button
            onClick={onOpenBatchModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="ตรวจรับรองด่วนหลายรายการพร้อมกัน"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>ตรวจรับรองกลุ่ม (Batch)</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="ดาวน์โหลดข้อมูลเป็นไฟล์ CSV (เปิดใน Excel ได้ทันที)"
          >
            <Download className="w-3.5 h-3.5 text-sky-600" />
            <span>ส่งออก CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
