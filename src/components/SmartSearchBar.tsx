import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight, Loader2, X } from 'lucide-react';
import { api } from '../services/api';
import { Item } from '../types';

interface SmartSearchBarProps {
  onResults: (results: Item[], queryText: string, parsedInfo: any) => void;
  onClear: () => void;
  placeholder?: string;
}

export const SmartSearchBar: React.FC<SmartSearchBarProps> = ({
  onResults,
  onClear,
  placeholder = 'Try: "I lost a black Samsung phone near Grand Central yesterday"',
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsedCriteria, setParsedCriteria] = useState<any>(null);

  const samplePrompts = [
    'Black leather wallet lost near Grand Central Station',
    'Blue iPhone left on coffee table at Bryant Park yesterday',
    'Car key fob on red carabiner clip near subway',
    'Grey travel backpack lost in library reading room',
  ];

  const handleSearch = async (textToSearch?: string) => {
    const q = textToSearch || query;
    if (!q.trim()) return;

    setLoading(true);
    try {
      const res = await api.smartSearch(q);
      setParsedCriteria(res.parsed);
      onResults(res.results, q, res.parsed);
    } catch (err) {
      console.error('Smart search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setParsedCriteria(null);
    onClear();
  };

  return (
    <div className="w-full space-y-3">
      {/* Search Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="relative flex items-center shadow-lg rounded-2xl bg-white border-2 border-indigo-100 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/15 transition-all"
      >
        <div className="pl-4 pr-2 text-indigo-600 flex items-center gap-1.5 shrink-0">
          <Sparkles className="h-5 w-5 animate-pulse" />
        </div>

        <input
          id="smart-search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full py-4 pr-12 text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 mr-2 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <button
          id="btn-run-smart-search"
          type="submit"
          disabled={loading || !query.trim()}
          className="mr-2 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 text-xs font-bold shadow-xs transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>AI Searching...</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              <span>Smart Search</span>
            </>
          )}
        </button>
      </form>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-semibold text-slate-400">Quick AI prompts:</span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setQuery(p);
              handleSearch(p);
            }}
            className="text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 px-3 py-1 rounded-lg border border-slate-200/80 transition-colors"
          >
            "{p}"
          </button>
        ))}
      </div>

      {/* Parsed AI Criteria Chips */}
      {parsedCriteria && (
        <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs flex flex-wrap items-center gap-2 animate-in fade-in">
          <span className="font-bold text-indigo-900 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            Gemini Parsed Criteria:
          </span>
          {parsedCriteria.category && (
            <span className="bg-white px-2 py-0.5 rounded-md font-medium text-slate-700 border border-indigo-100">
              Category: <b>{parsedCriteria.category}</b>
            </span>
          )}
          {parsedCriteria.color && (
            <span className="bg-white px-2 py-0.5 rounded-md font-medium text-slate-700 border border-indigo-100">
              Color: <b>{parsedCriteria.color}</b>
            </span>
          )}
          {parsedCriteria.brand && (
            <span className="bg-white px-2 py-0.5 rounded-md font-medium text-slate-700 border border-indigo-100">
              Brand: <b>{parsedCriteria.brand}</b>
            </span>
          )}
          {parsedCriteria.locationHint && (
            <span className="bg-white px-2 py-0.5 rounded-md font-medium text-slate-700 border border-indigo-100">
              Location: <b>{parsedCriteria.locationHint}</b>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
