import React from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { Wallet, ShoppingCart, Calculator, Syringe, Scale, Package, Store, Skull, PlusCircle } from 'lucide-react';

const modules = [
  { label: 'Expenses', icon: <Wallet className="w-8 h-8" />, to: '/expenses', color: 'bg-amber-50' },
  { label: 'Sales', icon: <ShoppingCart className="w-8 h-8" />, to: '/sales', color: 'bg-yellow-50' },
  { label: 'Estimations', icon: <Calculator className="w-8 h-8" />, to: '/estimations', color: 'bg-violet-50' },
  { label: 'Vaccines & Meds', icon: <Syringe className="w-8 h-8" />, to: '/vaccines', color: 'bg-blue-50' },
  { label: 'Weight', icon: <Scale className="w-8 h-8" />, to: '/weight', color: 'bg-blue-100' },
  { label: 'Feed', icon: <Package className="w-8 h-8" />, to: '/feed', color: 'bg-green-100' },
  { label: 'Order', icon: <Store className="w-8 h-8" />, to: '/order', color: 'bg-green-50' },
  { label: 'Mortality', icon: <Skull className="w-8 h-8" />, to: '/mortality', color: 'bg-rose-100' },
];

export default function Dashboard() {
  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="p-4 flex flex-col items-center justify-center">
          <div className="text-xs text-gray-500 mb-1">No Active Batch</div>
          <div className="text-2xl font-bold">0 kg</div>
          <div className="text-sm text-gray-500">Today's feed</div>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center">
          <div className="text-xs text-gray-500 mb-1">0 Chickens</div>
          <div className="text-2xl font-bold">0 days</div>
          <div className="text-sm text-gray-500">of feed supply left</div>
        </Card>
      </div>
      {/* Module Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {modules.map((mod) => (
          <Link to={mod.to} key={mod.label} className={`rounded-xl p-4 flex flex-col items-center justify-center shadow-sm ${mod.color} hover:shadow-md`}>
            {mod.icon}
            <span className="mt-2 font-medium text-gray-800 text-center">{mod.label}</span>
          </Link>
        ))}
      </div>
      <div className="flex justify-center">
        <Button variant="default" className="rounded-full px-6 py-3 flex items-center gap-2">
          <PlusCircle className="w-5 h-5" /> Add flock
        </Button>
      </div>
    </div>
  );
}
