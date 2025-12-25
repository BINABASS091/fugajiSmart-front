import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dataService } from '../../services/dataService';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useConfirm } from '../../hooks/useConfirm';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Package,
  Plus,
  Activity,
  Radio,
  Edit3,
  Trash2,
  CheckCircle,
  Warehouse,
  ChevronRight,
  Clock,
  Zap,
  Cpu,
  ShieldCheck,
  X
} from 'lucide-react';
import type { Farm, Batch, Activity as ActivityType, Device } from '../../services/mockData';
import { format } from 'date-fns';

interface FarmActivity extends ActivityType {
  batch: {
    batch_number: string;
  };
}

export function FarmDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { confirm, ConfirmDialog } = useConfirm();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [activities, setActivities] = useState<FarmActivity[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);

  const [newBatch, setNewBatch] = useState({
    batch_number: '',
    breed: '',
    quantity: '',
    start_date: '',
  });

  const [newActivity, setNewActivity] = useState({
    batch_id: '',
    activity_type: 'FEEDING' as ActivityType['activity_type'],
    description: '',
    scheduled_date: '',
  });

  const [newDevice, setNewDevice] = useState({
    device_code: '',
    device_type: 'SENSOR' as Device['device_type'],
  });

  const fetchFarmDetails = useCallback(async () => {
    if (!user || !id) return;
    try {
      const farmData = await dataService.getFarmById(id);
      if (!farmData || farmData.farmer_id !== user.id) {
        setLoading(false);
        return;
      }
      const [batchesData, devicesData, activitiesData] = await Promise.all([
        dataService.getBatches(id, user.id),
        dataService.getDevices(id),
        dataService.getActivities(user.id),
      ]);
      setFarm(farmData);
      setBatches(batchesData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      setDevices(devicesData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      const batchIds = batchesData.map(b => b.id);
      const enrichedActivities: FarmActivity[] = activitiesData
        .filter(a => batchIds.includes(a.batch_id))
        .map(activity => {
          const batch = batchesData.find(b => b.id === activity.batch_id);
          return {
            ...activity,
            batch: batch ? { batch_number: batch.batch_number } : { batch_number: 'Unknown' },
          };
        })
        .sort((a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime());
      setActivities(enrichedActivities);
    } catch (error) {
      console.error('Error fetching farm details:', error);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchFarmDetails();
  }, [fetchFarmDetails]);

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!id) return;
      await dataService.createBatch({
        farm_id: id,
        batch_number: newBatch.batch_number,
        breed: newBatch.breed,
        quantity: parseInt(newBatch.quantity),
        start_date: newBatch.start_date,
        expected_end_date: null,
        status: 'ACTIVE',
        mortality_count: 0,
        current_age_days: 0,
      });
      setShowBatchModal(false);
      setNewBatch({ batch_number: '', breed: '', quantity: '', start_date: '' });
      fetchFarmDetails();
    } catch (error) {
      console.error('Error adding batch:', error);
    }
  };

  const handleUpdateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch) return;
    try {
      await dataService.updateBatch(editingBatch.id, {
        batch_number: editingBatch.batch_number,
        breed: editingBatch.breed,
        quantity: editingBatch.quantity,
      });
      setShowBatchModal(false);
      setEditingBatch(null);
      fetchFarmDetails();
    } catch (error) {
      console.error('Error updating batch:', error);
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    const confirmed = await confirm({
      title: 'Decommission Batch',
      message: 'This operation will archive the current batch logic. Proceed?',
      variant: 'danger',
      confirmText: 'Confirm Archive',
      cancelText: 'Abort'
    });
    if (!confirmed) return;
    try {
      await dataService.updateBatch(batchId, { status: 'CLOSED' });
      fetchFarmDetails();
    } catch (error) {
      console.error('Error deleting batch:', error);
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!user) return;
      await dataService.createActivity({
        farmer_id: user.id,
        batch_id: newActivity.batch_id,
        activity_type: newActivity.activity_type,
        description: newActivity.description || null,
        scheduled_date: newActivity.scheduled_date,
        status: 'PENDING',
        completed_at: null,
      });
      setShowActivityModal(false);
      setNewActivity({ batch_id: '', activity_type: 'FEEDING', description: '', scheduled_date: '' });
      fetchFarmDetails();
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!id) return;
      await dataService.createDevice({
        farm_id: id,
        device_code: newDevice.device_code,
        device_type: newDevice.device_type,
        status: 'OFFLINE',
        last_reading_at: null,
      });
      setShowDeviceModal(false);
      setNewDevice({ device_code: '', device_type: 'SENSOR' });
      fetchFarmDetails();
    } catch (error) {
      console.error('Error adding device:', error);
    }
  };

  const markActivityCompleted = async (activityId: string) => {
    try {
      await dataService.updateActivity(activityId, {
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
      });
      fetchFarmDetails();
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-pulse">
        <div className="w-16 h-16 border-4 border-emerald-50 border-t-emerald-600 rounded-full animate-spin mb-6"></div>
        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Unit Data Aggregating...</p>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="text-center py-32 space-y-6">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
          <Warehouse className="w-10 h-10 text-gray-200" />
        </div>
        <h3 className="text-2xl font-black text-gray-900 uppercase">Unit Not Found</h3>
        <Link
          to="/farmer/farms"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Center
        </Link>
      </div>
    );
  }

  const stats = {
    totalBatches: batches.length,
    activeBatches: batches.filter(b => b.status === 'ACTIVE').length,
    totalBirds: batches.reduce((sum, b) => sum + (b.quantity - b.mortality_count), 0),
    pendingActivities: activities.filter(a => a.status === 'PENDING').length,
    onlineDevices: devices.filter(d => d.status === 'ONLINE').length,
  };

  return (
    <div className="space-y-10 pb-20">
      <ConfirmDialog />

      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-4 border-b border-gray-100">
        <div className="space-y-2">
          <Link
            to="/farmer/farms"
            className="flex items-center gap-2 group text-gray-400 hover:text-emerald-600 transition-colors font-black text-[10px] uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Unit Management
          </Link>
          <div className="flex items-center gap-4 mt-4">
            <div className="p-4 bg-emerald-600 text-white rounded-[2rem] shadow-2xl shadow-emerald-200">
              <Warehouse className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">
                  {farm.name}
                </h1>
                <span className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-lg ${farm.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'
                  }`}>
                  UNIT {farm.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-6 mt-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  {farm.location}
                </div>
                {farm.size_hectares && (
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-amber-500" />
                    {farm.size_hectares} Hectares
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-rose-500" />
                  Active Since {format(new Date(farm.created_at), 'MMM yyyy')}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-5 bg-white border border-gray-100 rounded-[1.5rem] text-gray-400 hover:text-blue-600 hover:bg-gray-50 transition-all shadow-sm">
            <Edit3 className="w-5 h-5" />
          </button>
          <button className="p-5 bg-white border border-gray-100 rounded-[1.5rem] text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all shadow-sm">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Cycles', val: stats.totalBatches, color: 'blue', icon: Package },
          { label: 'Live Batches', val: stats.activeBatches, color: 'emerald', icon: Zap },
          { label: 'Bird Capacity', val: stats.totalBirds, color: 'indigo', icon: Activity },
          { label: 'Task Backlog', val: stats.pendingActivities, color: 'amber', icon: Clock },
          { label: 'IOT Online', val: stats.onlineDevices, color: 'rose', icon: Radio },
        ].map((stat, i) => (
          <Card key={i} className={`p-6 bg-white border border-gray-100 rounded-[32px] shadow-lg shadow-gray-200/40 relative overflow-hidden group`}>
            <div className={`absolute top-0 right-0 w-16 h-16 -mr-4 -mt-4 bg-${stat.color}-50 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
            <div className="relative z-10 space-y-2">
              <p className={`text-[8px] font-black uppercase tracking-widest text-gray-400`}>{stat.label}</p>
              <h4 className={`text-2xl font-black text-gray-900`}>{stat.val}</h4>
              <stat.icon className={`w-4 h-4 text-${stat.color}-500`} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Batches Cluster */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
              <Package className="w-6 h-6 text-indigo-600" />
              Genetic Sequences
            </h2>
            <button
              onClick={() => { setEditingBatch(null); setShowBatchModal(true); }}
              className="px-6 py-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Deploy
            </button>
          </div>

          <Card className="bg-white border border-gray-100 rounded-[40px] shadow-xl shadow-gray-200/40 p-8 space-y-4">
            {batches.length === 0 ? (
              <div className="py-12 text-center space-y-4">
                <Package className="w-12 h-12 mx-auto text-gray-100" />
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No active sequences detected</p>
              </div>
            ) : (
              batches.map((batch) => (
                <div key={batch.id} className="group p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[8px] font-black tracking-widest uppercase">
                          ID: {batch.batch_number}
                        </div>
                        <span className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-lg ${batch.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'
                          }`}>
                          {batch.status}
                        </span>
                      </div>
                      <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight -mt-1 group-hover:text-indigo-600 transition-colors">
                        {batch.breed} Protocol
                      </h4>
                      <div className="flex items-center gap-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <span className="flex items-center gap-2"><Activity className="w-3.5 h-3.5" /> {batch.quantity - batch.mortality_count} Unites</span>
                        <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> D+{batch.current_age_days}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => { setEditingBatch(batch); setShowBatchModal(true); }}
                        className="p-3 bg-white text-gray-400 hover:text-indigo-600 rounded-xl shadow-sm border border-gray-50 transition-all hover:-translate-y-1"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBatch(batch.id)}
                        className="p-3 bg-white text-gray-400 hover:text-rose-600 rounded-xl shadow-sm border border-gray-50 transition-all hover:-translate-y-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>

        {/* Activities Stream */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
              <Zap className="w-6 h-6 text-amber-500" />
              Action Stream
            </h2>
            {batches.length > 0 && (
              <button
                onClick={() => setShowActivityModal(true)}
                className="px-6 py-4 bg-amber-500 text-white rounded-2xl hover:bg-amber-600 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Mandate
              </button>
            )}
          </div>

          <Card className="bg-white border border-gray-100 rounded-[40px] shadow-xl shadow-gray-200/40 p-8 space-y-4">
            {activities.length === 0 ? (
              <div className="py-12 text-center space-y-4">
                <Zap className="w-12 h-12 mx-auto text-gray-100" />
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No scheduled operations</p>
              </div>
            ) : (
              activities.slice(0, 6).map((activity) => (
                <div key={activity.id} className="p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-amber-100 transition-all group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 text-[8px] font-black tracking-widest uppercase bg-amber-100 text-amber-600 rounded-lg">
                          {activity.activity_type}
                        </span>
                        <span className={`px-2 py-0.5 text-[8px] font-black tracking-widest uppercase rounded-lg ${activity.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'
                          }`}>
                          {activity.status}
                        </span>
                      </div>
                      <h5 className="text-sm font-black text-gray-900 uppercase tracking-tight">{activity.description || 'General Operation'}</h5>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Sequence: {activity.batch.batch_number} • T+{format(new Date(activity.scheduled_date), 'dd/MM/yy')}
                      </p>
                    </div>
                    {activity.status === 'PENDING' && (
                      <button
                        onClick={() => markActivityCompleted(activity.id)}
                        className="p-3 bg-white text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl shadow-sm border border-emerald-100 transition-all active:scale-95"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
            {activities.length > 6 && (
              <Link to="/farmer/activities" className="flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase text-gray-400 hover:text-indigo-600 transition-colors">
                View Comprehensive Stream
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </Card>
        </div>
      </div>

      {/* IoT Infrastructure */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
            <Radio className="w-6 h-6 text-blue-600" />
            IOT Infrastructure
          </h2>
          <button
            onClick={() => setShowDeviceModal(true)}
            className="px-6 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Initialize Node
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {devices.length === 0 ? (
            <div className="col-span-full py-20 bg-white border border-gray-100 rounded-[40px] text-center space-y-4">
              <Radio className="w-12 h-12 mx-auto text-gray-100" />
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No hardware nodes detected</p>
            </div>
          ) : (
            devices.map((device) => (
              <Card key={device.id} className="p-8 bg-white border border-gray-100 rounded-[40px] shadow-lg shadow-gray-200/40 relative overflow-hidden group hover:shadow-2xl transition-all">
                <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-gray-50 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-gray-900 text-white rounded-lg text-[8px] font-black tracking-widest uppercase">
                      NODE {device.device_code}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${device.status === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`}></div>
                      <span className={`text-[8px] font-black uppercase tracking-widest ${device.status === 'ONLINE' ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {device.status}
                      </span>
                    </div>
                  </div>
                  <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight">{device.device_type}</h4>
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pt-2 border-t border-gray-50">
                    <Clock className="w-3 h-3" />
                    {device.last_reading_at ? format(new Date(device.last_reading_at), 'HH:mm • dd/MM') : 'Standby'}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Modals - Simplified for the overhaul theme */}
      {showBatchModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <Card className="w-full max-w-md bg-white rounded-[40px] overflow-hidden shadow-2xl animate-scaleIn border-none">
            <div className="p-10 pb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
                  {editingBatch ? 'Modify Data' : 'New Sequence'}
                </h2>
              </div>
              <button onClick={() => setShowBatchModal(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={editingBatch ? handleUpdateBatch : handleAddBatch} className="p-10 pt-0 space-y-8">
              <div className="space-y-6">
                <div>
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sequence Identifier</Label>
                  <Input
                    value={editingBatch ? editingBatch.batch_number : newBatch.batch_number}
                    onChange={(e) => editingBatch ? setEditingBatch({ ...editingBatch, batch_number: e.target.value }) : setNewBatch({ ...newBatch, batch_number: e.target.value })}
                    required
                    className="py-7 mt-2 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold"
                  />
                </div>
                <div>
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Genetic Breed</Label>
                  <Input
                    value={editingBatch ? editingBatch.breed : newBatch.breed}
                    onChange={(e) => editingBatch ? setEditingBatch({ ...editingBatch, breed: e.target.value }) : setNewBatch({ ...newBatch, breed: e.target.value })}
                    required
                    className="py-7 mt-2 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quantity</Label>
                    <Input
                      type="number"
                      value={editingBatch ? editingBatch.quantity : newBatch.quantity}
                      onChange={(e) => editingBatch ? setEditingBatch({ ...editingBatch, quantity: parseInt(e.target.value) }) : setNewBatch({ ...newBatch, quantity: e.target.value })}
                      required
                      className="py-7 mt-2 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold"
                    />
                  </div>
                  {!editingBatch && (
                    <div>
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Deploy Date</Label>
                      <Input
                        type="date"
                        value={newBatch.start_date}
                        onChange={(e) => setNewBatch({ ...newBatch, start_date: e.target.value })}
                        required
                        className="py-7 mt-2 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="submit" className="w-full py-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 transition-all hover:-translate-y-1">
                  {editingBatch ? 'Commit Update' : 'Initialize Sequence'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {showActivityModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <Card className="w-full max-w-md bg-white rounded-[40px] overflow-hidden shadow-2xl animate-scaleIn border-none">
            <div className="p-10 pb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-100">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">New Mandate</h2>
              </div>
              <button onClick={() => setShowActivityModal(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddActivity} className="p-10 pt-0 space-y-8">
              <div className="space-y-6">
                <div>
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Component</Label>
                  <select
                    value={newActivity.batch_id}
                    onChange={(e) => setNewActivity({ ...newActivity, batch_id: e.target.value })}
                    required
                    className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-amber-500/10 text-sm font-bold transition-all outline-none mt-2"
                  >
                    <option value="">Select Local Batch</option>
                    {batches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.batch_number} ({batch.breed})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Action Type</Label>
                  <select
                    value={newActivity.activity_type}
                    onChange={(e) => setNewActivity({ ...newActivity, activity_type: e.target.value as any })}
                    required
                    className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-amber-500/10 text-sm font-bold transition-all outline-none mt-2 uppercase tracking-widest text-[10px]"
                  >
                    <option value="FEEDING">Feeding Sequence</option>
                    <option value="VACCINATION">Vaccination Protocol</option>
                    <option value="CLEANING">Sanitization</option>
                    <option value="INSPECTION">Inspection</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mission Specs</Label>
                  <Input
                    value={newActivity.description}
                    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                    placeholder="Optional details..."
                    className="py-7 mt-2 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-amber-500/10 text-sm font-bold"
                  />
                </div>
                <div>
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Execution Date</Label>
                  <Input
                    type="date"
                    value={newActivity.scheduled_date}
                    onChange={(e) => setNewActivity({ ...newActivity, scheduled_date: e.target.value })}
                    required
                    className="py-7 mt-2 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-amber-500/10 text-sm font-bold"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="submit" className="w-full py-8 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-amber-100 transition-all hover:-translate-y-1">
                  Confirm Mandate
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {showDeviceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <Card className="w-full max-w-md bg-white rounded-[40px] overflow-hidden shadow-2xl animate-scaleIn border-none">
            <div className="p-10 pb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <Radio className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">New Hardware</h2>
              </div>
              <button onClick={() => setShowDeviceModal(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddDevice} className="p-10 pt-0 space-y-8">
              <div className="space-y-6">
                <div>
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Device Matrix Code</Label>
                  <Input
                    value={newDevice.device_code}
                    onChange={(e) => setNewDevice({ ...newDevice, device_code: e.target.value })}
                    placeholder="e.g., SENSOR-ALPHA-01"
                    required
                    className="py-7 mt-2 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 text-sm font-bold"
                  />
                </div>
                <div>
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Logic Pattern</Label>
                  <select
                    value={newDevice.device_type}
                    onChange={(e) => setNewDevice({ ...newDevice, device_type: e.target.value as any })}
                    required
                    className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 text-sm font-bold transition-all outline-none mt-2"
                  >
                    <option value="SENSOR">Sensor Node</option>
                    <option value="FEEDER">Automated Feeder</option>
                    <option value="WATER">Hydration System</option>
                    <option value="CAMERA">Vision Unit</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="submit" className="w-full py-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-200 transition-all hover:-translate-y-1">
                  Register Node
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default FarmDetail;
