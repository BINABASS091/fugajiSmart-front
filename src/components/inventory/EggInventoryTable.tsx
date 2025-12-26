import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Egg, ShoppingBag, Trash2, Info, ChevronRight, TrendingUp } from 'lucide-react';

interface EggInventory {
    id: string;
    batch_name: string;
    collection_date: string;
    grade: 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTRA_LARGE';
    quality: 'GRADE_A' | 'GRADE_B' | 'GRADE_C' | 'SPOILED';
    quantity_trays: number;
    quantity_pieces: number;
    spoiled_count: number;
    available_stock: number;
    price_per_tray: number;
}

interface EggInventoryTableProps {
    items: EggInventory[];
    onSell: (item: EggInventory) => void;
    onViewInfo: (item: EggInventory) => void;
}

const EggInventoryTable: React.FC<EggInventoryTableProps> = ({ items, onSell, onViewInfo }) => {
    if (items.length === 0) {
        return (
            <div className="py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <Egg className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">No egg collection recorded</h3>
                <p className="text-gray-500 max-w-sm mt-3 font-medium">Record daily collections to track grading and sales inventory.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
                const isSpoiled = item.quality === 'SPOILED';

                return (
                    <Card key={item.id} className="group relative overflow-hidden bg-white hover:bg-gray-50/50 border-none shadow-lg shadow-gray-200/60 transition-all duration-300">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <div className="flex gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600">
                                            {item.grade}
                                        </span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${isSpoiled ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                                            }`}>
                                            {item.quality.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 group-hover:text-amber-600 transition-colors uppercase tracking-tight">
                                        Batch: {item.batch_name}
                                    </h3>
                                </div>
                                {item.available_stock > 100 && (
                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-amber-50 rounded-2xl p-4 group-hover:bg-white transition-colors">
                                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Available Trays</p>
                                    <p className="text-2xl font-black text-gray-900">
                                        {item.quantity_trays} <span className="text-sm text-gray-400 font-bold">Trays</span>
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-4 group-hover:bg-white transition-colors">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Stock Pieces</p>
                                    <p className="text-2xl font-black text-gray-900">{item.available_stock}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 mb-6">
                                <div className="flex items-center gap-2">
                                    <Trash2 className="w-4 h-4 text-rose-400" />
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">Losses (Spoiled)</span>
                                </div>
                                <span className="text-sm font-black text-rose-600">{item.spoiled_count}</span>
                            </div>

                            <div className="bg-emerald-600 rounded-2xl p-5 text-white shadow-xl shadow-emerald-100 relative overflow-hidden group/price">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Price per Tray</p>
                                <div className="flex items-end gap-1">
                                    <span className="text-2xl font-black">${item.price_per_tray.toLocaleString()}</span>
                                    <ChevronRight className="w-4 h-4 mb-1.5 opacity-0 group-hover/price:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100 flex gap-2">
                            <Button
                                className="flex-1 bg-white hover:bg-emerald-600 hover:text-white text-gray-900 border border-gray-200 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95 py-6"
                                onClick={() => onSell(item)}
                                disabled={item.available_stock <= 0 || isSpoiled}
                            >
                                <ShoppingBag className="w-4 h-4 mr-2" />
                                Record Sale
                            </Button>
                            <Button
                                variant="outline"
                                className="p-4 rounded-xl border-gray-200 hover:bg-white transition-all group/btn"
                                onClick={() => onViewInfo(item)}
                            >
                                <Info className="w-5 h-5 text-gray-400 group-hover/btn:text-amber-500" />
                            </Button>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

export default EggInventoryTable;
