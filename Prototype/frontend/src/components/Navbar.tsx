import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, User, LogOut, ChevronDown, Check, Shield } from 'lucide-react';
import { Role } from '../types';

interface NavbarProps {
  user: { name: string; email: string; role: Role; id: string } | null;
  onRoleSwitch: (role: Role) => void;
  onLogout: () => void;
  notifications: any[];
  onMarkNotificationRead: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onRoleSwitch,
  onLogout,
  notifications,
  onMarkNotificationRead,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleRoleChange = (role: Role) => {
    onRoleSwitch(role);
    setShowRoleSwitcher(false);
    navigate('/dashboard');
  };

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case 'GOVERNMENT':
        return 'Government Officer';
      case 'STARTUP':
        return 'Startup Founder';
      case 'EXPERT':
        return 'Expert Evaluator';
      case 'ADMIN':
        return 'System Admin';
    }
  };

  const handleNotificationClick = (n: any) => {
    onMarkNotificationRead(n.id);
    setShowNotifications(false);
    navigate('/dashboard');
  };

  return (
    <nav className="bg-blue-950 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              {/* <Shield className="w-8 h-8 text-amber-500 fill-amber-500/20" /> */}
              <div className="GovVentureLogo">
                <img  src="../../public/content2.png" alt="GovVenture Logo" style={{ height: '60px' }} />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white block">
                  {/* GovVenture */}
                </span>
                <span className="text-[10px] text-slate-300 block -mt-1 font-medium">
                  {/* Find it | Test it | Scale it */}
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links based on role */}
          {user && (
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/dashboard' ? 'bg-blue-900 text-white' : 'text-slate-200 hover:bg-blue-900/50'
                }`}
              >
                Dashboard
              </Link>

              {user.role === 'GOVERNMENT' && (
                <Link
                  to="/challenges/create"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === '/challenges/create' ? 'bg-blue-900 text-white' : 'text-slate-200 hover:bg-blue-900/50'
                  }`}
                >
                  Create Challenge
                </Link>
              )}

              <Link
                to="/templates"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/templates' ? 'bg-blue-900 text-white' : 'text-slate-200 hover:bg-blue-900/50'
                }`}
              >
                Template Library
              </Link>

              {(user.role === 'GOVERNMENT' || user.role === 'ADMIN') && (
                <>
                  <Link
                    to="/audit-logs"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === '/audit-logs' ? 'bg-blue-900 text-white' : 'text-slate-200 hover:bg-blue-900/50'
                    }`}
                  >
                    Audit Trail
                  </Link>
                  <Link
                    to="/analytics"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === '/analytics' ? 'bg-blue-900 text-white' : 'text-slate-200 hover:bg-blue-900/50'
                    }`}
                  >
                    System Analytics
                  </Link>
                </>
              )}
            </div>
          )}

          {/* User Controls */}
          {user ? (
            <div className="flex items-center space-x-4">
              {/* Demo Role Switcher Button */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowRoleSwitcher(!showRoleSwitcher);
                    setShowNotifications(false);
                    setShowProfileMenu(false);
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-blue-950 font-bold rounded-lg text-xs transition-all shadow-sm"
                >
                  <span>{getRoleLabel(user.role)}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {showRoleSwitcher && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white text-slate-800 shadow-xl border border-slate-200 py-1.5 z-50">
                    <div className="px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Demo Role Switcher
                    </div>
                    {(['GOVERNMENT', 'STARTUP', 'EXPERT', 'ADMIN'] as Role[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => handleRoleChange(r)}
                        className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-slate-50 transition-colors ${
                          user.role === r ? 'font-semibold text-blue-900 bg-blue-50/50' : 'text-slate-700'
                        }`}
                      >
                        <span>{getRoleLabel(r)}</span>
                        {user.role === r && <Check className="w-4 h-4 text-blue-900" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowRoleSwitcher(false);
                    setShowProfileMenu(false);
                  }}
                  className="p-2 text-slate-200 hover:text-white hover:bg-blue-900/50 rounded-full relative transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white text-slate-800 shadow-xl border border-slate-200 z-50 overflow-hidden">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                      <span className="font-semibold text-sm text-slate-700">Notifications</span>
                      <span className="text-xs text-slate-400 font-medium">{unreadCount} unread</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-xs text-slate-400">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`px-4 py-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                              !n.isRead ? 'bg-blue-50/30 font-medium' : ''
                            }`}
                          >
                            <p className="text-slate-700">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile / Logout Menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                    setShowRoleSwitcher(false);
                  }}
                  className="flex items-center space-x-1.5 p-1 hover:bg-blue-900/50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs border border-slate-600">
                    {user.name.charAt(0)}
                  </div>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white text-slate-800 shadow-xl border border-slate-200 py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/login?register=true"
                className="px-4 py-2 text-sm font-semibold text-blue-950 bg-white hover:bg-slate-100 rounded-lg transition-all shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
