import { useEffect, useState, useCallback, useMemo } from 'react';
import { useConfirm } from '../../hooks/useConfirm';
import {
  MapPin,
  Users,
  Grid2x2 as Grid,
  Edit2,
  Trash2,
  Search,
  AlertCircle,
  Plus,
  Eye,
  Building2,
  ChevronRight,
  Filter,
  MoreVertical,
  X,
  Globe,
  Zap,
  ShieldCheck,
  Activity,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { farmsApi, farmersApi } from '../../lib/api';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

interface Farm {
  id: string;
  name: string;
  location: string;
  size_hectares?: number;
  latitude?: number;
  longitude?: number;
  status: string;
  farmer_id: string;
  created_at: string;
  updated_at: string;
  farmer: {
    id: string;
    business_name?: string;
    user: {
      full_name: string;
      email: string;
      phone?: string;
    };
  };
  batches_count?: number;
  devices_count?: number;
}

interface FarmFormData {
  name: string;
  location: string;
  size_hectares: string;
  latitude: string;
  longitude: string;
  status: string;
  farmer_id: string;
}

export function AllFarmsManagement() {
  const { confirm, ConfirmDialog } = useConfirm();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FarmFormData>({
    name: '',
    location: '',
    size_hectares: '',
    latitude: '',
    longitude: '',
    status: 'ACTIVE',
    farmer_id: '',
  });

  const fetchFarms = useCallback(async () => {
    try {
      const { data, error } = await farmsApi.getAll();
      if (error) throw error;
      // Check if data has results property (paginated response)
      const farmsArray = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
      setFarms(farmsArray);
    } catch (error: any) {
      console.error('Error fetching farms:', error);
      setError(error.message);
    }
  }, []);

  const fetchFarmers = useCallback(async () => {
    try {
      const { data, error } = await farmersApi.getAll();
      if (error) throw error;
      setFarmers(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching farmers:', error);
      setFarmers([]);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchFarms(), fetchFarmers()]);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [fetchFarms, fetchFarmers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.farmer_id) { setError('Operator mapping required'); return; }
    try {
      const payload = {
        name: formData.name,
        location: formData.location,
        size_hectares: formData.size_hectares ? parseFloat(formData.size_hectares) : undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        status: formData.status,
        farmer_id: formData.farmer_id,
      };
      if (editingFarm) await farmsApi.update(editingFarm.id, payload);
      else await farmsApi.create(payload);
      setShowModal(false);
      setEditingFarm(null);
      resetForm();
      await fetchFarms();
    } catch (error: any) {
      setError(error.message || 'Failed to sync infrastructure link');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Decommission Facility',
      message: 'This will purge all infrastructure data, connected IoT devices, and operational batches. Proceed?',
      variant: 'danger',
      confirmText: 'Confirm Purge',
      cancelText: 'Abort'
    });
    if (!confirmed) return;
    try {
      await farmsApi.delete(id);
      await fetchFarms();
    } catch (error: any) {
      // Check if it's the permission error we know about
      if (error.message && error.message.includes('farmer_profile')) {
        setError('Delete failed due to permission issue. The farm may not be properly associated with a farmer profile.');
      } else {
        setError(error.message || 'Purge protocol failed');
      }
      // Still try to refresh the list in case the delete worked despite the error
      setTimeout(() => fetchFarms(), 1000);
    }
  };

  const openEditModal = (farm: Farm) => {
    setEditingFarm(farm);
    setFormData({
      name: farm.name,
      location: farm.location,
      size_hectares: farm.size_hectares?.toString() || '',
      latitude: farm.latitude?.toString() || '',
      longitude: farm.longitude?.toString() || '',
      status: farm.status,
      farmer_id: farm.farmer_id,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', location: '', size_hectares: '', latitude: '', longitude: '', status: 'ACTIVE', farmer_id: '' });
  };

  const filteredFarms = useMemo(() => farms.filter((farm) => {
    const matchesSearch =
      farm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farm.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (farm.farmer?.user?.full_name && farm.farmer.user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (farm.farmer?.business_name && farm.farmer.business_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || farm.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [farms, searchTerm, statusFilter]);

  const stats = useMemo(() => ({
    total: farms.length,
    active: farms.filter((f) => f.status === 'ACTIVE').length,
    inactive: farms.filter((f) => f.status === 'INACTIVE').length,
    maintenance: farms.filter((f) => f.status === 'MAINTENANCE').length,
  }), [farms]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-pulse">
        <div className="w-16 h-16 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Infrastructure Nodes Initializing...</p>
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
              <Globe className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Global Infrastructure Map</span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
            Facility <span className="text-gray-400">Grid</span>
          </h1>
          <p className="text-gray-500 font-bold text-lg leading-relaxed">Cross-platform management of physical operational units.</p>
        </div>
        <button
          onClick={() => { setEditingFarm(null); resetForm(); setShowModal(true); }}
          className="px-8 py-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3"
        >
          <Plus className="w-4 h-4" />
          Deploy Facility
        </button>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-xl shadow-gray-200/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"><Building2 className="w-6 h-6" /></div>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Global Grid</span>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Facilities</p>
          <p className="text-4xl font-black text-gray-900 tracking-tighter">{stats.total} Nodes</p>
        </Card>
        <Card className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-xl shadow-gray-200/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-lg"><Zap className="w-6 h-6" /></div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Ops</span>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Online Units</p>
          <p className="text-4xl font-black text-emerald-600 tracking-tighter">{stats.active} Alive</p>
        </Card>
        <Card className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-xl shadow-gray-200/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center shadow-lg"><Activity className="w-6 h-6" /></div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Offline</span>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Dormant Units</p>
          <p className="text-4xl font-black text-gray-400 tracking-tighter">{stats.inactive} Dark</p>
        </Card>
        <Card className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-xl shadow-gray-200/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-lg"><ShieldCheck className="w-6 h-6" /></div>
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Refactor</span>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Maintenance</p>
          <p className="text-4xl font-black text-amber-600 tracking-tighter">{stats.maintenance} Cycles</p>
        </Card>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-fadeIn">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <Card className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-xl shadow-gray-200/40">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Search facility name, location, or operator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-6 bg-gray-50 border-none rounded-3xl focus:ring-4 focus:ring-indigo-500/10 text-lg font-bold transition-all outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-8 py-6 bg-gray-50 border-none rounded-3xl text-[10px] font-black uppercase tracking-widest text-gray-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none min-w-[200px]"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Authorized (Active)</option>
            <option value="INACTIVE">Decommissioned (Inactive)</option>
            <option value="MAINTENANCE">Maintenance Mode</option>
          </select>
        </div>
      </Card>

      {/* Infrastructure Grid Table */}
      <Card className="bg-white border border-gray-100 rounded-[40px] shadow-xl shadow-gray-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50">
                <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Facility Identity</th>
                <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Controller Mapping</th>
                <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Scale</th>
                <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Assets</th>
                <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">IoT Status</th>
                <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Operational State</th>
                <th className="px-10 py-8 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Sequence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredFarms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-10 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Building2 className="w-12 h-12 text-gray-100" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Grid coordinate empty</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredFarms.map((farm) => (
                  <tr key={farm.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center font-black text-indigo-600 shadow-sm transition-transform group-hover:scale-110">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{farm.name}</p>
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-indigo-400" />
                            {farm.location}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-700 uppercase tracking-tight leading-none mb-1">
                          {farm.farmer?.user?.full_name || 'Unknown Operator'}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">
                          {farm.farmer?.business_name || farm.farmer?.user?.email || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className="text-sm font-black text-gray-800">{farm.size_hectares ? `${farm.size_hectares} HA` : 'N/A'}</span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg w-fit">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-xs font-black text-gray-700">{farm.batches_count || 0}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg w-fit">
                        <Zap className="w-3.5 h-3.5" />
                        <span className="text-xs font-black">{farm.devices_count || 0}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[8px] font-black uppercase tracking-widest ${farm.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          farm.status === 'MAINTENANCE' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-gray-50 text-gray-500 border-gray-100'
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${farm.status === 'ACTIVE' ? 'bg-emerald-500' : farm.status === 'MAINTENANCE' ? 'bg-amber-500' : 'bg-gray-400'} animate-pulse`}></div>
                        {farm.status}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* <Link to={`/admin/farmers/${farm.farmer.id}`} className="p-3 bg-white hover:bg-indigo-600 hover:text-white rounded-xl shadow-sm border border-gray-50 transition-all"><Eye className="w-4 h-4" /></Link> */}
                        <button onClick={() => openEditModal(farm)} className="p-3 bg-white hover:bg-emerald-600 hover:text-white rounded-xl shadow-sm border border-gray-50 transition-all"><Edit2 className="w-4 h-4" /></button>
                        <button 
                          onClick={() => handleDelete(farm.id)} 
                          className="p-3 bg-white hover:bg-rose-600 hover:text-white rounded-xl shadow-sm border border-gray-50 transition-all"
                          title="Delete may fail due to permissions"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Facility Grid Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <Card className="w-full max-w-4xl bg-white rounded-[40px] shadow-2xl animate-scaleIn border-none overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-10 pb-6 flex items-center justify-between border-b border-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><Building2 className="w-6 h-6" /></div>
                <h2 className="text-3xl font-black text-gray-900 uppercase">{editingFarm ? 'Refactor Infrastructure' : 'Deploy New Node'}</h2>
              </div>
              <button onClick={() => { setShowModal(false); setEditingFarm(null); resetForm(); }} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 pt-8 overflow-y-auto space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div>
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Node Designation (Facility Name)</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="py-7 mt-2 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold" placeholder="e.g., Alpha Sector Hatchery" />
                  </div>
                  <div>
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Spatial Location (Physical Address)</Label>
                    <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required className="py-7 mt-2 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold" placeholder="e.g., Nakuru, Sector 7" />
                  </div>
                </div>
                <div className="space-y-8">
                  <div>
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Deployment Status</Label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-[10px] font-black uppercase tracking-widest outline-none mt-2 transition-all">
                      <option value="ACTIVE">Authorized (Active)</option>
                      <option value="INACTIVE">Decommissioned (Inactive)</option>
                      <option value="MAINTENANCE">Maintenance Cycle</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Scale Factor (Hectares)</Label>
                    <Input type="number" step="0.01" value={formData.size_hectares} onChange={(e) => setFormData({ ...formData, size_hectares: e.target.value })} className="py-7 mt-2 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold" placeholder="5.5" />
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Geospatial Coordinates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Latitude Variable</Label>
                    <Input type="number" step="any" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: e.target.value })} className="py-7 mt-2 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold" placeholder="-1.286389" />
                  </div>
                  <div>
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Longitude Variable</Label>
                    <Input type="number" step="any" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: e.target.value })} className="py-7 mt-2 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold" placeholder="36.817223" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Controller Mapping (Farmer Assignment)</Label>
                <select required value={formData.farmer_id} onChange={(e) => setFormData({ ...formData, farmer_id: e.target.value })} className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-[10px] font-black uppercase tracking-widest outline-none mt-2 transition-all">
                  <option value="">Map To Secure Operator...</option>
                  {farmers.map((farmer) => (
                    <option key={farmer.id} value={farmer.id}>
                      {farmer.user.full_name} {farmer.business_name ? `(${farmer.business_name})` : ''} - {farmer.user.email}
                    </option>
                  ))}
                </select>
              </div>

              <Button type="submit" className="w-full py-8 bg-gray-900 border-none hover:bg-black text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all hover:-translate-y-1">
                {editingFarm ? 'Commit Infrastructure Refactor' : 'Synchronize New Facility Node'}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default AllFarmsManagement;
