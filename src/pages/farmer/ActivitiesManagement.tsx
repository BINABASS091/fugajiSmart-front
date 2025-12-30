import { useEffect, useState, useCallback, useMemo } from 'react';
import { dataService } from '../../services/dataService';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Calendar,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Filter,
  ChevronRight,
  X,
  AlertTriangle,
  History,
  LayoutGrid,
  ClipboardList,
  Warehouse,
  Package
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Activity, Batch, Farm } from '../../services/mockData';
import { format } from 'date-fns';

interface ActivityWithBatch extends Activity {
  batch: {
    batch_number: string;
    farm: {
      name: string;
    };
  };
}

interface BatchWithFarm extends Batch {
  farm: {
    id: string;
    name: string;
  };
}

export function ActivitiesManagement() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activities, setActivities] = useState<ActivityWithBatch[]>([]);
  const [batches, setBatches] = useState<BatchWithFarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newActivity, setNewActivity] = useState({
    batch_id: '',
    activity_type: 'FEEDING' as Activity['activity_type'],
    description: '',
    scheduled_date: '',
  });

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const farmsData = await dataService.getFarms(user.id);
      const farmIds = farmsData.map(f => f.id);
      if (farmIds.length > 0) {
        const [activitiesData, batchesData] = await Promise.all([
          dataService.getActivities(user.id),
          dataService.getBatches(undefined, user.id),
        ]);
        const farmsMap = new Map(farmsData.map(f => [f.id, f]));
        const enrichedActivities: ActivityWithBatch[] = activitiesData
          .map(activity => {
            const batch = batchesData.find(b => b.id === activity.batch_id);
            const farm = batch ? farmsMap.get(batch.farm) : undefined;
            return {
              ...activity,
              batch: batch
                ? {
                  batch_number: batch.batch_number,
                  farm: { name: farm?.name || 'Unknown Farm' },
                }
                : { batch_number: 'Unknown', farm: { name: 'Unknown Farm' } },
            };
          })
          .sort((a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime());
        const enrichedBatches: BatchWithFarm[] = batchesData
          .filter(b => b.status === 'ACTIVE')
          .map(batch => {
            const farm = farmsMap.get(batch.farm);
            return {
              ...batch,
              farm: farm
                ? { id: farm.id, name: farm.name }
                : { id: batch.farm, name: 'Unknown Farm' },
            };
          });
        setActivities(enrichedActivities);
        setBatches(enrichedBatches);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredActivities = useMemo(() => {
    if (filter === 'ALL') return activities;
    return activities.filter((activity) => activity.status === filter);
  }, [activities, filter]);

  const markAsCompleted = async (id: string) => {
    try {
      await dataService.updateActivity(id, {
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
      });
      fetchData();
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!user) return;
      if (!user.farmer_profile || !user.farmer_profile.id) {
        alert('Error: Your farmer profile is missing or incomplete. Please contact support.');
        return;
      }
      const payload = {
        farmer: user.farmer_profile.id,
        batch: newActivity.batch_id,
        activity_type: newActivity.activity_type,
        description: newActivity.description || null,
        scheduled_date: newActivity.scheduled_date,
        status: 'PENDING',
        completed_at: null,
      };
      console.log('Creating activity with payload:', payload);
      await dataService.createActivity(payload);
      setShowAddModal(false);
      setNewActivity({ batch_id: '', activity_type: 'FEEDING', description: '', scheduled_date: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  const getActivityConfigs = (type: string) => {
    switch (type) {
      case 'FEEDING': return { icon: '🥣', color: 'blue', label: 'Feeding' };
      case 'VACCINATION': return { icon: '💉', color: 'rose', label: 'Vaccination' };
      case 'CLEANING': return { icon: '🧹', color: 'emerald', label: 'Sanitization' };
      case 'INSPECTION': return { icon: '🔍', color: 'amber', label: 'Inspection' };
      default: return { icon: '📋', color: 'gray', label: 'General' };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-pulse">
        <div className="w-16 h-16 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin mb-6"></div>
        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Action Stream Synchronizing...</p>
      </div>
    );
  }

  const stats = {
    total: activities.length,
    pending: activities.filter(a => a.status === 'PENDING').length,
    completed: activities.filter(a => a.status === 'COMPLETED').length,
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-gray-100">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <ClipboardList className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Operational Flow</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">
            {t('activities.title')} <span className="text-blue-600">[{stats.pending}]</span>
          </h1>
          <p className="text-gray-500 font-bold text-lg">{t('activities.subtitle')}</p>
        </div>
        {batches.length > 0 && (
          <button
            onClick={() => setShowAddModal(true)}
            className="group flex items-center gap-3 px-8 py-5 bg-blue-600 text-white rounded-[2rem] shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em]"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
            Schedule Protocol
          </button>
        )}
      </div>

      {/* Progress Overlays */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-blue-600 rounded-[40px] text-white shadow-2xl shadow-blue-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Total Lifecycle</p>
          <h3 className="text-4xl font-black">{stats.total}</h3>
          <p className="text-[10px] font-black uppercase tracking-widest mt-4 flex items-center gap-2">
            <History className="w-3 h-3" />
            Historical Record
          </p>
        </div>
        <div className="p-8 bg-amber-500 rounded-[40px] text-white shadow-2xl shadow-amber-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Active Mandates</p>
          <h3 className="text-4xl font-black">{stats.pending}</h3>
          <p className="text-[10px] font-black uppercase tracking-widest mt-4 flex items-center gap-2">
            <Clock className="w-3 h-3 text-white" />
            Execution Pending
          </p>
        </div>
        <div className="p-8 bg-emerald-500 rounded-[40px] text-white shadow-2xl shadow-emerald-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Success Rate</p>
          <h3 className="text-4xl font-black">{Math.round((stats.completed / (stats.total || 1)) * 100)}%</h3>
          <p className="text-[10px] font-black uppercase tracking-widest mt-4 flex items-center gap-2">
            <CheckCircle className="w-3 h-3" />
            Validation Complete
          </p>
        </div>
      </div>

      {/* Filtering Layer */}
      <div className="flex items-center justify-between gap-4 p-4 bg-white/70 backdrop-blur-md rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/30">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {['ALL', 'PENDING', 'COMPLETED', 'CANCELLED'].map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === opt ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'
                }`}
            >
              {opt === 'ALL' ? 'Everything' : opt}
            </button>
          ))}
        </div>
        <div className="hidden sm:flex items-center gap-4 border-l border-gray-100 pl-4">
          <LayoutGrid className="w-5 h-5 text-gray-300" />
          <Filter className="w-5 h-5 text-gray-300" />
        </div>
      </div>

      {/* Activity Stream */}
      <div className="space-y-6">
        {filteredActivities.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-center bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/40">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
              <Calendar className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Stream Empty</h3>
            <p className="text-gray-400 font-bold max-w-sm mt-3 px-6">No scheduled operations detected in this vector.</p>
          </div>
        ) : (
          filteredActivities.map((activity) => {
            const config = getActivityConfigs(activity.activity_type);
            const isPending = activity.status === 'PENDING';

            return (
              <Card
                key={activity.id}
                className="group relative overflow-hidden bg-white rounded-[40px] border border-gray-100 p-8 shadow-xl shadow-gray-200/40 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="flex items-start sm:items-center gap-6 flex-1">
                    <div className="relative">
                      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-lg ring-4 ring-offset-4 ring-gray-50 bg-${config.color}-50`}>
                        {config.icon}
                      </div>
                      {isPending && <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 border-2 border-white rounded-full animate-pulse"></span>}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-lg ${activity.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                          activity.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                          {activity.status}
                        </span>
                        <span className="px-2.5 py-1 text-[8px] font-black uppercase tracking-widest bg-gray-50 text-gray-400 rounded-lg">
                          {config.label}
                        </span>
                      </div>
                      <h4 className="text-xl font-black text-gray-900 leading-tight uppercase tracking-tight">
                        {activity.description || `${config.label} Sequence`}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">
                        <div className="flex items-center gap-2">
                          <Warehouse className="w-3.5 h-3.5 text-blue-500" />
                          {activity.batch.farm.name}
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-indigo-500" />
                          {activity.batch.batch_number}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-rose-500" />
                          {format(new Date(activity.scheduled_date), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {isPending && (
                    <button
                      onClick={() => markAsCompleted(activity.id)}
                      className="px-10 py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-100 hover:-translate-y-1 transition-all active:scale-95"
                    >
                      Commit Success
                    </button>
                  )}
                  {!isPending && (
                    <div className="hidden lg:flex items-center gap-3 text-emerald-500 px-6 py-4 bg-emerald-50 rounded-2xl">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Protocol Verified</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Modernized Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <Card className="w-full max-w-md bg-white rounded-[40px] overflow-hidden shadow-2xl animate-scaleIn border-none">
            <div className="p-10 pb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">New Mandate</h2>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Warning if no valid batches or farms */}
            {(batches.length === 0) && (
              <div className="p-4 mb-4 bg-amber-100 text-amber-700 rounded-xl text-center font-bold text-sm">
                No active batches found. Please create a farm and at least one batch before scheduling activities.
              </div>
            )}

            <form onSubmit={handleAddActivity} className="p-10 pt-0 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Operational Target</Label>
                  <select
                    value={newActivity.batch_id}
                    onChange={(e) => setNewActivity({ ...newActivity, batch_id: e.target.value })}
                    required
                    className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 text-sm font-bold transition-all outline-none"
                    disabled={batches.length === 0}
                  >
                    <option value="">Choose Component</option>
                    {batches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.batch_number} ({batch.farm.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sequence Type</Label>
                  <select
                    value={newActivity.activity_type}
                    onChange={(e) => setNewActivity({ ...newActivity, activity_type: e.target.value as Activity['activity_type'] })}
                    required
                    className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 text-sm font-bold transition-all outline-none uppercase tracking-widest text-[10px]"
                    disabled={batches.length === 0}
                  >
                    <option value="FEEDING">Feeding Sequence</option>
                    <option value="VACCINATION">Vaccination Protocol</option>
                    <option value="CLEANING">Sanitization Action</option>
                    <option value="INSPECTION">Biometric Inspection</option>
                    <option value="OTHER">Other Operation</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mission Parameters</Label>
                  <textarea
                    rows={3}
                    value={newActivity.description}
                    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                    placeholder="Specify mission details..."
                    className="w-full p-6 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 text-sm font-bold transition-all outline-none resize-none"
                    disabled={batches.length === 0}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Scheduled Deployment</Label>
                  <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                    <Input
                      type="date"
                      value={newActivity.scheduled_date}
                      onChange={(e) => setNewActivity({ ...newActivity, scheduled_date: e.target.value })}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="pl-14 py-7 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 text-sm font-bold transition-all"
                      disabled={batches.length === 0}
                    />
                  </div>
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
                  disabled={batches.length === 0 || !newActivity.batch_id}
                >
                  Confirm Mandate
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ActivitiesManagement;
