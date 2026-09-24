import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Avatar } from '../components/common/Avatar';
import { SearchBar } from '../components/common/SearchBar';
import {
  Menu,
  Bell,
  Check,
  CheckCheck,
  ExternalLink,
  Shield,
  Briefcase,
  ChevronDown,
} from 'lucide-react';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (val) => {
    setSearchQuery(val);
    if (val.trim()) {
      navigate(`/projects?search=${encodeURIComponent(val.trim())}`);
    }
  };

  const handleNotificationClick = (notif) => {
    markAsRead(notif._id);
    if (notif.link) {
      navigate(notif.link);
    }
    setIsNotifOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-sand-200 px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu Toggle & Workspace Info */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-charcoal-700 hover:bg-sand-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-sand-100 text-charcoal-800 text-xs font-semibold border border-sand-200">
          <Briefcase className="w-3.5 h-3.5 text-forest-600" />
          <span>{user?.organizationName || 'NovaWorks'}</span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md">
        <SearchBar
          value={searchQuery}
          onChange={handleSearchSubmit}
          placeholder="Search projects, tasks, issues across organization..."
        />
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-3">
        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-xl text-charcoal-700 hover:bg-sand-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-terracotta-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Flyout */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-sand-200 shadow-dropdown overflow-hidden animate-slide-down z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-sand-200 bg-sand-50/70">
                <div className="flex items-center gap-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
                    Notifications
                  </h5>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-forest-100 text-forest-800">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-forest-600 hover:text-forest-700 font-medium inline-flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-sand-100">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3.5 text-xs hover:bg-sand-50 cursor-pointer transition-colors flex items-start gap-3 ${
                        !notif.read ? 'bg-forest-50/30' : ''
                      }`}
                    >
                      <Avatar
                        src={notif.sender?.avatar}
                        name={notif.sender?.name || 'System'}
                        size="xs"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="font-semibold text-charcoal-900 truncate">
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-terracotta-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sand-600 leading-snug line-clamp-2">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-sand-400 mt-1 block">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-sand-500">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-sand-100 transition-colors"
          >
            <Avatar
              src={user?.avatar}
              name={user?.name || 'User'}
              size="sm"
            />
            <ChevronDown className="w-3.5 h-3.5 text-sand-500" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-sand-200 shadow-dropdown overflow-hidden animate-slide-down z-50">
              <div className="px-4 py-3 border-b border-sand-200 bg-sand-50/60">
                <p className="text-xs font-bold text-charcoal-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-sand-500 truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-forest-100 text-forest-800">
                  {user?.role?.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="p-1 text-xs">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-sand-100 text-charcoal-700 font-medium transition-colors"
                >
                  Account & Organization Settings
                </button>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/tasks');
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-sand-100 text-charcoal-700 font-medium transition-colors"
                >
                  My Assigned Tasks
                </button>
                <div className="my-1 border-t border-sand-200" />
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
