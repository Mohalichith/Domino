import React from 'react';
import { DominoTileData, TileSkin } from '../types/domino';
import { DominoTile } from './DominoTile';
import { Layers, ArrowRightLeft, Sparkles } from 'lucide-react';

interface BoneyardProps {
  boneyard: DominoTileData[];
  canDraw: boolean;
  mustDraw: boolean;
  canPass: boolean;
  onDraw: () => void;
  onPass: () => void;
  tileSkin: TileSkin;
  isHumanTurn: boolean;
  mode: string;
}

export const Boneyard: React.FC<BoneyardProps> = ({
  boneyard,
  canDraw,
  mustDraw,
  canPass,
  onDraw,
  onPass,
  tileSkin,
  isHumanTurn,
  mode,
}) => {
  return (
    <div
      id="domino-boneyard-panel"
      className="flex items-center gap-3 bg-stone-900/80 backdrop-blur-md px-3 sm:px-4 py-2.5 rounded-2xl border border-white/10 shadow-lg"
    >
      {/* Boneyard Pile Stack */}
      <div className="flex items-center gap-2">
        <div className="relative w-9 h-14 flex items-center justify-center">
          {boneyard.length > 0 ? (
            <>
              {/* Stacked look */}
              {boneyard.length > 2 && (
                <div className="absolute top-1 left-1 opacity-40">
                  <DominoTile isFaceDown skin={tileSkin} size="sm" orientation="vertical" disabled />
                </div>
              )}
              {boneyard.length > 1 && (
                <div className="absolute top-0.5 left-0.5 opacity-70">
                  <DominoTile isFaceDown skin={tileSkin} size="sm" orientation="vertical" disabled />
                </div>
              )}
              <div className="relative z-10">
                <DominoTile isFaceDown skin={tileSkin} size="sm" orientation="vertical" disabled />
              </div>
            </>
          ) : (
            <div className="w-8 h-14 rounded-lg border-2 border-dashed border-stone-600 flex items-center justify-center text-stone-600">
              <Layers className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-bold text-stone-200">
            {mode === 'block' ? 'المخزن (مغلق)' : 'المخزن (السحب)'}
          </span>
          <span className="text-xs text-amber-400 font-extrabold">
            {boneyard.length} {boneyard.length === 1 ? 'قطعة' : 'قطع'}
          </span>
        </div>
      </div>

      {/* Action Buttons (Draw / Pass) */}
      <div className="flex items-center gap-2 mr-auto">
        {isHumanTurn && canDraw && boneyard.length > 0 && (
          <button
            id="btn-draw-tile"
            onClick={onDraw}
            className={`
              flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all
              ${mustDraw
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 ring-4 ring-amber-400/40 animate-pulse scale-105 active:scale-95'
                : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30'
              }
            `}
          >
            <Sparkles className="w-4 h-4" />
            <span>اسحب قطعة</span>
          </button>
        )}

        {isHumanTurn && canPass && (
          <button
            id="btn-pass-turn"
            onClick={onPass}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm bg-rose-600/90 hover:bg-rose-500 active:scale-95 text-white ring-2 ring-rose-400/50 shadow-md transition-all animate-bounce"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>تمرير الدور (باص)</span>
          </button>
        )}
      </div>
    </div>
  );
};
