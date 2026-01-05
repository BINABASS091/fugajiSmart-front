import { useEffect, useState, useCallback, useMemo } from 'react';
import { dataService } from '../../services/dataService';
import { mockDataService } from '../../services/mockData';
import { StatCard } from '../../components/StatCard';
import { Card } from '../../components/ui/card';
import { useCurrency } from '../../contexts/CurrencyContext';
import {
  Users,
  UserCheck,
  Warehouse,
  Package,
  Radio,
  AlertTriangle,
  Activity,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  Zap,
  Globe,
  Cpu,
  ArrowUpRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface RecentActivity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  user?: string;
  status?: 'success' | 'warning' | 'info';
}

export function AdminDashboard() {
  const { formatCurrency } = useCurrency();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFarmers: 0,
    verifiedFarmers: 0,
    pendingFarmers: 0,
    totalFarms: 0,
    activeFarms: 0,
    totalBatches: 0,
    activeBatches: 0,
    totalDevices: 0,
    activeDevices: 0,
    offlineDevices: 0,
    criticalAlerts: 0,
    unreadAlerts: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [farms, batches, devices, alerts, subscriptions] = await Promise.all([
        dataService.getFarms(),
        dataService.getBatches(),
        dataService.getDevices(),
        dataService.getAlerts(),
        dataService.getSubscriptions(),
      ]);

      const users = mockDataService.getUsers();
      const farmers = users.filter(u => u.role === 'FARMER');

      setStats({
        totalUsers: users.length,
        totalFarmers: farmers.length,
        verifiedFarmers: farmers.length,
        pendingFarmers: 0,
        totalFarms: farms.length,
        activeFarms: farms.filter(f => f.status === 'ACTIVE').length,
        totalBatches: batches.length,
        activeBatches: batches.filter(b => b.status === 'ACTIVE').length,
        totalDevices: devices.length,
        activeDevices: devices.filter(d => d.status === 'ONLINE').length,
        offlineDevices: devices.filter(d => d.status === 'OFFLINE').length,
        criticalAlerts: alerts.filter(a => a.severity === 'CRITICAL' && !a.is_read).length,
        unreadAlerts: alerts.filter(a => !a.is_read).length,
        totalSubscriptions: subscriptions.length,
        activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
      });

      const activities: RecentActivity[] = farmers
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 8)
        .map((user) => ({
          id: user.id,
          type: 'farmer_signup',
          message: `${user.full_name} established a new operator identity`,
          timestamp: user.created_at,
          user: user.full_name,
          status: 'success'
        }));

      setRecentActivities(activities);
    } catch (error) {
      console.error('Data acquisition error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatTimeAgo = (timestamp: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-pulse">
        <div className="w-16 h-16 border-4 border-gray-50 border-t-gray-900 rounded-full animate-spin mb-6"></div>
        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Loading system data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 max-w-[1600px] mx-auto">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-gray-100">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-900 text-white rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Admin Dashboard</span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
            System <span className="text-gray-400">Overview</span>
          </h1>
          <p className="text-gray-500 font-bold text-lg leading-relaxed">Monitor all system activity and performance.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-5 py-3 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest">System Connected</span>
          </div>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', val: stats.totalUsers, sub: `${stats.verifiedFarmers} Verified`, icon: Users, color: 'blue' },
          { label: 'Active Farms', val: stats.activeFarms, sub: `Across ${stats.totalFarms} locations`, icon: Warehouse, color: 'indigo' },
          { label: 'Monthly Income', val: formatCurrency(stats.activeSubscriptions * 35), sub: 'Monthly Recurring', icon: DollarSign, color: 'emerald' },
          { label: 'Critical Alerts', val: stats.criticalAlerts, sub: 'Needs Attention', icon: AlertTriangle, color: stats.criticalAlerts > 0 ? 'rose' : 'gray' },
        ].map((stat, i) => (
          <Card key={i} className="p-8 bg-white border border-gray-100 rounded-[40px] shadow-xl shadow-gray-200/40 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-${stat.color}-50 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-4 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl group-hover:rotate-3 transition-transform`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                {i === 2 && <ArrowUpRight className="w-5 h-5 text-emerald-400" />}
              </div>
              <h3 className="text-4xl font-black text-gray-900 tracking-tight">{stat.val}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">{stat.label}</p>
              <p className="text-[11px] font-bold text-gray-500 mt-1">{stat.sub}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Resource Allocation Grid */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
              System Status
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Data Updated
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <StatCard title="Active Batches" value={stats.activeBatches} icon={Package} color="blue" />
            <StatCard title="Connected Devices" value={stats.activeDevices} icon={Radio} color="emerald" />
            <StatCard title="Offline Devices" value={stats.offlineDevices} icon={Radio} color="rose" />
            <StatCard title="Active Subscriptions" value={stats.activeSubscriptions} icon={DollarSign} color="indigo" />
          </div>

          <Card className="bg-white border border-gray-100 rounded-[40px] shadow-xl shadow-gray-200/40 p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-gray-900 uppercase">System Health</h3>
              <Clock className="w-5 h-5 text-gray-300" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Database', status: 'Healthy', icon: Globe, color: 'emerald' },
                { label: 'API Server', status: 'Operational', icon: Cpu, color: 'blue' },
                { label: 'Device Network', status: 'Optimal', icon: Zap, color: 'amber' },
              ].map((svc, i) => (
                <div key={i} className="p-6 bg-gray-50 rounded-3xl space-y-4">
                  <div className={`p-3 bg-${svc.color}-50 text-${svc.color}-600 inline-block rounded-xl`}>
                    <svc.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{svc.label}</h4>
                    <p className={`text-lg font-black text-${svc.color}-600 uppercase tracking-tighter`}>{svc.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Activity Intelligence */}
        <div className="space-y-8">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight px-2">Recent Activity</h2>
          <Card className="bg-white border border-gray-100 rounded-[40px] shadow-xl shadow-gray-200/40 p-8 space-y-6">
            {recentActivities.length === 0 ? (
              <div className="py-20 text-center text-gray-300 font-bold uppercase text-[10px] tracking-widest">No recent activity</div>
            ) : (
              <div className="space-y-6">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 transition-all hover:translate-x-1 group">
                    <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-gray-900 uppercase tracking-tight leading-tight">{activity.message}</p>
                      <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{formatTimeAgo(activity.timestamp)} • Updated</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-200" />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Quick Links</h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                { to: '/admin/farmers', label: 'User Management', color: 'blue' },
                { to: '/admin/subscriptions', label: 'Subscription Management', color: 'emerald' },
                { to: '/admin/breeds', label: 'Breed Settings', color: 'amber' },
                { to: '/admin/settings', label: 'System Settings', color: 'indigo' },
              ].map((lnk, i) => (
                <Link key={i} to={lnk.to} className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">{lnk.label}</span>
                  <div className={`p-2 bg-${lnk.color}-50 text-${lnk.color}-600 rounded-lg group-hover:scale-110 transition-transform`}>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
