import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User } from 'firebase/auth';
import { initialAssets, calculateAnomalies } from './data/initialAssets';
import { AssetItem, AssetCondition, SummaryStats, GoogleSheetsConfig } from './types';
import { initAuth, googleSignIn, logout, getAccessToken } from './services/firebaseAuth';
import { updateAllRows } from './services/googleSheets';
import { Header } from './components/Header';
import { DashboardKPIs } from './components/DashboardKPIs';
import { AnomalyAlertBanner } from './components/AnomalyAlertBanner';
import { FilterToolbar } from './components/FilterToolbar';
import { AssetTable } from './components/AssetTable';
import { RetroactiveAuditModal } from './components/RetroactiveAuditModal';
import { AISummaryModal } from './components/AISummaryModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { PdfViewerModal } from './components/PdfViewerModal';
import { BatchAuditModal } from './components/BatchAuditModal';

const LOCAL_STORAGE_KEY = 'kantang_assets_registry_v1';
const SHEETS_CONFIG_KEY = 'kantang_sheets_config_v1';

export default function App() {
  // 1. Core Data State
  const [assets, setAssets] = useState<AssetItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read from localStorage:', e);
    }
    return initialAssets;
  });

  // 2. Auth & Google Sheets State
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig | null>(() => {
    try {
      const saved = localStorage.getItem(SHEETS_CONFIG_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  // 3. Modals State
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<AssetItem | null>(null);
  const [isAISummaryOpen, setIsAISummaryOpen] = useState(false);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfTargetPage, setPdfTargetPage] = useState<number>(1);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  // 4. Filters & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [anomalyOnly, setAnomalyOnly] = useState(false);
  const [kpiFilter, setKpiFilter] = useState('all');

  // Persistence: Fetch from server if fresh instance or save on change
  useEffect(() => {
    // Try fetching from server storage on startup
    fetch('/api/assets')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.assets) && data.assets.length > 0) {
          // If server has more recent items, merge or use server state
          setAssets((prev) => {
            const hasLocalEdits = prev.some((i) => i.isAudited);
            return hasLocalEdits ? prev : data.assets;
          });
        }
      })
      .catch((err) => console.log('Server asset fetch note:', err));
  }, []);

  // Save changes to localStorage and server API
  const saveAssets = useCallback((newAssets: AssetItem[]) => {
    setAssets(newAssets);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newAssets));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    // Persist to server backend ("พร้อมระบบปิดแล้วข้อมูลยังอยู่")
    fetch('/api/assets/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assets: newAssets })
    }).catch((err) => console.warn('Server save warning:', err));
  }, []);

  // Auth Initialization
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser) => setUser(currentUser),
      () => setUser(null)
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setSyncToast(`เข้าสู่ระบบสำเร็จ: ${res.user.displayName || res.user.email}`);
        setTimeout(() => setSyncToast(null), 3000);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      alert(err.message || 'ไม่สามารถเข้าสู่ระบบ Google ได้');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setSyncToast('ออกจากระบบเรียบร้อย');
    setTimeout(() => setSyncToast(null), 2000);
  };

  const handleUpdateSheetsConfig = (config: GoogleSheetsConfig | null) => {
    setSheetsConfig(config);
    if (config) {
      localStorage.setItem(SHEETS_CONFIG_KEY, JSON.stringify(config));
    } else {
      localStorage.removeItem(SHEETS_CONFIG_KEY);
    }
  };

  // Google Sheets Auto-Sync or Quick Sync
  const performSheetsSync = async (itemsToSync: AssetItem[]) => {
    if (!sheetsConfig?.spreadsheetId) return;

    try {
      const token = await getAccessToken();
      if (!token) return;

      setIsSyncing(true);
      await updateAllRows(token, sheetsConfig.spreadsheetId, 'บันทึกการตรวจสอบ', itemsToSync);

      const updated = {
        ...sheetsConfig,
        lastSyncedAt: new Date().toLocaleString('th-TH')
      };
      setSheetsConfig(updated);
      localStorage.setItem(SHEETS_CONFIG_KEY, JSON.stringify(updated));

      setSyncToast('ซิงค์ข้อมูลขึ้น Google Sheets สำเร็จ');
      setTimeout(() => setSyncToast(null), 3000);
    } catch (err) {
      console.error('Auto sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handlers for Asset Updates
  const handleSaveItemAudit = (updatedItem: AssetItem) => {
    const updated = assets.map((i) => (i.id === updatedItem.id ? updatedItem : i));
    saveAssets(updated);

    setSyncToast(`บันทึกตรวจนับสำเร็จ: ${updatedItem.name.substring(0, 25)}...`);
    setTimeout(() => setSyncToast(null), 3000);

    // If autoSync enabled, trigger sheet update
    if (sheetsConfig?.autoSync && user) {
      performSheetsSync(updated);
    }
  };

  const handleQuickUpdateCondition = (item: AssetItem, condition: AssetCondition) => {
    const timestamp = new Date().toLocaleString('th-TH');
    const updatedItem: AssetItem = {
      ...item,
      condition,
      isAudited: true,
      auditedAt: new Date().toISOString().split('T')[0],
      inspectorName: user?.displayName || 'คณะกรรมการตรวจนับพัสดุ เทศบาลเมืองกันตัง',
      lastModifiedAt: timestamp,
      auditHistory: [
        {
          id: `audit-${Date.now()}`,
          timestamp,
          inspectorName: user?.displayName || 'คณะกรรมการตรวจนับพัสดุ เทศบาลเมืองกันตัง',
          condition,
          location: item.currentLocation || item.department,
          notes: 'บันทึกด่วนผ่านหน้าระบบ'
        },
        ...(item.auditHistory || [])
      ]
    };

    handleSaveItemAudit(updatedItem);
  };

  const handleBatchSave = (updatedItems: AssetItem[]) => {
    saveAssets(updatedItems);
    setSyncToast(`ตรวจรับรองกลุ่มเรียบร้อย (${updatedItems.length} รายการ)`);
    setTimeout(() => setSyncToast(null), 3000);

    if (sheetsConfig?.autoSync && user) {
      performSheetsSync(updatedItems);
    }
  };

  // Compute Categories and Departments for Dropdowns
  const categories = useMemo(() => {
    const set = new Set(assets.map((i) => i.category).filter(Boolean));
    return Array.from(set);
  }, [assets]);

  const departments = useMemo(() => {
    const set = new Set(assets.map((i) => i.department).filter(Boolean));
    return Array.from(set);
  }, [assets]);

  // Compute KPI Summary Statistics
  const stats: SummaryStats = useMemo(() => {
    let totalCost = 0;
    let auditedCount = 0;
    let goodCount = 0;
    let minorDamageCount = 0;
    let needsRepairCount = 0;
    let toDisposeCount = 0;
    let missingCount = 0;
    let anomalyCount = 0;
    let highValueCount = 0;
    let overdueLifespanCount = 0;

    assets.forEach((item) => {
      totalCost += item.cost || 0;
      if (item.isAudited) auditedCount++;

      switch (item.condition) {
        case 'ปกติ/ใช้งานได้ดี':
          goodCount++;
          break;
        case 'ชำรุดเล็กน้อยยังใช้ได้':
          minorDamageCount++;
          break;
        case 'ชำรุดรอซ่อม':
          needsRepairCount++;
          break;
        case 'เสื่อมสภาพ/รอจำหน่าย':
          toDisposeCount++;
          break;
        case 'ไม่พบตัวครุภัณฑ์':
          missingCount++;
          break;
      }

      if (item.anomalies.length > 0 || item.anomalySeverity !== 'none') {
        anomalyCount++;
      }
      if (item.cost >= 1000000) {
        highValueCount++;
      }
      if (2569 - item.acquiredYearBE >= 15) {
        overdueLifespanCount++;
      }
    });

    return {
      totalCount: assets.length,
      totalCost,
      auditedCount,
      pendingCount: assets.length - auditedCount,
      goodCount,
      minorDamageCount,
      needsRepairCount,
      toDisposeCount,
      missingCount,
      anomalyCount,
      highValueCount,
      overdueLifespanCount
    };
  }, [assets]);

  // Filter Assets
  const filteredAssets = useMemo(() => {
    return assets.filter((item) => {
      // KPI quick filter
      if (kpiFilter === 'audited' && !item.isAudited) return false;
      if (kpiFilter === 'pending' && item.isAudited) return false;
      if (kpiFilter === 'anomaly' && item.anomalies.length === 0 && item.anomalySeverity === 'none') {
        return false;
      }
      if (kpiFilter === 'good' && item.condition !== 'ปกติ/ใช้งานได้ดี') return false;
      if (kpiFilter === 'needsRepair' && item.condition !== 'ชำรุดรอซ่อม') return false;
      if (kpiFilter === 'toDispose' && item.condition !== 'เสื่อมสภาพ/รอจำหน่าย') return false;
      if (kpiFilter === 'missing' && item.condition !== 'ไม่พบตัวครุภัณฑ์') return false;

      // Anomaly only toggle
      if (anomalyOnly && item.anomalies.length === 0 && item.anomalySeverity === 'none') {
        return false;
      }

      // Dropdown filters
      if (selectedCategory && item.category !== selectedCategory) return false;
      if (selectedDepartment && item.department !== selectedDepartment) return false;
      if (selectedCondition && item.condition !== selectedCondition) return false;

      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = item.name.toLowerCase().includes(query);
        const matchCode = item.assetCode.toLowerCase().includes(query);
        const matchLocal = item.localCode.toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        const matchSub = item.subCategory.toLowerCase().includes(query);
        return matchName || matchCode || matchLocal || matchDesc || matchSub;
      }

      return true;
    });
  }, [
    assets,
    kpiFilter,
    anomalyOnly,
    selectedCategory,
    selectedDepartment,
    selectedCondition,
    searchTerm
  ]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedDepartment('');
    setSelectedCondition('');
    setAnomalyOnly(false);
    setKpiFilter('all');
  };

  const handleOpenPdfAtPage = (page: number) => {
    setPdfTargetPage(page);
    setIsPdfModalOpen(true);
  };

  const handleExportCsv = () => {
    const headers = [
      'ลำดับ',
      'หน้าPDF',
      'ประเภท',
      'ชนิด',
      'รหัสสินทรัพย์',
      'รหัสอปท',
      'ชื่อครุภัณฑ์',
      'รายละเอียด',
      'วันที่ได้มา',
      'ราคาบาท',
      'หน่วยงาน',
      'สภาพ',
      'ตรวจแล้ว',
      'ผู้ตรวจ',
      'วันที่ตรวจ',
      'สถานที่',
      'ความผิดปกติ',
      'หมายเหตุ'
    ];

    const rows = filteredAssets.map((i) => [
      i.itemNo,
      i.pdfPage,
      `"${(i.category || '').replace(/"/g, '""')}"`,
      `"${(i.subCategory || '').replace(/"/g, '""')}"`,
      `"${i.assetCode}"`,
      `"${i.localCode || ''}"`,
      `"${(i.name || '').replace(/"/g, '""')}"`,
      `"${(i.description || '').replace(/"/g, '""')}"`,
      i.acquiredDate,
      i.cost,
      `"${i.department}"`,
      `"${i.condition}"`,
      i.isAudited ? 'ใช่' : 'ไม่ใช่',
      `"${i.inspectorName || ''}"`,
      i.auditedAt || '',
      `"${i.currentLocation || ''}"`,
      `"${(i.anomalies || []).join(';')}"`,
      `"${(i.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `ทะเบียนครุภัณฑ์_เทศบาลเมืองกันตัง_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Toast Notification */}
      {syncToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs sm:text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
          {syncToast}
        </div>
      )}

      {/* Main Header */}
      <Header
        user={user}
        isLoggingIn={isLoggingIn}
        sheetsConfig={sheetsConfig}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenPdf={() => handleOpenPdfAtPage(1)}
        onOpenAISummary={() => setIsAISummaryOpen(true)}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        onQuickSync={() => performSheetsSync(assets)}
        isSyncing={isSyncing}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Dashboard */}
        <DashboardKPIs
          stats={stats}
          selectedFilter={kpiFilter}
          onSelectFilter={(k) => setKpiFilter(k)}
        />

        {/* Anomaly Alerts Banner */}
        <AnomalyAlertBanner
          items={assets}
          onSelectAsset={(item) => {
            setActiveItem(item);
            setIsAuditModalOpen(true);
          }}
          onFilterAnomalyOnly={() => setAnomalyOnly(true)}
        />

        {/* Filter and Search Bar */}
        <FilterToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={setSelectedDepartment}
          departments={departments}
          selectedCondition={selectedCondition}
          onConditionChange={setSelectedCondition}
          anomalyOnly={anomalyOnly}
          onAnomalyOnlyToggle={() => setAnomalyOnly(!anomalyOnly)}
          onResetFilters={handleResetFilters}
          onOpenBatchModal={() => setIsBatchModalOpen(true)}
          onExportCsv={handleExportCsv}
        />

        {/* Assets Master Table */}
        <AssetTable
          items={filteredAssets}
          onOpenAuditModal={(item) => {
            setActiveItem(item);
            setIsAuditModalOpen(true);
          }}
          onQuickUpdateCondition={handleQuickUpdateCondition}
          onQuickAIAnalyze={(item) => {
            setActiveItem(item);
            setIsAuditModalOpen(true);
          }}
          onOpenPdfPage={handleOpenPdfAtPage}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-slate-700">
            ระบบบันทึกและตรวจสอบครุภัณฑ์ • เทศบาลเมืองกันตัง จังหวัดตรัง
          </p>
          <p className="mt-1">
            ข้อมูลอ้างอิงจากรายงานทะเบียนข้อมูลสินทรัพย์ ปีงบประมาณ พ.ศ. 2569 (ณ วันที่ 06 ตุลาคม 2569)
            • บันทึกอัตโนมัติ ซิงค์ Google Sheets และประมวลผลด้วย AI
          </p>
        </div>
      </footer>

      {/* Modals */}
      <RetroactiveAuditModal
        isOpen={isAuditModalOpen}
        item={activeItem}
        onClose={() => {
          setIsAuditModalOpen(false);
          setActiveItem(null);
        }}
        onSave={handleSaveItemAudit}
      />

      <AISummaryModal
        isOpen={isAISummaryOpen}
        onClose={() => setIsAISummaryOpen(false)}
        stats={stats}
        items={assets}
      />

      <GoogleSheetsModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        user={user}
        onLogin={handleLogin}
        sheetsConfig={sheetsConfig}
        onUpdateConfig={handleUpdateSheetsConfig}
        items={assets}
      />

      <PdfViewerModal
        isOpen={isPdfModalOpen}
        targetPage={pdfTargetPage}
        onClose={() => setIsPdfModalOpen(false)}
      />

      <BatchAuditModal
        isOpen={isBatchModalOpen}
        items={assets}
        onClose={() => setIsBatchModalOpen(false)}
        onBatchSave={handleBatchSave}
      />
    </div>
  );
}
