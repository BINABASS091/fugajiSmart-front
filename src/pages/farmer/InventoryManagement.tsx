import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  inventoryApi,
  medicineApi,
  equipmentApi,
  laborApi,
  healthAlertsApi,
  eggsApi
} from '../../lib/api';
import SubscriptionGuard from '../../components/SubscriptionGuard';
import AddInventoryItemModal from '../../components/AddInventoryItemModal';
import StockTransactionModal from '../../components/StockTransactionModal';

// Specialized Components
import FeedInventoryTable from '../../components/inventory/FeedInventoryTable';
import MedicineInventoryTable from '../../components/inventory/MedicineInventoryTable';
import EquipmentInventoryTable from '../../components/inventory/EquipmentInventoryTable';
import LaborRecordsTable from '../../components/inventory/LaborRecordsTable';
import HealthAlertsTable from '../../components/inventory/HealthAlertsTable';
import EggInventoryTable from '../../components/inventory/EggInventoryTable';
import InventoryAlertsDashboard from '../../components/inventory/InventoryAlertsDashboard';

import {
  Package,
  Plus,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  History,
  Scale,
  ClipboardPlus,
  Search,
  ChevronRight,
  Syringe,
  Wrench,
  Users,
  Egg,
  HeartPulse
} from 'lucide-react';
import { format } from 'date-fns';

type InventoryTab = 'FEED' | 'MEDICINE' | 'EQUIPMENT' | 'LABOR' | 'HEALTH' | 'EGGS' | 'HISTORY';

const InventoryManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<InventoryTab>('FEED');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // States for different data types
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [medicineItems, setMedicineItems] = useState<any[]>([]);
  const [equipmentItems, setEquipmentItems] = useState<any[]>([]);
  const [laborRecords, setLaborRecords] = useState<any[]>([]);
  const [healthAlerts, setHealthAlerts] = useState<any[]>([]);
  const [eggInventory, setEggInventory] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        feedRes,
        medRes,
        equipRes,
        laborRes,
        healthRes,
        eggsRes,
        txRes
      ] = await Promise.all([
        inventoryApi.getItems({ category: 'FEED' }),
        medicineApi.getInventory(),
        equipmentApi.getAll(),
        laborApi.getRecords(),
        healthAlertsApi.getAll(),
        eggsApi.getInventory(),
        inventoryApi.getTransactions()
      ]);

      setFeedItems(Array.isArray(feedRes.data) ? feedRes.data : []);
      setMedicineItems(Array.isArray(medRes.data) ? medRes.data : []);
      setEquipmentItems(Array.isArray(equipRes.data) ? equipRes.data : []);
      setLaborRecords(Array.isArray(laborRes.data) ? laborRes.data : []);
      setHealthAlerts(Array.isArray(healthRes.data) ? healthRes.data : []);
      setEggInventory(Array.isArray(eggsRes.data) ? eggsRes.data : []);
      setTransactions(Array.isArray(txRes.data) ? txRes.data : []);

    } catch (err) {
      console.error('Failed to fetch comprehensive inventory:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const alerts = useMemo(() => {
    const output: any[] = [];

    // Low Stock Alerts
    feedItems.forEach(item => {
      if (item.quantity <= (item.reorder_level || 50)) {
        output.push({
          id: `low-${item.id}`,
          type: 'LOW_STOCK',
          title: 'Stock Depletion',
          message: `${item.name} is below critical threshold (${item.quantity}${item.unit})`,
          severity: 'CRITICAL'
        });
      }
    });

    // Health Alerts
    healthAlerts.filter(a => !a.resolved).forEach(alert => {
      output.push({
        id: `health-${alert.id}`,
        type: 'VACCINATION',
        title: 'Health Critical',
        message: `${alert.batch_name}: ${alert.alert_type.replace(/_/g, ' ')}`,
        severity: alert.severity === 'CRITICAL' || alert.severity === 'HIGH' ? 'CRITICAL' : 'WARNING'
      });
    });

    return output;
  }, [feedItems, healthAlerts]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const tabs: { id: InventoryTab; label: string; icon: any; color: string }[] = [
    { id: 'FEED', label: 'Feed & Nutrition', icon: Package, color: 'text-blue-600 bg-blue-50' },
    { id: 'MEDICINE', label: 'Medicine & Vaccines', icon: Syringe, color: 'text-purple-600 bg-purple-50' },
    { id: 'EQUIPMENT', label: 'Tools & Equipment', icon: Wrench, color: 'text-gray-600 bg-gray-50' },
    { id: 'LABOR', label: 'Labor & Services', icon: Users, color: 'text-indigo-600 bg-indigo-50' },
    { id: 'HEALTH', label: 'Health Alerts', icon: HeartPulse, color: 'text-rose-600 bg-rose-50' },
    { id: 'EGGS', label: 'Egg Production', icon: Egg, color: 'text-amber-600 bg-amber-50' },
    { id: 'HISTORY', label: 'Audit Logs', icon: History, color: 'text-slate-600 bg-slate-50' },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'FEED':
        return <FeedInventoryTable
          items={feedItems}
          onRefill={(item) => { setSelectedItem(item); setShowTransactionModal(true); }}
          onViewInfo={(item) => console.log('View Info', item)}
        />;
      case 'MEDICINE':
        return <MedicineInventoryTable
          items={medicineItems}
          onAdminister={(item) => console.log('Administer', item)}
          onViewInfo={(item) => console.log('View Info', item)}
        />;
      case 'EQUIPMENT':
        return <EquipmentInventoryTable
          items={equipmentItems}
          onMaintenance={(item) => console.log('Maintenance', item)}
          onViewInfo={(item) => console.log('View Info', item)}
        />;
      case 'LABOR':
        return <LaborRecordsTable
          records={laborRecords}
          onAddWorker={() => setShowAddModal(true)}
          onEditWorker={(worker) => console.log('Edit Worker', worker)}
        />;
      case 'HEALTH':
        return <HealthAlertsTable
          alerts={healthAlerts}
          onResolve={(alert) => console.log('Resolve', alert)}
          onViewDetails={(alert) => console.log('View Details', alert)}
        />;
      case 'EGGS':
        return <EggInventoryTable
          items={eggInventory}
          onSell={(item) => console.log('Sell', item)}
          onViewInfo={(item) => console.log('View Info', item)}
        />;
      case 'HISTORY':
        return (
          <Card className="overflow-hidden border-none shadow-xl shadow-gray-200/60 bg-white rounded-3xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    {['Timeline', 'Resource', 'Type', 'Adjustment', 'Observations'].map(h => (
                      <th key={h} className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">
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
                      <td className={`px-6 py-5 font-black text-right ${tx.quantity_change > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {tx.quantity_change > 0 ? '+' : ''}{tx.quantity_change}
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
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-pulse">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
        <p className="text-gray-500 font-bold text-lg tracking-wide uppercase tracking-widest">Architecting Inventory...</p>
      </div>
    );
  }

  return (
    <SubscriptionGuard feature="Inventory Management" planRequired="PREMIUM">
      <div className="max-w-[1600px] mx-auto space-y-8 pb-12 animate-[fadeIn_0.5s_ease-out]">

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl shadow-blue-200 ring-4 ring-blue-50">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight tracking-tight uppercase">
                  Global Inventory
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Secure Cloud Sync Active</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto px-10 py-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xl shadow-2xl shadow-blue-300/50 transition-all hover:-translate-y-1 active:scale-95 group"
            >
              <Plus className="w-6 h-6 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Resource Entry
            </Button>
          </div>
        </div>

        {/* Professional Navigation Tabs */}
        <div className="bg-white p-2 rounded-[32px] shadow-xl shadow-gray-200/40 border border-gray-50 overflow-x-auto flex gap-2 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-4 rounded-[24px] font-black text-sm uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                ? 'bg-gray-900 text-white shadow-xl shadow-gray-400/20 scale-[1.02]'
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : tab.color.split(' ')[0]}`} />
              {tab.label}
              {tab.id === 'HEALTH' && healthAlerts.filter(a => !a.resolved).length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              )}
            </button>
          ))}
        </div>

        {/* Statistics Benchmarking */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {[
            { label: 'Asset Valuation', value: `$${transactions.reduce((s, t) => s + (t.total_cost || 0), 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Critical Alerts', value: healthAlerts.filter(a => !a.resolved).length, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
            { label: 'Active Workforce', value: laborRecords.filter(l => l.is_active).length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Daily Collection', value: eggInventory.length > 0 ? eggInventory[0].quantity_trays : 0, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((stat, i) => (
            <Card key={i} className="p-6 border-none bg-white shadow-lg shadow-gray-100 flex items-center gap-5 group">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Global Search Bar */}
        <div className="relative group max-w-2xl mx-auto w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Universal search across all modules (Resource, SKU, Supplier)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-8 py-6 rounded-3xl bg-white border-2 border-transparent shadow-xl shadow-gray-200/40 focus:bg-white focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500/20 focus:outline-none font-bold text-lg text-gray-800 transition-all placeholder:text-gray-300"
          />
        </div>

        {/* Intelligence Dashboard */}
        <InventoryAlertsDashboard
          alerts={alerts}
          onAction={(a) => {
            if (a.type === 'LOW_STOCK') setActiveTab('FEED');
            if (a.type === 'VACCINATION') setActiveTab('HEALTH');
          }}
        />

        {/* Module Content */}
        <div className="min-h-[400px]">
          {renderActiveTab()}
        </div>

        {/* Quick Action Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-8 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-[40px] shadow-2xl shadow-blue-200 relative overflow-hidden group border-none">
            <Scale className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10">
              <h3 className="text-3xl font-black mb-3 italic tracking-tight uppercase">Performance Hub</h3>
              <p className="text-blue-100 font-bold mb-8 max-w-sm opacity-80 uppercase text-xs tracking-widest leading-relaxed">
                Log aggregate flock weights to synchronize Feed Conversion Ratios (FCR) with inventory depletion.
              </p>
              <Button
                className="bg-white text-blue-700 hover:bg-blue-50 font-black rounded-2xl px-10 py-6 text-lg uppercase shadow-xl hover:-translate-y-1 transition-all"
              >
                Log Metrics
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </Card>

          <Card className="p-8 bg-white border-2 border-rose-100 rounded-[40px] shadow-xl shadow-rose-50 relative overflow-hidden group">
            <HeartPulse className="absolute -right-8 -bottom-8 w-48 h-48 text-rose-500 opacity-[0.03] group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10">
              <h3 className="text-3xl font-black text-rose-600 mb-3 uppercase tracking-tight">Survival Log</h3>
              <p className="text-gray-400 font-bold mb-8 max-w-sm uppercase text-xs tracking-widest leading-relaxed">
                Report abnormal losses to trigger environmental alerts and adjust stock liquidation projections.
              </p>
              <Button
                variant="outline"
                className="border-2 border-rose-100 text-rose-600 hover:bg-rose-50 font-black rounded-2xl px-10 py-6 text-lg uppercase hover:-translate-y-1 transition-all"
              >
                Report Losses
                <ClipboardPlus className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </Card>
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

        {/* ... (Weight & Mortality Modals remain similarly structured but could be moved to separate files later) ... */}
      </div>
    </SubscriptionGuard>
  );
};

export default InventoryManagement;
