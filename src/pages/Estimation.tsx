import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

const estimationTypes = [
  { label: 'Eggs', description: 'Estimate egg production' },
  { label: 'Birds', description: 'Estimate bird growth' },
];

export default function Estimation() {
  const [selectedType, setSelectedType] = useState('Eggs');
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Estimation</h1>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {estimationTypes.map(type => (
          <Card
            key={type.label}
            className={`p-4 flex flex-col items-center cursor-pointer border-2 ${selectedType === type.label ? 'border-blue-500' : 'border-gray-200'}`}
            onClick={() => { setSelectedType(type.label); setShowForm(false); }}
          >
            <span className="text-lg font-semibold">{type.label}</span>
            <span className="text-xs text-gray-500 mt-1">{type.description}</span>
          </Card>
        ))}
      </div>
      {!showForm ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-5xl mb-2">📈</div>
          <div className="text-gray-600 mb-2">No {selectedType} Estimation Yet</div>
          <div className="text-sm text-gray-500 mb-4">Click below to estimate {selectedType.toLowerCase()}.</div>
          <Button onClick={() => setShowForm(true)}>Estimate {selectedType}</Button>
        </div>
      ) : (
        <Card className="p-6 max-w-md mx-auto">
          <h2 className="text-lg font-bold mb-4">{selectedType} Estimation</h2>
          <form className="space-y-4">
            {selectedType === 'Eggs' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Number of Birds</label>
                  <input className="w-full border rounded px-3 py-2" placeholder="e.g. 100" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Laying Rate (%)</label>
                  <input className="w-full border rounded px-3 py-2" placeholder="e.g. 85" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Days</label>
                  <input className="w-full border rounded px-3 py-2" placeholder="e.g. 7" />
                </div>
              </>
            )}
            {selectedType === 'Birds' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Number of Chicks</label>
                  <input className="w-full border rounded px-3 py-2" placeholder="e.g. 50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Expected Survival Rate (%)</label>
                  <input className="w-full border rounded px-3 py-2" placeholder="e.g. 90" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Days</label>
                  <input className="w-full border rounded px-3 py-2" placeholder="e.g. 30" />
                </div>
              </>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit">Estimate</Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
