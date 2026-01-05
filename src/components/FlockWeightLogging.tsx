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
import { format } from 'date-fns';

import {
  Weight,
  Plus,
  X,
  Save,
  Calculator,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

interface WeightMeasurement {
  id: string;
  bird_id?: string;
  weight: number;
  notes?: string;
}

interface FlockWeightLoggingProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (result: any) => void;
}

const FlockWeightLogging: React.FC<FlockWeightLoggingProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { } = useCurrency();
  const { } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [batches, setBatches] = useState<any[]>([]);
  
  // Form state
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [measurementDate, setMeasurementDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [weightMeasurements, setWeightMeasurements] = useState<WeightMeasurement[]>([]);
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

  // Add weight measurement
  const addWeightMeasurement = () => {
    const newMeasurement: WeightMeasurement = {
      id: Date.now().toString(),
      weight: 0,
      notes: ''
    };
    setWeightMeasurements([...weightMeasurements, newMeasurement]);
  };

  // Update weight measurement
  const updateWeightMeasurement = (id: string, field: keyof WeightMeasurement, value: any) => {
    setWeightMeasurements(measurements =>
      measurements.map(m => m.id === id ? { ...m, [field]: value } : m)
    );
  };

  // Remove weight measurement
  const removeWeightMeasurement = (id: string) => {
    setWeightMeasurements(measurements => measurements.filter(m => m.id !== id));
  };

  // Calculate aggregate metrics
  const calculateMetrics = () => {
    const validMeasurements = weightMeasurements.filter(m => m.weight > 0);
    
    if (validMeasurements.length === 0) {
      return {
        totalWeight: 0,
        averageWeight: 0,
        sampleSize: 0,
        estimatedFlockWeight: 0,
        fcr: 0
      };
    }

    const totalWeight = validMeasurements.reduce((sum, m) => sum + m.weight, 0);
    const averageWeight = totalWeight / validMeasurements.length;
    const sampleSize = validMeasurements.length;

    // Get selected batch details
    const selectedBatchData = batches.find(b => b.id === selectedBatch);
    const currentBirdCount = selectedBatchData ? 
      selectedBatchData.quantity - selectedBatchData.mortality_count : 0;

    const estimatedFlockWeight = averageWeight * currentBirdCount;

    // Estimate FCR (simplified calculation)
    const estimatedFeedConsumed = currentBirdCount * selectedBatchData?.current_age_days * 0.15; // Rough estimate
    const fcr = estimatedFeedConsumed / estimatedFlockWeight;

    return {
      totalWeight,
      averageWeight,
      sampleSize,
      estimatedFlockWeight,
      fcr
    };
  };

  // Submit weight logging
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const metrics = calculateMetrics();
      
      if (metrics.sampleSize === 0) {
        setError('Please add at least one valid weight measurement');
        return;
      }

      const payload = {
        batch_id: selectedBatch,
        measurement_date: measurementDate,
        weight_data: weightMeasurements.filter(m => m.weight > 0).map(m => ({
          weight: m.weight,
          bird_id: m.bird_id,
          notes: m.notes
        })),
        notes: notes
      };

      const response = await fetch('/api/v1/metrics/log-weights/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to log weights');
      }

      setSuccess('Weights logged successfully!');
      onSuccess?.(result);

      // Reset form after successful submission
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to log weights');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setWeightMeasurements([]);
    setNotes('');
    setSelectedBatch('');
    setError(null);
    setSuccess(null);
    onClose();
  };

  const metrics = calculateMetrics();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Weight className="w-5 h-5" />
              Log Flock Weights
            </h2>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Record aggregate flock weights to synchronize FCR with inventory depletion
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

          {/* Weight Measurements */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Weight Measurements</h3>
              <Button
                type="button"
                variant="outline"
                onClick={addWeightMeasurement}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Measurement
              </Button>
            </div>

            {weightMeasurements.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                <Weight className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No weight measurements added</p>
                <p className="text-sm text-gray-400 mt-1">Click "Add Measurement" to start</p>
              </div>
            ) : (
              <div className="space-y-3">
                {weightMeasurements.map((measurement, index) => (
                  <div key={measurement.id} className="p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-900">Measurement #{index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeWeightMeasurement(measurement.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Weight (kg) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={measurement.weight || ''}
                          onChange={(e) => updateWeightMeasurement(measurement.id, 'weight', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Bird ID (Optional)</Label>
                        <Input
                          value={measurement.bird_id || ''}
                          onChange={(e) => updateWeightMeasurement(measurement.id, 'bird_id', e.target.value)}
                          placeholder="e.g., Bird-001"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Notes</Label>
                        <Input
                          value={measurement.notes || ''}
                          onChange={(e) => updateWeightMeasurement(measurement.id, 'notes', e.target.value)}
                          placeholder="Optional notes"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Calculated Metrics */}
          {metrics.sampleSize > 0 && (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Calculated Metrics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Sample Size</p>
                  <p className="text-xl font-bold text-gray-900">{metrics.sampleSize} birds</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Average Weight</p>
                  <p className="text-xl font-bold text-gray-900">{metrics.averageWeight.toFixed(2)} kg</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Estimated Flock Weight</p>
                  <p className="text-xl font-bold text-gray-900">{metrics.estimatedFlockWeight.toFixed(0)} kg</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Estimated FCR</p>
                  <p className={`text-xl font-bold ${
                    metrics.fcr <= 1.8 ? 'text-green-600' :
                    metrics.fcr <= 2.0 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {metrics.fcr.toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                <p className="text-sm text-blue-800 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  This data will automatically synchronize with inventory depletion to calculate accurate FCR
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
              placeholder="Any additional notes about this weight measurement session..."
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
              disabled={loading || metrics.sampleSize === 0}
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
                  Log Weights
                </div>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default FlockWeightLogging;
