import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));

const DATA_DIR = path.resolve(__dirname, 'data');
const PERSISTED_FILE = path.join(DATA_DIR, 'persisted_assets.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize Gemini client (uses process.env.GEMINI_API_KEY)
const ai = new GoogleGenAI();

// API: Get current assets from server storage
app.get('/api/assets', (req, res) => {
  try {
    if (fs.existsSync(PERSISTED_FILE)) {
      const raw = fs.readFileSync(PERSISTED_FILE, 'utf-8');
      return res.json({ success: true, assets: JSON.parse(raw) });
    }
    return res.json({ success: true, assets: null });
  } catch (error: any) {
    console.error('Error reading persisted assets:', error);
    return res.status(500).json({ error: error.message });
  }
});

// API: Save assets to server storage
app.post('/api/assets/save', (req, res) => {
  try {
    const { assets } = req.body;
    if (!Array.isArray(assets)) {
      return res.status(400).json({ error: 'Assets must be an array' });
    }
    fs.writeFileSync(PERSISTED_FILE, JSON.stringify(assets, null, 2), 'utf-8');
    return res.json({ success: true, count: assets.length });
  } catch (error: any) {
    console.error('Error saving assets:', error);
    return res.status(500).json({ error: error.message });
  }
});

// API: AI Single Item Analysis & Risk Detection
app.post('/api/ai/analyze-item', async (req, res) => {
  try {
    const { item } = req.body;
    if (!item) {
      return res.status(400).json({ error: 'Item data is required' });
    }

    const prompt = `คุณคือผู้เชี่ยวชาญด้านการตรวจนับ ตรวจสอบ และบริหารจัดการทรัพย์สิน/พัสดุครุภัณฑ์ขององค์กรปกครองส่วนท้องถิ่น (อปท.) ในประเทศไทย

โปรดวิเคราะห์ข้อมูลครุภัณฑ์/สินทรัพย์ชิ้นนี้ของเทศบาลเมืองกันตัง:
- ชื่อ: ${item.name}
- รหัสในระบบ: ${item.assetCode} (${item.localCode || '-'})
- ประเภท/ชนิด: ${item.category} / ${item.subCategory}
- รายละเอียด/คุณลักษณะ: ${item.description}
- วันที่ได้มา: ${item.acquiredDate} (ปี พ.ศ. ${item.acquiredYearBE})
- มูลค่าจัดหา: ${Number(item.cost).toLocaleString()} บาท
- หน่วยงานรับผิดชอบ: ${item.department}
- สภาพที่บันทึกไว้ในปัจจุบัน: ${item.condition || 'ยังไม่ได้ตรวจสอบ'}
- ข้อสังเกตเดิม: ${(item.anomalies || []).join(', ') || 'ไม่มี'}

โปรดให้ข้อเสนอแนะในการตรวจสอบในรูปแบบ JSON ที่มีโครงสร้างดังนี้เท่านั้น (ไม่ต้องใส่ markdown code fence):
{
  "riskScore": (คะแนนความเสี่ยง 0 ถึง 100),
  "riskLevel": ("ต่ำ" หรือ "ปานกลาง" หรือ "สูง" หรือ "วิกฤต"),
  "depreciationStatus": "ประเมินอายุการใช้งานและการเสื่อมสภาพตามระเบียบพัสดุ",
  "inspectionCheckpoints": ["จุดที่ต้องตรวจสอบทางกายภาพ 3-4 ข้อ เช่น โครงสร้าง, รหัสแถบ, ระบบไฟฟ้า, สภาพพร้อมใช้"],
  "recommendedAction": "คำแนะนำการดำเนินการ เช่น ใช้งานต่อได้, ควรบำรุงรักษาเชิงป้องกัน, เสนอแทงจำหน่ายตามระเบียบ",
  "anomalyAlert": "สรุปประเด็นความผิดปกติหรือจุดเสี่ยงสำคัญใน 1-2 ประโยค"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { anomalyAlert: text };
    }

    return res.json({ success: true, analysis: parsed });
  } catch (error: any) {
    console.error('AI item analysis error:', error);
    return res.status(500).json({ error: error.message || 'AI analysis failed' });
  }
});

// API: AI Executive Audit Summary & Anomaly Report
app.post('/api/ai/audit-summary', async (req, res) => {
  try {
    const { stats, anomaliesSample, conditionBreakdown } = req.body;

    const prompt = `คุณคือหัวหน้างานพัสดุและที่ปรึกษาการตรวจสอบทรัพย์สินขององค์กรปกครองส่วนท้องถิ่น (เทศบาลเมืองกันตัง)
โปรดจัดทำ "รายงานสรุปผลการตรวจสอบพัสดุครุภัณฑ์ประจำปีงบประมาณ พ.ศ. 2569" เพื่อเสนอผู้บริหารเทศบาล
โดยใช้ข้อมูลสรุปดังต่อไปนี้:
- จำนวนทรัพย์สินทั้งหมดในระบบ: ${stats.totalCount} รายการ
- มูลค่ารวมทั้งสิ้น: ${Number(stats.totalCost).toLocaleString()} บาท
- ความคืบหน้าการตรวจสอบ: ตรวจสอบแล้ว ${stats.auditedCount} รายการ, รอดำเนินการ ${stats.pendingCount} รายการ
- สภาพครุภัณฑ์: ${JSON.stringify(conditionBreakdown)}
- จำนวนรายการที่ระบบตรวจพบความผิดปกติ/ความเสี่ยง: ${stats.anomalyCount} รายการ
- ตัวอย่างรายการผิดปกติ/มูลค่าสูง/อายุใช้งานสูง: ${JSON.stringify(anomaliesSample)}

โปรดสร้างรายงานภาษาไทยที่เป็นทางการ สละสลวย ชัดเจน และมีโครงสร้างหัวข้อดังนี้:
1. บทสรุปผู้บริหาร (Executive Summary)
2. ผลการตรวจสอบสภาพความพร้อมใช้งานและทรัพย์สินชำรุด
3. รายการความผิดปกติและความเสี่ยงสำคัญ (ทรัพย์สินมูลค่าสูง, เครื่องเล่นเด็ก, อุปกรณ์ไอทีตกรุ่น)
4. ข้อเสนอแนะเชิงนโยบาย (แผนการซ่อมบำรุง, การจำหน่ายพัสดุเสื่อมสภาพ, และการจัดทำงบประมาณทดแทนปีถัดไป)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt
    });

    return res.json({ success: true, report: response.text });
  } catch (error: any) {
    console.error('AI summary error:', error);
    return res.status(500).json({ error: error.message || 'AI summary failed' });
  }
});

// Setup Vite or static serving
const isProduction = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Asset Audit App server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
