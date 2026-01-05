import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { batchesApi } from '../lib/api';

import {
  X,
  Package,
  Hash,
  DollarSign,
  AlertTriangle,
  Thermometer,
  Droplets,
  Wind,
  Calculator,
  RefreshCw,
  Filter,
  Download,
  Eye,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Target
} from 'lucide-react';

interface ProfessionalInventoryItem {
  name: string;
  category: string;
  subcategory?: string;
  quantity: number;
  unit: string;
  cost_per_unit: number;
  market_price_per_unit?: number;
  reorder_level: number;
  reorder_point?: number;
  order_up_to_level?: number;
  safety_stock?: number;
  service_level_target: number;
  lead_time_days: number;
  supplier?: string;
  expiry_date?: string;
  manufacture_date?: string;
  shelf_life_days?: number;
  quality_grade: 'PREMIUM' | 'STANDARD' | 'ECONOMY';
  feed_stage?: string;
  storage_temperature_min?: number;
  storage_temperature_max?: number;
  humidity_requirement?: number;
  ventilation_required: boolean;
  batch?: string;
  batch_number?: string;
  location?: string;
  notes?: string;
  barcode?: string;
}

interface ProfessionalAddInventoryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ProfessionalInventoryItem) => void;
  item?: ProfessionalInventoryItem | null;
  mode?: 'create' | 'edit';
}

const CATEGORY_CHOICES = [
  { value: 'FEED', label: 'Feed & Nutrition' },
  { value: 'MEDICINE', label: 'Medicine & Health' },
  { value: 'EQUIPMENT', label: 'Equipment & Supplies' },
  { value: 'LIVE_BIRDS', label: 'Live Birds' },
  { value: 'EGGS', label: 'Eggs & Products' },
  { value: 'WATER', label: 'Water & Treatment' },
  { value: 'HATCHERY', label: 'Hatchery Supplies' },
  { value: 'WASTE', label: 'Waste Products' },
  { value: 'FARM_MACHINERY', label: 'Farm Machinery' },
  { value: 'DIGITAL_EQUIPMENT', label: 'Digital Equipment' },
  { value: 'OFFICE_SUPPLIES', label: 'Office Supplies' },
  { value: 'VETERINARY_TOOLS', label: 'Veterinary Tools' },
  { value: 'FEED_SUPPLEMENTS', label: 'Feed Supplements' },
];

const FEED_STAGE_CHOICES = [
  { value: 'STARTER', label: 'Starter Feed (1-18 days)' },
  { value: 'GROWER', label: 'Grower Feed (19-40 days)' },
  { value: 'FINISHER', label: 'Finisher Feed (40+ days)' },
  { value: 'LAYER', label: 'Layer Feed' },
  { value: 'BREEDER', label: 'Breeder Feed' },
];

const QUALITY_CHOICES = [
  { value: 'PREMIUM', label: 'Premium (110% value)' },
  { value: 'STANDARD', label: 'Standard (100% value)' },
  { value: 'ECONOMY', label: 'Economy (90% value)' },
];

const UNITS = ['kg', 'bags', 'liters', 'units', 'boxes', 'bottles', 'pieces', 'trays', 'dozens'];

const ProfessionalAddInventoryItemModal: React.FC<ProfessionalAddInventoryItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  item,
  mode = 'create'
}) => {
  const { formatCurrency } = useCurrency();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  
  const [formData, setFormData] = useState<ProfessionalInventoryItem>({
    name: '',
    category: 'FEED',
    subcategory: '',
    quantity: 0,
    unit: 'kg',
    cost_per_unit: 0,
    market_price_per_unit: undefined,
    reorder_level: 10,
    reorder_point: undefined,
    order_up_to_level: undefined,
    safety_stock: undefined,
    service_level_target: 95.0,
    lead_time_days: 2,
    supplier: '',
    expiry_date: '',
    manufacture_date: '',
    shelf_life_days: undefined,
    quality_grade: 'STANDARD',
    feed_stage: undefined,
    storage_temperature_min: undefined,
    storage_temperature_max: undefined,
    humidity_requirement: undefined,
    ventilation_required: false,
    batch: '',
    batch_number: '',
    location: '',
    notes: '',
    barcode: '',
  });

  // Calculate derived values
  const totalCost = (Number(formData.quantity || 0) * Number(formData.cost_per_unit || 0)) || 0;
  const marketValue = formData.market_price_per_unit ? 
    (Number(formData.quantity || 0) * Number(formData.market_price_per_unit)) : totalCost;
  const potentialProfit = marketValue - totalCost;

  // Load batches
  useEffect(() => {
    if (isOpen) {
      loadBatches();
      if (item && mode === 'edit') {
        setFormData(item);
      }
    }
  }, [isOpen, item, mode]);

  const loadBatches = async () => {
    try {
      const response = await batchesApi.getAll();
      setBatches(response.data || []);
    } catch (error) {
      console.error('Error loading batches:', error);
    }
  };

  const handleInputChange = (field: keyof ProfessionalInventoryItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-calculate some fields based on inputs
    if (field === 'service_level_target' || field === 'lead_time_days' || field === 'cost_per_unit') {
      calculateOptimalParameters();
    }
  };

  const calculateOptimalParameters = () => {
    // Simplified calculation for demonstration
    // In practice, this would use the research-based formulas
    const serviceLevel = Number(formData.service_level_target || 95);
    const leadTime = Number(formData.lead_time_days || 2);
    const costPerUnit = Number(formData.cost_per_unit || 0);
    
    // Calculate safety stock (simplified)
    const safetyStock = (serviceLevel / 100) * leadTime * 10; // Simplified formula
    
    // Calculate reorder point
    const reorderPoint = safetyStock + (leadTime * 5); // Simplified daily demand assumption
    
    // Calculate order-up-to level
    const orderUpToLevel = reorderPoint + (Math.sqrt(2 * 100 * 5 / (costPerUnit * 0.25)) || 0); // Simplified EOQ
    
    setFormData(prev => ({
      ...prev,
      safety_stock: safetyStock,
      reorder_point: reorderPoint,
      order_up_to_level: orderUpToLevel
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save inventory item');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'FEED',
      subcategory: '',
      quantity: 0,
      unit: 'kg',
      cost_per_unit: 0,
      market_price_per_unit: undefined,
      reorder_level: 10,
      reorder_point: undefined,
      order_up_to_level: undefined,
      safety_stock: undefined,
      service_level_target: 95.0,
      lead_time_days: 2,
      supplier: '',
      expiry_date: '',
      manufacture_date: '',
      shelf_life_days: undefined,
      quality_grade: 'STANDARD',
      feed_stage: undefined,
      storage_temperature_min: undefined,
      storage_temperature_max: undefined,
      humidity_requirement: undefined,
      ventilation_required: false,
      batch: '',
      batch_number: '',
      location: '',
      notes: '',
      barcode: '',
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {mode === 'edit' ? 'Edit Inventory Item' : 'Add Professional Inventory Item'}
            </h2>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Professional inventory management with batch tracking and optimization
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Item Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Premium Starter Feed"
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_CHOICES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Quantity *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Unit *</Label>
                <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map(unit => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Cost per Unit *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cost_per_unit}
                  onChange={(e) => handleInputChange('cost_per_unit', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Market Price per Unit</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.market_price_per_unit || ''}
                  onChange={(e) => handleInputChange('market_price_per_unit', parseFloat(e.target.value) || undefined)}
                  placeholder="Optional: Current market price"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Batch Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Hash className="w-5 h-5" />
              Batch Assignment
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Assign to Batch</Label>
                <Select value={formData.batch || ''} onValueChange={(value) => handleInputChange('batch', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select batch (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No batch assignment</SelectItem>
                    {batches.map(batch => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.batch_number} ({batch.breed})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Batch/Lot Number</Label>
                <Input
                  value={formData.batch_number || ''}
                  onChange={(e) => handleInputChange('batch_number', e.target.value)}
                  placeholder="e.g., LOT-2024-001"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Storage Location</Label>
                <Input
                  value={formData.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Warehouse A, Shelf 3"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Barcode/QR Code</Label>
                <Input
                  value={formData.barcode || ''}
                  onChange={(e) => handleInputChange('barcode', e.target.value)}
                  placeholder="Optional: Barcode for scanning"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Quality & Expiry */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Quality & Expiry Management
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Quality Grade</Label>
                <Select value={formData.quality_grade} onValueChange={(value: any) => handleInputChange('quality_grade', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select quality grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {QUALITY_CHOICES.map(quality => (
                      <SelectItem key={quality.value} value={quality.value}>
                        {quality.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Supplier</Label>
                <Input
                  value={formData.supplier || ''}
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                  placeholder="Supplier name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Manufacture Date</Label>
                <Input
                  type="date"
                  value={formData.manufacture_date || ''}
                  onChange={(e) => handleInputChange('manufacture_date', e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Expiry Date</Label>
                <Input
                  type="date"
                  value={formData.expiry_date || ''}
                  onChange={(e) => handleInputChange('expiry_date', e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Shelf Life (days)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.shelf_life_days || ''}
                  onChange={(e) => handleInputChange('shelf_life_days', parseInt(e.target.value) || undefined)}
                  placeholder="e.g., 180"
                  className="mt-1"
                />
              </div>
              
              {formData.category === 'FEED' && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Feed Stage</Label>
                  <Select value={formData.feed_stage || ''} onValueChange={(value) => handleInputChange('feed_stage', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select feed stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {FEED_STAGE_CHOICES.map(stage => (
                        <SelectItem key={stage.value} value={stage.value}>
                          {stage.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Storage Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Thermometer className="w-5 h-5" />
              Storage Requirements
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Min Temperature (°C)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.storage_temperature_min || ''}
                  onChange={(e) => handleInputChange('storage_temperature_min', parseFloat(e.target.value) || undefined)}
                  placeholder="e.g., 2"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Max Temperature (°C)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.storage_temperature_max || ''}
                  onChange={(e) => handleInputChange('storage_temperature_max', parseFloat(e.target.value) || undefined)}
                  placeholder="e.g., 8"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Humidity Requirement (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.humidity_requirement || ''}
                  onChange={(e) => handleInputChange('humidity_requirement', parseFloat(e.target.value) || undefined)}
                  placeholder="e.g., 65"
                  className="mt-1"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ventilation"
                  checked={formData.ventilation_required}
                  onChange={(e) => handleInputChange('ventilation_required', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="ventilation" className="text-sm font-medium text-gray-700">
                  Requires Special Ventilation
                </Label>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Inventory Optimization (s,S Policy)
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              >
                {showAdvancedSettings ? 'Hide' : 'Show'} Advanced
              </Button>
            </div>
            
            {showAdvancedSettings && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Service Level Target (%)</Label>
                  <Input
                    type="number"
                    min="85"
                    max="99.9"
                    step="0.1"
                    value={formData.service_level_target}
                    onChange={(e) => handleInputChange('service_level_target', parseFloat(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Target service level for inventory availability</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Lead Time (days)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.lead_time_days}
                    onChange={(e) => handleInputChange('lead_time_days', parseInt(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Days between order and delivery</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Reorder Point (s)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.reorder_point || ''}
                    onChange={(e) => handleInputChange('reorder_point', parseFloat(e.target.value) || undefined)}
                    placeholder="Auto-calculated"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">When to place reorder</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Order-up-to Level (S)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.order_up_to_level || ''}
                    onChange={(e) => handleInputChange('order_up_to_level', parseFloat(e.target.value) || undefined)}
                    placeholder="Auto-calculated"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Target inventory level after reorder</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Safety Stock</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.safety_stock || ''}
                    onChange={(e) => handleInputChange('safety_stock', parseFloat(e.target.value) || undefined)}
                    placeholder="Auto-calculated"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Buffer stock for demand variability</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Reorder Level</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.reorder_level}
                    onChange={(e) => handleInputChange('reorder_level', parseFloat(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Simple reorder threshold (fallback)</p>
                </div>
              </div>
            )}
          </div>

          {/* Cost Summary */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Cost Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Cost</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(totalCost)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Market Value</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(marketValue)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Potential Profit</p>
                <p className={`text-xl font-bold ${potentialProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(potentialProfit)}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Notes</Label>
            <Textarea
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes about this inventory item..."
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {mode === 'edit' ? 'Update Item' : 'Add Item'}
                </div>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProfessionalAddInventoryItemModal;
