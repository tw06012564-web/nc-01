import React from 'react';
import { PatientInfo, PrescriptionItem, StickerSize, HospitalConfig } from '../types/sticker';
import { HOSPITAL_CONFIG } from '../data/defaultDrugs';
import { formatThaiDate } from '../utils/thaiDate';
import { Barcode } from './BarcodeQR';
import { HospitalLogo } from './HospitalLogo';

interface StickerViewProps {
  id?: string;
  patient: PatientInfo;
  item: PrescriptionItem;
  size?: StickerSize;
  className?: string;
  showBarcode?: boolean;
  itemIndex?: number;
  totalItems?: number;
  hospitalConfig?: HospitalConfig;
}

export const StickerView: React.FC<StickerViewProps> = ({
  id,
  patient,
  item,
  size = 'thermal-80x50',
  className = '',
  showBarcode = true,
  itemIndex,
  totalItems,
  hospitalConfig,
}) => {
  const hospital = hospitalConfig || HOSPITAL_CONFIG;

  // Format Thai dates
  const dispenseDateThai = formatThaiDate(patient.dispenseDate, false);
  const appointmentDateThai = patient.appointmentDate 
    ? formatThaiDate(patient.appointmentDate, false)
    : '';

  // Determine meal timing text in Thai
  const getMealTimingDisplay = () => {
    switch (item.mealTiming) {
      case 'before':
        return item.mealTimingMinutes ? `ก่อนอาหาร (${item.mealTimingMinutes})` : 'ก่อนอาหาร (30 นาที)';
      case 'after':
        return item.mealTimingMinutes ? `หลังอาหาร (${item.mealTimingMinutes})` : 'หลังอาหารทันที';
      case 'with':
        return 'พร้อมอาหาร';
      case 'bedtime':
        return 'ก่อนนอน';
      case 'as_needed':
        return 'เมื่อมีอาการปวด / มีไข้';
      default:
        return 'หลังอาหาร';
    }
  };

  return (
    <div
      id={id}
      className={`sticker-card relative bg-white border border-slate-300 rounded shadow-sm overflow-hidden flex flex-col justify-between font-['Sarabun',sans-serif] text-slate-900 select-none ${className}`}
      style={{
        // Standard proportions based on 80mm x 50mm (1.6 : 1 ratio)
        width: '100%',
        maxWidth: '380px',
        minHeight: '238px',
        boxSizing: 'border-box',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    >
      {/* 1. หัวกระดาษแถบสีเขียวอ่อน: โรงพยาบาลส่งเสริมสุขภาพตำบลหนองชิ่ม */}
      <div 
        className="w-full px-2.5 py-1 flex items-center justify-between border-b border-emerald-200"
        style={{ 
          backgroundColor: hospital.headerBgColor || '#bbf7d0', 
          color: hospital.headerTextColor || '#14532d' 
        }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Hospital Logo / Symbol */}
          {hospital.showLogoOnSticker !== false && (
            <HospitalLogo config={hospital} size="sm" variant="circle" />
          )}
          <span className="font-bold text-[13px] sm:text-[14px] leading-tight truncate tracking-tight">
            {hospital.name}
          </span>
        </div>
        {totalItems && totalItems > 1 && itemIndex !== undefined && (
          <span className="text-[10px] font-semibold px-1 py-0.2 bg-emerald-200/80 rounded text-emerald-900 shrink-0 ml-1">
            {itemIndex + 1}/{totalItems}
          </span>
        )}
      </div>

      {/* Main Body */}
      <div className="p-2.5 flex-1 flex flex-col justify-between space-y-1.5 text-[12px]">
        {/* 2. ข้อมูลผู้ป่วยและวันที่: ชื่อ นามสกุล และ วันที่/เดือน/ปี */}
        <div className="flex items-start justify-between border-b border-dashed border-slate-200 pb-1 gap-2 leading-tight">
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-[11px] text-slate-600 shrink-0 font-medium">ชื่อ-สกุล:</span>
              <span className="font-bold text-[14px] text-slate-900 truncate">
                {patient.fullName || 'ผู้รับบริการ (ทั่วไป)'}
              </span>
            </div>
            {patient.hn && (
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                HN: <span className="font-semibold text-slate-700">{patient.hn}</span>
                {patient.age && ` • อายุ: ${patient.age} ปี`}
              </div>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] text-slate-500">วันที่:</div>
            <div className="font-semibold text-[11px] text-slate-800">
              {dispenseDateThai || '15 พ.ค. 2567'}
            </div>
          </div>
        </div>

        {/* 3. แถบกลุ่มยาเน้นพื้นหลังสีเขียว: ยาลดความดันโลหิต (ตัวอย่าง) */}
        <div 
          className="w-full py-0.5 px-2 text-center rounded text-white font-bold text-[12px] tracking-wide shadow-xs flex items-center justify-center"
          style={{ backgroundColor: '#15803d' }} // Solid green background
        >
          <span className="truncate">
            กลุ่ม: {item.category || 'ยารักษาโรค'}
          </span>
        </div>

        {/* 4. ชื่อยาและจำนวน: ใส่หน่วยเป็นเม็ด */}
        <div className="flex items-baseline justify-between gap-1 pt-0.5">
          <div className="font-extrabold text-[15px] sm:text-[16px] text-slate-900 tracking-tight leading-tight min-w-0">
            {item.drugName || 'Amlodipine 5 mg.'}
          </div>
          <div className="shrink-0 text-right">
            <span className="text-[11px] text-slate-600 font-medium">จำนวน: </span>
            <span className="font-extrabold text-[14px] text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              {item.quantity || 30} {item.unit || 'เม็ด'}
            </span>
          </div>
        </div>

        {/* 5. วิธีรับประทานเน้นสีแดงชัดเจน */}
        <div className="bg-red-50/70 border border-red-200 rounded p-1.5 my-0.5">
          <div className="text-red-700 font-bold text-[13px] sm:text-[14px] leading-snug">
            {item.customInstructions || `รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้ง หลังอาหารเช้า`}
          </div>

          {/* Detailed visual meal checkboxes (เช้า กลางวัน เย็น ก่อนนอน) */}
          <div className="flex items-center justify-between text-[11px] font-semibold pt-1 mt-1 border-t border-red-200/60 text-red-700">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 cursor-default">
                <span className={`inline-block w-3.5 h-3.5 border rounded-xs text-[9px] text-center leading-3 font-bold ${
                  item.timesPerDay?.morning ? 'bg-red-600 text-white border-red-600' : 'bg-white border-red-300 text-transparent'
                }`}>✓</span>
                <span>เช้า</span>
              </label>
              <label className="flex items-center gap-1 cursor-default">
                <span className={`inline-block w-3.5 h-3.5 border rounded-xs text-[9px] text-center leading-3 font-bold ${
                  item.timesPerDay?.noon ? 'bg-red-600 text-white border-red-600' : 'bg-white border-red-300 text-transparent'
                }`}>✓</span>
                <span>กลางวัน</span>
              </label>
              <label className="flex items-center gap-1 cursor-default">
                <span className={`inline-block w-3.5 h-3.5 border rounded-xs text-[9px] text-center leading-3 font-bold ${
                  item.timesPerDay?.evening ? 'bg-red-600 text-white border-red-600' : 'bg-white border-red-300 text-transparent'
                }`}>✓</span>
                <span>เย็น</span>
              </label>
              <label className="flex items-center gap-1 cursor-default">
                <span className={`inline-block w-3.5 h-3.5 border rounded-xs text-[9px] text-center leading-3 font-bold ${
                  item.timesPerDay?.night ? 'bg-red-600 text-white border-red-600' : 'bg-white border-red-300 text-transparent'
                }`}>✓</span>
                <span>ก่อนนอน</span>
              </label>
            </div>
            <div className="text-[10px] text-red-950 font-bold bg-red-100/80 px-1 py-0.2 rounded">
              {getMealTimingDisplay()}
            </div>
          </div>
        </div>

        {/* Warning / Caution (if present) */}
        {item.warning && (
          <div className="text-[10px] text-amber-900 bg-amber-50/80 border border-amber-200 px-1.5 py-0.5 rounded leading-tight flex items-start gap-1">
            <span className="font-bold text-amber-700 shrink-0">คำเตือน:</span>
            <span className="truncate">{item.warning}</span>
          </div>
        )}

        {/* 6. แถบวันนัดพื้นหลังสีฟ้าด้านล่าง: นัดวันที่ 15 พ.ค. 2567 (ตัวอย่าง) */}
        {appointmentDateThai ? (
          <div 
            className="w-full py-1 px-2 text-center rounded text-white font-bold text-[12px] shadow-xs flex items-center justify-center gap-1"
            style={{ backgroundColor: '#0284c7' }} // Blue background as requested
          >
            <span>📅 นัดวันที่ {appointmentDateThai}</span>
          </div>
        ) : (
          <div 
            className="w-full py-0.5 px-2 text-center rounded text-white font-medium text-[11px] shadow-xs flex items-center justify-center opacity-80"
            style={{ backgroundColor: '#0284c7' }}
          >
            <span>นัดวันที่ 15 พ.ค. 2567 (ตัวอย่าง)</span>
          </div>
        )}
      </div>

      {/* 7. เบอร์ติดต่อ: โทร 039-444289 ให้เอาไว้ท้ายล่างสติ๊กเกอร์ */}
      <div className="w-full px-2.5 py-1 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-700">
        <div className="font-bold flex items-center gap-1 text-slate-800">
          <span>{hospital.phoneDisplay || `โทร ${hospital.phone}`}</span>
        </div>
        {showBarcode && (
          <div className="shrink-0 flex items-center">
            <Barcode code={patient.hn || item.drugId || '74190'} height={14} />
          </div>
        )}
      </div>
    </div>
  );
};
