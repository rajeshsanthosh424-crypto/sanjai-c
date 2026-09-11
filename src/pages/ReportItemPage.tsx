import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  MapPin,
  Calendar,
  Clock,
  Tag,
  Shield,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Item, ItemCategory, ItemType } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ReportItemPageProps {
  initialType?: ItemType;
  onItemCreated: (item: Item, createdMatchesCount: number) => void;
  onCancel: () => void;
}

const categories: ItemCategory[] = [
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

const presetLocations = [
  { name: 'Grand Central Terminal - Main Concourse', lat: 40.7527, lng: -73.9772 },
  { name: 'Bryant Park - Lawn Area', lat: 40.7536, lng: -73.9832 },
  { name: 'Penn Station - Amtrak Waiting Area', lat: 40.7505, lng: -73.9934 },
  { name: 'Times Square Subway Station (N/Q/R line)', lat: 40.7580, lng: -73.9855 },
  { name: 'New York Public Library - Main Reading Room', lat: 40.7532, lng: -73.9822 },
  { name: 'Metropolitan Museum of Art - Great Hall', lat: 40.7794, lng: -73.9632 },
];

export const ReportItemPage: React.FC<ReportItemPageProps> = ({
  initialType = 'lost',
  onItemCreated,
  onCancel,
}) => {
  const { user } = useAuth();
  const [itemType, setItemType] = useState<ItemType>(initialType);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Wallet');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('Black');
  const [brandModel, setBrandModel] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:30');
  const [locationName, setLocationName] = useState(presetLocations[0].name);
  const [lat, setLat] = useState(presetLocations[0].lat);
  const [lng, setLng] = useState(presetLocations[0].lng);
  const [address, setAddress] = useState('New York, NY');
  const [imageUrl, setImageUrl] = useState(
    itemType === 'lost'
      ? 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'
  );
  const [identifyingDetails, setIdentifyingDetails] = useState('');

  // AI assistant states
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Handle image upload & preview
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImageUrl(dataUrl);
      // Auto analyze with AI
      triggerAIAnalysis(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Trigger Gemini AI image & text auto-analysis
  const triggerAIAnalysis = async (customImage?: string) => {
    setAnalyzingAI(true);
    setError('');

    try {
      const activeImg = customImage || imageUrl;
      const isBase64 = activeImg.startsWith('data:image/');
      const base64Content = isBase64 ? activeImg.split(',')[1] : undefined;
      const mimeType = isBase64 ? activeImg.split(';')[0].replace('data:', '') : undefined;

      const res = await api.analyzeItemAI({
        title,
        description,
        imageBase64: base64Content,
        mimeType: mimeType || 'image/jpeg',
      });

      if (res.analysis) {
        setAiSuggestions(res.analysis);
        // Apply suggestions if user hasn't filled them yet
        if (!title && res.analysis.suggestedTitle) setTitle(res.analysis.suggestedTitle);
        if (res.analysis.suggestedCategory && categories.includes(res.analysis.suggestedCategory as any)) {
          setCategory(res.analysis.suggestedCategory as ItemCategory);
        }
        if (res.analysis.suggestedColor) setColor(res.analysis.suggestedColor);
        if (res.analysis.suggestedBrand && !brandModel) setBrandModel(res.analysis.suggestedBrand);
        if (!description && res.analysis.enhancedDescription) {
          setDescription(res.analysis.enhancedDescription);
        }
      }
    } catch (err: any) {
      console.warn('AI analysis skipped/failed:', err);
    } finally {
      setAnalyzingAI(false);
    }
  };

  const handlePresetLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const loc = presetLocations.find(l => l.name === e.target.value);
    if (loc) {
      setLocationName(loc.name);
      setLat(loc.lat);
      setLng(loc.lng);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide a title and detailed description.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload: Partial<Item> = {
        type: itemType,
        title: title.trim(),
        category,
        description: description.trim(),
        color: color.trim(),
        brandModel: brandModel.trim() || undefined,
        date,
        time,
        location: {
          name: locationName.trim(),
          address: address.trim() || undefined,
          lat,
          lng,
        },
        imageUrl,
        additionalObservations: identifyingDetails.trim() || undefined,
      };

      const res = await api.createItem(payload);
      onItemCreated(res.item, res.createdMatchesCount || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {itemType === 'lost' ? 'Report a Lost Item' : 'Report a Found Item'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Our intelligent AI will parse characteristics and instantly notify you when potential matches are identified.
        </p>

        {/* Type Toggle Switch */}
        <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-100 border border-slate-200 mt-4">
          <button
            type="button"
            onClick={() => {
              setItemType('lost');
              setImageUrl('https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80');
            }}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              itemType === 'lost'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            I Lost an Item
          </button>
          <button
            type="button"
            onClick={() => {
              setItemType('found');
              setImageUrl('https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80');
            }}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              itemType === 'found'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            I Found an Item
          </button>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            {error}
          </div>
        )}

        {/* AI Assistant Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50/50 border border-indigo-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Gemini AI Smart Autofill</p>
              <p className="text-[11px] text-slate-500">Upload a photo to automatically suggest category, brand, and color</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => triggerAIAnalysis()}
            disabled={analyzingAI}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-bold shadow-2xs transition-colors disabled:opacity-50"
          >
            {analyzingAI ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Analyzing Photo...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                Analyze Current Photo
              </>
            )}
          </button>
        </div>

        {/* Image Upload Box */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Item Image / Photograph <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 sm:col-span-1">
              <img
                src={imageUrl}
                alt="Item preview"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="sm:col-span-2 flex flex-col justify-center">
              <label className="cursor-pointer flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-500 p-6 text-center transition-colors bg-slate-50/50">
                <Upload className="h-6 w-6 text-indigo-600" />
                <div>
                  <span className="text-xs font-bold text-indigo-600">Click to upload photo</span>
                  <span className="text-xs text-slate-500"> or drag and drop</span>
                </div>
                <p className="text-[10px] text-slate-400">PNG, JPG, WEBP up to 5MB</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  className="hidden"
                />
              </label>

              <div className="mt-2 flex items-center gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Or paste external image URL..."
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Item Title / Short Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="report-item-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Black Leather Montblanc Bi-Fold Wallet"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              id="report-item-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as ItemCategory)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs text-slate-900 bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Color & Brand */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Primary Color <span className="text-rose-500">*</span>
            </label>
            <input
              id="report-item-color-input"
              type="text"
              required
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g. Black, Navy Blue, Silver"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Brand / Model / Make
            </label>
            <input
              id="report-item-brand-input"
              type="text"
              value={brandModel}
              onChange={(e) => setBrandModel(e.target.value)}
              placeholder="e.g. Apple iPhone 15 Pro, Samsung, Fossil, Nike"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Detailed Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="report-item-description-input"
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe condition, size, distinctive stickers, scratches, or contents..."
            className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Date {itemType === 'lost' ? 'Lost' : 'Found'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Approximate Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Location Section */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-800">
              Location Where {itemType === 'lost' ? 'Lost' : 'Found'} <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">Coordinates auto-tagged</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] font-semibold text-slate-500 mb-1 block">Quick Landmark Presets</span>
              <select
                onChange={handlePresetLocationChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 bg-slate-50 focus:outline-none"
              >
                {presetLocations.map((loc) => (
                  <option key={loc.name} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-slate-500 mb-1 block">Custom Location Name / Venue</span>
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Central Station Waiting Bench"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Optional Hidden Verification Characteristic */}
        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-700" />
            <span className="text-xs font-bold text-amber-900">
              Secret / Hidden Characteristics for Ownership Proof
            </span>
          </div>
          <p className="text-[11px] text-amber-800/80 leading-relaxed">
            Specify private marks, internal serial digits, or pocket contents. This helps securely verify when claimants reach out!
          </p>
          <input
            type="text"
            value={identifyingDetails}
            onChange={(e) => setIdentifyingDetails(e.target.value)}
            placeholder="e.g. Small star scratch on bottom-left, contains metro pass #9482"
            className="w-full rounded-xl border border-amber-300/80 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>

          <button
            id="btn-submit-report-form"
            type="submit"
            disabled={submitting}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 ${
              itemType === 'lost'
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Running AI Matching...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Submit {itemType === 'lost' ? 'Lost' : 'Found'} Item Report</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
