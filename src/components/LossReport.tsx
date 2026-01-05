import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { batchesApi } from '../lib/api';
import { format } from 'date-fns';

import {
  AlertTriangle,
  X,
  Save,
  Package,
  HeartPulse,
  Wrench,
  Egg,
  Droplets,
  CheckCircle,
  TrendingDown
} from 'lucide-react';

interface LossReportProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (result: any) => void;
  initialLossType?: string;
  initialBatchId?: string;
}

const LOSS_TYPES = [
  { value: 'MORTALITY', label: 'Bird Mortality', icon: HeartPulse, color: 'red' },
  { value: 'FEED', label: 'Feed Loss', icon: Package, color: 'orange' },
  { value: 'EQUIPMENT', label: 'Equipment Loss', icon: Wrench, color: 'blue' },
  { value: 'EGGS', label: 'Egg Loss', icon: Egg, color: 'yellow' },
  { value: 'MEDICINE', label: 'Medicine Loss', icon: Package, color: 'purple' },
  { value: 'WATER', label: 'Water Loss', icon: Droplets, color: 'cyan' },
  { value: 'OTHER', label: 'Other Loss', icon: AlertTriangle, color: 'gray' }
];

const SEVERITY_LEVELS = [
  { value: 'LOW', label: 'Low', description: 'Minor impact', color: 'yellow' },
  { value: 'MEDIUM', label: 'Medium', description: 'Moderate impact', color: 'orange' },
  { value: 'HIGH', label: 'High', description: 'Significant impact', color: 'red' },
  { value: 'CRITICAL', label: 'Critical', description: 'Severe impact', color: 'red' }
];

const FEED_TYPES = [
  'STARTER',
  'GROWER', 
  'FINISHER',
  'LAYER',
  'BREEDER',
  'SUPPLEMENT'
];

const EQUIPMENT_TYPES = [
  'FEEDER',
  'WATERER',
  'HEATING',
  'VENTILATION',
  'LIGHTING',
  'PROCESSING',
  'MONITORING',
  'OTHER'
];

const MORTALITY_CAUSES = [
  'DISEASE',
  'PREDATION',
  'STRESS',
  'HEAT_STRESS',
  'COLD_STRESS',
  'VENTILATION_ISSUES',
  'FEED_ISSUES',
  'WATER_ISSUES',
  'ACCIDENT',
  'UNKNOWN',
  'OTHER'
];

const LossReport: React.FC<LossReportProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialLossType,
  initialBatchId
}) => {
  const { formatCurrency } = useCurrency();
  const { } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [batches, setBatches] = useState<any[]>([]);
  
  // Form state
  const [lossType, setLossType] = useState<string>(initialLossType || '');
  const [selectedBatch, setSelectedBatch] = useState<string>(initialBatchId || '');
  const [reportDate, setReportDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [severity, setSeverity] = useState<string>('MEDIUM');
  const [lossData, setLossData] = useState<any>({});
  const [notes, setNotes] = useState<string>('');

  // Load batches
  useEffect(() => {
    if (isOpen) {
      loadBatches();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialLossType) {
      setLossType(initialLossType);
      setLossData(getDefaultLossData(initialLossType));
    }
  }, [initialLossType]);

  const loadBatches = async () => {
    try {
      const response = await batchesApi.getAll();
      setBatches(response.data || []);
    } catch (error) {
      console.error('Error loading batches:', error);
      setError('Failed to load batches');
    }
  };

  const getDefaultLossData = (type: string) => {
    switch (type) {
      case 'MORTALITY':
        return { count: 0, cause: 'UNKNOWN', description: '' };
      case 'FEED':
        return { quantity: 0, feed_type: 'STARTER', reason: 'SPOILAGE', unit: 'kg' };
      case 'EQUIPMENT':
        return { equipment_type: 'OTHER', reason: 'MALFUNCTION', replacement_cost: 0 };
      case 'EGGS':
        return { trays: 0, reason: 'BREAKAGE', stage: 'COLLECTION' };
      case 'MEDICINE':
        return { quantity: 0, medicine_type: 'VACCINE', reason: 'EXPIRY', unit: 'doses' };
      case 'WATER':
        return { volume: 0, reason: 'LEAKAGE', unit: 'liters' };
      default:
        return { description: '', estimated_value: 0 };
    }
  };

  // Update loss data based on type
  const updateLossData = (field: string, value: any) => {
    setLossData((prev: any) => ({ ...prev, [field]: value }));
  };

  // Calculate estimated financial impact
  const calculateFinancialImpact = () => {
    const selectedBatchData = batches.find(b => b.id === selectedBatch);
    
    switch (lossType) {
      case 'MORTALITY':
        const birdValue = 2.5; // $2.5 per kg average market weight
        const avgWeight = getExpectedWeight(selectedBatchData?.current_age_days || 0, selectedBatchData?.breed || 'BROILER');
        return lossData.count * avgWeight * birdValue;
        
      case 'FEED':
        return lossData.quantity * 0.5; // $0.5 per kg feed cost
        
      case 'EQUIPMENT':
        return lossData.replacement_cost || 0;
        
      case 'EGGS':
        return lossData.trays * 3.0; // $3 per tray average
        
      case 'MEDICINE':
        return lossData.quantity * 2.0; // $2 per dose average
        
      case 'WATER':
        return lossData.volume * 0.001; // $0.001 per liter
        
      default:
        return lossData.estimated_value || 0;
    }
  };

  const getExpectedWeight = (ageDays: number, breed: string) => {
    // Simplified weight calculation
    const weights: Record<string, Record<number, number>> = {
      'BROILER': { 0: 0.04, 7: 0.15, 14: 0.40, 21: 0.85, 28: 1.35, 35: 1.90, 42: 2.50 },
      'LAYER': { 0: 0.03, 7: 0.12, 14: 0.30, 21: 0.55, 28: 0.80, 35: 1.10, 42: 1.40 }
    };
    
    const curve = weights[breed] || weights['BROILER'];
    const ages = Object.keys(curve).map(Number).sort((a, b) => a - b);
    
    if (ageDays <= ages[0]) return curve[ages[0]];
    if (ageDays >= ages[ages.length - 1]) return curve[ages[ages.length - 1]];
    
    // Linear interpolation
    for (let i = 0; i < ages.length - 1; i++) {
      if (ages[i] <= ageDays && ageDays <= ages[i + 1]) {
        const ratio = (ageDays - ages[i]) / (ages[i + 1] - ages[i]);
        return curve[ages[i]] + ratio * (curve[ages[i + 1]] - curve[ages[i]]);
      }
    }
    
    return curve[ages[ages.length - 1]];
  };

  // Validate form
  const validateForm = () => {
    if (!lossType) {
      setError('Please select a loss type');
      return false;
    }
    
    if (!selectedBatch) {
      setError('Please select a batch');
      return false;
    }
    
    switch (lossType) {
      case 'MORTALITY':
        if (!lossData.count || lossData.count <= 0) {
          setError('Please enter a valid mortality count');
          return false;
        }
        break;
      case 'FEED':
        if (!lossData.quantity || lossData.quantity <= 0) {
          setError('Please enter a valid feed quantity');
          return false;
        }
        break;
      case 'EQUIPMENT':
        if (!lossData.equipment_type) {
          setError('Please select equipment type');
          return false;
        }
        break;
      case 'EGGS':
        if (!lossData.trays || lossData.trays <= 0) {
          setError('Please enter a valid number of trays');
          return false;
        }
        break;
    }
    
    return true;
  };

  // Submit loss report
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const payload = {
        loss_type: lossType,
        batch_id: selectedBatch,
        report_date: reportDate,
        severity: severity,
        loss_data: lossData,
        impact_assessment: {
          financial_impact: calculateFinancialImpact(),
          operational_impact: getOperationalImpact(),
          recovery_time: getRecoveryTime(),
          prevention_measures: getPreventionMeasures()
        },
        notes: notes
      };

      const response = await fetch('/api/v1/metrics/report-losses/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to report loss');
      }

      setSuccess('Loss reported successfully!');
      onSuccess?.(result);

      // Reset form after successful submission
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to report loss');
    } finally {
      setLoading(false);
    }
  };

  const getOperationalImpact = () => {
    switch (lossType) {
      case 'MORTALITY':
        return lossData.count > 10 ? 'High' : lossData.count > 5 ? 'Medium' : 'Low';
      case 'FEED':
        return lossData.quantity > 100 ? 'High' : lossData.quantity > 50 ? 'Medium' : 'Low';
      case 'EQUIPMENT':
        return lossData.replacement_cost > 1000 ? 'High' : lossData.replacement_cost > 500 ? 'Medium' : 'Low';
      default:
        return 'Medium';
    }
  };

  const getRecoveryTime = () => {
    switch (severity) {
      case 'LOW': return '1-3 days';
      case 'MEDIUM': return '3-7 days';
      case 'HIGH': return '1-2 weeks';
      case 'CRITICAL': return '2-4 weeks';
      default: return 'Unknown';
    }
  };

  const getPreventionMeasures = () => {
    const measures = [];
    
    switch (lossType) {
      case 'MORTALITY':
        measures.push('Improve biosecurity', 'Enhance monitoring', 'Vaccination review');
        break;
      case 'FEED':
        measures.push('Improve storage conditions', 'Regular quality checks', 'Inventory rotation');
        break;
      case 'EQUIPMENT':
        measures.push('Regular maintenance', 'Backup equipment', 'Staff training');
        break;
      case 'EGGS':
        measures.push('Handle with care', 'Improve collection process', 'Better packaging');
        break;
    }
    
    return measures;
  };

  const handleClose = () => {
    setLossType('');
    setSelectedBatch('');
    setLossData({});
    setNotes('');
    setError(null);
    setSuccess(null);
    onClose();
  };

  const financialImpact = calculateFinancialImpact();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Report Loss
            </h2>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Report various types of losses to trigger alerts and adjust projections
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-700">{success}</span>
            </div>
          )}

          {/* Loss Type and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Loss Type *</Label>
              <Select value={lossType} onValueChange={(value) => {
                setLossType(value);
                setLossData(getDefaultLossData(value));
              }}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select loss type" />
                </SelectTrigger>
                <SelectContent>
                  {LOSS_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Batch *</Label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map(batch => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.batch_number} ({batch.breed})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Report Date *</Label>
              <Input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Severity *</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITY_LEVELS.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      <div>
                        <div className="font-medium">{level.label}</div>
                        <div className="text-xs text-gray-500">{level.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loss Type Specific Fields */}
          {lossType && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Loss Details</h3>
              
              {/* Mortality Loss */}
              {lossType === 'MORTALITY' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Number of Birds *</Label>
                    <Input
                      type="number"
                      min="0"
                      value={lossData.count || ''}
                      onChange={(e) => updateLossData('count', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Cause *</Label>
                    <Select value={lossData.cause || ''} onValueChange={(value) => updateLossData('cause', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select cause" />
                      </SelectTrigger>
                      <SelectContent>
                        {MORTALITY_CAUSES.map(cause => (
                          <SelectItem key={cause} value={cause}>
                            {cause.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-700">Description</Label>
                    <Textarea
                      value={lossData.description || ''}
                      onChange={(e) => updateLossData('description', e.target.value)}
                      placeholder="Describe the mortality event..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Feed Loss */}
              {lossType === 'FEED' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Quantity Lost *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={lossData.quantity || ''}
                      onChange={(e) => updateLossData('quantity', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Feed Type *</Label>
                    <Select value={lossData.feed_type || ''} onValueChange={(value) => updateLossData('feed_type', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select feed type" />
                      </SelectTrigger>
                      <SelectContent>
                        {FEED_TYPES.map(type => (
                          <SelectItem key={type} value={type}>
                            {type.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Reason *</Label>
                    <Select value={lossData.reason || ''} onValueChange={(value) => updateLossData('reason', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SPOILAGE">Spoilage</SelectItem>
                        <SelectItem value="CONTAMINATION">Contamination</SelectItem>
                        <SelectItem value="PEST_DAMAGE">Pest Damage</SelectItem>
                        <SelectItem value="STORAGE_ISSUE">Storage Issue</SelectItem>
                        <SelectItem value="MISMANAGEMENT">Mismanagement</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Unit</Label>
                    <Select value={lossData.unit || 'kg'} onValueChange={(value) => updateLossData('unit', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilograms</SelectItem>
                        <SelectItem value="bags">Bags</SelectItem>
                        <SelectItem value="tons">Tons</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Equipment Loss */}
              {lossType === 'EQUIPMENT' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Equipment Type *</Label>
                    <Select value={lossData.equipment_type || ''} onValueChange={(value) => updateLossData('equipment_type', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select equipment type" />
                      </SelectTrigger>
                      <SelectContent>
                        {EQUIPMENT_TYPES.map(type => (
                          <SelectItem key={type} value={type}>
                            {type.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Reason *</Label>
                    <Select value={lossData.reason || ''} onValueChange={(value) => updateLossData('reason', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALFUNCTION">Malfunction</SelectItem>
                        <SelectItem value="DAMAGE">Damage</SelectItem>
                        <SelectItem value="THEFT">Theft</SelectItem>
                        <SelectItem value="WEAR_AND_TEAR">Wear and Tear</SelectItem>
                        <SelectItem value="ACCIDENT">Accident</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Replacement Cost</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={lossData.replacement_cost || ''}
                      onChange={(e) => updateLossData('replacement_cost', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Egg Loss */}
              {lossType === 'EGGS' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Number of Trays *</Label>
                    <Input
                      type="number"
                      min="0"
                      value={lossData.trays || ''}
                      onChange={(e) => updateLossData('trays', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Reason *</Label>
                    <Select value={lossData.reason || ''} onValueChange={(value) => updateLossData('reason', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BREAKAGE">Breakage</SelectItem>
                        <SelectItem value="SPOILAGE">Spoilage</SelectItem>
                        <SelectItem value="CONTAMINATION">Contamination</SelectItem>
                        <SelectItem value="MISHANDLING">Mishandling</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Stage</Label>
                    <Select value={lossData.stage || ''} onValueChange={(value) => updateLossData('stage', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COLLECTION">Collection</SelectItem>
                        <SelectItem value="PROCESSING">Processing</SelectItem>
                        <SelectItem value="STORAGE">Storage</SelectItem>
                        <SelectItem value="TRANSPORT">Transport</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Impact Assessment */}
          {lossType && (
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                Impact Assessment
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Financial Impact</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(financialImpact)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Operational Impact</p>
                  <p className="text-xl font-bold text-orange-600">{getOperationalImpact()}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Recovery Time</p>
                  <p className="text-xl font-bold text-blue-600">{getRecoveryTime()}</p>
                </div>
              </div>
              
              {getPreventionMeasures().length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Prevention Measures:</p>
                  <div className="flex flex-wrap gap-2">
                    {getPreventionMeasures().map((measure, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {measure}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Additional Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information about this loss..."
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
                  Reporting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Report Loss
                </div>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default LossReport;
