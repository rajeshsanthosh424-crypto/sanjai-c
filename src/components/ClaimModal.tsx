import React, { useState } from 'react';
import { X, ShieldCheck, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Item, Match } from '../types';
import { api } from '../services/api';

interface ClaimModalProps {
  itemOrMatch: Item | Match | null;
  onClose: () => void;
  onClaimSubmitted: () => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  itemOrMatch,
  onClose,
  onClaimSubmitted,
}) => {
  if (!itemOrMatch) return null;

  // Extract foundItem and lostItem
  let foundItem: Item;
  let lostItemId: string = '';

  if ('matchScore' in itemOrMatch) {
    foundItem = itemOrMatch.foundItem!;
    lostItemId = itemOrMatch.lostItemId;
  } else {
    foundItem = itemOrMatch;
    lostItemId = itemOrMatch.id;
  }

  const [hiddenDetails, setHiddenDetails] = useState('');
  const [serialNumberProof, setSerialNumberProof] = useState('');
  const [proofImageUrl, setProofImageUrl] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Proof image file size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProofImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hiddenDetails.trim()) {
      setError('Please provide at least one secret or hidden identifying detail.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await api.createClaim({
        lostItemId: lostItemId || foundItem.id,
        foundItemId: foundItem.id,
        hiddenDetails,
        serialNumberProof,
        proofImageUrl,
        message,
      });

      setSuccess(true);
      setTimeout(() => {
        onClaimSubmitted();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit ownership claim.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div
        id="claim-modal-container"
        className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/10 my-8 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-indigo-50/50">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Claim Ownership Verification</h3>
              <p className="text-[11px] text-slate-500">Provide proof to verify item return safely</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Claim Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              Ownership claim submitted successfully! The finder has been notified.
            </div>
          )}

          {/* Item Reference Info */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <img
              src={foundItem.imageUrl}
              alt=""
              className="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-200"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Found Item Being Claimed</span>
              <p className="text-xs font-bold text-slate-900 truncate">{foundItem.title}</p>
              <p className="text-[11px] text-slate-500">{foundItem.location.name} • {foundItem.date}</p>
            </div>
          </div>

          {/* Requirement 1: Hidden Identifying Details */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Secret or Hidden Identifying Characteristics <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-slate-500 mb-1.5 leading-relaxed">
              Describe unique aspects only the true owner would know (e.g. inner engravings, specific scratches, lock screen photo, wallet contents, or custom stickers).
            </p>
            <textarea
              id="claim-hidden-details-input"
              rows={3}
              required
              value={hiddenDetails}
              onChange={(e) => setHiddenDetails(e.target.value)}
              placeholder="e.g. The wallet has initials 'RS' stamped on the interior fold, and contains a gym card and metro card."
              className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Requirement 2: Serial Number or Identifier */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Serial Number / Device IMEI / Unique ID (Optional)
            </label>
            <input
              id="claim-serial-number-input"
              type="text"
              value={serialNumberProof}
              onChange={(e) => setSerialNumberProof(e.target.value)}
              placeholder="e.g. Serial: DN6X9827..., Model ID, or Student ID Number"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Requirement 3: Proof of Purchase / Receipt Image Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Proof of Ownership / Purchase Receipt (Optional)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-500 p-3 text-xs font-semibold text-slate-600 transition-colors bg-slate-50/50">
                <Upload className="h-4 w-4 text-indigo-600" />
                <span>Upload receipt, box photo, or previous photo of item</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {proofImageUrl && (
                <img
                  src={proofImageUrl}
                  alt="Proof preview"
                  className="h-12 w-12 rounded-xl object-cover ring-1 ring-indigo-500 shrink-0"
                />
              )}
            </div>
          </div>

          {/* Message to Finder */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Message to the Finder
            </label>
            <textarea
              id="claim-message-input"
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Polite message to coordinate return or clarify verification..."
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-submit-claim-form"
              type="submit"
              disabled={isSubmitting || success}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors"
            >
              {isSubmitting ? 'Submitting Proof...' : 'Submit Claim Verification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
