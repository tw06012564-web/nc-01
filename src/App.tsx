/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  PatientInfo, 
  PrescriptionItem, 
  DrugItem, 
  HistoryRecord, 
  StickerSize, 
  PatientProfile, 
  DispenseVisitRecord,
  StockTransaction,
  HospitalConfig
} from './types/sticker';
import { DEFAULT_DRUGS, HOSPITAL_CONFIG } from './data/defaultDrugs';
import { DEFAULT_PATIENTS } from './data/defaultPatients';
import { getTodayString, addMonthsToDate, formatThaiDate } from './utils/thaiDate';
import { downloadStickersPDF } from './utils/pdfExport';
import { StickerView } from './components/StickerView';
import { PrescriptionForm } from './components/PrescriptionForm';
import { PrintModal } from './components/PrintModal';
import { PrintSheet } from './components/PrintSheet';
import { DrugListModal } from './components/DrugListModal';
import { HistoryRegistry } from './components/HistoryRegistry';
import { PatientRegistryView } from './components/PatientRegistryView';
import { MedicationAdjustmentModal } from './components/MedicationAdjustmentModal';
import { PatientHistoryModal } from './components/PatientHistoryModal';
import { DrugInventoryView } from './components/DrugInventoryView';
import { SettingsView } from './components/SettingsView';
import { HospitalLogo } from './components/HospitalLogo';
import { LoginView } from './components/LoginView';
import { 
  Printer, 
  FileText, 
  Pill, 
  Eye, 
  RotateCcw, 
  Plus, 
  Sparkles, 
  Phone, 
  Calendar,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  FileDown,
  LogOut,
  User,
  Users,
  Activity,
  Loader2,
  Menu,
  X,
  Package,
  Settings
} from 'lucide-react';

export default function App() {
  // Mobile sidebar drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Authentication State - Always start with login screen before accessing the system
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string>('');

  useEffect(() => {
    // Clear any previous session so every fresh opening starts at the login screen
    try {
      sessionStorage.removeItem('nhongchim_auth');
      sessionStorage.removeItem('nhongchim_user');
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleLoginSuccess = (user: string) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    try {
      sessionStorage.setItem('nhongchim_auth', 'true');
      sessionStorage.setItem('nhongchim_user', user);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
      setIsAuthenticated(false);
      setCurrentUser('');
      try {
        sessionStorage.removeItem('nhongchim_auth');
        sessionStorage.removeItem('nhongchim_user');
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Hospital Configuration & Custom Logo (persisted in localStorage)
  const [hospitalConfig, setHospitalConfig] = useState<HospitalConfig>(() => {
    try {
      const saved = localStorage.getItem('nhongchim_hospital_config');
      return saved ? JSON.parse(saved) : HOSPITAL_CONFIG;
    } catch {
      return HOSPITAL_CONFIG;
    }
  });

  const handleSaveHospitalConfig = (newConfig: HospitalConfig) => {
    setHospitalConfig(newConfig);
    try {
      localStorage.setItem('nhongchim_hospital_config', JSON.stringify(newConfig));
    } catch (e) {
      console.error('Failed to save hospital config', e);
    }
  };

  // Navigation tabs: 'create' | 'patients' | 'registry' | 'inventory' | 'settings'
  const [activeTab, setActiveTab] = useState<'create' | 'patients' | 'registry' | 'inventory' | 'settings'>('inventory');

  // Drugs formulary & inventory (persisted in localStorage with 106 items fallback)
  const [drugs, setDrugs] = useState<DrugItem[]>(() => {
    try {
      const saved = localStorage.getItem('nhongchim_drugs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 80) {
          return parsed;
        }
      }
      return DEFAULT_DRUGS;
    } catch {
      return DEFAULT_DRUGS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('nhongchim_drugs', JSON.stringify(drugs));
    } catch (e) {
      console.error('Failed to save drugs to localStorage', e);
    }
  }, [drugs]);

  // Inventory Transactions History (รับเข้า - เบิกจ่าย - ตัดยอดคนไข้)
  const [transactions, setTransactions] = useState<StockTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('nhongchim_transactions');
      return saved ? JSON.parse(saved) : [
        {
          id: 'init-tx-1',
          drugId: 'drug-2',
          drugName: 'Amlodipine 5 mg.',
          type: 'in',
          amount: 1000,
          unit: 'เม็ด',
          balanceAfter: 1200,
          note: 'รับเข้าคลังยารายเดือน รพ.สต.หนองชิ่ม',
          date: getTodayString(),
          recordedBy: 'admin01',
          timestamp: new Date().toISOString()
        }
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('nhongchim_transactions', JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions to localStorage', e);
    }
  }, [transactions]);

  // Automatic stock deduction when medications are dispensed to a patient
  const deductStockForPatient = (patientName: string, hn: string, itemsToDeduct: PrescriptionItem[]) => {
    setDrugs(prevDrugs => {
      const newTransactions: StockTransaction[] = [];
      const updated = prevDrugs.map(drug => {
        const match = itemsToDeduct.find(it => 
          (it.drugId && it.drugId === drug.id) ||
          it.drugName.toLowerCase().trim() === drug.name.toLowerCase().trim()
        );
        if (match && match.quantity > 0) {
          const currentStock = drug.stock ?? 0;
          const newStock = Math.max(0, currentStock - match.quantity);
          newTransactions.push({
            id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            drugId: drug.id,
            drugName: drug.name,
            type: 'dispense',
            amount: match.quantity,
            unit: drug.unit,
            balanceAfter: newStock,
            patientName: patientName,
            hn: hn,
            note: `ตัดยอดจ่ายให้คนไข้: ${patientName} (HN: ${hn})`,
            date: getTodayString(),
            recordedBy: currentUser || 'admin01',
            timestamp: new Date().toISOString()
          });
          return { ...drug, stock: newStock };
        }
        return drug;
      });

      if (newTransactions.length > 0) {
        setTransactions(prev => [...newTransactions, ...prev]);
      }
      return updated;
    });
  };

  // Patients Dispensing Registry (persisted in localStorage)
  const [patients, setPatients] = useState<PatientProfile[]>(() => {
    try {
      const saved = localStorage.getItem('nhongchim_patients');
      return saved ? JSON.parse(saved) : DEFAULT_PATIENTS;
    } catch {
      return DEFAULT_PATIENTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('nhongchim_patients', JSON.stringify(patients));
    } catch (e) {
      console.error('Failed to save patients to localStorage', e);
    }
  }, [patients]);

  // History registry (persisted in localStorage)
  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem('nhongchim_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    // Default initial sample matching prompt example
    return [
      {
        id: 'hist-sample-1',
        timestamp: new Date().toISOString(),
        patient: {
          hn: '6704128',
          fullName: 'นายสมชาย ใจดี',
          age: '62',
          dispenseDate: getTodayString(),
          appointmentDate: '2024-05-15', // Prompt example: 15 พ.ค. 2567
          note: 'ความดันโลหิตสูง'
        },
        items: [
          {
            id: 'sample-item-1',
            drugId: 'drug-2',
            drugName: 'Amlodipine 5 mg.',
            category: 'ยาลดความดันโลหิต',
            quantity: 30,
            unit: 'เม็ด',
            dosage: 'ครั้งละ 1 เม็ด',
            frequency: 'วันละ 1 ครั้ง',
            mealTiming: 'after',
            mealTimingMinutes: 'หลังอาหารเช้า',
            timesPerDay: { morning: true, noon: false, evening: false, night: false },
            customInstructions: 'รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้ง หลังอาหารเช้า',
            warning: 'รับประทานยาอย่างสม่ำเสมอ ห้ามหยุดยาเอง'
          }
        ]
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('nhongchim_history', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history to localStorage', e);
    }
  }, [history]);

  // Current Patient Info for Sticker Generation
  const [patient, setPatient] = useState<PatientInfo>({
    hn: '6704128',
    fullName: 'นายสมชาย ใจดี',
    age: '62',
    dispenseDate: getTodayString(),
    appointmentDate: '2024-05-15', // Prompt example: นัดวันที่ 15 พ.ค. 2567
    note: 'คลินิกความดันโลหิตสูง'
  });

  // Current Prescription items
  const [items, setItems] = useState<PrescriptionItem[]>([
    {
      id: 'init-item-1',
      drugId: 'drug-2',
      drugName: 'Amlodipine 5 mg.',
      category: 'ยาลดความดันโลหิต',
      quantity: 30,
      unit: 'เม็ด',
      dosage: 'ครั้งละ 1 เม็ด',
      frequency: 'วันละ 1 ครั้ง',
      mealTiming: 'after',
      mealTimingMinutes: 'หลังอาหารเช้า',
      timesPerDay: { morning: true, noon: false, evening: false, night: false },
      customInstructions: 'รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้ง หลังอาหารเช้า',
      warning: 'รับประทานยาอย่างสม่ำเสมอ ห้ามหยุดยาเอง สังเกตอาการข้อเท้าบวม'
    }
  ]);

  // Preview index for side-by-side view
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);

  // Modals state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isDrugModalOpen, setIsDrugModalOpen] = useState(false);
  
  // Patient Adjustment & History Modals state
  const [selectedPatientForAdjustment, setSelectedPatientForAdjustment] = useState<PatientProfile | null>(null);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [selectedPatientForHistory, setSelectedPatientForHistory] = useState<PatientProfile | null>(null);
  const [isPatientHistoryModalOpen, setIsPatientHistoryModalOpen] = useState(false);

  // Printing state for direct browser print
  const [printableData, setPrintableData] = useState<{
    items: PrescriptionItem[];
    size: StickerSize;
    copies: number;
  }>({
    items: items,
    size: 'thermal-80x50',
    copies: 1
  });

  // If not authenticated, show login screen gate
  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} hospitalConfig={hospitalConfig} />;
  }

  const handleOpenPrintModal = () => {
    setIsPrintModalOpen(true);
  };

  const handleConfirmPrint = (
    selectedItems: PrescriptionItem[],
    size: StickerSize,
    copies: number
  ) => {
    setPrintableData({ items: selectedItems, size, copies });
    setIsPrintModalOpen(false);

    // Automatically deduct stock for this patient
    deductStockForPatient(patient.fullName, patient.hn, selectedItems);

    // Save record to history registry
    const newRecord: HistoryRecord = {
      id: 'rec-' + Date.now(),
      timestamp: new Date().toISOString(),
      patient: { ...patient },
      items: [...selectedItems]
    };
    setHistory([newRecord, ...history]);

    // Give react time to mount printable DOM, then trigger print
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleReprintRecord = (record: HistoryRecord) => {
    setPatient(record.patient);
    setItems(record.items);
    setPreviewIndex(0);
    setIsPrintModalOpen(true);
  };

  const handleLoadRecord = (record: HistoryRecord) => {
    setPatient(record.patient);
    setItems(record.items);
    setPreviewIndex(0);
    setIsPrintModalOpen(true);
  };

  const handleDownloadSinglePDF = async (item: PrescriptionItem) => {
    try {
      setIsExportingPDF(true);
      const patientCleanName = (patient.fullName || 'ผู้ป่วย').replace(/[\s/\\:]/g, '_');
      const drugClean = item.drugName.split(' ')[0];
      const filename = `สติกเกอร์_${patientCleanName}_${drugClean}_${new Date().toISOString().split('T')[0]}.pdf`;
      await downloadStickersPDF(['live-preview-sticker'], filename, 'thermal-80x50');
      // Automatically deduct stock for this patient
      deductStockForPatient(patient.fullName, patient.hn, [item]);
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาดในการสร้างไฟล์ PDF');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleDownloadRecordPDF = async (record: HistoryRecord) => {
    setPatient(record.patient);
    setItems(record.items);
    setPreviewIndex(0);
    setIsPrintModalOpen(true);
  };

  const handleAddDrugFromModal = (drug: DrugItem) => {
    const newItem: PrescriptionItem = {
      id: 'item-' + Date.now(),
      drugId: drug.id,
      drugName: drug.name,
      category: drug.category,
      quantity: drug.defaultQuantity || 30,
      unit: drug.unit || 'เม็ด',
      dosage: drug.dosage || 'ครั้งละ 1 เม็ด',
      frequency: drug.frequency || 'วันละ 1 ครั้ง',
      mealTiming: drug.mealTiming || 'after',
      mealTimingMinutes: drug.mealTimingMinutes || 'หลังอาหารเช้า',
      timesPerDay: { ...drug.timesPerDay },
      customInstructions: drug.customInstructions || 'รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้ง หลังอาหารเช้า',
      warning: drug.warning || ''
    };
    setItems([...items, newItem]);
    setPreviewIndex(items.length);
  };

  // Open medication adjustment modal
  const handleOpenAdjustment = (pat: PatientProfile) => {
    setSelectedPatientForAdjustment(pat);
    setIsAdjustmentModalOpen(true);
  };

  // Save medication adjustments for next visit
  const handleSaveMedicationAdjustment = (
    patientId: string,
    updatedPrescriptions: PrescriptionItem[],
    visitData: {
      visitDate: string;
      appointmentDate: string;
      bp?: string;
      fbs?: string;
      notes?: string;
    },
    sendToPrintImmediately: boolean = false
  ) => {
    // Only active (non-discontinued) prescriptions will become the patient's ongoing regimen
    const activeMeds = updatedPrescriptions.filter(p => p.status !== 'discontinued');

    const newVisitRecord: DispenseVisitRecord = {
      id: 'vis-' + Date.now(),
      visitDate: visitData.visitDate,
      appointmentDate: visitData.appointmentDate,
      bp: visitData.bp,
      fbs: visitData.fbs,
      items: activeMeds,
      adjustmentNotes: visitData.notes,
      recordedBy: currentUser,
      timestamp: new Date().toISOString()
    };

    const updatedPatients = patients.map(p => {
      if (p.id !== patientId) return p;
      return {
        ...p,
        currentPrescriptions: activeMeds,
        lastDispenseDate: visitData.visitDate,
        nextAppointmentDate: visitData.appointmentDate,
        notes: visitData.notes || p.notes,
        history: [newVisitRecord, ...p.history],
        updatedAt: new Date().toISOString()
      };
    });

    setPatients(updatedPatients);

    // If print immediately was requested:
    if (sendToPrintImmediately) {
      const currentPat = patients.find(p => p.id === patientId);
      if (currentPat) {
        setPatient({
          hn: currentPat.hn,
          fullName: currentPat.fullName,
          age: currentPat.age,
          phone: currentPat.phone,
          allergies: currentPat.allergies,
          dispenseDate: visitData.visitDate,
          appointmentDate: visitData.appointmentDate,
          note: visitData.notes
        });
        setItems(activeMeds.map(m => ({ ...m })));
        setPreviewIndex(0);
        setIsPrintModalOpen(true);
      }
    }
  };

  // Load patient's current medications into sticker generator & open print modal
  const handlePrintPatientStickers = (pat: PatientProfile) => {
    setPatient({
      hn: pat.hn,
      fullName: pat.fullName,
      age: pat.age,
      phone: pat.phone,
      allergies: pat.allergies,
      dispenseDate: getTodayString(),
      appointmentDate: pat.nextAppointmentDate || addMonthsToDate(getTodayString(), 1),
      note: pat.notes
    });
    setItems(pat.currentPrescriptions.map(m => ({ ...m })));
    setPreviewIndex(0);
    setIsPrintModalOpen(true);
  };

  // View patient history timeline
  const handleViewPatientHistory = (pat: PatientProfile) => {
    setSelectedPatientForHistory(pat);
    setIsPatientHistoryModalOpen(true);
  };

  // Print from past visit
  const handlePrintVisit = (pat: PatientProfile, visit: DispenseVisitRecord) => {
    setPatient({
      hn: pat.hn,
      fullName: pat.fullName,
      age: pat.age,
      phone: pat.phone,
      allergies: pat.allergies,
      dispenseDate: visit.visitDate,
      appointmentDate: visit.appointmentDate,
      note: visit.adjustmentNotes
    });
    setItems(visit.items.map(m => ({ ...m })));
    setPreviewIndex(0);
    setIsPatientHistoryModalOpen(false);
    setIsPrintModalOpen(true);
  };

  const currentPreviewItem = items[previewIndex] || items[0];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row font-['Sarabun',sans-serif]">
      {/* Hidden container mounted specifically for window.print() */}
      <PrintSheet
        patient={patient}
        items={printableData.items}
        stickerSize={printableData.size}
        copies={printableData.copies}
        hospitalConfig={hospitalConfig}
      />

      {/* Mobile Top Header (Visible only on small screens) */}
      <div className="lg:hidden bg-slate-950 text-white p-3.5 border-b border-slate-800 flex items-center justify-between no-print z-40 sticky top-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <HospitalLogo config={hospitalConfig} size="sm" variant="rounded" />
          <div className="min-w-0">
            <h1 className="font-bold text-sm text-white truncate leading-tight">
              {hospitalConfig.name}
            </h1>
            <p className="text-[10px] text-emerald-400 font-medium">
              ระบบสติกเกอร์ยา & ทะเบียนคนไข้
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:text-white cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for mobile drawer */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 no-print"
        />
      )}

      {/* Vertical Sidebar (Dark Theme - เน้นโทนสีเข้ม) */}
      <aside
        className={`fixed lg:sticky top-0 left-0 bottom-0 z-50 lg:z-30 w-72 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white border-r border-slate-800 flex flex-col justify-between h-screen overflow-y-auto no-print transition-transform duration-300 ease-in-out shrink-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Branding Section */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <HospitalLogo config={hospitalConfig} size="lg" variant="rounded" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-black text-sm text-white tracking-tight leading-snug truncate">
                {hospitalConfig.name}
              </h1>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                {hospitalConfig.district}
              </p>
              <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-emerald-400 shrink-0" /> {hospitalConfig.phoneDisplay}
              </p>
            </div>
          </div>

          <div className="mt-3.5 inline-block w-full py-1 px-2.5 bg-emerald-950/70 border border-emerald-800/50 rounded-lg text-[11px] text-emerald-300 font-bold text-center">
            ระบบสติกเกอร์ยา & ทะเบียนคนไข้
          </div>
        </div>

        {/* Vertical Navigation Links */}
        <div className="p-4 flex-1 space-y-6">
          <div>
            <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400 px-3 mb-2">
              เมนูหลัก
            </div>
            <nav className="space-y-1.5">
              {/* 1. คลังยา (รับเข้า - เบิกจ่าย) */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('inventory');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'inventory'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package className={`w-4 h-4 ${activeTab === 'inventory' ? 'text-white' : 'text-emerald-400'}`} />
                  <span>คลังยา (รับเข้า - เบิกจ่าย)</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === 'inventory' ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300'
                }`}>
                  {drugs.length}
                </span>
              </button>

              {/* 2. ทะเบียนจ่ายยาคนไข้ */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('patients');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'patients'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className={`w-4 h-4 ${activeTab === 'patients' ? 'text-white' : 'text-emerald-400'}`} />
                  <span>ทะเบียนจ่ายยาคนไข้</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === 'patients' ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300'
                }`}>
                  {patients.length}
                </span>
              </button>

              {/* 3. ประวัติการพิมพ์ */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('registry');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'registry'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className={`w-4 h-4 ${activeTab === 'registry' ? 'text-white' : 'text-emerald-400'}`} />
                  <span>ประวัติการพิมพ์</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === 'registry' ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300'
                }`}>
                  {history.length}
                </span>
              </button>

              {/* 4. ตั้งค่าระบบ & โลโก้ */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('settings');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-white' : 'text-emerald-400'}`} />
                  <span>ตั้งค่าระบบ & โลโก้</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Sidebar Footer with Officer Profile & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-400">เข้าสู่ระบบโดย</div>
                <div className="font-bold text-xs text-white truncate">{currentUser}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="ออกจากระบบ"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8 no-print">
        {activeTab === 'settings' ? (
          /* System Settings & Logo Customization View */
          <SettingsView
            config={hospitalConfig}
            onSaveConfig={handleSaveHospitalConfig}
          />
        ) : activeTab === 'inventory' ? (
          /* Drug Inventory View (รับเข้า - เบิกจ่าย - ตัดยอดคนไข้) */
          <DrugInventoryView
            drugs={drugs}
            setDrugs={setDrugs}
            transactions={transactions}
            setTransactions={setTransactions}
            currentUser={currentUser}
          />
        ) : activeTab === 'patients' ? (
          /* Patient Medication Registry View */
          <PatientRegistryView
            patients={patients}
            setPatients={setPatients}
            onAdjustMedication={handleOpenAdjustment}
            onPrintPatientStickers={handlePrintPatientStickers}
            onViewPatientHistory={handleViewPatientHistory}
          />
        ) : activeTab === 'registry' ? (
          /* Dispensing History / Print Ledger View */
          <HistoryRegistry
            history={history}
            onClearHistory={() => setHistory([])}
            onDeleteRecord={(id) => setHistory(history.filter(h => h.id !== id))}
            onReprint={handleReprintRecord}
            onLoadRecord={handleLoadRecord}
            onDownloadPDF={handleDownloadRecordPDF}
          />
        ) : (
          /* Editor & Live Side-by-Side Sticker Preview */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Input Form (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <PrescriptionForm
                patient={patient}
                setPatient={setPatient}
                items={items}
                setItems={setItems}
                drugs={drugs}
                patients={patients}
                onOpenDrugModal={() => setIsDrugModalOpen(true)}
                onPrintPreview={handleOpenPrintModal}
                onOpenPatientRegistry={() => setActiveTab('patients')}
              />
            </div>

            {/* Right Column: Real-Time Sticker Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-slate-900 text-sm">
                      ตัวอย่างสติกเกอร์ตรงตามแบบจริง (80x50 มม.)
                    </h3>
                  </div>

                  {/* Zoom controls */}
                  <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => setZoomLevel(Math.max(80, zoomLevel - 15))}
                      className="p-1 text-slate-500 hover:text-slate-800 rounded cursor-pointer"
                      title="ลดขนาด"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono font-semibold px-1 text-slate-700">
                      {zoomLevel}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel(Math.min(130, zoomLevel + 15))}
                      className="p-1 text-slate-500 hover:text-slate-800 rounded cursor-pointer"
                      title="ขยายขนาด"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Multiple stickers switcher */}
                {items.length > 1 && (
                  <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200 mb-3 text-xs">
                    <span className="font-semibold text-slate-700">
                      แสดงตัวอย่างใบที่ {previewIndex + 1} จากทั้งหมด {items.length} ใบ:
                    </span>
                    <div className="flex items-center gap-1">
                      {items.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPreviewIndex(i)}
                          className={`w-6 h-6 rounded text-xs font-bold transition-colors cursor-pointer ${
                            i === previewIndex
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* The Exact Real Physical Sticker Presentation */}
                <div className="flex justify-center py-2 bg-slate-100/80 rounded-xl p-3 border border-dashed border-slate-300 overflow-hidden">
                  <div
                    style={{
                      transform: `scale(${zoomLevel / 100})`,
                      transformOrigin: 'top center',
                      transition: 'transform 0.15s ease-out'
                    }}
                    className="shrink-0"
                  >
                    {currentPreviewItem ? (
                      <StickerView
                        id="live-preview-sticker"
                        patient={patient}
                        item={currentPreviewItem}
                        size="thermal-80x50"
                        itemIndex={previewIndex}
                        totalItems={items.length}
                        hospitalConfig={hospitalConfig}
                        className="shadow-md hover:shadow-lg transition-shadow"
                      />
                    ) : (
                      <div className="p-8 text-center text-slate-400 text-xs">
                        ไม่มีรายการยาในสติกเกอร์
                      </div>
                    )}
                  </div>
                </div>

                {/* Format Spec Summary Card */}
                <div className="mt-4 p-3 bg-emerald-50/60 rounded-lg border border-emerald-200 text-xs space-y-1.5 text-slate-700">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    รายละเอียดตามข้อกำหนดของ รพ.สต.หนองชิ่ม:
                  </div>
                  <ul className="text-[11px] space-y-1 text-slate-600 pl-5 list-disc">
                    <li>
                      <span className="font-semibold text-emerald-800">หัวกระดาษแถบสีเขียวอ่อน:</span> {HOSPITAL_CONFIG.name}
                    </li>
                    <li>
                      <span className="font-semibold text-emerald-800">แถบกลุ่มยาพื้นหลังสีเขียว:</span> {currentPreviewItem?.category || 'ยาลดความดันโลหิต'}
                    </li>
                    <li>
                      <span className="font-semibold text-red-600">วิธีรับประทานเน้นสีแดงชัดเจน:</span> แสดงมื้อยาและคำแนะนำเด่นชัด
                    </li>
                    <li>
                      <span className="font-semibold text-sky-700">แถบวันนัดพื้นหลังสีฟ้า:</span> {patient.appointmentDate ? formatThaiDate(patient.appointmentDate) : '15 พ.ค. 2567'}
                    </li>
                    <li>
                      <span className="font-semibold text-slate-800">ท้ายล่างสติ๊กเกอร์:</span> {HOSPITAL_CONFIG.phoneDisplay}
                    </li>
                  </ul>
                </div>

                {/* Action buttons on preview card: Direct PDF & Print */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => currentPreviewItem && handleDownloadSinglePDF(currentPreviewItem)}
                    disabled={!currentPreviewItem || isExportingPDF}
                    className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isExportingPDF ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>กำลังสร้าง PDF...</span>
                      </>
                    ) : (
                      <>
                        <FileDown className="w-4 h-4" />
                        <span>โหลด PDF ใบนี้</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenPrintModal}
                    className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>พิมพ์ / PDF ทั้งชุด ({items.length})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        patient={patient}
        items={items}
        onConfirmPrint={handleConfirmPrint}
        hospitalConfig={hospitalConfig}
      />

      <DrugListModal
        isOpen={isDrugModalOpen}
        onClose={() => setIsDrugModalOpen(false)}
        drugs={drugs}
        setDrugs={setDrugs}
        onSelectDrugToAdd={handleAddDrugFromModal}
      />

      {/* Medication Adjustment Modal */}
      <MedicationAdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        patient={selectedPatientForAdjustment}
        drugs={drugs}
        onSaveAdjustment={handleSaveMedicationAdjustment}
      />

      {/* Patient Past Visits & History Timeline Modal */}
      <PatientHistoryModal
        isOpen={isPatientHistoryModalOpen}
        onClose={() => setIsPatientHistoryModalOpen(false)}
        patient={selectedPatientForHistory}
        onPrintVisit={handlePrintVisit}
      />
    </div>
  );
}
