import { useState, useEffect, useCallback } from 'react';
import type {
  Artwork,
  ChatMessage,
  FocalPoint,
  ViewportState,
} from './types';
import { MASTERPIECES } from './data/artworks';
import { ArtworkCanvas } from './components/ArtworkCanvas.tsx';
import { DocentChat } from './components/DocentChat.tsx';
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

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [pendingCoordQuery, setPendingCoordQuery] = useState<{ x: number; y: number } | null>(null);

  const [isSalonModalOpen, setIsSalonModalOpen] = useState(false);

  const [ambientPlaying, setAmbientPlaying] = useState(false);
  const [activeTabMobile, setActiveTabMobile] = useState<'canvas' | 'docent'>('canvas');

  // Initial Curatorial Welcome Message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome-1',
      role: 'assistant',
      content: `Welcome to **Mostra d'Arte**, esteemed visitor. I am your Head Curator and Virtual Docent.\n\nHere, we explore art history not merely through passive viewing, but through dynamic direction of attention. Before us hangs Vincent van Gogh's transcendent **${currentArtwork.title}** (1889).\n\nNotice the ecstatic swirl of cosmic energy and earthly melancholy. I can physically steer your view to any brushstroke or hidden symbol. What captures your curiosity? Ask me any question, or tap directly onto the canvas!`,
      timestamp: Date.now(),
    };
    setMessages([welcomeMessage]);
  }, []);

  // Update viewport state helper
  const handleViewportChange = useCallback((newVp: Partial<ViewportState>) => {
    setViewport((prev) => ({ ...prev, ...newVp }));
  }, []);

  // Send message to Docent
  const handleSendMessage = async (text: string, coordQuery?: { x: number; y: number }) => {
    if (!text.trim() || isThinking) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setIsThinking(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory,
          currentArtwork,
          userCoordQuery: coordQuery,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to consult docent');
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.content,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error contacting docent:', err);
      const errorMessage: ChatMessage = {
        id: `assistant-err-${Date.now()}`,
        role: 'assistant',
        content: `Forgive me, dear visitor. The gallery acoustics seem momentarily disturbed. Allow me to redirect your gaze to ${currentArtwork.title}.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  // Canvas Click Coordinate Handler
  const handleCanvasClickCoordinate = (coord: { x: number; y: number }) => {
    setPendingCoordQuery(coord);
    setActiveTabMobile('docent');
  };

  // Select Curated Focal Point
  const handleSelectFocalPoint = (fp: FocalPoint) => {
    setViewport((prev) => ({
      ...prev,
      zoom: fp.zoom,
      x: fp.x,
      y: fp.y,
      activeLabel: fp.name,
      isAutoAnimating: true,
    }));

    // handleSendMessage(`Tell me about ${fp.name} at coordinates {x: ${fp.x}%, y: ${fp.y}%}.`);
  };

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
        onViewportChange={handleViewportChange}
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
            onCanvasClickCoordinate={handleCanvasClickCoordinate}
            onSelectFocalPoint={handleSelectFocalPoint}
          />
        </main>

        {/* Right: Virtual Docent Attention Chat Panel */}
        <aside
          className={`w-full md:w-[420px] lg:w-[460px] xl:w-[500px] h-full shrink-0 ${
            activeTabMobile === 'docent' ? 'block' : 'hidden md:block'
          }`}
        >
          <DocentChat
            artwork={currentArtwork}
            messages={messages}
            isThinking={isThinking}
            onSendMessage={handleSendMessage}
            pendingCoordQuery={pendingCoordQuery}
            onClearCoordQuery={() => setPendingCoordQuery(null)}
          />
        </aside>
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
