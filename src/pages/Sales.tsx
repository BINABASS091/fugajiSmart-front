import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

const salesTabs = ['All', 'Eggs', 'Birds', 'Custom'];

export default function Sales() {
  const [activeTab, setActiveTab] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState('Eggs');

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="flex gap-2 mb-4">
        {salesTabs.map(tab => (
          <Button key={tab} variant={activeTab === tab ? 'default' : 'outline'} onClick={() => setActiveTab(tab)}>{tab}</Button>
        ))}
      </div>
      <div className="space-y-3 mb-6">
        <Card className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50" onClick={() => { setSelectedType('Eggs'); setShowAddModal(true); }}>
          <span className="font-semibold text-gray-800">Eggs</span>
          <span className="text-sm text-gray-500">- Table, Fertile</span>
        </Card>
        <Card className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50" onClick={() => { setSelectedType('Birds'); setShowAddModal(true); }}>
          <span className="font-semibold text-gray-800">Birds</span>
          <span className="text-sm text-gray-500">- Broiler, Layer</span>
        </Card>
      </div>
      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-5xl mb-2">💸</div>
        <div className="text-gray-600 mb-2">No {selectedType} Sale Recorded</div>
        <div className="text-sm text-gray-500 mb-4">Click "Add" to record a new sale.</div>
        <Button onClick={() => setShowAddModal(true)}>+ Add</Button>
      </div>
      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Add {selectedType} Sale</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>✕</Button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input className="w-full border rounded px-3 py-2" placeholder={selectedType === 'Eggs' ? 'Number of eggs' : 'Number of birds'} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unit Price</label>
                <input className="w-full border rounded px-3 py-2" placeholder="Unit price (e.g. 500)" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total</label>
                <input className="w-full border rounded px-3 py-2" placeholder="Total" />
              </div>
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
