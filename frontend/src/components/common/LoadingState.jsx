import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({ message = 'Loading workspace data...', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className="w-12 h-12 rounded-full bg-forest-50 border border-forest-100 flex items-center justify-center mb-3 text-forest-600">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
      <p className="text-sm font-medium text-charcoal-700">{message}</p>
      <p className="text-xs text-sand-500 mt-1">Connecting to ProjectPulse services...</p>
    </div>
  );
};
