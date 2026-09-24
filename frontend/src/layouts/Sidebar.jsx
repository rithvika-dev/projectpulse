import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/common/Avatar';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Zap,
  AlertCircle,
  Activity,
  BarChart3,
  Settings,
  LogOut,
  Layers,
  Sparkles,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', path: '/projects', icon: FolderKanban },
  { label: 'My Tasks', path: '/tasks', icon: CheckSquare },
  { label: 'Teams', path: '/teams', icon: Users },
  { label: 'Issues', path: '/issues', icon: AlertCircle },
  { label: 'Activity', path: '/activity', icon: Activity },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'organization_admin':
        return 'Org Admin';
      case 'project_manager':
        return 'Project Manager';
      case 'team_lead':
        return 'Team Lead';
      case 'developer':
        return 'Developer';
      case 'stakeholder':
        return 'Stakeholder';
      default:
        return 'Member';
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-charcoal-950/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-sand-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center px-6 border-b border-sand-200">
          <NavLink to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-forest-500 text-white flex items-center justify-center shadow-sm">
              <Layers className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-base font-bold text-charcoal-900 tracking-tight block leading-none">
                PROJECT<span className="text-forest-600 font-extrabold">PULSE</span>
              </span>
              <span className="text-[10px] text-sand-500 font-medium tracking-wide block mt-1 uppercase">
                {user?.organizationName || 'NovaWorks Workspace'}
              </span>
            </div>
          </NavLink>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-sand-500">
            Workspace
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-forest-50 text-forest-800 font-semibold border border-forest-100 shadow-subtle'
                      : 'text-charcoal-700 hover:bg-sand-100/70 hover:text-charcoal-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Profile & Logout Bottom Section */}
        <div className="p-3 border-t border-sand-200 bg-sand-50/50">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-sand-200 shadow-subtle">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar
                src={user?.avatar}
                name={user?.name || 'User'}
                size="sm"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-charcoal-900 truncate">
                  {user?.name}
                </p>
                <p className="text-[10px] font-medium text-forest-700 truncate">
                  {getRoleDisplayName(user?.role)}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-sand-400 hover:text-terracotta-600 hover:bg-terracotta-50 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
