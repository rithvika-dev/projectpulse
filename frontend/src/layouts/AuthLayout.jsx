import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Layers, CheckCircle2, ShieldCheck, Zap, Users } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-sand-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <NavLink to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-forest-500 text-white flex items-center justify-center shadow-md">
            <Layers className="w-6 h-6 stroke-[2.2]" />
          </div>
          <span className="text-2xl font-extrabold text-charcoal-900 tracking-tight">
            PROJECT<span className="text-forest-600">PULSE</span>
          </span>
        </NavLink>
        <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-sand-600">
          Agile Project & Team Collaboration Suite
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-sand-200 shadow-dropdown">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
