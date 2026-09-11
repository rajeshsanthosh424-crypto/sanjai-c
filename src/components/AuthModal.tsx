import React, { useState } from 'react';
import { X, UserCheck, Shield, Lock, Mail, User, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { login, register, switchUser, demoUsers } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegisterMode) {
        if (!name || !email) throw new Error('Name and email are required');
        await register(name, email, phone);
      } else {
        if (!email) throw new Error('Email is required');
        await login(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/10 p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Lock className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              {isRegisterMode ? 'Create an Account' : 'Sign In to Lost & Found'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Demo Switcher */}
        <div className="mt-4 p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100">
          <p className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider mb-2">
            ⚡ Quick 1-Click Demo Login
          </p>
          <div className="space-y-1.5">
            {demoUsers.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={async () => {
                  await switchUser(u.id);
                  onClose();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-xl bg-white hover:bg-indigo-600 hover:text-white text-slate-700 text-xs font-semibold shadow-2xs border border-indigo-100/60 transition-colors flex items-center justify-between group"
              >
                <span>{u.name}</span>
                <span className="text-[10px] uppercase font-bold opacity-60 group-hover:opacity-100">{u.role}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-[11px] uppercase font-bold text-slate-400">Or use email</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {error && (
          <div className="p-2.5 mb-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegisterMode && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rajesh Santhosh"
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {isRegisterMode && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone (Private - Not shown publicly)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            {loading ? 'Processing...' : isRegisterMode ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => setIsRegisterMode(!isRegisterMode)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            {isRegisterMode ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};
