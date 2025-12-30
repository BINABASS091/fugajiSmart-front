import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { dataService, Batch, Farm } from '../../services/dataService';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Plus,
  Package,
  Warehouse,
  ChevronRight,
  Clock,
  Bird,
  Activity,
  X,
  TrendingUp,
  Fingerprint,
  Calendar,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';

interface BatchWithFarm extends Batch {
  farm: Farm;
}

export function BatchesManagement() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [batches, setBatches] = useState<BatchWithFarm[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBatch, setNewBatch] = useState({
    farm_id: '',
    batch_number: '',
    breed: '',
    quantity: '',
    start_date: '',
  });

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const farmsData = await dataService.getFarms(user.id);
      setFarms(farmsData);
      if (farmsData.length > 0) {
        const batchesData = await dataService.getBatches(undefined, user.id);
        const batchesWithFarms: BatchWithFarm[] = batchesData.map(batch => {
          const farm = farmsData.find(f => f.id === batch.farm_id);
          return {
            ...batch,
            farm: farm || farmsData[0],
          };
        }).sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setBatches(batchesWithFarms);
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

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const startDate = new Date(newBatch.start_date);
      const today = new Date();
      const ageDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      const payload = {
        farm: newBatch.farm_id, // Changed from farm_id to farm
        batch_number: newBatch.batch_number,
        breed: newBatch.breed,
        quantity: parseInt(newBatch.quantity),
        start_date: newBatch.start_date,
        expected_end_date: undefined, // Changed from null to undefined
        status: 'ACTIVE',
        mortality_count: 0,
        current_age_days: ageDays > 0 ? ageDays : 0,
      };

      console.log('Creating batch with payload:', payload);
      console.log('farm value:', payload.farm);
      console.log('farm type:', typeof payload.farm);
      console.log('farm is empty string:', payload.farm === '');
      console.log('farm is null:', payload.farm === null);
      console.log('farm is undefined:', payload.farm === undefined);

      await dataService.createBatch(payload);

      setShowAddModal(false);
      setNewBatch({ farm_id: '', batch_number: '', breed: '', quantity: '', start_date: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding batch:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-pulse">
        <div className="w-16 h-16 border-4 border-emerald-50 border-t-emerald-600 rounded-full animate-spin mb-6"></div>
        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Batch Intelligence Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-gray-100">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Fingerprint className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Biological Tracking</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">
            {t('batches.title')} <span className="text-emerald-600">[{batches.length}]</span>
          </h1>
          <p className="text-gray-500 font-bold text-lg">{t('batches.subtitle')}</p>
        </div>
        {farms.length > 0 && (
          <button
            onClick={() => setShowAddModal(true)}
            className="group flex items-center gap-3 px-8 py-5 bg-emerald-600 text-white rounded-[2rem] shadow-2xl shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-1 transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em]"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
            Deploy New Batch
          </button>
        )}
      </div>

      {farms.length === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center text-center bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/40">
          <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mb-8">
            <AlertCircle className="w-12 h-12 text-rose-500" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-4">Infrastructure Missing</h3>
          <p className="text-gray-400 font-bold max-w-sm mb-10">{t('batches.needFarmFirst')}</p>
          <Link
            to="/farmer/farms"
            className="px-10 py-5 bg-gray-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-gray-200"
          >
            Establish Farm Registry
          </Link>
        </div>
      ) : batches.length === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center text-center bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/40">
          <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-8">
            <Package className="w-12 h-12 text-gray-200" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-4">No Active Pulses</h3>
          <p className="text-gray-400 font-bold max-w-sm mb-10">You have no biological batches currently under management.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-10 py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-emerald-200"
          >
            Deploy Your First Batch
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {batches.map((batch) => (
            <Card
              key={batch.id}
              className="group relative overflow-hidden bg-white rounded-[40px] border border-gray-100 p-8 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:shadow-gray-300/50 transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 bg-emerald-600/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>

              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                    <Package className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase group-hover:text-emerald-600 transition-colors leading-none">{batch.batch_number}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Warehouse className="w-3 h-3 text-gray-400" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{batch.farm.name}</p>
                    </div>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${batch.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-gray-100 text-gray-400'
                    }`}
                >
                  {batch.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Biological Breed</p>
                  <div className="flex items-center gap-2 text-gray-900 mt-2">
                    <Fingerprint className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-black uppercase">{batch.breed}</span>
                  </div>
                </div>
                <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Net Payload</p>
                  <div className="flex items-center gap-2 text-gray-900 mt-2">
                    <Bird className="w-4 h-4 text-blue-500" />
                    <span className="text-lg font-black">{batch.quantity.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8 relative z-10">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Growth Cycle</span>
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{batch.current_age_days} Days Exp.</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((batch.current_age_days / 45) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-5 bg-rose-50/50 rounded-3xl border border-rose-100 mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-rose-500" />
                  <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest">Mortality Log</span>
                </div>
                <span className="text-lg font-black text-rose-700">{batch.mortality_count}</span>
              </div>

              <div className="relative z-10">
                <button className="flex items-center justify-center gap-3 w-full py-5 bg-gray-900 hover:bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-gray-200">
                  Deploy Intelligence
                  <ArrowRight className="w-4 h-4" />
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
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">New Batch</h2>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddBatch} className="p-10 pt-0 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Infrastructure</Label>
                  <select
                    value={newBatch.farm_id}
                    onChange={(e) => setNewBatch({ ...newBatch, farm_id: e.target.value })}
                    required
                    className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 text-sm font-bold transition-all outline-none"
                  >
                    <option value="">Choose Registry</option>
                    {farms.map((farm) => (
                      <option key={farm.id} value={farm.id}>
                        {farm.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ID Code</Label>
                    <Input
                      type="text"
                      value={newBatch.batch_number}
                      onChange={(e) => setNewBatch({ ...newBatch, batch_number: e.target.value })}
                      required
                      placeholder="BATCH-X"
                      className="py-7 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 text-sm font-bold transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Breed Type</Label>
                    <Input
                      type="text"
                      value={newBatch.breed}
                      onChange={(e) => setNewBatch({ ...newBatch, breed: e.target.value })}
                      required
                      placeholder="e.g., Broiler"
                      className="py-7 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 text-sm font-bold transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Initial Payload Count</Label>
                  <div className="relative group">
                    <Bird className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    <Input
                      type="number"
                      value={newBatch.quantity}
                      onChange={(e) => setNewBatch({ ...newBatch, quantity: e.target.value })}
                      required
                      min="1"
                      placeholder="0"
                      className="pl-14 py-7 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 text-lg font-bold transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Deployment Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                    <Input
                      type="date"
                      value={newBatch.start_date}
                      onChange={(e) => setNewBatch({ ...newBatch, start_date: e.target.value })}
                      required
                      className="pl-14 py-7 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 text-sm font-bold transition-all"
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
                  className="flex-[2] py-7 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 transition-all hover:-translate-y-1 active:scale-95"
                >
                  Confirm Deployment
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default BatchesManagement;
