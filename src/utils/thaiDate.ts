const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

/**
 * Convert YYYY-MM-DD to Thai Date format e.g. "15 พ.ค. 2567"
 */
export function formatThaiDate(dateString: string, isFull: boolean = false): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const day = date.getDate();
  const monthIdx = date.getMonth();
  const buddhistYear = date.getFullYear() + 543;

  if (isFull) {
    return `${day} ${THAI_MONTHS_FULL[monthIdx]} ${buddhistYear}`;
  }
  return `${day} ${THAI_MONTHS_SHORT[monthIdx]} ${buddhistYear}`;
}

/**
 * Get today's date in YYYY-MM-DD
 */
export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Add days/months to date and return YYYY-MM-DD
 */
export function addMonthsToDate(dateString: string, months: number): string {
  const d = dateString ? new Date(dateString) : new Date();
  if (isNaN(d.getTime())) return getTodayString();
  d.setMonth(d.getMonth() + months);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToDate(dateString: string, days: number): string {
  const d = dateString ? new Date(dateString) : new Date();
  if (isNaN(d.getTime())) return getTodayString();
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
