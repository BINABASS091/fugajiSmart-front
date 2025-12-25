import { useEffect, useState, useCallback, useMemo } from 'react';
import { dataService } from '../../services/dataService';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card } from '../../components/ui/card';
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Filter,
  Clock,
  ShieldAlert,
  Settings,
  Search,
  ChevronRight,
  Eye,
  Activity,
  Zap
} from 'lucide-react';
import type { Alert } from '../../services/mockData';
import { format } from 'date-fns';

export function AlertsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [readFilter, setReadFilter] = useState<string>('ALL');

  const fetchAlerts = useCallback(async () => {
    if (!user) return;
    try {
      const alertsData = await dataService.getAlerts(user.id);
      setAlerts(alertsData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

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

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesSeverity = severityFilter === 'ALL' || alert.severity === severityFilter;
      const matchesRead =
        readFilter === 'ALL' ||
        (readFilter === 'UNREAD' && !alert.is_read) ||
        (readFilter === 'READ' && alert.is_read);
      return matchesSeverity && matchesRead;
    });
  }, [alerts, severityFilter, readFilter]);

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600', icon: <ShieldAlert className="w-5 h-5" />, glow: 'shadow-rose-100' };
      case 'HIGH': return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', icon: <AlertTriangle className="w-5 h-5" />, glow: 'shadow-orange-100' };
      case 'MEDIUM': return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', icon: <Activity className="w-5 h-5" />, glow: 'shadow-amber-100' };
      case 'LOW': return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', icon: <Bell className="w-5 h-5" />, glow: 'shadow-blue-100' };
      default: return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', icon: <Bell className="w-5 h-5" />, glow: 'shadow-gray-100' };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'HEALTH': return '🏥';
      case 'ENVIRONMENT': return '🌡️';
      case 'DEVICE': return '📱';
      case 'SYSTEM': return '⚙️';
      default: return '📢';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-pulse">
        <div className="w-16 h-16 border-4 border-rose-50 border-t-rose-600 rounded-full animate-spin mb-6"></div>
        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Security Perimeter Scanning...</p>
      </div>
    );
  }

  const stats = {
    total: alerts.length,
    unread: alerts.filter((a) => !a.is_read).length,
    critical: alerts.filter((a) => a.severity === 'CRITICAL').length,
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-gray-100">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Security Broadcast</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">
            {t('alerts.title')} <span className="text-rose-600">[{stats.unread}]</span>
          </h1>
          <p className="text-gray-500 font-bold text-lg">{t('alerts.subtitle')}</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600 transition-all shadow-sm">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600 transition-all shadow-sm">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 bg-white border border-gray-100 rounded-[40px] shadow-xl shadow-gray-200/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative z-10">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl w-fit mb-6">
              <Bell className="w-8 h-8" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('alerts.totalAlerts')}</p>
            <h3 className="text-4xl font-black text-gray-900">{stats.total}</h3>
          </div>
        </Card>
        <Card className="p-8 bg-white border border-gray-100 rounded-[40px] shadow-xl shadow-gray-200/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-amber-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative z-10">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl w-fit mb-6">
              <Zap className="w-8 h-8" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('alerts.unread')}</p>
            <h3 className="text-4xl font-black text-gray-900">{stats.unread}</h3>
          </div>
        </Card>
        <Card className="p-8 bg-rose-600 rounded-[40px] shadow-2xl shadow-rose-200 relative overflow-hidden group text-white">
          <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative z-10">
            <div className="p-4 bg-white/20 backdrop-blur-md text-white rounded-2xl w-fit mb-6 ring-4 ring-white/10">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{t('alerts.critical')}</p>
            <h3 className="text-4xl font-black">{stats.critical}</h3>
          </div>
        </Card>
      </div>

      {/* Control Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/30">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="p-3 bg-gray-50 text-gray-400 rounded-xl">
            <Filter className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 hidden lg:block">Vector Filters</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-6 py-4 bg-gray-50 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-600 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none min-w-[160px]"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          <select
            value={readFilter}
            onChange={(e) => setReadFilter(e.target.value)}
            className="px-6 py-4 bg-gray-50 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-600 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none min-w-[160px]"
          >
            <option value="ALL">All Messages</option>
            <option value="UNREAD">Unread Only</option>
            <option value="READ">Archived items</option>
          </select>
        </div>
        <button onClick={() => { setSeverityFilter('ALL'); setReadFilter('ALL'); }} className="text-[10px] font-black uppercase tracking-widest text-rose-600 hover:text-rose-700 transition-colors px-4 py-2 hover:bg-rose-50 rounded-xl">
          Reset Sensors
        </button>
      </div>

      {/* Alert Feed */}
      <div className="space-y-6">
        {filteredAlerts.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-center bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/40">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
              <Bell className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Perimeter Clear</h3>
            <p className="text-gray-400 font-bold max-w-sm mt-3 px-6">{t('alerts.noAlerts')}</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const styles = getSeverityStyles(alert.severity);
            return (
              <Card
                key={alert.id}
                className={`group relative overflow-hidden bg-white rounded-[40px] border-l-[12px] p-8 shadow-xl hover:shadow-2xl transition-all duration-300 ${styles.border} ${!alert.is_read ? styles.glow : 'shadow-gray-200/40 opacity-80'}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="flex items-start gap-6 flex-1">
                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-sm ${styles.bg}`}>
                      {getTypeIcon(alert.alert_type)}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2 ${styles.bg} ${styles.text}`}>
                          {styles.icon}
                          {alert.severity}
                        </span>
                        <span className="px-2.5 py-1 text-[8px] font-black uppercase tracking-widest bg-gray-50 text-gray-400 rounded-lg">
                          {alert.alert_type} SOURCE
                        </span>
                        {!alert.is_read && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg animate-pulse">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                            <span className="text-[8px] font-black uppercase tracking-widest">Live Alert</span>
                          </div>
                        )}
                      </div>
                      <h4 className="text-xl font-black text-gray-900 leading-tight uppercase tracking-tight max-w-3xl">
                        {alert.message}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">
                        <Clock className="w-3.5 h-3.5" />
                        {format(new Date(alert.created_at), 'MMMM d, yyyy HH:mm:ss')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!alert.is_read && (
                      <button
                        onClick={() => markAsRead(alert.id)}
                        className="px-8 py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Acknowledge
                      </button>
                    )}
                    {alert.is_read && (
                      <div className="flex items-center gap-3 text-gray-400 px-6 py-4 bg-gray-50 rounded-2xl">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                      </div>
                    )}
                    <button className="p-4 bg-white border border-gray-100 text-gray-400 hover:text-gray-900 rounded-2xl transition-all group-hover:bg-gray-50">
                      <ChevronRight className="w-5 h-5" />
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

export default AlertsPage;
