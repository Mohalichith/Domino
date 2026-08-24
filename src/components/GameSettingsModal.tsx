import React from 'react';
import { GameSettings, GameMode, AIDifficulty, TableTheme, TileSkin } from '../types/domino';
import { X, Check, Volume2, Sparkles } from 'lucide-react';

interface GameSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onSaveSettings: (newSettings: GameSettings) => void;
  onStartNewGame: (newSettings: GameSettings) => void;
}

export const GameSettingsModal: React.FC<GameSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onStartNewGame,
}) => {
  const [localSettings, setLocalSettings] = React.useState<GameSettings>(settings);

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const modes: { id: GameMode; title: string; desc: string }[] = [
    { id: 'draw', title: 'سحب كلاسيكي (Draw)', desc: 'تسحب من المخزن عندما لا تملك قطعة مطابقة' },
    { id: 'block', title: 'حظر وإغلاق (Block)', desc: 'بدون سحب، تمرر دورك مباشرة إذا تعذر اللعب' },
    { id: 'all_fives', title: 'مضاعفات الخمسة (All-Fives)', desc: 'تسجيل نقاط فورية إذا كان مجموع الأطراف من مضاعفات 5' },
  ];

  const difficulties: { id: AIDifficulty; title: string; color: string }[] = [
    { id: 'easy', title: 'سهل (مبتدئ)', color: 'text-emerald-400' },
    { id: 'medium', title: 'متوسط (تكتيكي)', color: 'text-amber-400' },
    { id: 'hard', title: 'محترف (ذكي جداً)', color: 'text-rose-400' },
  ];

  const themes: { id: TableTheme; title: string; gradient: string }[] = [
    { id: 'green_felt', title: 'جوخ أخضر كازينو', gradient: 'bg-gradient-to-br from-[#1f7347] via-[#104a2d] to-[#082918]' },
    { id: 'walnut_wood', title: 'خشب جوز ملكي', gradient: 'bg-gradient-to-br from-[#54301d] via-[#351c0f] to-[#1a0c06]' },
    { id: 'midnight_blue', title: 'أزرق ملكي مخملي', gradient: 'bg-gradient-to-br from-[#1e3466] via-[#101f42] to-[#070e22]' },
    { id: 'ruby_red', title: 'أحمر قرمزي إمبراطوري', gradient: 'bg-gradient-to-br from-[#73192a] via-[#4d0c19] to-[#24040a]' },
  ];

  const skins: { id: TileSkin; title: string; desc: string; previewClass: string; dotClass: string }[] = [
    {
      id: 'classic_ivory',
      title: 'عاجي كلاسيكي',
      desc: 'عاج فاخر بنقاط محفورة ومسمار نحاسي',
      previewClass: 'tile-ivory-material text-stone-900 border-[#d8cdb8]',
      dotClass: 'pip-recessed-dark',
    },
    {
      id: 'midnight_black',
      title: 'عقيق أسود',
      desc: 'حجر أسود فاخر بنقاط ذهبية براقة',
      previewClass: 'tile-black-material text-amber-100 border-[#4b4e5c]',
      dotClass: 'pip-recessed-gold',
    },
    {
      id: 'pure_marble',
      title: 'رخام كرارا',
      desc: 'رخام ناصع بنقاط كحلية عميقة',
      previewClass: 'tile-marble-material text-slate-900 border-[#94a3b8]',
      dotClass: 'pip-recessed-marble',
    },
  ];

  const handleApplyAndNewGame = () => {
    onStartNewGame(localSettings);
    onClose();
  };

  const handleSaveOnly = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  return (
    <div
      id="modal-settings-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fade-in"
    >
      <div
        id="modal-settings-card"
        className="w-full max-w-lg bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden text-stone-100 my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-2 font-black text-lg text-amber-300">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>إعدادات اللعبة وأنماط الدومينو</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Game Mode */}
          <div>
            <label className="block text-sm font-bold text-stone-200 mb-2">نمط اللعبة وقواعدها</label>
            <div className="grid grid-cols-1 gap-2">
              {modes.map(m => (
                <button
                  key={m.id}
                  onClick={() => setLocalSettings(prev => ({ ...prev, mode: m.id }))}
                  className={`
                    flex flex-col text-right p-3 rounded-xl border transition-all text-sm
                    ${localSettings.mode === m.id
                      ? 'bg-amber-500/20 border-amber-400 text-amber-100 ring-2 ring-amber-400/30'
                      : 'bg-stone-800/60 border-stone-700 hover:bg-stone-800 text-stone-300'
                    }
                  `}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{m.title}</span>
                    {localSettings.mode === m.id && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <span className="text-xs text-stone-400 mt-0.5">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Player Configuration */}
          <div>
            <label className="block text-sm font-bold text-stone-200 mb-2">نوع المنافسين</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLocalSettings(prev => ({ ...prev, isPassAndPlay: false, playerCount: 2 }))}
                className={`p-3 rounded-xl border text-sm font-bold text-center transition-all ${
                  !localSettings.isPassAndPlay && localSettings.playerCount === 2
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400/30'
                    : 'bg-stone-800/60 border-stone-700 text-stone-300'
                }`}
              >
                1 ضد 1 (ضد الكمبيوتر)
              </button>

              <button
                onClick={() => setLocalSettings(prev => ({ ...prev, isPassAndPlay: false, playerCount: 4 }))}
                className={`p-3 rounded-xl border text-sm font-bold text-center transition-all ${
                  !localSettings.isPassAndPlay && localSettings.playerCount === 4
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400/30'
                    : 'bg-stone-800/60 border-stone-700 text-stone-300'
                }`}
              >
                4 لاعبين (طاولة كاملة)
              </button>

              <button
                onClick={() => setLocalSettings(prev => ({ ...prev, isPassAndPlay: true, playerCount: 2 }))}
                className={`col-span-2 p-3 rounded-xl border text-sm font-bold text-center transition-all ${
                  localSettings.isPassAndPlay
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400/30'
                    : 'bg-stone-800/60 border-stone-700 text-stone-300'
                }`}
              >
                👥 لاعب ضد لاعب محلي (مرّر والعب Pass & Play)
              </button>
            </div>
          </div>

          {/* AI Difficulty */}
          {!localSettings.isPassAndPlay && (
            <div>
              <label className="block text-sm font-bold text-stone-200 mb-2">مستوى ذكاء الكمبيوتر</label>
              <div className="grid grid-cols-3 gap-2">
                {difficulties.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setLocalSettings(prev => ({ ...prev, aiDifficulty: d.id }))}
                    className={`p-2.5 rounded-xl border text-xs sm:text-sm font-bold text-center transition-all ${
                      localSettings.aiDifficulty === d.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400/30'
                        : 'bg-stone-800/60 border-stone-700 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span className={d.color}>{d.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Target Score */}
          <div>
            <label className="block text-sm font-bold text-stone-200 mb-2">نقاط الفوز بالمباراة</label>
            <div className="grid grid-cols-4 gap-2">
              {[50, 100, 150, 200].map(score => (
                <button
                  key={score}
                  onClick={() => setLocalSettings(prev => ({ ...prev, targetScore: score }))}
                  className={`p-2.5 rounded-xl border text-sm font-black text-center transition-all ${
                    localSettings.targetScore === score
                      ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md font-mono'
                      : 'bg-stone-800/60 border-stone-700 text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>

          {/* Table Theme */}
          <div>
            <label className="block text-sm font-bold text-stone-200 mb-2">مظهر طاولة اللعب (طاولات نوادي وبطولات)</label>
            <div className="grid grid-cols-2 gap-2.5">
              {themes.map(t => (
                <button
                  key={t.id}
                  onClick={() => setLocalSettings(prev => ({ ...prev, tableTheme: t.id }))}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs sm:text-sm font-bold transition-all text-right ${
                    localSettings.tableTheme === t.id
                      ? 'border-amber-400 ring-2 ring-amber-400/40 bg-stone-800 text-amber-200 shadow-md'
                      : 'border-stone-700 bg-stone-800/60 hover:bg-stone-800 text-stone-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg ${t.gradient} border-2 border-amber-900 shadow-md flex items-center justify-center shrink-0`}>
                    <div className="w-2 h-2 rounded-full bg-amber-400/40" />
                  </div>
                  <div className="flex flex-col">
                    <span>{t.title}</span>
                    <span className="text-[10px] text-stone-400 font-normal">إضاءة واقعية ملمس فاخر</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Domino Tile Skins */}
          <div>
            <label className="block text-sm font-bold text-stone-200 mb-2">تصميم وجودة قطع الدومينو</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {skins.map(s => (
                <button
                  key={s.id}
                  onClick={() => setLocalSettings(prev => ({ ...prev, tileSkin: s.id }))}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-center transition-all ${
                    localSettings.tileSkin === s.id
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400/40 shadow-lg'
                      : 'bg-stone-800/60 border-stone-700 hover:bg-stone-800 text-stone-300'
                  }`}
                >
                  {/* Realistic Mini Tile Graphic */}
                  <div className={`w-8 h-14 rounded-md border flex flex-col justify-between p-1 relative shadow-md ${s.previewClass}`}>
                    <div className="flex justify-center"><div className={`w-1.5 h-1.5 rounded-full ${s.dotClass}`} /></div>
                    <div className="w-full h-[1px] bg-stone-500/50 my-0.5 flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full tile-spinner-rivet" />
                    </div>
                    <div className="flex justify-between px-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${s.dotClass}`} />
                      <div className={`w-1.5 h-1.5 rounded-full ${s.dotClass}`} />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold">{s.title}</div>
                    <div className="text-[10px] text-stone-400 mt-0.5">{s.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Audio & Hints */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-800/60 border border-stone-700">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-bold">المؤثرات الصوتية</span>
            </div>
            <input
              type="checkbox"
              checked={localSettings.soundEnabled}
              onChange={e => setLocalSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
              className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-stone-800 bg-stone-950/60">
          <button
            onClick={handleSaveOnly}
            className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-sm transition-colors"
          >
            حفظ المظهر فقط
          </button>
          <button
            onClick={handleApplyAndNewGame}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-sm shadow-lg transition-all active:scale-95"
          >
            بدء مباراة جديدة بالإعدادات
          </button>
        </div>
      </div>
    </div>
  );
};
