import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Search,
  PlusCircle,
  ShieldCheck,
  Bell,
  Sparkles,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Inbox,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Notification } from '../types';
import { api } from '../services/api';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenReportModal?: (type: 'lost' | 'found') => void;
  onOpenAuthModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenReportModal,
  onOpenAuthModal,
}) => {
  const { user, logout, switchUser, demoUsers } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 8000);
    return () => clearInterval(interval);
  }, [user]);

  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'lost', label: 'Lost Items' },
    { id: 'found', label: 'Found Items' },
    { id: 'matches', label: 'AI Matches', badge: 'AI' },
    { id: 'dashboard', label: 'Dashboard' },
    ...(user?.role === 'admin' ? [{ id: 'admin', label: 'Admin Panel', badge: 'Admin' }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div
          id="nav-brand-logo"
          onClick={() => onSelectTab('home')}
          className="flex cursor-pointer items-center gap-2.5 transition-transform hover:opacity-95"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-500 text-white shadow-sm ring-1 ring-indigo-500/20">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Lost<span className="text-indigo-600">&amp;</span>Found
              </span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 ring-1 ring-indigo-700/10">
                <Sparkles className="h-2.5 w-2.5 text-indigo-600" /> Smart AI
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 -mt-0.5">Item Recovery System</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {item.label}
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                      item.badge === 'Admin'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Controls & User Profile */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Quick Report Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              id="nav-btn-report-lost"
              onClick={() => (onOpenReportModal ? onOpenReportModal('lost') : onSelectTab('report-lost'))}
              className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors border border-rose-200/60 shadow-xs"
            >
              <PlusCircle className="h-3.5 w-3.5 text-rose-600" />
              Report Lost
            </button>
            <button
              id="nav-btn-report-found"
              onClick={() => (onOpenReportModal ? onOpenReportModal('found') : onSelectTab('report-found'))}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200/60 shadow-xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Report Found
            </button>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              id="nav-btn-notifications"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors border border-transparent hover:border-slate-200"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div
                id="notifications-panel"
                className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-900/10 z-50 animate-in fade-in slide-in-from-top-2"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="mt-3 max-h-72 overflow-y-auto space-y-2 divide-y divide-slate-50">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      <Inbox className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          handleMarkAsRead(n.id);
                          if (n.link) onSelectTab(n.link.replace('/', ''));
                          setIsNotifOpen(false);
                        }}
                        className={`pt-2 pb-2 px-2.5 rounded-xl cursor-pointer transition-colors ${
                          !n.read ? 'bg-indigo-50/50 hover:bg-indigo-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Account / Switch Demo User Menu */}
          <div className="relative" ref={userMenuRef}>
            {user ? (
              <button
                id="nav-btn-user-profile"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 rounded-xl p-1.5 pr-2.5 hover:bg-slate-100 transition-colors border border-slate-200/70"
              >
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={user.name}
                  className="h-8 w-8 rounded-lg object-cover ring-1 ring-slate-200"
                />
                <div className="text-left hidden xl:block">
                  <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">{user.name}</p>
                  <p className="text-[10px] text-indigo-600 font-medium capitalize">{user.role}</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>
            ) : (
              <button
                id="nav-btn-login"
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm transition-all"
              >
                <UserIcon className="h-3.5 w-3.5" /> Sign In
              </button>
            )}

            {isUserMenuOpen && user && (
              <div
                id="user-profile-dropdown"
                className="absolute right-0 mt-2 w-72 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-slate-900/10 z-50 animate-in fade-in"
              >
                <div className="p-2 border-b border-slate-100 mb-2">
                  <p className="text-xs font-semibold text-slate-900">{user.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                    Role: {user.role}
                  </span>
                </div>

                {/* Quick Role / User Switcher for Testing */}
                <div className="px-2 py-1.5">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">
                    Switch Test Persona
                  </p>
                  <div className="space-y-1">
                    {demoUsers.map(du => (
                      <button
                        key={du.id}
                        onClick={() => {
                          switchUser(du.id);
                          setIsUserMenuOpen(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 text-xs rounded-lg flex items-center justify-between transition-colors ${
                          user.id === du.id
                            ? 'bg-indigo-50 text-indigo-700 font-semibold'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{du.name}</span>
                        {user.id === du.id && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1">
                  <button
                    onClick={() => {
                      onSelectTab('dashboard');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
                  >
                    View My Dashboard
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-medium flex items-center gap-1.5"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
            <button
              onClick={() => {
                onSelectTab('report-lost');
                setIsMobileMenuOpen(false);
              }}
              className="py-2 px-3 text-center text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 border border-rose-200"
            >
              + Report Lost
            </button>
            <button
              onClick={() => {
                onSelectTab('report-found');
                setIsMobileMenuOpen(false);
              }}
              className="py-2 px-3 text-center text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200"
            >
              + Report Found
            </button>
          </div>

          <div className="space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg flex items-center justify-between ${
                  currentTab === item.id ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {user ? (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-lg object-cover" />
                <div>
                  <p className="text-xs font-bold text-slate-800">{user.name}</p>
                  <p className="text-[10px] text-slate-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                if (onOpenAuthModal) onOpenAuthModal();
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </header>
  );
};
