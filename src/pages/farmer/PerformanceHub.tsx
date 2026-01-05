import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress-component';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useAuth } from '../../contexts/AuthContext';
import { batchesApi } from '../../lib/api';
import { format } from 'date-fns';

import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  HeartPulse,
  AlertTriangle,
  BarChart3,
  PieChart,
  Calendar,
  Users,
  Weight,
  DollarSign,
  Thermometer,
  Droplets,
  Wind,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Eye,
  Settings,
  Filter
} from 'lucide-react';

interface Batch {
  id: string;
  batch_number: string;
  breed: string;
  quantity: number;
  status: string;
  current_age_days: number;
  start_date: string;
}

interface BatchPerformance {
  batch_id: string;
  batch_number: string;
  breed: string;
  current_age_days: number;
  initial_quantity: number;
  current_bird_count: number;
  mortality_count: number;
  survival_rate: number;
  estimated_weight: number;
  total_feed_consumed: number;
  fcr: number;
  growth_rate: number;
  health_issues: number;
  egg_production: number;
  performance_score: number;
  status: string;
}

interface FCRAnalysis {
  batch_fcr_data: Array<{
    batch_id: string;
    batch_number: string;
    current_fcr: number;
    fcr_trend: Array<{
      date: string;
      cumulative_feed: number;
      cumulative_weight: number;
      fcr: number;
    }>;
    target_fcr: number;
    fcr_performance: string;
    inventory_sync: {
      sync_percentage: number;
      status: string;
      inventory_depletion: number;
      actual_consumption: number;
      discrepancy: number;
    };
  }>;
  overall_fcr_trend: {
    trend: string;
    weekly_average: number;
    monthly_average: number;
  };
  fcr_benchmarks: Record<string, any>;
  inventory_depletion_sync: Array<{
    batch_id: string;
    sync_percentage: number;
    status: string;
  }>;
}

interface SurvivalAnalysis {
  batch_survival_data: Array<{
    batch_id: string;
    batch_number: string;
    initial_quantity: number;
    current_quantity: number;
    total_mortality: number;
    survival_rate: number;
    survival_trend: Array<{
      date: string;
      cumulative_mortality: number;
      survival_rate: number;
      daily_mortality: number;
      cause: string;
    }>;
    loss_analysis: {
      pattern: string;
      recent_mortality: number;
      earlier_mortality: number;
      trend: string;
    };
    mortality_causes: Record<string, number>;
    survival_projection: {
      current_survival_rate: number;
      projected_final_survival: number;
      confidence: string;
    };
  }>;
  overall_survival_trend: {
    trend: string;
    weekly_average: number;
    monthly_average: number;
  };
  mortality_causes_summary: Record<string, number>;
  abnormal_losses: Array<{
    batch_id: string;
    batch_number: string;
    severity: string;
    current_rate: number;
    expected_rate: number;
    deviation: number;
  }>;
  survival_benchmarks: Record<string, any>;
}

interface EnvironmentalAlert {
  type: string;
  severity: string;
  batch_id: string;
  batch_number: string;
  message: string;
  recommended_action: string;
  affected_systems: string[];
}

interface PerformanceData {
  performance_summary: {
    total_active_batches: number;
    total_birds: number;
    average_fcr: number;
    overall_survival_rate: number;
    total_feed_consumed: number;
    total_weight_gained: number;
    performance_score: number;
  };
  batch_performance: BatchPerformance[];
  fcr_analysis: FCRAnalysis;
  survival_analysis: SurvivalAnalysis;
  environmental_alerts: EnvironmentalAlert[];
  inventory_sync_status: Array<{
    batch_id: string;
    batch_number: string;
    sync_percentage: number;
    sync_status: string;
    total_consumed: number;
    inventory_depletion: number;
    discrepancy: number;
  }>;
  last_updated: string;
}

const PerformanceHub: React.FC = () => {
  const { formatCurrency } = useCurrency();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [selectedView, setSelectedView] = useState<'overview' | 'fcr' | 'survival' | 'alerts'>('overview');
  const [showDetails, setShowDetails] = useState(false);

  // Load data
  useEffect(() => {
    loadPerformanceData();
    loadBatches();
  }, []);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/performance/hub/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setPerformanceData(data);
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBatches = async () => {
    try {
      const response = await batchesApi.getAll();
      setBatches(response.data || []);
    } catch (error) {
      console.error('Error loading batches:', error);
    }
  };

  // Filter performance data based on selected batch
  const filteredPerformanceData = useMemo(() => {
    if (!performanceData || selectedBatch === 'all') return performanceData;

    const filteredBatchPerformance = performanceData.batch_performance.filter(
      batch => batch.batch_id === selectedBatch
    );
    const filteredFCRData = performanceData.fcr_analysis.batch_fcr_data.filter(
      batch => batch.batch_id === selectedBatch
    );
    const filteredSurvivalData = performanceData.survival_analysis.batch_survival_data.filter(
      batch => batch.batch_id === selectedBatch
    );
    const filteredAlerts = performanceData.environmental_alerts.filter(
      alert => alert.batch_id === selectedBatch
    );
    const filteredSyncStatus = performanceData.inventory_sync_status.filter(
      status => status.batch_id === selectedBatch
    );

    return {
      ...performanceData,
      batch_performance: filteredBatchPerformance,
      fcr_analysis: {
        ...performanceData.fcr_analysis,
        batch_fcr_data: filteredFCRData
      },
      survival_analysis: {
        ...performanceData.survival_analysis,
        batch_survival_data: filteredSurvivalData
      },
      environmental_alerts: filteredAlerts,
      inventory_sync_status: filteredSyncStatus
    };
  }, [performanceData, selectedBatch]);

  // Get performance rating color
  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get FCR performance color
  const getFCRColor = (fcr: number, target: number) => {
    const ratio = fcr / target;
    if (ratio <= 0.9) return 'text-green-600';
    if (ratio <= 1.0) return 'text-blue-600';
    if (ratio <= 1.2) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get survival rate color
  const getSurvivalColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 90) return 'text-blue-600';
    if (rate >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get alert severity color
  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'LOW': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!performanceData) {
    return (
      <div className="text-center py-12">
        <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No performance data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Hub</h1>
          <p className="text-gray-500 mt-1">FCR synchronization and survival metrics tracking</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
          <Button onClick={loadPerformanceData} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Performance Summary Cards */}
      {filteredPerformanceData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-white border-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-sm text-gray-500">Active Batches</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{filteredPerformanceData.performance_summary.total_active_batches}</p>
            <p className="text-sm text-gray-600 mt-2">{filteredPerformanceData.performance_summary.total_birds} total birds</p>
          </Card>

          <Card className="p-6 bg-white border-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-green-600" />
              <span className="text-sm text-gray-500">Average FCR</span>
            </div>
            <p className={`text-3xl font-bold ${getPerformanceColor(filteredPerformanceData.performance_summary.performance_score)}`}>
              {filteredPerformanceData.performance_summary.average_fcr.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 mt-2">Feed conversion ratio</p>
          </Card>

          <Card className="p-6 bg-white border-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <HeartPulse className="w-8 h-8 text-red-600" />
              <span className="text-sm text-gray-500">Survival Rate</span>
            </div>
            <p className={`text-3xl font-bold ${getSurvivalColor(filteredPerformanceData.performance_summary.overall_survival_rate)}`}>
              {filteredPerformanceData.performance_summary.overall_survival_rate.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600 mt-2">Overall survival</p>
          </Card>

          <Card className="p-6 bg-white border-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <span className="text-sm text-gray-500">Performance Score</span>
            </div>
            <p className={`text-3xl font-bold ${getPerformanceColor(filteredPerformanceData.performance_summary.performance_score)}`}>
              {filteredPerformanceData.performance_summary.performance_score.toFixed(0)}
            </p>
            <p className="text-sm text-gray-600 mt-2">Overall score</p>
          </Card>
        </div>
      ) : (
        <Card className="p-12 bg-white border-2 border-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading performance data...</p>
          </div>
        </Card>
      )}

      {/* View Selector and Filters */}
      <Card className="p-6 bg-white border-2 border-gray-100">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={selectedView === 'overview' ? 'default' : 'outline'}
              onClick={() => setSelectedView('overview')}
            >
              Overview
            </Button>
            <Button
              variant={selectedView === 'fcr' ? 'default' : 'outline'}
              onClick={() => setSelectedView('fcr')}
            >
              FCR Analysis
            </Button>
            <Button
              variant={selectedView === 'survival' ? 'default' : 'outline'}
              onClick={() => setSelectedView('survival')}
            >
              Survival Metrics
            </Button>
            <Button
              variant={selectedView === 'alerts' ? 'default' : 'outline'}
              onClick={() => setSelectedView('alerts')}
            >
              Alerts
            </Button>
          </div>

          <Select value={selectedBatch} onValueChange={setSelectedBatch}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select Batch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              {batches.map(batch => (
                <SelectItem key={batch.id} value={batch.id}>
                  {batch.batch_number} ({batch.breed})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Overview View */}
      {selectedView === 'overview' && filteredPerformanceData && (
        <div className="space-y-6">
          {/* Batch Performance Table */}
          <Card className="p-6 bg-white border-2 border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Batch Performance Overview</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Batch</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Birds</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Weight</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">FCR</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Survival</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Performance</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Sync Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPerformanceData.batch_performance.map((batch) => (
                    <tr key={batch.batch_id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-semibold text-gray-900">{batch.batch_number}</p>
                          <p className="text-sm text-gray-500">{batch.breed}</p>
                          <p className="text-xs text-gray-400">Day {batch.current_age_days}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-semibold text-gray-900">{batch.current_bird_count}</p>
                          <p className="text-xs text-red-500">-{batch.mortality_count} lost</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-semibold text-gray-900">{batch.estimated_weight.toFixed(0)} kg</p>
                          <p className="text-xs text-gray-500">{batch.growth_rate.toFixed(1)} g/day</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className={`font-semibold ${getFCRColor(batch.fcr, 1.8)}`}>
                            {batch.fcr.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">Target: 1.8</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className={`font-semibold ${getSurvivalColor(batch.survival_rate)}`}>
                            {batch.survival_rate.toFixed(1)}%
                          </p>
                          <Progress value={batch.survival_rate} className="w-16 h-2 mt-1" />
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${getPerformanceColor(batch.performance_score)}`}>
                            {batch.performance_score.toFixed(0)}
                          </span>
                          <div className="w-12 h-12 rounded-full border-4 border-gray-200 relative">
                            <div 
                              className={`absolute inset-0 rounded-full border-4 ${getPerformanceColor(batch.performance_score).replace('text', 'border')}`}
                              style={{
                                clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((batch.performance_score - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((batch.performance_score - 90) * Math.PI / 180)}%)`
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {(() => {
                          const syncStatus = filteredPerformanceData.inventory_sync_status.find(
                            s => s.batch_id === batch.batch_id
                          );
                          if (!syncStatus) return <span className="text-sm text-gray-400">No data</span>;
                          
                          return (
                            <div>
                              <Badge className={
                                syncStatus.sync_status === 'GOOD' ? 'bg-green-100 text-green-800' :
                                syncStatus.sync_status === 'POOR' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {syncStatus.sync_percentage.toFixed(0)}%
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">
                                {syncStatus.discrepancy.toFixed(0)} kg diff
                              </p>
                            </div>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Environmental Alerts */}
          {filteredPerformanceData.environmental_alerts.length > 0 && (
            <Card className="p-6 bg-white border-2 border-red-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Environmental Alerts
              </h2>
              
              <div className="space-y-4">
                {filteredPerformanceData.environmental_alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-l-4 ${getAlertColor(alert.severity)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{alert.message}</p>
                        <p className="text-sm text-gray-600 mt-1">Batch: {alert.batch_number}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          <strong>Recommended Action:</strong> {alert.recommended_action}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {alert.affected_systems.map(system => (
                            <Badge key={system} variant="outline" className="text-xs">
                              {system}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Badge className={getAlertColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* FCR Analysis View */}
      {selectedView === 'fcr' && filteredPerformanceData && (
        <div className="space-y-6">
          <Card className="p-6 bg-white border-2 border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">FCR Analysis & Inventory Synchronization</h2>
            
            <div className="space-y-6">
              {filteredPerformanceData.fcr_analysis.batch_fcr_data.map((batch) => (
                <div key={batch.batch_id} className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{batch.batch_number}</h3>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Current FCR</p>
                        <p className={`text-lg font-bold ${getFCRColor(batch.current_fcr, batch.target_fcr)}`}>
                          {batch.current_fcr.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Target FCR</p>
                        <p className="text-lg font-bold text-gray-900">{batch.target_fcr.toFixed(2)}</p>
                      </div>
                      <Badge className={
                        batch.fcr_performance === 'EXCELLENT' ? 'bg-green-100 text-green-800' :
                        batch.fcr_performance === 'GOOD' ? 'bg-blue-100 text-blue-800' :
                        batch.fcr_performance === 'FAIR' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {batch.fcr_performance}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Inventory Sync Status */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Inventory Synchronization</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          Feed Consumed: {batch.inventory_sync.actual_consumption.toFixed(1)} kg
                        </p>
                        <p className="text-sm text-gray-600">
                          Inventory Depleted: {batch.inventory_sync.inventory_depletion.toFixed(1)} kg
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={
                          batch.inventory_sync.status === 'GOOD' ? 'bg-green-100 text-green-800' :
                          batch.inventory_sync.status === 'POOR' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {batch.inventory_sync.sync_percentage.toFixed(0)}% Sync
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {batch.inventory_sync.discrepancy > 0 ? '+' : ''}{batch.inventory_sync.discrepancy.toFixed(1)} kg
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* FCR Trend */}
                  {showDetails && batch.fcr_trend.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">FCR Trend</h4>
                      <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                        <p className="text-sm text-gray-500">FCR trend chart would be displayed here</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Survival Metrics View */}
      {selectedView === 'survival' && filteredPerformanceData && (
        <div className="space-y-6">
          <Card className="p-6 bg-white border-2 border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Survival Metrics & Loss Analysis</h2>
            
            <div className="space-y-6">
              {filteredPerformanceData.survival_analysis.batch_survival_data.map((batch) => (
                <div key={batch.batch_id} className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{batch.batch_number}</h3>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Current Survival</p>
                        <p className={`text-lg font-bold ${getSurvivalColor(batch.survival_rate)}`}>
                          {batch.survival_rate.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Projected Final</p>
                        <p className="text-lg font-bold text-gray-900">
                          {batch.survival_projection.projected_final_survival.toFixed(1)}%
                        </p>
                      </div>
                      <Badge className={
                        batch.survival_rate >= 95 ? 'bg-green-100 text-green-800' :
                        batch.survival_rate >= 90 ? 'bg-blue-100 text-blue-800' :
                        batch.survival_rate >= 85 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {batch.survival_rate >= 95 ? 'EXCELLENT' :
                         batch.survival_rate >= 90 ? 'GOOD' :
                         batch.survival_rate >= 85 ? 'FAIR' : 'POOR'}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Mortality Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-red-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-red-700 mb-2">Mortality Details</h4>
                      <p className="text-sm text-gray-600">
                        Initial: {batch.initial_quantity} birds
                      </p>
                      <p className="text-sm text-gray-600">
                        Current: {batch.current_quantity} birds
                      </p>
                      <p className="text-sm text-gray-600">
                        Lost: {batch.total_mortality} birds
                      </p>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-blue-700 mb-2">Loss Analysis</h4>
                      <p className="text-sm text-gray-600">
                        Pattern: {batch.loss_analysis.pattern}
                      </p>
                      <p className="text-sm text-gray-600">
                        Trend: {batch.loss_analysis.trend}
                      </p>
                      <p className="text-sm text-gray-600">
                        Recent: {batch.loss_analysis.recent_mortality} deaths
                      </p>
                    </div>
                  </div>
                  
                  {/* Mortality Causes */}
                  {showDetails && Object.keys(batch.mortality_causes).length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Mortality Causes</h4>
                      <div className="space-y-2">
                        {Object.entries(batch.mortality_causes).map(([cause, count]) => (
                          <div key={cause} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-700">{cause}</span>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Alerts View */}
      {selectedView === 'alerts' && filteredPerformanceData && (
        <div className="space-y-6">
          <Card className="p-6 bg-white border-2 border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Environmental & Performance Alerts</h2>
            
            {filteredPerformanceData.environmental_alerts.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-500">No active alerts</p>
                <p className="text-sm text-gray-400 mt-1">All systems operating normally</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPerformanceData.environmental_alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-l-4 ${getAlertColor(alert.severity)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {alert.severity === 'HIGH' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                          {alert.severity === 'MEDIUM' && <AlertCircle className="w-5 h-5 text-orange-600" />}
                          {alert.severity === 'LOW' && <AlertCircle className="w-5 h-5 text-yellow-600" />}
                          <p className="font-semibold text-gray-900">{alert.message}</p>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Batch: {alert.batch_number}</p>
                        <p className="text-sm text-gray-700 mb-3">
                          <strong>Recommended Action:</strong> {alert.recommended_action}
                        </p>
                        <div className="flex gap-2">
                          {alert.affected_systems.map(system => (
                            <Badge key={system} variant="outline" className="text-xs">
                              {system}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Badge className={getAlertColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default PerformanceHub;
