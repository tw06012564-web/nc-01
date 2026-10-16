import React from 'react';
import { PatientProfile, DispenseVisitRecord } from '../types/sticker';
import { formatThaiDate } from '../utils/thaiDate';
import { X, Calendar, Activity, Printer, History, AlertTriangle } from 'lucide-react';

interface PatientHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile | null;
  onPrintVisit: (patient: PatientProfile, visit: DispenseVisitRecord) => void;
}

export const PatientHistoryModal: React.FC<PatientHistoryModalProps> = ({
  isOpen,
  onClose,
  patient,
  onPrintVisit,
}) => {
  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 no-print">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                ประวัติการรับยาและการปรับยาย้อนหลัง: {patient.fullName}
              </h3>
              <p className="text-xs text-slate-300 font-mono">
                HN: {patient.hn} • อายุ {patient.age || '-'} ปี
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50">
          {/* Allergies and Diseases Banner */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-slate-500">โรคประจำตัว: </span>
              <span className="font-bold text-slate-900">{patient.diseases.join(', ') || 'ไม่มี'}</span>
            </div>
            {patient.allergies && patient.allergies !== 'ไม่มี' && patient.allergies !== 'ปฏิเสธประวัติแพ้ยา' && (
              <div className="flex items-center gap-1.5 text-red-600 font-bold bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>แพ้ยา: {patient.allergies}</span>
              </div>
            )}
          </div>

          {/* Timeline of Visits */}
          {patient.history.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
              ยังไม่มีประวัติการบันทึกการปรับยารอบก่อนหน้า (ประวัติจะถูกบันทึกเมื่อกด "บันทึกการปรับยา")
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-emerald-300">
              {patient.history.map((vis, idx) => (
                <div key={vis.id || idx} className="relative bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  {/* Timeline dot */}
                  <div className="absolute -left-6 top-4 w-3.5 h-3.5 rounded-full bg-emerald-600 ring-4 ring-white" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        มารับยาวันที่: {formatThaiDate(vis.visitDate)}
                      </span>
                      {vis.appointmentDate && (
                        <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                          นัดถัดไป: {formatThaiDate(vis.appointmentDate)}
                        </span>
                      )}
                    </div>
                    {vis.items && vis.items.length > 0 && (
                      <button
                        type="button"
                        onClick={() => onPrintVisit(patient, vis)}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded text-xs font-semibold flex items-center gap-1 border border-emerald-200 transition-colors self-start sm:self-auto cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        พิมพ์สติกเกอร์ชุดนี้ ({vis.items.length})
                      </button>
                    )}
                  </div>

                  {/* Vitals & Notes */}
                  <div className="py-2 text-xs text-slate-600 flex flex-wrap gap-4">
                    {vis.bp && (
                      <span><strong>BP:</strong> {vis.bp}</span>
                    )}
                    {vis.fbs && (
                      <span><strong>FBS:</strong> {vis.fbs}</span>
                    )}
                    {vis.recordedBy && (
                      <span className="text-slate-400">ผู้บันทึก: {vis.recordedBy}</span>
                    )}
                  </div>

                  {vis.adjustmentNotes && (
                    <div className="bg-amber-50 text-amber-900 p-2 rounded border border-amber-200 text-xs mb-2.5">
                      <strong>บันทึกการปรับยา:</strong> {vis.adjustmentNotes}
                    </div>
                  )}

                  {/* Medications given */}
                  {vis.items && vis.items.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-700">รายการยาที่จ่าย:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                        {vis.items.map((it, i) => (
                          <div key={i} className="p-1.5 rounded bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                            <span className="font-bold text-slate-800">{it.drugName}</span>
                            <span className="text-emerald-700 font-semibold">{it.quantity} {it.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:px-5 bg-white border-t border-slate-200 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
