import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { dataService, Farm } from '../../services/dataService';
import { useAuth } from '../../contexts/AuthContext';
// Removed unused authApi import
import { useLanguage } from '../../contexts/LanguageContext';
import { useConfirm } from '../../hooks/useConfirm';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Plus,
  MapPin,
  Calendar,
  Settings2,
  Trash2,
  Warehouse,
  ChevronRight,
  Maximize2,
  Activity,
  X,
  Target
} from 'lucide-react';
import { format } from 'date-fns';

export function FarmsManagement() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { confirm, ConfirmDialog } = useConfirm();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [newFarm, setNewFarm] = useState({
    name: '',
    location: '',
    size_hectares: '',
  });

  const fetchFarms = useCallback(async () => {
    console.log('fetchFarms called, user:', user);
    if (!user) {
      console.log('No user found, returning');
      return;
    }
    try {
      // Use the same logic as handleAddFarm to get the farmer ID
      let farmerId = user.farmer_profile?.id || user.id;
      console.log('User object:', user);
      console.log('Farmer ID:', farmerId);
      
      if (!farmerId) {
        console.warn('No farmer ID found, fetching all farms');
        const farmsData = await dataService.getFarms();
        console.log('Fetched farms data:', farmsData);
        const sorted = farmsData.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        console.log('Setting farms:', sorted);
        setFarms(sorted);
      } else {
        const farmsData = await dataService.getFarms(farmerId);
        console.log('Fetched farms data for farmer:', farmsData);
        const sorted = farmsData.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setFarms(sorted);
      }
    } catch (error) {
      console.error('Error fetching farms:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFarms();
  }, [fetchFarms]);

  const handleAddFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!user) {
        console.error('No user found');
        return;
      }
      console.log('Current user object:', JSON.stringify(user, null, 2));
      
      // Check if we have the required profile information
      if (!user.email) {
        throw new Error('User email not found. Please log in again.');
      }
      
      console.log('Preparing farm data for creation');
      
      // Since farmer_profile is null and user.id doesn't exist, 
      // we'll let the backend associate the farm with the authenticated user
      const farmData = {
        name: newFarm.name,
        location: newFarm.location,
        size_hectares: newFarm.size_hectares ? parseFloat(newFarm.size_hectares) : undefined,
        latitude: undefined,
        longitude: undefined,
        status: 'ACTIVE' as const,
        farmer_id: user.id, // Use user.id as farmer_id - backend will handle the association
      };
      console.log('Creating farm with data:', farmData);
      await dataService.createFarm(farmData);
      setShowAddModal(false);
      setNewFarm({ name: '', location: '', size_hectares: '' });
      fetchFarms();
    } catch (error) {
      console.error('Error adding farm:', error);
    }
  };

  const handleEditFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFarm) return;
    try {
      await dataService.updateFarm(editingFarm.id, {
        name: editingFarm.name,
        location: editingFarm.location,
        size_hectares: editingFarm.size_hectares,
      });
      setShowEditModal(false);
      setEditingFarm(null);
      fetchFarms();
    } catch (error) {
      console.error('Error updating farm:', error);
    }
  };

  const handleDeleteFarm = async (farmId: string) => {
    const confirmed = await confirm({
      title: 'Decommission Asset',
      message: 'This operation will permanently purge this farm and all associated batch records. This action cannot be reversed.',
      variant: 'danger',
      confirmText: 'Sunder Asset',
      cancelText: 'Abort'
    });
    if (!confirmed) return;
    try {
      await dataService.deleteFarm(farmId);
      fetchFarms();
    } catch (error) {
      console.error('Error deleting farm:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-pulse">
        <div className="w-16 h-16 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin mb-6"></div>
        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Asset Registry Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <ConfirmDialog />

      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-gray-100">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Strategic Infrastructure</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">
            {t('farms.myFarms')} <span className="text-blue-600">[{farms.length}]</span>
          </h1>
          <p className="text-gray-500 font-bold text-lg">{t('farms.subtitleFarmer')}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="group flex items-center gap-3 px-8 py-5 bg-blue-600 text-white rounded-[2rem] shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em]"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
          Establish New Unit
        </button>
      </div>

      {farms.length === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center text-center bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/40">
          <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-8">
            <Warehouse className="w-12 h-12 text-gray-200" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-4">{t('farms.noFarmsYet')}</h3>
          <p className="text-gray-400 font-bold max-w-sm mb-10">Start by establishing your first operational unit to begin batch tracking.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-10 py-5 bg-gray-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-gray-200"
          >
            Create Your First Farm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {farms.map((farm) => (
            <Card
              key={farm.id}
              className="group relative overflow-hidden bg-white rounded-[40px] border border-gray-100 p-8 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:shadow-gray-300/50 transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 bg-blue-600/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>

              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  <Warehouse className="w-8 h-8" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${farm.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-gray-100 text-gray-400'
                    }`}>
                    {farm.status}
                  </span>
                  {farm.size_hectares && (
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Maximize2 className="w-3 h-3" />
                      <span className="text-[10px] font-black">{farm.size_hectares} Ha</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-8 relative z-10">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase group-hover:text-blue-600 transition-colors">{farm.name}</h3>
                <div className="flex items-center gap-2 mt-2 text-gray-500 font-bold">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span className="text-sm">{farm.location}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Created</p>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-xs font-black">{format(new Date(farm.created_at), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Health Status</p>
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Activity className="w-3.5 h-3.5" />
                    <span className="text-xs font-black uppercase tracking-tight">Good</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 relative z-10">
                <Link
                  to={`/farmer/farms/${farm.id}`}
                  className="flex-[2] flex items-center justify-center gap-3 py-5 bg-gray-900 hover:bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-gray-200"
                >
                  Farm Details
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => {
                    setEditingFarm(farm);
                    setShowEditModal(true);
                  }}
                  className="p-5 bg-white border border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-100 rounded-2xl transition-all shadow-sm"
                >
                  <Settings2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteFarm(farm.id)}
                  className="p-5 bg-white border border-gray-100 text-gray-400 hover:text-rose-600 hover:border-rose-100 rounded-2xl transition-all shadow-sm"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modernized Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <Card className="w-full max-w-md bg-white rounded-[40px] overflow-hidden shadow-2xl animate-scaleIn border-none">
            <div className="p-10 pb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">New Farm</h2>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddFarm} className="p-10 pt-0 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Farm Name</Label>
                  <Input
                    type="text"
                    value={newFarm.name}
                    onChange={(e) => setNewFarm({ ...newFarm, name: e.target.value })}
                    required
                    placeholder="e.g., North Gate Poultry"
                    className="py-7 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 text-lg font-bold transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Location</Label>
                  <div className="relative group">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                    <Input
                      type="text"
                      value={newFarm.location}
                      onChange={(e) => setNewFarm({ ...newFarm, location: e.target.value })}
                      required
                      placeholder="e.g., Nakuru District"
                      className="pl-14 py-7 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 text-lg font-bold transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Size (Hectares)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newFarm.size_hectares}
                    onChange={(e) => setNewFarm({ ...newFarm, size_hectares: e.target.value })}
                    placeholder="e.g., 2.5"
                    className="py-7 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 text-lg font-bold transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-7 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-400 border-none bg-gray-50 hover:bg-gray-100 transition-all"
                >
                  Discard
                </Button>
                <Button
                  type="submit"
                  className="flex-[2] py-7 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95"
                >
                  Deploy Unit
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modernized Edit Modal */}
      {showEditModal && editingFarm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <Card className="w-full max-w-md bg-white rounded-[40px] overflow-hidden shadow-2xl animate-scaleIn border-none">
            <div className="p-10 pb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Settings2 className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Edit Unit</h2>
              </div>
              <button onClick={() => { setShowEditModal(false); setEditingFarm(null); }} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditFarm} className="p-10 pt-0 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Identity</Label>
                  <Input
                    type="text"
                    value={editingFarm.name}
                    onChange={(e) => setEditingFarm({ ...editingFarm, name: e.target.value })}
                    required
                    className="py-7 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 text-lg font-bold transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Geographical Focus</Label>
                  <Input
                    type="text"
                    value={editingFarm.location}
                    onChange={(e) => setEditingFarm({ ...editingFarm, location: e.target.value })}
                    required
                    className="py-7 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 text-lg font-bold transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Spatial Capacity (Hectares)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingFarm.size_hectares !== null && editingFarm.size_hectares !== undefined ? editingFarm.size_hectares : ''}
                    onChange={(e) => setEditingFarm({ 
                      ...editingFarm, 
                      size_hectares: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    className="py-7 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 text-lg font-bold transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowEditModal(false); setEditingFarm(null); }}
                  className="flex-1 py-7 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-400 border-none bg-gray-50 hover:bg-gray-100 transition-all"
                >
                  Discard
                </Button>
                <Button
                  type="submit"
                  className="flex-[2] py-7 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 transition-all hover:-translate-y-1 active:scale-95"
                >
                  Modify Registry
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default FarmsManagement;
