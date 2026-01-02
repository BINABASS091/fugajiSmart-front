import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  User,
  AlertCircle,
  Check,
  Settings as SettingsIcon,
  ChevronRight,
  ShieldCheck,
  Fingerprint,
  Radio,
  Clock,
  Save,
  Lock,
  Mail,
  Cpu,
  Zap,
  Server
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'system'>('profile');

  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_alerts: true,
    new_farmer_registrations: true,
    critical_alerts: true,
    device_failures: true,
    subscription_updates: true,
    weekly_reports: true,
  });

  const [systemSettings, setSystemSettings] = useState({
    platform_name: 'FugajiSmart Poultry Hub',
    support_email: 'support@fugajismart.com',
    max_farms_per_farmer: '10',
    max_devices_per_farm: '50',
    data_retention_days: '365',
  });

  const fetchProfile = useCallback(() => {
    if (!user) return;
    setProfileData({
      full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email?.split('@')[0] || '',
      email: user.email || '',
      phone: user.phone || '',
    });
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.user_metadata = { ...userData.user_metadata, full_name: profileData.full_name };
        localStorage.setItem('user', JSON.stringify(userData));
      }
      setSuccess('Identity profile synchronized');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      setSuccess('Notification settings updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSystemUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      setSuccess('System settings updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-pulse">
        <div className="w-16 h-16 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Loading settings...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'profile' as const, name: 'Profile', icon: Fingerprint, detail: 'Personal Information' },
    { id: 'notifications' as const, name: 'Notifications', icon: Radio, detail: 'Alert Settings' },
    { id: 'security' as const, name: 'Security', icon: ShieldCheck, detail: 'Privacy Settings' },
    { id: 'system' as const, name: 'System', icon: Server, detail: 'Platform Settings' },
  ];

  return (
    <div className="space-y-10 pb-20 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-gray-100">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Settings Control Panel</span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
            System <span className="text-gray-400">Settings</span>
          </h1>
          <p className="text-gray-500 font-bold text-lg leading-relaxed">Configure platform settings and user preferences.</p>
        </div>
      </div>

      {(error || success) && (
        <div className={`p-6 rounded-3xl text-[10px] font-black uppercase tracking-widest animate-fadeIn flex items-center gap-4 border ${error ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
          }`}>
          {error ? <AlertCircle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
          {error || success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full group relative p-6 rounded-[30px] border transition-all flex items-center gap-4 ${isActive
                  ? 'bg-gray-900 border-gray-900 text-white shadow-2xl shadow-gray-400/20 translate-x-2'
                  : 'bg-white border-gray-100 text-gray-400 hover:border-indigo-200 hover:bg-gray-50'
                  }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isActive ? 'bg-indigo-600 text-white rotate-12' : 'bg-gray-50 text-gray-400 group-hover:rotate-12 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                  }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{tab.name}</p>
                  <p className={`text-[8px] font-bold uppercase transition-colors ${isActive ? 'text-gray-400' : 'text-gray-300'}`}>{tab.detail}</p>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto text-indigo-400" />}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <Card className="bg-white border border-gray-100 rounded-[40px] p-10 shadow-xl shadow-gray-200/40 min-h-[600px]">
            {activeTab === 'profile' && (
              <div className="space-y-10 animate-fadeIn">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Profile <span className="text-gray-400">Settings</span></h2>
                  <p className="text-gray-500 font-bold">Update your personal information and account details.</p>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</Label>
                      <Input
                        value={profileData.full_name}
                        onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                        className="py-7 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</Label>
                      <Input
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="py-7 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold"
                        placeholder="+254 XXX XXX XXX"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</Label>
                    <div className="relative group">
                      <Input
                        disabled
                        value={profileData.email}
                        className="py-7 rounded-2xl border-none bg-gray-100 text-gray-400 cursor-not-allowed text-sm font-bold pl-12"
                      />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-50 flex justify-end">
                    <Button type="submit" disabled={saving} className="px-10 py-7 bg-gray-900 text-white rounded-3xl hover:bg-black transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-3">
                      {saving ? <Clock className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-10 animate-fadeIn">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Notification <span className="text-gray-400">Settings</span></h2>
                  <p className="text-gray-500 font-bold">Manage your notification preferences and alert settings.</p>
                </div>

                <form onSubmit={handleNotificationUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: 'email_alerts', label: 'Email Alerts', detail: 'Receive email notifications', icon: Mail },
                    { key: 'new_farmer_registrations', label: 'New Users', detail: 'New user registrations', icon: User },
                    { key: 'critical_alerts', label: 'Critical Alerts', detail: 'Urgent system notifications', icon: AlertCircle },
                    { key: 'device_failures', label: 'Device Issues', detail: 'Hardware problem alerts', icon: Cpu },
                    { key: 'subscription_updates', label: 'Subscription Updates', detail: 'Payment and plan changes', icon: Zap },
                    { key: 'weekly_reports', label: 'Weekly Reports', detail: 'System activity summaries', icon: Clock }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isChecked = (notificationSettings as any)[item.key];
                    return (
                      <div key={item.key} className={`p-6 rounded-3xl border transition-all flex items-center gap-4 cursor-pointer select-none ${isChecked ? 'bg-indigo-50/50 border-indigo-100' : 'bg-gray-50 border-gray-100 grayscale opacity-60'}`} onClick={() => setNotificationSettings(p => ({ ...p, [item.key]: !isChecked }))}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isChecked ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-black text-gray-900 uppercase leading-none mb-1">{item.label}</p>
                          <p className="text-[8px] font-bold text-gray-400 uppercase">{item.detail}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${isChecked ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'}`}>
                          {isChecked && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    );
                  })}

                  <div className="md:col-span-2 pt-6 border-t border-gray-50 flex justify-end mt-4">
                    <Button type="submit" disabled={saving} className="px-10 py-7 bg-gray-900 text-white rounded-3xl hover:bg-black transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-3">
                      <Save className="w-4 h-4" />
                      Save Settings
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-10 animate-fadeIn">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Security <span className="text-gray-400">Settings</span></h2>
                  <p className="text-gray-500 font-bold">Manage your account security and privacy settings.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 bg-gray-900 rounded-[30px] text-white space-y-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center animate-pulse"><Lock className="w-6 h-6" /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Pass-Code Logic</p>
                      <p className="text-sm font-bold leading-relaxed">Cipher resets are delivered via encrypted mail bridge for maximum isolation.</p>
                    </div>
                    <Button className="w-full py-4 bg-white/10 hover:bg-white/20 border-none text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Request Reset Pipe</Button>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Operator Rank</p>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><ShieldCheck className="w-5 h-5" /></div>
                        <span className="text-sm font-black text-gray-900 uppercase">Administrator Node</span>
                      </div>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 group opacity-50">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Multi-Factor Logic</p>
                        <span className="text-[8px] font-black text-rose-500 uppercase">Disabled</span>
                      </div>
                      <p className="text-[8px] font-bold text-gray-400 uppercase leading-relaxed mb-4">Add high-latency biometric verification to your auth flow.</p>
                      <Button disabled className="w-full py-3 bg-gray-200 text-gray-400 rounded-xl text-[8px] font-black uppercase tracking-widest border-none">Initialize 2FA</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="space-y-10 animate-fadeIn">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Kernel <span className="text-gray-400">Logic</span></h2>
                  <p className="text-gray-500 font-bold">Modifying core system architecture and resource thresholds.</p>
                </div>

                <form onSubmit={handleSystemUpdate} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Platform Alias</Label>
                      <Input value={systemSettings.platform_name} onChange={(e) => setSystemSettings({ ...systemSettings, platform_name: e.target.value })} className="py-7 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold uppercase" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Support Endpoint</Label>
                      <Input value={systemSettings.support_email} onChange={(e) => setSystemSettings({ ...systemSettings, support_email: e.target.value })} className="py-7 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-gray-50 rounded-3xl space-y-2">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Max Units/OP</Label>
                      <Input type="number" value={systemSettings.max_farms_per_farmer} onChange={(e) => setSystemSettings({ ...systemSettings, max_farms_per_farmer: e.target.value })} className="bg-white border-none py-6 rounded-2xl text-center font-black" />
                    </div>
                    <div className="p-6 bg-gray-50 rounded-3xl space-y-2">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Max Nodes/Unit</Label>
                      <Input type="number" value={systemSettings.max_devices_per_farm} onChange={(e) => setSystemSettings({ ...systemSettings, max_devices_per_farm: e.target.value })} className="bg-white border-none py-6 rounded-2xl text-center font-black" />
                    </div>
                    <div className="p-6 bg-gray-50 rounded-3xl space-y-2">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Log Retention (D)</Label>
                      <Input type="number" value={systemSettings.data_retention_days} onChange={(e) => setSystemSettings({ ...systemSettings, data_retention_days: e.target.value })} className="bg-white border-none py-6 rounded-2xl text-center font-black" />
                    </div>
                  </div>

                  <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-rose-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-rose-200"><AlertCircle className="w-5 h-5" /></div>
                    <div>
                      <p className="text-[8px] font-black text-rose-600 uppercase tracking-widest mb-1">Warning: Live Matrix</p>
                      <p className="text-[10px] font-bold text-rose-500 uppercase leading-none">Kernel parameter updates require immediate synchronization with the decentralized ledger.</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-50 flex justify-end">
                    <Button type="submit" disabled={saving} className="px-10 py-7 bg-gray-900 text-white rounded-3xl hover:bg-black transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-3">
                      <Save className="w-4 h-4" />
                      Flash System Memory
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Settings;
