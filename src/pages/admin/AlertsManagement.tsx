import { useEffect, useState, useMemo, useCallback } from 'react';
import { dataService } from '../../services/dataService';
import { useConfirm } from '../../hooks/useConfirm';
import {
  AlertTriangle,
  Bell,
  Calendar,
  ChevronRight,
  Filter,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Activity,
  Clock,
  MoreVertical,
  Radio,
  X,
  Eye
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

interface Alert {
  id: string;
  farmer_id: string | null;
  alert_type: string;
  severity: string;
  message: string;
  is_read: boolean;
  created_at: string;
  farmer?: {
    user: {
      full_name: string;
      email: string;
    };
  } | null;
}

export function AlertsManagement() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [readFilter, setReadFilter] = useState<string>('ALL');
  const { confirm, ConfirmDialog } = useConfirm();

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const alertsData = await dataService.getAlerts();
      const enrichedAlerts = alertsData.map(alert => ({
        ...alert,
        farmer: null,
      }));
      setAlerts(enrichedAlerts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const markAsRead = async (id: string) => {
    try {
      await dataService.updateAlert(id, { is_read: true });
      fetchAlerts();
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const deleteAlert = async (id: string) => {
    const confirmed = await confirm({
      title: 'Acknowledge & Archive',
      message: 'This will purge the threat from the active monitor. Archive permanently?',
      variant: 'danger',
      confirmText: 'Archive',
      cancelText: 'Abort'
    });
    if (!confirmed) return;
    try {
      await dataService.updateAlert(id, { is_read: true });
      fetchAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const filteredAlerts = useMemo(() => alerts.filter((alert) => {
    const matchesSeverity = severityFilter === 'ALL' || alert.severity === severityFilter;
    const matchesType = typeFilter === 'ALL' || alert.alert_type === typeFilter;
    const matchesRead =
      readFilter === 'ALL' ||
      (readFilter === 'UNREAD' && !alert.is_read) ||
      (readFilter === 'READ' && alert.is_read);
    return matchesSeverity && matchesType && matchesRead;
  }), [alerts, severityFilter, typeFilter, readFilter]);

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', icon: AlertTriangle };
      case 'HIGH': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', icon: AlertTriangle };
      case 'MEDIUM': return { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', icon: Activity };
      default: return { bg: 'bg-gray-50', text: 'text-gray-400', border: 'border-gray-100', icon: Bell };
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'HEALTH': return 'Biological Threat';
      case 'ENVIRONMENT': return 'Atmospheric Variance';
      case 'DEVICE': return 'Module Logic Fault';
      case 'SYSTEM': return 'Kernel Log';
      default: return 'General Broadcast';
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'T-0S';
    if (diff < 3600) return `T-${Math.floor(diff / 60)}M`;
    if (diff < 86400) return `T-${Math.floor(diff / 3600)}H`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const stats = useMemo(() => ({
    total: alerts.length,
    unread: alerts.filter((a) => !a.is_read).length,
    critical: alerts.filter((a) => a.severity === 'CRITICAL').length,
    high: alerts.filter((a) => a.severity === 'HIGH').length,
  }), [alerts]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-pulse">
        <div className="w-16 h-16 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Strategic Feed Decoding...</p>
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
            <div className="p-2 bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-200">
              <Radio className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Strategic Response Center</span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
            Threat <span className="text-gray-400">Stream</span>
          </h1>
          <p className="text-gray-500 font-bold text-lg leading-relaxed">Real-time resolution of platform-wide operational variances.</p>
        </div>
        <button
          onClick={fetchAlerts}
          className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-3"
        >
          <Zap className="w-4 h-4" />
          Synchronize Feed
        </button>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-xl shadow-gray-200/20 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><Bell className="w-6 h-6" /></div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Scan</span>
          </div>
          <p className="text-4xl font-black text-gray-900 tracking-tighter">{stats.total} Logs</p>
        </Card>
        <Card className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-xl shadow-gray-200/20 group relative overflow-hidden">
          {stats.unread > 0 && <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full m-8 animate-ping"></div>}
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><Activity className="w-6 h-6" /></div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Incoming</span>
          </div>
          <p className="text-4xl font-black text-blue-600 tracking-tighter">{stats.unread} Unread</p>
        </Card>
        <Card className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-xl shadow-gray-200/20 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><AlertTriangle className="w-6 h-6" /></div>
            <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Integrity</span>
          </div>
          <p className="text-4xl font-black text-rose-600 tracking-tighter">{stats.critical} Critical</p>
        </Card>
        <Card className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-xl shadow-gray-200/20 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><ShieldCheck className="w-6 h-6" /></div>
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Priority</span>
          </div>
          <p className="text-4xl font-black text-amber-600 tracking-tighter">{stats.high} High</p>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-xl shadow-gray-200/40">
        <div className="flex flex-col lg:flex-row gap-6">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-8 py-6 bg-gray-50 border-none rounded-3xl text-[10px] font-black uppercase tracking-widest text-gray-600 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none flex-1"
          >
            <option value="ALL">All Threat Levels</option>
            <option value="CRITICAL">Critical Breaches</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Standard Alerts</option>
            <option value="LOW">De-escalated</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-8 py-6 bg-gray-50 border-none rounded-3xl text-[10px] font-black uppercase tracking-widest text-gray-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none flex-1"
          >
            <option value="ALL">All Vector Types</option>
            <option value="HEALTH">Biological</option>
            <option value="ENVIRONMENT">Atmospheric</option>
            <option value="DEVICE">Hardware Logic</option>
            <option value="SYSTEM">Kernel/OS</option>
          </select>

          <select
            value={readFilter}
            onChange={(e) => setReadFilter(e.target.value)}
            className="px-8 py-6 bg-gray-50 border-none rounded-3xl text-[10px] font-black uppercase tracking-widest text-gray-600 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none flex-1"
          >
            <option value="ALL">Read/Unread Logs</option>
            <option value="UNREAD">Unresolved Logic</option>
            <option value="READ">Resolved History</option>
          </select>
        </div>
      </Card>

      {/* Alert Stream */}
      <div className="grid grid-cols-1 gap-6">
        {filteredAlerts.length === 0 ? (
          <Card className="bg-white border border-gray-100 rounded-[40px] p-20 text-center shadow-xl shadow-gray-200/20">
            <div className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200"><Bell className="w-10 h-10" /></div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Threat stream is currently silent</p>
            </div>
          </Card>
        ) : (
          filteredAlerts.map((alert) => {
            const styles = getSeverityStyles(alert.severity);
            const Icon = styles.icon;

            return (
              <Card key={alert.id} className={`bg-white border-2 ${alert.is_read ? 'border-gray-50' : styles.border} rounded-[40px] p-8 shadow-xl shadow-gray-200/10 group transition-all hover:-translate-y-1 relative overflow-hidden`}>
                {!alert.is_read && <div className={`absolute top-0 left-0 w-2 h-full ${styles.text.replace('text-', 'bg-')}`}></div>}

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="flex items-start gap-6 flex-1">
                    <div className={`w-16 h-16 ${styles.bg} ${styles.text} rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-lg ${styles.bg} ${styles.text} border ${styles.border}`}>{alert.severity}</span>
                        <span className="px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-lg bg-gray-100 text-gray-500">{getTypeLabel(alert.alert_type)}</span>
                        {!alert.is_read && <span className="px-2 py-0.5 bg-blue-500 text-white rounded text-[8px] font-black uppercase tracking-widest animate-pulse">Action Required</span>}
                      </div>
                      <p className="text-xl font-black text-gray-900 tracking-tight uppercase leading-none">{alert.message}</p>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(alert.created_at)}
                        </div>
                        {alert.farmer ? (
                          <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                            <Eye className="w-3.5 h-3.5" />
                            OP: {alert.farmer.user.full_name}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Internal Pulse
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pl-2 lg:pl-0 border-l lg:border-l-0 border-gray-100">
                    {!alert.is_read && (
                      <button
                        onClick={() => markAsRead(alert.id)}
                        className="px-6 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-black transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-100"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Resolve
                      </button>
                    )}
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="p-4 bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

export default AlertsManagement;
