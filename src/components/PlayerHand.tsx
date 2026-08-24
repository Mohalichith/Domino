import React from 'react';
import { Player, DominoTileData, TileSkin } from '../types/domino';
import { DominoTile } from './DominoTile';
import { ArrowUpDown, Crown, Bot, User, Sparkles } from 'lucide-react';
import { getHandPipSum } from '../utils/dominoLogic';

interface PlayerHandProps {
  player: Player;
  isCurrentTurn: boolean;
  isHuman: boolean;
  selectedTile: DominoTileData | null;
  playableTileIds: string[];
  tileSkin: TileSkin;
  onTileClick: (tile: DominoTileData) => void;
  onSortHand?: () => void;
  position?: 'bottom' | 'top' | 'left' | 'right';
  showFaceDown?: boolean;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  player,
  isCurrentTurn,
  isHuman,
  selectedTile,
  playableTileIds,
  tileSkin,
  onTileClick,
  onSortHand,
  position = 'bottom',
  showFaceDown = false,
}) => {
  const isBottom = position === 'bottom';
  const pipTotal = getHandPipSum(player.hand);

  // If opponent / AI (top / side layout)
  if (!isBottom) {
    return (
      <div
        id={`player-tray-${player.id}`}
        className={`
          flex items-center gap-3 px-4 py-2 rounded-2xl transition-all duration-300
          ${isCurrentTurn ? 'bg-amber-500/15 border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]' : 'bg-stone-900/80 border border-white/10'}
        `}
      >
        {/* Avatar & Info */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shadow-md ${player.isAI ? 'bg-indigo-600 text-indigo-100' : 'bg-emerald-600 text-emerald-100'}`}>
              {player.isAI ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            {isCurrentTurn && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 animate-ping" />
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-stone-100">{player.name}</span>
              {isCurrentTurn && (
                <span className="text-[10px] bg-amber-500 text-stone-950 font-black px-1.5 py-0.2 rounded-md animate-pulse">
                  دوره الآن
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <span>النقاط: <strong className="text-amber-400">{player.score}</strong></span>
              <span>&bull;</span>
              <span>القطع: <strong className="text-stone-200">{player.hand.length}</strong></span>
            </div>
          </div>
        </div>

        {/* Tiles Fan (Face Down or Small) */}
        <div className="flex items-center -space-x-4 space-x-reverse overflow-x-auto py-1 px-2 max-w-[200px] sm:max-w-[280px]">
          {player.hand.map((tile, idx) => (
            <div
              key={`opp-tile-${idx}-${tile.id}`}
              className="shrink-0 transition-transform duration-200 hover:-translate-y-1"
            >
              <DominoTile
                tile={tile}
                skin={tileSkin}
                isFaceDown={!showFaceDown}
                size="sm"
                orientation="vertical"
                disabled
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Active / Bottom Player Tray
  return (
    <div
      id={`player-tray-${player.id}`}
      className={`
        w-full max-w-4xl mx-auto rounded-2xl p-3 sm:p-4 transition-all duration-300
        ${isCurrentTurn
          ? 'bg-stone-900/90 border-2 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50'
          : 'bg-stone-900/80 border border-white/10 shadow-xl'
        }
      `}
    >
      {/* Player Header Bar */}
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-500 text-stone-950 flex items-center justify-center font-bold shadow-md">
              <User className="w-5 h-5" />
            </div>
            {isCurrentTurn && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-stone-900 ring-2 ring-emerald-500/50 animate-pulse" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-stone-100 text-sm sm:text-base">{player.name}</span>
              {isCurrentTurn ? (
                <span className="flex items-center gap-1 text-xs bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                  <Sparkles className="w-3 h-3" />
                  دورك الآن
                </span>
              ) : (
                <span className="text-xs text-stone-400 font-medium">في انتظار المنافس...</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-stone-400 mt-0.5">
              <span>إجمالي نقاطك: <strong className="text-amber-400 text-sm">{player.score}</strong></span>
              <span>&bull;</span>
              <span>مجموع نقاط يدك: <strong className="text-stone-200">{pipTotal}</strong></span>
              <span>&bull;</span>
              <span>القطع المتبقية: <strong className="text-stone-200">{player.hand.length}</strong></span>
            </div>
          </div>
        </div>

        {/* Hand Actions (Sort & Count) */}
        <div className="flex items-center gap-2">
          {onSortHand && (
            <button
              id="btn-sort-hand"
              onClick={onSortHand}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-300 hover:text-amber-300 text-xs font-semibold border border-white/10 transition-all shadow-sm"
              title="ترتيب القطع"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ترتيب</span>
            </button>
          )}
        </div>
      </div>

      {/* Tiles Tray Grid / Scroll Area */}
      <div className="relative min-h-[95px] flex items-center justify-start sm:justify-center overflow-x-auto py-2 px-1 gap-2.5 sm:gap-3.5 scrollbar-thin">
        {player.hand.length === 0 ? (
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm py-4">
            <Crown className="w-5 h-5 animate-bounce" />
            <span>لقد أنهيت جميع قطعك! دومينو!</span>
          </div>
        ) : (
          player.hand.map((tile) => {
            const isPlayable = isCurrentTurn && playableTileIds.includes(tile.id);
            const isSelected = selectedTile?.id === tile.id;

            return (
              <div
                key={`my-tile-${tile.id}`}
                className="shrink-0 transition-transform duration-200"
              >
                <DominoTile
                  tile={tile}
                  skin={tileSkin}
                  orientation="vertical"
                  size="md"
                  isPlayable={isPlayable}
                  isSelected={isSelected}
                  onClick={() => onTileClick(tile)}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
