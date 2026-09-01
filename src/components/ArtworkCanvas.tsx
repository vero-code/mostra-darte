import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Sun,
  Grid,
  MapPin,
  Sparkles,
  Info,
} from 'lucide-react';
import type { Artwork, FocalPoint, ViewportState } from '../types';

interface ArtworkCanvasProps {
  artwork: Artwork;
  viewport: ViewportState;
  onViewportChange: (newVp: Partial<ViewportState>) => void;
}

export const ArtworkCanvas: React.FC<ArtworkCanvasProps> = ({
  artwork,
  viewport,
  onViewportChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showHotspots, setShowHotspots] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeHoverHotspot, setActiveHoverHotspot] = useState<FocalPoint | null>(null);
  const [clickRipple, setClickRipple] = useState<{ x: number; y: number; id: number } | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset image loaded on artwork change
  useEffect(() => {
    setImageLoaded(false);
  }, [artwork.id]);

  // Handle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Handle Wheel Zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const cursorX = ((e.clientX - rect.left) / rect.width) * 100;
      const cursorY = ((e.clientY - rect.top) / rect.height) * 100;

      const zoomFactor = e.deltaY < 0 ? 1.2 : 0.83;
      const newZoom = Math.min(Math.max(1, viewport.zoom * zoomFactor), 8);

      if (newZoom === 1) {
        onViewportChange({ zoom: 1, x: 50, y: 50, isAutoAnimating: false });
      } else {
        // Interpolate center toward cursor when zooming in
        const currentX = viewport.x;
        const currentY = viewport.y;
        const targetX = currentX + (cursorX - currentX) * 0.2;
        const targetY = currentY + (cursorY - currentY) * 0.2;

        onViewportChange({
          zoom: parseFloat(newZoom.toFixed(2)),
          x: Math.min(Math.max(0, parseFloat(targetX.toFixed(2))), 100),
          y: Math.min(Math.max(0, parseFloat(targetY.toFixed(2))), 100),
          isAutoAnimating: false,
        });
      }
    },
    [viewport, onViewportChange]
  );

  // Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewport.zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || viewport.zoom <= 1 || !containerRef.current) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setDragStart({ x: e.clientX, y: e.clientY });

    const rect = containerRef.current.getBoundingClientRect();
    const percentDeltaX = (deltaX / rect.width) * 100 * (1 / viewport.zoom);
    const percentDeltaY = (deltaY / rect.height) * 100 * (1 / viewport.zoom);

    onViewportChange({
      x: Math.min(Math.max(0, viewport.x - percentDeltaX)),
      y: Math.min(Math.max(0, viewport.y - percentDeltaY)),
      isAutoAnimating: false,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Click anywhere on canvas to ask Docent
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If was dragging, don't trigger click
    if (isDragging) return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clickScreenX = e.clientX - rect.left;
    const clickScreenY = e.clientY - rect.top;

    // Convert screen click into artwork coordinate taking into account current zoom & center origin
    let artX = (clickScreenX / rect.width) * 100;
    let artY = (clickScreenY / rect.height) * 100;

    if (viewport.zoom > 1) {
      // Invert zoom transform: ScreenPoint = Center + (ArtPoint - Center) * Zoom
      // ArtPoint = Center + (ScreenPoint - Center) / Zoom
      const centerX = viewport.x;
      const centerY = viewport.y;
      artX = centerX + (artX - centerX) / viewport.zoom;
      artY = centerY + (artY - centerY) / viewport.zoom;
    }

    const clampedX = Math.min(Math.max(0, parseFloat(artX.toFixed(1))), 100);
    const clampedY = Math.min(Math.max(0, parseFloat(artY.toFixed(1))), 100);

    setClickRipple({ x: clampedX, y: clampedY, id: Date.now() });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === '+' || e.key === '=') {
        onViewportChange({ zoom: Math.min(8, viewport.zoom * 1.25), isAutoAnimating: false });
      } else if (e.key === '-' || e.key === '_') {
        onViewportChange({ zoom: Math.max(1, viewport.zoom * 0.8), isAutoAnimating: false });
      } else if (e.key === '0') {
        onViewportChange({ zoom: 1, x: 50, y: 50, activeLabel: undefined, isAutoAnimating: true });
      } else if (e.key === 's' || e.key === 'S') {
        onViewportChange({ spotlightActive: !viewport.spotlightActive });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewport, onViewportChange]);

  return (
    <div
      id="mostra-artwork-viewport"
      ref={containerRef}
      className={`relative w-full h-full bg-stone-950 overflow-hidden select-none flex items-center justify-center ${
        viewport.zoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-crosshair'
      }`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
    >
      {/* Background Subtle Gallery Wall texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-900/60 via-stone-950 to-stone-950 pointer-events-none" />

      {/* Frame Glow & Shadow Ambient */}
      <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.85)] pointer-events-none z-10" />

      {/* Image Loading State */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-950 z-20">
          <div className="w-12 h-12 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4" />
          <p className="font-display text-amber-200/80 text-sm tracking-widest uppercase">
            Curating Masterpiece...
          </p>
        </div>
      )}

      {/* Main Scalable Canvas Stage */}
      <div
        className="relative max-w-full max-h-full flex items-center justify-center"
        style={{
          aspectRatio: `${artwork.aspectRatio}`,
          width: artwork.aspectRatio > 1.2 ? '92%' : 'auto',
          height: artwork.aspectRatio <= 1.2 ? '90%' : 'auto',
        }}
      >
        <div
          className="relative w-full h-full overflow-hidden rounded-sm shadow-2xl transition-transform duration-700 ease-out"
          style={{
            transform: `scale(${viewport.zoom})`,
            transformOrigin: `${viewport.x}% ${viewport.y}%`,
            transition: viewport.isAutoAnimating
              ? 'transform 1000ms cubic-bezier(0.2, 0.9, 0.2, 1)'
              : 'transform 150ms ease-out',
          }}
        >
          {/* High-res Artwork Image */}
          <img
            id="masterpiece-canvas-img"
            src={artwork.imageUrl}
            alt={artwork.title}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-contain pointer-events-none block transition-opacity duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Composition Grid / Golden Ratio Overlay */}
          {viewport.gridActive && (
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-10 border border-amber-400/20">
              <div className="border-r border-b border-amber-400/25" />
              <div className="border-r border-b border-amber-400/25" />
              <div className="border-b border-amber-400/25" />
              <div className="border-r border-b border-amber-400/25" />
              <div className="border-r border-b border-amber-400/25" />
              <div className="border-b border-amber-400/25" />
              <div className="border-r border-amber-400/25" />
              <div className="border-r border-amber-400/25" />
              <div />
            </div>
          )}

          {/* Dynamic Curated Hotspot Markers (Pointers on the Canvas) */}
          {showHotspots && (
            <div className="absolute inset-0 pointer-events-none">
              {artwork.focalPoints.map((fp) => {
                const isSelected =
                  viewport.zoom > 1.2 &&
                  Math.abs(viewport.x - fp.x) < 8 &&
                  Math.abs(viewport.y - fp.y) < 8;

                return (
                  <div
                    key={fp.id}
                    className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    style={{ left: `${fp.x}%`, top: `${fp.y}%` }}
                    onClick={(e) => {
                      e.stopPropagation();
                    //   onSelectFocalPoint(fp);
                    }}
                    onMouseEnter={() => setActiveHoverHotspot(fp)}
                    onMouseLeave={() => setActiveHoverHotspot(null)}
                  >
                    <div
                      className={`relative flex items-center justify-center transition-all duration-300 ${
                        isSelected ? 'scale-125' : 'scale-90 group-hover:scale-110'
                      }`}
                    >
                      {/* Pulse Ring */}
                      <span
                        className={`absolute w-8 h-8 rounded-full bg-amber-400/30 animate-ping ${
                          isSelected ? 'opacity-100' : 'opacity-40 group-hover:opacity-80'
                        }`}
                      />
                      {/* Badge Center */}
                      <span
                        className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full border shadow-lg text-[10px] font-bold transition-colors ${
                          isSelected
                            ? 'bg-amber-500 border-white text-stone-950 ring-4 ring-amber-400/40'
                            : 'bg-stone-900/90 border-amber-400/80 text-amber-300 group-hover:bg-amber-500 group-hover:text-stone-950'
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                      </span>
                    </div>

                    {/* Hover Tooltip */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block z-30 pointer-events-none whitespace-nowrap">
                      <div className="bg-stone-900/95 border border-amber-500/40 backdrop-blur-md px-3 py-1.5 rounded-md shadow-2xl">
                        <p className="text-xs font-semibold text-amber-200">{fp.name}</p>
                        <p className="text-[10px] text-stone-400 capitalize">{fp.category} • {fp.zoom}x</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* User Tap/Click Ripple Indicator */}
          {clickRipple && (
            <div
              key={clickRipple.id}
              className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-20"
              style={{ left: `${clickRipple.x}%`, top: `${clickRipple.y}%` }}
            >
              <div className="w-10 h-10 border-2 border-amber-400 rounded-full animate-ping" />
              <div className="absolute top-0 left-0 w-10 h-10 bg-amber-400/30 rounded-full" />
            </div>
          )}

          {/* Docent Attention Ray & Target Reticle */}
          {viewport.zoom > 1.2 && (
            <div
              className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-20"
              style={{ left: `${viewport.x}%`, top: `${viewport.y}%` }}
            >
              {/* Outer Golden Target Crosshair */}
              <div className="relative flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border border-amber-400/60 canvas-target-reticle animate-pulse-ring" />
                <div className="absolute w-10 h-10 rounded-full border border-amber-300/80" />
                <div className="absolute w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b]" />

                {/* Crosshair hair lines */}
                <div className="absolute w-7 h-[1px] -left-8 bg-amber-400/70" />
                <div className="absolute w-7 h-[1px] -right-8 bg-amber-400/70" />
                <div className="absolute h-7 w-[1px] -top-8 bg-amber-400/70" />
                <div className="absolute h-7 w-[1px] -bottom-8 bg-amber-400/70" />

              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spotlight Mode Overlay (Darkens perimeter, focusing docent attention) */}
      {viewport.spotlightActive && viewport.zoom > 1 && (
        <div
          className="absolute inset-0 pointer-events-none z-15 transition-opacity duration-700"
          style={{
            background: `radial-gradient(circle 220px at 50% 50%, transparent 0%, rgba(0, 0, 0, 0.82) 85%, rgba(0,0,0,0.96) 100%)`,
          }}
        />
      )}

      {/* Loupe / Magnifier Mode Overlay */}
      {viewport.loupeActive && (
        <div className="absolute bottom-20 left-6 z-30 pointer-events-none hidden md:block">
          <div className="w-44 h-44 rounded-full border-4 border-amber-500/80 shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden relative bg-stone-900">
            <img
              src={artwork.imageUrl}
              alt="Loupe"
              referrerPolicy="no-referrer"
              className="absolute max-w-none transform origin-center"
              style={{
                width: '400%',
                left: `${-viewport.x * 3.5}%`,
                top: `${-viewport.y * 3.5}%`,
              }}
            />
            <div className="absolute inset-0 border border-amber-400/30 rounded-full" />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-stone-950/80 px-2 py-0.5 rounded-full text-[9px] text-amber-300 font-mono">
              Loupe {(viewport.zoom * 1.5).toFixed(1)}x
            </div>
          </div>
        </div>
      )}

      {/* Floating Spatial Toolbar Controls (Top Left & Bottom Left) */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="bg-stone-900/85 backdrop-blur-md border border-stone-800/80 rounded-lg p-1.5 shadow-2xl flex items-center gap-1">
          <button
            id="btn-zoom-in"
            title="Zoom In (+)"
            onClick={(e) => {
              e.stopPropagation();
              onViewportChange({ zoom: Math.min(8, viewport.zoom * 1.3), isAutoAnimating: false });
            }}
            className="p-2 rounded-md hover:bg-stone-800 text-stone-300 hover:text-amber-300 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            id="btn-zoom-out"
            title="Zoom Out (-)"
            onClick={(e) => {
              e.stopPropagation();
              const nz = Math.max(1, viewport.zoom * 0.77);
              onViewportChange({
                zoom: nz,
                x: nz === 1 ? 50 : viewport.x,
                y: nz === 1 ? 50 : viewport.y,
                isAutoAnimating: false,
              });
            }}
            className="p-2 rounded-md hover:bg-stone-800 text-stone-300 hover:text-amber-300 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            id="btn-reset-view"
            title="Reset View to 1.0x (0)"
            onClick={(e) => {
              e.stopPropagation();
              onViewportChange({
                zoom: 1,
                x: 50,
                y: 50,
                activeLabel: undefined,
                isAutoAnimating: true,
              });
            }}
            className="p-2 rounded-md hover:bg-stone-800 text-stone-300 hover:text-amber-300 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-5 bg-stone-800 mx-1" />

          <button
            id="btn-toggle-spotlight"
            title="Toggle Attention Spotlight (S)"
            onClick={(e) => {
              e.stopPropagation();
              onViewportChange({ spotlightActive: !viewport.spotlightActive });
            }}
            className={`p-2 rounded-md transition-colors ${
              viewport.spotlightActive
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'hover:bg-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sun className="w-4 h-4" />
          </button>

          <button
            id="btn-toggle-hotspots"
            title="Toggle Curated Focal Points"
            onClick={(e) => {
              e.stopPropagation();
              setShowHotspots(!showHotspots);
            }}
            className={`p-2 rounded-md transition-colors ${
              showHotspots
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'hover:bg-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
          </button>

          <button
            id="btn-toggle-grid"
            title="Toggle Composition Grid"
            onClick={(e) => {
              e.stopPropagation();
              onViewportChange({ gridActive: !viewport.gridActive });
            }}
            className={`p-2 rounded-md transition-colors ${
              viewport.gridActive
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'hover:bg-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-5 bg-stone-800 mx-1" />

          <button
            id="btn-fullscreen"
            title="Toggle Fullscreen"
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="p-2 rounded-md hover:bg-stone-800 text-stone-300 hover:text-amber-300 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Spatial Coordinate Telemetry Pill */}
        <div className="hidden sm:flex items-center gap-2 bg-stone-900/80 backdrop-blur-md border border-stone-800/80 px-3 py-2 rounded-lg text-xs font-mono text-stone-400 shadow-xl">
          <span className="text-amber-400/80">X:</span>
          <span>{viewport.x.toFixed(1)}%</span>
          <span className="text-stone-600">•</span>
          <span className="text-amber-400/80">Y:</span>
          <span>{viewport.y.toFixed(1)}%</span>
          <span className="text-stone-600">•</span>
          <span className="text-amber-300 font-semibold">{viewport.zoom.toFixed(1)}x</span>
        </div>
      </div>

      {/* Minimap Radar (Bottom Right) */}
      {viewport.zoom > 1.3 && (
        <div className="absolute bottom-4 right-4 z-20 hidden md:block">
          <div className="bg-stone-900/90 border border-stone-800/90 backdrop-blur-md p-1.5 rounded-lg shadow-2xl">
            <div className="relative w-28 h-20 bg-stone-950 overflow-hidden rounded border border-stone-800">
              <img
                src={artwork.imageUrl}
                alt="Minimap"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-60"
              />
              {/* Viewport Box */}
              <div
                className="absolute border-2 border-amber-400 bg-amber-400/20 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
                style={{
                  left: `${viewport.x}%`,
                  top: `${viewport.y}%`,
                  width: `${Math.max(12, 100 / viewport.zoom)}%`,
                  height: `${Math.max(12, 100 / viewport.zoom)}%`,
                }}
              />
            </div>
            <div className="text-[10px] text-stone-400 font-mono text-center mt-1">
              Canvas Radar
            </div>
          </div>
        </div>
      )}

      {/* Click-to-Ask Instruction Banner on Initial Load */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none opacity-80 hover:opacity-100 transition-opacity">
        <div className="bg-stone-950/80 backdrop-blur-md border border-stone-800/80 px-3 py-1.5 rounded-md flex items-center gap-2 text-xs text-stone-400">
          <Info className="w-3.5 h-3.5 text-amber-400" />
          <span>Click any point on canvas or ask docent to zoom</span>
        </div>
      </div>
    </div>
  );
};
