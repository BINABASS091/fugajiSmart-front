import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

const categories = [
  { label: 'Feed', details: 'Starter, Grower, Layer' },
  { label: 'Vaccination', details: 'IBD, NCD' },
  { label: 'Labor', details: 'Salary, Bonus' },
  { label: 'Medication', details: 'Fluban, Amporium' },
  { label: 'Others', details: 'Chicks, Transport' },
];

const filterTabs = ['All', 'Weekly', 'Monthly', 'Custom'];

export default function Expenses() {
  const [activeTab, setActiveTab] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Feed');

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="flex gap-2 mb-4">
        {filterTabs.map(tab => (
          <Button key={tab} variant={activeTab === tab ? 'default' : 'outline'} onClick={() => setActiveTab(tab)}>{tab}</Button>
        ))}
      </div>
      <div className="space-y-3 mb-6">
        {categories.map(cat => (
          <Card key={cat.label} className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50" onClick={() => { setSelectedCategory(cat.label); setShowAddModal(true); }}>
            <span className="font-semibold text-gray-800">{cat.label}</span>
            <span className="text-sm text-gray-500">- {cat.details}</span>
          </Card>
        ))}
      </div>
      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-5xl mb-2">🧾</div>
        <div className="text-gray-600 mb-2">No {selectedCategory} Expense Recorded</div>
        <div className="text-sm text-gray-500 mb-4">Click "Add" to record a new expense.</div>
        <Button onClick={() => setShowAddModal(true)}>+ Add</Button>
      </div>
      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{selectedCategory} Expenses</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>✕</Button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cost incurred</label>
                <input className="w-full border rounded px-3 py-2" placeholder="Cost incurred" />
              </div>
              {selectedCategory === 'Feed' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Type of Feed</label>
                    <select className="w-full border rounded px-3 py-2">
                      <option>Select Feed Type</option>
                      <option>Starter Feed</option>
                      <option>Grower Feed</option>
                      <option>Finisher Feed</option>
                      <option>Layer Feed</option>
                      <option>Pellet Feed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Amount</label>
                    <input className="w-full border rounded px-3 py-2" placeholder="Amount (Eg: 10 kg)" />
                  </div>
                </>
              )}
              {selectedCategory === 'Vaccination' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Name of vaccine</label>
                  <input className="w-full border rounded px-3 py-2" placeholder="Name of vaccine" />
                </div>
              )}
              {selectedCategory === 'Medication' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Name of medicine</label>
                  <input className="w-full border rounded px-3 py-2" placeholder="Name of medicine" />
                </div>
              )}
              {selectedCategory === 'Others' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Details i.e Transport, Electricity</label>
                  <input className="w-full border rounded px-3 py-2" placeholder="Details i.e Transport, Electricity" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <div className="flex gap-2">
                  <Button type="button" variant="outline">Cash</Button>
                  <Button type="button" variant="outline">Mobile Money</Button>
                  <Button type="button" variant="outline">Bank Transfer</Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input type="date" className="w-full border rounded px-3 py-2" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
