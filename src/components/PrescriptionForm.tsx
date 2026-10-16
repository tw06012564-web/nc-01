import React, { useState } from 'react';
import { PatientInfo, PrescriptionItem, DrugItem, PatientProfile } from '../types/sticker';
import { addMonthsToDate, formatThaiDate } from '../utils/thaiDate';
import { Plus, Trash2, Copy, Search, User, Calendar, Pill, AlertCircle, Sparkles, Users } from 'lucide-react';

interface PrescriptionFormProps {
  patient: PatientInfo;
  setPatient: React.Dispatch<React.SetStateAction<PatientInfo>>;
  items: PrescriptionItem[];
  setItems: React.Dispatch<React.SetStateAction<PrescriptionItem[]>>;
  drugs: DrugItem[];
  patients?: PatientProfile[];
  onOpenDrugModal: () => void;
  onPrintPreview: () => void;
  onOpenPatientRegistry?: () => void;
}

export const PrescriptionForm: React.FC<PrescriptionFormProps> = ({
  patient,
  setPatient,
  items,
  setItems,
  drugs,
  patients = [],
  onOpenDrugModal,
  onPrintPreview,
  onOpenPatientRegistry,
}) => {
  const [selectedDrugSearch, setSelectedDrugSearch] = useState('');
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);

  // Quick preset patients for testing and fast workflow
  const loadPresetPatient = (type: 'ht' | 'dm' | 'gout') => {
    if (type === 'ht') {
      const amlodipine = drugs.find(d => d.name.includes('Amlodipine')) || drugs[1];
      const losartan = drugs.find(d => d.name.includes('Losartan')) || drugs[16];
      setPatient({
        hn: '6704128',
        fullName: 'นายสมชาย ใจดี',
        age: '62',
        dispenseDate: new Date().toISOString().split('T')[0],
        appointmentDate: addMonthsToDate(new Date().toISOString().split('T')[0], 1),
        note: 'คลินิกความดันโลหิตสูง รพ.สต.หนองชิ่ม'
      });
      setItems([
        {
          id: 'item-' + Date.now() + '-1',
          drugId: amlodipine.id,
          drugName: amlodipine.name,
          category: amlodipine.category,
          quantity: 30,
          unit: 'เม็ด',
          dosage: amlodipine.dosage,
          frequency: amlodipine.frequency,
          mealTiming: amlodipine.mealTiming,
          mealTimingMinutes: amlodipine.mealTimingMinutes,
          timesPerDay: { ...amlodipine.timesPerDay },
          customInstructions: amlodipine.customInstructions || 'รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้ง หลังอาหารเช้า',
          warning: amlodipine.warning
        },
        {
          id: 'item-' + Date.now() + '-2',
          drugId: losartan.id,
          drugName: losartan.name,
          category: losartan.category,
          quantity: 30,
          unit: 'เม็ด',
          dosage: losartan.dosage,
          frequency: losartan.frequency,
          mealTiming: losartan.mealTiming,
          mealTimingMinutes: losartan.mealTimingMinutes,
          timesPerDay: { ...losartan.timesPerDay },
          customInstructions: losartan.customInstructions || 'รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้ง หลังอาหารเช้า',
          warning: losartan.warning
        }
      ]);
      setActiveItemIndex(0);
    } else if (type === 'dm') {
      const metformin = drugs.find(d => d.name.includes('Metformin')) || drugs[18];
      const glipizide = drugs.find(d => d.name.includes('Glipizide')) || drugs[13];
      const simva = drugs.find(d => d.name.includes('Simvastatin 20')) || drugs[22];
      setPatient({
        hn: '6705592',
        fullName: 'นางสมศรี รักษ์สุข',
        age: '58',
        dispenseDate: new Date().toISOString().split('T')[0],
        appointmentDate: addMonthsToDate(new Date().toISOString().split('T')[0], 2),
        note: 'คลินิกเบาหวาน รพ.สต.หนองชิ่ม'
      });
      setItems([
        {
          id: 'item-' + Date.now() + '-1',
          drugId: metformin.id,
          drugName: metformin.name,
          category: metformin.category,
          quantity: 60,
          unit: 'เม็ด',
          dosage: metformin.dosage,
          frequency: metformin.frequency,
          mealTiming: metformin.mealTiming,
          mealTimingMinutes: metformin.mealTimingMinutes,
          timesPerDay: { ...metformin.timesPerDay },
          customInstructions: metformin.customInstructions || 'รับประทานครั้งละ 1 เม็ด วันละ 2 ครั้ง หลังอาหารเช้า - เย็น ทันที',
          warning: metformin.warning
        },
        {
          id: 'item-' + Date.now() + '-2',
          drugId: glipizide.id,
          drugName: glipizide.name,
          category: glipizide.category,
          quantity: 30,
          unit: 'เม็ด',
          dosage: glipizide.dosage,
          frequency: glipizide.frequency,
          mealTiming: glipizide.mealTiming,
          mealTimingMinutes: glipizide.mealTimingMinutes,
          timesPerDay: { ...glipizide.timesPerDay },
          customInstructions: glipizide.customInstructions || 'รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้ง ก่อนอาหารเช้า 30 นาที',
          warning: glipizide.warning
        },
        {
          id: 'item-' + Date.now() + '-3',
          drugId: simva.id,
          drugName: simva.name,
          category: simva.category,
          quantity: 30,
          unit: 'เม็ด',
          dosage: simva.dosage,
          frequency: simva.frequency,
          mealTiming: simva.mealTiming,
          mealTimingMinutes: simva.mealTimingMinutes,
          timesPerDay: { ...simva.timesPerDay },
          customInstructions: simva.customInstructions || 'รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้ง ก่อนนอน',
          warning: simva.warning
        }
      ]);
      setActiveItemIndex(0);
    } else if (type === 'gout') {
      const allopurinol = drugs.find(d => d.name.includes('Allopurinol')) || drugs[0];
      const colchicine = drugs.find(d => d.name.includes('Colchicine')) || drugs[6];
      setPatient({
        hn: '6703810',
        fullName: 'นายวิชัย สุขเกษม',
        age: '54',
        dispenseDate: new Date().toISOString().split('T')[0],
        appointmentDate: '2024-05-15', // Matches sample: 15 พ.ค. 2567
        note: 'คลินิกโรคเก๊าท์ รพ.สต.หนองชิ่ม'
      });
      setItems([
        {
          id: 'item-' + Date.now() + '-1',
          drugId: allopurinol.id,
          drugName: allopurinol.name,
          category: allopurinol.category,
          quantity: 30,
          unit: 'เม็ด',
          dosage: allopurinol.dosage,
          frequency: allopurinol.frequency,
          mealTiming: allopurinol.mealTiming,
          mealTimingMinutes: allopurinol.mealTimingMinutes,
          timesPerDay: { ...allopurinol.timesPerDay },
          customInstructions: allopurinol.customInstructions || 'รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้ง หลังอาหารเช้า',
          warning: allopurinol.warning
        },
        {
          id: 'item-' + Date.now() + '-2',
          drugId: colchicine.id,
          drugName: colchicine.name,
          category: colchicine.category,
          quantity: 10,
          unit: 'เม็ด',
          dosage: colchicine.dosage,
          frequency: colchicine.frequency,
          mealTiming: colchicine.mealTiming,
          mealTimingMinutes: colchicine.mealTimingMinutes,
          timesPerDay: { ...colchicine.timesPerDay },
          customInstructions: colchicine.customInstructions || 'รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้ง หลังอาหารเช้า หรือเมื่อมีอาการปวด',
          warning: colchicine.warning
        }
      ]);
      setActiveItemIndex(0);
    }
  };

  // Add new drug from selector
  const handleSelectDrug = (drug: DrugItem) => {
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
      customInstructions: drug.customInstructions || `รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้ง หลังอาหารเช้า`,
      warning: drug.warning || ''
    };

    setItems([...items, newItem]);
    setActiveItemIndex(items.length);
    setSelectedDrugSearch('');
  };

  const updateActiveItem = (updates: Partial<PrescriptionItem>) => {
    if (items.length === 0) return;
    setItems(items.map((it, idx) => (idx === activeItemIndex ? { ...it, ...updates } : it)));
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    const newItems = items.filter((_, idx) => idx !== index);
    setItems(newItems);
    setActiveItemIndex(Math.max(0, index - 1));
  };

  const duplicateItem = (index: number) => {
    const target = items[index];
    const cloned: PrescriptionItem = {
      ...target,
      id: 'item-' + Date.now() + Math.random().toString(36).substring(2, 5)
    };
    setItems([...items, cloned]);
    setActiveItemIndex(items.length);
  };

  // Filtered drugs for search
  const filteredDrugs = drugs.filter(d =>
    d.name.toLowerCase().includes(selectedDrugSearch.toLowerCase()) ||
    d.category.toLowerCase().includes(selectedDrugSearch.toLowerCase())
  );

  const currentItem = items[activeItemIndex] || items[0];

  // Helper to recompute auto instruction string
  const regenerateInstructions = (
    dosage: string,
    timing: 'before' | 'after' | 'with' | 'bedtime' | 'as_needed',
    times: { morning: boolean; noon: boolean; evening: boolean; night: boolean }
  ) => {
    const meals: string[] = [];
    if (times.morning) meals.push('เช้า');
    if (times.noon) meals.push('กลางวัน');
    if (times.evening) meals.push('เย็น');
    if (times.night) meals.push('ก่อนนอน');

    let timingStr = '';
    if (timing === 'before') timingStr = 'ก่อนอาหาร 30 นาที';
    else if (timing === 'after') timingStr = 'หลังอาหาร';
    else if (timing === 'with') timingStr = 'พร้อมอาหารหรือหลังอาหารทันที';
    else if (timing === 'bedtime') timingStr = 'ก่อนนอน';
    else if (timing === 'as_needed') timingStr = 'เมื่อมีอาการปวด';

    let freqStr = meals.length > 0 ? `วันละ ${meals.length} ครั้ง` : 'วันละ 1 ครั้ง';
    let mealStr = meals.length > 0 ? `(${meals.join(' - ')})` : '';

    return `รับประทาน${dosage} ${freqStr} ${timingStr} ${mealStr}`.trim();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-100">
      {/* Header & Quick Templates */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Pill className="w-5 h-5 text-emerald-600" />
              บันทึกข้อมูลสติกเกอร์ยา
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              พิมพ์สติกเกอร์ฉลากยา รพ.สต.หนองชิ่ม สอดคล้องตามมาตรฐานโรงพยาบาล
            </p>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> ชุดตัวอย่าง:
            </span>
            <button
              type="button"
              onClick={() => loadPresetPatient('ht')}
              className="text-xs font-medium px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200"
            >
              ความดันโลหิต
            </button>
            <button
              type="button"
              onClick={() => loadPresetPatient('dm')}
              className="text-xs font-medium px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
            >
              เบาหวาน
            </button>
            <button
              type="button"
              onClick={() => loadPresetPatient('gout')}
              className="text-xs font-medium px-2 py-1 rounded bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors border border-amber-200"
            >
              โรคเก๊าท์ (ตัวอย่าง)
            </button>
          </div>
        </div>

        {/* Quick Patient Registry Selector Banner */}
        {patients.length > 0 && (
          <div className="mb-3 p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900 shrink-0">
              <Users className="w-4 h-4 text-emerald-700" />
              <span>ดึงคนไข้จากทะเบียน:</span>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <select
                onChange={(e) => {
                  const selected = patients.find(p => p.id === e.target.value);
                  if (selected) {
                    setPatient({
                      hn: selected.hn,
                      fullName: selected.fullName,
                      age: selected.age,
                      phone: selected.phone,
                      allergies: selected.allergies,
                      dispenseDate: new Date().toISOString().split('T')[0],
                      appointmentDate: selected.nextAppointmentDate || addMonthsToDate(new Date().toISOString().split('T')[0], 1),
                      note: selected.notes
                    });
                    if (selected.currentPrescriptions.length > 0) {
                      setItems(selected.currentPrescriptions.map(p => ({ ...p })));
                      setActiveItemIndex(0);
                    }
                  }
                }}
                className="w-full bg-white border border-emerald-300 rounded px-2.5 py-1 text-xs font-semibold text-slate-800"
                defaultValue=""
              >
                <option value="" disabled>-- เลือกคนไข้จากทะเบียน ({patients.length} คน) เพื่อดึงยาประจำตัวอัตโนมัติ --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} (HN: {p.hn}) • {p.diseases.join(', ')} • ยาประจำตัว {p.currentPrescriptions.length} รายการ
                  </option>
                ))}
              </select>
              {onOpenPatientRegistry && (
                <button
                  type="button"
                  onClick={onOpenPatientRegistry}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline shrink-0 cursor-pointer"
                >
                  เปิดสมุดทะเบียน
                </button>
              )}
            </div>
          </div>
        )}

        {/* 1. Patient Info Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/80 p-3.5 rounded-lg border border-slate-200">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-500" />
              ชื่อ - สกุล ผู้ป่วย *
            </label>
            <input
              type="text"
              value={patient.fullName}
              onChange={(e) => setPatient({ ...patient, fullName: e.target.value })}
              placeholder="เช่น นายสมชาย ใจดี"
              className="w-full text-sm bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              เลขประจำตัวผู้ป่วย (HN)
            </label>
            <input
              type="text"
              value={patient.hn}
              onChange={(e) => setPatient({ ...patient, hn: e.target.value })}
              placeholder="เช่น 6701234"
              className="w-full text-sm bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              วันที่จ่ายยา (วัน/เดือน/ปี)
            </label>
            <input
              type="date"
              value={patient.dispenseDate}
              onChange={(e) => setPatient({ ...patient, dispenseDate: e.target.value })}
              className="w-full text-sm bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
              ตรงกับ: {formatThaiDate(patient.dispenseDate)}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                วันนัดตรวจครั้งต่อไป
              </label>
              {/* Quick sample button matching prompt */}
              <button
                type="button"
                onClick={() => setPatient({ ...patient, appointmentDate: '2024-05-15' })}
                className="text-[10px] text-sky-600 hover:text-sky-800 underline font-medium"
                title="ตั้งเป็นตัวอย่าง: 15 พ.ค. 2567"
              >
                15 พ.ค. 67
              </button>
            </div>
            <input
              type="date"
              value={patient.appointmentDate}
              onChange={(e) => setPatient({ ...patient, appointmentDate: e.target.value })}
              className="w-full text-sm bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-sky-700 font-medium">
                {patient.appointmentDate ? `นัด: ${formatThaiDate(patient.appointmentDate)}` : 'ยังไม่ได้ระบุ'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPatient({ ...patient, appointmentDate: addMonthsToDate(patient.dispenseDate, 1) })}
                  className="px-1.5 py-0.5 bg-slate-200/80 hover:bg-slate-300 text-slate-700 rounded text-[10px]"
                >
                  +1 ด.
                </button>
                <button
                  type="button"
                  onClick={() => setPatient({ ...patient, appointmentDate: addMonthsToDate(patient.dispenseDate, 2) })}
                  className="px-1.5 py-0.5 bg-slate-200/80 hover:bg-slate-300 text-slate-700 rounded text-[10px]"
                >
                  +2 ด.
                </button>
                <button
                  type="button"
                  onClick={() => setPatient({ ...patient, appointmentDate: addMonthsToDate(patient.dispenseDate, 3) })}
                  className="px-1.5 py-0.5 bg-slate-200/80 hover:bg-slate-300 text-slate-700 rounded text-[10px]"
                >
                  +3 ด.
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Drug Selection and Prescription List Tabs */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">
              รายการยาที่จัด ({items.length} รายการ):
            </span>
            <button
              type="button"
              onClick={onOpenDrugModal}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold underline"
            >
              ดูบัญชียาทั้ง 25 รายการ / จัดการคลังยา
            </button>
          </div>

          {/* Quick Drug Dropdown / Search */}
          <div className="relative min-w-[280px]">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="ค้นหาชื่อยาเพื่อเพิ่มลงในชุด... (25 ตัวยา)"
                value={selectedDrugSearch}
                onChange={(e) => setSelectedDrugSearch(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
            {selectedDrugSearch.trim() && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white rounded-lg shadow-xl border border-slate-200 z-30 divide-y divide-slate-100">
                {filteredDrugs.length === 0 ? (
                  <div className="p-3 text-xs text-slate-500 text-center">ไม่พบชื่อยาที่ค้นหา</div>
                ) : (
                  filteredDrugs.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleSelectDrug(d)}
                      className="w-full p-2.5 text-left hover:bg-emerald-50 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-900">{d.name}</div>
                        <div className="text-[11px] text-emerald-700 font-medium">{d.category}</div>
                      </div>
                      <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                        + เพิ่ม
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Item Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {items.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveItemIndex(idx)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                idx === activeItemIndex
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <span>{idx + 1}. {item.drugName.split(' ')[0]}</span>
              <span className="text-[10px] opacity-80">({item.quantity} {item.unit})</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              const defaultDrug = drugs[0];
              handleSelectDrug(defaultDrug);
            }}
            className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-dashed border-emerald-300 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            เพิ่มตัวยา
          </button>
        </div>

        {/* Active Drug Editor Card */}
        {currentItem && (
          <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  {activeItemIndex + 1}
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  แก้ไขข้อมูลสติกเกอร์ตัวยาที่ {activeItemIndex + 1}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => duplicateItem(activeItemIndex)}
                  className="px-2 py-1 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded flex items-center gap-1 border border-slate-200"
                  title="คัดลอกรายการนี้"
                >
                  <Copy className="w-3.5 h-3.5" /> คัดลอก
                </button>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(activeItemIndex)}
                    className="px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded flex items-center gap-1 border border-red-200"
                    title="ลบรายการนี้"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> ลบ
                  </button>
                )}
              </div>
            </div>

            {/* Row 1: Drug Name, Category, Quantity & Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* ชื่อยา */}
              <div className="sm:col-span-5">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อยา (Drug Name) *
                </label>
                <input
                  type="text"
                  value={currentItem.drugName}
                  onChange={(e) => updateActiveItem({ drugName: e.target.value })}
                  placeholder="เช่น Amlodipine 5 mg."
                  className="w-full text-sm font-bold bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* แถบกลุ่มยาเน้นพื้นหลังสีเขียว */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-emerald-800 mb-1">
                  กลุ่มยา (แถบสีเขียวบนสติกเกอร์) *
                </label>
                <input
                  type="text"
                  value={currentItem.category}
                  onChange={(e) => updateActiveItem({ category: e.target.value })}
                  placeholder="เช่น ยาลดความดันโลหิต"
                  className="w-full text-sm font-semibold bg-emerald-50 text-emerald-900 border border-emerald-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* จำนวน และ หน่วย (เม็ด) */}
              <div className="sm:col-span-3 flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    จำนวน *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={currentItem.quantity}
                    onChange={(e) => updateActiveItem({ quantity: parseInt(e.target.value) || 1 })}
                    className="w-full text-sm font-bold bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="w-20">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    หน่วย
                  </label>
                  <input
                    type="text"
                    value={currentItem.unit}
                    onChange={(e) => updateActiveItem({ unit: e.target.value })}
                    placeholder="เม็ด"
                    className="w-full text-sm bg-white border border-slate-300 rounded px-2 py-1.5 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: วิธีรับประทานเน้นสีแดงชัดเจน */}
            <div className="bg-red-50/60 p-3.5 rounded-lg border border-red-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  วิธีรับประทาน (แสดงด้วยตัวอักษรสีแดงเด่นชัดบนสติกเกอร์)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const newInst = regenerateInstructions(
                      currentItem.dosage,
                      currentItem.mealTiming,
                      currentItem.timesPerDay
                    );
                    updateActiveItem({ customInstructions: newInst });
                  }}
                  className="text-[11px] text-red-700 hover:text-red-900 underline font-medium"
                >
                  สร้างข้อความอัตโนมัติจากตัวเลือก
                </button>
              </div>

              {/* Quick Meal Checkboxes (เช้า กลางวัน เย็น ก่อนนอน) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <label className="flex items-center gap-2 p-2 bg-white rounded border border-red-200 cursor-pointer hover:bg-red-50/50">
                  <input
                    type="checkbox"
                    checked={currentItem.timesPerDay?.morning ?? true}
                    onChange={(e) => {
                      const newTimes = { ...currentItem.timesPerDay, morning: e.target.checked };
                      const newInst = regenerateInstructions(currentItem.dosage, currentItem.mealTiming, newTimes);
                      updateActiveItem({ timesPerDay: newTimes, customInstructions: newInst });
                    }}
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                  />
                  <span className="text-xs font-bold text-red-900">เช้า (Morning)</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white rounded border border-red-200 cursor-pointer hover:bg-red-50/50">
                  <input
                    type="checkbox"
                    checked={currentItem.timesPerDay?.noon ?? false}
                    onChange={(e) => {
                      const newTimes = { ...currentItem.timesPerDay, noon: e.target.checked };
                      const newInst = regenerateInstructions(currentItem.dosage, currentItem.mealTiming, newTimes);
                      updateActiveItem({ timesPerDay: newTimes, customInstructions: newInst });
                    }}
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                  />
                  <span className="text-xs font-bold text-red-900">กลางวัน (Noon)</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white rounded border border-red-200 cursor-pointer hover:bg-red-50/50">
                  <input
                    type="checkbox"
                    checked={currentItem.timesPerDay?.evening ?? false}
                    onChange={(e) => {
                      const newTimes = { ...currentItem.timesPerDay, evening: e.target.checked };
                      const newInst = regenerateInstructions(currentItem.dosage, currentItem.mealTiming, newTimes);
                      updateActiveItem({ timesPerDay: newTimes, customInstructions: newInst });
                    }}
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                  />
                  <span className="text-xs font-bold text-red-900">เย็น (Evening)</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white rounded border border-red-200 cursor-pointer hover:bg-red-50/50">
                  <input
                    type="checkbox"
                    checked={currentItem.timesPerDay?.night ?? false}
                    onChange={(e) => {
                      const newTimes = { ...currentItem.timesPerDay, night: e.target.checked };
                      const newInst = regenerateInstructions(currentItem.dosage, currentItem.mealTiming, newTimes);
                      updateActiveItem({ timesPerDay: newTimes, customInstructions: newInst });
                    }}
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                  />
                  <span className="text-xs font-bold text-red-900">ก่อนนอน (Bedtime)</span>
                </label>
              </div>

              {/* Meal timing presets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    ขนาดรับประทาน
                  </label>
                  <select
                    value={currentItem.dosage}
                    onChange={(e) => {
                      const newDosage = e.target.value;
                      const newInst = regenerateInstructions(newDosage, currentItem.mealTiming, currentItem.timesPerDay);
                      updateActiveItem({ dosage: newDosage, customInstructions: newInst });
                    }}
                    className="w-full text-xs bg-white border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    <option value="ครั้งละ 1/2 เม็ด">ครั้งละ 1/2 เม็ด</option>
                    <option value="ครั้งละ 1 เม็ด">ครั้งละ 1 เม็ด</option>
                    <option value="ครั้งละ 1.5 เม็ด">ครั้งละ 1.5 เม็ด</option>
                    <option value="ครั้งละ 2 เม็ด">ครั้งละ 2 เม็ด</option>
                    <option value="ครั้งละ 3 เม็ด">ครั้งละ 3 เม็ด</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    เวลาสัมพันธ์กับอาหาร
                  </label>
                  <select
                    value={currentItem.mealTiming}
                    onChange={(e) => {
                      const newTiming = e.target.value as any;
                      const newInst = regenerateInstructions(currentItem.dosage, newTiming, currentItem.timesPerDay);
                      updateActiveItem({ mealTiming: newTiming, customInstructions: newInst });
                    }}
                    className="w-full text-xs bg-white border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    <option value="after">หลังอาหาร (15-30 นาที)</option>
                    <option value="with">หลังอาหารทันที / พร้อมอาหาร</option>
                    <option value="before">ก่อนอาหาร (30 นาที)</option>
                    <option value="bedtime">ก่อนนอน</option>
                    <option value="as_needed">เมื่อมีอาการ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    คำระบุเพิ่มเติม
                  </label>
                  <input
                    type="text"
                    value={currentItem.mealTimingMinutes || ''}
                    onChange={(e) => updateActiveItem({ mealTimingMinutes: e.target.value })}
                    placeholder="เช่น หลังอาหารเช้าทันที"
                    className="w-full text-xs bg-white border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Editable instruction text block */}
              <div>
                <label className="block text-[11px] font-semibold text-red-900 mb-1">
                  ข้อความวิธีรับประทานฉบับเต็ม (พิมพ์แก้ไขได้อิสระ) *
                </label>
                <textarea
                  rows={2}
                  value={currentItem.customInstructions}
                  onChange={(e) => updateActiveItem({ customInstructions: e.target.value })}
                  placeholder="เช่น รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้ง หลังอาหารเช้า"
                  className="w-full text-sm font-bold text-red-700 bg-white border border-red-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Row 3: Warning / Caution */}
            <div>
              <label className="block text-xs font-semibold text-amber-800 mb-1">
                คำเตือน / ข้อควรระวังพิเศษ (จะแสดงกรอบสีส้มบนสติกเกอร์)
              </label>
              <input
                type="text"
                value={currentItem.warning || ''}
                onChange={(e) => updateActiveItem({ warning: e.target.value })}
                placeholder="เช่น ห้ามหยุดยาเอง สังเกตอาการข้อเท้าบวม หรือ ดื่มน้ำตามมากๆ"
                className="w-full text-xs bg-amber-50/60 border border-amber-300 rounded px-2.5 py-1.5 text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer action bar */}
      <div className="p-4 bg-slate-50 flex items-center justify-between rounded-b-xl">
        <div className="text-xs text-slate-500">
          พร้อมพิมพ์: <span className="font-semibold text-slate-800">{items.length} ดวงสติกเกอร์</span>
        </div>
        <button
          type="button"
          onClick={onPrintPreview}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm shadow-sm hover:shadow transition-all flex items-center gap-2"
        >
          <Pill className="w-4 h-4" />
          ดูตัวอย่างและพิมพ์สติกเกอร์ ({items.length})
        </button>
      </div>
    </div>
  );
};
