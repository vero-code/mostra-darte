export const GalleryHeader: React.FC = () => {
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
      </div>
    </header>
  );
};
