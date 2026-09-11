import React, { useState } from 'react';
import { X, Flag, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Item } from '../types';
import { api } from '../services/api';

interface ReportAbuseModalProps {
  item: Item | null;
  onClose: () => void;
}

export const ReportAbuseModal: React.FC<ReportAbuseModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const [reason, setReason] = useState('Suspicious or fraudulent item');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const reasons = [
    'Suspicious or fraudulent item',
    'Duplicate listing / spam',
    'Harassment or inappropriate image',
    'Item already recovered / invalid',
    'Other concern',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.reportAbuse(item.id, reason, details);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to report abuse:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/10 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <Flag className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Report Suspicious Report</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
            <p className="font-bold text-slate-900 text-sm">Report Received</p>
            <p className="text-xs text-slate-500">Our administrative safety team will inspect this listing.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Flagging</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
              >
                {reasons.map((r, i) => (
                  <option key={i} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Details &amp; Observations</label>
              <textarea
                rows={3}
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain why this listing seems suspicious, fraudulent, or requires moderation..."
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
