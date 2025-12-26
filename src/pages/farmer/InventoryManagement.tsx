import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { inventoryApi } from '../../lib/api';
import { useLanguage } from '../../contexts/LanguageContext';
import SubscriptionGuard from '../../components/SubscriptionGuard';
import AddInventoryItemModal from '../../components/AddInventoryItemModal';
import StockTransactionModal from '../../components/StockTransactionModal';
import {
  Package,
  Plus,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  History,
  Scale,
  ClipboardPlus,
  Calendar as CalendarIcon,
  Search,
  Minus,
  RefreshCcw,
  ExternalLink,
  ChevronRight,
  Info,
  X
} from 'lucide-react';
import { format } from 'date-fns';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  subcategory?: string | null;
  quantity: number;
  unit: string;
  cost_per_unit: number;
  reorder_level: number;
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
  farmer?: string;
  farm?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface InventoryTransaction {
  id: string;
  item: string;
  item_name: string;
  batch?: string | null;
  batch_id?: string | null;
  batch_number?: string | null;
  transaction_type: 'PURCHASE' | 'USAGE' | 'ADJUSTMENT' | 'RETURN' | 'WASTE';
  quantity_change: number;
  unit_cost?: number | null;
  total_cost?: number | null;
  transaction_date: string;
  notes?: string | null;
  created_at?: string;
}

const InventoryManagement: React.FC = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [view, setView] = useState<'items' | 'history'>('items');
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'LIVE_BIRDS' | 'FEED' | 'MEDICINE' | 'SUPPLEMENTS' | 'EGGS' | 'EQUIPMENT' | 'SANITATION' | 'UTILITIES' | 'STORAGE' | 'TRANSPORT' | 'LABOR' | 'SALES' | 'EMERGENCY' | 'WATER' | 'HATCHERY' | 'WASTE' | 'MACHINERY' | 'OFFICE' | 'FINANCIAL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showMortalityModal, setShowMortalityModal] = useState(false);
  const [weightForm, setWeightForm] = useState({
    total_weight: '',
    birds_weighed: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [mortalityForm, setMortalityForm] = useState({
    amount: '',
    reason: '',
    details: '',
    date: new Date().toISOString().split('T')[0],
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, transactionsRes] = await Promise.all([
        inventoryApi.getItems(),
        inventoryApi.getTransactions()
      ]);
      if (itemsRes.error) throw new Error(itemsRes.error);
      if (transactionsRes.error) throw new Error(transactionsRes.error);
      setItems(itemsRes.data || []);
      setTransactions(transactionsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getLowStockItems = () => {
    return items.filter(item => Number(item.quantity) <= Number(item.reorder_level));
  };

  const getTotalValue = () => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.cost_per_unit)), 0);
  };

  const filteredItems = useMemo(() => {
    let result = items;
    if (filterCategory !== 'ALL') {
      result = result.filter(item => item.category === filterCategory);
    }
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.name.toLowerCase().includes(lowerQuery) ||
        (item.supplier && item.supplier.toLowerCase().includes(lowerQuery))
      );
    }
    return result;
  }, [filterCategory, searchQuery, items]);

  const feedStats = useMemo(() => {
    const feedItems = items.filter(item => item.category === 'FEED');
    const totalQuantity = feedItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const totalConsumption = feedItems.reduce((sum, item) => sum + (Number(item.consumption_rate_per_day) || 0), 0);
    const daysRemaining = totalConsumption > 0 ? Math.max(0, totalQuantity / totalConsumption) : null;
    return { totalQuantity, daysRemaining };
  }, [items]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-pulse">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
        <p className="text-gray-500 font-bold text-lg tracking-wide">Syncing Storage...</p>
      </div>
    );
  }

  return (
    <SubscriptionGuard feature="Inventory Management" planRequired="BASIC">
      <div className="max-w-[1600px] mx-auto space-y-10 pb-12 animate-[fadeIn_0.5s_ease-out]">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl shadow-blue-200 ring-4 ring-blue-50">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
                  {t('inventory.title')}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <p className="text-gray-500 font-medium text-lg">System Synchronized</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2 p-1.5 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/60 shadow-inner w-full sm:w-auto">
              <button
                onClick={() => setView('items')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${view === 'items'
                  ? 'bg-white text-blue-600 shadow-lg shadow-blue-100/50 ring-1 ring-black/5 scale-[1.02]'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-white/30'
                  }`}
              >
                <Package className="w-5 h-5" />
                <span>Resources</span>
              </button>
              <button
                onClick={() => setView('history')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${view === 'history'
                  ? 'bg-white text-blue-600 shadow-lg shadow-blue-100/50 ring-1 ring-black/5 scale-[1.02]'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-white/30'
                  }`}
              >
                <History className="w-5 h-5" />
                <span>Logs</span>
              </button>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto px-8 py-7 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-2xl shadow-blue-300/50 transition-all hover:-translate-y-1 active:scale-95 group"
            >
              <Plus className="w-6 h-6 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              New Resource
            </Button>
          </div>
        </div>

        {/* Dynamic Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: 'Total Feed',
              value: `${feedStats.totalQuantity.toLocaleString()}`,
              subValue: 'Units available',
              icon: Package,
              color: 'from-blue-500 to-blue-700',
              bg: 'bg-blue-50',
              accent: 'text-blue-600',
              trend: feedStats.daysRemaining !== null ? `${Math.ceil(feedStats.daysRemaining)}d remaining` : 'Update rates'
            },
            {
              label: 'Daily Utilization',
              value: `${items.reduce((s, i) => s + (i.category === 'FEED' ? Number(i.consumption_rate_per_day || 0) : 0), 0)}`,
              subValue: 'Avg units/day',
              icon: TrendingUp,
              color: 'from-emerald-500 to-emerald-700',
              bg: 'bg-emerald-50',
              accent: 'text-emerald-600',
              trend: 'Optimal flow'
            },
            {
              label: 'Critical Stock',
              value: getLowStockItems().length,
              subValue: 'Items below limit',
              icon: AlertTriangle,
              color: 'from-amber-400 to-orange-600',
              bg: 'bg-amber-50',
              accent: 'text-amber-600',
              trend: getLowStockItems().length > 0 ? 'Action required' : 'Stocks healthy'
            },
            {
              label: 'Assets Value',
              value: `$${getTotalValue().toLocaleString()}`,
              subValue: 'Liquidity value',
              icon: DollarSign,
              color: 'from-indigo-500 to-purple-700',
              bg: 'bg-indigo-50',
              accent: 'text-indigo-600',
              trend: 'Total investment'
            }
          ].map((stat, idx) => (
            <Card key={idx} className="relative group overflow-hidden border-none bg-white p-6 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:shadow-gray-300/50 transition-all duration-500">
              <div className={`absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 bg-gradient-to-br ${stat.color} opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-150 transition-all duration-700 rounded-full`}></div>
              <div className="flex items-start justify-between relative z-10">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.accent} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <div className="text-right">
                  <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded-full ${stat.bg} ${stat.accent}`}>
                    {stat.trend}
                  </span>
                </div>
              </div>
              <div className="mt-6 relative z-10">
                <h3 className="text-3xl font-black text-gray-900">{stat.value}</h3>
                <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-tight">{stat.label}</p>
                <p className="text-xs font-medium text-gray-400 mt-1">{stat.subValue}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Active Insights & Quick Shortcuts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by resource name or supplier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none font-bold text-gray-800 transition-all"
                />
              </div>
              <div className="flex p-1 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto">
                {['ALL', 'FEED', 'VACCINE', 'MEDICINE', 'EQUIPMENT'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat as any)}
                    className={`px-5 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 whitespace-nowrap ${filterCategory === cat
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                  >
                    {cat === 'ALL' ? 'Everything' : cat}
                  </button>
                ))}
              </div>
            </div>

            {view === 'items' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredItems.length === 0 ? (
                  <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                      <Search className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900">No results found</h3>
                    <p className="text-gray-500 max-w-sm mt-3 font-medium">Try adjusting your search query or filters to find what you're looking for.</p>
                    <Button
                      variant="outline"
                      onClick={() => { setSearchQuery(''); setFilterCategory('ALL'); }}
                      className="mt-8 rounded-xl font-bold border-gray-200"
                    >
                      Clear all filters
                    </Button>
                  </div>
                ) : (
                  filteredItems.map((item) => {
                    const stockPercentage = Math.min(100, (Number(item.quantity) / (Number(item.reorder_level) * 3)) * 100);
                    const isLow = Number(item.quantity) <= Number(item.reorder_level);
                    const statusColor = isLow ? 'bg-rose-500' : stockPercentage < 40 ? 'bg-amber-500' : 'bg-emerald-500';

                    return (
                      <Card key={item.id} className="group relative overflow-hidden bg-white hover:bg-gray-50/50 border-none shadow-lg shadow-gray-200/60 transition-all duration-300 cursor-default">
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-6">
                            <div className="space-y-1">
                              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-white transition-colors`}>
                                {item.category}
                              </span>
                              <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                                {item.name}
                              </h3>
                            </div>
                            {isLow && (
                              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl animate-bounce">
                                <AlertTriangle className="w-5 h-5" />
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-gray-50 rounded-2xl p-4 group-hover:bg-white transition-colors">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Stock Level</p>
                              <p className="text-2xl font-black text-gray-900">
                                {item.quantity} <span className="text-sm text-gray-400 font-bold">{item.unit}</span>
                              </p>
                            </div>
                            <div className="bg-gray-100/30 rounded-2xl p-4 group-hover:bg-white transition-colors">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Unit Value</p>
                              <p className="text-2xl font-black text-gray-900">${item.cost_per_unit}</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
                              <span>Inventory Status</span>
                              <span className={isLow ? 'text-rose-600 animate-pulse' : 'text-emerald-600'}>
                                {isLow ? 'CRITICAL REFILL' : 'ADEQUATE'}
                              </span>
                            </div>
                            <div className="h-4 bg-gray-100 rounded-full overflow-hidden p-1 shadow-inner ring-1 ring-black/5">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${statusColor}`}
                                style={{ width: `${Math.max(5, stockPercentage)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100 flex gap-2">
                          <Button
                            className="flex-1 bg-white hover:bg-blue-600 hover:text-white text-gray-900 border border-gray-200 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-sm hover:shadow-blue-200 active:scale-95 py-6"
                            onClick={() => {
                              setSelectedItem(item);
                              setShowTransactionModal(true);
                            }}
                          >
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Refill/Usage
                          </Button>
                          <Button
                            variant="outline"
                            className="p-4 rounded-xl border-gray-200 hover:bg-white transition-all group/btn"
                          >
                            <Info className="w-5 h-5 text-gray-400 group-hover/btn:text-blue-500" />
                          </Button>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            ) : (
              <Card className="overflow-hidden border-none shadow-xl shadow-gray-200/60 bg-white rounded-3xl">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-100">
                        {['Timeline', 'Resource', 'Type', 'Adjustment', 'Observations'].map(h => (
                          <th key={h} className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest font-bold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {transactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900 uppercase">
                                {format(new Date(tx.transaction_date), 'MMM d, yyyy')}
                              </span>
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                {format(new Date(tx.transaction_date), 'HH:mm')}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5 font-black text-gray-900 group-hover:text-blue-600 transition-colors">{tx.item_name}</td>
                          <td className="px-6 py-5">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest border
                            ${tx.transaction_type === 'PURCHASE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                tx.transaction_type === 'USAGE' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                              {tx.transaction_type}
                            </span>
                          </td>
                          <td className={`px-6 py-5 font-black text-right ${Number(tx.quantity_change) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            <div className="flex items-center justify-end gap-1">
                              {Number(tx.quantity_change) > 0 ? <Plus className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                              {Math.abs(Number(tx.quantity_change))}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-sm font-medium text-gray-500 max-w-xs truncate">{tx.notes || '—'}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="p-8 bg-gradient-to-br from-white to-gray-50 border-none shadow-xl shadow-gray-200/50 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500 opacity-[0.03] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-amber-50 rounded-2xl ring-4 ring-amber-50/50">
                  <Scale className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">GROWTH HUB</h3>
                  <p className="text-sm font-bold text-gray-400">Scale your performance</p>
                </div>
              </div>

              <div className="space-y-4 mb-8 px-1">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-black">1</span>
                  </div>
                  <p className="text-sm font-bold text-gray-600">Sample 10 random birds from your flock.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-black">2</span>
                  </div>
                  <p className="text-sm font-bold text-gray-600">Enter aggregate weight for auto-averaging.</p>
                </div>
              </div>

              <Button
                onClick={() => setShowWeightModal(true)}
                className="w-full py-7 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-amber-200 transition-all hover:scale-[1.02]"
              >
                Log Metrics
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-white to-gray-50 border-none shadow-xl shadow-gray-200/50 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500 opacity-[0.03] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="flex items-center gap-4 mb-6 text-rose-600">
                <div className="p-4 bg-rose-50 rounded-2xl ring-4 ring-rose-50/50">
                  <ClipboardPlus className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight tracking-tight uppercase">Loss Registry</h3>
                  <p className="text-sm font-bold text-gray-400">Track flock survival</p>
                </div>
              </div>

              <p className="text-sm font-bold text-gray-500 mb-8 leading-relaxed">
                Critical for accurate survival rate analytics and feed optimization across batch cycles.
              </p>

              <Button
                onClick={() => setShowMortalityModal(true)}
                variant="outline"
                className="w-full py-7 border-2 border-rose-100 hover:bg-rose-50 text-rose-600 rounded-2xl font-black text-lg transition-all hover:scale-[1.02]"
              >
                Report Losses
                <ExternalLink className="w-5 h-5 ml-2" />
              </Button>
            </Card>

            <Card className="p-6 bg-blue-600 rounded-3xl shadow-xl shadow-blue-200 relative overflow-hidden group border-none">
              <div className="absolute inset-0 bg-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 flex items-center gap-4 text-white">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Info className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest opacity-80">Pro Tip</p>
                  <p className="text-sm font-bold leading-snug">Keep reorder levels updated to avoid emergency shutdowns.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Modals */}
        <AddInventoryItemModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={fetchData}
        />

        <StockTransactionModal
          isOpen={showTransactionModal}
          onClose={() => {
            setShowTransactionModal(false);
            setSelectedItem(null);
          }}
          onSave={fetchData}
          item={selectedItem}
        />

        {/* Weight Tracking Modal */}
        {showWeightModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 min-h-screen">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-10 rounded-[40px] shadow-2xl animate-[scaleIn_0.3s_ease-out] border-none">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">GROWTH METRICS</h2>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Automatic Average Computation</p>
                </div>
                <button
                  onClick={() => setShowWeightModal(false)}
                  className="p-3 hover:bg-gray-100 rounded-2xl transition-all"
                >
                  <History className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Aggregate Weight (Kg)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={weightForm.total_weight}
                    onChange={(e) => setWeightForm({ ...weightForm, total_weight: e.target.value })}
                    placeholder="e.g., 15.20"
                    className="py-6 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white text-lg font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Poultry Count</label>
                  <Input
                    type="number"
                    min="1"
                    value={weightForm.birds_weighed}
                    onChange={(e) => setWeightForm({ ...weightForm, birds_weighed: e.target.value })}
                    placeholder="Birds in sample"
                    className="py-6 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white text-lg font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Logging Pulse</label>
                  <div className="relative">
                    <CalendarIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <Input
                      className="pl-12 py-6 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white text-lg font-bold"
                      type="date"
                      value={weightForm.date}
                      onChange={(e) => setWeightForm({ ...weightForm, date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Expert Observations</label>
                  <textarea
                    className="w-full p-4 border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none rounded-2xl resize-none font-bold text-gray-800 transition-all"
                    rows={4}
                    value={weightForm.notes}
                    onChange={(e) => setWeightForm({ ...weightForm, notes: e.target.value })}
                    placeholder="Any abnormalities or feed response notes..."
                  />
                </div>

                <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 text-[11px] font-bold text-blue-600 leading-relaxed uppercase tracking-wide">
                  Smart Tip: Regular sampling every 48h ensures accurate FCR (Feed Conversion Ratio) tracking.
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowWeightModal(false)}
                    className="flex-1 py-7 rounded-2xl font-black text-gray-400 border-gray-200"
                  >
                    Discard
                  </Button>
                  <Button
                    className="flex-[2] py-7 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 transition-all hover:-translate-y-1"
                    onClick={() => {
                      console.log('Weight entry saved (client-side):', weightForm);
                      setShowWeightModal(false);
                    }}
                  >
                    Commit Entry
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Mortality Modal */}
        {showMortalityModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 min-h-screen">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-10 rounded-[40px] shadow-2xl animate-[scaleIn_0.3s_ease-out] border-none">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black text-rose-600 tracking-tight tracking-tight uppercase">Loss Entry</h2>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Survival Analytics Update</p>
                </div>
                <button
                  onClick={() => setShowMortalityModal(false)}
                  className="p-3 hover:bg-rose-50 rounded-2xl transition-all"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Total losses</label>
                  <Input
                    type="number"
                    min="0"
                    value={mortalityForm.amount}
                    onChange={(e) => setMortalityForm({ ...mortalityForm, amount: e.target.value })}
                    placeholder="0"
                    className="py-6 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white text-lg font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Primary Reason</label>
                  <Input
                    value={mortalityForm.reason}
                    onChange={(e) => setMortalityForm({ ...mortalityForm, reason: e.target.value })}
                    placeholder="e.g., Heat stress, Predator"
                    className="py-6 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white text-lg font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Detection Date</label>
                  <div className="relative">
                    <CalendarIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <Input
                      className="pl-12 py-6 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white text-lg font-bold"
                      type="date"
                      value={mortalityForm.date}
                      onChange={(e) => setMortalityForm({ ...mortalityForm, date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Incident Detailed Log</label>
                  <textarea
                    className="w-full p-4 border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 focus:outline-none rounded-2xl resize-none font-bold text-gray-800 transition-all font-bold"
                    rows={4}
                    value={mortalityForm.details}
                    onChange={(e) => setMortalityForm({ ...mortalityForm, details: e.target.value })}
                    placeholder="Log symptoms or environment conditions..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowMortalityModal(false)}
                    className="flex-1 py-7 rounded-2xl font-black text-gray-400 border-gray-200"
                  >
                    Abort
                  </Button>
                  <Button
                    className="flex-[2] py-7 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-rose-200 transition-all hover:-translate-y-1"
                    onClick={() => {
                      console.log('Mortality entry committed:', mortalityForm);
                      setShowMortalityModal(false);
                    }}
                  >
                    Confirm Report
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </SubscriptionGuard>
  );
};

export default InventoryManagement;
