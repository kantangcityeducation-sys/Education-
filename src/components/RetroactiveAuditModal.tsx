import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  User,
  MapPin,
  FileText,
  Sparkles,
  History,
  CheckCircle2,
  AlertTriangle,
  Save,
  RotateCcw,
  Camera
} from 'lucide-react';
import { AssetItem, AssetCondition, AuditRecord } from '../types';

interface RetroactiveAuditModalProps {
  item: AssetItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: AssetItem) => void;
}

export const RetroactiveAuditModal: React.FC<RetroactiveAuditModalProps> = ({
  item,
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen || !item) return null;

  const [condition, setCondition] = useState<AssetCondition>(item.condition || 'ปกติ/ใช้งานได้ดี');
  const [inspectorName, setInspectorName] = useState<string>(
    item.inspectorName || 'คณะกรรมการตรวจนับพัสดุ เทศบาลเมืองกันตัง'
  );
  const [auditedDate, setAuditedDate] = useState<string>(
    item.auditedAt || new Date().toISOString().split('T')[0]
  );
  const [location, setLocation] = useState<string>(item.currentLocation || '');
  const [notes, setNotes] = useState<string>(item.notes || '');
  const [photoUrl, setPhotoUrl] = useState<string>(item.photoUrl || '');

  // AI Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  useEffect(() => {
    if (item) {
      setCondition(item.condition === 'ยังไม่ได้ตรวจสอบ' ? 'ปกติ/ใช้งานได้ดี' : item.condition);
      setInspectorName(item.inspectorName || 'คณะกรรมการตรวจนับพัสดุ เทศบาลเมืองกันตัง');
      setAuditedDate(item.auditedAt || new Date().toISOString().split('T')[0]);
      setLocation(item.currentLocation || item.department || '');
      setNotes(item.notes || '');
      setPhotoUrl(item.photoUrl || '');
      setAiAnalysis(null);
    }
  }, [item]);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai/analyze-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item })
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setAiAnalysis(data.analysis);
      }
    } catch (err) {
      console.error('Failed to analyze item:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const timestamp = new Date().toLocaleString('th-TH');
    const newRecord: AuditRecord = {
      id: `audit-${Date.now()}`,
      timestamp,
      inspectorName,
      condition,
      location,
      notes,
      photoUrl,
      actionRequired: aiAnalysis?.recommendedAction
    };

    const updatedItem: AssetItem = {
      ...item,
      condition,
      isAudited: true,
      auditedAt: auditedDate,
      inspectorName,
      currentLocation: location,
      notes,
      photoUrl: photoUrl || item.photoUrl,
      lastModifiedAt: timestamp,
      auditHistory: [newRecord, ...(item.auditHistory || [])]
    };

    onSave(updatedItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                บันทึกการตรวจสอบ / แก้ไขข้อมูลย้อนหลัง
              </h2>
              <p className="text-xs text-slate-300">
                ลำดับที่ {item.itemNo} • รหัส {item.assetCode} (หน้า PDF ที่ {item.pdfPage})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          {/* Asset Summary Information */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                  {item.category} / {item.subCategory}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{item.name}</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">มูลค่าจัดหา</span>
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  {item.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })} บาท
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-700">รายละเอียด: </span>
              {item.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
              <div>
                <span className="text-slate-400 block">วันที่ได้มา:</span>
                <span className="font-semibold text-slate-800">{item.acquiredDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block">รหัส อปท.:</span>
                <span className="font-semibold text-slate-800">{item.localCode || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">หน่วยงานรับผิดชอบ:</span>
                <span className="font-semibold text-slate-800">{item.department}</span>
              </div>
              <div>
                <span className="text-slate-400 block">อายุการใช้งาน:</span>
                <span className="font-semibold text-slate-800">
                  {2569 - item.acquiredYearBE} ปี (พ.ศ. {item.acquiredYearBE})
                </span>
              </div>
            </div>

            {/* Existing Anomalies Alert */}
            {item.anomalies.length > 0 && (
              <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900">
                  <span className="font-bold">ระบบตรวจพบข้อสังเกตความผิดปกติ: </span>
                  <span>{item.anomalies.join(' | ')}</span>
                </div>
              </div>
            )}
          </div>

          {/* AI Inspection Assistance */}
          <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-purple-900 text-xs sm:text-sm">
                  ผู้ช่วย AI ตรวจสอบพัสดุและประเมินความเสี่ยง (Gemini 3.8 Flash)
                </span>
              </div>
              <button
                type="button"
                onClick={handleRunAiAnalysis}
                disabled={isAnalyzing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>{isAnalyzing ? 'AI กำลังวิเคราะห์...' : 'ประเมินความเสี่ยงด้วย AI'}</span>
              </button>
            </div>

            {aiAnalysis && (
              <div className="mt-3.5 pt-3 border-t border-purple-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-purple-950">
                    ระดับความเสี่ยง: <strong className="text-purple-700">{aiAnalysis.riskLevel}</strong> ({aiAnalysis.riskScore}/100 คะแนน)
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-medium">
                    {aiAnalysis.depreciationStatus}
                  </span>
                </div>

                {aiAnalysis.inspectionCheckpoints && (
                  <div>
                    <span className="font-bold text-slate-800 block mb-1">จุดตรวจสอบทางกายภาพที่แนะนำ:</span>
                    <ul className="list-disc pl-5 space-y-1 text-slate-700">
                      {aiAnalysis.inspectionCheckpoints.map((pt: string, idx: number) => (
                        <li key={idx}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiAnalysis.recommendedAction && (
                  <div className="p-2 bg-white rounded border border-purple-200 text-purple-900 font-medium">
                    <strong>คำแนะนำดำเนินการ: </strong>
                    {aiAnalysis.recommendedAction}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Inspection Form */}
          <form id="audit-form" onSubmit={handleFormSubmit} className="space-y-4">
            {/* Condition Selection Cards */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                ผลการตรวจสอบสภาพครุภัณฑ์ <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { value: 'ปกติ/ใช้งานได้ดี', desc: 'สภาพดี ใช้งานได้ตามปกติ', color: 'emerald' },
                  { value: 'ชำรุดเล็กน้อยยังใช้ได้', desc: 'มีตำหนิ แต่ยังทำงานได้', color: 'sky' },
                  { value: 'ชำรุดรอซ่อม', desc: 'ใช้งานไม่ได้ ต้องส่งซ่อมแซม', color: 'amber' },
                  { value: 'เสื่อมสภาพ/รอจำหน่าย', desc: 'ซ่อมไม่คุ้ม เสนอแทงจำหน่าย', color: 'rose' },
                  { value: 'ไม่พบตัวครุภัณฑ์', desc: 'สูญหาย หรือหาตัวไม่พบ', color: 'purple' }
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex flex-col p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      condition === opt.value
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 font-bold text-emerald-950'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold">{opt.value}</span>
                      <input
                        type="radio"
                        name="condition"
                        value={opt.value}
                        checked={condition === opt.value}
                        onChange={() => setCondition(opt.value as AssetCondition)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 font-normal">{opt.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date and Inspector (Can backdate freely!) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>วันที่ตรวจนับจริง (สามารถระบุย้อนหลังได้)</span>
                </label>
                <input
                  type="date"
                  value={auditedDate}
                  onChange={(e) => setAuditedDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>ผู้ตรวจสอบ / ตำแหน่ง</span>
                </label>
                <input
                  type="text"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  placeholder="เช่น นายสมเกียรติ มั่นคง - นวก.พัสดุชำนาญการ"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Current Physical Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>สถานที่ตั้งปัจจุบัน / อาคาร / ห้องที่ตรวจสอบพบ</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="เช่น อาคารยิมเนเซียม ชั้น 2, ห้องเรียนอนุบาล 2 ศูนย์เด็กเล็ก 2"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Notes / Action Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ข้อสังเกต / ปัญหาที่พบ / แนวทางแก้ไข (หมายเหตุ)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="บันทึกสภาพจริง เช่น มีรอยถลอกเล็กน้อยยังใช้การได้, อุปกรณ์เปิดไม่ติด แนะนำส่งซ่อม, รอนำเสนอคณะกรรมการจำหน่ายตามระเบียบ..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Camera Photo Capture Section */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>ถ่ายรูปครุภัณฑ์ (Camera Capture)</span>
                </span>
                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="text-[11px] text-rose-600 hover:text-rose-800 cursor-pointer"
                  >
                    ลบรูปถ่าย
                  </button>
                )}
              </label>

              <div className="flex items-center gap-4 flex-wrap">
                {photoUrl ? (
                  <div className="relative group w-24 h-24 rounded-xl border border-slate-300 overflow-hidden shadow-sm bg-slate-100 shrink-0">
                    <img src={photoUrl} alt="Asset Snapshot" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-slate-50 shrink-0">
                    <Camera className="w-6 h-6 mb-1 text-slate-400" />
                    <span className="text-[10px]">ยังไม่มีรูป</span>
                  </div>
                )}

                <div className="flex-1 space-y-2">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer">
                    <Camera className="w-4 h-4" />
                    <span>ถ่ายรูปครุภัณฑ์ / อัปโหลดภาพ</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoCapture}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-slate-500">
                    คลิกเพื่อเปิดกล้องบนมือถือหรือแท็บเล็ตเพื่อถ่ายภาพสภาพปัจจุบันของครุภัณฑ์ หรือเลือกไฟล์รูปภาพเพื่อบันทึกลงในประวัติการตรวจนับทันที
                  </p>
                </div>
              </div>
            </div>
          </form>

          {/* Audit Trail & History (Transparency for retroactive edits) */}
          {item.auditHistory && item.auditHistory.length > 0 && (
            <div className="pt-3 border-t border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                <History className="w-4 h-4 text-slate-500" />
                <span>ประวัติการตรวจนับและแก้ไขย้อนหลัง ({item.auditHistory.length} ครั้ง)</span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {item.auditHistory.map((hist, i) => (
                  <div
                    key={hist.id || i}
                    className="p-2 bg-slate-50 rounded-lg border border-slate-200/80 text-[11px] text-slate-600 flex justify-between items-center"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">{hist.timestamp}</span> •{' '}
                      <span className="font-medium text-emerald-800">{hist.condition}</span> •{' '}
                      <span>โดย {hist.inspectorName}</span>
                      {hist.notes && <p className="text-slate-500 mt-0.5">{hist.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>

          <button
            form="audit-form"
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกผลการตรวจสอบ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
