import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Layers, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-sand-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-600 mb-4 shadow-subtle">
        <Layers className="w-7 h-7" />
      </div>
      <h1 className="text-4xl font-extrabold text-charcoal-900 tracking-tight mb-2">404</h1>
      <h3 className="text-lg font-bold text-charcoal-800 mb-1">Page not found</h3>
      <p className="text-xs text-sand-600 max-w-sm mb-6 leading-relaxed">
        The page or resource you are looking for has been moved or does not exist in this workspace.
      </p>
      <NavLink to="/dashboard">
        <Button variant="primary" size="sm" icon={ArrowLeft}>
          Back to Dashboard
        </Button>
      </NavLink>
    </div>
  );
};
