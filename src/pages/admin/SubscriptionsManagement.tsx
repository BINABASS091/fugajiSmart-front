import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  DollarSign,
  Search,
  RefreshCw,
  Users,
  Crown,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Clock,
  ChevronRight,
  Filter,
  Activity,
  CreditCard,
  Target
} from 'lucide-react';
import { subscriptionsApi, farmersApi } from '../../lib/api';
import { Card } from '../../components/ui/card';

interface FarmerSubscription {
  farmer_id: string;
  farmer_name: string;
  farmer_email: string;
  current_plan: string;
  current_status: string;
  subscription_start: string | null;
  subscription_end: string | null;
  amount_paid: number;
  last_updated: string;
  has_active_subscription: boolean;
}

export function SubscriptionsManagement() {
  const [farmerSubscriptions, setFarmerSubscriptions] = useState<FarmerSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [planFilter, setPlanFilter] = useState('ALL');

  const fetchAllFarmerSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const { data: farmers, error: farmersError } = await farmersApi.getAll();
      if (farmersError) throw farmersError;
      const farmerList = Array.isArray(farmers) ? farmers : [];

      const { data: subs, error: subsError } = await subscriptionsApi.getAll();
      if (subsError) throw subsError;
      const subsList = Array.isArray(subs) ? subs : [];

      const list: FarmerSubscription[] = farmerList.map((farmer: any) => {
        const farmerSubs = subsList.filter((s: any) => s.farmer_id === farmer.id);
        const latest = farmerSubs.sort(
          (a: any, b: any) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime()
        )[0] || null;

        let current_plan = 'FREE';
        let current_status = 'ACTIVE';
        let has_active_subscription = false;

        if (latest) {
          const now = Date.now();
          const endOk = latest.end_date ? new Date(latest.end_date).getTime() > now : true;
          if (latest.status === 'ACTIVE' && endOk) {
            current_plan = latest.plan_type;
            current_status = 'ACTIVE';
            has_active_subscription = true;
          } else if (latest.status === 'EXPIRED' || !endOk) {
            current_plan = 'FREE';
            current_status = 'EXPIRED';
          } else {
            current_plan = latest.plan_type;
            current_status = latest.status;
            has_active_subscription = latest.status === 'ACTIVE';
          }
        }

        return {
          farmer_id: farmer.id,
          farmer_name: farmer.user?.full_name || 'Unknown',
          farmer_email: farmer.user?.email || 'Unknown',
          current_plan,
          current_status,
          subscription_start: latest?.start_date || null,
          subscription_end: latest?.end_date || null,
          amount_paid: latest?.amount || 0,
          last_updated: latest?.updated_at || farmer.user?.created_at || new Date().toISOString(),
          has_active_subscription,
        };
      });

      setFarmerSubscriptions(list);
    } catch (e) {
      console.error('Error fetching farmer subscriptions:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllFarmerSubscriptions();
  }, [fetchAllFarmerSubscriptions]);

  const filtered = useMemo(() => farmerSubscriptions.filter((f) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      f.farmer_name.toLowerCase().includes(search) || f.farmer_email.toLowerCase().includes(search);
    const matchesStatus = statusFilter === 'ALL' || f.current_status === statusFilter;
    const matchesPlan = planFilter === 'ALL' || f.current_plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  }), [farmerSubscriptions, searchTerm, statusFilter, planFilter]);

  const getPlanStyles = (plan: string) => {
    switch (plan) {
      case 'BASIC': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', icon: CreditCard };
      case 'PREMIUM': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', icon: Zap };
      case 'ENTERPRISE': return { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', icon: Crown };
      default: return { bg: 'bg-gray-50', text: 'text-gray-400', border: 'border-gray-100', icon: Target };
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'ACTIVE': return { bg: 'bg-emerald-50', text: 'text-emerald-600' };
      case 'EXPIRED': return { bg: 'bg-rose-50', text: 'text-rose-600' };
      default: return { bg: 'bg-amber-50', text: 'text-amber-600' };
    }
  };

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-US', { year: '2-digit', month: 'short', day: '2-digit' }) : 'N/A';

  const stats = useMemo(() => ({
    totalFarmers: farmerSubscriptions.length,
    freePlan: farmerSubscriptions.filter((f) => f.current_plan === 'FREE').length,
    paidPlans: farmerSubscriptions.filter((f) => f.current_plan !== 'FREE').length,
    activeSubscriptions: farmerSubscriptions.filter((f) => f.has_active_subscription).length,
    totalRevenue: farmerSubscriptions.reduce((s, f) => s + (f.amount_paid || 0), 0),
  }), [farmerSubscriptions]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-pulse">
        <div className="w-16 h-16 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Revenue Matrix Deciphering...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-gray-100">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Subscription Management</span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
            Subscription <span className="text-gray-400">Overview</span>
          </h1>
          <p className="text-gray-500 font-bold text-lg leading-relaxed">Manage user subscriptions and payment plans.</p>
        </div>
        <button
          onClick={fetchAllFarmerSubscriptions}
          className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-3"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border border-gray-100 rounded-[40px] p-8 relative overflow-hidden group shadow-xl shadow-gray-200/20">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all text-indigo-600">
            <Users className="w-20 h-20" />
          </div>
          <div className="relative space-y-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Users</h4>
              <p className="text-4xl font-black text-gray-900 tracking-tighter">{stats.totalFarmers} Users</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase">
              <TrendingUp className="w-3.5 h-3.5" />
              All Registered Users
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-gray-100 rounded-[40px] p-8 relative overflow-hidden group shadow-xl shadow-gray-200/20">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all text-emerald-600">
            <Zap className="w-20 h-20" />
          </div>
          <div className="relative space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-black">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Paid Plans</h4>
              <p className="text-4xl font-black text-emerald-600 tracking-tighter">{stats.paidPlans} Active</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase">
              <Target className="w-3.5 h-3.5" />
              {((stats.paidPlans / stats.totalFarmers) * 100).toFixed(1)}% Conversion
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-gray-100 rounded-[40px] p-8 relative overflow-hidden group shadow-xl shadow-gray-200/20">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all text-blue-600">
            <DollarSign className="w-20 h-20" />
          </div>
          <div className="relative space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Revenue</h4>
              <p className="text-4xl font-black text-gray-900 tracking-tighter">${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase">
              <Activity className="w-3.5 h-3.5" />
              Lifetime Revenue
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-gray-100 rounded-[40px] p-8 relative overflow-hidden group shadow-xl shadow-gray-200/20">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all text-rose-600">
            <Clock className="w-20 h-20" />
          </div>
          <div className="relative space-y-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center font-black">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Plans</h4>
              <p className="text-4xl font-black text-gray-900 tracking-tighter">{stats.activeSubscriptions} Plans</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-rose-600 uppercase">
              <Zap className="w-3.5 h-3.5" />
              Active Subscriptions
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-xl shadow-gray-200/40">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-6 bg-gray-50 border-none rounded-3xl focus:ring-4 focus:ring-indigo-500/10 text-lg font-bold transition-all outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-8 py-6 bg-gray-50 border-none rounded-3xl text-[10px] font-black uppercase tracking-widest text-gray-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none min-w-[200px]"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-8 py-6 bg-gray-50 border-none rounded-3xl text-[10px] font-black uppercase tracking-widest text-gray-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none min-w-[200px]"
            >
              <option value="ALL">All Tiers</option>
              <option value="FREE">Free</option>
              <option value="BASIC">Basic</option>
              <option value="PREMIUM">Premium</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Registry Table */}
      <Card className="bg-white border border-gray-100 rounded-[40px] shadow-xl shadow-gray-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50">
                <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Operator Identity</th>
                <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Tier</th>
                <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Financial Status</th>
                <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Yield Contribution</th>
                <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Temporal Window</th>
                <th className="px-10 py-8 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Sync</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-10 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Search className="w-12 h-12 text-gray-100" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No active stream matching parameters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((f) => {
                  const planStyles = getPlanStyles(f.current_plan);
                  const statusStyles = getStatusStyles(f.current_status);
                  const Icon = planStyles.icon;

                  return (
                    <tr key={f.farmer_id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 ${planStyles.bg} ${planStyles.text} rounded-2xl flex items-center justify-center font-black shadow-sm group-hover:scale-110 transition-transform`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{f.farmer_name}</p>
                            <p className="text-[10px] font-bold text-gray-400">{f.farmer_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border ${planStyles.bg} ${planStyles.text} ${planStyles.border}`}>
                          {f.current_plan}
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${statusStyles.bg} ${statusStyles.text}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${f.current_status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                          {f.current_status}
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        {f.amount_paid > 0 ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-emerald-600 tracking-tighter">${f.amount_paid.toLocaleString()}</span>
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Paid In Full</span>
                          </div>
                        ) : (
                          <span className="text-sm font-black text-gray-300 tracking-tighter">$0.00</span>
                        )}
                      </td>
                      <td className="px-10 py-8">
                        {f.subscription_start ? (
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-700 uppercase tracking-tight">{formatDate(f.subscription_start)} &rarr; {formatDate(f.subscription_end)}</p>
                            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 w-1/2"></div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none">Standard Window</span>
                        )}
                      </td>
                      <td className="px-10 py-8 text-right">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{formatDate(f.last_updated)}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default SubscriptionsManagement;
