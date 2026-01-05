import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Users, Phone, Briefcase, UserPlus, ExternalLink } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

interface LaborRecord {
    id: string;
    worker_name: string;
    worker_type: 'PERMANENT' | 'CASUAL' | 'CONTRACT';
    phone_number?: string | null;
    role: string;
    payment_frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    wage_amount: number;
    start_date: string;
    is_active: boolean;
}

interface LaborRecordsTableProps {
    records: LaborRecord[];
    onAddWorker: () => void;
    onEditWorker: (record: LaborRecord) => void;
}

const LaborRecordsTable: React.FC<LaborRecordsTableProps> = ({ records, onAddWorker, onEditWorker }) => {
    const { formatCurrency } = useCurrency();
    
    if (records.length === 0) {
        return (
            <div className="py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <Users className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">No workers registered</h3>
                <p className="text-gray-500 max-w-sm mt-3 font-medium">Add your farm staff and casual labor to track roles and wages.</p>
                <Button onClick={onAddWorker} className="mt-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-8 py-6">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Add First Worker
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {records.map((record) => (
                <Card key={record.id} className="group relative overflow-hidden bg-white hover:bg-gray-50/50 border-none shadow-lg shadow-gray-200/60 transition-all duration-300">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div className="space-y-1">
                                <div className="flex gap-2">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${record.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                        {record.is_active ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600">
                                        {record.worker_type}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                                    {record.worker_name}
                                </h3>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 group-hover:bg-white transition-colors">
                                <Briefcase className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-bold uppercase tracking-tight">{record.role}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 group-hover:bg-white transition-colors">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-bold">{record.phone_number || 'No contact'}</span>
                            </div>
                        </div>

                        <div className="bg-blue-600 rounded-2xl p-5 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Wage Details ({record.payment_frequency})</p>
                            <div className="flex items-end gap-1">
                                <span className="text-2xl font-black">{formatCurrency(record.wage_amount)}</span>
                                <span className="text-[10px] font-black opacity-60 mb-1.5 whitespace-nowrap">/ {record.payment_frequency}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100">
                        <Button
                            className="w-full bg-white hover:bg-gray-900 hover:text-white text-gray-900 border border-gray-200 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95 py-6"
                            onClick={() => onEditWorker(record)}
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Manage Official Profile
                        </Button>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default LaborRecordsTable;
