import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  X,
  Compass,
  Sparkles,
} from 'lucide-react';
import type { GuidedTour } from '../types';

interface TourPlayerProps {
  tour: GuidedTour;
  currentStopIndex: number;
  onNextStop: () => void;
  onPrevStop: () => void;
  onEndTour: () => void;
}

export const TourPlayer: React.FC<TourPlayerProps> = ({
  tour,
  currentStopIndex,
  onNextStop,
  onPrevStop,
  onEndTour,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const currentStop = tour.stops[currentStopIndex] || tour.stops[0];

  // Auto-advance timer when playing
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(() => {
      if (currentStopIndex < tour.stops.length - 1) {
        onNextStop();
      } else {
        setIsPlaying(false);
      }
    }, 12000); // 12 seconds per stop

    return () => clearTimeout(timer);
  }, [isPlaying, currentStopIndex, tour.stops.length, onNextStop]);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-2xl bg-stone-950/95 border border-amber-500/50 backdrop-blur-xl rounded-2xl p-4 shadow-[0_0_40px_rgba(0,0,0,0.85)] text-stone-100 select-none">
      {/* Top Header & Progress */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="p-1 bg-amber-500/20 text-amber-400 rounded-md">
            <Compass className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-xs font-display font-bold text-amber-200">
              {tour.title}
            </h4>
            <span className="text-[10px] text-stone-400 font-mono">
              Stop {currentStopIndex + 1} of {tour.stops.length}
            </span>
          </div>
        </div>

        <button
          onClick={onEndTour}
          title="Exit Tour"
          className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bars */}
      <div className="flex gap-1.5 mb-3">
        {tour.stops.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full flex-1 transition-all ${
              idx < currentStopIndex
                ? 'bg-amber-500'
                : idx === currentStopIndex
                ? 'bg-amber-300 animate-pulse'
                : 'bg-stone-800'
            }`}
          />
        ))}
      </div>

      {/* Narrative Card */}
      <div className="mb-3 bg-stone-900/80 rounded-xl p-3 border border-stone-800">
        <p className="text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          {currentStop.title}
        </p>
        <p className="text-xs font-serif-body text-stone-300 leading-relaxed">
          {currentStop.narrative}
        </p>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-stone-500">
          Target: {currentStop.x}% X, {currentStop.y}% Y • {currentStop.zoom}x
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrevStop}
            disabled={currentStopIndex === 0}
            className="p-2 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-40 disabled:hover:bg-stone-900 text-stone-300 transition-colors"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Auto-play</span>
              </>
            )}
          </button>

          <button
            onClick={onNextStop}
            disabled={currentStopIndex === tour.stops.length - 1}
            className="p-2 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-40 disabled:hover:bg-stone-900 text-stone-300 transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
