import React from 'react';
import { X, BookOpen, Layers, Target, ShieldCheck, Zap } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="modal-rules-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fade-in select-none"
    >
      <div
        id="modal-rules-card"
        className="w-full max-w-2xl bg-stone-900 border border-stone-700 rounded-3xl shadow-2xl overflow-hidden text-stone-100 my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-2 font-black text-lg text-amber-300">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span>دليل وقواعد لعبة الدومينو الكلاسيكية</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto text-sm leading-relaxed text-stone-200">
          {/* Section 1: Intro */}
          <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700">
            <div className="flex items-center gap-2 text-amber-400 font-bold mb-1.5">
              <Layers className="w-4 h-4" />
              <h4>قطع الدومينو وتوزيعها</h4>
            </div>
            <p className="text-xs text-stone-300">
              تتكون لعبة الدومينو الكلاسيكية من <strong>28 قطعة</strong> (طقم الدبل-6) تمتد أرقامها من <strong>[0-0]</strong> (البلاطة البيضاء) حتى <strong>[6-6]</strong> (الدوش الكبير). يحصل كل لاعب على <strong>7 قطع</strong> في بداية المباراة عند اللعب بين اثنين، وتوضع القطع المتبقية في المخزن (البونيارد).
            </p>
          </div>

          {/* Section 2: How to Play */}
          <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700">
            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1.5">
              <Target className="w-4 h-4" />
              <h4>طريقة اللعب والمطابقة</h4>
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs text-stone-300">
              <li><strong>البداية:</strong> يبدأ الجولة الأولى صاحب أعلى قطعة مضاعفة (مثل <strong>[6-6]</strong> ثم [5-5] وهكذا).</li>
              <li><strong>المطابقة:</strong> يتناوب اللاعبون على وضع قطعة يتطابق أحد نصفيها مع الرقم الموجود على أحد طرفي السلسلة المفتوحة على الطاولة.</li>
              <li><strong>القطع المزدوجة (الدبل):</strong> توضع بشكل عمودي مميز لإضفاء لمسة كلاسيكية.</li>
            </ul>
          </div>

          {/* Section 3: Modes */}
          <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700">
            <div className="flex items-center gap-2 text-cyan-400 font-bold mb-2">
              <Zap className="w-4 h-4" />
              <h4>أنماط اللعبة في التطبيق</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-700">
                <strong className="text-amber-300 block mb-1">1. السحب (Draw):</strong>
                <span>إذا لم تجد قطعة مطابقة، تسحب من المخزن حتى تجد حركة مناسبة أو ينفد المخزن.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-700">
                <strong className="text-amber-300 block mb-1">2. الحظر (Block):</strong>
                <span>لا يوجد سحب من المخزن؛ إذا لم تملك قطعة مطابقة يتم تمرير دورك (باص) مباشرة.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-700">
                <strong className="text-amber-300 block mb-1">3. مضاعفات الـ5 (All Fives):</strong>
                <span>تكسب نقاطاً فورية في الجولة كلما كان مجموع الأطراف المفتوحة من مضاعفات الـ5 (5, 10, 15, 20...).</span>
              </div>
            </div>
          </div>

          {/* Section 4: Scoring & Winning */}
          <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700">
            <div className="flex items-center gap-2 text-rose-400 font-bold mb-1.5">
              <ShieldCheck className="w-4 h-4" />
              <h4>الفوز واحتساب النقاط</h4>
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs text-stone-300">
              <li><strong>فوز بالدومينو:</strong> عندما يتخلص لاعب من جميع قطعه، يحصل فوراً على مجموع نقاط كل القطع المتبقية في أيدي منافسيه!</li>
              <li><strong>الإغلاق (القفل):</strong> إذا عجز جميع اللاعبين عن اللعب، يفوز اللاعب الذي يملك أقل مجموع نقاط في يده، ويحصل على الفارق.</li>
              <li><strong>الفوز بالمباراة:</strong> أول لاعب يصل إلى الهدف المحدد (مثل 100 نقطة) يتوج بطلاً للمباراة!</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm transition-all"
          >
            فهمت، لنبدأ اللعب!
          </button>
        </div>
      </div>
    </div>
  );
};
