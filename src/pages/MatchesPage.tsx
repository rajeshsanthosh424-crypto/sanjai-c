import React, { useState } from 'react';
import { Sparkles, SlidersHorizontal, ArrowUpDown, Filter, Shield, AlertCircle } from 'lucide-react';
import { Match, Item } from '../types';
import { MatchCard } from '../components/MatchCard';
import { useAuth } from '../context/AuthContext';

interface MatchesPageProps {
  matches: Match[];
  onInitiateClaim: (match: Match) => void;
  onOpenMessage: (threadId: string, recipientId: string, recipientName: string) => void;
  onViewItemDetails: (item: Item) => void;
}

export const MatchesPage: React.FC<MatchesPageProps> = ({
  matches,
  onInitiateClaim,
  onOpenMessage,
  onViewItemDetails,
}) => {
  const { user } = useAuth();
  const [minConfidenceThreshold, setMinConfidenceThreshold] = useState<number>(70);
  const [filterOnlyMine, setFilterOnlyMine] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'score' | 'date'>('score');

  const filteredMatches = matches
    .filter((m) => {
      if (m.matchScore < minConfidenceThreshold) return false;
      if (filterOnlyMine && user) {
        const isMyLost = m.lostItem?.reporterId === user.id;
        const isMyFound = m.foundItem?.reporterId === user.id;
        if (!isMyLost && !isMyFound) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.matchScore - a.matchScore;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Matching Center</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gemini hybrid multimodal algorithms matching lost reports with discovered items.
          </p>
        </div>

        {/* Filter Pill */}
        <div className="flex items-center gap-2">
          {user && (
            <button
              onClick={() => setFilterOnlyMine(!filterOnlyMine)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                filterOnlyMine
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Only My Items ({user.name.split(' ')[0]})
            </button>
          )}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-xl border border-slate-200 bg-white py-1.5 px-3 text-xs text-slate-700 font-semibold focus:outline-none focus:border-indigo-500"
          >
            <option value="score">Highest Match % First</option>
            <option value="date">Most Recent First</option>
          </select>
        </div>
      </div>

      {/* Threshold & Scoring Explanation Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-900">
              Minimum AI Confidence Threshold:
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-extrabold">
              {minConfidenceThreshold}%
            </span>
          </div>

          <span className="text-xs text-slate-500">
            Showing <b>{filteredMatches.length}</b> potential matches exceeding threshold
          </span>
        </div>

        {/* Range Slider */}
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-semibold text-slate-400">50% (Loose)</span>
          <input
            type="range"
            min="50"
            max="95"
            step="5"
            value={minConfidenceThreshold}
            onChange={(e) => setMinConfidenceThreshold(Number(e.target.value))}
            className="flex-1 accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
          />
          <span className="text-[11px] font-semibold text-slate-400">95% (Strict)</span>
        </div>

        {/* Formula breakdown */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] text-slate-600">
          <div>
            <span className="font-bold text-slate-800 block">35% Image Analysis</span>
            <span>Multimodal visual embeddings</span>
          </div>
          <div>
            <span className="font-bold text-slate-800 block">25% Text Semantic</span>
            <span>Gemini description semantics</span>
          </div>
          <div>
            <span className="font-bold text-slate-800 block">20% Category &amp; Color</span>
            <span>Categorical &amp; shade overlap</span>
          </div>
          <div>
            <span className="font-bold text-slate-800 block">20% Geo &amp; Time</span>
            <span>Spatial distance &amp; chronological order</span>
          </div>
        </div>
      </div>

      {/* Matches List */}
      {filteredMatches.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white border border-slate-200 p-8">
          <Sparkles className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-sm">No matches above {minConfidenceThreshold}%</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting the confidence slider to 60% or 50% to inspect potential candidates.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filteredMatches.map((m) => (
            <MatchCard
              key={m.id}
              match={m}
              onInitiateClaim={onInitiateClaim}
              onOpenMessage={onOpenMessage}
              onViewItemDetails={onViewItemDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
};
