import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Syringe, AlertTriangle, ShieldCheck, Info, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface MedicineItem {
    id: string;
    inventory_item: string;
    inventory_item_details: {
        name: string;
        quantity: number;
        unit: string;
        expiry_date: string | null;
    };
    medicine_type?: string | null;
    vaccine_type?: string | null;
    dosage: string;
    administration_route: string;
    withdrawal_period_days?: number | null;
    storage_temperature?: string | null;
}

interface MedicineInventoryTableProps {
    items: MedicineItem[];
    onAdminister: (item: MedicineItem) => void;
    onViewInfo: (item: MedicineItem) => void;
}

const MedicineInventoryTable: React.FC<MedicineInventoryTableProps> = ({ items, onAdminister, onViewInfo }) => {
    if (items.length === 0) {
        return (
            <div className="py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <Syringe className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">No medicine inventory found</h3>
                <p className="text-gray-500 max-w-sm mt-3 font-medium">Add vaccines and treatments to protect your flock health.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item) => {
                const isExpired = item.inventory_item_details.expiry_date &&
                    new Date(item.inventory_item_details.expiry_date) < new Date();
                const isExpiringSoon = item.inventory_item_details.expiry_date && !isExpired &&
                    new Date(item.inventory_item_details.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                return (
                    <Card key={item.id} className="group relative overflow-hidden bg-white hover:bg-gray-50/50 border-none shadow-lg shadow-gray-200/60 transition-all duration-300 cursor-default">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <div className="flex gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-purple-50 text-purple-600">
                                            {item.medicine_type || item.vaccine_type?.replace(/_/g, ' ') || 'TREATMENT'}
                                        </span>
                                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600">
                                            {item.administration_route}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                                        {item.inventory_item_details.name}
                                    </h3>
                                </div>
                                {(isExpired || isExpiringSoon) && (
                                    <div className={`p-2 rounded-xl animate-pulse ${isExpired ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                                        <AlertTriangle className="w-5 h-5" />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-gray-50 rounded-2xl p-4 group-hover:bg-white transition-colors">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Available Quantity</p>
                                    <p className="text-2xl font-black text-gray-900">
                                        {item.inventory_item_details.quantity} <span className="text-sm text-gray-400 font-bold">{item.inventory_item_details.unit}</span>
                                    </p>
                                </div>
                                <div className="bg-gray-100/30 rounded-2xl p-4 group-hover:bg-white transition-colors">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Dosage</p>
                                    <p className="text-lg font-black text-gray-900 truncate">{item.dosage}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
                                    <span>Expiry Status</span>
                                    <span className={isExpired ? 'text-rose-600' : isExpiringSoon ? 'text-amber-600' : 'text-emerald-600'}>
                                        {isExpired ? 'EXPIRED' : isExpiringSoon ? 'EXPIRING SOON' : 'VALID'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    {item.inventory_item_details.expiry_date ?
                                        format(new Date(item.inventory_item_details.expiry_date), 'MMM d, yyyy') :
                                        'No expiry date'}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100 flex gap-2">
                            <Button
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-none rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-200 active:scale-95 py-6"
                                onClick={() => onAdminister(item)}
                                disabled={isExpired}
                            >
                                <ShieldCheck className="w-4 h-4 mr-2" />
                                Administer
                            </Button>
                            <Button
                                variant="outline"
                                className="p-4 rounded-xl border-gray-200 hover:bg-white transition-all group/btn"
                                onClick={() => onViewInfo(item)}
                            >
                                <Info className="w-5 h-5 text-gray-400 group-hover/btn:text-blue-500" />
                            </Button>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

export default MedicineInventoryTable;
