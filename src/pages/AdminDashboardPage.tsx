import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  TrendingUp,
  Package,
  CheckCircle2,
  Users,
  AlertTriangle,
  Trash2,
  Check,
  X,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { SystemStats, ReportAbuse, User } from '../types';

interface AdminDashboardPageProps {
  onRefreshData?: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onRefreshData }) => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [reports, setReports] = useState<ReportAbuse[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, reportsRes, usersRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminReports(),
        api.getAdminUsers(),
      ]);
      setStats(statsRes.stats);
      setReports(reportsRes.reports || []);
      setUsers(usersRes.users || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleResolveReport = async (reportId: string, action: 'removed_item' | 'dismissed') => {
    try {
      await api.resolveAdminReport(reportId, 'resolved', action);
      await loadAdminData();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Error resolving report:', err);
    }
  };

  if (loading || !stats) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">
        Loading administrator metrics and moderation queues...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-600 text-white shadow-xs">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Admin &amp; Moderation</h1>
            <p className="text-xs text-slate-500">Platform analytics, fraud prevention, and community oversight</p>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Lost</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-900">{stats.totalLost}</span>
            <span className="text-[11px] font-bold text-rose-600">Active</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Found</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-900">{stats.totalFound}</span>
            <span className="text-[11px] font-bold text-emerald-600">Reported</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">AI Matches</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-900">{stats.totalMatches}</span>
            <span className="text-[11px] font-bold text-indigo-600">Identified</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Items Recovered</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-900">{stats.totalRecovered}</span>
            <span className="text-[11px] font-bold text-emerald-600">Returned</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Recovery Rate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-900">{stats.recoveryRate}%</span>
            <span className="text-[11px] font-bold text-indigo-600">Efficiency</span>
          </div>
        </div>
      </div>

      {/* Moderation Queue */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900">Fraud &amp; Abuse Moderation Reports</h2>
          </div>
          <span className="text-xs text-slate-400">{reports.length} total flagged</span>
        </div>

        {reports.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No open abuse reports. Community safety clean!</p>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">Reason: {r.reason}</span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        r.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">"{r.details}"</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Flagged Item ID: {r.itemId} by {r.reporterName} on {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {r.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResolveReport(r.id, 'dismissed')}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-white text-slate-700 font-semibold"
                    >
                      Dismiss Report
                    </button>
                    <button
                      onClick={() => handleResolveReport(r.id, 'removed_item')}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                    >
                      Remove Fraudulent Item
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Directory */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Registered Users &amp; Roles</h2>
          </div>
          <span className="text-xs text-slate-400">{users.length} registered accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Account Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 flex items-center gap-2 font-semibold text-slate-900">
                    <img src={u.avatarUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
                    {u.name}
                  </td>
                  <td className="py-3 px-3 text-slate-600">{u.email}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                        u.role === 'admin'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
