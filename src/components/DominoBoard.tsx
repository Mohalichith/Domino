import React, { useRef, useState, useEffect } from 'react';
import { DominoTile } from './DominoTile';
import { VisualTileNode } from '../utils/boardLayout';
import { BoardEnd, TableSide, TileSkin, TableTheme, DominoTileData } from '../types/domino';
import { ZoomIn, ZoomOut, Maximize2, Sparkles } from 'lucide-react';

interface DominoBoardProps {
  tiles: VisualTileNode[];
  headEnd: BoardEnd | null;
  tailEnd: BoardEnd | null;
  selectedTile: DominoTileData | null;
  validSidesForSelected: TableSide[];
  onPlaceTile: (side: TableSide) => void;
  tileSkin: TileSkin;
  tableTheme: TableTheme;
  lastScoredPoints?: { points: number; timestamp: number } | null;
  isCurrentPlayerHuman: boolean;
}

export const DominoBoard: React.FC<DominoBoardProps> = ({
  tiles,
  headEnd,
  tailEnd,
  selectedTile,
  validSidesForSelected,
  onPlaceTile,
  tileSkin,
  tableTheme,
  lastScoredPoints,
  isCurrentPlayerHuman,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Auto-fit / center when tiles change
  useEffect(() => {
    if (tiles.length === 0) {
      setPan({ x: 0, y: 0 });
      setZoom(1);
      return;
    }

    // Determine scale based on board footprint
    let minX = 0, maxX = 0, minY = 0, maxY = 0;
    tiles.forEach(t => {
      minX = Math.min(minX, t.x - 50);
      maxX = Math.max(maxX, t.x + 50);
      minY = Math.min(minY, t.y - 50);
      maxY = Math.max(maxY, t.y + 50);
    });

    const boardWidth = maxX - minX + 120;
    const boardHeight = maxY - minY + 120;
    const containerWidth = containerRef.current ? containerRef.current.clientWidth : 800;
    const containerHeight = containerRef.current ? containerRef.current.clientHeight : 500;

    const fitZoom = Math.min(
      1.1,
      Math.max(0.65, Math.min(containerWidth / boardWidth, containerHeight / boardHeight))
    );

    // Center offset
    const centerX = -(minX + maxX) / 2;
    const centerY = -(minY + maxY) / 2;

    setZoom(fitZoom);
    setPan({ x: centerX * fitZoom, y: centerY * fitZoom });
  }, [tiles.length]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.board-interactive')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Table themes with ultra-rich colors, radial lighting, and surface texture
  const themeBackgrounds = {
    green_felt: 'bg-radial-[at_50%_45%] from-[#1f7347] via-[#104a2d] to-[#082918] table-felt-pattern',
    walnut_wood: 'bg-radial-[at_50%_45%] from-[#54301d] via-[#351c0f] to-[#1a0c06] table-wood-grain',
    midnight_blue: 'bg-radial-[at_50%_45%] from-[#1e3466] via-[#101f42] to-[#070e22] table-felt-pattern',
    ruby_red: 'bg-radial-[at_50%_45%] from-[#73192a] via-[#4d0c19] to-[#24040a] table-felt-pattern',
  };

  const themeBorderTextures = {
    green_felt: 'table-rim-wood border-[#381e0f] ring-2 ring-amber-500/30',
    walnut_wood: 'table-rim-wood border-[#291408] ring-2 ring-amber-600/40',
    midnight_blue: 'table-rim-wood border-[#1c2237] ring-2 ring-cyan-500/30',
    ruby_red: 'table-rim-wood border-[#3a0d15] ring-2 ring-amber-500/40',
  };

  return (
    <div
      ref={containerRef}
      id="domino-table-arena"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`
        relative w-full h-full min-h-[360px] md:min-h-[440px] rounded-3xl border-8
        ${themeBackgrounds[tableTheme]} ${themeBorderTextures[tableTheme]}
        overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing select-none
        transition-colors duration-500
      `}
    >
      {/* Brass Corner Ornaments on the table */}
      <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-amber-400/50 rounded-tl-lg pointer-events-none" />
      <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-amber-400/50 rounded-tr-lg pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-amber-400/50 rounded-bl-lg pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-amber-400/50 rounded-br-lg pointer-events-none" />

      {/* Subtle Central Table Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
        <div className="w-72 h-72 rounded-full border-4 border-white flex items-center justify-center">
          <div className="w-56 h-56 rounded-full border-2 border-dashed border-white" />
        </div>
      </div>

      {/* Floating Score Splash (All-Fives scoring) */}
      {lastScoredPoints && Date.now() - lastScoredPoints.timestamp < 2500 && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 animate-bounce pointer-events-none">
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 font-black px-5 py-2 rounded-full shadow-[0_10px_25px_rgba(245,158,11,0.6)] text-lg tracking-wider border-2 border-white">
            <Sparkles className="w-5 h-5 animate-spin" />
            <span>+{lastScoredPoints.points} نقطة مضاعفات 5!</span>
          </div>
        </div>
      )}

      {/* Center Table Board Transform Container */}
      <div
        className="absolute transition-transform duration-300 ease-out origin-center"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        {/* Empty Table Call to Action */}
        {tiles.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center text-amber-200/80">
            <div className="w-20 h-28 rounded-2xl border-2 border-dashed border-amber-400/50 flex items-center justify-center mb-3 bg-amber-400/10 shadow-inner">
              <span className="text-3xl font-bold">🁢</span>
            </div>
            <p className="text-sm font-bold drop-shadow-md">الطاولة جاهزة، ابدأ بوضع القطعة الأولى!</p>
          </div>
        )}

        {/* Placed Tiles */}
        {tiles.map((item) => (
          <div
            key={`placed-${item.sequence}-${item.tile.id}`}
            className="absolute transition-all duration-300 ease-out origin-center"
            style={{
              left: `${item.x}px`,
              top: `${item.y}px`,
              transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
              filter: 'drop-shadow(0 10px 12px rgba(0, 0, 0, 0.45)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35))',
            }}
          >
            <DominoTile
              tile={item.tile}
              skin={tileSkin}
              orientation={item.rotation % 180 === 0 ? 'horizontal' : 'vertical'}
              size="md"
              disabled
            />
          </div>
        ))}

        {/* Head End Placement Anchor */}
        {headEnd && isCurrentPlayerHuman && (
          <div
            className="absolute board-interactive z-30 transition-all duration-200"
            style={{
              left: `${headEnd.targetX}px`,
              top: `${headEnd.targetY}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {validSidesForSelected.includes('head') ? (
              <button
                id="btn-place-head"
                onClick={() => onPlaceTile('head')}
                className="group relative flex items-center justify-center"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white font-black text-xs flex flex-col items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.7)] border-2 border-white ring-4 ring-emerald-400/60 anchor-indicator cursor-pointer hover:scale-115 active:scale-95 transition-transform">
                  <span>ضع هنا</span>
                  <span className="text-[10px] bg-emerald-900/90 text-emerald-200 px-1.5 py-0.5 rounded-full mt-0.5 font-mono">طرف {headEnd.value}</span>
                </div>
              </button>
            ) : (
              <div className="w-8 h-8 rounded-full bg-black/60 border border-white/30 text-amber-200 font-bold text-xs flex items-center justify-center shadow-lg backdrop-blur-xs font-mono">
                {headEnd.value}
              </div>
            )}
          </div>
        )}

        {/* Tail End Placement Anchor */}
        {tailEnd && isCurrentPlayerHuman && (
          <div
            className="absolute board-interactive z-30 transition-all duration-200"
            style={{
              left: `${tailEnd.targetX}px`,
              top: `${tailEnd.targetY}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {validSidesForSelected.includes('tail') ? (
              <button
                id="btn-place-tail"
                onClick={() => onPlaceTile('tail')}
                className="group relative flex items-center justify-center"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white font-black text-xs flex flex-col items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.7)] border-2 border-white ring-4 ring-emerald-400/60 anchor-indicator cursor-pointer hover:scale-115 active:scale-95 transition-transform">
                  <span>ضع هنا</span>
                  <span className="text-[10px] bg-emerald-900/90 text-emerald-200 px-1.5 py-0.5 rounded-full mt-0.5 font-mono">طرف {tailEnd.value}</span>
                </div>
              </button>
            ) : (
              <div className="w-8 h-8 rounded-full bg-black/60 border border-white/30 text-amber-200 font-bold text-xs flex items-center justify-center shadow-lg backdrop-blur-xs font-mono">
                {tailEnd.value}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Board Controls (Zoom & Reset View) */}
      <div className="absolute bottom-3 left-3 z-30 flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1.5 rounded-xl border border-white/15 shadow-xl">
        <button
          id="btn-zoom-in"
          onClick={() => setZoom(prev => Math.min(prev + 0.15, 1.8))}
          title="تكبير"
          className="p-1.5 text-stone-200 hover:text-white hover:bg-white/15 rounded-lg transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          id="btn-zoom-out"
          onClick={() => setZoom(prev => Math.max(prev - 0.15, 0.5))}
          title="تصغير"
          className="p-1.5 text-stone-200 hover:text-white hover:bg-white/15 rounded-lg transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          id="btn-zoom-reset"
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          title="إعادة ضبط العرض"
          className="p-1.5 text-stone-200 hover:text-white hover:bg-white/15 rounded-lg transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Open Ends Status Bar (Mobile-friendly HUD) */}
      {(headEnd !== null || tailEnd !== null) && (
        <div className="absolute top-3 right-3 z-30 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/15 text-xs text-amber-200 shadow-xl">
          <span className="text-stone-300 font-medium">الأطراف المفتوحة:</span>
          <div className="flex items-center gap-1.5 font-bold text-amber-300 font-mono">
            {headEnd && <span className="bg-amber-500/25 px-2.5 py-0.5 rounded-md border border-amber-400/40">{headEnd.value}</span>}
            {headEnd && tailEnd && <span className="text-stone-400">&bull;</span>}
            {tailEnd && <span className="bg-amber-500/25 px-2.5 py-0.5 rounded-md border border-amber-400/40">{tailEnd.value}</span>}
          </div>
        </div>
      )}
    </div>
  );
};
