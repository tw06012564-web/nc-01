import React, { useState } from 'react';
import { DrugItem, StockTransaction } from '../types/sticker';
import { formatThaiDate, getTodayString } from '../utils/thaiDate';
import { 
  Package, 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertTriangle, 
  Download, 
  Plus, 
  Minus, 
  History, 
  Filter, 
  CheckCircle2, 
  FileText,
  Boxes,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface DrugInventoryViewProps {
  drugs: DrugItem[];
  setDrugs: React.Dispatch<React.SetStateAction<DrugItem[]>>;
  transactions: StockTransaction[];
  setTransactions: React.Dispatch<React.SetStateAction<StockTransaction[]>>;
  currentUser: string;
}

export const DrugInventoryView: React.FC<DrugInventoryViewProps> = ({
  drugs,
  setDrugs,
  transactions,
  setTransactions,
  currentUser,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'history'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [formTypeFilter, setFormTypeFilter] = useState<string>('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Modal states for Stock In / Out
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'in' | 'out'>('in');
  const [selectedDrugId, setSelectedDrugId] = useState<string>('');
  const [amount, setAmount] = useState<number>(50);
  const [note, setNote] = useState<string>('');
  const [lotNumber, setLotNumber] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');

  // Calculate summary metrics
  const totalStockCount = drugs.reduce((acc, d) => acc + (d.stock || 0), 0);
  const lowStockDrugs = drugs.filter(d => (d.stock || 0) <= (d.minStock || 50));

  // Filtered drugs
  const filteredDrugs = drugs.filter(d => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      d.name.toLowerCase().includes(term) ||
      d.category.toLowerCase().includes(term) ||
      (d.genericName && d.genericName.toLowerCase().includes(term));

    const matchesType = formTypeFilter === 'all' || d.formType === formTypeFilter;
    const matchesLow = !lowStockOnly || (d.stock || 0) <= (d.minStock || 50);

    return matchesSearch && matchesType && matchesLow;
  });

  const openStockModal = (mode: 'in' | 'out', drugId?: string) => {
    setModalMode(mode);
    setSelectedDrugId(drugId || (drugs[0]?.id || ''));
    setAmount(mode === 'in' ? 100 : 10);
    setNote(mode === 'in' ? 'รับยาจากคลังจังหวัด / สั่งซื้อ' : 'เบิกใช้คลินิก รพ.สต.');
    setLotNumber('');
    setExpiryDate('');
    setIsStockModalOpen(true);
  };

  const handleConfirmStockChange = (e: React.FormEvent) => {
    e.preventDefault();
    const drug = drugs.find(d => d.id === selectedDrugId);
    if (!drug || amount <= 0) return;

    const currentStock = drug.stock ?? 0;
    if (modalMode === 'out' && currentStock < amount) {
      if (!confirm(`ยอดคงเหลือ (${currentStock} ${drug.unit}) น้อยกว่าจำนวนที่ต้องการเบิก (${amount} ${drug.unit}) ยืนยันดำเนินการต่อหรือไม่?`)) {
        return;
      }
    }

    const newStock = modalMode === 'in' 
      ? currentStock + amount 
      : Math.max(0, currentStock - amount);

    // Update drug stock
    setDrugs(drugs.map(d => (d.id === drug.id ? { ...d, stock: newStock } : d)));

    // Record stock transaction
    const newTx: StockTransaction = {
      id: 'tx-' + Date.now(),
      drugId: drug.id,
      drugName: drug.name,
      type: modalMode,
      amount: amount,
      unit: drug.unit,
      balanceAfter: newStock,
      note: note.trim() + (lotNumber ? ` (Lot: ${lotNumber})` : ''),
      date: getTodayString(),
      recordedBy: currentUser || 'admin01',
      timestamp: new Date().toISOString()
    };

    setTransactions([newTx, ...transactions]);
    setIsStockModalOpen(false);
  };

  // Export inventory to Excel/CSV
  const handleExportCSV = () => {
    const headers = [
      'รหัส',
      'ชื่อยา',
      'กลุ่มยา',
      'ประเภทยา',
      'ยอดคงเหลือ',
      'หน่วย',
      'เกณฑ์เตือนขั้นต่ำ',
      'สถานะสต๊อก'
    ];

    const rows = drugs.map((d, i) => [
      String(i + 1),
      `"${d.name.replace(/"/g, '""')}"`,
      `"${d.category.replace(/"/g, '""')}"`,
      d.formType || 'ยาเม็ด',
      String(d.stock || 0),
      d.unit,
      String(d.minStock || 50),
      (d.stock || 0) <= (d.minStock || 50) ? 'ใกล้หมด' : 'ปกติ'
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `คลังยา_รพสตหนองชิ่ม_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden font-['Sarabun',sans-serif]">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">
              คลังยา รพ.สต.หนองชิ่ม (รับยาเข้า - เบิกจ่าย - ตัดยอดคนไข้)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            ระบบบริหารสต๊อกเวชภัณฑ์ {drugs.length} รายการ • ตัดสต็อกอัตโนมัติตามยอดที่จ่ายให้คนไข้
          </p>
        </div>

        {/* Top actions */}
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
            onClick={() => openStockModal('out')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5" /> เบิกจ่ายยา
          </button>
          <button
            type="button"
            onClick={() => openStockModal('in')}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" /> รับยาเข้าคลัง
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:px-5 bg-slate-50 border-b border-slate-200 text-xs">
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <div className="text-slate-500 text-[11px] font-semibold">จำนวนรายการยาทั้งหมด</div>
          <div className="text-xl font-black text-slate-900 mt-0.5">{drugs.length} <span className="text-xs font-normal text-slate-500">รายการ</span></div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <div className="text-slate-500 text-[11px] font-semibold">ยอดคงเหลือรวมในคลัง</div>
          <div className="text-xl font-black text-emerald-700 mt-0.5">{totalStockCount.toLocaleString()} <span className="text-xs font-normal text-slate-500">หน่วย</span></div>
        </div>
        <div className={`p-3 rounded-xl border ${lowStockDrugs.length > 0 ? 'bg-amber-50 border-amber-300' : 'bg-white border-slate-200'}`}>
          <div className="text-amber-800 text-[11px] font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> ยาใกล้หมดสต็อก
          </div>
          <div className="text-xl font-black text-amber-700 mt-0.5">{lowStockDrugs.length} <span className="text-xs font-normal text-amber-800">รายการ</span></div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <div className="text-slate-500 text-[11px] font-semibold">ประวัติความเคลื่อนไหว</div>
          <div className="text-xl font-black text-slate-800 mt-0.5">{transactions.length} <span className="text-xs font-normal text-slate-500">รายการบันทึก</span></div>
        </div>
      </div>

      {/* Sub Tabs: คลังยา vs ประวัติความเคลื่อนไหว */}
      <div className="px-4 sm:px-5 pt-3 border-b border-slate-200 bg-white flex items-center gap-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('inventory')}
          className={`pb-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'inventory'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>บัญชีรายการยาและยอดคงเหลือ ({filteredDrugs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('history')}
          className={`pb-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'history'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>ประวัติการรับเข้า - เบิกจ่าย - ตัดจ่ายคนไข้ ({transactions.length})</span>
        </button>
      </div>

      {activeSubTab === 'inventory' ? (
        <>
          {/* Filters & Search Toolbar */}
          <div className="p-3 sm:px-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="ค้นหาชื่อยา, กลุ่มยา, รูปแบบยา..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <select
                value={formTypeFilter}
                onChange={(e) => setFormTypeFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium"
              >
                <option value="all">ทุกรูปแบบยา ({drugs.length})</option>
                <option value="ยาเม็ด">ยาเม็ด / แคปซูล</option>
                <option value="ยาน้ำ">ยาน้ำ</option>
                <option value="ยาฉีดและสารน้ำ">ยาฉีดและสารน้ำ (IV)</option>
                <option value="ยาทาภายนอก">ยาทาภายนอก</option>
                <option value="ยาสมุนไพร">ยาสมุนไพร</option>
                <option value="เวชภัณฑ์">เวชภัณฑ์</option>
              </select>

              <label className="flex items-center gap-1.5 cursor-pointer px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={lowStockOnly}
                  onChange={(e) => setLowStockOnly(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-semibold text-amber-900">เฉพาะยาใกล้หมด ({lowStockDrugs.length})</span>
              </label>
            </div>
          </div>

          {/* Drugs Inventory Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">ลำดับ</th>
                  <th className="px-4 py-3">ชื่อยา (Drug Name)</th>
                  <th className="px-4 py-3">กลุ่มยา / หมวดหมู่</th>
                  <th className="px-4 py-3 text-center">ประเภท</th>
                  <th className="px-4 py-3 text-right">ยอดคงเหลือในคลัง</th>
                  <th className="px-4 py-3 text-center">สถานะ</th>
                  <th className="px-4 py-3 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredDrugs.map((d, index) => {
                  const isLow = (d.stock || 0) <= (d.minStock || 50);

                  return (
                    <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">
                        #{index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-extrabold text-sm text-slate-900">
                          {d.name}
                        </div>
                        {d.genericName && (
                          <div className="text-[10px] text-slate-500 font-mono">
                            {d.genericName}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                          {d.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {d.formType || 'ยาเม็ด'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-sm font-extrabold font-mono ${isLow ? 'text-amber-600' : 'text-slate-900'}`}>
                          {(d.stock || 0).toLocaleString()}
                        </span>{' '}
                        <span className="text-slate-600 text-xs font-semibold">{d.unit}</span>
                        <div className="text-[10px] text-slate-400">
                          เตือนเมื่อ &lt; {d.minStock || 50}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                            <AlertTriangle className="w-3 h-3" /> ใกล้หมด
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                            <CheckCircle2 className="w-3 h-3" /> มีพร้อมจ่าย
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openStockModal('in', d.id)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-xs font-semibold flex items-center gap-0.5 transition-colors cursor-pointer"
                            title="รับยาเข้าคลัง"
                          >
                            <Plus className="w-3 h-3" /> รับเข้า
                          </button>
                          <button
                            type="button"
                            onClick={() => openStockModal('out', d.id)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-xs font-semibold flex items-center gap-0.5 transition-colors cursor-pointer"
                            title="เบิกจ่าย"
                          >
                            <Minus className="w-3 h-3" /> เบิกจ่าย
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* Transaction History Log (รับเข้า - เบิกจ่าย - ตัดยอดคนไข้) */
        <div className="overflow-x-auto">
          {transactions.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-sm">
              ยังไม่มีประวัติความเคลื่อนไหวสต๊อก (จะบันทึกอัตโนมัติเมื่อรับยาเข้า, เบิกจ่าย, หรือจ่ายยาให้คนไข้)
            </div>
          ) : (
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">วันที่ / เวลา</th>
                  <th className="px-4 py-3">ประเภทรายการ</th>
                  <th className="px-4 py-3">รายการยา</th>
                  <th className="px-4 py-3 text-right">จำนวน</th>
                  <th className="px-4 py-3 text-right">ยอดคงเหลือหลังทำรายการ</th>
                  <th className="px-4 py-3">รายละเอียด / ตัดยอดคนไข้</th>
                  <th className="px-4 py-3">ผู้บันทึก</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {transactions.map(tx => {
                  let badge = null;
                  if (tx.type === 'in') {
                    badge = <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">รับเข้าคลัง</span>;
                  } else if (tx.type === 'dispense') {
                    badge = <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px]">ตัดจ่ายคนไข้</span>;
                  } else {
                    badge = <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">เบิกจ่ายทั่วไป</span>;
                  }

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{formatThaiDate(tx.date)}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {new Date(tx.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {badge}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {tx.drugName}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-extrabold">
                        {tx.type === 'in' ? (
                          <span className="text-emerald-600">+{tx.amount} {tx.unit}</span>
                        ) : (
                          <span className="text-red-600">-{tx.amount} {tx.unit}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-700">
                        {tx.balanceAfter} {tx.unit}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {tx.patientName ? (
                          <div>
                            <span className="font-bold text-slate-900">{tx.patientName}</span>
                            {tx.hn && <span className="text-[11px] text-slate-500 font-mono ml-1">(HN: {tx.hn})</span>}
                          </div>
                        ) : (
                          <span>{tx.note || '-'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-500">
                        {tx.recordedBy}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Stock In / Out Modal */}
      {isStockModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 no-print">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className={`p-4 sm:p-5 text-white flex items-center justify-between ${
              modalMode === 'in' ? 'bg-emerald-800' : 'bg-amber-800'
            }`}>
              <div className="flex items-center gap-2">
                {modalMode === 'in' ? <ArrowDownLeft className="w-5 h-5 text-emerald-200" /> : <ArrowUpRight className="w-5 h-5 text-amber-200" />}
                <h3 className="font-bold text-base">
                  {modalMode === 'in' ? 'รับยาเข้าคลัง (Stock In)' : 'เบิกจ่ายยาออกจากคลัง (Stock Out)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsStockModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmStockChange} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  เลือกรายการยา *
                </label>
                <select
                  value={selectedDrugId}
                  onChange={(e) => setSelectedDrugId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                >
                  {drugs.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} (คงเหลือ: {d.stock} {d.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    จำนวน {modalMode === 'in' ? 'รับเข้า' : 'เบิกออก'} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    หมายเลข Lot (ถ้ามี)
                  </label>
                  <input
                    type="text"
                    value={lotNumber}
                    onChange={(e) => setLotNumber(e.target.value)}
                    placeholder="เช่น LOT-6701"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-mono text-slate-700 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  หมายเหตุ / แหล่งที่มา / แผนกที่เบิก
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="เช่น รับมอบจาก รพ.แหลมสิงห์, หรือ เบิกใช้ทำแผล"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white rounded-lg font-bold shadow-xs cursor-pointer ${
                    modalMode === 'in' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  ยืนยันบันทึกสต๊อก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
