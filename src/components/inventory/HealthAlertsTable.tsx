import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { HeartPulse, AlertCircle, CheckCircle2, Info, Clock, User } from 'lucide-react';
import { format } from 'date-fns';

interface HealthAlert {
    id: string;
    batch_name: string;
    alert_type: 'SYMPTOM_OBSERVED' | 'DISEASE_OUTBREAK' | 'MORTALITY_SPIKE' | 'VACCINATION_DUE';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    symptoms?: string | null;
    count_affected?: number | null;
    resolved: boolean;
    resolution_notes?: string | null;
    resolved_by_name?: string | null;
    created_at: string;
}

interface HealthAlertsTableProps {
    alerts: HealthAlert[];
    onResolve: (alert: HealthAlert) => void;
    onViewDetails: (alert: HealthAlert) => void;
}

const SEVERITY_STYLES = {
    LOW: 'bg-blue-50 text-blue-600 border-blue-100',
    MEDIUM: 'bg-amber-50 text-amber-600 border-amber-100',
    HIGH: 'bg-orange-50 text-orange-600 border-orange-100 font-bold',
    CRITICAL: 'bg-rose-50 text-rose-600 border-rose-100 font-black animate-pulse',
};

const HealthAlertsTable: React.FC<HealthAlertsTableProps> = ({ alerts, onResolve, onViewDetails }) => {
    if (alerts.length === 0) {
        return (
            <div className="py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                    <HeartPulse className="w-10 h-10 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">Health status optimal</h3>
                <p className="text-gray-500 max-w-sm mt-3 font-medium">No active health alerts or disease records. Your flock is healthy.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {alerts.map((alert) => (
                <Card key={alert.id} className={`group relative overflow-hidden bg-white border-2 transition-all duration-300 ${alert.resolved ? 'border-gray-100 opacity-75' : 'border-rose-100 shadow-xl shadow-rose-50'
                    }`}>
                    <div className="p-8">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="flex items-start gap-5">
                                <div className={`p-4 rounded-2xl ${alert.resolved ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {alert.resolved ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest border uppercase ${SEVERITY_STYLES[alert.severity]}`}>
                                            {alert.severity} SEVERITY
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-gray-100 text-gray-500 uppercase">
                                            {alert.alert_type.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                                        {alert.batch_name} - Health Alert
                                    </h3>
                                    <div className="flex items-center gap-4 mt-2 text-sm font-bold text-gray-400">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            {format(new Date(alert.created_at), 'MMM d, p')}
                                        </div>
                                        {alert.count_affected && (
                                            <div className="flex items-center gap-1.5 text-rose-500">
                                                <User className="w-4 h-4" />
                                                {alert.count_affected} birds affected
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    className="px-6 py-6 rounded-2xl font-black text-gray-400 border-gray-200 hover:text-blue-600 hover:border-blue-200"
                                    onClick={() => onViewDetails(alert)}
                                >
                                    <Info className="w-5 h-5 mr-2" />
                                    View Details
                                </Button>
                                {!alert.resolved && (
                                    <Button
                                        className="px-8 py-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-200 transition-all hover:-translate-y-1"
                                        onClick={() => onResolve(alert)}
                                    >
                                        Mark Resolved
                                    </Button>
                                )}
                            </div>
                        </div>

                        {alert.symptoms && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Symptoms Identified</p>
                                <p className="text-sm font-bold text-gray-600 leading-relaxed">{alert.symptoms}</p>
                            </div>
                        )}

                        {alert.resolved && alert.resolution_notes && (
                            <div className="mt-6 p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100">
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Resolution Protocol (By {alert.resolved_by_name || 'System'})</p>
                                <p className="text-sm font-bold text-emerald-800 leading-relaxed">{alert.resolution_notes}</p>
                            </div>
                        )}
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default HealthAlertsTable;
