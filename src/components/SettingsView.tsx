import React, { useState, useRef } from 'react';
import { HospitalConfig, PrescriptionItem, PatientInfo } from '../types/sticker';
import { HOSPITAL_CONFIG } from '../data/defaultDrugs';
import { HospitalLogo } from './HospitalLogo';
import { StickerView } from './StickerView';
import { 
  Building2, 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  Palette, 
  Phone, 
  MapPin, 
  Sparkles,
  ShieldCheck,
  Eye,
  Sliders
} from 'lucide-react';

interface SettingsViewProps {
  config: HospitalConfig;
  onSaveConfig: (newConfig: HospitalConfig) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ config, onSaveConfig }) => {
  const [formData, setFormData] = useState<HospitalConfig>({ ...config });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'logo' | 'sticker'>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample data for live preview
  const samplePatient: PatientInfo = {
    hn: '6704128',
    fullName: 'นายสมชาย ใจดี',
    age: '62',
    dispenseDate: new Date().toISOString().split('T')[0],
    appointmentDate: '2024-05-15',
    note: 'คลินิกความดันโลหิตสูง'
  };

  const sampleItem: PrescriptionItem = {
    id: 'preview-item-1',
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
    warning: 'รับประทานยาอย่างสม่ำเสมอ ห้ามหยุดยาเอง'
  };

  const handleChange = (field: keyof HospitalConfig, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSavedSuccess(false);
  };

  // Handle Logo file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น (PNG, JPG, SVG, WebP)');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert('ขนาดไฟล์ใหญ่เกินไป กรุณาเลือกรูปภาพขนาดไม่เกิน 3MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFormData(prev => ({
        ...prev,
        logoUrl: result,
        logoType: 'custom'
      }));
      setSavedSuccess(false);
    };
    reader.readAsDataURL(file);
  };

  // Reset to default hospital info
  const handleResetDefaults = () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลและโลโก้กลับเป็นค่าเริ่มต้นของ รพ.สต.หนองชิ่ม หรือไม่?')) {
      setFormData({ ...HOSPITAL_CONFIG });
      onSaveConfig({ ...HOSPITAL_CONFIG });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="space-y-6 font-['Sarabun',sans-serif]">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-950/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                ตั้งค่าระบบ & ปรับเปลี่ยนโลโก้
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                แก้ไขข้อมูลหน่วยบริการ เปลี่ยนชื่อโรงพยาบาล/รพ.สต. เบอร์ติดต่อ และอัปโหลดโลโก้ประจำหน่วยงาน
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>คืนค่าเริ่มต้น</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกการตั้งค่า</span>
          </button>
        </div>
      </div>

      {/* Success notification banner */}
      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-bold shadow-xs animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>บันทึกข้อมูลการตั้งค่าและโลโก้เรียบร้อยแล้ว ข้อมูลทั้งหมดจะมีผลทั่วทั้งระบบและบนสติกเกอร์ทันที</span>
        </div>
      )}

      {/* Main Grid: Form Settings (Left 7) & Live Preview (Right 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Settings Forms */}
        <div className="lg:col-span-7 space-y-5">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-1 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>1. ข้อมูลหน่วยบริการ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('logo')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'logo'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>2. โลโก้ & ตราสัญลักษณ์</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sticker')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'sticker'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>3. สี & แถบสติกเกอร์</span>
            </button>
          </div>

          {/* Tab 1: Profile Information */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  ข้อมูลหน่วยงาน / โรงพยาบาลส่งเสริมสุขภาพตำบล
                </h2>
              </div>

              <div className="space-y-4 text-xs">
                {/* Hospital Name */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ชื่อหน่วยบริการ / โรงพยาบาล / รพ.สต. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="เช่น โรงพยาบาลส่งเสริมสุขภาพตำบลหนองชิ่ม"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    ชื่อนี้จะแสดงบนหัวกระดาษแถบสีเขียวอ่อนของสติกเกอร์ยา และส่วนหัวของระบบ
                  </p>
                </div>

                {/* Sub Name */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ชื่อภาษาอังกฤษ / คำขยาย (Sub Title)
                  </label>
                  <input
                    type="text"
                    value={formData.subName || ''}
                    onChange={(e) => handleChange('subName', e.target.value)}
                    placeholder="เช่น Nong Chim Sub-district Health Promoting Hospital"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* HCODE */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      รหัสสถานพยาบาล 5 หลัก (HCODE)
                    </label>
                    <input
                      type="text"
                      value={formData.hcode || ''}
                      onChange={(e) => handleChange('hcode', e.target.value)}
                      placeholder="เช่น 02078"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* District / Province */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      อำเภอ / จังหวัด
                    </label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => handleChange('district', e.target.value)}
                      placeholder="เช่น อำเภอแหลมสิงห์ จังหวัดจันทบุรี"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      เบอร์โทรศัพท์ติดต่อ
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleChange('phone', val);
                        handleChange('phoneDisplay', `โทร ${val}`);
                      }}
                      placeholder="เช่น 039-444289"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Phone Display Text */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      ข้อความเบอร์โทรบนสติกเกอร์ยา
                    </label>
                    <input
                      type="text"
                      value={formData.phoneDisplay}
                      onChange={(e) => handleChange('phoneDisplay', e.target.value)}
                      placeholder="เช่น โทร 039-444289"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Logo & Branding */}
          {activeTab === 'logo' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  เปลี่ยน Logo และตราสัญลักษณ์ประจำหน่วยงาน
                </h2>
              </div>

              {/* Current Logo Preview Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                <div className="shrink-0 p-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center">
                  <HospitalLogo config={formData} size="xl" variant="rounded" />
                </div>
                <div className="text-center sm:text-left min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900">
                    ตราสัญลักษณ์ที่กำลังใช้งาน
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {formData.logoType === 'custom' && formData.logoUrl
                      ? 'รูปภาพโลโก้ที่อัปโหลดเอง'
                      : formData.logoType === 'moph'
                      ? 'ตราสัญลักษณ์กระทรวงสาธารณสุข'
                      : 'เครื่องหมายกากบาทเขียวมาตรฐาน (+)'}
                  </div>
                  <p className="text-[11px] text-emerald-700 font-medium mt-1">
                    ✓ จะแสดงบนหัวสติกเกอร์ยา, หน้า Login และแถบเมนูด้านข้างอัตโนมัติ
                  </p>
                </div>
              </div>

              {/* Logo Selection Options */}
              <div className="space-y-3 text-xs">
                <label className="block font-bold text-slate-800">
                  เลือกรูปแบบ Logo ที่ต้องการใช้:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Option 1: Medical Cross */}
                  <div
                    onClick={() => handleChange('logoType', 'default-cross')}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center text-center gap-2 ${
                      formData.logoType === 'default-cross'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
                      +
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">กากบาทเขียว</div>
                      <div className="text-[10px] text-slate-500">มาตรฐานสถานพยาบาล</div>
                    </div>
                  </div>

                  {/* Option 2: MOPH Emblem */}
                  <div
                    onClick={() => handleChange('logoType', 'moph')}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center text-center gap-2 ${
                      formData.logoType === 'moph'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <HospitalLogo config={{ ...formData, logoType: 'moph' }} size="lg" variant="rounded" />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">ตรากระทรวงฯ</div>
                      <div className="text-[10px] text-slate-500">สาธารณสุข (คฑางู)</div>
                    </div>
                  </div>

                  {/* Option 3: Custom Upload */}
                  <div
                    onClick={() => {
                      handleChange('logoType', 'custom');
                      if (!formData.logoUrl && fileInputRef.current) {
                        fileInputRef.current.click();
                      }
                    }}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center text-center gap-2 ${
                      formData.logoType === 'custom'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 border border-slate-300 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">อัปโหลดรูปเอง</div>
                      <div className="text-[10px] text-slate-500">PNG, JPG, SVG</div>
                    </div>
                  </div>
                </div>

                {/* Upload Box (Shown if custom or always accessible) */}
                <div className="mt-4 p-4 border-2 border-dashed border-emerald-300/80 rounded-2xl bg-emerald-50/40 text-center space-y-2.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/svg+xml, image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <div className="flex items-center justify-center gap-2 text-emerald-800">
                    <Upload className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-xs">
                      {formData.logoUrl ? 'เปลี่ยนรูปภาพ Logo ใหม่' : 'อัปโหลดไฟล์รูปภาพ Logo ประจำหน่วยงาน'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    รองรับไฟล์รูปภาพ PNG, JPG, SVG หรือ WebP ขนาดไม่เกิน 3MB (แนะนำเป็นภาพพื้นหลังโปร่งใส)
                  </p>

                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>เลือกไฟล์ภาพจากคอมพิวเตอร์</span>
                    </button>

                    {formData.logoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            logoUrl: undefined,
                            logoType: 'default-cross'
                          }));
                        }}
                        className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ลบรูปภาพ</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Switch: Show Logo on sticker */}
                <div className="pt-3 border-t border-slate-100">
                  <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-50">
                    <div>
                      <span className="font-bold text-slate-800 text-xs">
                        แสดงตราสัญลักษณ์/Logo บนสติกเกอร์ยา
                      </span>
                      <p className="text-[11px] text-slate-500">
                        แสดงไอคอนหรือรูปภาพ Logo ด้านซ้ายบนหัวกระดาษแถบสีเขียวอ่อน
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.showLogoOnSticker !== false}
                      onChange={(e) => handleChange('showLogoOnSticker', e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Colors & Sticker Appearance */}
          {activeTab === 'sticker' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Palette className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  ปรับแต่งโทนสีและขนาดสติกเกอร์ยา
                </h2>
              </div>

              <div className="space-y-4 text-xs">
                {/* Header Background Color */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    สีพื้นหลังแถบหัวกระดาษสติกเกอร์ (ค่ามาตรฐาน: เขียวอ่อน #bbf7d0)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.headerBgColor || '#bbf7d0'}
                      onChange={(e) => handleChange('headerBgColor', e.target.value)}
                      className="w-10 h-10 p-0.5 rounded-lg border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.headerBgColor || '#bbf7d0'}
                      onChange={(e) => handleChange('headerBgColor', e.target.value)}
                      className="w-28 px-2.5 py-2 font-mono text-xs border border-slate-300 rounded-lg"
                    />
                    {/* Quick Palette */}
                    <div className="flex items-center gap-1.5">
                      {['#bbf7d0', '#dcfce7', '#e0f2fe', '#fef3c7', '#ffffff'].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleChange('headerBgColor', c)}
                          style={{ backgroundColor: c }}
                          className={`w-6 h-6 rounded-md border border-slate-300 cursor-pointer shadow-2xs ${
                            formData.headerBgColor === c ? 'ring-2 ring-emerald-500' : ''
                          }`}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Header Text Color */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    สีตัวหนังสือแถบหัวกระดาษ (ค่ามาตรฐาน: เขียวเข้ม #14532d)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.headerTextColor || '#14532d'}
                      onChange={(e) => handleChange('headerTextColor', e.target.value)}
                      className="w-10 h-10 p-0.5 rounded-lg border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.headerTextColor || '#14532d'}
                      onChange={(e) => handleChange('headerTextColor', e.target.value)}
                      className="w-28 px-2.5 py-2 font-mono text-xs border border-slate-300 rounded-lg"
                    />
                    {/* Quick Palette */}
                    <div className="flex items-center gap-1.5">
                      {['#14532d', '#0c4a6e', '#1e293b', '#78350f', '#000000'].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleChange('headerTextColor', c)}
                          style={{ backgroundColor: c }}
                          className={`w-6 h-6 rounded-md border border-slate-300 cursor-pointer shadow-2xs ${
                            formData.headerTextColor === c ? 'ring-2 ring-emerald-500' : ''
                          }`}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Barcode toggle default */}
                <div className="pt-3 border-t border-slate-100">
                  <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-50">
                    <div>
                      <span className="font-bold text-slate-800 text-xs">
                        แสดงบาร์โค้ดท้ายสติกเกอร์เป็นค่าเริ่มต้น
                      </span>
                      <p className="text-[11px] text-slate-500">
                        แสดงบาร์โค้ดคู่กับเบอร์โทรศัพท์ติดต่อที่ท้ายสติกเกอร์ยา
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.showBarcodeDefault !== false}
                      onChange={(e) => handleChange('showBarcodeDefault', e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Save Button */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              กดปุ่มบันทึกเพื่อนำการตั้งค่าไปใช้ในระบบทั้งหมด
            </span>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกการตั้งค่าทั้งหมด</span>
            </button>
          </div>
        </div>

        {/* Right: Real-time Live Sticker Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900">
                  ตัวอย่างสติกเกอร์ยาตามการตั้งค่าปัจจุบัน
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                Live Preview
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              เมื่อแก้ไขชื่อหน่วยงาน หรือเปลี่ยน Logo จะแสดงผลทันทีตรงนี้:
            </p>

            {/* Sticker Component Preview */}
            <div className="flex justify-center p-2 bg-slate-100/70 rounded-xl border border-slate-200">
              <StickerView
                patient={samplePatient}
                item={sampleItem}
                size="thermal-80x50"
                showBarcode={formData.showBarcodeDefault !== false}
                hospitalConfig={formData}
              />
            </div>

            {/* Summary card info */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">หน่วยบริการ:</span>
                <strong className="text-slate-800 text-right truncate max-w-[180px]">{formData.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">เบอร์ติดต่อ:</span>
                <span className="font-mono text-slate-800">{formData.phoneDisplay}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">โลโก้:</span>
                <span className="text-emerald-700 font-semibold">
                  {formData.logoType === 'custom' ? 'รูปภาพที่อัปโหลด' : formData.logoType === 'moph' ? 'ตรากระทรวงสาธารณสุข' : 'กากบาทเขียว'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
