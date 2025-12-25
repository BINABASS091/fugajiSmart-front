import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { inventoryApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { X, TrendingUp, TrendingDown, RotateCcw, AlertTriangle, ChevronRight, Package, ArrowRight, DollarSign } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
}

interface StockTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  item: InventoryItem | null;
}

interface TransactionData {
  transaction_type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  unit_cost: number;
  reference_number: string;
  supplier: string;
  reason: string;
  notes: string;
}

const StockTransactionModal: React.FC<StockTransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  item
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<TransactionData>({
    transaction_type: 'IN',
    quantity: 0,
    unit_cost: 0,
    reference_number: '',
    supplier: '',
    reason: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !user) return;

    try {
      setSaving(true);
      setError(null);

      if (formData.transaction_type === 'OUT' && formData.quantity > item.quantity) {
        setError('Insufficient stock for this withdrawal.');
        return;
      }

      let backendType = 'PURCHASE';
      let quantityChange = formData.quantity;

      if (formData.transaction_type === 'OUT') {
        backendType = 'USAGE';
        quantityChange = formData.quantity;
      } else if (formData.transaction_type === 'ADJUSTMENT') {
        backendType = 'ADJUSTMENT';
        quantityChange = formData.quantity - item.quantity;
      }

      const notesParts = [];
      if (formData.notes) notesParts.push(formData.notes);
      if (formData.reason) notesParts.push(`Reason: ${formData.reason}`);
      if (formData.reference_number) notesParts.push(`Ref: ${formData.reference_number}`);
      if (formData.supplier) notesParts.push(`Supplier: ${formData.supplier}`);

      const payload = {
        item: item.id,
        transaction_type: backendType,
        quantity_change: quantityChange,
        unit_cost: formData.unit_cost || null,
        notes: notesParts.join(' | ')
      };

      const { error } = await inventoryApi.createTransaction(payload);
      if (error) throw new Error(error);

      setFormData({
        transaction_type: 'IN',
        quantity: 0,
        unit_cost: 0,
        reference_number: '',
        supplier: '',
        reason: '',
        notes: ''
      });

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Transaction pulse lost.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof TransactionData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateNewStock = () => {
    if (!item) return 0;
    switch (formData.transaction_type) {
      case 'IN': return item.quantity + formData.quantity;
      case 'OUT': return item.quantity - formData.quantity;
      case 'ADJUSTMENT': return formData.quantity;
      default: return item.quantity;
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
      <Card className="w-full max-w-xl max-h-[92vh] overflow-hidden flex flex-col rounded-[40px] shadow-2xl border-none animate-[scaleIn_0.3s_ease-out]">
        {/* Header */}
        <div className="p-10 pb-6 flex items-center justify-between bg-white relative">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-xl ring-4 ring-offset-4 ${formData.transaction_type === 'IN' ? 'bg-emerald-600 shadow-emerald-200 ring-emerald-50' :
              formData.transaction_type === 'OUT' ? 'bg-rose-600 shadow-rose-200 ring-rose-50' :
                'bg-blue-600 shadow-blue-200 ring-blue-50'
              }`}>
              {formData.transaction_type === 'IN' ? <TrendingUp className="w-8 h-8 text-white" /> :
                formData.transaction_type === 'OUT' ? <TrendingDown className="w-8 h-8 text-white" /> :
                  <RotateCcw className="w-8 h-8 text-white" />}
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight tracking-tight uppercase">Adjust Stock</h2>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">{item.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-2xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-10 py-4 pb-10 space-y-8 bg-white">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-shake">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-bold tracking-tight">{error}</p>
            </div>
          )}

          {/* Current vs Predict State */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-[32px] p-6 border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Balance</p>
              <p className="text-3xl font-black text-gray-900">
                {item.quantity} <span className="text-sm text-gray-400 font-bold uppercase">{item.unit}</span>
              </p>
            </div>
            <div className={`rounded-[32px] p-6 border transition-all duration-500 ${formData.quantity > 0 ? 'bg-gray-900 border-gray-900 text-white shadow-xl shadow-gray-200' : 'bg-white border-gray-100 text-gray-300'
              }`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-black uppercase tracking-widest">Projection</p>
                {formData.quantity > 0 && <ArrowRight className="w-4 h-4 text-blue-400 animate-pulse" />}
              </div>
              <p className="text-3xl font-black">
                {calculateNewStock()} <span className="text-sm opacity-50 font-bold uppercase">{item.unit}</span>
              </p>
            </div>
          </div>

          <form id="transaction-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Type Selector */}
            <div className="space-y-4">
              <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Action Flow</Label>
              <div className="grid grid-cols-3 gap-3 p-1.5 bg-gray-50 rounded-[32px] border border-gray-100">
                {[
                  { type: 'IN', label: 'Refill', icon: TrendingUp, color: 'text-emerald-500', active: 'bg-emerald-600 shadow-emerald-200' },
                  { type: 'OUT', label: 'Use', icon: TrendingDown, color: 'text-rose-500', active: 'bg-rose-600 shadow-rose-200' },
                  { type: 'ADJUSTMENT', label: 'Manual', icon: RotateCcw, color: 'text-blue-500', active: 'bg-blue-600 shadow-blue-200' },
                ].map((opt) => (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => handleInputChange('transaction_type', opt.type)}
                    className={`flex flex-col items-center gap-2 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${formData.transaction_type === opt.type
                      ? `${opt.active} text-white shadow-xl scale-[1.05]`
                      : 'text-gray-400 hover:text-gray-900 hover:bg-white'
                      }`}
                  >
                    <opt.icon className="w-5 h-5" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">
                  {formData.transaction_type === 'ADJUSTMENT' ? 'Direct Value Entry' : 'Flow Amount'}
                </Label>
                <div className="relative group">
                  <Package className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 0)}
                    className="pl-14 py-8 rounded-2xl border-none bg-gray-50 shadow-sm focus:ring-4 focus:ring-blue-500/10 text-xl font-bold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Unit Cost Reference</Label>
                <div className="relative group">
                  <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unit_cost}
                    onChange={(e) => handleInputChange('unit_cost', parseFloat(e.target.value) || 0)}
                    className="pl-14 py-8 rounded-2xl border-none bg-gray-50 shadow-sm focus:ring-4 focus:ring-blue-500/10 text-xl font-bold"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ref ID</Label>
                  <Input
                    value={formData.reference_number}
                    onChange={(e) => handleInputChange('reference_number', e.target.value)}
                    placeholder="Invoice / PO #"
                    className="py-5 bg-white border-gray-100 rounded-xl font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Context / Reason</Label>
                  <Input
                    value={formData.reason}
                    onChange={(e) => handleInputChange('reason', e.target.value)}
                    placeholder="e.g., Weekly Feed refill"
                    className="py-5 bg-white border-gray-100 rounded-xl font-bold"
                  />
                </div>
              </div>

              {formData.transaction_type === 'IN' && (
                <div className="space-y-1">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Provider Source</Label>
                  <Input
                    value={formData.supplier}
                    onChange={(e) => handleInputChange('supplier', e.target.value)}
                    placeholder="Supplier / Manufacturer Name"
                    className="py-5 bg-white border-gray-100 rounded-xl font-bold"
                  />
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Additional Observations</Label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Log any anomalies or notes for this transaction..."
                  className="w-full p-4 bg-white border border-gray-100 rounded-[24px] resize-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 focus:outline-none font-bold transition-all"
                  rows={3}
                />
              </div>
            </div>
          </form>
        </div>

        {/* Action Pad */}
        <div className="p-8 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 py-7 rounded-2xl border-none bg-white font-black text-gray-400 uppercase tracking-widest hover:bg-gray-100"
            >
              Discard
            </Button>
            <Button
              type="submit"
              form="transaction-form"
              disabled={saving || (formData.transaction_type !== 'ADJUSTMENT' && formData.quantity <= 0)}
              className={`flex-[2] py-7 rounded-2xl font-black text-lg text-white shadow-xl transition-all hover:scale-105 active:scale-95 ${formData.transaction_type === 'IN' ? 'bg-emerald-600 shadow-emerald-100' :
                formData.transaction_type === 'OUT' ? 'bg-rose-600 shadow-rose-100' : 'bg-blue-600 shadow-blue-100'
                }`}
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Committing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>COMMIT PULSE</span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StockTransactionModal;
