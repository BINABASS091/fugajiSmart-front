import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function RegisterFlock() {
  const [showWarning, setShowWarning] = useState(false);

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Register New Flock</h1>
      {showWarning && (
        <Card className="p-4 mb-4 bg-yellow-50 border-yellow-300 border text-yellow-800">
          <div className="font-semibold mb-1">Warning</div>
          <div className="text-sm">Please ensure all flock details are accurate. Incorrect data may affect your farm records.</div>
        </Card>
      )}
      <Card className="p-6">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Flock Name</label>
            <input className="w-full border rounded px-3 py-2" placeholder="e.g. Layer Batch 1" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select className="w-full border rounded px-3 py-2">
              <option>Layer</option>
              <option>Broiler</option>
              <option>Cockerel</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Number of Birds</label>
            <input className="w-full border rounded px-3 py-2" placeholder="e.g. 100" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date Acquired</label>
            <input type="date" className="w-full border rounded px-3 py-2" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Source</label>
            <input className="w-full border rounded px-3 py-2" placeholder="e.g. Local Hatchery" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="showWarning" checked={showWarning} onChange={() => setShowWarning(!showWarning)} />
            <label htmlFor="showWarning" className="text-sm">Show warning</label>
          </div>
          <div className="flex justify-between items-center pt-2">
            <a href="https://example.com/flock-info" target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm underline">More info</a>
            <div className="flex gap-2">
              <Button variant="outline">Cancel</Button>
              <Button type="submit">Register</Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
