import React from 'react';
import { X, FileText, ExternalLink, Download, Info } from 'lucide-react';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPage?: number;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  targetPage = 1
}) => {
  if (!isOpen) return null;

  const pdfUrl = '/assets/aistudio/__________________________________________abeefd7a.pdf';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold">
                เอกสารต้นฉบับ: รายงานทะเบียนข้อมูลสินทรัพย์ เทศบาลเมืองกันตัง (50 หน้า)
              </h2>
              <p className="text-[11px] text-slate-400">
                ปีงบประมาณ พ.ศ. 2569 • ข้อมูลลงวันที่ 06 ตุลาคม 2569
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              title="เปิดดูในแท็บใหม่"
            >
              <span>เปิดแท็บใหม่</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href={pdfUrl}
              download="ทะเบียนข้อมูลสินทรัพย์_เทศบาลเมืองกันตัง_2569.pdf"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              title="ดาวน์โหลดไฟล์ PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ดาวน์โหลด</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Informational Sub-bar */}
        <div className="px-5 py-2 bg-amber-50 border-b border-amber-200/60 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              หน้าเอกสารปัจจุบันที่เลือกตรวจสอบ: <strong>หน้า {targetPage} จาก 50 หน้า</strong>
            </span>
          </div>
          <span className="text-[11px] text-amber-800 hidden sm:inline">
            คุณสามารถเลื่อนหน้าในหน้าต่างด้านล่างเพื่อเทียบข้อมูลครุภัณฑ์กับเอกสารจริงได้ทันที
          </span>
        </div>

        {/* Embedded PDF Viewer */}
        <div className="flex-1 w-full bg-slate-100 overflow-hidden relative">
          <iframe
            src={`${pdfUrl}#page=${targetPage}`}
            title="PDF Viewer"
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
};
