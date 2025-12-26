import React, { useMemo } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Package, AlertTriangle, RefreshCcw, Info } from 'lucide-react';

interface FeedItem {
    id: string;
    name: string;
    category: string;
    subcategory?: string | null;
    quantity: number;
    unit: string;
    cost_per_unit: number;
    reorder_level: number;
    supplier: string | null;
    feed_type?: string | null;
    consumption_rate_per_day?: number | null;
}

interface FeedInventoryTableProps {
    items: FeedItem[];
    onRefill: (item: FeedItem) => void;
    onViewInfo: (item: FeedItem) => void;
}

const FEED_TYPES = [
    'CHICK_STARTER_MASH',
    'GROWER_MASH',
    'LAYER_MASH',
    'FINISHER_FEED',
    'BROILER_CONCENTRATE',
    'PREMIX',
    'CRUSHED_MAIZE',
    'SOYA_MEAL',
    'FISH_MEAL'
];

const FeedInventoryTable: React.FC<FeedInventoryTableProps> = ({ items, onRefill, onViewInfo }) => {
    const filteredItems = useMemo(() => {
        return items.filter(item => item.category === 'FEED' || FEED_TYPES.includes(item.subcategory || ''));
    }, [items]);

    if (filteredItems.length === 0) {
        return (
            <div className="py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <Package className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">No feed inventory found</h3>
                <p className="text-gray-500 max-w-sm mt-3 font-medium">Add your first feed batch to start tracking consumption.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredItems.map((item) => {
                const stockPercentage = Math.min(100, (Number(item.quantity) / (Number(item.reorder_level) * 3)) * 100);
                const isLow = Number(item.quantity) <= Number(item.reorder_level);
                const statusColor = isLow ? 'bg-rose-500' : stockPercentage < 40 ? 'bg-amber-500' : 'bg-emerald-500';

                return (
                    <Card key={item.id} className="group relative overflow-hidden bg-white hover:bg-gray-50/50 border-none shadow-lg shadow-gray-200/60 transition-all duration-300 cursor-default">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-white transition-colors">
                                        {item.subcategory?.replace(/_/g, ' ') || 'GENERAL FEED'}
                                    </span>
                                    <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                                        {item.name}
                                    </h3>
                                </div>
                                {isLow && (
                                    <div className="p-2 bg-rose-50 text-rose-600 rounded-xl animate-bounce">
                                        <AlertTriangle className="w-5 h-5" />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-gray-50 rounded-2xl p-4 group-hover:bg-white transition-colors">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Available Stock</p>
                                    <p className="text-2xl font-black text-gray-900">
                                        {item.quantity} <span className="text-sm text-gray-400 font-bold">{item.unit}</span>
                                    </p>
                                </div>
                                <div className="bg-gray-100/30 rounded-2xl p-4 group-hover:bg-white transition-colors">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Daily Usage</p>
                                    <p className="text-2xl font-black text-gray-900">{item.consumption_rate_per_day || 0} <span className="text-sm text-gray-400 font-bold">{item.unit}</span></p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
                                    <span>Stock Health</span>
                                    <span className={isLow ? 'text-rose-600 animate-pulse' : 'text-emerald-600'}>
                                        {isLow ? 'CRITICAL REFILL' : 'ADEQUATE'}
                                    </span>
                                </div>
                                <div className="h-4 bg-gray-100 rounded-full overflow-hidden p-1 shadow-inner ring-1 ring-black/5">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${statusColor}`}
                                        style={{ width: `${Math.max(5, stockPercentage)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100 flex gap-2">
                            <Button
                                className="flex-1 bg-white hover:bg-blue-600 hover:text-white text-gray-900 border border-gray-200 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-sm hover:shadow-blue-200 active:scale-95 py-6"
                                onClick={() => onRefill(item)}
                            >
                                <RefreshCcw className="w-4 h-4 mr-2" />
                                Add Stock
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

export default FeedInventoryTable;
