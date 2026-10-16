import React, { useState } from 'react';
import { HistoryRecord, PatientInfo, PrescriptionItem } from '../types/sticker';
import { formatThaiDate } from '../utils/thaiDate';
import { Search, Download, Trash2, Printer, RotateCcw, Calendar, FileText, CheckCircle2 } from 'lucide-react';

interface HistoryRegistryProps {
  history: HistoryRecord[];
  onClearHistory: () => void;
  onDeleteRecord: (id: string) => void;
  onReprint: (record: HistoryRecord) => void;
  onLoadRecord: (record: HistoryRecord) => void;
  onDownloadPDF?: (record: HistoryRecord) => void;
}

export const HistoryRegistry: React.FC<HistoryRegistryProps> = ({
  history,
  onClearHistory,
  onDeleteRecord,
  onReprint,
  onLoadRecord,
  onDownloadPDF,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Filter history
  const filtered = history.filter(record => {
    const searchMatch =
      record.patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.patient.hn && record.patient.hn.toLowerCase().includes(searchTerm.toLowerCase())) ||
      record.items.some(it => it.drugName.toLowerCase().includes(searchTerm.toLowerCase()));

    const dateMatch = !dateFilter || record.patient.dispenseDate === dateFilter;

    return searchMatch && dateMatch;
  });

  // Export history to CSV
  const handleExportCSV = () => {
    if (history.length === 0) {
      alert('ไม่มีข้อมูลในทะเบียนเพื่อส่งออก');
      return;
    }

    const headers = [
      'ลำดับ',
      'วันที่จ่ายยา',
      'HN',
      'ชื่อ-นามสกุลผู้ป่วย',
      'วันนัดครั้งต่อไป',
      'ชื่อยา',
      'กลุ่มยา',
      'จำนวน',
      'หน่วย',
      'วิธีรับประทาน',
      'คำเตือน'
    ];

    const rows: string[][] = [];
    let count = 1;

    history.forEach(rec => {
      rec.items.forEach(item => {
        rows.push([
          String(count++),
          formatThaiDate(rec.patient.dispenseDate),
          rec.patient.hn || '-',
          `"${rec.patient.fullName.replace(/"/g, '""')}"`,
          rec.patient.appointmentDate ? formatThaiDate(rec.patient.appointmentDate) : '-',
          `"${item.drugName.replace(/"/g, '""')}"`,
          `"${item.category.replace(/"/g, '""')}"`,
          String(item.quantity),
          item.unit,
          `"${item.customInstructions.replace(/"/g, '""')}"`,
          `"${(item.warning || '').replace(/"/g, '""')}"`
        ]);
      });
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ทะเบียนสติกเกอร์ยา_รพสตหนองชิ่ม_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            สมุดทะเบียนสติกเกอร์ยาที่จ่าย
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            บันทึกประวัติการสั่งพิมพ์สติกเกอร์ยา รพ.สต.หนองชิ่ม ทั้งหมด ({history.length} รายการบันทึก)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={history.length === 0}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 disabled:opacity-50 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> ส่งออก Excel / CSV
          </button>
          {history.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm('คุณต้องการล้างประวัติทะเบียนทั้งหมดหรือไม่?')) {
                  onClearHistory();
                }
              }}
              className="px-3 py-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg font-medium transition-colors"
            >
              ล้างประวัติ
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3 sm:px-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้ป่วย, HN, ชื่อยา..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-slate-600 font-medium">กรองตามวันที่จ่าย:</span>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs"
          />
          {dateFilter && (
            <button
              type="button"
              onClick={() => setDateFilter('')}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>
      </div>

      {/* Registry Table */}
      <div className="overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">
            {history.length === 0
              ? 'ยังไม่มีประวัติการพิมพ์สติกเกอร์ (เมื่อพิมพ์สติกเกอร์ ระบบจะบันทึกเข้าทะเบียนโดยอัตโนมัติ)'
              : 'ไม่พบรายการที่ตรงกับคำค้นหา'}
          </div>
        ) : (
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">วันที่ / เวลา</th>
                <th className="px-4 py-3">ข้อมูลผู้ป่วย</th>
                <th className="px-4 py-3">วันนัดตรวจ</th>
                <th className="px-4 py-3">รายการยาและจำนวน (เม็ด)</th>
                <th className="px-4 py-3 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5 whitespace-nowrap align-top">
                    <div className="font-bold text-slate-900">
                      {formatThaiDate(record.patient.dispenseDate)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {new Date(record.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                    </div>
                  </td>

                  <td className="px-4 py-3.5 align-top">
                    <div className="font-bold text-sm text-slate-900">
                      {record.patient.fullName}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      {record.patient.hn ? `HN: ${record.patient.hn}` : '-'}
                      {record.patient.age ? ` (อายุ ${record.patient.age} ปี)` : ''}
                    </div>
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap align-top">
                    {record.patient.appointmentDate ? (
                      <span className="font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        นัด: {formatThaiDate(record.patient.appointmentDate)}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 align-top">
                    <div className="space-y-1.5">
                      {record.items.map((it, idx) => (
                        <div key={idx} className="bg-slate-50 p-1.5 rounded border border-slate-200 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-900">{it.drugName}</span>
                            <span className="font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded text-[11px]">
                              {it.quantity} {it.unit}
                            </span>
                          </div>
                          <div className="text-[11px] text-emerald-700 font-medium">
                            กลุ่ม: {it.category}
                          </div>
                          <div className="text-[11px] text-red-600 font-semibold mt-0.5">
                            วิธีใช้: {it.customInstructions}
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-right whitespace-nowrap align-top">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onLoadRecord(record)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="โหลดข้อมูลนี้กลับเข้าสู่ฟอร์มเพื่อแก้ไขหรือพิมพ์"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> โหลดฟอร์ม
                      </button>
                      <button
                        type="button"
                        onClick={() => onReprint(record)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors"
                        title="พิมพ์สติกเกอร์ชุดนี้ซ้ำ"
                      >
                        <Printer className="w-3.5 h-3.5" /> พิมพ์ซ้ำ
                      </button>
                      {onDownloadPDF && (
                        <button
                          type="button"
                          onClick={() => onDownloadPDF(record)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors"
                          title="ดาวน์โหลดไฟล์ PDF"
                        >
                          PDF
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onDeleteRecord(record.id)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="ลบรายการ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
