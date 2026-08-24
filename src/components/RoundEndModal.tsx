import React, { useEffect } from 'react';
import { Player, RoundResult, TileSkin } from '../types/domino';
import { DominoTile } from './DominoTile';
import { Trophy, Award, Lock, ArrowLeft, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RoundEndModalProps {
  isOpen: boolean;
  roundResult: RoundResult | null;
  players: Player[];
  targetScore: number;
  isMatchFinished: boolean;
  matchWinner: Player | null;
  tileSkin: TileSkin;
  onNextRound: () => void;
  onNewMatch: () => void;
}

export const RoundEndModal: React.FC<RoundEndModalProps> = ({
  isOpen,
  roundResult,
  players,
  targetScore,
  isMatchFinished,
  matchWinner,
  tileSkin,
  onNextRound,
  onNewMatch,
}) => {
  useEffect(() => {
    if (isOpen) {
      if (isMatchFinished || roundResult?.reason === 'domino') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  }, [isOpen, isMatchFinished, roundResult]);

  if (!isOpen || !roundResult) return null;

  const isDominosWin = roundResult.reason === 'domino';

  return (
    <div
      id="modal-round-end-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in select-none"
    >
      <div
        id="modal-round-end-card"
        className="w-full max-w-xl bg-stone-900 border-2 border-amber-500/40 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.2)] overflow-hidden text-stone-100 my-8 animate-scale-up"
      >
        {/* Banner Header */}
        <div className={`p-6 text-center ${isMatchFinished ? 'bg-gradient-to-b from-amber-600/40 to-stone-900' : 'bg-gradient-to-b from-amber-500/20 to-stone-900'}`}>
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-stone-950 flex items-center justify-center shadow-lg ring-4 ring-amber-400/30">
            {isMatchFinished ? (
              <Trophy className="w-9 h-9 animate-bounce" />
            ) : isDominosWin ? (
              <Award className="w-9 h-9 animate-pulse" />
            ) : (
              <Lock className="w-9 h-9" />
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-amber-300">
            {isMatchFinished
              ? `🏆 مبروك للفائز ${matchWinner?.name}!`
              : isDominosWin
              ? `🎉 دومينو! فوز ${roundResult.winnerName}`
              : `🔒 اللعبة مغلقة (حظر)`}
          </h2>

          <p className="text-sm text-stone-300 mt-1 font-medium">
            {isMatchFinished
              ? `وصل إلى الهدف المحدد (${targetScore} نقطة) وتوج بطلاً للمباراة!`
              : isDominosWin
              ? `تخلص ${roundResult.winnerName} من جميع قطعه وحصد ${roundResult.pointsGained} نقطة!`
              : roundResult.winnerId
              ? `اللاعب ${roundResult.winnerName} يملك أقل مجموع نقاط متبقية وحصد ${roundResult.pointsGained} نقطة!`
              : `تعادل في مجموع النقاط المتبقية بين اللاعبين!`}
          </p>
        </div>

        {/* Players Hands Breakdown */}
        <div className="px-6 py-4 space-y-4 max-h-[50vh] overflow-y-auto">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            كشف القطع المتبقية والنقاط:
          </h3>

          <div className="space-y-3">
            {roundResult.remainingHands.map((hand) => {
              const isWinner = hand.playerId === roundResult.winnerId;
              const player = players.find(p => p.id === hand.playerId);

              return (
                <div
                  key={`reveal-${hand.playerId}`}
                  className={`p-3 rounded-2xl border transition-all ${
                    isWinner
                      ? 'bg-amber-500/15 border-amber-400/60 ring-1 ring-amber-400/30'
                      : 'bg-stone-800/60 border-stone-700/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-100">{hand.name}</span>
                      {isWinner && (
                        <span className="text-[10px] bg-amber-500 text-stone-950 font-black px-2 py-0.5 rounded-full">
                          فائز بالجولة (+{roundResult.pointsGained})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-stone-400">
                        مجموع القطع: <strong className="text-amber-300">{hand.pipSum}</strong>
                      </span>
                      <span className="text-stone-500">&bull;</span>
                      <span className="text-stone-300">
                        النتيجة الإجمالية: <strong className="text-amber-400 font-mono text-sm">{player?.score ?? 0}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Tile Visuals */}
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                    {hand.tiles.length === 0 ? (
                      <span className="text-xs text-emerald-400 font-bold">لا توجد قطع متبقية (0)</span>
                    ) : (
                      hand.tiles.map((t, idx) => (
                        <div key={`hand-reveal-${idx}-${t.id}`} className="shrink-0">
                          <DominoTile tile={t} skin={tileSkin} size="sm" orientation="vertical" disabled />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Target Score Progress Bars */}
          <div className="p-3 bg-stone-950/60 rounded-2xl border border-stone-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>التقدم نحو الهدف ({targetScore} نقطة)</span>
              <span>النقاط</span>
            </div>
            {players.map(p => {
              const pct = Math.min(100, (p.score / targetScore) * 100);
              return (
                <div key={`progress-${p.id}`} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-stone-300">{p.name}</span>
                    <span className="text-amber-400 font-mono">{p.score} / {targetScore}</span>
                  </div>
                  <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-stone-800 bg-stone-950/60">
          {isMatchFinished ? (
            <button
              id="btn-modal-new-match"
              onClick={onNewMatch}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-base shadow-xl transition-all active:scale-95"
            >
              <RotateCcw className="w-5 h-5" />
              <span>بدء مباراة جديدة</span>
            </button>
          ) : (
            <button
              id="btn-modal-next-round"
              onClick={onNextRound}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-base shadow-xl transition-all active:scale-95"
            >
              <span>الجولة التالية</span>
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
