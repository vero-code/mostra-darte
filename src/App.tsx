import { useState, useCallback } from 'react';
import type { Artwork, ViewportState } from './types';
import { MASTERPIECES } from './data/artworks';
import { ArtworkCanvas } from './components/ArtworkCanvas.tsx';
import { GalleryHeader } from './components/GalleryHeader.tsx';
import { MasterpieceModal } from './components/MasterpieceModal.tsx';
import { ambientAudio } from './utils/ambientAudio';

function App() {
  const [currentArtwork, setCurrentArtwork] = useState<Artwork>(MASTERPIECES[0]);
  const [viewport, setViewport] = useState<ViewportState>({
    zoom: 1,
    x: 50,
    y: 50,
    isAutoAnimating: false,
    spotlightActive: false,
    loupeActive: false,
    gridActive: false,
  });

  const [isSalonModalOpen, setIsSalonModalOpen] = useState(false);

  const [ambientPlaying, setAmbientPlaying] = useState(false);
  const [activeTabMobile, setActiveTabMobile] = useState<'canvas' | 'docent'>('canvas');

  // Update viewport state helper
  const handleViewportChange = useCallback((newVp: Partial<ViewportState>) => {
    setViewport((prev) => ({ ...prev, ...newVp }));
  }, []);

  // Switch Masterpiece
  const handleSelectArtwork = (artwork: Artwork) => {
    if (artwork.id === currentArtwork.id) return;
    setCurrentArtwork(artwork);
  };

  // Ambient sound toggle
  const handleToggleAmbient = () => {
    const isNowPlaying = ambientAudio.toggle();
    setAmbientPlaying(isNowPlaying);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-stone-950 text-stone-100 antialiased font-sans">
      {/* Top Gallery Navigation Bar */}
      <GalleryHeader
        currentArtwork={currentArtwork}
        onSelectArtwork={handleSelectArtwork}
        ambientPlaying={ambientPlaying}
        onToggleAmbient={handleToggleAmbient}
        onOpenSalonModal={() => setIsSalonModalOpen(true)}
      />

      {/* Main Split-Screen Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left/Center: Masterpiece Canvas Viewport */}
        <main
          className={`flex-1 relative h-full overflow-hidden ${
            activeTabMobile === 'canvas' ? 'block' : 'hidden md:block'
          }`}
        >
          <ArtworkCanvas
            artwork={currentArtwork}
            viewport={viewport}
            onViewportChange={handleViewportChange}
          />
        </main>

        {/* Right: Virtual Docent Attention Chat Panel */}
        <aside>Virtual Docent Attention Chat Panel</aside>
      </div>

      {/* Masterpiece Salon Wall Browser Modal */}
      <MasterpieceModal
        isOpen={isSalonModalOpen}
        onClose={() => setIsSalonModalOpen(false)}
        currentArtworkId={currentArtwork.id}
        onSelectArtwork={handleSelectArtwork}
      />
    </div>
  )
}

export default App
