import React, { useState } from 'react';
import { Sparkles, Shield, MapPin, Calendar, Check, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { Match, Item } from '../types';

interface MatchCardProps {
  match: Match;
  onInitiateClaim: (match: Match) => void;
  onOpenMessage?: (threadId: string, recipientId: string, recipientName: string) => void;
  onViewItemDetails?: (item: Item) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  onInitiateClaim,
  onOpenMessage,
  onViewItemDetails,
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const { lostItem, foundItem, matchScore, reasons, aiSummary, breakdown } = match;

  if (!lostItem || !foundItem) return null;

  // Determine color scheme based on match confidence
  const getBadgeColor = (score: number) => {
    if (score >= 90) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 80) return 'text-indigo-700 bg-indigo-50 border-indigo-200';
    return 'text-amber-700 bg-amber-50 border-amber-200';
  };

  return (
    <div
      id={`match-card-${match.id}`}
      className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 sm:p-6"
    >
      {/* Header with Match Confidence Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Detection</span>
            <h4 className="text-sm font-bold text-slate-900">Potential Match</h4>
          </div>
        </div>

        {/* Big Confidence Score Pill */}
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-sm font-extrabold ${getBadgeColor(
            matchScore
          )}`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          {matchScore}% Match Confidence
        </div>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
        {/* Lost Item Column */}
        <div className="flex gap-3.5 p-3.5 rounded-xl bg-rose-50/40 border border-rose-100">
          <img
            src={lostItem.imageUrl}
            alt={lostItem.title}
            className="h-20 w-20 rounded-lg object-cover ring-1 ring-rose-200 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-rose-100 text-rose-700 mb-1">
              Lost Report
            </span>
            <h5 className="font-bold text-slate-900 text-sm truncate">{lostItem.title}</h5>
            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{lostItem.category} • {lostItem.color}</p>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
              <MapPin className="h-3 w-3 text-rose-500 shrink-0" />
              <span className="truncate">{lostItem.location.name}</span>
            </div>
          </div>
        </div>

        {/* Found Item Column */}
        <div className="flex gap-3.5 p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-100">
          <img
            src={foundItem.imageUrl}
            alt={foundItem.title}
            className="h-20 w-20 rounded-lg object-cover ring-1 ring-emerald-200 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-emerald-100 text-emerald-700 mb-1">
              Found Report
            </span>
            <h5 className="font-bold text-slate-900 text-sm truncate">{foundItem.title}</h5>
            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{foundItem.category} • {foundItem.color}</p>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
              <MapPin className="h-3 w-3 text-emerald-500 shrink-0" />
              <span className="truncate">{foundItem.location.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Reasons Checklist */}
      <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 mb-4">
        <p className="text-xs font-bold text-slate-700 mb-2">Matching Reasons Analyzed by Gemini:</p>
        <ul className="space-y-1.5 text-xs text-slate-600">
          {reasons.map((r, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold shrink-0">✓</span>
              <span>{r.replace(/^✓\s*/, '')}</span>
            </li>
          ))}
        </ul>

        {aiSummary && (
          <p className="mt-3 text-xs text-slate-600 italic border-t border-slate-200/60 pt-2.5">
            "{aiSummary}"
          </p>
        )}
      </div>

      {/* Scoring Breakdown Accordion */}
      {breakdown && (
        <div className="mb-4">
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            {showBreakdown ? 'Hide Hybrid Score Breakdown' : 'View Hybrid Score Breakdown (35% Image, 25% Text, etc.)'}
            {showBreakdown ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {showBreakdown && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl bg-indigo-50/40 border border-indigo-100 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] block">Image Match (35%)</span>
                <span className="font-bold text-slate-800">{breakdown.imageScore} / 35</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Description (25%)</span>
                <span className="font-bold text-slate-800">{breakdown.descriptionScore} / 25</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Category &amp; Color (20%)</span>
                <span className="font-bold text-slate-800">
                  {breakdown.categoryScore + breakdown.colorScore} / 20
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Proximity &amp; Time (15%)</span>
                <span className="font-bold text-slate-800">
                  {breakdown.locationScore + breakdown.dateTimeScore} / 15
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <span className="text-[11px] text-slate-400">
          Detected on {new Date(match.createdAt).toLocaleDateString()}
        </span>

        <div className="flex items-center gap-2">
          {onOpenMessage && (
            <button
              onClick={() => onOpenMessage(match.id, foundItem.reporterId, foundItem.reporterName)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 text-xs font-semibold transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Safe Message
            </button>
          )}

          <button
            id={`btn-initiate-claim-${match.id}`}
            onClick={() => onInitiateClaim(match)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-semibold shadow-xs transition-colors"
          >
            <Shield className="h-3.5 w-3.5" />
            Submit Ownership Claim
          </button>
        </div>
      </div>
    </div>
  );
};
