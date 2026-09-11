import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Tag,
  Shield,
  MessageSquare,
  Sparkles,
  Flag,
  Share2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Item, Match } from '../types';

interface ItemDetailsModalProps {
  item: Item | null;
  onClose: () => void;
  onInitiateClaim?: (item: Item) => void;
  onOpenMessage?: (threadId: string, recipientId: string, recipientName: string) => void;
  onReportAbuse?: (item: Item) => void;
}

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
  item,
  onClose,
  onInitiateClaim,
  onOpenMessage,
  onReportAbuse,
}) => {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const isLost = item.type === 'lost';

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div
        id="item-details-modal-content"
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/10 my-8 max-h-[90vh] flex flex-col"
      >
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                isLost ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {isLost ? 'Lost Item Report' : 'Found Item Report'}
            </span>
            <span className="text-xs text-slate-400">ID: {item.id}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              title="Share report link"
              className="p-2 text-slate-500 hover:text-indigo-600 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {copied && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              Report link copied to clipboard!
            </div>
          )}

          {/* Hero Image */}
          <div className="relative aspect-16/9 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80">
            <img
              src={item.imageUrl}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-3 left-3 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-xs font-semibold">
              Category: {item.category}
            </div>
          </div>

          {/* Title & Metadata */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-snug">{item.title}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {item.location.name}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {item.date} {item.time && `at ${item.time}`}
              </span>
              <span>•</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-700">
                Color: {item.color}
              </span>
              {item.brandModel && (
                <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-700">
                  Brand: {item.brandModel}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Description</h4>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{item.description}</p>
            {item.additionalObservations && (
              <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Additional observations: </span>
                {item.additionalObservations}
              </div>
            )}
          </div>

          {/* Privacy & Safe Contact Banner */}
          <div className="rounded-2xl bg-indigo-50/50 p-4 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-3">
            <Shield className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Privacy Protected by System</p>
              <p className="text-indigo-800/80 mt-0.5 leading-relaxed">
                Contact information, exact residences, and identification numbers are never revealed publicly. Use the safe in-app messaging or submit a formal ownership claim.
              </p>
            </div>
          </div>

          {/* Location Map Pin Info */}
          <div className="rounded-2xl border border-slate-200/80 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Reported Location</span>
              <span className="text-[11px] text-slate-400">Lat: {item.location.lat}, Lng: {item.location.lng}</span>
            </div>
            <p className="text-xs font-semibold text-slate-900">{item.location.name}</p>
            {item.location.address && <p className="text-xs text-slate-500 mt-0.5">{item.location.address}</p>}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {onReportAbuse && (
            <button
              onClick={() => onReportAbuse(item)}
              className="text-xs text-slate-500 hover:text-rose-600 font-medium flex items-center gap-1.5 transition-colors"
            >
              <Flag className="h-3.5 w-3.5" />
              Report listing
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {onOpenMessage && (
              <button
                onClick={() => onOpenMessage(item.id, item.reporterId, item.reporterName)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5 text-indigo-600" />
                Safe Message
              </button>
            )}

            {!isLost && item.status === 'active' && onInitiateClaim && (
              <button
                onClick={() => onInitiateClaim(item)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-xs font-bold shadow-xs transition-colors"
              >
                <Shield className="h-3.5 w-3.5" />
                Claim Ownership
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
