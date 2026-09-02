import React, { useState } from 'react';
import {
  BookOpen,
  Music,
  Compass,
  ChevronDown,
  Layers,
 } from 'lucide-react';
 import { GalleryWebMCP } from './GalleryWebMCP';
import type { Artwork, ViewportState } from '../types';
import { MASTERPIECES } from '../data/artworks';

interface GalleryHeaderProps {
  currentArtwork: Artwork;
  onSelectArtwork: (artwork: Artwork) => void;
  onToggleInfoPanel: () => void;
  isInfoOpen: boolean;
  onStartTour: () => void;
  isTourActive: boolean;
  ambientPlaying: boolean;
  onToggleAmbient: () => void;
  onOpenSalonModal: () => void;
  onViewportChange: (newVp: Partial<ViewportState>) => void;
  onToggleDossier?: (open: boolean, tab?: 'overview' | 'focal' | 'palette' | 'tours') => void;
}

export const GalleryHeader: React.FC<GalleryHeaderProps> = ({
  currentArtwork,
  onSelectArtwork,
  onToggleInfoPanel,
  isInfoOpen,
  onStartTour,
  isTourActive,
  ambientPlaying,
  onToggleAmbient,
  onOpenSalonModal,
  onViewportChange,
  onToggleDossier
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-16 bg-stone-950/95 border-b border-stone-800/80 px-4 md:px-6 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Gallery Brand / Crest */}
      <div className="flex items-center gap-3 md:gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-800 flex items-center justify-center shadow-lg border border-amber-400/40">
            <span className="font-display font-bold text-base text-stone-950">M</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-base md:text-lg tracking-wider text-stone-100 flex items-center gap-2">
              Mostra d'Arte
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-widest text-amber-400/80 border border-amber-500/30 px-1.5 py-0.5 rounded">
                Spatial Docent
              </span>
            </h1>
            <p className="text-[10px] text-stone-400 font-serif-body hidden sm:block">
              Virtual Gallery & Attention Director
            </p>
          </div>
        </div>

        <div className="h-7 w-[1px] bg-stone-800 hidden md:block"></div>

        {/* Masterpiece Quick Dropdown Selector */}
        <div className="relative">
          <button
            id="btn-artwork-dropdown"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 bg-stone-900/90 hover:bg-stone-850 border border-stone-750 hover:border-amber-500/40 px-3 py-1.5 rounded-lg text-left transition-all"
          >
            <div className="max-w-[140px] sm:max-w-[200px] md:max-w-[240px] truncate">
              <span className="text-xs font-semibold text-amber-200 block truncate">
                {currentArtwork.title}
              </span>
              <span className="text-[10px] text-stone-400 block truncate">
                {currentArtwork.artist} ({currentArtwork.year})
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 mt-1.5 w-72 bg-stone-900 border border-stone-700/80 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                <div className="px-3 py-2 border-b border-stone-800 text-[10px] font-mono uppercase text-amber-400/80 flex items-center justify-between">
                  <span>Masterpiece Collection</span>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenSalonModal();
                    }}
                    className="text-stone-300 hover:text-amber-300 underline"
                  >
                    View All
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {MASTERPIECES.map((art) => (
                    <button
                      key={art.id}
                      onClick={() => {
                        onSelectArtwork(art);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-stone-800 transition-colors ${
                        art.id === currentArtwork.id ? 'bg-amber-500/15 border-l-2 border-amber-400' : ''
                      }`}
                    >
                      <img
                        src={art.imageUrl}
                        alt={art.title}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded object-cover border border-stone-700 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-stone-200 truncate">{art.title}</p>
                        <p className="text-[10px] text-stone-400 truncate">{art.artist}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* WebMCP indicator */}
        <GalleryWebMCP
          currentArtwork={currentArtwork}
          onStartTour={onStartTour}
          onViewportChange={onViewportChange}
          onSelectArtwork={onSelectArtwork}
          onToggleDossier={onToggleDossier}
          onToggleAmbient={onToggleAmbient}
        />

        {/* Salon Wall Browser */}
        <button
          id="btn-open-salon"
          onClick={onOpenSalonModal}
          title="Browse Masterpiece Salon"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-750 text-stone-300 hover:text-amber-200 text-xs font-medium transition-colors"
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Salon Gallery</span>
        </button>

        {/* Guided Master Tour button */}
        {currentArtwork.tours.length > 0 && (
          <button
            id="btn-start-tour"
            onClick={onStartTour}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isTourActive
                ? 'bg-amber-500 text-stone-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-gradient-to-r from-amber-600/80 to-amber-700/80 hover:from-amber-500 hover:to-amber-600 text-stone-100 border border-amber-500/50'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Guided Tour</span>
          </button>
        )}

        {/* Ambient Acoustics Synthesizer */}
        <button
          id="btn-ambient-sound"
          onClick={onToggleAmbient}
          title={ambientPlaying ? 'Mute Museum Hall Acoustics' : 'Play Museum Hall Acoustics'}
          className={`p-2 rounded-lg transition-colors ${
            ambientPlaying
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-200'
          }`}
        >
          <Music className="w-4 h-4" />
        </button>

        {/* Curator Dossier Info Panel Toggle */}
        <button
          id="btn-toggle-info"
          onClick={onToggleInfoPanel}
          title="Artwork Dossier & Color Analysis"
          className={`flex items-center gap-1.5 p-2 md:px-3 md:py-1.5 rounded-lg text-xs font-medium transition-colors ${
            isInfoOpen
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-amber-200'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span className="hidden md:inline">Dossier</span>
        </button>
      </div>
    </header>
  );
};
