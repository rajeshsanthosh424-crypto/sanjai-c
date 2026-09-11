import React from 'react';
import { MapPin, Calendar, Tag, Sparkles, Shield, ArrowRight, Flag } from 'lucide-react';
import { Item } from '../types';

interface ItemCardProps {
  item: Item;
  onViewDetails: (item: Item) => void;
  onClaim?: (item: Item) => void;
  onReportAbuse?: (item: Item) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onViewDetails,
  onClaim,
  onReportAbuse,
}) => {
  const isLost = item.type === 'lost';

  return (
    <div
      id={`item-card-${item.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200"
    >
      {/* Media & Type Badge */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
        <img
          src={item.imageUrl}
          alt={item.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            // Fallback placeholder image
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80';
          }}
        />

        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide uppercase shadow-xs ${
              isLost
                ? 'bg-rose-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {isLost ? 'Lost Item' : 'Found Item'}
          </span>

          <span className="inline-flex items-center gap-1 rounded-lg bg-white/90 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-xs border border-white/50">
            <Tag className="h-3 w-3 text-indigo-600" />
            {item.category}
          </span>
        </div>

        {/* Item State Badge (Resolved, Claim Pending) */}
        {item.status === 'resolved' && (
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 text-white px-2.5 py-1 text-xs font-bold shadow-xs">
              <Shield className="h-3 w-3" /> Recovered
            </span>
          </div>
        )}
        {item.status === 'claim_pending' && (
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500 text-white px-2.5 py-1 text-xs font-bold shadow-xs">
              Claim Pending
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {item.title}
          </h3>
          {onReportAbuse && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReportAbuse(item);
              }}
              title="Report suspicious listing"
              className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
            >
              <Flag className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4 flex-1">
          {item.description}
        </p>

        {/* Metadata Chips */}
        <div className="space-y-1.5 text-xs text-slate-500 pt-3 border-t border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{item.location.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{item.date} {item.time && `• ${item.time}`}</span>
            </div>
            {item.color && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                Color: {item.color}
              </span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            id={`btn-view-details-${item.id}`}
            onClick={() => onViewDetails(item)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-semibold text-xs py-2.5 px-3 transition-colors"
          >
            View Details
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          {!isLost && item.status === 'active' && onClaim && (
            <button
              id={`btn-claim-${item.id}`}
              onClick={() => onClaim(item)}
              className="inline-flex items-center justify-center gap-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 px-3.5 shadow-xs transition-colors"
            >
              <Shield className="h-3.5 w-3.5" />
              Claim
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
