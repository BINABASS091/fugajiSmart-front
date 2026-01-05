import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress-component';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useAuth } from '../../contexts/AuthContext';
import { inventoryApi, batchesApi } from '../../lib/api';
import { format } from 'date-fns';

import {
  Package,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  BarChart3,
  Target,
  Clock,
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
  AlertCircle
} from 'lucide-react';

interface InventoryItem {
  id: string;
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
  
  // Computed fields
  days_to_expiry?: number;
  is_near_expiry?: boolean;
  is_expired?: boolean;
  shelf_life_remaining_percentage?: number;
  should_reorder?: boolean;
  calculated_order_quantity?: number;
  inventory_status?: string;
  total_cost?: number;
  market_value?: number;
  quality_impact_factor?: number;
}

interface Batch {
  id: string;
  batch_number: string;
  breed: string;
  quantity: number;
  status: string;
  current_age_days: number;
  start_date: string;
}

interface InventoryAnalytics {
  summary: {
    total_items: number;
    total_investment: number;
    total_market_value: number;
    potential_profit: number;
  };
  category_metrics: Record<string, any>;
  feed_stage_analysis: Record<string, any>;
  quality_analysis: Record<string, any>;
  recommendations: Array<{
    type: string;
    priority: string;
    message: string;
    items: any[];
  }>;
  service_level_analysis: Record<string, any>;
}

const ProfessionalInventoryManagement: React.FC = () => {
  const { formatCurrency } = useCurrency();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [analytics, setAnalytics] = useState<InventoryAnalytics | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load data
  useEffect(() => {
    loadData();
  }, [selectedBatch]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load inventory items
      const inventoryResponse = await inventoryApi.getItems();
      setInventoryItems(inventoryResponse.data || []);

      // Load batches
      const batchesResponse = await batchesApi.getAll();
      setBatches(batchesResponse.data || []);

      // Load analytics
      loadAnalytics();
    } catch (error) {
      console.error('Error loading inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/v1/inventory/analytics/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });
      const analyticsData = await response.json();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  // Filter inventory items
  const filteredItems = useMemo(() => {
    return inventoryItems.filter(item => {
      const matchesBatch = selectedBatch === 'all' || item.batch === selectedBatch;
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || item.inventory_status === selectedStatus;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (item.supplier && item.supplier.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesBatch && matchesCategory && matchesStatus && matchesSearch;
    });
  }, [inventoryItems, selectedBatch, selectedCategory, selectedStatus, searchQuery]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalItems = filteredItems.length;
    const totalCost = filteredItems.reduce((sum, item) => sum + (item.total_cost || 0), 0);
    const totalMarketValue = filteredItems.reduce((sum, item) => sum + (item.market_value || 0), 0);
    const needsReorder = filteredItems.filter(item => item.should_reorder).length;
    const expiredItems = filteredItems.filter(item => item.is_expired).length;
    const nearExpiry = filteredItems.filter(item => item.is_near_expiry).length;

    return {
      totalItems,
      totalCost,
      totalMarketValue,
      needsReorder,
      expiredItems,
      nearExpiry,
      potentialProfit: totalMarketValue - totalCost
    };
  }, [filteredItems]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXPIRED': return 'bg-red-100 text-red-800 border-red-200';
      case 'NEAR_EXPIRY': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'REORDER_REQUIRED': return 'bg-red-100 text-red-800 border-red-200';
      case 'LOW_STOCK': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ADEQUATE': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get quality grade color
  const getQualityColor = (grade: string) => {
    switch (grade) {
      case 'PREMIUM': return 'bg-purple-100 text-purple-800';
      case 'STANDARD': return 'bg-blue-100 text-blue-800';
      case 'ECONOMY': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Professional Inventory Management</h1>
          <p className="text-gray-500 mt-1">Advanced inventory tracking with batch-specific analytics</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </Button>
          <Button onClick={loadData} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {showAnalytics && analytics && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Inventory Analytics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-8 h-8 text-blue-600" />
                <span className="text-sm text-gray-500">Total Items</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{analytics.summary.total_items}</p>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-green-100">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-green-600" />
                <span className="text-sm text-gray-500">Total Investment</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.summary.total_investment)}</p>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-purple-100">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <span className="text-sm text-gray-500">Market Value</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.summary.total_market_value)}</p>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-emerald-100">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-emerald-600" />
                <span className="text-sm text-gray-500">Potential Profit</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.summary.potential_profit)}</p>
            </div>
          </div>

          {/* Recommendations */}
          {analytics.recommendations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
              {analytics.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-l-4 ${
                    rec.priority === 'HIGH' ? 'bg-red-50 border-red-400' :
                    rec.priority === 'MEDIUM' ? 'bg-orange-50 border-orange-400' :
                    'bg-blue-50 border-blue-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{rec.message}</p>
                      <p className="text-sm text-gray-600 mt-1">Priority: {rec.priority}</p>
                    </div>
                    <Badge variant={rec.priority === 'HIGH' ? 'destructive' : 'secondary'}>
                      {rec.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-white border-2 border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <Package className="w-8 h-8 text-blue-600" />
            <span className="text-sm text-gray-500">Total Items</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{summaryStats.totalItems}</p>
          <p className="text-sm text-gray-600 mt-2">Across all categories</p>
        </Card>

        <Card className="p-6 bg-white border-2 border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-green-600" />
            <span className="text-sm text-gray-500">Total Value</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(summaryStats.totalCost)}</p>
          <p className="text-sm text-gray-600 mt-2">Current inventory value</p>
        </Card>

        <Card className="p-6 bg-white border-2 border-orange-100">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
            <span className="text-sm text-gray-500">Needs Attention</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{summaryStats.needsReorder}</p>
          <p className="text-sm text-gray-600 mt-2">Items to reorder</p>
        </Card>

        <Card className="p-6 bg-white border-2 border-red-100">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-red-600" />
            <span className="text-sm text-gray-500">Expiry Issues</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{summaryStats.expiredItems + summaryStats.nearExpiry}</p>
          <p className="text-sm text-gray-600 mt-2">Expired + Near expiry</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 bg-white border-2 border-gray-100">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <Select value={selectedBatch} onValueChange={setSelectedBatch}>
            <SelectTrigger className="w-48">
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

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="FEED">Feed</SelectItem>
              <SelectItem value="MEDICINE">Medicine</SelectItem>
              <SelectItem value="EQUIPMENT">Equipment</SelectItem>
              <SelectItem value="LIVE_BIRDS">Live Birds</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ADEQUATE">Adequate</SelectItem>
              <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
              <SelectItem value="REORDER_REQUIRED">Reorder Required</SelectItem>
              <SelectItem value="NEAR_EXPIRY">Near Expiry</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
            </SelectContent>
          </Select>

          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </Card>

      {/* Inventory Items Table */}
      <Card className="p-6 bg-white border-2 border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Inventory Items</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Item Details</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Batch</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Quantity</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Value</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Quality</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Storage</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.category}</p>
                      {item.supplier && (
                        <p className="text-xs text-gray-400">Supplier: {item.supplier}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {item.batch_number || (
                      <span className="text-sm text-gray-400">No batch</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.quantity} {item.unit}
                      </p>
                      {item.reorder_point && (
                        <p className="text-xs text-gray-500">
                          Reorder at: {item.reorder_point} {item.unit}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(item.total_cost || 0)}
                      </p>
                      {item.market_value && item.market_value !== (item.total_cost || 0) && (
                        <p className="text-xs text-green-600">
                          Market: {formatCurrency(item.market_value)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge className={getStatusColor(item.inventory_status || 'ADEQUATE')}>
                      {item.inventory_status?.replace('_', ' ') || 'ADEQUATE'}
                    </Badge>
                    {item.days_to_expiry !== undefined && (
                      <p className="text-xs text-gray-500 mt-1">
                        {item.days_to_expiry < 0 ? 'Expired' :
                         item.days_to_expiry <= 30 ? `${item.days_to_expiry} days left` :
                         'Good'}
                      </p>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <Badge className={getQualityColor(item.quality_grade)}>
                      {item.quality_grade}
                    </Badge>
                    {item.quality_impact_factor && item.quality_impact_factor !== 1 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Factor: {item.quality_impact_factor}x
                      </p>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-600">
                      {item.storage_temperature_min && item.storage_temperature_max && (
                        <p className="flex items-center gap-1">
                          <Thermometer className="w-3 h-3" />
                          {item.storage_temperature_min}°-{item.storage_temperature_max}°C
                        </p>
                      )}
                      {item.humidity_requirement && (
                        <p className="flex items-center gap-1">
                          <Droplets className="w-3 h-3" />
                          {item.humidity_requirement}% RH
                        </p>
                      )}
                      {item.ventilation_required && (
                        <p className="flex items-center gap-1">
                          <Wind className="w-3 h-3" />
                          Ventilation Required
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No inventory items found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProfessionalInventoryManagement;
