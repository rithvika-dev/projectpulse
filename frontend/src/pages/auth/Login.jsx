import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Mail, Lock, LogIn, Sparkles, UserCheck } from 'lucide-react';

const DEMO_USERS = [
  {
    role: '👑 Org Admin',
    name: 'Elena Rostova',
    email: 'admin@projectpulse.com',
    password: 'Admin@123',
    desc: 'Full workspace & user governance',
  },
  {
    role: '📋 Project Mgr',
    name: 'Marcus Vance',
    email: 'pm@projectpulse.com',
    password: 'Pm@123',
    desc: 'Sprint planning & deliverables',
  },
  {
    role: '⚡ Team Lead',
    name: 'Aria Thorne',
    email: 'lead@projectpulse.com',
    password: 'Lead@123',
    desc: 'Technical workload & review',
  },
  {
    role: '💻 Developer',
    name: 'Devon Reed',
    email: 'dev@projectpulse.com',
    password: 'Dev@123',
    desc: 'Kanban tasks & code execution',
  },
  {
    role: '📊 Stakeholder',
    name: 'Sophia Chen',
    email: 'stakeholder@projectpulse.com',
    password: 'Stakeholder@123',
    desc: 'Milestone & timeline audit',
  },
];

export const Login = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please provide both email and password');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      success(`Welcome back, ${result.user?.name || 'User'}!`);
      navigate(from, { replace: true });
    } else {
      error(result.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleQuickLogin = (demo) => {
    setEmail(demo.email);
    setPassword(demo.password);
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold text-charcoal-900">Sign in to your account</h3>
        <p className="text-xs text-sand-600 mt-1">
          Access your teams, sprints, and project deliverable boards
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Work Email"
          type="email"
          placeholder="name@company.com"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-charcoal-700">
              Password
            </label>
            <NavLink
              to="/forgot-password"
              className="text-xs font-medium text-forest-600 hover:text-forest-700"
            >
              Forgot password?
            </NavLink>
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full mt-2"
          isLoading={isLoading}
          icon={LogIn}
        >
          Sign In
        </Button>
      </form>

      {/* Quick Demo Role Switcher */}
      <div className="mt-6 pt-5 border-t border-sand-200">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-amberGold-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-charcoal-800">
            One-Click Demo Credentials
          </span>
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {DEMO_USERS.map((demo, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickLogin(demo)}
              className="flex items-center justify-between p-2 rounded-lg bg-sand-50 hover:bg-forest-50 border border-sand-200 hover:border-forest-200 text-left transition-all text-xs group"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-charcoal-900 group-hover:text-forest-800">
                  {demo.role}
                </span>
                <span className="text-[11px] text-sand-500">({demo.name})</span>
              </div>
              <span className="text-[10px] text-forest-600 font-medium group-hover:underline">
                Use Login
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-sand-600">
        Don't have an account yet?{' '}
        <NavLink to="/register" className="font-semibold text-forest-600 hover:text-forest-700">
          Create workspace
        </NavLink>
      </p>
    </div>
  );
};
