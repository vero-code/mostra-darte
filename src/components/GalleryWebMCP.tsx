import React, { useEffect, useState } from 'react';
import type { ViewportState } from '../types';

interface GalleryWebMCPProps {
  onViewportChange: (newVp: Partial<ViewportState>) => void;
}

export const GalleryWebMCP: React.FC<GalleryWebMCPProps> = ({
  onViewportChange,
}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const supported = typeof document !== 'undefined' && Boolean((document as any).modelContext?.registerTool);
    setIsSupported(supported);

    if (!supported) return;

    const controller = new AbortController();

    // WebMCP tool registration
    try {
      (document as any).modelContext.registerTool(
        {
          name: "zoom_painting",
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
          execute: async ({ x, y, zoom, detail_name }: any) => {
            onViewportChange({
              x: Math.max(0, Math.min(100, Number(x))),
              y: Math.max(0, Math.min(100, Number(y))),
              zoom: Math.max(1, Math.min(8, Number(zoom))),
              activeLabel: detail_name || "Detail Inspection",
              isAutoAnimating: true,
            });
            return `Camera focused on "${detail_name || 'detail'}" at {x: ${x}%, y: ${y}%} at ${zoom}x zoom.`;
          },
        },
        { signal: controller.signal }
      )?.catch?.((err: any) => {
        if (err?.name !== 'AbortError') console.error("WebMCP registration error:", err);
      });

      setIsRegistered(true);
    } catch (err) {
      console.error("Failed to register WebMCP tool:", err);
    }

    return () => {
      controller.abort();
      setIsRegistered(false);
    };
  }, [onViewportChange]);

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border backdrop-blur-md transition-all duration-300 select-none bg-stone-900/90 border-stone-800 text-stone-300 shadow-md">
      <span className={`w-2 h-2 rounded-full ${isSupported && isRegistered ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
      <span>
        {isSupported && isRegistered
          ? 'WebMCP: zoom_painting Active'
          : isSupported
          ? 'WebMCP: Initializing...'
          : 'WebMCP: Ready (Waiting for Chrome Agent)'}
      </span>
    </div>
  );
};
