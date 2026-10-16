import React, { useState } from 'react';
import { PatientInfo, PrescriptionItem, StickerSize, HospitalConfig } from '../types/sticker';
import { StickerView } from './StickerView';
import { Printer, X, Sliders, CheckCircle2, Copy, FileDown, Loader2 } from 'lucide-react';
import { downloadStickersPDF } from '../utils/pdfExport';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientInfo;
  items: PrescriptionItem[];
  onConfirmPrint: (selectedItems: PrescriptionItem[], size: StickerSize, copies: number) => void;
  hospitalConfig?: HospitalConfig;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  patient,
  items,
  onConfirmPrint,
  hospitalConfig,
}) => {
  const [stickerSize, setStickerSize] = useState<StickerSize>('thermal-80x50');
  const [selectedIds, setSelectedIds] = useState<string[]>(items.map(it => it.id));
  const [copies, setCopies] = useState<number>(1);
  const [showBarcode, setShowBarcode] = useState<boolean>(true);
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter(x => x !== id));
      }
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectAll = () => {
    setSelectedIds(items.map(it => it.id));
  };

  const handlePrint = () => {
    const itemsToPrint = items.filter(it => selectedIds.includes(it.id));
    onConfirmPrint(itemsToPrint, stickerSize, copies);
  };

  const handleDownloadPDF = async () => {
    try {
      setIsExportingPDF(true);
      const selectedItems = items.filter(it => selectedIds.includes(it.id));
      const elementIds: string[] = [];
      
      // Repeat for copies
      for (let c = 0; c < copies; c++) {
        for (const item of selectedItems) {
          elementIds.push(`modal-sticker-${item.id}`);
        }
      }

      const patientCleanName = (patient.fullName || 'ผู้ป่วย').replace(/[\s/\\:]/g, '_');
      const filename = `สติกเกอร์ยา_${patientCleanName}_${new Date().toISOString().split('T')[0]}.pdf`;
      const mode = stickerSize === 'a4-sheet' ? 'a4' : 'thermal-80x50';

      await downloadStickersPDF(elementIds, filename, mode);
    } catch (err) {
      console.error('PDF export failed', err);
      alert('เกิดข้อผิดพลาดในการสร้างไฟล์ PDF กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const selectedItemsToPreview = items.filter(it => selectedIds.includes(it.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                พิมพ์สติกเกอร์ / ดาวน์โหลดไฟล์ PDF
              </h3>
              <p className="text-xs text-slate-300">
                โรงพยาบาลส่งเสริมสุขภาพตำบลหนองชิ่ม • ขนาดสติกเกอร์ 80x50 มม.
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

        {/* Settings Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 sm:px-5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Format selector */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700">รูปแบบกระดาษ:</span>
              <select
                value={stickerSize}
                onChange={(e) => setStickerSize(e.target.value as StickerSize)}
                className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-medium focus:ring-1 focus:ring-emerald-500"
              >
                <option value="thermal-80x50">สติกเกอร์ความร้อน (Thermal 80 x 50 mm)</option>
                <option value="thermal-70x50">สติกเกอร์ความร้อน (Thermal 70 x 50 mm)</option>
                <option value="thermal-100x60">สติกเกอร์ความร้อน (Thermal 100 x 60 mm)</option>
                <option value="a4-sheet">กระดาษสติกเกอร์ A4 (A4 Sheet 2 คอลัมน์)</option>
              </select>
            </div>

            {/* Copies */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700">จำนวนชุด:</span>
              <input
                type="number"
                min="1"
                max="10"
                value={copies}
                onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-14 bg-white border border-slate-300 rounded px-2 py-1 text-center font-bold"
              />
            </div>

            {/* Barcode toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={showBarcode}
                onChange={(e) => setShowBarcode(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>แสดงบาร์โค้ดท้ายสติกเกอร์</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-emerald-700 hover:text-emerald-800 font-semibold underline"
            >
              เลือกทั้งหมด ({items.length})
            </button>
          </div>
        </div>

        {/* Content Preview Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100/70">
          <div className="mb-3 text-xs text-slate-500 flex items-center justify-between">
            <span>
              ตัวอย่างสติกเกอร์ ({selectedItemsToPreview.length} จาก {items.length} รายการ):
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">
              💡 สามารถดาวน์โหลดเป็นไฟล์ PDF หรือสั่งพิมพ์ไปยังเครื่องพิมพ์โดยตรงได้
            </span>
          </div>

          {/* Sticker Grid / Flow */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-center">
            {items.map((item, idx) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`relative w-full max-w-[380px] transition-all rounded-xl p-1.5 ${
                    isSelected ? 'ring-2 ring-emerald-500 bg-emerald-50/40' : 'opacity-40 grayscale-30 ring-1 ring-slate-200 bg-white'
                  }`}
                >
                  {/* Select Checkbox badge */}
                  <button
                    type="button"
                    onClick={() => toggleSelect(item.id)}
                    className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-xs rounded-full p-1 shadow-md border border-slate-200 text-xs flex items-center gap-1 px-2 font-semibold hover:bg-slate-50 transition-colors"
                  >
                    <CheckCircle2
                      className={`w-4 h-4 ${isSelected ? 'text-emerald-600 fill-emerald-100' : 'text-slate-300'}`}
                    />
                    <span className={isSelected ? 'text-emerald-800' : 'text-slate-400'}>
                      {isSelected ? 'เลือกพิมพ์' : 'ไม่พิมพ์'}
                    </span>
                  </button>

                  <StickerView
                    id={`modal-sticker-${item.id}`}
                    patient={patient}
                    item={item}
                    size={stickerSize}
                    showBarcode={showBarcode}
                    itemIndex={idx}
                    totalItems={items.length}
                    hospitalConfig={hospitalConfig}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600">
            รวมสติกเกอร์ทั้งหมด: <strong className="text-slate-900">{selectedIds.length * copies} ดวง</strong>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              ยกเลิก
            </button>

            {/* Download PDF button */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={selectedIds.length === 0 || isExportingPDF}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isExportingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังสร้าง PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>ดาวน์โหลด PDF ({selectedIds.length * copies} ดวง)</span>
                </>
              )}
            </button>

            {/* Direct Print button */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={selectedIds.length === 0}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>สั่งพิมพ์ทันที</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

