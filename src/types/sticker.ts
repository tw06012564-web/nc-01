export interface DrugItem {
  id: string;
  name: string; // e.g. "Amlodipine 5 mg."
  genericName?: string;
  category: string; // e.g. "ยาลดความดันโลหิต"
  defaultQuantity: number;
  unit: string; // "เม็ด", "ขวด", "แผง", "หลอด", "ซอง", "ถุง"
  dosage: string; // "ครั้งละ 1 เม็ด"
  frequency: string; // "วันละ 1 ครั้ง"
  mealTiming: 'before' | 'after' | 'with' | 'bedtime' | 'as_needed'; // ก่อนอาหาร, หลังอาหาร, พร้อมอาหาร, ก่อนนอน, เมื่อมีอาการ
  mealTimingMinutes?: string; // เช่น 30 นาที, ทันที
  timesPerDay: {
    morning: boolean;
    noon: boolean;
    evening: boolean;
    night: boolean;
  };
  customInstructions?: string;
  warning?: string; // คำเตือนหรือข้อควรระวัง เช่น "ดื่มน้ำตามมากๆ", "ห้ามเคี้ยวยา"
  stock?: number; // ยอดคงเหลือในคลัง
  minStock?: number; // ระดับเตือนยาใกล้หมด
  formType?: 'ยาเม็ด' | 'ยาน้ำ' | 'ยาฉีดและสารน้ำ' | 'ยาทาภายนอก' | 'ยาสมุนไพร' | 'เวชภัณฑ์';
  lotNumber?: string;
  expiryDate?: string;
}

export interface StockTransaction {
  id: string;
  drugId: string;
  drugName: string;
  type: 'in' | 'out' | 'dispense'; // รับเข้า (in) | เบิกจ่ายทั่วไป (out) | ตัดจ่ายตามคนไข้ (dispense)
  amount: number;
  unit: string;
  balanceAfter: number;
  patientName?: string;
  hn?: string;
  note?: string;
  date: string; // YYYY-MM-DD
  recordedBy: string;
  timestamp: string;
}

export interface PrescriptionItem {
  id: string;
  drugId: string;
  drugName: string;
  category: string; // e.g. "ยาลดความดันโลหิต"
  quantity: number;
  unit: string; // default "เม็ด"
  dosage: string; // "ครั้งละ 1 เม็ด"
  frequency: string; // "วันละ 1 ครั้ง"
  mealTiming: 'before' | 'after' | 'with' | 'bedtime' | 'as_needed';
  mealTimingMinutes?: string;
  timesPerDay: {
    morning: boolean;
    noon: boolean;
    evening: boolean;
    night: boolean;
  };
  customInstructions: string;
  warning?: string;
  status?: 'active' | 'changed' | 'discontinued'; // สถานะการจ่ายรอบนี้
  changeReason?: string; // เหตุผลที่ปรับยา เช่น "เพิ่มขนาดยาเนื่องจากความดันยังสูง"
}

export interface PatientInfo {
  hn: string;
  fullName: string;
  age?: string;
  phone?: string;
  allergies?: string; // ข้อมูลการแพ้ยา
  diseases?: string[]; // โรคประจำตัว เช่น ความดันโลหิตสูง, เบาหวาน
  dispenseDate: string; // YYYY-MM-DD
  appointmentDate: string; // YYYY-MM-DD
  note?: string;
}

export interface DispenseVisitRecord {
  id: string;
  visitDate: string; // YYYY-MM-DD
  appointmentDate: string; // YYYY-MM-DD
  bp?: string; // ความดันโลหิต เช่น 130/85 mmHg
  fbs?: string; // ระดับน้ำตาล เช่น 110 mg/dL
  items: PrescriptionItem[];
  adjustmentNotes?: string; // บันทึกการปรับยาในรอบนี้
  recordedBy?: string; // ผู้บันทึก
  timestamp: string;
}

export interface PatientProfile {
  id: string;
  hn: string;
  fullName: string;
  age?: string;
  gender?: 'ชาย' | 'หญิง';
  phone?: string;
  diseases: string[];
  allergies: string;
  currentPrescriptions: PrescriptionItem[]; // ชุดยาปัจจุบัน
  lastDispenseDate: string;
  nextAppointmentDate: string;
  notes?: string;
  history: DispenseVisitRecord[]; // ประวัติการรับยาแต่ละรอบ
  updatedAt: string;
}

export interface HistoryRecord {
  id: string;
  timestamp: string;
  patient: PatientInfo;
  items: PrescriptionItem[];
}

export type StickerSize = 'thermal-80x50' | 'thermal-70x50' | 'thermal-100x60' | 'a4-sheet';

export interface HospitalConfig {
  name: string; // ชื่อโรงพยาบาล/รพ.สต. เช่น 'โรงพยาบาลส่งเสริมสุขภาพตำบลหนองชิ่ม'
  subName?: string; // ชื่อภาษาอังกฤษ เช่น 'Nong Chim Sub-district Health Promoting Hospital'
  hcode?: string; // รหัสสถานพยาบาล เช่น '02078'
  district: string; // อำเภอ/จังหวัด เช่น 'อำเภอแหลมสิงห์ จังหวัดจันทบุรี'
  phone: string; // เบอร์ติดต่อ เช่น '039-444289'
  phoneDisplay: string; // ข้อความแสดงเบอร์โทร เช่น 'โทร 039-444289'
  logoUrl?: string; // Base64 data URL หรือ image URL
  logoType?: 'default-cross' | 'moph' | 'custom'; // กากบาทเขียว | กระทรวงสาธารณสุข | อัปโหลดเอง
  headerBgColor?: string; // สีพื้นหลังแถบหัวกระดาษ (default: #bbf7d0)
  headerTextColor?: string; // สีตัวหนังสือแถบหัวกระดาษ (default: #14532d)
  showLogoOnSticker?: boolean; // แสดง logo บนสติกเกอร์ (default: true)
  defaultStickerSize?: StickerSize; // ขนาดสติกเกอร์เริ่มต้น (default: 'thermal-80x50')
  showBarcodeDefault?: boolean; // แสดงบาร์โค้ดท้ายสติกเกอร์ (default: true)
}
