import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { dataService, Alert } from '../../services/dataService';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { StatCard } from '../../components/StatCard';
import SubscriptionSummary from '../../components/SubscriptionSummary';
import {
  Warehouse,
  Package,
  AlertTriangle,
  Activity,
  TrendingUp,
  Radio,
  ChevronRight,
  Calendar,
  Zap,
  ArrowRight,
  ShieldCheck,
  Clock,
  Bird,
  Bell
} from 'lucide-react';
import { format } from 'date-fns';

export function FarmerDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalFarms: 0,
    activeFarms: 0,
    totalBatches: 0,
    activeBatches: 0,
    totalBirds: 0,
    totalDevices: 0,
    onlineDevices: 0,
    unreadAlerts: 0,
    criticalAlerts: 0,
    pendingActivities: 0,
    monthlyPredictions: 0,
  });
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [recentBatches, setRecentBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      if (!user) return;

      const farmsData = await dataService.getFarms(user.id);
      const farmIds = farmsData.map(f => f.id);
      const activeFarmsCount = farmsData.filter(f => f.status === 'ACTIVE').length;

      const batchesData = await dataService.getBatches(undefined, user.id);
      const totalBirds = batchesData.reduce((sum, b) => sum + (b.quantity - b.mortality_count), 0);

      const devicesData: any[] = [];
      for (const farmId of farmIds) {
        const farmDevices = await dataService.getDevices(farmId);
        devicesData.push(...farmDevices);
      }

      const allAlerts = await dataService.getAlerts(user.id);
      const unreadAlerts = allAlerts.filter(a => !a.is_read);
      const criticalAlerts = unreadAlerts.filter(a => a.severity === 'CRITICAL');
      const recentAlertsData = allAlerts
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      const allActivities = await dataService.getActivities(user.id);
      const pendingActivities = allActivities.filter(a => a.status === 'PENDING');

      const recentBatchesData = batchesData
        .map(batch => {
          const farm = farmsData.find(f => f.id === batch.farm);
          return {
            ...batch,
            farm: farm ? { name: farm.name } : null,
          };
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3);

      setStats({
        totalFarms: farmsData.length,
        activeFarms: activeFarmsCount,
        totalBatches: batchesData.length,
        activeBatches: batchesData.filter(b => b.status === 'ACTIVE').length,
        totalBirds: totalBirds,
        totalDevices: devicesData.length,
        onlineDevices: devicesData.filter(d => d.status === 'ONLINE').length,
        unreadAlerts: unreadAlerts.length,
        criticalAlerts: criticalAlerts.length,
        pendingActivities: pendingActivities.length,
        monthlyPredictions: 0,
      });

      setRecentAlerts(recentAlertsData);
      setRecentBatches(recentBatchesData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-pulse">
        <div className="w-16 h-16 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin mb-6"></div>
        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Synchronizing Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg">{t('dashboard.operational_live')}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
            {t('dashboard.welcome')}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{user?.first_name || user?.email?.split('@')[0] || 'Farmer'}</span>
          </h1>
          <p className="text-gray-500 font-bold text-lg max-w-2xl">{t('dashboard.welcomeMessage')}</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all font-black text-[10px] uppercase tracking-widest text-gray-600">
            <Calendar className="w-4 h-4 text-blue-500" />
            {format(new Date(), 'MMMM d, yyyy')}
          </button>
          <Link to="/farmer/activities" className="flex items-center gap-2 px-6 py-4 bg-gray-900 text-white rounded-2xl shadow-lg shadow-gray-200 hover:-translate-y-1 transition-all font-black text-[10px] uppercase tracking-widest">
            {t('dashboard.action_center')}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative group overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] p-8 text-white shadow-2xl shadow-blue-200 hover:scale-[1.02] transition-all duration-500">
          <div className="absolute top-0 right-0 w-64 h-64 -mr-16 -mt-16 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between mb-8">
              <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-md">
                <Warehouse className="w-8 h-8" />
              </div>
              <div className="px-4 py-1.5 bg-white/20 rounded-full backdrop-blur-md text-[10px] font-black tracking-widest uppercase">
                {stats.activeFarms} {t('dashboard.active')}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">{t('dashboard.activeFarms')}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black">{stats.totalFarms}</span>
                <span className="text-lg font-bold opacity-60">{t('dashboard.farms_total')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative group overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-700 rounded-[40px] p-8 text-white shadow-2xl shadow-emerald-200 hover:scale-[1.02] transition-all duration-500">
          <div className="absolute top-0 right-0 w-64 h-64 -mr-16 -mt-16 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between mb-8">
              <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-md">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div className="px-4 py-1.5 bg-white/20 rounded-full backdrop-blur-md text-[10px] font-black tracking-widest uppercase">
                {stats.activeBatches} Batches
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">{t('dashboard.totalBirds')}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black">{stats.totalBirds.toLocaleString()}</span>
                <span className="text-lg font-bold opacity-60">{t('dashboard.birds_tracking')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative group overflow-hidden bg-gradient-to-br from-rose-500 to-orange-600 rounded-[40px] p-8 text-white shadow-2xl shadow-rose-200 hover:scale-[1.02] transition-all duration-500">
          <div className="absolute top-0 right-0 w-64 h-64 -mr-16 -mt-16 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between mb-8">
              <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-md">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="px-4 py-1.5 bg-white/20 rounded-full backdrop-blur-md text-[10px] font-black tracking-widest uppercase">
                {t('dashboard.action_required')}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">{t('dashboard.alerts')}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black">{stats.criticalAlerts}</span>
                <span className="text-lg font-bold opacity-60">{t('dashboard.critical_alerts')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('dashboard.totalBatches')}
          value={stats.totalBatches}
          icon={Package}
          color="blue"
        />
        <StatCard
          title={t('dashboard.onlineDevices')}
          value={stats.onlineDevices}
          icon={Radio}
          color="green"
        />
        <StatCard
          title={t('dashboard.pendingActivities')}
          value={stats.pendingActivities}
          icon={Activity}
          color="orange"
        />
        <StatCard
          title={t('dashboard.totalDevices')}
          value={stats.totalDevices}
          icon={Radio}
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Batches Section */}
          <div className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-xl shadow-gray-200/40">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">{t('dashboard.recentBatches')}</h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{t('dashboard.operational_pulse')}</p>
              </div>
              <Link to="/farmer/batches" className="flex items-center gap-2 group text-blue-600 font-black text-[10px] uppercase tracking-widest">
                {t('dashboard.viewAll')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {recentBatches.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center bg-gray-50/50 rounded-[32px] border-2 border-dashed border-gray-100">
                <Package className="w-16 h-16 text-gray-200 mb-4" />
                <h3 className="text-xl font-bold text-gray-900">{t('dashboard.noBatchesYet')}</h3>
                <Link to="/farmer/batches" className="mt-4 px-6 py-3 bg-white border border-gray-200 text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:shadow-md transition-all">
                  {t('dashboard.addFirstBatch')}
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBatches.map((batch: any) => (
                  <div key={batch.id} className="group relative overflow-hidden bg-gray-50/50 hover:bg-white rounded-[32px] p-6 border border-transparent hover:border-gray-100 hover:shadow-xl hover:shadow-gray-200/30 transition-all duration-300">
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-5">
                        <div className="p-4 bg-white rounded-2xl shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
                          <Package className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-lg font-black text-gray-900 uppercase tracking-tight">{batch.batch_number}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Warehouse className="w-3 h-3 text-gray-400" />
                            <p className="text-xs font-bold text-gray-500">{batch.farm?.name}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2 mb-1">
                          <Bird className="w-4 h-4 text-emerald-500" />
                          <p className="text-lg font-black text-gray-900">{batch.quantity.toLocaleString()}</p>
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{batch.breed}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Security & Health Banner */}
          <div className="p-8 bg-gray-900 rounded-[40px] text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 -mr-16 -mt-16 bg-blue-600/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-xl ring-8 ring-white/5">
                <ShieldCheck className="w-10 h-10 text-emerald-400" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-black tracking-tight mb-2 uppercase">{t('dashboard.health_shield')}</h3>
                <p className="text-gray-400 font-medium leading-relaxed">{t('dashboard.health_shield_desc')}</p>
              </div>
              <Link to="/disease-prediction" className="px-8 py-5 bg-blue-600 hover:bg-blue-700 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-900/40 transition-all hover:scale-105">
                {t('dashboard.launch_analysis')}
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <SubscriptionSummary
            totalBirds={stats.totalBirds}
            totalBatches={stats.activeBatches}
            monthlyPredictions={stats.monthlyPredictions}
          />

          {/* Recent Alerts Feed */}
          {recentAlerts.length > 0 && (
            <div className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-xl shadow-gray-200/40">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">{t('dashboard.system_alerts')}</h2>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 tracking-widest">{stats.unreadAlerts} {t('dashboard.actionable_items')}</p>
                </div>
                <Link to="/farmer/alerts" className="p-3 bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all">
                  <Bell className="w-5 h-5" />
                </Link>
              </div>

              <div className="space-y-4">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`group p-5 rounded-3xl border-l-8 transition-all hover:-translate-x-1 ${alert.severity === 'CRITICAL'
                      ? 'bg-rose-50/50 border-rose-500'
                      : alert.severity === 'HIGH'
                        ? 'bg-amber-50/50 border-amber-500'
                        : 'bg-blue-50/50 border-blue-500'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-lg ${alert.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' :
                        alert.severity === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {alert.severity}
                      </span>
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px] font-black">{format(new Date(alert.created_at), 'HH:mm')}</span>
                      </div>
                    </div>
                    <p className="text-xs font-black text-gray-700 leading-normal uppercase tracking-tight">{alert.message}</p>
                  </div>
                ))}
              </div>

              <Link to="/farmer/alerts" className="mt-8 flex items-center justify-center gap-3 w-full py-5 border-2 border-gray-50 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-all">
                {t('dashboard.archive_access')}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Pro Tip Module */}
          <div className="p-8 bg-blue-50 rounded-[40px] border border-blue-100 flex items-start gap-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{t('dashboard.intelligence_pulse')}</h4>
              <p className="text-sm font-bold text-gray-600 leading-snug">{t('dashboard.mortality_tip')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FarmerDashboard;
