import React, { useEffect, useState, useRef } from 'react';
import type { Artwork, ViewportState } from '../types';
import { MASTERPIECES } from '../data/artworks';

interface GalleryWebMCPProps {
  currentArtwork?: Artwork;
  onStartTour?: () => void;
  onViewportChange: (newVp: Partial<ViewportState>) => void;
  onSelectArtwork: (artwork: Artwork) => void;
}

export const GalleryWebMCP: React.FC<GalleryWebMCPProps> = ({
  currentArtwork,
  onStartTour,
  onViewportChange,
  onSelectArtwork,
}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [toolCount, setToolCount] = useState<number>(0);

  const currentArtworkRef = useRef(currentArtwork);
  currentArtworkRef.current = currentArtwork;

  const onStartTourRef = useRef(onStartTour);
  onStartTourRef.current = onStartTour;

  useEffect(() => {
    if (typeof document === 'undefined' || !document.modelContext) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    const controller = new AbortController();

    // WebMCP tool change listener
    const handleToolChange = async () => {
      try {
        const tools = await document.modelContext?.getTools();
        if (tools) {
          setToolCount(tools.length);
          if (tools.length > 0) setIsRegistered(true);
        }
      } catch (err) {
        console.error("Error reading tools:", err);
      }
    };
    document.modelContext.addEventListener("toolchange", handleToolChange);
    handleToolChange();

    // WebMCP tool registration
    try {
      // Tool 1: zoom_painting
      document.modelContext.registerTool(
        {
          name: "zoom_painting",
          title: "Zoom Canvas on Detail",
          description: "Directs the gallery visitor's viewport and camera zoom to focus on a specific coordinate on the canvas.",
          inputSchema: {
            type: "object",
            properties: {
              x: { type: "number", description: "X coordinate percentage (0=left, 50=center, 100=right)" },
              y: { type: "number", description: "Y coordinate percentage (0=top, 50=center, 100=bottom)" },
              zoom: { type: "number", description: "Magnification level between 1.5 and 8.0" },
              detail_name: { type: "string", description: "Name of the detail being inspected" },
            },
            required: ["x", "y", "zoom"],
          },
          execute: async (
            { x, y, zoom, detail_name }: any,
            { signal }: { signal?: AbortSignal } = {}
          ) => {
            if (signal?.aborted) return "Zoom operation cancelled.";

            onViewportChange({
              x: Math.max(0, Math.min(100, Number(x))),
              y: Math.max(0, Math.min(100, Number(y))),
              zoom: Math.max(1, Math.min(8, Number(zoom))),
              activeLabel: detail_name || "Detail Inspection",
              isAutoAnimating: true,
            });
            return `Camera focused on "${detail_name || 'detail'}" at {x: ${x}%, y: ${y}%} at ${zoom}x zoom.`;
          },
          annotations: {
            readOnlyHint: true,
          },
        },
        { signal: controller.signal }
      )?.catch?.((err: any) => {
        if (err?.name !== 'AbortError') console.error("WebMCP registration error:", err);
      });

      // Tool 2: Switching the painting in the gallery
      document.modelContext.registerTool(
        {
          name: "switch_masterpiece",
          title: "Switch Masterpiece Exhibition",
          description: "Exhibits a different masterpiece in the gallery room. Available IDs: 'starry-night', 'mona-lisa', 'girl-pearl-earring', 'the-kiss', 'birth-of-venus', 'great-wave', 'creation-of-adam'.",
          inputSchema: {
            type: "object",
            properties: {
              artwork_id: {
                type: "string",
                description: "ID of the masterpiece to exhibit.",
                enum: [
                  "starry-night",
                  "mona-lisa",
                  "girl-pearl-earring",
                  "the-kiss",
                  "birth-of-venus",
                  "great-wave",
                  "creation-of-adam",
                ],
              },
              reason: {
                type: "string",
                description: "Curatorial connection or reason for changing artwork.",
              },
            },
            required: ["artwork_id"],
          },
          execute: async (
            { artwork_id }: any,
            { signal }: { signal?: AbortSignal } = {}
          ) => {
            if (signal?.aborted) return "Masterpiece switch cancelled.";

            const cleanId = String(artwork_id || '').toLowerCase().trim();
            const target = MASTERPIECES.find(
              (m) => m.id.toLowerCase() === cleanId || m.title.toLowerCase().includes(cleanId)
            );
            if (!target) {
              throw new Error(`Masterpiece "${artwork_id}" not found in gallery collection.`);
            }
            onSelectArtwork(target);
            onViewportChange({ zoom: 1, x: 50, y: 50, activeLabel: undefined, isAutoAnimating: true });
            return `Gallery exhibition successfully switched to "${target.title}" by ${target.artist}.`;
          },
          annotations: {
            readOnlyHint: true,
          },
        },
        { signal: controller.signal }
      )?.catch?.((err: any) => {
        if (err?.name !== 'AbortError') console.error(err);
      });

      // Tool 3: Reset view to full canvas
      document.modelContext.registerTool(
        {
          name: "reset_view",
          title: "Reset Canvas View",
          description: "Resets the canvas camera zoom back to 1.0x to view the entire framed painting composition as a whole.",
          inputSchema: {
            type: "object",
            properties: {
              note: {
                type: "string",
                description: "Optional note or reason for taking in the full composition.",
              },
            },
          },
          execute: async (
            _input: any,
            { signal }: { signal?: AbortSignal } = {}
          ) => {
            if (signal?.aborted) return "Reset view cancelled.";

            onViewportChange({
              zoom: 1,
              x: 50,
              y: 50,
              activeLabel: undefined,
              isAutoAnimating: true,
            });
            return "Camera zoom successfully reset to 1.0x viewing the complete painting.";
          },
          annotations: {
            readOnlyHint: true,
          },
        },
        { signal: controller.signal }
      )?.catch?.((err: any) => {
        if (err?.name !== 'AbortError') console.error(err);
      });

      // Tool 4: Toggle gallery vignette spotlight
      document.modelContext.registerTool(
        {
          name: "toggle_spotlight",
          title: "Toggle Gallery Spotlight",
          description: "Activates or deactivates a focused museum vignette spotlight on the painting, darkening ambient background surroundings for dramatic focus.",
          inputSchema: {
            type: "object",
            properties: {
              active: {
                type: "boolean",
                description: "True to turn on dramatic focused spotlight, false for standard gallery lighting.",
              },
            },
            required: ["active"],
          },
          execute: async (
            { active }: any,
            { signal }: { signal?: AbortSignal } = {}
          ) => {
            if (signal?.aborted) return "Spotlight toggle cancelled.";

            const isEnabled = Boolean(active);
            onViewportChange({ spotlightActive: isEnabled });
            return `Gallery spotlight dramatically ${isEnabled ? 'activated' : 'deactivated'}.`;
          },
          annotations: {
            readOnlyHint: true,
          },
        },
        { signal: controller.signal }
      )?.catch?.((err: any) => {
        if (err?.name !== 'AbortError') console.error(err);
      });

      // Tool 5: Get Curatorial Artwork Insights
      document.modelContext.registerTool(
        {
          name: "get_artwork_details",
          title: "Get Curatorial Artwork Insights",
          description: "Returns curatorial analysis, historical provenance, palette symbolism, and notable focal coordinates of an artwork. Provide artwork_id, or omit to query the currently exhibited painting.",
          inputSchema: {
            type: "object",
            properties: {
              artwork_id: {
                type: "string",
                description: "Optional ID of the artwork to inspect. If omitted, returns current painting.",
                enum: [
                  "starry-night",
                  "mona-lisa",
                  "girl-pearl-earring",
                  "the-kiss",
                  "birth-of-venus",
                  "great-wave",
                  "creation-of-adam"
                ]
              }
            }
          },
          execute: async (
            { artwork_id }: any,
            { signal }: { signal?: AbortSignal } = {}
          ) => {
            if (signal?.aborted) return "Query cancelled.";

            const active = currentArtworkRef.current || MASTERPIECES[0];
            const target = artwork_id
              ? MASTERPIECES.find(m => m.id === artwork_id) || active
              : active;

            return {
              id: target.id,
              title: target.title,
              artist: target.artist,
              year: target.year,
              period: target.period,
              location: target.location,
              curatorOverview: target.curatorOverview,
              palette: target.colorPalette.map(p => `${p.name} (${p.role})`),
              keyDetails: target.focalPoints.map(fp => ({
                name: fp.name,
                coordinates: { x: fp.x, y: fp.y, zoom: fp.zoom },
                curatorInsight: fp.curatorInsight
              }))
            };
          },
          annotations: {
            readOnlyHint: true,
          }
        },
        { signal: controller.signal }
      )?.catch?.((err: any) => {
        if (err?.name !== 'AbortError') console.error(err);
      });

      // Tool 6: Start Guided Tour
      document.modelContext.registerTool(
        {
          name: "start_guided_tour",
          title: "Start Guided Tour",
          description: "Launches an automated curatorial tour on the currently exhibited masterpiece, navigating through key historical focal points with pacing and voice narration.",
          inputSchema: {
            type: "object",
            properties: {
              note: {
                type: "string",
                description: "Optional reason or focus for starting the tour.",
              },
            },
          },
          execute: async (
            _params: any,
            { signal }: { signal?: AbortSignal } = {}
          ) => {
            if (signal?.aborted) return "Tour launch cancelled.";

            const active = currentArtworkRef.current || MASTERPIECES[0];
            const tour = active.tours?.[0];
            if (!tour) return "No guided tour available for this artwork.";

            if (onStartTourRef.current) {
              onStartTourRef.current();
              return `Guided tour "${tour.title}" launched (${tour.stops.length} stops).`;
            }
            return "Tour controller unavailable.";
          },
          annotations: {
            readOnlyHint: true,
          },
        },
        { signal: controller.signal }
      )?.catch?.((err: any) => {
        if (err?.name !== 'AbortError') console.error(err);
      });

      setIsRegistered(true);
    } catch (err) {
      console.error("Failed to register WebMCP tool:", err);
    }

    return () => {
      document.modelContext?.removeEventListener("toolchange", handleToolChange);
      controller.abort();
      setIsRegistered(false);
      setToolCount(0);
    };
  }, [onViewportChange, onSelectArtwork]);

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border backdrop-blur-md transition-all duration-300 select-none bg-stone-900/90 border-stone-800 text-stone-300 shadow-md">
      <span className={`w-2 h-2 rounded-full ${isSupported && isRegistered ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
      <span>
        {isSupported && isRegistered
          ? `WebMCP: ${toolCount > 0 ? `${toolCount} Tools` : 'Tools'} Active`
          : isSupported
          ? 'WebMCP: Initializing...'
          : 'WebMCP: Ready (Waiting for Chrome Agent)'}
      </span>
    </div>
  );
};
