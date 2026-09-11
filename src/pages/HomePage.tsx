import React, { useState } from 'react';
import {
  Sparkles,
  PlusCircle,
  CheckCircle2,
  Search,
  MapPin,
  Shield,
  ArrowRight,
  Smartphone,
  CreditCard,
  Briefcase,
  Key,
  Laptop,
  Headphones,
  FileText,
  Gem,
  Book,
  Shirt,
  Box,
  TrendingUp,
  Award
} from 'lucide-react';
import { Item, Match, ItemCategory } from '../types';
import { SmartSearchBar } from '../components/SmartSearchBar';
import { ItemCard } from '../components/ItemCard';
import { MatchCard } from '../components/MatchCard';
import { MapView } from '../components/MapView';

interface HomePageProps {
  items: Item[];
  matches: Match[];
  onNavigate: (tab: string) => void;
  onOpenReportModal: (type: 'lost' | 'found') => void;
  onViewItemDetails: (item: Item) => void;
  onInitiateClaim: (itemOrMatch: Item | Match) => void;
  onOpenMessage: (threadId: string, recipientId: string, recipientName: string) => void;
}

const categoryIcons: { category: ItemCategory; icon: any }[] = [
  { category: 'Mobile Phone', icon: Smartphone },
  { category: 'Wallet', icon: CreditCard },
  { category: 'ID Card', icon: Award },
  { category: 'Bag', icon: Briefcase },
  { category: 'Keys', icon: Key },
  { category: 'Laptop', icon: Laptop },
  { category: 'Earphones', icon: Headphones },
  { category: 'Documents', icon: FileText },
  { category: 'Jewelry', icon: Gem },
  { category: 'Books', icon: Book },
  { category: 'Clothing', icon: Shirt },
  { category: 'Other', icon: Box },
];

export const HomePage: React.FC<HomePageProps> = ({
  items,
  matches,
  onNavigate,
  onOpenReportModal,
  onViewItemDetails,
  onInitiateClaim,
  onOpenMessage,
}) => {
  const [searchResults, setSearchResults] = useState<Item[] | null>(null);
  const [searchQueryText, setSearchQueryText] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filter items by category
  const displayedItems = (searchResults || items).filter(i => {
    if (selectedCategory !== 'All' && i.category !== selectedCategory) return false;
    return true;
  });

  const highConfidenceMatches = matches.filter(m => m.matchScore >= 85).slice(0, 3);
  const recentItems = displayedItems.slice(0, 6);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-900 text-white px-6 py-16 sm:px-12 sm:py-24 shadow-xl">
        {/* Glow backdrop effects */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-4xl text-center space-y-6">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-800/60 border border-indigo-700/80 px-4 py-1.5 text-xs font-semibold text-indigo-200 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Powered by Gemini Multimodal AI &amp; Proximity Search</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Lost something? <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-blue-200 to-indigo-100">
              Let AI help you find it.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-sm sm:text-base text-indigo-200/90 leading-relaxed">
            Connect lost items with found reports instantly using intelligent image recognition, natural language search, and verified ownership return.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              id="hero-btn-report-lost"
              onClick={() => onOpenReportModal('lost')}
              className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm px-6 py-3.5 shadow-lg shadow-rose-600/30 transition-all hover:scale-102"
            >
              <PlusCircle className="h-4 w-4" />
              Report Lost Item
            </button>

            <button
              id="hero-btn-report-found"
              onClick={() => onOpenReportModal('found')}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-3.5 shadow-lg shadow-emerald-600/30 transition-all hover:scale-102"
            >
              <CheckCircle2 className="h-4 w-4" />
              Report Found Item
            </button>

            <button
              id="hero-btn-browse-items"
              onClick={() => onNavigate('lost')}
              className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-5 py-3.5 backdrop-blur-md border border-white/20 transition-colors"
            >
              <Search className="h-4 w-4" />
              Browse All Items
            </button>
          </div>

          {/* Smart AI Search Bar Embedded in Hero */}
          <div className="pt-8 max-w-3xl mx-auto text-left">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-3 sm:p-4 shadow-2xl border border-white/20">
              <SmartSearchBar
                onResults={(results, text, parsed) => {
                  setSearchResults(results);
                  setSearchQueryText(text);
                }}
                onClear={() => {
                  setSearchResults(null);
                  setSearchQueryText('');
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Popular Item Categories
          </h2>
          {selectedCategory !== 'All' && (
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Reset Category
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all text-left ${
              selectedCategory === 'All'
                ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold shadow-xs'
                : 'border-slate-200/80 bg-white hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Box className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold">All Items</span>
          </button>

          {categoryIcons.map(({ category, icon: Icon }) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all text-left ${
                selectedCategory === category
                  ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold shadow-xs'
                  : 'border-slate-200/80 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold truncate">{category}</span>
            </button>
          ))}
        </div>
      </section>

      {/* High-Confidence Matches Showcase */}
      {highConfidenceMatches.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  High-Confidence AI Matches Detected
                </h2>
                <p className="text-xs text-slate-500">Gemini identified high correlation between these lost and found items</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('matches')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View All Matches ({matches.length})
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {highConfidenceMatches.map(m => (
              <MatchCard
                key={m.id}
                match={m}
                onInitiateClaim={onInitiateClaim}
                onOpenMessage={onOpenMessage}
                onViewItemDetails={onViewItemDetails}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent Items Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {searchResults ? `Search Results for "${searchQueryText}"` : 'Recent Lost & Found Reports'}
            </h2>
            <p className="text-xs text-slate-500">
              Showing {displayedItems.length} {selectedCategory !== 'All' ? `items in ${selectedCategory}` : 'reports'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('lost')}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100"
            >
              Lost Items ({items.filter(i => i.type === 'lost').length})
            </button>
            <button
              onClick={() => onNavigate('found')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100"
            >
              Found Items ({items.filter(i => i.type === 'found').length})
            </button>
          </div>
        </div>

        {recentItems.length === 0 ? (
          <div className="py-12 text-center rounded-3xl bg-white border border-slate-200/80 p-8">
            <Box className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-800 text-sm">No items found matching criteria</h4>
            <p className="text-xs text-slate-500 mt-1">Try broadening your search keywords or switching category filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onViewDetails={onViewItemDetails}
                onClaim={onInitiateClaim}
              />
            ))}
          </div>
        )}
      </section>

      {/* Interactive Location Map Preview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Live Item Recovery Map
              </h2>
              <p className="text-xs text-slate-500">Interactive map displaying nearby lost (red) and found (green) items</p>
            </div>
          </div>
        </div>

        <MapView
          items={items}
          onSelectItem={onViewItemDetails}
          height="460px"
        />
      </section>

      {/* How It Works Feature Grid */}
      <section className="rounded-3xl bg-white border border-slate-200/80 p-8 sm:p-12 shadow-xs">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">How It Works</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
            Safe, Intelligent Belonging Recovery
          </h3>
          <p className="text-xs text-slate-500 mt-2">
            Bridging finders and owners with AI matching and multi-step ownership verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 font-extrabold text-lg">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-base">Report with AI Assistant</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload a photo or quick description. Gemini automatically identifies item category, color, brand, and distinguishes key physical traits.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 font-extrabold text-lg">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-base">Hybrid AI Matching Engine</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our hybrid scoring analyzes visual similarities (35%), description (25%), category, color, and geographic proximity to calculate confidence scores.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 font-extrabold text-lg">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-base">Proof &amp; Safe Handover</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Claimants provide hidden identifying traits, receipts, or serial numbers. Contact is coordinated via private in-app messaging with zero contact exposure.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
