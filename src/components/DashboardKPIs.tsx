import React from 'react';
import {
  Boxes,
  CheckCircle,
  AlertTriangle,
  Clock,
  Wrench,
  Archive,
  HelpCircle,
  Banknote
} from 'lucide-react';
import { SummaryStats } from '../types';

interface DashboardKPIsProps {
  stats: SummaryStats;
  selectedFilter: string;
  onSelectFilter: (filterKey: string) => void;
}

export const DashboardKPIs: React.FC<DashboardKPIsProps> = ({
  stats,
  selectedFilter,
  onSelectFilter
}) => {
  const auditPercent = stats.totalCount > 0 ? Math.round((stats.auditedCount / stats.totalCount) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Assets & Value */}
      <div
        onClick={() => onSelectFilter('all')}
        className={`bg-white rounded-xl p-5 border shadow-sm transition-all cursor-pointer hover:shadow-md ${
          selectedFilter === 'all' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            สินทรัพย์ทั้งหมดในระบบ
          </span>
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
            <Boxes className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {stats.totalCount}
          </span>
          <span className="text-xs font-medium text-slate-500">รายการ</span>
        </div>
        <div className="mt-2 text-xs text-slate-600 flex items-center gap-1 font-medium">
          <Banknote className="w-3.5 h-3.5 text-emerald-600" />
          <span>มูลค่ารวม: </span>
          <span className="font-bold text-slate-900">
            {stats.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span> บาท</span>
        </div>
      </div>

      {/* 2. Audit Progress */}
      <div
        onClick={() => onSelectFilter(stats.auditedCount > 0 ? 'audited' : 'pending')}
        className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm transition-all hover:shadow-md cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            ความคืบหน้าการตรวจสอบ
          </span>
          <div className="p-2.5 rounded-lg bg-teal-50 text-teal-600">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.auditedCount}
            </span>
            <span className="text-xs font-medium text-slate-500">/{stats.totalCount} รายการ</span>
          </div>
          <span className="text-sm font-bold text-teal-600">{auditPercent}%</span>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${auditPercent}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-slate-500 font-medium">
          <span>รอดำเนินการ: {stats.pendingCount} รายการ</span>
          <span>ตรวจแล้ว: {stats.auditedCount} รายการ</span>
        </div>
      </div>

      {/* 3. Anomalies / Critical Alerts */}
      <div
        onClick={() => onSelectFilter('anomaly')}
        className={`bg-white rounded-xl p-5 border shadow-sm transition-all cursor-pointer hover:shadow-md ${
          selectedFilter === 'anomaly' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            รายการตรวจพบความผิดปกติ
          </span>
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-amber-600 tracking-tight">
            {stats.anomalyCount}
          </span>
          <span className="text-xs font-medium text-slate-500">รายการที่ต้องเฝ้าระวัง</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1 text-[11px] text-slate-600">
          <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-medium border border-red-200">
            มูลค่าสูง {stats.highValueCount} รายการ
          </span>
          <span className="bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded font-medium border border-amber-200">
            อายุเกินเกณฑ์ {stats.overdueLifespanCount} รายการ
          </span>
        </div>
      </div>

      {/* 4. Condition Status Breakdown */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            สรุปสภาพครุภัณฑ์
          </span>
          <div className="p-2.5 rounded-lg bg-sky-50 text-sky-600">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          <button
            onClick={() => onSelectFilter('good')}
            className={`flex items-center justify-between p-1.5 rounded-lg transition-colors cursor-pointer text-left ${
              selectedFilter === 'good' ? 'bg-emerald-100/70 font-semibold' : 'hover:bg-slate-50'
            }`}
          >
            <span className="text-emerald-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              ปกติ
            </span>
            <span className="font-bold text-slate-800">{stats.goodCount}</span>
          </button>

          <button
            onClick={() => onSelectFilter('needsRepair')}
            className={`flex items-center justify-between p-1.5 rounded-lg transition-colors cursor-pointer text-left ${
              selectedFilter === 'needsRepair' ? 'bg-amber-100/70 font-semibold' : 'hover:bg-slate-50'
            }`}
          >
            <span className="text-amber-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              ชำรุดรอซ่อม
            </span>
            <span className="font-bold text-slate-800">{stats.needsRepairCount}</span>
          </button>

          <button
            onClick={() => onSelectFilter('toDispose')}
            className={`flex items-center justify-between p-1.5 rounded-lg transition-colors cursor-pointer text-left ${
              selectedFilter === 'toDispose' ? 'bg-rose-100/70 font-semibold' : 'hover:bg-slate-50'
            }`}
          >
            <span className="text-rose-700 flex items-center gap-1">
              <Archive className="w-3 h-3 text-rose-500" />
              รอแทงจำหน่าย
            </span>
            <span className="font-bold text-slate-800">{stats.toDisposeCount}</span>
          </button>

          <button
            onClick={() => onSelectFilter('missing')}
            className={`flex items-center justify-between p-1.5 rounded-lg transition-colors cursor-pointer text-left ${
              selectedFilter === 'missing' ? 'bg-purple-100/70 font-semibold' : 'hover:bg-slate-50'
            }`}
          >
            <span className="text-purple-700 flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-purple-500" />
              ไม่พบตัว
            </span>
            <span className="font-bold text-slate-800">{stats.missingCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
