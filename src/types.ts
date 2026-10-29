export type AssetCondition = 
  | 'ยังไม่ได้ตรวจสอบ'
  | 'ปกติ/ใช้งานได้ดี'
  | 'ชำรุดเล็กน้อยยังใช้ได้'
  | 'ชำรุดรอซ่อม'
  | 'เสื่อมสภาพ/รอจำหน่าย'
  | 'ไม่พบตัวครุภัณฑ์';

export type AnomalySeverity = 'none' | 'low' | 'medium' | 'high' | 'critical';

export interface AuditRecord {
  id: string;
  timestamp: string;
  inspectorName: string;
  condition: AssetCondition;
  location: string;
  notes: string;
  photoUrl?: string;
  actionRequired?: string;
}

export interface AssetItem {
  id: string;
  itemNo: number;
  pdfPage: number;
  category: string; // e.g. สินทรัพย์โครงสร้างพื้นฐาน, สิ่งปลูกสร้าง, อาคาร, ครุภัณฑ์
  subCategory: string; // e.g. ครุภัณฑ์สำนักงาน, ครุภัณฑ์กีฬา, etc.
  assetCode: string; // รหัสสินทรัพย์ในระบบ เช่น 505-680919-00028
  localCode: string; // รหัสสินทรัพย์ อปท. เช่น (493-68-0615)
  name: string; // ชื่อสินทรัพย์
  description: string; // รายละเอียด/สเปก/รุ่น/ซีเรียล
  acquiredDate: string; // วันที่ได้มา เช่น 24/12/2567
  acquiredYearBE: number; // พ.ศ. เช่น 2567
  cost: number; // ราคาสินทรัพย์ (บาท)
  department: string; // งานที่รับผิดชอบ เช่น งานสวนสาธารณะ, งานกีฬาและนันทนาการ
  
  // Audit status
  condition: AssetCondition;
  isAudited: boolean;
  auditedAt?: string;
  inspectorName?: string;
  currentLocation?: string;
  notes?: string;
  photoUrl?: string;
  
  // Anomaly & Risk detection
  anomalies: string[];
  anomalySeverity: AnomalySeverity;
  aiRiskScore?: number; // 0 - 100
  aiRecommendation?: string;
  
  // History trail for retroactive edits
  auditHistory: AuditRecord[];
  lastModifiedAt?: string;
  syncedToSheets?: boolean;
}

export interface SummaryStats {
  totalCount: number;
  totalCost: number;
  auditedCount: number;
  pendingCount: number;
  goodCount: number;
  minorDamageCount: number;
  needsRepairCount: number;
  toDisposeCount: number;
  missingCount: number;
  anomalyCount: number;
  highValueCount: number;
  overdueLifespanCount: number;
}

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  spreadsheetUrl: string;
  sheetName: string;
  lastSyncedAt?: string;
  autoSync: boolean;
}
