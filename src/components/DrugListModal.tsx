import React, { useState } from 'react';
import { DrugItem } from '../types/sticker';
import { DEFAULT_DRUGS } from '../data/defaultDrugs';
import { X, Search, Plus, RotateCcw, Edit2, Trash2, Check, Pill } from 'lucide-react';

interface DrugListModalProps {
  isOpen: boolean;
  onClose: () => void;
  drugs: DrugItem[];
  setDrugs: React.Dispatch<React.SetStateAction<DrugItem[]>>;
  onSelectDrugToAdd: (drug: DrugItem) => void;
}

export const DrugListModal: React.FC<DrugListModalProps> = ({
  isOpen,
  onClose,
  drugs,
  setDrugs,
  onSelectDrugToAdd,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingDrug, setEditingDrug] = useState<DrugItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New drug form state
  const [newDrug, setNewDrug] = useState<Partial<DrugItem>>({
    name: '',
    category: 'ยารักษาโรค',
    defaultQuantity: 30,
    unit: 'เม็ด',
    dosage: 'ครั้งละ 1 เม็ด',
    frequency: 'วันละ 1 ครั้ง',
    mealTiming: 'after',
    mealTimingMinutes: 'หลังอาหารเช้า',
    timesPerDay: { morning: true, noon: false, evening: false, night: false },
    customInstructions: 'รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้ง หลังอาหารเช้า',
    warning: ''
  });

  if (!isOpen) return null;

  // Extract unique categories
  const categories = Array.from(new Set(drugs.map(d => d.category)));

  // Filtered drugs
  const filtered = drugs.filter(d => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.customInstructions && d.customInstructions.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || d.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleResetDefaults = () => {
    if (confirm('คุณต้องการรีเซ็ตรายการยาของ รพ.สต.หนองชิ่ม กลับเป็นค่าเริ่มต้น (25 รายการ) หรือไม่?')) {
      setDrugs(DEFAULT_DRUGS);
    }
  };

  const handleSaveNewDrug = () => {
    if (!newDrug.name?.trim()) {
      alert('กรุณากรอกชื่อยา');
      return;
    }
    const created: DrugItem = {
      id: 'custom-' + Date.now(),
      name: newDrug.name.trim(),
      category: newDrug.category || 'ยารักษาโรค',
      defaultQuantity: newDrug.defaultQuantity || 30,
      unit: newDrug.unit || 'เม็ด',
      dosage: newDrug.dosage || 'ครั้งละ 1 เม็ด',
      frequency: newDrug.frequency || 'วันละ 1 ครั้ง',
      mealTiming: newDrug.mealTiming || 'after',
      mealTimingMinutes: newDrug.mealTimingMinutes || 'หลังอาหาร',
      timesPerDay: newDrug.timesPerDay || { morning: true, noon: false, evening: false, night: false },
      customInstructions: newDrug.customInstructions || `รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้ง หลังอาหาร`,
      warning: newDrug.warning || '',
      stock: 100,
      minStock: 20,
      formType: 'ยาเม็ด'
    };

    setDrugs([created, ...drugs]);
    setIsAddingNew(false);
    setNewDrug({
      name: '',
      category: 'ยารักษาโรค',
      defaultQuantity: 30,
      unit: 'เม็ด',
      dosage: 'ครั้งละ 1 เม็ด',
      frequency: 'วันละ 1 ครั้ง',
      mealTiming: 'after',
      mealTimingMinutes: 'หลังอาหารเช้า',
      timesPerDay: { morning: true, noon: false, evening: false, night: false },
      customInstructions: 'รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้ง หลังอาหารเช้า',
      warning: ''
    });
  };

  const handleUpdateDrug = (updated: DrugItem) => {
    setDrugs(drugs.map(d => (d.id === updated.id ? updated : d)));
    setEditingDrug(null);
  };

  const handleDeleteDrug = (id: string) => {
    if (confirm('ยืนยันลบรายการยานี้ออกจากระบบหรือไม่?')) {
      setDrugs(drugs.filter(d => d.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-emerald-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
              <Pill className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                บัญชียา รพ.สต.หนองชิ่ม ({drugs.length} รายการ)
              </h3>
              <p className="text-xs text-emerald-200">
                รายการยาทั้งหมดตามระบบ พร้อมกลุ่มยา วิธีรับประทานสีแดง และคำเตือน
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-3 sm:px-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="ค้นหาชื่อยา, กลุ่มยา, คำแนะนำ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-medium"
            >
              <option value="all">ทุกกลุ่มยา ({drugs.length})</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-2.5 py-1.5 border border-slate-300 text-slate-600 hover:text-slate-900 rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-white"
              title="รีเซ็ตเป็น 25 รายการเดิมจาก รพ.สต."
            >
              <RotateCcw className="w-3.5 h-3.5" /> รีเซ็ตตั้งต้น
            </button>
            <button
              type="button"
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> เพิ่มยาใหม่
            </button>
          </div>
        </div>

        {/* Add New Drug Collapsible */}
        {isAddingNew && (
          <div className="p-4 bg-emerald-50/70 border-b border-emerald-200">
            <h4 className="text-xs font-bold text-emerald-900 mb-2 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> เพิ่มรายการยาใหม่เข้าระบบ
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">ชื่อยา *</label>
                <input
                  type="text"
                  value={newDrug.name}
                  onChange={(e) => setNewDrug({ ...newDrug, name: e.target.value })}
                  placeholder="เช่น Paracetamol 500 mg."
                  className="w-full text-xs bg-white border border-slate-300 rounded px-2 py-1.5 font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">กลุ่มยา (แถบสีเขียว) *</label>
                <input
                  type="text"
                  value={newDrug.category}
                  onChange={(e) => setNewDrug({ ...newDrug, category: e.target.value })}
                  placeholder="เช่น ยาบรรเทาอาการปวดและลดไข้"
                  className="w-full text-xs bg-white border border-slate-300 rounded px-2 py-1.5"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">จำนวนเริ่มต้น</label>
                  <input
                    type="number"
                    value={newDrug.defaultQuantity}
                    onChange={(e) => setNewDrug({ ...newDrug, defaultQuantity: parseInt(e.target.value) || 10 })}
                    className="w-full text-xs bg-white border border-slate-300 rounded px-2 py-1.5"
                  />
                </div>
                <div className="w-16">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">หน่วย</label>
                  <input
                    type="text"
                    value={newDrug.unit}
                    onChange={(e) => setNewDrug({ ...newDrug, unit: e.target.value })}
                    className="w-full text-xs bg-white border border-slate-300 rounded px-2 py-1.5 text-center"
                  />
                </div>
              </div>
            </div>
            <div className="mb-2">
              <label className="block text-[11px] font-semibold text-red-700 mb-0.5">วิธีรับประทาน (สีแดงบนสติกเกอร์) *</label>
              <input
                type="text"
                value={newDrug.customInstructions}
                onChange={(e) => setNewDrug({ ...newDrug, customInstructions: e.target.value })}
                placeholder="เช่น รับประทานครั้งละ 1-2 เม็ด ทุก 4-6 ชั่วโมง เมื่อมีอาการปวดหรือมีไข้"
                className="w-full text-xs font-semibold text-red-700 bg-white border border-red-300 rounded px-2 py-1.5"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-3 py-1 text-xs border border-slate-300 rounded text-slate-600 hover:bg-slate-100"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveNewDrug}
                className="px-4 py-1 text-xs bg-emerald-600 text-white font-bold rounded hover:bg-emerald-700"
              >
                บันทึกเข้าคลัง
              </button>
            </div>
          </div>
        )}

        {/* Drug Table / List */}
        <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              ไม่พบรายการยาที่ตรงกับเงื่อนไขการค้นหา
            </div>
          ) : (
            filtered.map((d, index) => {
              const isEditing = editingDrug?.id === d.id;

              if (isEditing && editingDrug) {
                return (
                  <div key={d.id} className="p-3 bg-amber-50/60 space-y-2 text-xs">
                    <div className="font-bold text-amber-900">แก้ไขข้อมูลยา: {d.name}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={editingDrug.name}
                        onChange={(e) => setEditingDrug({ ...editingDrug, name: e.target.value })}
                        className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={editingDrug.category}
                        onChange={(e) => setEditingDrug({ ...editingDrug, category: e.target.value })}
                        className="bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={editingDrug.defaultQuantity}
                          onChange={(e) => setEditingDrug({ ...editingDrug, defaultQuantity: parseInt(e.target.value) || 1 })}
                          className="w-20 bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                        />
                        <input
                          type="text"
                          value={editingDrug.unit}
                          onChange={(e) => setEditingDrug({ ...editingDrug, unit: e.target.value })}
                          className="w-16 bg-white border border-slate-300 rounded px-2 py-1 text-xs text-center"
                        />
                      </div>
                    </div>
                    <input
                      type="text"
                      value={editingDrug.customInstructions}
                      onChange={(e) => setEditingDrug({ ...editingDrug, customInstructions: e.target.value })}
                      className="w-full bg-white border border-red-300 rounded px-2 py-1 text-xs font-semibold text-red-700"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingDrug(null)}
                        className="px-2.5 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-100"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateDrug(editingDrug)}
                        className="px-3 py-1 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                      >
                        บันทึกการแก้ไข
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={d.id}
                  className="p-3 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono text-slate-400 w-5">
                        #{index + 1}
                      </span>
                      <span className="font-bold text-sm text-slate-900">
                        {d.name}
                      </span>
                      <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        {d.category}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        (ปกติ {d.defaultQuantity} {d.unit})
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-red-600 mt-1 pl-7">
                      วิธีใช้: {d.customInstructions}
                    </div>
                    {d.warning && (
                      <div className="text-[11px] text-amber-700 mt-0.5 pl-7">
                        คำเตือน: {d.warning}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pl-7 sm:pl-0">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectDrugToAdd(d);
                        onClose();
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded flex items-center gap-1 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> ใช้ตัวยานี้
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingDrug(d)}
                      className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded"
                      title="แก้ไข"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDrug(d.id)}
                      className="p-1 text-red-400 hover:text-red-700 hover:bg-red-50 rounded"
                      title="ลบ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:px-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            รายการยาตั้งต้น 25 ตัวยาตรงตามเอกสาร รพ.สต.หนองชิ่ม (อ.แหลมสิงห์ จ.จันทบุรี)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
