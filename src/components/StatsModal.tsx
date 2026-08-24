import React from 'react';
import { MatchStats } from '../types/domino';
import { X, Trophy, Award, Flame, Target, Star, RotateCcw } from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: MatchStats;
  onResetStats: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  onResetStats,
}) => {
  if (!isOpen) return null;

  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

  const achievements = [
    {
      id: 'first_win',
      title: 'البداية الذهبية',
      desc: 'حقق أول فوز لك في الدومينو',
      unlocked: stats.gamesWon >= 1,
      icon: <Star className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'block_master',
      title: 'حارس الإغلاق',
      desc: 'فز بجولة مغلقة (حظر)',
      unlocked: stats.blockedRoundsWon >= 1,
      icon: <Target className="w-5 h-5 text-emerald-400" />,
    },
    {
      id: 'fives_king',
      title: 'ملك مضاعفات الخمسة',
      desc: 'سجل 50 نقطة في نمط الـ 5',
      unlocked: stats.allFivesScoredTotal >= 50,
      icon: <Flame className="w-5 h-5 text-rose-400" />,
    },
    {
      id: 'grand_master',
      title: 'أسطورة الدومينو',
      desc: 'ضع أكثر من 50 قطعة دومينو',
      unlocked: stats.dominoesPlayed >= 50,
      icon: <Trophy className="w-5 h-5 text-yellow-400" />,
    },
  ];

  return (
    <div
      id="modal-stats-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fade-in select-none"
    >
      <div
        id="modal-stats-card"
        className="w-full max-w-lg bg-stone-900 border border-stone-700 rounded-3xl shadow-2xl overflow-hidden text-stone-100 my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-2 font-black text-lg text-amber-300">
            <Award className="w-5 h-5 text-amber-400" />
            <span>سجل الإحصائيات والإنجازات</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-stone-800/60 border border-stone-700 text-center">
              <span className="text-xs text-stone-400 block mb-1">المباريات الملعوبة</span>
              <span className="text-2xl font-black text-stone-100 font-mono">{stats.gamesPlayed}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-800/60 border border-stone-700 text-center">
              <span className="text-xs text-stone-400 block mb-1">المباريات الفائزة</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">{stats.gamesWon}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-800/60 border border-stone-700 text-center">
              <span className="text-xs text-stone-400 block mb-1">نسبة الفوز</span>
              <span className="text-2xl font-black text-amber-400 font-mono">{winRate}%</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-800/60 border border-stone-700 text-center">
              <span className="text-xs text-stone-400 block mb-1">مجموع النقاط</span>
              <span className="text-2xl font-black text-stone-100 font-mono">{stats.totalPoints}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-800/60 border border-stone-700 text-center">
              <span className="text-xs text-stone-400 block mb-1">أعلى جولة</span>
              <span className="text-2xl font-black text-amber-400 font-mono">{stats.highestRoundScore}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-800/60 border border-stone-700 text-center">
              <span className="text-xs text-stone-400 block mb-1">القطع الموضوعة</span>
              <span className="text-2xl font-black text-cyan-400 font-mono">{stats.dominoesPlayed}</span>
            </div>
          </div>

          {/* Achievements */}
          <div>
            <h4 className="text-sm font-bold text-stone-300 mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>الأوسمة والإنجازات</span>
            </h4>
            <div className="space-y-2.5">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                    ach.unlocked
                      ? 'bg-amber-500/10 border-amber-400/40 text-stone-100'
                      : 'bg-stone-800/30 border-stone-800 text-stone-500 opacity-60'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${ach.unlocked ? 'bg-stone-900 border-amber-400/50 shadow-md' : 'bg-stone-900 border-stone-800'}`}>
                    {ach.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-sm ${ach.unlocked ? 'text-amber-200' : 'text-stone-400'}`}>
                        {ach.title}
                      </span>
                      {ach.unlocked ? (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                          مكتمل 🏆
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-500 font-bold">
                          مقفل 🔒
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-stone-400 block mt-0.5">{ach.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-stone-800 bg-stone-950/60">
          <button
            onClick={onResetStats}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-stone-400 hover:text-rose-400 hover:bg-rose-950/30 text-xs font-bold transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>تصفير الإحصائيات</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-sm transition-all"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
