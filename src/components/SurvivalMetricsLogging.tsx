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
  HeartPulse,
  Plus,
  X,
  Save,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  Activity,
  Thermometer,
  Droplets,
  Wind,
  Users,
  Target,
  RefreshCw,
  Info
} from 'lucide-react';

interface MortalityRecord {
  id: string;
  count: number;
  cause: string;
  notes?: string;
}

interface EnvironmentalConditions {
  temperature?: number;
  humidity?: number;
  ventilation?: string;
  ammonia_level?: number;
  litter_condition?: string;
  water_quality?: string;
}

interface SurvivalMetricsLoggingProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (result: any) => void;
}

const CAUSES_OF_MORTALITY = [
  'Disease',
  'Predation',
  'Stress',
  'Heat Stress',
  'Cold Stress',
  'Ventilation Issues',
  'Feed Issues',
  'Water Issues',
  'Unknown',
  'Other'
];

const SurvivalMetricsLogging: React.FC<SurvivalMetricsLoggingProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { formatCurrency } = useCurrency();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [batches, setBatches] = useState<any[]>([]);
  
  // Form state
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [measurementDate, setMeasurementDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [mortalityRecords, setMortalityRecords] = useState<MortalityRecord[]>([]);
  const [environmentalConditions, setEnvironmentalConditions] = useState<EnvironmentalConditions>({});
  const [notes, setNotes] = useState<string>('');

  // Load batches
  useEffect(() => {
    if (isOpen) {
      loadBatches();
    }
  }, [isOpen]);

  const loadBatches = async () => {
    try {
      const response = await batchesApi.getAll();
      setBatches(response.data?.filter(batch => batch.status === 'ACTIVE') || []);
    } catch (error) {
      console.error('Error loading batches:', error);
      setError('Failed to load batches');
    }
  };

  // Add mortality record
  const addMortalityRecord = () => {
    const newRecord: MortalityRecord = {
      id: Date.now().toString(),
      count: 0,
      cause: 'Unknown',
      notes: ''
    };
    setMortalityRecords([...mortalityRecords, newRecord]);
  };

  // Update mortality record
  const updateMortalityRecord = (id: string, field: keyof MortalityRecord, value: any) => {
    setMortalityRecords(records =>
      records.map(r => r.id === id ? { ...r, [field]: value } : r)
    );
  };

  // Remove mortality record
  const removeMortalityRecord = (id: string) => {
    setMortalityRecords(records => records.filter(r => r.id !== id));
  };

  // Update environmental conditions
  const updateEnvironmentalCondition = (field: keyof EnvironmentalConditions, value: any) => {
    setEnvironmentalConditions(prev => ({ ...prev, [field]: value }));
  };

  // Calculate total mortality
  const calculateTotalMortality = () => {
    return mortalityRecords.reduce((total, record) => total + record.count, 0);
  };

  // Calculate mortality rate
  const calculateMortalityRate = () => {
    const selectedBatchData = batches.find(b => b.id === selectedBatch);
    if (!selectedBatchData) return 0;
    
    const totalMortality = calculateTotalMortality();
    const initialQuantity = selectedBatchData.quantity;
    
    return initialQuantity > 0 ? (totalMortality / initialQuantity * 100) : 0;
  };

  // Get survival rate
  const getSurvivalRate = () => {
    const selectedBatchData = batches.find(b => b.id === selectedBatch);
    if (!selectedBatchData) return 0;
    
    const totalMortality = calculateTotalMortality();
    const initialQuantity = selectedBatchData.quantity;
    
    return initialQuantity > 0 ? ((initialQuantity - totalMortality) / initialQuantity * 100) : 0;
  };

  // Validate environmental conditions
  const validateEnvironmentalConditions = () => {
    const warnings = [];
    
    if (environmentalConditions.temperature && (environmentalConditions.temperature < 15 || environmentalConditions.temperature > 35)) {
      warnings.push('Temperature outside optimal range (15-35°C)');
    }
    
    if (environmentalConditions.humidity && (environmentalConditions.humidity < 40 || environmentalConditions.humidity > 70)) {
      warnings.push('Humidity outside optimal range (40-70%)');
    }
    
    if (environmentalConditions.ammonia_level && environmentalConditions.ammonia_level > 25) {
      warnings.push('High ammonia level detected');
    }
    
    return warnings;
  };

  // Submit survival metrics
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const totalMortality = calculateTotalMortality();
      
      if (totalMortality === 0) {
        setError('Please add at least one mortality record');
        return;
      }

      const payload = {
        batch_id: selectedBatch,
        measurement_date: measurementDate,
        mortality_data: mortalityRecords.filter(r => r.count > 0).map(r => ({
          count: r.count,
          cause: r.cause,
          notes: r.notes
        })),
        environmental_conditions: environmentalConditions,
        notes: notes
      };

      const response = await fetch('/api/v1/metrics/log-survival/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to log survival metrics');
      }

      setSuccess('Survival metrics logged successfully!');
      onSuccess?.(result);

      // Reset form after successful submission
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to log survival metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMortalityRecords([]);
    setEnvironmentalConditions({});
    setNotes('');
    setSelectedBatch('');
    setError(null);
    setSuccess(null);
    onClose();
  };

  const totalMortality = calculateTotalMortality();
  const mortalityRate = calculateMortalityRate();
  const survivalRate = getSurvivalRate();
  const environmentalWarnings = validateEnvironmentalConditions();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <HeartPulse className="w-5 h-5" />
              Log Survival Metrics
            </h2>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Report abnormal losses to trigger environmental alerts and adjust stock liquidation projections
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

          {/* Batch Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Select Batch *</Label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map(batch => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.batch_number} ({batch.breed}) - Day {batch.current_age_days}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Measurement Date *</Label>
              <Input
                type="date"
                value={measurementDate}
                onChange={(e) => setMeasurementDate(e.target.value)}
                className="mt-1"
                required
              />
            </div>
          </div>

          {/* Mortality Records */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Mortality Records</h3>
              <Button
                type="button"
                variant="outline"
                onClick={addMortalityRecord}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Mortality Record
              </Button>
            </div>

            {mortalityRecords.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                <HeartPulse className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No mortality records added</p>
                <p className="text-sm text-gray-400 mt-1">Click "Add Mortality Record" to start</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mortalityRecords.map((record, index) => (
                  <div key={record.id} className="p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-900">Mortality Record #{index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMortalityRecord(record.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Count *</Label>
                        <Input
                          type="number"
                          min="0"
                          value={record.count || ''}
                          onChange={(e) => updateMortalityRecord(record.id, 'count', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Cause *</Label>
                        <Select value={record.cause} onValueChange={(value) => updateMortalityRecord(record.id, 'cause', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select cause" />
                          </SelectTrigger>
                          <SelectContent>
                            {CAUSES_OF_MORTALITY.map(cause => (
                              <SelectItem key={cause} value={cause}>
                                {cause}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium text-gray-700">Notes</Label>
                        <Input
                          value={record.notes || ''}
                          onChange={(e) => updateMortalityRecord(record.id, 'notes', e.target.value)}
                          placeholder="Optional notes about this mortality"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Environmental Conditions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Environmental Conditions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Thermometer className="w-4 h-4" />
                  Temperature (°C)
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  value={environmentalConditions.temperature || ''}
                  onChange={(e) => updateEnvironmentalCondition('temperature', parseFloat(e.target.value) || undefined)}
                  placeholder="e.g., 25.5"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Droplets className="w-4 h-4" />
                  Humidity (%)
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  value={environmentalConditions.humidity || ''}
                  onChange={(e) => updateEnvironmentalCondition('humidity', parseFloat(e.target.value) || undefined)}
                  placeholder="e.g., 65.0"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Wind className="w-4 h-4" />
                  Ventilation
                </Label>
                <Select value={environmentalConditions.ventilation || ''} onValueChange={(value) => updateEnvironmentalCondition('ventilation', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select ventilation status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXCELLENT">Excellent</SelectItem>
                    <SelectItem value="GOOD">Good</SelectItem>
                    <SelectItem value="POOR">Poor</SelectItem>
                    <SelectItem value="INADEQUATE">Inadequate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Ammonia Level (ppm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={environmentalConditions.ammonia_level || ''}
                  onChange={(e) => updateEnvironmentalCondition('ammonia_level', parseFloat(e.target.value) || undefined)}
                  placeholder="e.g., 15.0"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Litter Condition</Label>
                <Select value={environmentalConditions.litter_condition || ''} onValueChange={(value) => updateEnvironmentalCondition('litter_condition', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select litter condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRY">Dry</SelectItem>
                    <SelectItem value="SLIGHTLY_DAMP">Slightly Damp</SelectItem>
                    <SelectItem value="DAMP">Damp</SelectItem>
                    <SelectItem value="WET">Wet</SelectItem>
                    <SelectItem value="CAKED">Caked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Water Quality</Label>
                <Select value={environmentalConditions.water_quality || ''} onValueChange={(value) => updateEnvironmentalCondition('water_quality', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select water quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXCELLENT">Excellent</SelectItem>
                    <SelectItem value="GOOD">Good</SelectItem>
                    <SelectItem value="FAIR">Fair</SelectItem>
                    <SelectItem value="POOR">Poor</SelectItem>
                    <SelectItem value="CONTAMINATED">Contaminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Environmental Warnings */}
          {environmentalWarnings.length > 0 && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <h4 className="text-sm font-semibold text-orange-800 mb-2">Environmental Warnings</h4>
              <ul className="space-y-1">
                {environmentalWarnings.map((warning, index) => (
                  <li key={index} className="text-sm text-orange-700 flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3" />
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Calculated Metrics */}
          {totalMortality > 0 && (
            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Impact Analysis
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Mortality</p>
                  <p className="text-xl font-bold text-red-600">{totalMortality} birds</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Mortality Rate</p>
                  <p className={`text-xl font-bold ${mortalityRate > 5 ? 'text-red-600' : 'text-yellow-600'}`}>
                    {mortalityRate.toFixed(1)}%
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Survival Rate</p>
                  <p className={`text-xl font-bold ${survivalRate >= 95 ? 'text-green-600' : survivalRate >= 90 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {survivalRate.toFixed(1)}%
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-red-100 rounded-lg">
                <p className="text-sm text-red-800 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  This data will trigger environmental alerts and adjust stock liquidation projections
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Additional Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional observations or notes about this mortality event..."
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
              disabled={loading || totalMortality === 0}
              className="flex-1"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Logging...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Log Survival Metrics
                </div>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SurvivalMetricsLogging;
