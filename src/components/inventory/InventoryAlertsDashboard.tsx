import React from 'react';
import { Card } from '../ui/card';
import {
    AlertTriangle,
    Clock,
    ArrowRight,
    Syringe,
    Package,
    CheckCircle2,
    TrendingDown,
    Info
} from 'lucide-react';

interface InventoryAlert {
    id: string;
    type: 'LOW_STOCK' | 'EXPIRY' | 'MAINTENANCE' | 'VACCINATION';
    title: string;
    message: string;
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    date?: string;
}

interface InventoryAlertsDashboardProps {
    alerts: InventoryAlert[];
    onAction: (alert: InventoryAlert) => void;
}

const SEVERITY_COLORS = {
    CRITICAL: 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-100',
    WARNING: 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100',
    INFO: 'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-100',
};

const TYPE_ICONS = {
    LOW_STOCK: Package,
    EXPIRY: Clock,
    MAINTENANCE: ArrowRight,
    VACCINATION: Syringe,
};

const InventoryAlertsDashboard: React.FC<InventoryAlertsDashboardProps> = ({ alerts, onAction }) => {
    const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;

    return (
        <Card className="p-8 bg-white border-2 border-gray-50 rounded-[40px] shadow-2xl shadow-gray-200/40">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl ${criticalCount > 0 ? 'bg-rose-600 animate-pulse' : 'bg-emerald-500'} text-white shadow-xl`}>
                        {criticalCount > 0 ? <AlertTriangle className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Supply Intelligence</h2>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Real-time Stock Monitoring</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-5 py-3 bg-gray-50 rounded-2xl border border-gray-100">
                        <span className="text-2xl font-black text-gray-900">{alerts.length}</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 italic">Active Alerts</span>
                    </div>
                </div>
            </div>

            {alerts.length === 0 ? (
                <div className="py-12 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                        <TrendingDown className="w-8 h-8 text-emerald-500 rotate-180" />
                    </div>
                    <p className="text-gray-400 font-bold uppercase text-xs tracking-[0.2em]">All Systems Nominal</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {alerts.map((alert) => {
                        const Icon = TYPE_ICONS[alert.type] || Info;
                        return (
                            <div
                                key={alert.id}
                                className={`relative group p-6 rounded-3xl border-2 transition-all duration-300 hover:-translate-y-1 cursor-pointer ${SEVERITY_COLORS[alert.severity]}`}
                                onClick={() => onAction(alert)}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-white/60 backdrop-blur-sm rounded-xl">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 italic">
                                        {alert.severity}
                                    </span>
                                </div>
                                <h3 className="text-lg font-black tracking-tight mb-2 uppercase">{alert.title}</h3>
                                <p className="text-sm font-bold opacity-75 leading-relaxed mb-4">{alert.message}</p>

                                {alert.date && (
                                    <div className="flex items-center gap-2 text-[10px] font-black opacity-60 uppercase tracking-widest">
                                        <Clock className="w-3 h-3" />
                                        <span>Deadine: {alert.date}</span>
                                    </div>
                                )}

                                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
};

export default InventoryAlertsDashboard;
