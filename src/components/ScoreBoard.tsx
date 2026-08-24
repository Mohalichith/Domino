import React from 'react';
import { Player, GameMode } from '../types/domino';
import { Trophy, HelpCircle, Settings, Volume2, VolumeX, Lightbulb, BarChart2, RotateCcw } from 'lucide-react';

interface ScoreBoardProps {
  players: Player[];
  currentTurnIndex: number;
  mode: GameMode;
  targetScore: number;
  roundNumber: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onOpenRules: () => void;
  onOpenStats: () => void;
  onGetHint: () => void;
  onRestartGame: () => void;
  canHint: boolean;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  players,
  currentTurnIndex,
  mode,
  targetScore,
  roundNumber,
  soundEnabled,
  onToggleSound,
  onOpenSettings,
  onOpenRules,
  onOpenStats,
  onGetHint,
  onRestartGame,
  canHint,
}) => {
  const modeLabels: Record<GameMode, string> = {
    draw: 'سحب كلاسيكي',
    block: 'حظر (بدون سحب)',
    all_fives: 'مضاعفات الخمسة (5s)',
  };

  return (
    <header
      id="domino-header-scoreboard"
      className="w-full bg-stone-900/90 backdrop-blur-md border-b border-white/10 px-3 sm:px-6 py-2.5 shadow-xl select-none"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Match Info */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-lg border border-amber-300/40 text-stone-950 font-black text-xl tracking-tight">
              🁢
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-amber-100 tracking-wide">دومينو الكلاسيكية</h1>
                <span className="text-[11px] bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold px-2 py-0.5 rounded-full">
                  {modeLabels[mode]}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <span>الجولة <strong className="text-stone-200">{roundNumber}</strong></span>
                <span>&bull;</span>
                <span>الهدف: <strong className="text-amber-400">{targetScore} نقطة</strong></span>
              </div>
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              id="btn-sound-mobile"
              onClick={onToggleSound}
              className="p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white"
              title={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
            </button>
            <button
              id="btn-settings-mobile"
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white"
              title="الإعدادات"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Players Match Score Ticker */}
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto max-w-full py-1">
          {players.map((p, idx) => {
            const isTurn = idx === currentTurnIndex;
            return (
              <div
                key={`scoreboard-${p.id}`}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-200 shrink-0
                  ${isTurn
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400/30 shadow-md'
                    : 'bg-stone-800/60 border-white/5 text-stone-300'
                  }
                `}
              >
                <div className="flex flex-col text-right">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold truncate max-w-[80px] sm:max-w-[110px]">{p.name}</span>
                    {p.score >= targetScore && <Trophy className="w-3 h-3 text-amber-400" />}
                  </div>
                  <span className="text-[11px] text-stone-400">
                    القطع: <strong className="text-stone-200">{p.hand.length}</strong>
                  </span>
                </div>
                <div className="bg-black/40 px-2.5 py-1 rounded-lg border border-white/10 flex items-center justify-center">
                  <span className="text-base sm:text-lg font-black text-amber-400 font-mono">{p.score}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Tool Buttons (Desktop) */}
        <div className="hidden md:flex items-center gap-2">
          {canHint && (
            <button
              id="btn-get-hint"
              onClick={onGetHint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shadow-sm active:scale-95"
              title="اقتراح أفضل حركة"
            >
              <Lightbulb className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>مساعدة</span>
            </button>
          )}

          <button
            id="btn-open-rules"
            onClick={onOpenRules}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-white/10 text-xs font-bold transition-all shadow-sm active:scale-95"
            title="شرح القواعد"
          >
            <HelpCircle className="w-4 h-4" />
            <span>القواعد</span>
          </button>

          <button
            id="btn-open-stats"
            onClick={onOpenStats}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-white/10 text-xs font-bold transition-all shadow-sm active:scale-95"
            title="الإحصائيات"
          >
            <BarChart2 className="w-4 h-4" />
            <span>الإحصائيات</span>
          </button>

          <button
            id="btn-toggle-sound"
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-white/10 transition-all active:scale-95"
            title={soundEnabled ? 'كتم المؤثرات الصوتية' : 'تشغيل المؤثرات الصوتية'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
          </button>

          <button
            id="btn-open-settings"
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-white/10 transition-all active:scale-95"
            title="الإعدادات وأنماط اللعب"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            id="btn-restart-game"
            onClick={onRestartGame}
            className="p-2 rounded-xl bg-stone-800 hover:bg-rose-900/50 text-stone-400 hover:text-rose-300 border border-white/10 transition-all active:scale-95"
            title="بدء لعبة جديدة"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
