import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface ComingSoonDialogProps {
  open: boolean;
  onClose: () => void;
  featureName?: string;
}

export default function ComingSoonDialog({ open, onClose, featureName }: ComingSoonDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm p-6 text-center">
        <div className="text-5xl mb-2">🚧</div>
        <h2 className="text-lg font-bold mb-2">{featureName || 'Feature'} Coming Soon</h2>
        <div className="text-gray-600 mb-4">We are working hard to bring this feature to you. Stay tuned!</div>
        <Button onClick={onClose}>Close</Button>
      </Card>
    </div>
  );
}
