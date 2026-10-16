import React, { useState } from 'react';
import { PatientProfile, PrescriptionItem, DrugItem } from '../types/sticker';
import { formatThaiDate, getTodayString, addMonthsToDate } from '../utils/thaiDate';
import { 
  X, 
  Pill, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  Printer, 
  Save, 
  Search,
  Activity,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

interface MedicationAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile | null;
  drugs: DrugItem[];
  onSaveAdjustment: (
    patientId: string,
    updatedPrescriptions: PrescriptionItem[],
    visitData: {
      visitDate: string;
      appointmentDate: string;
      bp?: string;
      fbs?: string;
      notes?: string;
    },
    sendToPrintImmediately?: boolean
  ) => void;
}

export const MedicationAdjustmentModal: React.FC<MedicationAdjustmentModalProps> = ({
  isOpen,
  onClose,
  patient,
  drugs,
  onSaveAdjustment,
}) => {
  if (!isOpen || !patient) return null;

  // Local state for the adjustment session
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>(() => {
    // Clone patient's current prescriptions
    return patient.currentPrescriptions.map(p => ({
      ...p,
      status: p.status || 'active'
    }));
  });

  const [visitDate, setVisitDate] = useState<string>(getTodayString());
  const [appointmentDate, setAppointmentDate] = useState<string>(
    patient.nextAppointmentDate || addMonthsToDate(getTodayString(), 1)
  );
  const [bp, setBp] = useState<string>('');
  const [fbs, setFbs] = useState<string>('');
  const [adjustmentNotes, setAdjustmentNotes] = useState<string>('');
  const [drugSearch, setDrugSearch] = useState<string>('');
  const [activeItemIdx, setActiveItemIdx] = useState<number>(0);

  // Filtered drugs for adding new
  const filteredDrugs = drugs.filter(d =>
    d.name.toLowerCase().includes(drugSearch.toLowerCase()) ||
    d.category.toLowerCase().includes(drugSearch.toLowerCase())
  );

  const handleAddNewDrug = (drug: DrugItem) => {
    const newItem: PrescriptionItem = {
      id: 'med-' + Date.now() + Math.random().toString(36).substring(2, 5),
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
      warning: drug.warning || '',
      status: 'active',
      changeReason: 'เพิ่มยาใหม่รอบนี้'
    };

    setPrescriptions([...prescriptions, newItem]);
    setActiveItemIdx(prescriptions.length);
    setDrugSearch('');
  };

  const updateItem = (index: number, updates: Partial<PrescriptionItem>) => {
    setPrescriptions(prev =>
      prev.map((it, idx) => (idx === index ? { ...it, ...updates, status: it.status === 'discontinued' ? 'discontinued' : 'changed' } : it))
    );
  };

  const toggleDiscontinue = (index: number) => {
    setPrescriptions(prev =>
      prev.map((it, idx) => {
        if (idx !== index) return it;
        const newStatus = it.status === 'discontinued' ? 'active' : 'discontinued';
        return {
          ...it,
          status: newStatus,
          changeReason: newStatus === 'discontinued' ? 'หยุดยาในรอบนี้' : ''
        };
      })
    );
  };

  const removeItemPermanently = (index: number) => {
    setPrescriptions(prev => prev.filter((_, idx) => idx !== index));
    setActiveItemIdx(Math.max(0, activeItemIdx - 1));
  };

  const handleSave = (sendToPrint: boolean = false) => {
    // Filter active items for the ongoing regimen
    const activePrescriptions = prescriptions.filter(p => p.status !== 'discontinued');
    if (activePrescriptions.length === 0) {
      if (!confirm('ไม่มีรายการยาที่สั่งจ่าย (หยุดยาทั้งหมด) ยืนยันการบันทึกหรือไม่?')) {
        return;
      }
    }

    onSaveAdjustment(
      patient.id,
      prescriptions,
      {
        visitDate,
        appointmentDate,
        bp,
        fbs,
        notes: adjustmentNotes
      },
      sendToPrint
    );
    onClose();
  };

  const activePrescriptionsCount = prescriptions.filter(p => p.status !== 'discontinued').length;
  const currentEditing = prescriptions[activeItemIdx];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 no-print">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-emerald-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
              <Activity className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg leading-tight">
                  ปรับยาและจ่ายยารอบหน้า: {patient.fullName}
                </h3>
                <span className="font-mono text-xs bg-emerald-700/80 px-2 py-0.5 rounded text-emerald-100">
                  HN: {patient.hn}
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                อายุ {patient.age || '-'} ปี • โรคประจำตัว: {patient.diseases.join(', ') || 'ไม่มี'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Allergy Warning Banner if patient has drug allergies */}
        {patient.allergies && patient.allergies !== 'ไม่มี' && patient.allergies !== 'ปฏิเสธประวัติแพ้ยา' && (
          <div className="bg-red-500 text-white px-4 py-2 text-xs font-bold flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-200 shrink-0" />
            <span>คำเตือนประวัติแพ้ยา: {patient.allergies} (โปรดตรวจสอบความปลอดภัยก่อนสั่งยา)</span>
          </div>
        )}

        {/* Visit & Vital Signs Bar */}
        <div className="p-3 sm:px-5 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs shrink-0">
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> วันที่จ่ายยารอบนี้:
            </label>
            <input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-sky-600" /> วันนัดรอบถัดไป:
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setAppointmentDate(addMonthsToDate(visitDate, 1))}
                  className="text-[10px] text-sky-700 hover:underline"
                >
                  +1 ด.
                </button>
                <button
                  type="button"
                  onClick={() => setAppointmentDate(addMonthsToDate(visitDate, 2))}
                  className="text-[10px] text-sky-700 hover:underline"
                >
                  +2 ด.
                </button>
              </div>
            </div>
            <input
              type="date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              ความดันโลหิต (BP) / ชีพจร:
            </label>
            <input
              type="text"
              placeholder="เช่น 130/80 mmHg"
              value={bp}
              onChange={(e) => setBp(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              ระดับน้ำตาล (FBS):
            </label>
            <input
              type="text"
              placeholder="เช่น 115 mg/dL"
              value={fbs}
              onChange={(e) => setFbs(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* Top action row: Drug Search and Add New Drug */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
            <div>
              <span className="font-bold text-xs text-emerald-900 block">
                รายการยาประจำตัวผู้ป่วย (จ่ายจริง {activePrescriptionsCount} รายการ):
              </span>
              <span className="text-[11px] text-slate-500">
                สามารถปรับเพิ่ม/ลดขนาดยา เปลี่ยนวิธีรับประทาน หรือหยุดยาในรอบนี้ได้
              </span>
            </div>

            {/* Quick add drug dropdown */}
            <div className="relative min-w-[260px]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="+ ค้นหาเพื่อเพิ่มยาใหม่รอบนี้..."
                  value={drugSearch}
                  onChange={(e) => setDrugSearch(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {drugSearch.trim() && (
                <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white rounded-lg shadow-xl border border-slate-200 z-30 divide-y divide-slate-100">
                  {filteredDrugs.map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleAddNewDrug(d)}
                      className="w-full p-2 text-left hover:bg-emerald-50 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{d.name}</div>
                        <div className="text-[10px] text-emerald-700">{d.category}</div>
                      </div>
                      <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                        + เพิ่ม
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* List of Medications */}
          <div className="space-y-3">
            {prescriptions.map((item, idx) => {
              const isDiscontinued = item.status === 'discontinued';
              const isSelected = activeItemIdx === idx;

              return (
                <div
                  key={item.id}
                  className={`rounded-xl border transition-all p-3.5 ${
                    isDiscontinued
                      ? 'bg-slate-100/70 border-slate-300 opacity-60'
                      : isSelected
                      ? 'bg-white border-emerald-500 shadow-sm ring-1 ring-emerald-500/30'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span className={`font-extrabold text-sm ${isDiscontinued ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {item.drugName}
                      </span>
                      <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                      {item.changeReason && (
                        <span className="text-[10px] font-medium bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                          {item.changeReason}
                        </span>
                      )}
                      {isDiscontinued && (
                        <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded">
                          หยุดยาในรอบนี้
                        </span>
                      )}
                    </div>

                    {/* Quick status toggles */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => toggleDiscontinue(idx)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                          isDiscontinued
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                        }`}
                      >
                        {isDiscontinued ? 'เปิดจ่ายยาอีกครั้ง' : 'หยุดยาตัวนี้'}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItemPermanently(idx)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                        title="ลบออกจากรายการ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* If active, allow fine-tuning the quantity and dosage */}
                  {!isDiscontinued && (
                    <div className="pt-2.5 space-y-2 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        {/* Quantity and unit */}
                        <div className="sm:col-span-3 flex gap-1.5">
                          <div className="flex-1">
                            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">จำนวนจ่าย (รอบนี้)</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(idx, { quantity: parseInt(e.target.value) || 1 })}
                              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 font-bold text-slate-900"
                            />
                          </div>
                          <div className="w-14">
                            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">หน่วย</label>
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => updateItem(idx, { unit: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-300 rounded px-1.5 py-1 text-center"
                            />
                          </div>
                        </div>

                        {/* Dosage */}
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">ขนาดรับประทาน</label>
                          <select
                            value={item.dosage}
                            onChange={(e) => updateItem(idx, { dosage: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1"
                          >
                            <option value="ครั้งละ 1/2 เม็ด">ครั้งละ 1/2 เม็ด</option>
                            <option value="ครั้งละ 1 เม็ด">ครั้งละ 1 เม็ด</option>
                            <option value="ครั้งละ 1.5 เม็ด">ครั้งละ 1.5 เม็ด</option>
                            <option value="ครั้งละ 2 เม็ด">ครั้งละ 2 เม็ด</option>
                          </select>
                        </div>

                        {/* Meal timing */}
                        <div className="sm:col-span-6">
                          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">มื้ออาหาร</label>
                          <div className="flex items-center gap-3 pt-1">
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={item.timesPerDay?.morning}
                                onChange={(e) => updateItem(idx, { timesPerDay: { ...item.timesPerDay, morning: e.target.checked } })}
                                className="rounded text-red-600"
                              />
                              <span>เช้า</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={item.timesPerDay?.noon}
                                onChange={(e) => updateItem(idx, { timesPerDay: { ...item.timesPerDay, noon: e.target.checked } })}
                                className="rounded text-red-600"
                              />
                              <span>กลางวัน</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={item.timesPerDay?.evening}
                                onChange={(e) => updateItem(idx, { timesPerDay: { ...item.timesPerDay, evening: e.target.checked } })}
                                className="rounded text-red-600"
                              />
                              <span>เย็น</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={item.timesPerDay?.night}
                                onChange={(e) => updateItem(idx, { timesPerDay: { ...item.timesPerDay, night: e.target.checked } })}
                                className="rounded text-red-600"
                              />
                              <span>ก่อนนอน</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Custom instructions text */}
                      <div>
                        <label className="block text-[10px] font-semibold text-red-700 mb-0.5">
                          วิธีรับประทานที่จะพิมพ์ลงบนสติกเกอร์ (สีแดง)
                        </label>
                        <input
                          type="text"
                          value={item.customInstructions}
                          onChange={(e) => updateItem(idx, { customInstructions: e.target.value })}
                          className="w-full bg-red-50/50 border border-red-200 rounded px-2.5 py-1 text-xs font-bold text-red-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Adjustment Notes for record ledger */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              บันทึกเหตุผลการปรับยา / คำแนะนำของแพทย์-พยาบาล (รอบนี้):
            </label>
            <textarea
              rows={2}
              value={adjustmentNotes}
              onChange={(e) => setAdjustmentNotes(e.target.value)}
              placeholder="เช่น ปรับเพิ่ม Amlodipine เป็นวันละ 1 เม็ด เช้า-เย็น เนื่องจาก BP ยังสูง 145/90 หรือ คงยาเดิม อาการทั่วไปปกติ"
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            นัดตรวจครั้งต่อไป: <strong className="text-sky-700">{formatThaiDate(appointmentDate)}</strong>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              ยกเลิก
            </button>

            {/* Save to patient registry profile */}
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกการปรับยาลงทะเบียน</span>
            </button>

            {/* Save AND Immediately Send to Print Stickers */}
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>บันทึกและส่งพิมพ์สติกเกอร์ทันที ({activePrescriptionsCount} ดวง)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
