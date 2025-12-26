import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  inventoryApi,
  medicineApi,
  equipmentApi,
  laborApi,
  healthAlertsApi,
  eggsApi
} from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import {
  X, Package, Tag, Hash, DollarSign, AlertTriangle,
  Calendar, User, Pill, Wrench, Box, ChevronRight,
  Egg, HeartPulse
} from 'lucide-react';

interface InventoryItem {
  id?: string;
  name: string;
  category: string;
  subcategory?: string | null;
  quantity: number;
  unit: string;
  cost_per_unit: number;
  reorder_level?: number;
  supplier: string | null;
  expiry_date: string | null;
  purchase_date?: string | null;
  feed_type?: string | null;
  consumption_rate_per_day?: number | null;
  course_days?: number | null;
  barcode?: string | null;
  batch_number?: string | null;
  location?: string | null;
  requires_refrigeration?: boolean;
  is_iot_device?: boolean;
  is_emergency_stock?: boolean;
  batch?: string | null;
  age_days?: number | null;
  average_weight?: number | null;
  notes?: string | null;

  // Medicine Fields
  medicine_type?: string;
  active_ingredient?: string;
  administration_method?: string;
  withdrawal_period_days?: number;

  // Equipment Fields
  equipment_type?: string;
  condition?: string;
  expected_lifespan_years?: number;
  next_maintenance_date?: string | null;

  // Labor Fields
  worker_name?: string;
  worker_type?: string;
  role?: string;
  payment_frequency?: string;
  wage_amount?: number;

  // Egg Fields
  batch_name?: string;
  grade?: string;
  quality?: string;
  quantity_trays?: number;
  quantity_pieces?: number;
  price_per_tray?: number;

  // Health Fields
  alert_type?: string;
  severity?: string;
  symptoms?: string;
  count_affected?: number;
}

interface AddInventoryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  item?: InventoryItem | null;
}

const AddInventoryItemModal: React.FC<AddInventoryItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  item
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<InventoryItem>({
    name: '',
    category: '',
    quantity: 0,
    unit: 'kg',
    cost_per_unit: 0,
    reorder_level: 10,
    supplier: null,
    expiry_date: null,
    purchase_date: new Date().toISOString().split('T')[0],
    feed_type: null,
    consumption_rate_per_day: null,
    course_days: null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const totalCost = (Number(formData.quantity || 0) * Number(formData.cost_per_unit || 0)) || 0;

  const CATEGORY_CONFIG: Record<string, {
    label: string;
    icon: React.ReactNode;
    color: string;
    units: { value: string; label: string }[];
    placeholder: string;
    showExpiry: boolean;
    api: any;
  }> = {
    FEED: {
      label: 'Feed',
      icon: <Package className="w-6 h-6" />,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      units: [
        { value: 'kg', label: 'Kilograms (kg)' },
        { value: 'bags', label: 'Bags' },
        { value: 'g', label: 'Grams (g)' }
      ],
      placeholder: 'e.g., Broiler Starter Feed',
      showExpiry: true,
      api: inventoryApi
    },
    MEDICINE: {
      label: 'Medicine',
      icon: <Pill className="w-6 h-6" />,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
      units: [
        { value: 'ml', label: 'Milliliters (ml)' },
        { value: 'l', label: 'Liters (l)' },
        { value: 'bottles', label: 'Bottles' },
        { value: 'doses', label: 'Doses' }
      ],
      placeholder: 'e.g., Newcastle Vaccine',
      showExpiry: true,
      api: medicineApi
    },
    EQUIPMENT: {
      label: 'Tools',
      icon: <Wrench className="w-6 h-6" />,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
      units: [
        { value: 'pcs', label: 'Pieces (pcs)' },
        { value: 'sets', label: 'Sets' }
      ],
      placeholder: 'e.g., Automatic Drinker',
      showExpiry: false,
      api: equipmentApi
    },
    LABOR: {
      label: 'Labor',
      icon: <User className="w-6 h-6" />,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      units: [
        { value: 'man_hours', label: 'Hours' },
        { value: 'days', label: 'Days' }
      ],
      placeholder: 'e.g., Seasonal Worker',
      showExpiry: false,
      api: laborApi
    },
    EGGS: {
      label: 'Eggs',
      icon: <Egg className="w-6 h-6" />,
      color: 'bg-orange-50 text-orange-600 border-orange-100',
      units: [
        { value: 'trays', label: 'Trays' },
        { value: 'pieces', label: 'Pieces' }
      ],
      placeholder: 'e.g., Morning Collection',
      showExpiry: true,
      api: eggsApi
    },
    HEALTH: {
      label: 'Health',
      icon: <HeartPulse className="w-6 h-6" />,
      color: 'bg-rose-50 text-rose-600 border-rose-100',
      units: [
        { value: 'records', label: 'Records' }
      ],
      placeholder: 'e.g., Symptom Report',
      showExpiry: false,
      api: healthAlertsApi
    },
    GENERAL: {
      label: 'General',
      icon: <Box className="w-6 h-6" />,
      color: 'bg-slate-50 text-slate-600 border-slate-100',
      units: [
        { value: 'pcs', label: 'Pieces (pcs)' },
        { value: 'kg', label: 'Kilograms (kg)' },
        { value: 'bags', label: 'Bags' }
      ],
      placeholder: 'e.g., Wood Shavings',
      showExpiry: true,
      api: inventoryApi
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData({
          name: item.name || '',
          category: item.category || '',
          quantity: item.quantity || 0,
          unit: item.unit || 'kg',
          cost_per_unit: item.cost_per_unit || 0,
          reorder_level: item.reorder_level || 10,
          supplier: item.supplier || null,
          expiry_date: item.expiry_date || null,
          purchase_date: item.purchase_date || new Date().toISOString().split('T')[0],
          feed_type: item.feed_type || null,
          consumption_rate_per_day: item.consumption_rate_per_day ?? null,
          course_days: item.course_days ?? null,
        });
      } else {
        setFormData({
          name: '',
          category: '',
          quantity: 0,
          unit: 'kg',
          cost_per_unit: 0,
          reorder_level: 10,
          supplier: null,
          expiry_date: null,
          purchase_date: new Date().toISOString().split('T')[0],
          feed_type: null,
          consumption_rate_per_day: null,
          course_days: null,
        });
      }
    }
  }, [isOpen, item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      if (!user) {
        setError('Authorization pulse lost. Please login again.');
        return;
      }

      if (!formData.category) {
        setError('Please select a resource group first.');
        setSaving(false);
        return;
      }

      const config = CATEGORY_CONFIG[formData.category];
      const payload = { ...formData };

      // Remove expiry if not needed
      if (!config.showExpiry) {
        payload.expiry_date = null;
      }

      let response;
      if (item?.id) {
        response = await config.api.update(item.id, payload);
      } else {
        // Use createItem for inventoryApi, create for others
        if (config.api === inventoryApi && typeof config.api.createItem === 'function') {
          response = await config.api.createItem(payload);
        } else if (typeof config.api.create === 'function') {
          response = await config.api.create(payload);
        } else {
          throw new Error('Resource creation is not supported for this category.');
        }
      }

      if (response.error) throw new Error(response.error);

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Transmission failed. Verify connectivity.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof InventoryItem, value: any) => {
    setFormData(prev => {
      const updates: Partial<InventoryItem> = { [field]: value };
      if (field === 'category') {
        const config = CATEGORY_CONFIG[value as string];
        if (config && config.units.length > 0) {
          updates.unit = config.units[0].value;
        }
      }
      return { ...prev, ...updates };
    });
  };

  const currentConfig = formData.category ? CATEGORY_CONFIG[formData.category] : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
      <Card className="w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col rounded-[40px] shadow-2xl border-none animate-[scaleIn_0.3s_ease-out]">
        {/* Modal Header */}
        <div className="p-8 pb-4 flex items-center justify-between bg-white relative">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-200 ring-4 ring-blue-50">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                {item ? 'UPDATE ASSET' : 'NEW RESOURCE'}
              </h2>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Inventory Management Pulse</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-2xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-4 space-y-8 bg-white">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-shake">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
            </div>
          )}

          <form id="resource-form" onSubmit={handleSubmit} className="space-y-10">
            {/* Category Grid */}
            <div className="space-y-4">
              <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Resource Grouping</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleInputChange('category', key)}
                    className={`flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all duration-300 group ${formData.category === key
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200 scale-105'
                      : 'bg-white border-gray-100 text-gray-500 hover:border-blue-200 hover:bg-gray-50'
                      }`}
                  >
                    <div className={`p-3 rounded-2xl transition-colors ${formData.category === key ? 'bg-white/20' : config.color
                      }`}>
                      {config.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{config.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-6 bg-gray-50 p-6 rounded-[32px] border border-gray-100/50">
              <div className="space-y-4">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Resource Blueprint</Label>
                <div className="relative">
                  <Tag className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder={currentConfig?.placeholder || "Asset Name..."}
                    className="pl-14 py-8 rounded-2xl border-none shadow-sm focus:ring-4 focus:ring-blue-500/10 text-lg font-black bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Initial Quantity</Label>
                  <div className="relative">
                    <Hash className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 0)}
                      className="pl-14 py-8 rounded-2xl border-none shadow-sm focus:ring-4 focus:ring-blue-500/10 text-lg font-black bg-white"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Resource Unit</Label>
                  <select
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    className="w-full py-5 px-6 rounded-2xl border-none shadow-sm focus:ring-4 focus:ring-blue-500/10 text-lg font-black bg-white appearance-none cursor-pointer"
                    required
                  >
                    {currentConfig?.units.map((u) => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Cost Per Unit</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.cost_per_unit}
                      onChange={(e) => handleInputChange('cost_per_unit', parseFloat(e.target.value) || 0)}
                      className="pl-14 py-8 rounded-2xl border-none shadow-sm focus:ring-4 focus:ring-blue-500/10 text-lg font-black bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Alert Trigger Level</Label>
                  <div className="relative">
                    <AlertTriangle className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="number"
                      min="0"
                      value={formData.reorder_level}
                      onChange={(e) => handleInputChange('reorder_level', parseFloat(e.target.value) || 0)}
                      className="pl-14 py-8 rounded-2xl border-none shadow-sm focus:ring-4 focus:ring-blue-500/10 text-lg font-black bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Logistics & Compliance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6">
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Verification Pulse (Date)</Label>
                <div className="relative">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="date"
                    value={formData.purchase_date || ''}
                    onChange={(e) => handleInputChange('purchase_date', e.target.value)}
                    className="pl-14 py-8 rounded-2xl border-none bg-gray-100 shadow-sm focus:ring-4 focus:ring-blue-500/10 text-lg font-black"
                  />
                </div>
              </div>
              {(!currentConfig || currentConfig.showExpiry) && (
                <div className="space-y-2">
                  <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Expiry Deadline</Label>
                  <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="date"
                      value={formData.expiry_date ? new Date(formData.expiry_date).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleInputChange('expiry_date', e.target.value)}
                      className="pl-14 py-8 rounded-2xl border-none bg-rose-50/30 shadow-sm focus:ring-4 focus:ring-rose-500/10 text-lg font-black text-rose-600"
                    />
                  </div>
                </div>
              )}
              <div className="sm:col-span-2 space-y-2">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Source / Supplier</Label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    value={formData.supplier || ''}
                    onChange={(e) => handleInputChange('supplier', e.target.value)}
                    placeholder="Supplier or Vendor details..."
                    className="pl-14 py-8 rounded-2xl border-none bg-gray-100 shadow-sm focus:ring-4 focus:ring-blue-500/10 text-lg font-black"
                  />
                </div>
              </div>

              {/* Specialized Fields based on Category */}
              {formData.category === 'MEDICINE' && (
                <div className="sm:col-span-2 space-y-6 pt-6 border-t border-gray-100">
                  <Label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Pharmacological Context</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-gray-400">Medicine Type</Label>
                      <select
                        value={formData.medicine_type || ''}
                        onChange={(e) => handleInputChange('medicine_type', e.target.value)}
                        className="w-full py-5 px-6 rounded-2xl border-none bg-blue-50/50 text-lg font-bold appearance-none cursor-pointer"
                      >
                        <option value="">Select Type...</option>
                        <option value="VACCINE">Vaccine</option>
                        <option value="ANTIBIOTIC">Antibiotic</option>
                        <option value="SUPPLEMENT">Supplement</option>
                        <option value="DISINFECTANT">Disinfectant</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-gray-400">Withdrawal Period (Days)</Label>
                      <Input
                        type="number"
                        value={formData.withdrawal_period_days || 0}
                        onChange={(e) => handleInputChange('withdrawal_period_days', parseInt(e.target.value))}
                        className="py-6 rounded-2xl border-none bg-blue-50/50 font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.category === 'EQUIPMENT' && (
                <div className="sm:col-span-2 space-y-6 pt-6 border-t border-gray-100">
                  <Label className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">Asset Attributes</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-gray-400">Equipment Condition</Label>
                      <select
                        value={formData.condition || 'GOOD'}
                        onChange={(e) => handleInputChange('condition', e.target.value)}
                        className="w-full py-5 px-6 rounded-2xl border-none bg-amber-50/50 text-lg font-bold appearance-none cursor-pointer"
                      >
                        <option value="EXCELLENT">Excellent</option>
                        <option value="GOOD">Good</option>
                        <option value="FAIR">Fair</option>
                        <option value="DAMAGED">Damaged</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-gray-400">Lifespan Expectancy (Years)</Label>
                      <Input
                        type="number"
                        value={formData.expected_lifespan_years || 5}
                        onChange={(e) => handleInputChange('expected_lifespan_years', parseInt(e.target.value))}
                        className="py-6 rounded-2xl border-none bg-amber-50/50 font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.category === 'LABOR' && (
                <div className="sm:col-span-2 space-y-6 pt-6 border-t border-gray-100">
                  <Label className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Personnel Setup</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-gray-400">Contract Type</Label>
                      <select
                        value={formData.worker_type || 'PERMANENT'}
                        onChange={(e) => handleInputChange('worker_type', e.target.value)}
                        className="w-full py-5 px-6 rounded-2xl border-none bg-indigo-50/50 text-lg font-bold appearance-none cursor-pointer"
                      >
                        <option value="PERMANENT">Permanent</option>
                        <option value="CASUAL">Casual</option>
                        <option value="CONTRACT">Contract</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-gray-400">Payment Frequency</Label>
                      <select
                        value={formData.payment_frequency || 'MONTHLY'}
                        onChange={(e) => handleInputChange('payment_frequency', e.target.value)}
                        className="w-full py-5 px-6 rounded-2xl border-none bg-indigo-50/50 text-lg font-bold appearance-none cursor-pointer"
                      >
                        <option value="DAILY">Daily</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="MONTHLY">Monthly</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {formData.category === 'EGGS' && (
                <div className="sm:col-span-2 space-y-6 pt-6 border-t border-gray-100">
                  <Label className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em]">Quality Grading</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-gray-400">Size Grade</Label>
                      <select
                        value={formData.grade || 'MEDIUM'}
                        onChange={(e) => handleInputChange('grade', e.target.value)}
                        className="w-full py-5 px-6 rounded-2xl border-none bg-orange-50/50 text-lg font-bold appearance-none cursor-pointer"
                      >
                        <option value="SMALL">Small</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LARGE">Large</option>
                        <option value="EXTRA_LARGE">X-Large</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-gray-400">Market Quality</Label>
                      <select
                        value={formData.quality || 'GRADE_A'}
                        onChange={(e) => handleInputChange('quality', e.target.value)}
                        className="w-full py-5 px-6 rounded-2xl border-none bg-orange-50/50 text-lg font-bold appearance-none cursor-pointer"
                      >
                        <option value="GRADE_A">Grade A (Premium)</option>
                        <option value="GRADE_B">Grade B (Standard)</option>
                        <option value="GRADE_C">Grade C (Industrial)</option>
                        <option value="SPOILED">Spoiled (Waste)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-8 bg-gray-50/80 backdrop-blur-md border-t border-gray-100">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Transaction</p>
                <p className="text-2xl font-black text-gray-900">${totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 sm:flex-none py-7 px-8 border-none bg-white font-black text-gray-400 uppercase tracking-widest rounded-2xl hover:bg-gray-100"
              >
                Discard
              </Button>
              <Button
                type="submit"
                form="resource-form"
                disabled={saving}
                className="flex-[2] sm:flex-none py-7 px-10 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-300/50 hover:scale-105 active:scale-95 transition-all"
              >
                {saving ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{item ? 'COMMIT UPDATE' : 'SAVE RESOURCE'}</span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AddInventoryItemModal;
