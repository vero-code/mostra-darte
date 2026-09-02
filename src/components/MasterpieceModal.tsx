import React, { useState } from 'react';
import { X, Search, Sparkles, Eye } from 'lucide-react';
import type { Artwork } from '../types';
import { MASTERPIECES } from '../data/artworks';

interface MasterpieceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentArtworkId: string;
  onSelectArtwork: (artwork: Artwork) => void;
  initialSearch?: string;
  initialPeriod?: string;
}

export const MasterpieceModal: React.FC<MasterpieceModalProps> = ({
  isOpen,
  onClose,
  currentArtworkId,
  onSelectArtwork,
  initialSearch,
  initialPeriod,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');
  const [selectedPeriod, setSelectedPeriod] = useState<string>(initialPeriod || 'all');

  React.useEffect(() => {
    if (typeof initialSearch === 'string') setSearchTerm(initialSearch);
  }, [initialSearch]);
  React.useEffect(() => {
    if (typeof initialPeriod === 'string') setSelectedPeriod(initialPeriod);
  }, [initialPeriod]);

  if (!isOpen) return null;

  const periods = ['all', ...Array.from(new Set(MASTERPIECES.map((a) => a.period)))];

  const filtered = MASTERPIECES.filter((art) => {
    const matchSearch =
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.period.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPeriod = selectedPeriod === 'all' || art.period === selectedPeriod;
    return matchSearch && matchPeriod;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-stone-900 border border-stone-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] z-10">
        {/* Header */}
        <div className="p-5 border-b border-stone-800 bg-stone-950/80 flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-lg md:text-xl text-amber-200 tracking-wide flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Mostra d'Arte Salon Wall
            </h2>
            <p className="text-xs text-stone-400 font-serif-body">
              Select any masterpiece to step into its gallery room and engage the Virtual Docent.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters and Search */}
        <div className="p-4 border-b border-stone-800/80 bg-stone-900/60 flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search artist, title, period..."
              className="w-full bg-stone-950 border border-stone-750 focus:border-amber-500/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none"
            />
          </div>

          {/* Period Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPeriod(p)}
                className={`text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap transition-colors capitalize ${
                  selectedPeriod === p
                    ? 'bg-amber-500 text-stone-950 font-semibold'
                    : 'bg-stone-800/60 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-700/40'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((art) => {
            const isCurrent = art.id === currentArtworkId;

            return (
              <div
                key={art.id}
                onClick={() => {
                  onSelectArtwork(art);
                  onClose();
                }}
                className={`group relative bg-stone-950/70 rounded-xl overflow-hidden border transition-all cursor-pointer flex flex-col ${
                  isCurrent
                    ? 'border-amber-500 ring-2 ring-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                    : 'border-stone-800 hover:border-amber-500/50 hover:shadow-xl'
                }`}
              >
                {/* Artwork Thumbnail */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-950">
                  <img
                    src={art.imageUrl}
                    alt={art.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-80" />

                  {/* Period Badge */}
                  <span className="absolute top-2.5 left-2.5 text-[10px] bg-stone-950/80 backdrop-blur-md text-amber-300 font-mono px-2 py-0.5 rounded border border-stone-750">
                    {art.year}
                  </span>

                  {isCurrent && (
                    <span className="absolute top-2.5 right-2.5 text-[10px] bg-amber-500 text-stone-950 font-bold px-2 py-0.5 rounded shadow">
                      Currently Exhibited
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display font-bold text-sm text-stone-100 group-hover:text-amber-200 transition-colors">
                      {art.title}
                    </h3>
                    <p className="text-xs text-stone-400 font-serif-body mt-0.5">
                      {art.artist}
                    </p>
                    <p className="text-[11px] text-stone-400 mt-2 line-clamp-2 font-serif-body">
                      {art.curatorOverview}
                    </p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-500">
                    <span className="truncate">{art.focalPoints.length} Curated Hotspots</span>
                    <span className="text-amber-400 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Enter Room <Eye className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
