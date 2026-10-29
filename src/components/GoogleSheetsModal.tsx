import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  X,
  Sheet,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { GoogleSheetsConfig, AssetItem } from '../types';
import { createAssetAuditSpreadsheet, updateAllRows } from '../services/googleSheets';
import { getAccessToken } from '../services/firebaseAuth';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogin: () => void;
  sheetsConfig: GoogleSheetsConfig | null;
  onUpdateConfig: (config: GoogleSheetsConfig | null) => void;
  items: AssetItem[];
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogin,
  sheetsConfig,
  onUpdateConfig,
  items
}) => {
  if (!isOpen) return null;

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [spreadsheetTitle, setSpreadsheetTitle] = useState(
    `ทะเบียนตรวจสอบครุภัณฑ์_เทศบาลเมืองกันตัง_2569`
  );
  const [customSheetId, setCustomSheetId] = useState(sheetsConfig?.spreadsheetId || '');
  const [showConfirmOverwrite, setShowConfirmOverwrite] = useState(false);

  const handleCreateNewSheet = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('กรุณาเข้าสู่ระบบ Google อีกครั้งเพื่อรับสิทธิ์เข้าถึง Google Sheets');
      }

      const result = await createAssetAuditSpreadsheet(token, spreadsheetTitle, items);
      const newConfig: GoogleSheetsConfig = {
        spreadsheetId: result.spreadsheetId,
        spreadsheetUrl: result.spreadsheetUrl,
        sheetName: 'บันทึกการตรวจสอบ',
        lastSyncedAt: new Date().toLocaleString('th-TH'),
        autoSync: true
      };

      onUpdateConfig(newConfig);
      setSuccessMessage('สร้าง Google Sheet สำเร็จและนำส่งข้อมูลครบถ้วน!');
    } catch (err: any) {
      console.error('Error creating Google Sheet:', err);
      setErrorMessage(err.message || 'ไม่สามารถสร้าง Google Sheet ได้');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncExisting = async () => {
    if (!sheetsConfig?.spreadsheetId && !customSheetId) {
      setErrorMessage('กรุณาระบุ Spreadsheet ID');
      return;
    }

    // Per Google Workspace Skill: Destructive / mutating operations MUST have explicit user confirmation!
    setShowConfirmOverwrite(true);
  };

  const executeSync = async () => {
    setShowConfirmOverwrite(false);
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('กรุณาเข้าสู่ระบบ Google อีกครั้งเพื่อรับสิทธิ์เข้าถึง Google Sheets');
      }

      const targetId = sheetsConfig?.spreadsheetId || customSheetId;
      await updateAllRows(token, targetId, 'บันทึกการตรวจสอบ', items);

      const updatedConfig: GoogleSheetsConfig = {
        spreadsheetId: targetId,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${targetId}/edit`,
        sheetName: 'บันทึกการตรวจสอบ',
        lastSyncedAt: new Date().toLocaleString('th-TH'),
        autoSync: sheetsConfig?.autoSync ?? true
      };

      onUpdateConfig(updatedConfig);
      setSuccessMessage(`ซิงค์ข้อมูล ${items.length} รายการลงใน Google Sheet เรียบร้อยแล้ว!`);
    } catch (err: any) {
      console.error('Error syncing existing sheet:', err);
      setErrorMessage(err.message || 'ไม่สามารถซิงค์ข้อมูลลงใน Google Sheet ได้');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAutoSync = () => {
    if (!sheetsConfig) return;
    onUpdateConfig({
      ...sheetsConfig,
      autoSync: !sheetsConfig.autoSync
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
              <Sheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                การเชื่อมต่อและการซิงค์ข้อมูล Google Sheets
              </h2>
              <p className="text-xs text-emerald-200">
                ซิงค์รายการครุภัณฑ์ ผลตรวจนับ และการแก้ย้อนหลังขึ้น Google Sheet ทันที
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs sm:text-sm">
          {/* User Auth Status */}
          {!user ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center space-y-3">
              <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
              <div>
                <h4 className="font-bold text-amber-900 text-sm">ยังไม่ได้เข้าสู่ระบบ Google</h4>
                <p className="text-xs text-amber-700 mt-1">
                  กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google เพื่อให้สิทธิ์แอปสร้างและอัปเดตไฟล์ Google Spreadsheet
                </p>
              </div>
              <button
                type="button"
                className="gsi-material-button mx-auto !h-10"
                onClick={onLogin}
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
                  <span className="gsi-material-button-contents">Sign in with Google</span>
                </div>
              </button>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">
                    เชื่อมต่อบัญชี: {user.displayName || user.email}
                  </span>
                  <span className="text-[11px] text-emerald-700 block">
                    พร้อมใช้งานสิทธิ์ Google Sheets และ Google Drive
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg flex items-center gap-2 text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Active Connected Spreadsheet Information */}
          {sheetsConfig?.spreadsheetUrl && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Spreadsheet ที่กำลังเชื่อมต่อ
                </span>
                <a
                  href={sheetsConfig.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded transition-colors"
                >
                  <span>เปิด Google Sheet</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <div>
                  <span className="text-slate-400">Spreadsheet ID: </span>
                  <code className="bg-white px-1.5 py-0.5 rounded border text-[11px]">
                    {sheetsConfig.spreadsheetId}
                  </code>
                </div>
                <div>
                  <span className="text-slate-400">ซิงค์ล่าสุดเมื่อ: </span>
                  <span className="font-semibold text-slate-800">
                    {sheetsConfig.lastSyncedAt || 'ยังไม่มีการซิงค์'}
                  </span>
                </div>
              </div>

              {/* Auto Sync Toggle */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 text-xs block">
                    ระบบซิงค์อัตโนมัติ (Auto-Sync)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    เมื่อมีการบันทึกตรวจนับหรือแก้ย้อนหลัง ระบบจะส่งข้อมูลไปอัปเดต Google Sheet ทันที
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleAutoSync}
                  className="cursor-pointer"
                  title="เปิด/ปิดการซิงค์อัตโนมัติ"
                >
                  {sheetsConfig.autoSync ? (
                    <ToggleRight className="w-8 h-8 text-emerald-600" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Create New Spreadsheet Form */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <h4 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>สร้าง Google Spreadsheet ใหม่ใน Google Drive</span>
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                ชื่อเอกสาร Spreadsheet
              </label>
              <input
                type="text"
                value={spreadsheetTitle}
                onChange={(e) => setSpreadsheetTitle(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleCreateNewSheet}
              disabled={isLoading || !user}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>
                {isLoading ? 'กำลังสร้างและซิงค์ข้อมูล...' : 'สร้าง Google Sheet ใหม่และซิงค์ทันที'}
              </span>
            </button>
          </div>

          {/* Connect Existing Spreadsheet ID */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <h4 className="font-bold text-slate-800 text-xs">
              หรือระบุ Spreadsheet ID ที่มีอยู่แล้ว
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="วาง Spreadsheet ID ที่ต้องการซิงค์..."
                value={customSheetId}
                onChange={(e) => setCustomSheetId(e.target.value)}
                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                onClick={handleSyncExisting}
                disabled={isLoading || !user || !customSheetId}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                ซิงค์ข้อมูล
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

        {/* Confirmation Modal for Overwriting / Mutating Sheet data (Mandatory per Skill) */}
        {showConfirmOverwrite && (
          <div className="fixed inset-0 z-60 bg-slate-900/70 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in">
              <div className="flex items-center gap-2.5 text-amber-600">
                <AlertCircle className="w-6 h-6" />
                <h3 className="text-sm font-bold text-slate-900">
                  ยืนยันการอัปเดตข้อมูลลง Google Sheet?
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                การดำเนินการนี้จะอัปเดตและเขียนทับรายการในแผ่นงาน "บันทึกการตรวจสอบ" ด้วยข้อมูลครุภัณฑ์ปัจจุบันทั้งหมดจำนวน <strong>{items.length} รายการ</strong> เพื่อให้ข้อมูลตรงกันล่าสุด คุณต้องการดำเนินการต่อหรือไม่?
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowConfirmOverwrite(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={executeSync}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm cursor-pointer"
                >
                  ยืนยันการซิงค์ข้อมูล
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
