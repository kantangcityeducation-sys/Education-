import React from 'react';
import { User } from 'firebase/auth';
import {
  FileText,
  Sparkles,
  Sheet,
  ExternalLink,
  LogOut,
  RefreshCw,
  Building2,
  CheckCircle2,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { GoogleSheetsConfig } from '../types';

interface HeaderProps {
  user: User | null;
  isLoggingIn: boolean;
  sheetsConfig: GoogleSheetsConfig | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenPdf: () => void;
  onOpenAISummary: () => void;
  onOpenSheetsModal: () => void;
  onQuickSync: () => void;
  isSyncing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  isLoggingIn,
  sheetsConfig,
  onLogin,
  onLogout,
  onOpenPdf,
  onOpenAISummary,
  onOpenSheetsModal,
  onQuickSync,
  isSyncing
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4 flex-wrap sm:flex-nowrap">
          {/* Logo & Municipal Branding */}
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  ระบบบันทึกและตรวจสอบครุภัณฑ์
                </h1>
                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  ปีงบ 2569
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                เทศบาลเมืองกันตัง • ระบบสแกนทะเบียน PDF ตรวจนับ และซิงค์ Google Sheets
              </p>
            </div>
          </div>

          {/* Action Bar & Integrations */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* View Original PDF Button */}
            <button
              onClick={onOpenPdf}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors cursor-pointer"
              title="เปิดดูไฟล์ PDF ทะเบียนสินทรัพย์ฉบับเต็ม 50 หน้า"
            >
              <FileText className="w-4 h-4 text-rose-400" />
              <span>ดูไฟล์ PDF ต้นฉบับ</span>
            </button>

            {/* AI Executive Summary Button */}
            <button
              onClick={onOpenAISummary}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-emerald-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-700/60 rounded-lg transition-all cursor-pointer shadow-sm hover:shadow-emerald-900/30"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>AI สรุปผลตรวจสอบ</span>
            </button>

            {/* Share Link Button */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('คัดลอกลิงก์แอปพลิเคชันเรียบร้อยแล้ว! คุณสามารถส่งลิงก์นี้ให้เพื่อนหรือเพื่อนร่วมงานเปิดใช้งานและกรอกข้อมูลในระบบเดียวกันได้ทันที');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-sky-300 hover:text-white bg-sky-950/60 hover:bg-sky-900/70 border border-sky-700/60 rounded-lg transition-all cursor-pointer shadow-sm"
              title="คัดลอกลิงก์เพื่อส่งให้เพื่อนร่วมงานกรอกข้อมูล"
            >
              <Share2 className="w-4 h-4 text-sky-400" />
              <span>แชร์ลิงก์ให้เพื่อน</span>
            </button>

            {/* Google Sheets Status / Button */}
            {user ? (
              <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 rounded-lg p-1.5 pl-2.5">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-slate-300 hidden md:inline truncate max-w-[130px]">
                    {user.displayName || user.email}
                  </span>
                </div>

                {sheetsConfig?.spreadsheetUrl ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={onQuickSync}
                      disabled={isSyncing}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-300 bg-emerald-900/50 hover:bg-emerald-800/60 rounded border border-emerald-600/40 cursor-pointer disabled:opacity-50"
                      title="ซิงค์ข้อมูลครุภัณฑ์ขึ้น Google Sheets"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'กำลังซิงค์...' : 'ซิงค์'}</span>
                    </button>
                    <a
                      href={sheetsConfig.spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-400 hover:text-emerald-200 bg-emerald-950/40 rounded border border-emerald-800"
                      title="เปิดดูใน Google Sheets"
                    >
                      <Sheet className="w-3.5 h-3.5 text-emerald-400" />
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <button
                    onClick={onOpenSheetsModal}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-300 bg-emerald-900/60 hover:bg-emerald-800/70 rounded border border-emerald-700/60 cursor-pointer"
                  >
                    <Sheet className="w-3.5 h-3.5" />
                    <span>สร้าง Google Sheet</span>
                  </button>
                )}

                <button
                  onClick={onLogout}
                  className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 rounded cursor-pointer"
                  title="ออกจากระบบ Google"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="gsi-material-button !h-9 text-xs"
                onClick={onLogin}
                disabled={isLoggingIn}
                title="เข้าสู่ระบบด้วย Google เพื่อซิงค์ข้อมูลขึ้น Google Sheets อัตโนมัติ"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">
                    {isLoggingIn ? 'กำลังเชื่อมต่อ...' : 'เชื่อมต่อ Google Sheets'}
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
