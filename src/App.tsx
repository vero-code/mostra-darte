import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Eye } from 'lucide-react';
import type {
  Artwork,
  ChatMessage,
  FocalPoint,
  GuidedTour,
  ViewportState,
  BookingPass,
} from './types';
import { MASTERPIECES } from './data/artworks';
import { ArtworkCanvas } from './components/ArtworkCanvas.tsx';
import { DocentChat } from './components/DocentChat.tsx';
import { GalleryHeader } from './components/GalleryHeader.tsx';
import { ArtworkInfoPanel } from './components/ArtworkInfoPanel';
import { TourPlayer } from './components/TourPlayer.tsx';
import { MasterpieceModal } from './components/MasterpieceModal.tsx';
import { BookingPassModal } from './components/BookingPassModal';
import { ambientAudio } from './utils/ambientAudio';
import { docentSpeech } from './utils/speech';

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

  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [infoTab, setInfoTab] = useState<'overview' | 'focal' | 'palette' | 'tours'>('overview');

  const [isSalonModalOpen, setIsSalonModalOpen] = useState(false);
  const [salonSearch, setSalonSearch] = useState('');
  const [salonPeriod, setSalonPeriod] = useState('all');

  const [activeTour, setActiveTour] = useState<GuidedTour | null>(null);
  const [tourStopIndex, setTourStopIndex] = useState(0);

  const [ambientPlaying, setAmbientPlaying] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [activeTabMobile, setActiveTabMobile] = useState<'canvas' | 'docent'>('canvas');

  const [bookingPass, setBookingPass] = useState<BookingPass | null>(null);

  // Initial Curatorial Welcome Message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome-1',
      role: 'assistant',
      content: `Welcome to **Mostra d'Arte**, esteemed visitor. I am your Head Curator and Virtual Docent.\n\nHere, we explore art history not through passive viewing, but through dynamic, agent-native direction of attention. Before us hangs Vincent van Gogh's transcendent **${currentArtwork.title}** (${currentArtwork.year}).\n\nNotice the ecstatic swirl of cosmic energy and earthly melancholy. Instruct your browser's AI Agent via **WebMCP** to steer the camera, explore the curatorial dossier, or launch an automated guided tour!`,
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

      // Voice Narration
      if (voiceEnabled && data.content) {
        docentSpeech.speak(data.content);
      }
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
    setActiveTour(null);
    setViewport({
      zoom: 1,
      x: 50,
      y: 50,
      isAutoAnimating: true,
      spotlightActive: false,
      loupeActive: false,
      gridActive: false,
    });

    const switchMsg: ChatMessage = {
      id: `switch-${Date.now()}`,
      role: 'assistant',
      content: `We now step into the presence of **${artwork.title}** (${artwork.year}) by **${artwork.artist}**.\n\n${artwork.curatorOverview}\n\nWhere would you like to direct our inquiry first?`,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, switchMsg]);

    if (voiceEnabled) {
      docentSpeech.speak(switchMsg.content);
    }
  };

  // Start Guided Tour
  const handleStartTour = (tour?: GuidedTour) => {
    const selectedTour = tour || currentArtwork.tours[0];
    if (!selectedTour) return;

    setActiveTour(selectedTour);
    setTourStopIndex(0);

    const firstStop = selectedTour.stops[0];
    if (firstStop) {
      setViewport((prev) => ({
        ...prev,
        zoom: firstStop.zoom,
        x: firstStop.x,
        y: firstStop.y,
        activeLabel: firstStop.title,
        isAutoAnimating: true,
      }));

      const tourMsg: ChatMessage = {
        id: `tour-stop-0-${Date.now()}`,
        role: 'assistant',
        content: `**Tour: ${selectedTour.title}**\n\n*Stop 1 of ${selectedTour.stops.length}: ${firstStop.title}*\n\n${firstStop.narrative}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, tourMsg]);

      if (voiceEnabled) {
        docentSpeech.speak(firstStop.narrative);
      }
    }
  };

  // Advance Tour Stop
  const handleNextTourStop = () => {
    if (!activeTour) return;
    if (tourStopIndex < activeTour.stops.length - 1) {
      const nextIdx = tourStopIndex + 1;
      setTourStopIndex(nextIdx);
      const stop = activeTour.stops[nextIdx];

      setViewport((prev) => ({
        ...prev,
        zoom: stop.zoom,
        x: stop.x,
        y: stop.y,
        activeLabel: stop.title,
        isAutoAnimating: true,
      }));

      const tourMsg: ChatMessage = {
        id: `tour-stop-${nextIdx}-${Date.now()}`,
        role: 'assistant',
        content: `*Stop ${nextIdx + 1} of ${activeTour.stops.length}: ${stop.title}*\n\n${stop.narrative}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, tourMsg]);

      if (voiceEnabled) {
        docentSpeech.speak(stop.narrative);
      }
    } else {
      // Tour completed
      setActiveTour(null);
      const finishMsg: ChatMessage = {
        id: `tour-end-${Date.now()}`,
        role: 'assistant',
        content: `We have completed our journey through **${activeTour.title}**. You may now freely explore further details or choose another masterpiece from our Salon Wall.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, finishMsg]);
      if (voiceEnabled) {
        docentSpeech.speak(finishMsg.content);
      }
    }
  };

  // Prev Tour Stop
  const handlePrevTourStop = () => {
    if (!activeTour || tourStopIndex <= 0) return;
    const prevIdx = tourStopIndex - 1;
    setTourStopIndex(prevIdx);
    const stop = activeTour.stops[prevIdx];

    setViewport((prev) => ({
      ...prev,
      zoom: stop.zoom,
      x: stop.x,
      y: stop.y,
      activeLabel: stop.title,
      isAutoAnimating: true,
    }));

    if (voiceEnabled) {
      docentSpeech.speak(stop.narrative);
    }
  };

  // Toggle Dossier from WebMCP
  const handleToggleDossier = useCallback((open: boolean, tab?: 'overview' | 'focal' | 'palette' | 'tours') => {
    setIsInfoOpen(open);
    if (tab) setInfoTab(tab);
  }, []);

  // Toggle Salon Wall Modal
  const handleToggleSalon = useCallback((open: boolean, period?: string, search?: string) => {
    setIsSalonModalOpen(open);
    if (period) setSalonPeriod(period);
    if (search !== undefined) setSalonSearch(search);
  }, []);

  // Handle Exhibition Booking
  const handleReservePass = useCallback((pass: BookingPass) => {
    setBookingPass(pass);
  }, []);

  // Ambient sound toggle
  const handleToggleAmbient = useCallback((forceActive?: boolean) => {
    let nextPlaying: boolean;
    if (typeof forceActive === 'boolean') {
      if (forceActive) {
        ambientAudio.start();
        nextPlaying = true;
      } else {
        ambientAudio.stop();
        nextPlaying = false;
      }
    } else {
      nextPlaying = ambientAudio.toggle();
    }
    setAmbientPlaying(nextPlaying);
    return nextPlaying;
  }, []);

  // Voice toggle
  const handleToggleVoice = () => {
    const muted = docentSpeech.toggleMute();
    setVoiceEnabled(!muted);
  };

  // Docent Speak handler (WebMCP projection from AI agent)
  const handleDocentSpeak = (message: string) => {
    if (!message || !message.trim()) return;
    const assistantMsg: ChatMessage = {
      id: `docent-${Date.now()}`,
      role: 'assistant',
      content: message.trim(),
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, assistantMsg]);
    if (voiceEnabled) {
      docentSpeech.speak(message.trim());
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-stone-950 text-stone-100 antialiased font-sans">
      {/* Top Gallery Navigation Bar */}
      <GalleryHeader
        currentArtwork={currentArtwork}
        onSelectArtwork={handleSelectArtwork}
        onToggleInfoPanel={() => setIsInfoOpen(!isInfoOpen)}
        isInfoOpen={isInfoOpen}
        onStartTour={() => handleStartTour()}
        isTourActive={Boolean(activeTour)}
        ambientPlaying={ambientPlaying}
        onToggleAmbient={handleToggleAmbient}
        onOpenSalonModal={() => setIsSalonModalOpen(true)}
        onViewportChange={handleViewportChange}
        onToggleDossier={handleToggleDossier}
        onReservePass={handleReservePass}
        onToggleSalon={handleToggleSalon}
        onDocentSpeak={handleDocentSpeak}
      />

      {/* Mobile View Switcher Tab Bar */}
      <div className="md:hidden flex border-b border-stone-800 bg-stone-950 text-xs shrink-0 z-20">
        <button
          onClick={() => setActiveTabMobile('canvas')}
          className={`flex-1 py-2 text-center font-medium flex items-center justify-center gap-1.5 ${
            activeTabMobile === 'canvas'
              ? 'text-amber-300 border-b-2 border-amber-400 bg-stone-900/60'
              : 'text-stone-400'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Master Canvas
        </button>
        <button
          onClick={() => setActiveTabMobile('docent')}
          className={`flex-1 py-2 text-center font-medium flex items-center justify-center gap-1.5 ${
            activeTabMobile === 'docent'
              ? 'text-amber-300 border-b-2 border-amber-400 bg-stone-900/60'
              : 'text-stone-400'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Virtual Docent
          {messages.length > 1 && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          )}
        </button>
      </div>

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

          {/* Active Guided Tour Player */}
          {activeTour && (
            <TourPlayer
              tour={activeTour}
              currentStopIndex={tourStopIndex}
              onNextStop={handleNextTourStop}
              onPrevStop={handlePrevTourStop}
              onEndTour={() => {
                setActiveTour(null);
                docentSpeech.stop();
              }}
            />
          )}
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
            voiceEnabled={voiceEnabled}
            onToggleVoice={handleToggleVoice}
          />
        </aside>
      </div>

      {/* Curatorial Dossier Info Slide-out Drawer */}
      <ArtworkInfoPanel
        artwork={currentArtwork}
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        onSelectFocalPoint={handleSelectFocalPoint}
        onStartTour={handleStartTour}
        initialTab={infoTab}
      />

      {/* Masterpiece Salon Wall Browser Modal */}
      <MasterpieceModal
        isOpen={isSalonModalOpen}
        onClose={() => setIsSalonModalOpen(false)}
        currentArtworkId={currentArtwork.id}
        onSelectArtwork={handleSelectArtwork}
        initialSearch={salonSearch}
        initialPeriod={salonPeriod}
      />

      {/* Exhibition VIP Booking Pass Modal */}
      <BookingPassModal
        pass={bookingPass}
        onClose={() => setBookingPass(null)}
      />
    </div>
  )
}

export default App
