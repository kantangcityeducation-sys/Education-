import React, { useState } from 'react';
import { X, CheckSquare, Calendar, User, Save, AlertCircle } from 'lucide-react';
import { AssetItem, AssetCondition, AuditRecord } from '../types';

interface BatchAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: AssetItem[];
  onBatchSave: (updatedItems: AssetItem[]) => void;
}

export const BatchAuditModal: React.FC<BatchAuditModalProps> = ({
  isOpen,
  onClose,
  items,
  onBatchSave
}) => {
  if (!isOpen) return null;

  const [selectedCondition, setSelectedCondition] = useState<AssetCondition>('ปกติ/ใช้งานได้ดี');
  const [inspectorName, setInspectorName] = useState('คณะกรรมการตรวจนับพัสดุ เทศบาลเมืองกันตัง');
  const [auditedDate, setAuditedDate] = useState(new Date().toISOString().split('T')[0]);
  const [batchTarget, setBatchTarget] = useState<'pending' | 'all'>('pending');
  const [notes, setNotes] = useState('ตรวจสอบสภาพทางกายภาพเรียบร้อยในคราวเดียวกัน');

  const pendingItems = items.filter((i) => !i.isAudited);
  const targetCount = batchTarget === 'pending' ? pendingItems.length : items.length;

  const handleExecuteBatch = (e: React.FormEvent) => {
    e.preventDefault();

    const timestamp = new Date().toLocaleString('th-TH');
    const updated = items.map((item) => {
      if (batchTarget === 'pending' && item.isAudited) {
        return item;
      }

      const newRecord: AuditRecord = {
        id: `audit-${Date.now()}-${item.id}`,
        timestamp,
        inspectorName,
        condition: selectedCondition,
        location: item.currentLocation || item.department,
        notes
      };

      return {
        ...item,
        condition: selectedCondition,
        isAudited: true,
        auditedAt: auditedDate,
        inspectorName,
        notes,
        lastModifiedAt: timestamp,
        auditHistory: [newRecord, ...(item.auditHistory || [])]
      };
    });

    onBatchSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold">ตรวจรับรองด่วนแบบกลุ่ม (Batch Audit)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleExecuteBatch} className="p-6 space-y-4 text-xs sm:text-sm">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-emerald-950 text-xs leading-relaxed">
              ฟังก์ชันนี้ช่วยให้ตรวจรับรองพัสดุครุภัณฑ์จำนวนมากพร้อมกัน โดยยังสามารถคลิกเข้าไป<strong>แก้ไขย้อนหลังเป็นรายชิ้นได้ตลอดเวลา</strong>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              กลุ่มเป้าหมายที่ต้องการตรวจรับรอง
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label
                className={`p-3 border rounded-xl cursor-pointer transition-all ${
                  batchTarget === 'pending'
                    ? 'border-emerald-600 bg-emerald-50/70 font-bold text-emerald-900'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="batchTarget"
                  checked={batchTarget === 'pending'}
                  onChange={() => setBatchTarget('pending')}
                  className="mr-2 text-emerald-600"
                />
                <span>เฉพาะรายการที่ยังไม่ได้ตรวจ ({pendingItems.length} รายการ)</span>
              </label>

              <label
                className={`p-3 border rounded-xl cursor-pointer transition-all ${
                  batchTarget === 'all'
                    ? 'border-emerald-600 bg-emerald-50/70 font-bold text-emerald-900'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="batchTarget"
                  checked={batchTarget === 'all'}
                  onChange={() => setBatchTarget('all')}
                  className="mr-2 text-emerald-600"
                />
                <span>ทุกรายการในระบบ ({items.length} รายการ)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              กำหนดสภาพครุภัณฑ์เริ่มต้นสำหรับกลุ่มนี้
            </label>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value as AssetCondition)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="ปกติ/ใช้งานได้ดี">ปกติ / ใช้งานได้ดี</option>
              <option value="ชำรุดเล็กน้อยยังใช้ได้">ชำรุดเล็กน้อยยังใช้ได้</option>
              <option value="ชำรุดรอซ่อม">ชำรุดรอซ่อม</option>
              <option value="เสื่อมสภาพ/รอจำหน่าย">เสื่อมสภาพ / รอจำหน่าย</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>วันที่ตรวจนับ (แก้ย้อนหลังได้)</span>
              </label>
              <input
                type="date"
                value={auditedDate}
                onChange={(e) => setAuditedDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>ผู้ตรวจนับ</span>
              </label>
              <input
                type="text"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              หมายเหตุการตรวจรับรอง
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              disabled={targetCount === 0}
              className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>ตรวจรับรอง {targetCount} รายการ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
