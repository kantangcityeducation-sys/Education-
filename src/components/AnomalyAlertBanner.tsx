import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';
import { AssetItem } from '../types';

interface AnomalyAlertBannerProps {
  items: AssetItem[];
  onSelectAsset: (item: AssetItem) => void;
  onFilterAnomalyOnly: () => void;
}

export const AnomalyAlertBanner: React.FC<AnomalyAlertBannerProps> = ({
  items,
  onSelectAsset,
  onFilterAnomalyOnly
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Filter items with anomalies
  const anomalyItems = items.filter(
    i => i.anomalies.length > 0 || i.anomalySeverity === 'critical' || i.anomalySeverity === 'high'
  );

  const criticalItems = items.filter(i => i.anomalySeverity === 'critical');
  const highItems = items.filter(i => i.anomalySeverity === 'high');

  if (anomalyItems.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-amber-50 via-rose-50 to-orange-50 border border-amber-200/80 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500 text-white shadow-sm">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                ระบบตรวจพบความผิดปกติและทรัพย์สินที่ต้องเฝ้าระวังพิเศษ ({anomalyItems.length} รายการ)
              </h3>
              {criticalItems.length > 0 && (
                <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                  วิกฤต {criticalItems.length} รายการ
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600">
              วิเคราะห์จากมูลค่าทรัพย์สินสูงผิดปกติ, อายุการใช้งานเกินเกณฑ์, เครื่องเล่นกลางแจ้งสาธารณะ, และอุปกรณ์ที่ขาดเลขรหัส
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onFilterAnomalyOnly}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-200/80 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
          >
            <span>กรองเฉพาะรายการที่แจ้งเตือน</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white/60 rounded-lg transition-colors cursor-pointer"
            title={isExpanded ? 'ย่อแถบแจ้งเตือน' : 'ขยายแถบแจ้งเตือน'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3.5 pt-3 border-t border-amber-200/60 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
          {anomalyItems.slice(0, 9).map(item => (
            <div
              key={item.id}
              onClick={() => onSelectAsset(item)}
              className="bg-white/90 hover:bg-white p-3 rounded-lg border border-amber-200/70 hover:border-amber-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                    ลำดับ {item.itemNo} • น.{item.pdfPage}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      item.anomalySeverity === 'critical'
                        ? 'bg-rose-100 text-rose-800'
                        : item.anomalySeverity === 'high'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.anomalySeverity === 'critical'
                      ? 'วิกฤต'
                      : item.anomalySeverity === 'high'
                      ? 'ความเสี่ยงสูง'
                      : 'เฝ้าระวัง'}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                  {item.name}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {item.subCategory} • มูลค่า {item.cost.toLocaleString()} บาท (ปี {item.acquiredYearBE})
                </p>
              </div>

              <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-start gap-1">
                <AlertCircle className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                <span className="text-[11px] text-amber-900 leading-tight line-clamp-1 font-medium">
                  {item.anomalies[0]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
