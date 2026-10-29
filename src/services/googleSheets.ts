import { AssetItem } from '../types';

export interface CreateSheetResponse {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

export const HEADERS = [
  'ลำดับ',
  'หน้า PDF',
  'ประเภทสินทรัพย์',
  'ชนิดสินทรัพย์',
  'รหัสสินทรัพย์ในระบบ',
  'รหัส อปท.',
  'ชื่อสินทรัพย์/ครุภัณฑ์',
  'รายละเอียด / คุณลักษณะ',
  'วันที่ได้มา',
  'ราคา (บาท)',
  'หน่วยงานรับผิดชอบ',
  'สภาพการตรวจสอบ',
  'สถานะ',
  'ผู้ตรวจสอบ',
  'วันที่ตรวจสอบ',
  'สถานที่ตั้งปัจจุบัน',
  'ความผิดปกติที่ตรวจพบ',
  'หมายเหตุ / ข้อเสนอแนะ',
  'ประวัติการแก้ไขย้อนหลัง'
];

export function mapAssetToRow(item: AssetItem): any[] {
  const auditStatusThai = item.isAudited ? 'ตรวจสอบแล้ว' : 'ยังไม่ได้ตรวจสอบ';
  const anomaliesText = item.anomalies.length > 0 ? item.anomalies.join(' | ') : 'ปกติ';
  const historyText = item.auditHistory && item.auditHistory.length > 0
    ? item.auditHistory.map(h => `[${h.timestamp}] ${h.inspectorName}: ${h.condition} (${h.notes || '-'})`).join('\n')
    : item.lastModifiedAt ? `แก้ไขล่าสุด: ${item.lastModifiedAt}` : '-';

  return [
    item.itemNo,
    item.pdfPage,
    item.category,
    item.subCategory,
    item.assetCode,
    item.localCode,
    item.name,
    item.description,
    item.acquiredDate,
    item.cost,
    item.department,
    item.condition,
    auditStatusThai,
    item.inspectorName || '-',
    item.auditedAt || '-',
    item.currentLocation || '-',
    anomaliesText,
    item.notes || '-',
    historyText
  ];
}

/**
 * Creates a brand new Google Spreadsheet in user's Google Drive with styled headers and data.
 */
export async function createAssetAuditSpreadsheet(
  accessToken: string,
  title: string,
  items: AssetItem[]
): Promise<CreateSheetResponse> {
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: title || `ทะเบียนตรวจสอบครุภัณฑ์-เทศบาลเมืองกันตัง-${new Date().toLocaleDateString('th-TH')}`
      },
      sheets: [
        {
          properties: {
            title: 'บันทึกการตรวจสอบ',
            gridProperties: {
              frozenRowCount: 1
            }
          }
        }
      ]
    })
  });

  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `ไม่สามารถสร้าง Google Sheet ได้ (${createRes.status})`);
  }

  const spreadsheet = await createRes.json();
  const spreadsheetId = spreadsheet.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Populate data
  await updateAllRows(accessToken, spreadsheetId, 'บันทึกการตรวจสอบ', items);

  // Apply header styling (green background, white bold text)
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: spreadsheet.sheets[0].properties.sheetId,
                startRowIndex: 0,
                endRowIndex: 1
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.12, green: 0.45, blue: 0.25 },
                  textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                  horizontalAlignment: 'CENTER'
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
            }
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: spreadsheet.sheets[0].properties.sheetId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: HEADERS.length
              }
            }
          }
        ]
      })
    });
  } catch (styleErr) {
    console.warn('Formatting spreadsheet headers warning:', styleErr);
  }

  return { spreadsheetId, spreadsheetUrl };
}

/**
 * Updates all rows in the spreadsheet
 */
export async function updateAllRows(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  items: AssetItem[]
): Promise<void> {
  const rows = [HEADERS, ...items.map(mapAssetToRow)];
  const range = `${sheetName || 'บันทึกการตรวจสอบ'}!A1`;

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        range,
        majorDimension: 'ROWS',
        values: rows
      })
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `ไม่สามารถอัปเดตข้อมูลลง Google Sheet ได้ (${res.status})`);
  }
}
