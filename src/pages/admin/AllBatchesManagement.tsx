import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertCircle,
  Calendar,
  Activity,
  TrendingUp,
  Bird,
  ShieldCheck,
  ChevronRight,
  Filter,
  Users,
  Layers,
  Zap,
  Clock,
  Briefcase,
  X
} from 'lucide-react';
import { batchesApi, farmsApi } from '../../lib/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { useConfirm } from '../../hooks/useConfirm';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

type Status = 'ACTIVE' | 'COMPLETED' | 'CLOSED';

interface FarmerUser {
  full_name: string;
}

interface Farmer {
  id: string;
  user: FarmerUser;
}

interface Farm {
  id: string;
  name: string;
  location: string;
  farmer: Farmer;
}

interface Batch {
  id: string;
  batch_number: string;
  breed?: string;
  quantity?: number;
  start_date?: string;
  expected_end_date?: string | null;
  status: Status;
  mortality_count?: number;
  current_age_days?: number;
  farm_id?: string;
  farm?: Farm;
  created_at?: string;
  updated_at?: string;
}

interface BatchFormData {
  batch_number: string;
  breed: string;
  quantity: string;
  start_date: string;
  expected_end_date: string;
  status: Status;
  mortality_count: string;
  current_age_days: string;
  farm_id: string;
}

export function AllBatchesManagement() {
  const { t } = useLanguage();
  const { confirm, ConfirmDialog } = useConfirm();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | Status>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<BatchFormData>({
    batch_number: '',
    breed: '',
    quantity: '',
    start_date: '',
    expected_end_date: '',
    status: 'ACTIVE',
    mortality_count: '0',
    current_age_days: '0',
    farm_id: '',
  });

  const fetchBatches = useCallback(async () => {
    try {
      const result = await batchesApi.getAll();
      if (result.error || !result.data) throw new Error(result.error || 'Failed to fetch batches');
      const items = Array.isArray(result.data) ? result.data : (result.data as any).results || [];
      const mapped: Batch[] = items.map((b: any) => ({
        id: b.id,
        batch_number: b.batch_number || b.name || '',
        breed: b.breed || '',
        quantity: typeof b.quantity === 'number' ? b.quantity : 0,
        start_date: b.start_date || '',
        expected_end_date: b.expected_end_date ?? null,
        status: (b.status as Status) || 'ACTIVE',
        mortality_count: typeof b.mortality_count === 'number' ? b.mortality_count : 0,
        current_age_days: typeof b.current_age_days === 'number' ? b.current_age_days : 0,
        farm_id: b.farm_id || b.farm?.id || '',
        farm: b.farm,
        created_at: b.created_at,
        updated_at: b.updated_at,
      }));
      setBatches(mapped);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch batches');
    }
  }, []);

  const fetchFarms = useCallback(async () => {
    try {
      const result = await farmsApi.getAll();
      if (result.data) {
        const items = Array.isArray(result.data) ? result.data : (result.data as any).results || [];
        setFarms(items);
      }
    } catch (e) {
      console.error('Error fetching farms:', e);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchBatches(), fetchFarms()]);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [fetchBatches, fetchFarms]);

  const resetForm = () => {
    setFormData({ batch_number: '', breed: '', quantity: '', start_date: '', expected_end_date: '', status: 'ACTIVE', mortality_count: '0', current_age_days: '0', farm_id: '' });
  };

  const openEditModal = (batch: Batch) => {
    setEditingBatch(batch);
    setFormData({
      batch_number: batch.batch_number ?? '',
      breed: batch.breed ?? '',
      quantity: String(batch.quantity ?? ''),
      start_date: batch.start_date ? batch.start_date.slice(0, 10) : '',
      expected_end_date: batch.expected_end_date ? String(batch.expected_end_date).slice(0, 10) : '',
      status: batch.status,
      mortality_count: String(batch.mortality_count ?? '0'),
      current_age_days: String(batch.current_age_days ?? '0'),
      farm_id: batch.farm_id ?? '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const payload = {
      batch_number: formData.batch_number.trim(),
      breed: formData.breed.trim(),
      quantity: Number(formData.quantity || 0),
      start_date: formData.start_date || null,
      expected_end_date: formData.expected_end_date || null,
      status: formData.status,
      mortality_count: Number(formData.mortality_count || 0),
      current_age_days: Number(formData.current_age_days || 0),
      farm_id: formData.farm_id,
    };
    try {
      const result = editingBatch ? await batchesApi.update(editingBatch.id, payload) : await batchesApi.create(payload);
      if (result.error) throw new Error(result.error);
      resetForm();
      await fetchBatches();
      setShowModal(false);
      setEditingBatch(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save batch');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Sever Bio-Asset Link',
      message: 'This will purge all history, mortality data, and operational metrics for this batch. Continue?',
      variant: 'danger',
      confirmText: 'Sever Link',
      cancelText: 'Abort'
    });
    if (!confirmed) return;
    try {
      const result = await batchesApi.delete(id);
      if (result.error) throw new Error(result.error);
      await fetchBatches();
    } catch (e: any) {
      setError(e.message || 'Failed to delete batch');
    }
  };

  const calculateSurvivalRate = (quantity?: number, mortality?: number): number => {
    const q = quantity ?? 0;
    const m = mortality ?? 0;
    if (q === 0) return 0;
    return ((q - m) / q) * 100;
  };

  const filteredBatches = useMemo(() => batches.filter((batch) => {
    const q = searchTerm.toLowerCase();
    const bn = (batch.batch_number || '').toLowerCase();
    const breed = (batch.breed || '').toLowerCase();
    const farmName = batch.farm?.name ? batch.farm.name.toLowerCase() : '';
    const farmerName = batch.farm?.farmer?.user?.full_name ? batch.farm.farmer.user.full_name.toLowerCase() : '';
    const matchesSearch = bn.includes(q) || breed.includes(q) || farmName.includes(q) || farmerName.includes(q);
    const matchesStatus = statusFilter === 'ALL' || batch.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [batches, searchTerm, statusFilter]);

  const stats = useMemo(() => ({
    total: batches.length,
    active: batches.filter((b) => b.status === 'ACTIVE').length,
    completed: batches.filter((b) => b.status === 'COMPLETED').length,
    totalBirds: batches.reduce((sum, b) => sum + (b.quantity ?? 0), 0),
    avgSurvivalRate: batches.length > 0 ? (batches.reduce((sum, b) => sum + calculateSurvivalRate(b.quantity, b.mortality_count), 0) / batches.length).toFixed(1) : '0.0',
  }), [batches]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-pulse">
        <div className="w-16 h-16 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Bio-Asset Matrix Recalibrating...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 max-w-[1600px] mx-auto">
      <ConfirmDialog />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-gray-100">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Global Bio-Asset Registry</span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
            Batch <span className="text-gray-400">Control</span>
          </h1>
          <p className="text-gray-500 font-bold text-lg leading-relaxed">Centralized oversight of all operational poultry cycles.</p>
        </div>
        <button
          onClick={() => { setEditingBatch(null); resetForm(); setShowModal(true); }}
          className="px-8 py-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3"
        >
          <Plus className="w-4 h-4" />
          Initialize Sequence
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-xl shadow-gray-200/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"><Activity className="w-6 h-6" /></div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Global Feed</span>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Batches</p>
          <p className="text-4xl font-black text-gray-900 tracking-tighter">{stats.total} Units</p>
        </Card>
        <Card className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-xl shadow-gray-200/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-lg"><Zap className="w-6 h-6" /></div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Pulse</span>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Live Cycles</p>
          <p className="text-4xl font-black text-emerald-600 tracking-tighter">{stats.active} Nodes</p>
        </Card>
        <Card className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-xl shadow-gray-200/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-lg"><Clock className="w-6 h-6" /></div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Retention</span>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Completed</p>
          <p className="text-4xl font-black text-gray-900 tracking-tighter">{stats.completed} Success</p>
        </Card>
        <Card className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-xl shadow-gray-200/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-lg"><TrendingUp className="w-6 h-6" /></div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Efficiency</span>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Avg Survival</p>
          <p className="text-4xl font-black text-emerald-600 tracking-tighter">{stats.avgSurvivalRate}%</p>
        </Card>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-fadeIn">
          {error}
        </div>
      )}

      {/* Filter & Search */}
      <Card className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-xl shadow-gray-200/40">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Search batch identification, breed, farm, or operator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-6 bg-gray-50 border-none rounded-3xl focus:ring-4 focus:ring-indigo-500/10 text-lg font-bold transition-all outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | Status)}
            className="px-8 py-6 bg-gray-50 border-none rounded-3xl text-[10px] font-black uppercase tracking-widest text-gray-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none min-w-[200px]"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Authorized</option>
            <option value="COMPLETED">Fulfilled</option>
            <option value="CLOSED">Purged</option>
          </select>
        </div>
      </Card>

      {/* Batches Table */}
      <Card className="bg-white border border-gray-100 rounded-[40px] shadow-xl shadow-gray-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50">
                <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Identification</th>
                <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Unit Controller</th>
                <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Genotype</th>
                <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Integrity Metrics</th>
                <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Temporal age</th>
                <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Survival Rate</th>
                <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-10 py-8 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Sequence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-10 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Layers className="w-12 h-12 text-gray-100" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No matching bio-assets found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBatches.map((batch) => {
                  const survival = calculateSurvivalRate(batch.quantity, batch.mortality_count);
                  return (
                    <tr key={batch.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center font-black text-indigo-600 shadow-sm transition-transform group-hover:scale-110">
                            <Bird className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{batch.batch_number}</p>
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">INIT: {batch.start_date ? new Date(batch.start_date).toLocaleDateString() : '??'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-gray-700 uppercase tracking-tight leading-none mb-1">{batch.farm?.name}</span>
                          <span className="text-[10px] font-bold text-indigo-600">{batch.farm?.farmer?.user?.full_name}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[8px] font-black uppercase tracking-widest">{batch.breed}</span>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-gray-900 tracking-tighter">{(batch.quantity ?? 0).toLocaleString()} UNITS</span>
                          <span className="text-[8px] font-black text-rose-500 uppercase">LEAKAGE: {batch.mortality_count ?? 0}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="text-sm font-black text-gray-800">{batch.current_age_days ?? 0}D</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex flex-col gap-2 min-w-[100px]">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">{survival.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div className={`h-full transition-all duration-1000 ${survival > 95 ? 'bg-emerald-500' : survival > 85 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${survival}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[8px] font-black uppercase tracking-widest ${batch.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            batch.status === 'COMPLETED' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                              'bg-gray-50 text-gray-500 border-gray-100'
                          }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${batch.status === 'ACTIVE' ? 'bg-emerald-500' : batch.status === 'COMPLETED' ? 'bg-indigo-500' : 'bg-gray-400'} animate-pulse`}></div>
                          {batch.status}
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(batch)} className="p-3 bg-white hover:bg-indigo-600 hover:text-white rounded-xl shadow-sm border border-gray-50 transition-all"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(batch.id)} className="p-3 bg-white hover:bg-rose-600 hover:text-white rounded-xl shadow-sm border border-gray-50 transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Control Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <Card className="w-full max-w-4xl bg-white rounded-[40px] shadow-2xl animate-scaleIn border-none overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-10 pb-6 flex items-center justify-between border-b border-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><Layers className="w-6 h-6" /></div>
                <h2 className="text-3xl font-black text-gray-900 uppercase">{editingBatch ? 'Modify Bio-Asset' : 'Initialize Sequence'}</h2>
              </div>
              <button onClick={() => { setShowModal(false); setEditingBatch(null); resetForm(); }} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 pt-8 overflow-y-auto space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div>
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Universal Designation (Batch #)</Label>
                    <Input value={formData.batch_number} onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })} required className="py-7 mt-2 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Genotype Schema</Label>
                      <Input value={formData.breed} onChange={(e) => setFormData({ ...formData, breed: e.target.value })} required className="py-7 mt-2 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold" />
                    </div>
                    <div>
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Initial Unit Count</Label>
                      <Input type="number" required min={1} value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} className="py-7 mt-2 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold" />
                    </div>
                  </div>
                </div>
                <div className="space-y-8">
                  <div>
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Operational State</Label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })} className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-[10px] font-black uppercase tracking-widest outline-none mt-2 transition-all">
                      <option value="ACTIVE">Authorized (Active)</option>
                      <option value="COMPLETED">Fulfilled (Completed)</option>
                      <option value="CLOSED">Purged (Closed)</option>
                    </select>
                  </div>
                  <div className="p-6 bg-indigo-50 rounded-3xl space-y-4">
                    <Label className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">Temporal Logic</Label>
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-black text-gray-700 uppercase">Start Gate</span>
                        <Input type="date" required value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="mt-1 bg-white border-none py-4 rounded-xl text-xs" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-gray-700 uppercase">Exit Estimate</span>
                        <Input type="date" value={formData.expected_end_date} onChange={(e) => setFormData({ ...formData, expected_end_date: e.target.value })} className="mt-1 bg-white border-none py-4 rounded-xl text-xs" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Operational Thresholds</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Temporal Age (Days)</Label>
                    <Input type="number" required min={0} value={formData.current_age_days} onChange={(e) => setFormData({ ...formData, current_age_days: e.target.value })} className="py-7 mt-2 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold" />
                  </div>
                  <div>
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Leakage (Mortality Count)</Label>
                    <Input type="number" required min={0} value={formData.mortality_count} onChange={(e) => setFormData({ ...formData, mortality_count: e.target.value })} className="py-7 mt-2 rounded-2xl border-none bg-rose-50 text-rose-600 focus:bg-white focus:ring-4 focus:ring-rose-500/10 text-sm font-bold" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Parent Facility (Farm Mapping)</Label>
                <select required value={formData.farm_id} onChange={(e) => setFormData({ ...formData, farm_id: e.target.value })} className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-[10px] font-black uppercase tracking-widest outline-none mt-2 transition-all">
                  <option value="">Map To Secure Facility...</option>
                  {farms.map((farm) => (
                    <option key={farm.id} value={farm.id}>
                      {farm.name} - {farm.location} (OP: {farm.farmer?.user?.full_name})
                    </option>
                  ))}
                </select>
              </div>

              <Button type="submit" className="w-full py-8 bg-gray-900 border-none hover:bg-black text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all hover:-translate-y-1">
                {editingBatch ? 'Commit Sequence Updates' : 'Authorize New Cycle'}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default AllBatchesManagement;
