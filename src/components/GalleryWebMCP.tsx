import React, { useEffect, useState, useRef } from 'react';
import type {
  Artwork,
  ViewportState,
  BookingPass,
} from '../types';
import { MASTERPIECES } from '../data/artworks';

interface GalleryWebMCPProps {
  currentArtwork?: Artwork;
  onStartTour?: () => void;
  onViewportChange: (newVp: Partial<ViewportState>) => void;
  onSelectArtwork: (artwork: Artwork) => void;
  onToggleDossier?: (open: boolean, tab?: 'overview' | 'focal' | 'palette' | 'tours') => void;
  onToggleAmbient?: (forceActive?: boolean) => void;
  onReservePass?: (pass: BookingPass) => void;
  onToggleSalon?: (open: boolean, period?: string, search?: string) => void;
  onDocentSpeak?: (message: string) => void;
}

export const GalleryWebMCP: React.FC<GalleryWebMCPProps> = ({
  currentArtwork,
  onStartTour,
  onViewportChange,
  onSelectArtwork,
  onToggleDossier,
  onToggleAmbient,
  onReservePass,
  onToggleSalon,
  onDocentSpeak,
}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [liveTools, setLiveTools] = useState<Array<{ name: string; description: string }>>([]);

  const currentArtworkRef = useRef(currentArtwork);
  currentArtworkRef.current = currentArtwork;

  const onStartTourRef = useRef(onStartTour);
  onStartTourRef.current = onStartTour;

  const onToggleDossierRef = useRef(onToggleDossier);
  onToggleDossierRef.current = onToggleDossier;

  const onToggleAmbientRef = useRef(onToggleAmbient);
  onToggleAmbientRef.current = onToggleAmbient;

  const onReservePassRef = useRef(onReservePass);
  onReservePassRef.current = onReservePass;

  const onToggleSalonRef = useRef(onToggleSalon);
  onToggleSalonRef.current = onToggleSalon;

  const onDocentSpeakRef = useRef(onDocentSpeak);
  onDocentSpeakRef.current = onDocentSpeak;

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
          setLiveTools(
            tools.map((t: any) => ({
              name: t.name,
              description: t.description || t.title || '',
            }))
          );
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

            const numX = Number(x);
            const numY = Number(y);
            const numZoom = Number(zoom);
            const clampedX = Number.isFinite(numX) ? Math.max(0, Math.min(100, numX)) : 50;
            const clampedY = Number.isFinite(numY) ? Math.max(0, Math.min(100, numY)) : 50;
            const clampedZoom = Number.isFinite(numZoom) ? Math.max(1, Math.min(8, numZoom)) : 2.5;

            onViewportChange({
              x: clampedX,
              y: clampedY,
              zoom: clampedZoom,
              activeLabel: detail_name || "Detail Inspection",
              isAutoAnimating: true,
            });
            return `Camera focused on "${detail_name || 'canvas detail'}" at {x: ${clampedX}%, y: ${clampedY}%} at ${clampedZoom}x zoom.`;
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
              const availableIds = MASTERPIECES.map(m => `"${m.id}" (${m.title})`).join(', ');
              return `Masterpiece "${artwork_id}" was not found in gallery collection. Available canonical masterpieces: ${availableIds}. Please retry with one of these valid IDs.`;
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

            const isEnabled = typeof active === 'boolean' ? active : true;
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
            const cleanId = artwork_id ? String(artwork_id).toLowerCase().trim() : '';
            const target = cleanId
              ? MASTERPIECES.find(m => m.id.toLowerCase() === cleanId || m.title.toLowerCase().includes(cleanId))
              : active;

            if (artwork_id && !target) {
              const availableIds = MASTERPIECES.map(m => `"${m.id}" (${m.title})`).join(', ');
              return `Artwork "${artwork_id}" is not in the gallery archives. Available masterpieces: ${availableIds}.`;
            }
            const painting = target || active;

            return {
              id: painting.id,
              title: painting.title,
              artist: painting.artist,
              year: painting.year,
              period: painting.period,
              location: painting.location,
              curatorOverview: painting.curatorOverview,
              palette: painting.colorPalette.map(p => `${p.name} (${p.role})`),
              keyDetails: painting.focalPoints.map(fp => ({
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

      // Tool 7: Toggle Curatorial Dossier
      document.modelContext.registerTool(
        {
          name: "toggle_curatorial_dossier",
          title: "Toggle Curatorial Dossier",
          description: "Opens or closes the curatorial dossier slide-out panel, optionally switching to a specific tab: 'overview', 'palette' (pigments & color analysis), 'focal' (focal points), or 'tours'.",
          inputSchema: {
            type: "object",
            properties: {
              open: {
                type: "boolean",
                description: "True to open the dossier panel, false to close it."
              },
              tab: {
                type: "string",
                description: "Optional tab to display: 'overview', 'palette', 'focal', or 'tours'.",
                enum: ["overview", "palette", "focal", "tours"]
              }
            },
            required: ["open"]
          },
          execute: async (
            { open, tab }: any,
            { signal }: { signal?: AbortSignal } = {}
          ) => {
            if (signal?.aborted) return "Dossier toggle cancelled.";

            const isOpen = typeof open === 'boolean' ? open : true;
            let normalizedTab: any = tab;
            if (typeof tab === 'string') {
              const lt = tab.toLowerCase();
              if (lt.includes('color') || lt.includes('pigment') || lt.includes('palette')) normalizedTab = 'palette';
              else if (lt.includes('focal') || lt.includes('point') || lt.includes('detail') || lt.includes('hotspot')) normalizedTab = 'focal';
              else if (lt.includes('tour')) normalizedTab = 'tours';
              else if (lt.includes('overview') || lt.includes('about') || lt.includes('info')) normalizedTab = 'overview';
            }

            if (onToggleDossierRef.current) {
              onToggleDossierRef.current(isOpen, normalizedTab);
              return isOpen
                ? `Curatorial dossier opened${normalizedTab ? ` on the "${normalizedTab}" tab` : ''}.`
                : "Curatorial dossier closed.";
            }
            return "Dossier controller unavailable.";
          },
          annotations: {
            readOnlyHint: true,
          }
        },
        { signal: controller.signal }
      )?.catch?.((err: any) => {
        if (err?.name !== 'AbortError') console.error(err);
      });

      // Tool 8: Toggle Ambient Acoustics
      document.modelContext.registerTool(
        {
          name: "toggle_ambient_acoustics",
          title: "Toggle Gallery Ambient Acoustics",
          description: "Activates or deactivates the synthetic contemplative museum hall reverberation chord synthesized via the Web Audio API.",
          inputSchema: {
            type: "object",
            properties: {
              active: {
                type: "boolean",
                description: "True to start atmospheric museum background audio, false to mute it."
              }
            },
            required: ["active"]
          },
          execute: async (
            { active }: any,
            { signal }: { signal?: AbortSignal } = {}
          ) => {
            if (signal?.aborted) return "Acoustics toggle cancelled.";

            const isEnabled = typeof active === 'boolean' ? active : true;
            if (onToggleAmbientRef.current) {
              onToggleAmbientRef.current(isEnabled);
              return isEnabled
                ? "Gallery ambient acoustics activated."
                : "Gallery ambient acoustics muted.";
            }
            return "Audio controller unavailable.";
          },
          annotations: {
            readOnlyHint: true,
          }
        },
        { signal: controller.signal }
      )?.catch?.((err: any) => {
        if (err?.name !== 'AbortError') console.error(err);
      });

      // Tool 9: Reserve Exhibition VIP Pass
      document.modelContext.registerTool(
        {
          name: "reserve_gallery_pass",
          title: "Reserve Exhibition VIP Pass",
          description: "Reserves an official VIP admission pass to the gallery exhibition. Produces a confirmed digital pass with booking ID and QR verification.",
          inputSchema: {
            type: "object",
            properties: {
              visitor_name: {
                type: "string",
                description: "Full name of the visitor."
              },
              date: {
                type: "string",
                description: "Desired date for the exhibition visit (e.g., '2026-09-03' or 'Tomorrow')."
              },
              tickets_count: {
                type: "number",
                description: "Number of admission passes (1 to 6). Defaults to 1."
              },
              session: {
                type: "string",
                description: "Exhibition time slot: 'Morning Curatorial Walk', 'Afternoon Salon', or 'Evening VIP & Nocturne'.",
                enum: ["Morning Curatorial Walk", "Afternoon Salon", "Evening VIP & Nocturne"]
              }
            },
            required: ["visitor_name", "date"]
          },
          execute: async (
            { visitor_name, date, tickets_count = 1, session = "Evening VIP & Nocturne" }: any,
            { signal }: { signal?: AbortSignal } = {}
          ) => {
            if (signal?.aborted) return "Booking cancelled.";

            const active = currentArtworkRef.current || MASTERPIECES[0];
            const passId = `MDA-2026-${Math.floor(1000 + Math.random() * 9000)}`;
            const cleanName = String(visitor_name || '').trim() || 'Exhibition Guest';
            const cleanDate = String(date || '').trim() || 'Tomorrow';
            let normalizedSession = 'Evening VIP & Nocturne';
            if (typeof session === 'string') {
              const ls = session.toLowerCase();
              if (ls.includes('morning')) normalizedSession = 'Morning Curatorial Walk';
              else if (ls.includes('afternoon')) normalizedSession = 'Afternoon Salon';
              else if (ls.includes('evening') || ls.includes('night') || ls.includes('nocturne')) normalizedSession = 'Evening VIP & Nocturne';
            }
            const count = Math.max(1, Math.min(10, Number(tickets_count) || 1));

            const pass: BookingPass = {
              passId,
              visitorName: cleanName,
              date: cleanDate,
              session: normalizedSession,
              ticketsCount: count,
              artworkTitle: `${active.title} — ${active.artist}`,
              confirmedAt: Date.now(),
            };

            if (onReservePassRef.current) {
              onReservePassRef.current(pass);
            }

            return `Exhibition VIP Pass confirmed! Pass ID: ${passId}. Visitor: ${cleanName}. Passes: ${count}. Date: ${cleanDate} (${normalizedSession}). Digital admission ticket displayed on screen.`;
          },
        },
        { signal: controller.signal }
      )?.catch?.((err: any) => {
        if (err?.name !== 'AbortError') console.error(err);
      });

      // Tool 10: Toggle Composition Grid
      document.modelContext.registerTool(
        {
          name: "toggle_composition_grid",
          title: "Toggle Composition Grid",
          description: "Overlays or hides the Golden Ratio dynamic composition grid on the canvas to analyze geometric balance, spiral ratios, and focal alignment.",
          inputSchema: {
            type: "object",
            properties: {
              active: {
                type: "boolean",
                description: "True to display the golden ratio and rule-of-thirds composition grid, false to hide it."
              }
            },
            required: ["active"]
          },
          execute: async (
            { active }: any,
            { signal }: { signal?: AbortSignal } = {}
          ) => {
            if (signal?.aborted) return "Grid toggle cancelled.";

            const isEnabled = typeof active === 'boolean' ? active : true;
            onViewportChange({ gridActive: isEnabled });
            return `Golden ratio composition grid ${isEnabled ? 'activated' : 'deactivated'} on canvas.`;
          },
          annotations: {
            readOnlyHint: true,
          }
        },
        { signal: controller.signal }
      )?.catch?.((err: any) => {
        if (err?.name !== 'AbortError') console.error(err);
      });

      // Tool 11: Open Salon Wall Browser
      document.modelContext.registerTool(
        {
          name: "open_salon_browser",
          title: "Browse Masterpiece Salon Wall",
          description: "Opens the full-screen Salon Wall exhibition browser. IMPORTANT: Whenever the user asks for, mentions, or filters by a specific art period or artist, you MUST specify the 'period' (e.g., 'Dutch Golden Age', 'High Renaissance') or 'search' parameter to automatically filter the paintings shown on screen.",
          inputSchema: {
            type: "object",
            properties: {
              open: {
                type: "boolean",
                description: "True to open the Salon Wall modal, false to close it."
              },
              period: {
                type: "string",
                description: "Art historical period to filter by. Always specify this when the user asks about a period or movement: 'Dutch Golden Age', 'Post-Impressionism', 'High Renaissance', 'Early Renaissance', 'Vienna Secession / Art Nouveau', or 'all'.",
                enum: [
                  "all",
                  "Post-Impressionism",
                  "High Renaissance",
                  "Dutch Golden Age",
                  "Early Renaissance",
                  "Vienna Secession / Art Nouveau"
                ]
              },
              search: {
                type: "string",
                description: "Search keyword to filter by artist name or painting title (e.g. 'Vermeer', 'Mona Lisa')."
              }
            },
            required: ["open"]
          },
          execute: async (
            { open, period, search }: any,
            { signal }: { signal?: AbortSignal } = {}
          ) => {
            if (signal?.aborted) return "Salon toggle cancelled.";

            const isOpen = typeof open === 'boolean' ? open : true;
            let normalizedPeriod = period;
            if (typeof period === 'string' && period !== 'all') {
              const lp = period.toLowerCase();
              const matched = MASTERPIECES.map(m => m.period).find(p =>
                p.toLowerCase().includes(lp) || lp.includes(p.toLowerCase())
              );
              if (matched) normalizedPeriod = matched;
            }

            if (onToggleSalonRef.current) {
              onToggleSalonRef.current(isOpen, normalizedPeriod, search);
              if (!isOpen) return "Masterpiece Salon Wall gallery closed.";
              const filterDetails = [
                normalizedPeriod && normalizedPeriod !== 'all' ? `period: "${normalizedPeriod}"` : null,
                search ? `query: "${search}"` : null
              ].filter(Boolean).join(', ');
              return `Masterpiece Salon Wall opened${filterDetails ? ` (filtered by ${filterDetails})` : ''}.`;
            }
            return "Salon controller unavailable.";
          },
          annotations: {
            readOnlyHint: true,
          }
        },
        { signal: controller.signal }
      )?.catch?.((err: any) => {
        if (err?.name !== 'AbortError') console.error(err);
      });

      // Tool 12: docent_speak
      // Enables the browser AI agent to project its natural language reasoning directly into the Virtual Docent dialogue panel on the gallery screen.
      document.modelContext.registerTool(
        {
          name: "docent_speak",
          title: "Project Curatorial Message to Virtual Docent",
          description: "Displays curatorial narration, educational insights, or answers directly in the Virtual Docent dialogue window on the gallery screen, and reads it aloud if voice narration is enabled.",
          inputSchema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                description: "The curatorial explanation, commentary, or response to display to the visitor on screen."
              }
            },
            required: ["message"]
          },
          execute: async (
            { message }: any,
            { signal }: { signal?: AbortSignal } = {}
          ) => {
            if (signal?.aborted) return "Narration cancelled.";
            const cleanMsg = typeof message === 'string' ? message.trim() : '';
            if (!cleanMsg) return "No message content provided to display.";

            if (onDocentSpeakRef.current) {
              onDocentSpeakRef.current(cleanMsg);
              return `Curatorial commentary successfully projected to the Virtual Docent dialogue window on screen.`;
            }
            return "Virtual Docent controller unavailable.";
          },
          annotations: {
            readOnlyHint: true,
          }
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
      setLiveTools([]);
    };
  }, [onViewportChange, onSelectArtwork]);

  return (
    <div className="relative group select-none">
      {/* Button Styled in Exact Unity with Other Header Buttons */}
      <button
        type="button"
        id="btn-webmcp-status"
        className="flex items-center gap-1.5 p-2 md:px-3 md:py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-750 hover:border-stone-700 text-stone-300 hover:text-amber-200 text-xs font-medium transition-colors cursor-pointer"
      >
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            isSupported && isRegistered
              ? 'bg-emerald-400 animate-pulse'
              : 'bg-amber-400'
          }`}
        />
        {/* Desktop View */}
        <span className="hidden sm:inline font-medium">
          {isSupported && isRegistered
            ? `WebMCP: ${liveTools.length} Tools Active`
            : 'WebMCP: Offline'}
        </span>
        {/* Mobile View */}
        <span className="sm:hidden font-medium">
          WebMCP{isSupported && isRegistered ? ` (${liveTools.length})` : ''}
        </span>
      </button>

      {/* Rich Tooltip on Hover / Touch */}
      <div className="absolute right-0 top-full pt-1 hidden group-hover:block z-50 pointer-events-auto transition-all duration-200">
        <div className="w-80 max-w-[90vw] bg-stone-950/95 border border-amber-500/30 backdrop-blur-xl rounded-2xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.8)] text-stone-200 space-y-3 font-sans">
          {/* Tooltip Header */}
          <div className="flex items-center justify-between border-b border-stone-800/80 pb-2">
            <h4 className="text-xs font-display font-bold text-amber-300 uppercase tracking-wider">
              WebMCP Tool Catalog
            </h4>
            <span
              className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                isSupported && isRegistered
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}
            >
              {isSupported && isRegistered ? `${liveTools.length} Connected` : 'Flag Required'}
            </span>
          </div>

          {/* If connected — show live tools from browser */}
          {isSupported && isRegistered && liveTools.length > 0 ? (
            <>
              <div className="space-y-1.5 text-xs max-h-72 overflow-y-auto pr-1">
                {liveTools.map((tool, idx) => (
                  <div key={tool.name} className="flex items-start gap-2">
                    <span className="text-amber-400/80 font-mono text-[10px] pt-0.5 shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <strong className="text-stone-100 font-mono text-[11px] block truncate">
                        {tool.name}
                      </strong>
                      <p className="text-[10px] text-stone-400 line-clamp-1">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic Footer */}
              <div className="pt-2 border-t border-stone-800/80 text-[11px] flex items-center justify-between">
                <div className="text-emerald-400 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Connected to WebMCP</span>
                </div>
                <a
                  href="https://chromewebstore.google.com/detail/model-context-tool-inspec/gbpdfapgefenggkahomfgkhfehlcenpd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-amber-400 hover:text-amber-300 underline font-mono flex items-center gap-0.5"
                >
                  Tool Inspector ↗
                </a>
              </div>
            </>
          ) : (
            /* If flag is disabled — show clear instructions */
            <div className="space-y-2">
              <p className="text-xs text-stone-400 leading-relaxed">
                Browser Model Context API is not enabled in this session.
              </p>
              <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-2.5 text-amber-200/95 font-sans text-[11px] leading-relaxed space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                  <span>💡</span>
                  <span>Enable WebMCP in Chrome:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-stone-300">
                  <li>
                    <span>Enable flag: </span>
                    <code className="bg-stone-900 border border-stone-750 px-1 py-0.5 rounded text-[10px] text-amber-300 font-mono select-all">
                      chrome://flags/#enable-webmcp-testing
                    </code>
                  </li>
                  <li>
                    <a
                      href="https://chromewebstore.google.com/detail/model-context-tool-inspec/gbpdfapgefenggkahomfgkhfehlcenpd"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-300 hover:text-amber-200 underline font-medium"
                    >
                      Install Model Context Tool Inspector
                    </a>
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
