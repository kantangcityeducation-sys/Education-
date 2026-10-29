import React, { useState } from 'react';
import {
  Edit3,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench,
  Archive,
  HelpCircle,
  Copy,
  Check,
  Eye
} from 'lucide-react';
import { AssetItem, AssetCondition } from '../types';

interface AssetTableProps {
  items: AssetItem[];
  onOpenAuditModal: (item: AssetItem) => void;
  onQuickUpdateCondition: (item: AssetItem, condition: AssetCondition) => void;
  onQuickAIAnalyze: (item: AssetItem) => void;
  onOpenPdfPage: (page: number) => void;
}

export const AssetTable: React.FC<AssetTableProps> = ({
  items,
  onOpenAuditModal,
  onQuickUpdateCondition,
  onQuickAIAnalyze,
  onOpenPdfPage
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const totalPages = Math.ceil(items.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentItems = items.slice(startIndex, startIndex + pageSize);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getConditionBadge = (condition: AssetCondition) => {
    switch (condition) {
      case 'ปกติ/ใช้งานได้ดี':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            ปกติ/ใช้งานได้ดี
          </span>
        );
      case 'ชำรุดเล็กน้อยยังใช้ได้':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
            <Wrench className="w-3 h-3 text-sky-600" />
            ชำรุดเล็กน้อยยังใช้ได้
          </span>
        );
      case 'ชำรุดรอซ่อม':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Wrench className="w-3 h-3 text-amber-600" />
            ชำรุดรอซ่อม
          </span>
        );
      case 'เสื่อมสภาพ/รอจำหน่าย':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <Archive className="w-3 h-3 text-rose-600" />
            เสื่อมสภาพ/รอจำหน่าย
          </span>
        );
      case 'ไม่พบตัวครุภัณฑ์':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <HelpCircle className="w-3 h-3 text-purple-600" />
            ไม่พบตัวครุภัณฑ์
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <Clock className="w-3 h-3 text-slate-400" />
            ยังไม่ได้ตรวจสอบ
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Header Summary */}
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">
            แสดง {startIndex + 1} - {Math.min(startIndex + pageSize, items.length)} จากทั้งหมด {items.length} รายการ
          </span>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          >
            ก่อนหน้า
          </button>
          <span className="text-slate-600 font-medium">
            หน้า {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          >
            ถัดไป
          </button>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/90 text-slate-700 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
              <th className="py-3 px-3 w-16 text-center">ลำดับ</th>
              <th className="py-3 px-3 w-48">รหัสสินทรัพย์ / อปท.</th>
              <th className="py-3 px-4 min-w-[260px]">ชื่อครุภัณฑ์ / รายละเอียด</th>
              <th className="py-3 px-3 w-28 text-right">ราคา (บาท)</th>
              <th className="py-3 px-3 w-40">หน่วยงานรับผิดชอบ</th>
              <th className="py-3 px-3 w-44">สภาพการตรวจสอบ</th>
              <th className="py-3 px-3 w-48 text-center">บันทึกด่วน / จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  ไม่พบรายการครุภัณฑ์ที่ตรงกับเงื่อนไขการค้นหา
                </td>
              </tr>
            ) : (
              currentItems.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    item.isAudited ? 'bg-emerald-50/20' : ''
                  }`}
                >
                  {/* ลำดับ & หน้า PDF */}
                  <td className="py-3.5 px-3 text-center align-top">
                    <span className="font-bold text-slate-800 text-xs">{item.itemNo}</span>
                    <button
                      onClick={() => onOpenPdfPage(item.pdfPage)}
                      className="mt-1 block mx-auto text-[10px] text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 px-1 py-0.5 rounded cursor-pointer transition-colors"
                      title="ดูในเอกสาร PDF หน้าที่ระบุ"
                    >
                      น.{item.pdfPage}
                    </button>
                  </td>

                  {/* รหัสสินทรัพย์ในระบบ & อปท. */}
                  <td className="py-3.5 px-3 align-top font-mono">
                    <div className="flex items-center gap-1 font-semibold text-slate-800">
                      <span>{item.assetCode}</span>
                      <button
                        onClick={() => copyToClipboard(item.assetCode, `code-${item.id}`)}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                        title="คัดลอกรหัส"
                      >
                        {copiedId === `code-${item.id}` ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    {item.localCode && (
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {item.localCode}
                      </span>
                    )}
                    <span className="inline-block mt-1 text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      {item.subCategory}
                    </span>
                  </td>

                  {/* ชื่อ & รายละเอียด & ข้อความแจ้งเตือน */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs">{item.name}</span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        (ได้มา: {item.acquiredDate})
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Anomaly warning tags */}
                    {item.anomalies.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.anomalies.map((ano, idx) => (
                          <span
                            key={idx}
                            className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              item.anomalySeverity === 'critical'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : item.anomalySeverity === 'high'
                                ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                            <span>{ano}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Retroactive edit note */}
                    {item.notes && (
                      <div className="mt-1.5 text-[10px] text-slate-500 bg-slate-50 p-1 rounded border border-slate-100">
                        <span className="font-semibold text-slate-700">บันทึก: </span>
                        <span>{item.notes}</span>
                        {item.inspectorName && <span> • โดย {item.inspectorName}</span>}
                      </div>
                    )}
                  </td>

                  {/* ราคาสินทรัพย์ */}
                  <td className="py-3.5 px-3 align-top text-right font-mono font-semibold text-slate-900">
                    {item.cost.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </td>

                  {/* หน่วยงานรับผิดชอบ */}
                  <td className="py-3.5 px-3 align-top text-slate-700">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                      {item.department}
                    </span>
                  </td>

                  {/* สภาพการตรวจสอบ */}
                  <td className="py-3.5 px-3 align-top">
                    {getConditionBadge(item.condition)}
                    {item.auditedAt && (
                      <div className="text-[10px] text-slate-400 mt-1">
                        ตรวจเมื่อ: {item.auditedAt}
                      </div>
                    )}
                  </td>

                  {/* การกระทำด่วน & บันทึกย้อนหลัง */}
                  <td className="py-3.5 px-3 align-top">
                    <div className="flex flex-col gap-1.5 items-center">
                      {/* Full retroactive edit modal button */}
                      <button
                        onClick={() => onOpenAuditModal(item)}
                        className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded transition-colors cursor-pointer"
                        title="บันทึกสภาพ ตรวจสอบ หรือแก้ไขย้อนหลัง"
                      >
                        <Edit3 className="w-3 h-3 text-emerald-700" />
                        <span>{item.isAudited ? 'แก้ย้อนหลัง' : 'บันทึกตรวจนับ'}</span>
                      </button>

                      {/* Quick Action buttons */}
                      <div className="flex items-center gap-1 w-full justify-between">
                        <button
                          onClick={() => onQuickUpdateCondition(item, 'ปกติ/ใช้งานได้ดี')}
                          className="flex-1 py-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded cursor-pointer"
                          title="บันทึกด่วน: ปกติ"
                        >
                          ปกติ
                        </button>
                        <button
                          onClick={() => onQuickUpdateCondition(item, 'ชำรุดรอซ่อม')}
                          className="flex-1 py-0.5 text-[10px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded cursor-pointer"
                          title="บันทึกด่วน: ชำรุดรอซ่อม"
                        >
                          รอซ่อม
                        </button>
                        <button
                          onClick={() => onQuickUpdateCondition(item, 'เสื่อมสภาพ/รอจำหน่าย')}
                          className="flex-1 py-0.5 text-[10px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded cursor-pointer"
                          title="บันทึกด่วน: เสื่อมสภาพ/รอจำหน่าย"
                        >
                          จำหน่าย
                        </button>
                      </div>

                      {/* AI Risk Analysis trigger */}
                      <button
                        onClick={() => onQuickAIAnalyze(item)}
                        className="w-full inline-flex items-center justify-center gap-1 py-0.5 text-[10px] text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded cursor-pointer"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-purple-600" />
                        <span>AI วิเคราะห์ความเสี่ยง</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between flex-wrap gap-2 text-xs">
        <span className="text-slate-500">
          เทศบาลเมืองกันตัง • ทะเบียนข้อมูลสินทรัพย์ ปีงบประมาณ 2569
        </span>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-7 h-7 rounded font-medium cursor-pointer ${
                currentPage === page
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {page}
            </button>
          ))}
          {totalPages > 7 && <span className="text-slate-400 px-1">... {totalPages}</span>}
        </div>
      </div>
    </div>
  );
};
