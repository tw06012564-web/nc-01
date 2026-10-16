import { PatientProfile } from '../types/sticker';
import { getTodayString, addMonthsToDate } from '../utils/thaiDate';

const today = getTodayString();

export const DEFAULT_PATIENTS: PatientProfile[] = [
  {
    id: 'pat-1',
    hn: '6704128',
    fullName: 'นายสมชาย ใจดี',
    age: '62',
    gender: 'ชาย',
    phone: '081-234-5678',
    diseases: ['ความดันโลหิตสูง'],
    allergies: 'ปฏิเสธประวัติแพ้ยา',
    lastDispenseDate: today,
    nextAppointmentDate: '2024-05-15', // Prompt example: 15 พ.ค. 2567
    notes: 'BP: 138/84 mmHg, ชีพจร 72 ครั้ง/นาที แนะนำลดอาหารเค็ม',
    currentPrescriptions: [
      {
        id: 'pat1-med-1',
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
        warning: 'รับประทานยาอย่างสม่ำเสมอ ห้ามหยุดยาเอง สังเกตอาการข้อเท้าบวม',
        status: 'active'
      },
      {
        id: 'pat1-med-2',
        drugId: 'drug-17',
        drugName: 'Losartan 50 mg.',
        category: 'ยาลดความดันโลหิต',
        quantity: 30,
        unit: 'เม็ด',
        dosage: 'ครั้งละ 1 เม็ด',
        frequency: 'วันละ 1 ครั้ง',
        mealTiming: 'after',
        mealTimingMinutes: 'หลังอาหารเช้า',
        timesPerDay: { morning: true, noon: false, evening: false, night: false },
        customInstructions: 'รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้ง หลังอาหารเช้า',
        warning: 'รับประทานยาอย่างต่อเนื่อง ห้ามหยุดยาเองแม้ความดันจะปกติแล้ว',
        status: 'active'
      }
    ],
    history: [
      {
        id: 'vis-1-1',
        visitDate: addMonthsToDate(today, -2),
        appointmentDate: today,
        bp: '142/88 mmHg',
        items: [
          {
            id: 'pat1-h1-1',
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
            status: 'active'
          }
        ],
        adjustmentNotes: 'เริ่มยาความดัน Amlodipine 5 mg นัดติดตามผล 2 เดือน',
        recordedBy: 'admin01',
        timestamp: new Date().toISOString()
      }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'pat-2',
    hn: '6705592',
    fullName: 'นางสมศรี รักษ์สุข',
    age: '58',
    gender: 'หญิง',
    phone: '089-876-5432',
    diseases: ['เบาหวานชนิดที่ 2', 'ไขมันในเลือดสูง'],
    allergies: 'ปฏิเสธประวัติแพ้ยา',
    lastDispenseDate: today,
    nextAppointmentDate: addMonthsToDate(today, 2),
    notes: 'FBS: 126 mg/dL, HbA1c 6.9%, BP: 124/78 mmHg',
    currentPrescriptions: [
      {
        id: 'pat2-med-1',
        drugId: 'drug-19',
        drugName: 'Metformin 500 mg.',
        category: 'ยาลดระดับน้ำตาลในเลือด',
        quantity: 60,
        unit: 'เม็ด',
        dosage: 'ครั้งละ 1 เม็ด',
        frequency: 'วันละ 2 ครั้ง',
        mealTiming: 'after',
        mealTimingMinutes: 'หลังอาหารทันที หรือพร้อมอาหาร',
        timesPerDay: { morning: true, noon: false, evening: true, night: false },
        customInstructions: 'รับประทานครั้งละ 1 เม็ด วันละ 2 ครั้ง หลังอาหารเช้า - เย็น ทันที',
        warning: 'รับประทานพร้อมอาหารหรือหลังอาหารทันทีเพื่อลดอาการคลื่นไส้ แน่นท้อง',
        status: 'active'
      },
      {
        id: 'pat2-med-2',
        drugId: 'drug-14',
        drugName: 'Glipizide 5 mg.',
        category: 'ยาลดระดับน้ำตาลในเลือด',
        quantity: 30,
        unit: 'เม็ด',
        dosage: 'ครั้งละ 1 เม็ด',
        frequency: 'วันละ 1 ครั้ง',
        mealTiming: 'before',
        mealTimingMinutes: 'ก่อนอาหารเช้า 30 นาที',
        timesPerDay: { morning: true, noon: false, evening: false, night: false },
        customInstructions: 'รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้ง ก่อนอาหารเช้า 30 นาที',
        warning: 'ต้องรับประทานอาหารหลังทานยาเสมอ ระวังภาวะน้ำตาลต่ำ (ใจสั่น หน้ามืด เหงื่อออก)',
        status: 'active'
      },
      {
        id: 'pat2-med-3',
        drugId: 'drug-23',
        drugName: 'Simvastatin 20 mg.',
        category: 'ยาลดไขมันในเลือด',
        quantity: 30,
        unit: 'เม็ด',
        dosage: 'ครั้งละ 1 เม็ด',
        frequency: 'วันละ 1 ครั้ง',
        mealTiming: 'bedtime',
        mealTimingMinutes: 'ก่อนนอน',
        timesPerDay: { morning: false, noon: false, evening: false, night: true },
        customInstructions: 'รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้ง ก่อนนอน',
        warning: 'รับประทานก่อนนอน หากมีอาการปวดเมื่อยกล้ามเนื้อผิดปกติ ให้รีบพบแพทย์',
        status: 'active'
      }
    ],
    history: [
      {
        id: 'vis-2-1',
        visitDate: addMonthsToDate(today, -3),
        appointmentDate: today,
        fbs: '148 mg/dL',
        bp: '128/80 mmHg',
        items: [],
        adjustmentNotes: 'ค่าน้ำตาลยังค่อนข้างสูง เพิ่มยาควบคุมอาหารและออกกำลังกาย',
        recordedBy: 'admin01',
        timestamp: new Date().toISOString()
      }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'pat-3',
    hn: '6703810',
    fullName: 'นายวิชัย สุขเกษม',
    age: '54',
    gender: 'ชาย',
    phone: '086-555-1234',
    diseases: ['โรคเก๊าท์', 'ความดันโลหิตสูง'],
    allergies: 'แพ้ยา Sulfa (มีผื่นคัน)',
    lastDispenseDate: today,
    nextAppointmentDate: addMonthsToDate(today, 1),
    notes: 'Uric acid: 7.8 mg/dL, ช่วงนี้ไม่มีข้ออักเสบเฉียบพลัน',
    currentPrescriptions: [
      {
        id: 'pat3-med-1',
        drugId: 'drug-1',
        drugName: 'Allopurinol 100 mg.',
        category: 'ยาลดกรดยูริก (รักษาโรคเก๊าท์)',
        quantity: 30,
        unit: 'เม็ด',
        dosage: 'ครั้งละ 1 เม็ด',
        frequency: 'วันละ 1 ครั้ง',
        mealTiming: 'after',
        mealTimingMinutes: 'หลังอาหารเช้า',
        timesPerDay: { morning: true, noon: false, evening: false, night: false },
        customInstructions: 'รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้ง หลังอาหารเช้า',
        warning: 'ควรดื่มน้ำมากๆ วันละ 2-3 ลิตร หากมีผื่นขึ้นให้หยุดยาและพบแพทย์ทันที',
        status: 'active'
      },
      {
        id: 'pat3-med-2',
        drugId: 'drug-7',
        drugName: 'Colchicine 0.6 mg',
        category: 'ยารักษาอาการเก๊าท์เฉียบพลัน',
        quantity: 10,
        unit: 'เม็ด',
        dosage: 'ครั้งละ 1 เม็ด',
        frequency: 'วันละ 1 ครั้ง',
        mealTiming: 'after',
        mealTimingMinutes: 'หลังอาหาร',
        timesPerDay: { morning: true, noon: false, evening: false, night: false },
        customInstructions: 'รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้ง หลังอาหารเช้า (หรือเมื่อปวดข้อเก๊าท์)',
        warning: 'หากมีอาการท้องเสียรุนแรง คลื่นไส้ หรืออาเจียน ให้หยุดยาและแจ้งแพทย์',
        status: 'active'
      },
      {
        id: 'pat3-med-3',
        drugId: 'drug-9',
        drugName: 'Enalapril 5 mg',
        category: 'ยาลดความดันโลหิต',
        quantity: 30,
        unit: 'เม็ด',
        dosage: 'ครั้งละ 1 เม็ด',
        frequency: 'วันละ 1 ครั้ง',
        mealTiming: 'after',
        mealTimingMinutes: 'หลังอาหารเช้า',
        timesPerDay: { morning: true, noon: false, evening: false, night: false },
        customInstructions: 'รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้ง หลังอาหารเช้า',
        warning: 'อาจพบอาการไอแห้งๆ ได้ หากไอมากจนรบกวนชีวิตประจำวันให้ปรึกษาแพทย์',
        status: 'active'
      }
    ],
    history: [],
    updatedAt: new Date().toISOString()
  }
];
