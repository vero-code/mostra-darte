import React, { useState } from 'react';
import {
  X,
  Compass,
  Info,
  Building,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import type { Artwork, FocalPoint, GuidedTour } from '../types';

interface ArtworkInfoPanelProps {
  artwork: Artwork;
  isOpen: boolean;
  onClose: () => void;
  onSelectFocalPoint: (fp: FocalPoint) => void;
  onStartTour: (tour: GuidedTour) => void;
}

export const ArtworkInfoPanel: React.FC<ArtworkInfoPanelProps> = ({
  artwork,
  isOpen,
  onClose,
  onSelectFocalPoint,
  onStartTour,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'focal' | 'palette' | 'tours'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[440px] md:w-[480px] bg-stone-900/98 backdrop-blur-xl border-l border-stone-800 shadow-2xl z-40 flex flex-col text-stone-100 select-none">
      {/* Panel Header */}
      <div className="p-4 border-b border-stone-800 bg-stone-950 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400" />
          <h2 className="font-display font-semibold text-sm tracking-wider text-stone-100">
            Curatorial Dossier
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Artwork Header Card */}
      <div className="p-4 border-b border-stone-800/80 bg-stone-900/60 flex gap-3.5">
        <img
          src={artwork.imageUrl}
          alt={artwork.title}
          referrerPolicy="no-referrer"
          className="w-16 h-20 object-cover rounded border border-stone-750 shrink-0 shadow-md"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-display font-bold text-base text-amber-200 truncate">
            {artwork.title}
          </h3>
          {artwork.originalTitle && (
            <p className="text-xs text-stone-400 italic font-serif-body">
              {artwork.originalTitle}
            </p>
          )}
          <p className="text-xs text-stone-300 font-medium mt-0.5">
            {artwork.artist} • <span className="text-stone-400">{artwork.year}</span>
          </p>
          <span className="inline-block text-[10px] uppercase font-mono tracking-wider text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded mt-1 border border-amber-500/20">
            {artwork.period}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-800 bg-stone-950/40 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2.5 px-3 font-medium transition-colors text-center ${
            activeTab === 'overview'
              ? 'text-amber-300 border-b-2 border-amber-400 bg-stone-800/40'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('focal')}
          className={`flex-1 py-2.5 px-3 font-medium transition-colors text-center ${
            activeTab === 'focal'
              ? 'text-amber-300 border-b-2 border-amber-400 bg-stone-800/40'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Focal Points ({artwork.focalPoints.length})
        </button>
        <button
          onClick={() => setActiveTab('palette')}
          className={`flex-1 py-2.5 px-3 font-medium transition-colors text-center ${
            activeTab === 'palette'
              ? 'text-amber-300 border-b-2 border-amber-400 bg-stone-800/40'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Palette
        </button>
        <button
          onClick={() => setActiveTab('tours')}
          className={`flex-1 py-2.5 px-3 font-medium transition-colors text-center ${
            activeTab === 'tours'
              ? 'text-amber-300 border-b-2 border-amber-400 bg-stone-800/40'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Tours ({artwork.tours.length})
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Curator's Critique */}
            <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-3.5">
              <h4 className="text-xs font-display font-semibold text-amber-300 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Curator's Assessment
              </h4>
              <p className="text-xs font-serif-body text-stone-300 leading-relaxed italic">
                "{artwork.curatorOverview}"
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-stone-400">
                Historical Context & Narrative
              </h4>
              <p className="text-xs font-serif-body text-stone-300 leading-relaxed">
                {artwork.description}
              </p>
            </div>

            {/* Technical Specifications */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-stone-950/50 p-2.5 rounded-lg border border-stone-800/80">
                <span className="text-[10px] text-stone-500 block uppercase font-mono">Medium</span>
                <span className="text-stone-200 font-medium">{artwork.medium}</span>
              </div>
              <div className="bg-stone-950/50 p-2.5 rounded-lg border border-stone-800/80">
                <span className="text-[10px] text-stone-500 block uppercase font-mono">Dimensions</span>
                <span className="text-stone-200 font-medium">{artwork.dimensions}</span>
              </div>
              <div className="col-span-2 bg-stone-950/50 p-2.5 rounded-lg border border-stone-800/80 flex items-start gap-2">
                <Building className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-stone-500 block uppercase font-mono">Permanent Home</span>
                  <span className="text-stone-200 font-medium">{artwork.location}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'focal' && (
          <div className="space-y-3">
            <p className="text-xs text-stone-400 font-serif-body">
              Select any curated spatial detail below to command the Docent’s attention to zoom in and critique.
            </p>
            {artwork.focalPoints.map((fp) => (
              <div
                key={fp.id}
                onClick={() => {
                  onSelectFocalPoint(fp);
                  onClose();
                }}
                className="bg-stone-950/70 hover:bg-stone-800/80 border border-stone-800 hover:border-amber-500/50 p-3 rounded-xl cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-amber-200 group-hover:text-amber-300">
                    {fp.name}
                  </span>
                  <span className="text-[10px] font-mono text-stone-500 group-hover:text-amber-400">
                    {fp.x}% X, {fp.y}% Y • {fp.zoom}x
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 font-serif-body mb-2 line-clamp-2">
                  {fp.curatorInsight}
                </p>
                <div className="flex items-center justify-between text-[10px] text-stone-500">
                  <span className="capitalize px-1.5 py-0.5 bg-stone-900 rounded border border-stone-800 text-stone-400">
                    {fp.category}
                  </span>
                  <span className="text-amber-400/90 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Direct Camera <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'palette' && (
          <div className="space-y-4">
            <p className="text-xs text-stone-400 font-serif-body">
              Chromatographic breakdown and historical pigment formulation used by {artwork.artist}.
            </p>
            <div className="space-y-2.5">
              {artwork.colorPalette.map((color, idx) => (
                <div
                  key={idx}
                  className="bg-stone-950/70 border border-stone-800 rounded-xl p-3 flex items-center gap-3"
                >
                  <div
                    className="w-10 h-10 rounded-lg shadow-md border border-stone-700 shrink-0"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-200">{color.name}</span>
                      <span className="text-[10px] font-mono text-stone-400">{color.hex}</span>
                    </div>
                    <p className="text-[11px] text-stone-400 font-serif-body">{color.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tours' && (
          <div className="space-y-3">
            <p className="text-xs text-stone-400 font-serif-body">
              Multi-stop curated audio-visual itineraries crafted by the Head Curator.
            </p>
            {artwork.tours.map((tour) => (
              <div
                key={tour.id}
                className="bg-stone-950/70 border border-stone-800 rounded-xl p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-display font-semibold text-amber-200">
                    {tour.title}
                  </h5>
                  <span className="text-[10px] font-mono text-stone-400">
                    {tour.stops.length} Stops • ~{tour.durationMinutes}m
                  </span>
                </div>
                <p className="text-xs text-stone-400 font-serif-body">
                  {tour.description}
                </p>
                <button
                  onClick={() => {
                    onStartTour(tour);
                    onClose();
                  }}
                  className="w-full mt-2 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <Compass className="w-3.5 h-3.5" />
                  Embark on Guided Tour
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
