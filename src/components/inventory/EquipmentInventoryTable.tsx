import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Wrench, AlertTriangle, Settings, Info, Gauge } from 'lucide-react';

interface EquipmentItem {
    id: string;
    inventory_item: string;
    inventory_item_details: {
        name: string;
        quantity: number;
        unit: string;
    };
    equipment_type: string;
    condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'DAMAGED' | 'NEEDS_REPAIR' | 'RETIRED';
    purchase_cost: number;
    expected_lifespan_years: number;
    next_maintenance_date?: string | null;
    replacement_alert: boolean;
}

interface EquipmentInventoryTableProps {
    items: EquipmentItem[];
    onMaintenance: (item: EquipmentItem) => void;
    onViewInfo: (item: EquipmentItem) => void;
}

const CONDITION_COLORS = {
    EXCELLENT: 'bg-emerald-50 text-emerald-700',
    GOOD: 'bg-green-50 text-green-700',
    FAIR: 'bg-amber-50 text-amber-700',
    DAMAGED: 'bg-rose-50 text-rose-700 font-black animate-pulse',
    NEEDS_REPAIR: 'bg-orange-50 text-orange-700 font-bold',
    RETIRED: 'bg-gray-100 text-gray-400',
};

const EquipmentInventoryTable: React.FC<EquipmentInventoryTableProps> = ({ items, onMaintenance, onViewInfo }) => {
    if (items.length === 0) {
        return (
            <div className="py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <Wrench className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">No equipment found</h3>
                <p className="text-gray-500 max-w-sm mt-3 font-medium">Add feeders, drinkers, and IoT sensors to manage your farm assets.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
                const needsRepair = item.condition === 'DAMAGED' || item.condition === 'NEEDS_REPAIR';

                return (
                    <Card key={item.id} className="group relative overflow-hidden bg-white hover:bg-gray-50/50 border-none shadow-lg shadow-gray-200/60 transition-all duration-300 cursor-default">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <div className="flex gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600">
                                            {item.equipment_type.replace(/_/g, ' ')}
                                        </span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${CONDITION_COLORS[item.condition]}`}>
                                            {item.condition}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                                        {item.inventory_item_details.name}
                                    </h3>
                                </div>
                                {(needsRepair || item.replacement_alert) && (
                                    <div className="p-2 bg-orange-50 text-orange-600 rounded-xl animate-bounce">
                                        <AlertTriangle className="w-5 h-5" />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-gray-50 rounded-2xl p-4 group-hover:bg-white transition-colors">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Quantity</p>
                                    <p className="text-2xl font-black text-gray-900">
                                        {item.inventory_item_details.quantity} <span className="text-sm text-gray-400 font-bold">{item.inventory_item_details.unit}</span>
                                    </p>
                                </div>
                                <div className="bg-gray-100/30 rounded-2xl p-4 group-hover:bg-white transition-colors">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Lifespan</p>
                                    <p className="text-xl font-black text-gray-900">{item.expected_lifespan_years}Y</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
                                    <span>Maintenance Schedule</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 group-hover:bg-white transition-colors">
                                    <Gauge className="w-4 h-4 text-blue-500" />
                                    <span>Next: {item.next_maintenance_date || 'Not scheduled'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100 flex gap-2">
                            <Button
                                className="flex-1 bg-white hover:bg-gray-900 hover:text-white text-gray-900 border border-gray-200 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95 py-6"
                                onClick={() => onMaintenance(item)}
                            >
                                <Settings className="w-4 h-4 mr-2" />
                                Service
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

export default EquipmentInventoryTable;
