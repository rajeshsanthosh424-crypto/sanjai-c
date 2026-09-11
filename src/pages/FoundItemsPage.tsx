import React, { useState } from 'react';
import { Search, Filter, MapPin, Grid, Map, PlusCircle, CheckCircle2 } from 'lucide-react';
import { Item, ItemCategory } from '../types';
import { ItemCard } from '../components/ItemCard';
import { MapView } from '../components/MapView';

interface FoundItemsPageProps {
  items: Item[];
  onViewDetails: (item: Item) => void;
  onInitiateClaim: (item: Item) => void;
  onOpenReportModal: (type: 'lost' | 'found') => void;
  onReportAbuse?: (item: Item) => void;
}

export const FoundItemsPage: React.FC<FoundItemsPageProps> = ({
  items,
  onViewDetails,
  onInitiateClaim,
  onOpenReportModal,
  onReportAbuse,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedColor, setSelectedColor] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const foundItems = items.filter(i => i.type === 'found' && !i.isFraudulent);

  const filteredItems = foundItems.filter(item => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (selectedColor !== 'All' && item.color.toLowerCase() !== selectedColor.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.location.name.toLowerCase().includes(q) ||
        item.color.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const categories = [
    'All',
    'Mobile Phone',
    'Wallet',
    'ID Card',
    'Bag',
    'Keys',
    'Laptop',
    'Earphones',
    'Documents',
    'Jewelry',
    'Books',
    'Clothing',
    'Other',
  ];

  const colors = ['All', 'Black', 'Blue', 'Grey', 'Brown', 'Red', 'White', 'Silver', 'Gold'];

  return (
    <div className="space-y-6 pb-16">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Found Items Registry</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse discovered personal items submitted by citizens, venue managers, and transport authorities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Grid className="h-4 w-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                viewMode === 'map' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>

          <button
            onClick={() => onOpenReportModal('found')}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 shadow-xs transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            Report Found Item
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by keyword, title, location..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category select */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Color select */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500">Color:</span>
          <select
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
          >
            {colors.map((color) => (
              <option key={color} value={color}>{color}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'grid' ? (
        filteredItems.length === 0 ? (
          <div className="py-16 text-center rounded-3xl bg-white border border-slate-200 p-8">
            <CheckCircle2 className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">No found items match your criteria</h3>
            <p className="text-xs text-slate-500 mt-1">If you lost an item, submit a Lost Item report to enable automatic AI alerts.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onViewDetails={onViewDetails}
                onClaim={onInitiateClaim}
                onReportAbuse={onReportAbuse}
              />
            ))}
          </div>
        )
      ) : (
        <MapView
          items={filteredItems}
          onSelectItem={onViewDetails}
          height="580px"
        />
      )}
    </div>
  );
};
