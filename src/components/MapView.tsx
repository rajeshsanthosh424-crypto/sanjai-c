import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Item, ItemType } from '../types';
import { Filter, Layers, MapPin, LocateFixed, Eye } from 'lucide-react';

interface MapViewProps {
  items: Item[];
  selectedItem?: Item | null;
  onSelectItem: (item: Item) => void;
  height?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
}

export const MapView: React.FC<MapViewProps> = ({
  items,
  selectedItem,
  onSelectItem,
  height = '540px',
  initialCenter = [40.7535, -73.9830], // New York Midtown default
  initialZoom = 14,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [filterType, setFilterType] = useState<ItemType | 'all'>('all');
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(5);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: initialCenter as L.LatLngTuple,
        zoom: initialZoom,
        zoomControl: true,
      });

      // CartoDB Voyager or OpenStreetMap clean tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Map cleanup on unmount handled gracefully
    };
  }, []);

  // Update Markers when items or filter change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const filtered = items.filter(i => {
      if (filterType !== 'all' && i.type !== filterType) return false;
      return true;
    });

    filtered.forEach(item => {
      const isLost = item.type === 'lost';
      const color = isLost ? '#e11d48' : '#059669'; // Rose vs Emerald

      const markerHtml = `
        <div style="
          background-color: ${color};
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.25);
          cursor: pointer;
        ">
          <svg style="width: 16px; height: 16px; fill: white;" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-map-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([item.location.lat, item.location.lng], { icon: customIcon });

      const popupContent = `
        <div style="min-width: 180px; font-family: inherit;">
          <img src="${item.imageUrl}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
          <div style="display: inline-block; font-size: 10px; font-weight: bold; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; background: ${
            isLost ? '#ffe4e6' : '#d1fae5'
          }; color: ${color}; margin-bottom: 4px;">
            ${isLost ? 'LOST ITEM' : 'FOUND ITEM'}
          </div>
          <h4 style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #0f172a;">${item.title}</h4>
          <p style="margin: 0 0 6px; font-size: 11px; color: #64748b;">${item.location.name}</p>
          <div style="font-size: 11px; font-weight: 600; color: #4338ca;">Click pin to view full details</div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        onSelectItem(item);
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [items, filterType]);

  // Center on selected item
  useEffect(() => {
    if (selectedItem && mapInstanceRef.current) {
      mapInstanceRef.current.setView([selectedItem.location.lat, selectedItem.location.lng], 16, {
        animate: true,
      });
    }
  }, [selectedItem]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(initialCenter as L.LatLngTuple, initialZoom, { animate: true });
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      {/* Map Filter Controls Floating Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 rounded-xl bg-white/95 p-2 shadow-md backdrop-blur-md border border-slate-200/80">
        <span className="text-xs font-semibold text-slate-500 pl-1">Show:</span>
        <button
          onClick={() => setFilterType('all')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
            filterType === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Items ({items.length})
        </button>
        <button
          onClick={() => setFilterType('lost')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
            filterType === 'lost'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-rose-700 bg-rose-50 hover:bg-rose-100'
          }`}
        >
          Lost Only ({items.filter(i => i.type === 'lost').length})
        </button>
        <button
          onClick={() => setFilterType('found')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
            filterType === 'found'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
          }`}
        >
          Found Only ({items.filter(i => i.type === 'found').length})
        </button>
      </div>

      {/* Recenter Button */}
      <button
        onClick={handleRecenter}
        title="Recenter Map"
        className="absolute top-4 right-4 z-20 rounded-xl bg-white/95 p-2.5 text-slate-700 shadow-md backdrop-blur-md border border-slate-200/80 hover:bg-slate-50 transition-colors"
      >
        <LocateFixed className="h-4 w-4" />
      </button>

      {/* Map Container */}
      <div ref={mapContainerRef} style={{ height }} className="w-full" />
    </div>
  );
};
