import React, { useState } from 'react';
import { X, Sparkles, Copy, Check, Printer, RefreshCw, FileText } from 'lucide-react';
import { AssetItem, SummaryStats } from '../types';

interface AISummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: SummaryStats;
  items: AssetItem[];
}

export const AISummaryModal: React.FC<AISummaryModalProps> = ({
  isOpen,
  onClose,
  stats,
  items
}) => {
  if (!isOpen) return null;

  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateReport = async () => {
    setIsLoading(true);
    try {
      const anomaliesSample = items
        .filter((i) => i.anomalies.length > 0 || i.anomalySeverity === 'critical')
        .slice(0, 15)
        .map((i) => ({
          name: i.name,
          cost: i.cost,
          yearBE: i.acquiredYearBE,
          condition: i.condition,
          anomalies: i.anomalies
        }));

      const conditionBreakdown = {
        'ปกติ': stats.goodCount,
        'ชำรุดรอซ่อม': stats.needsRepairCount,
        'เสื่อมสภาพรอจำหน่าย': stats.toDisposeCount,
        'ไม่พบตัว': stats.missingCount,
        'ยังไม่ได้ตรวจ': stats.pendingCount
      };

      const res = await fetch('/api/ai/audit-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stats,
          anomaliesSample,
          conditionBreakdown
        })
      });

      const data = await res.json();
      if (data.success && data.report) {
        setReport(data.report);
      }
    } catch (err) {
      console.error('Failed to generate AI report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-generate on first open if no report yet
  React.useEffect(() => {
    if (isOpen && !report && !isLoading) {
      generateReport();
    }
  }, [isOpen]);

  const handleCopy = () => {
    if (!report) return;
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                รายงานสรุปผลการตรวจสอบครุภัณฑ์ด้วย AI (Gemini 3.8 Flash)
              </h2>
              <p className="text-xs text-emerald-200">
                เทศบาลเมืองกันตัง • ปีงบประมาณ พ.ศ. 2569
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 text-xs sm:text-sm leading-relaxed space-y-4">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="font-bold text-slate-800 text-base">
                กำลังวิเคราะห์และจัดทำรายงานสรุปด้วย Gemini AI...
              </p>
              <p className="text-slate-500 text-xs">
                กำลังประมวลผลข้อมูลทรัพย์สิน {stats.totalCount} รายการ, มูลค่า {stats.totalCost.toLocaleString()} บาท, และข้อสังเกตความผิดปกติ
              </p>
            </div>
          ) : report ? (
            <div className="prose prose-sm max-w-none bg-slate-50 p-6 rounded-xl border border-slate-200 whitespace-pre-wrap font-sans">
              {report}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">
              <p>ยังไม่มีรายงานสรุป คลิกปุ่มด้านล่างเพื่อประมวลผล</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={generateReport}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>สร้างรายงานใหม่</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!report}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกข้อความ'}</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={!report}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์รายงาน</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
