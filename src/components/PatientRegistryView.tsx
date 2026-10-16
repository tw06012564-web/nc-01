import React, { useState } from 'react';
import { PatientProfile, PrescriptionItem, DrugItem } from '../types/sticker';
import { formatThaiDate, getTodayString, addMonthsToDate } from '../utils/thaiDate';
import { 
  Users, 
  Search, 
  Plus, 
  Download, 
  Pill, 
  Calendar, 
  Activity, 
  Printer, 
  AlertTriangle, 
  History, 
  Edit3, 
  Trash2, 
  CheckCircle2,
  Phone,
  FileText
} from 'lucide-react';

interface PatientRegistryViewProps {
  patients: PatientProfile[];
  setPatients: React.Dispatch<React.SetStateAction<PatientProfile[]>>;
  onAdjustMedication: (patient: PatientProfile) => void;
  onPrintPatientStickers: (patient: PatientProfile) => void;
  onViewPatientHistory: (patient: PatientProfile) => void;
}

export const PatientRegistryView: React.FC<PatientRegistryViewProps> = ({
  patients,
  setPatients,
  onAdjustMedication,
  onPrintPatientStickers,
  onViewPatientHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState('all');
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);

  // New patient registration form state
  const [newPatient, setNewPatient] = useState<Partial<PatientProfile>>({
    hn: '',
    fullName: '',
    age: '',
    gender: 'ชาย',
    phone: '',
    diseases: ['ความดันโลหิตสูง'],
    allergies: 'ปฏิเสธประวัติแพ้ยา',
    lastDispenseDate: getTodayString(),
    nextAppointmentDate: addMonthsToDate(getTodayString(), 1),
    notes: ''
  });

  // Extract all distinct diseases
  const allDiseases = Array.from(
    new Set(patients.flatMap(p => p.diseases))
  );

  // Filtered patients
  const filteredPatients = patients.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      p.fullName.toLowerCase().includes(term) ||
      p.hn.toLowerCase().includes(term) ||
      (p.phone && p.phone.includes(term)) ||
      p.diseases.some(d => d.toLowerCase().includes(term)) ||
      p.currentPrescriptions.some(med => med.drugName.toLowerCase().includes(term));

    const matchesDisease = diseaseFilter === 'all' || p.diseases.includes(diseaseFilter);

    return matchesSearch && matchesDisease;
  });

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.fullName?.trim() || !newPatient.hn?.trim()) {
      alert('กรุณากรอกชื่อ-สกุล และเลข HN ของผู้ป่วย');
      return;
    }

    const created: PatientProfile = {
      id: 'pat-' + Date.now(),
      hn: newPatient.hn.trim(),
      fullName: newPatient.fullName.trim(),
      age: newPatient.age?.trim() || '',
      gender: newPatient.gender as any || 'ชาย',
      phone: newPatient.phone?.trim() || '',
      diseases: newPatient.diseases || [],
      allergies: newPatient.allergies?.trim() || 'ปฏิเสธประวัติแพ้ยา',
      lastDispenseDate: newPatient.lastDispenseDate || getTodayString(),
      nextAppointmentDate: newPatient.nextAppointmentDate || addMonthsToDate(getTodayString(), 1),
      notes: newPatient.notes?.trim() || '',
      currentPrescriptions: [],
      history: [],
      updatedAt: new Date().toISOString()
    };

    setPatients([created, ...patients]);
    setIsNewPatientModalOpen(false);

    // Reset form
    setNewPatient({
      hn: '',
      fullName: '',
      age: '',
      gender: 'ชาย',
      phone: '',
      diseases: ['ความดันโลหิตสูง'],
      allergies: 'ปฏิเสธประวัติแพ้ยา',
      lastDispenseDate: getTodayString(),
      nextAppointmentDate: addMonthsToDate(getTodayString(), 1),
      notes: ''
    });

    // Directly prompt to add medications
    onAdjustMedication(created);
  };

  const handleDeletePatient = (id: string, name: string) => {
    if (confirm(`ยืนยันลบข้อมูลผู้ป่วย "${name}" ออกจากทะเบียนหรือไม่?`)) {
      setPatients(patients.filter(p => p.id !== id));
    }
  };

  // Export patient ledger as CSV
  const handleExportCSV = () => {
    if (patients.length === 0) return;

    const headers = [
      'HN',
      'ชื่อ-นามสกุล',
      'อายุ',
      'เพศ',
      'เบอร์โทร',
      'โรคประจำตัว',
      'ประวัติแพ้ยา',
      'จำนวนยาประจำตัว',
      'รายการยาปัจจุบัน',
      'วันที่รับยาล่าสุด',
      'วันนัดครั้งต่อไป'
    ];

    const rows = patients.map(p => [
      p.hn,
      `"${p.fullName.replace(/"/g, '""')}"`,
      p.age || '-',
      p.gender || '-',
      p.phone || '-',
      `"${p.diseases.join('; ')}"`,
      `"${p.allergies}"`,
      String(p.currentPrescriptions.length),
      `"${p.currentPrescriptions.map(m => `${m.drugName} (${m.quantity} ${m.unit})`).join(' | ')}"`,
      formatThaiDate(p.lastDispenseDate),
      formatThaiDate(p.nextAppointmentDate)
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ทะเบียนการจ่ายยาคนไข้_รพสตหนองชิ่ม_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">
              ทะเบียนการจ่ายยาคนไข้ (Patient Medication Registry)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            บันทึกประวัติการจ่ายยาประจำตัว สามารถปรับเพิ่ม/ลดหรือเปลี่ยนยาสำหรับรอบนัดถัดไปได้ทันที
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> ส่งออก Excel
          </button>
          <button
            type="button"
            onClick={() => setIsNewPatientModalOpen(true)}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> ลงทะเบียนคนไข้ใหม่
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 sm:px-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้ป่วย, HN, ชื่อยาที่ทาน, หรือโรคประจำตัว..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-slate-600 font-semibold shrink-0">โรค:</span>
          <button
            type="button"
            onClick={() => setDiseaseFilter('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors shrink-0 ${
              diseaseFilter === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            ทั้งหมด ({patients.length})
          </button>
          {allDiseases.map(dis => (
            <button
              key={dis}
              type="button"
              onClick={() => setDiseaseFilter(dis)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors shrink-0 ${
                diseaseFilter === dis
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              {dis}
            </button>
          ))}
        </div>
      </div>

      {/* Patient Table */}
      <div className="overflow-x-auto">
        {filteredPatients.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">
            ไม่พบข้อมูลผู้ป่วยที่ตรงกับการค้นหา
          </div>
        ) : (
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">ข้อมูลผู้ป่วย / HN</th>
                <th className="px-4 py-3">โรคประจำตัว & แพ้ยา</th>
                <th className="px-4 py-3">ยาประจำตัวปัจจุบัน ({filteredPatients.reduce((acc, p) => acc + p.currentPrescriptions.length, 0)} รายการ)</th>
                <th className="px-4 py-3">รอบนัดถัดไป</th>
                <th className="px-4 py-3 text-right">การปรับยา / พิมพ์</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredPatients.map(p => {
                const hasAllergy = p.allergies && p.allergies !== 'ไม่มี' && p.allergies !== 'ปฏิเสธประวัติแพ้ยา';

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Patient Name & HN */}
                    <td className="px-4 py-3.5 align-top whitespace-nowrap">
                      <div className="font-extrabold text-sm text-slate-900">
                        {p.fullName}
                      </div>
                      <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                        HN: <span className="font-bold text-slate-700">{p.hn}</span>
                        {p.age && ` • อายุ: ${p.age} ปี`}
                      </div>
                      {p.phone && (
                        <div className="text-slate-400 text-[10px] flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" /> {p.phone}
                        </div>
                      )}
                    </td>

                    {/* Diseases & Allergies */}
                    <td className="px-4 py-3.5 align-top">
                      <div className="flex flex-wrap gap-1 mb-1">
                        {p.diseases.map(dis => (
                          <span
                            key={dis}
                            className="bg-slate-100 text-slate-800 font-medium px-2 py-0.5 rounded text-[11px] border border-slate-200"
                          >
                            {dis}
                          </span>
                        ))}
                      </div>
                      {hasAllergy ? (
                        <div className="inline-flex items-center gap-1 text-red-600 font-bold bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[10px]">
                          <AlertTriangle className="w-3 h-3" /> แพ้: {p.allergies}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[10px]">ไม่พบประวัติแพ้ยา</span>
                      )}
                    </td>

                    {/* Medications */}
                    <td className="px-4 py-3.5 align-top">
                      {p.currentPrescriptions.length === 0 ? (
                        <span className="text-slate-400 italic">ยังไม่มีรายการยาประจำตัว</span>
                      ) : (
                        <div className="space-y-1">
                          {p.currentPrescriptions.map(med => (
                            <div
                              key={med.id}
                              className="bg-slate-50 p-1.5 rounded border border-slate-200 text-xs flex items-center justify-between gap-2"
                            >
                              <div>
                                <span className="font-bold text-slate-900">{med.drugName}</span>
                                <span className="text-[10px] text-emerald-700 font-semibold ml-1.5">
                                  {med.category}
                                </span>
                              </div>
                              <span className="font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded text-[10px] shrink-0">
                                {med.quantity} {med.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Last & Next Dates */}
                    <td className="px-4 py-3.5 align-top whitespace-nowrap">
                      {p.nextAppointmentDate ? (
                        <div className="font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded border border-sky-200 text-xs inline-block">
                          📅 นัด: {formatThaiDate(p.nextAppointmentDate)}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                      <div className="text-[10px] text-slate-500 mt-1">
                        จ่ายยาล่าสุด: {formatThaiDate(p.lastDispenseDate)}
                      </div>
                    </td>

                    {/* Actions: Adjust Meds & Print */}
                    <td className="px-4 py-3.5 align-top text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Adjust / Refill for next visit */}
                        <button
                          type="button"
                          onClick={() => onAdjustMedication(p)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                          title="ปรับยาใหม่รอบหน้า / สั่งจ่ายยาสำหรับรอบนัดถัดไป"
                        >
                          <Activity className="w-3.5 h-3.5" />
                          <span>ปรับยาใหม่รอบหน้า</span>
                        </button>

                        {/* Direct Print current sticker set */}
                        {p.currentPrescriptions.length > 0 && (
                          <button
                            type="button"
                            onClick={() => onPrintPatientStickers(p)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-200 transition-colors cursor-pointer"
                            title="พิมพ์สติกเกอร์ยาชุดนี้ทันที"
                          >
                            <Printer className="w-3.5 h-3.5 text-emerald-600" />
                            <span>พิมพ์สติกเกอร์</span>
                          </button>
                        )}

                        {/* History */}
                        <button
                          type="button"
                          onClick={() => onViewPatientHistory(p)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="ดูประวัติการจ่ายยาย้อนหลัง"
                        >
                          <History className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDeletePatient(p.id, p.fullName)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="ลบผู้ป่วย"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* New Patient Registration Modal */}
      {isNewPatientModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 no-print">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 bg-emerald-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-200" />
                ลงทะเบียนคนไข้ใหม่ (รพ.สต.หนองชิ่ม)
              </h3>
              <button
                type="button"
                onClick={() => setIsNewPatientModalOpen(false)}
                className="text-emerald-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    เลขประจำตัวผู้ป่วย (HN) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPatient.hn}
                    onChange={(e) => setNewPatient({ ...newPatient, hn: e.target.value })}
                    placeholder="เช่น 6701234"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-mono text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    อายุ (ปี)
                  </label>
                  <input
                    type="text"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                    placeholder="เช่น 62"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ชื่อ - นามสกุล ผู้ป่วย *
                </label>
                <input
                  type="text"
                  required
                  value={newPatient.fullName}
                  onChange={(e) => setNewPatient({ ...newPatient, fullName: e.target.value })}
                  placeholder="เช่น นายสมศักดิ์ รักดี"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-semibold text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    เบอร์โทรศัพท์ติดต่อ
                  </label>
                  <input
                    type="text"
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    placeholder="เช่น 081-xxx-xxxx"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    โรคประจำตัว (คั่นด้วยจุลภาค)
                  </label>
                  <input
                    type="text"
                    value={newPatient.diseases?.join(', ')}
                    onChange={(e) => setNewPatient({ ...newPatient, diseases: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    placeholder="เช่น ความดันโลหิตสูง, เบาหวาน"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-red-700 mb-1">
                  ประวัติการแพ้ยา (สำคัญมาก)
                </label>
                <input
                  type="text"
                  value={newPatient.allergies}
                  onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                  placeholder="เช่น ปฏิเสธประวัติแพ้ยา หรือ แพ้ Penicillin"
                  className="w-full bg-red-50/50 border border-red-200 rounded-lg px-2.5 py-2 text-xs font-semibold text-red-900 focus:bg-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    วันที่ขึ้นทะเบียน
                  </label>
                  <input
                    type="date"
                    value={newPatient.lastDispenseDate}
                    onChange={(e) => setNewPatient({ ...newPatient, lastDispenseDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    วันนัดครั้งต่อไป
                  </label>
                  <input
                    type="date"
                    value={newPatient.nextAppointmentDate}
                    onChange={(e) => setNewPatient({ ...newPatient, nextAppointmentDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewPatientModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  บันทึกและจัดยาต่อ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
