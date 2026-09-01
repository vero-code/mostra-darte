import { useState } from 'react';
import type { Artwork } from './types';
import { MASTERPIECES } from './data/artworks';
import { GalleryHeader } from './components/GalleryHeader.tsx';
import { MasterpieceModal } from './components/MasterpieceModal.tsx';

function App() {
  const [currentArtwork, setCurrentArtwork] = useState<Artwork>(MASTERPIECES[0]);

  const [isSalonModalOpen, setIsSalonModalOpen] = useState(false);

  // Switch Masterpiece
  const handleSelectArtwork = (artwork: Artwork) => {
    if (artwork.id === currentArtwork.id) return;
    setCurrentArtwork(artwork);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-stone-950 text-stone-100 antialiased font-sans">
      {/* Top Gallery Navigation Bar */}
      <GalleryHeader
        currentArtwork={currentArtwork}
        onSelectArtwork={handleSelectArtwork}
        onOpenSalonModal={() => setIsSalonModalOpen(true)}
      />

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
