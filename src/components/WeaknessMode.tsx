import React from 'react';
import { AlertCircle, HelpCircle, BookOpen, Check, Trash2, Zap, ArrowLeft } from 'lucide-react';
import { Muscle, CourseId } from '../types/muscle';
import { MuscleCard } from './MuscleCard';

interface WeaknessModeProps {
  muscles: Muscle[];
  currentCourse: CourseId;
  onGoToPortal: () => void;
  weaknessIds: Set<string>;
  masteredIds: Set<string>;
  bookmarkedIds: Set<string>;
  onToggleMaster: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onOpenImageModal: (muscle: Muscle) => void;
  onStartWeaknessQuiz: () => void;
  onClearAllWeakness: () => void;
}

export const WeaknessMode: React.FC<WeaknessModeProps> = ({
  muscles,
  currentCourse,
  onGoToPortal,
  weaknessIds,
  masteredIds,
  bookmarkedIds,
  onToggleMaster,
  onToggleBookmark,
  onOpenImageModal,
  onStartWeaknessQuiz,
  onClearAllWeakness
}) => {
  const weakMuscles = muscles.filter(m => weaknessIds.has(m.id) || bookmarkedIds.has(m.id));

  const courseTitle = currentCourse === 'upper' 
    ? '上肢編' 
    : currentCourse === 'lower' 
    ? '下肢編' 
    : currentCourse === 'trunk_neck' 
    ? '頭頸部・体幹編' 
    : '全分野';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-rose-200/80 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={onGoToPortal}
                className="text-xs text-slate-500 hover:text-teal-700 font-semibold"
              >
                ← 分野選択に戻る
              </button>
              <span className="text-slate-300">/</span>
              <span className="p-1 rounded bg-rose-100 text-rose-700">
                <AlertCircle className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-bold text-rose-800">
                {courseTitle} 弱点特訓（間違えた問題・要復習マーク）
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {courseTitle} 苦手筋肉の集中反復トレーニング
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              クイズで不正解だった筋肉や、自分で「★要復習」を付けた筋肉が集約されています。
              反復学習と弱点専用クイズで、確実に合格レベルの定着を目指しましょう。
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {weakMuscles.length > 0 && (
              <>
                <button
                  onClick={onStartWeaknessQuiz}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-lg shadow-xs transition-colors flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>弱点筋肉でクイズ開始 ({weakMuscles.length}筋)</span>
                </button>

                <button
                  onClick={onClearAllWeakness}
                  className="px-3 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                  title="弱点リストをすべてクリア"
                >
                  クリア
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* List of Weak Muscles */}
      {weakMuscles.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <Check className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            現在、弱点・要復習の筋肉はありません！
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            素晴らしい成果です！「暗記クイズ」に挑戦して理解度を試すか、「筋肉図鑑」で新しい筋肉を学習しましょう。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {weakMuscles.map(muscle => (
            <MuscleCard
              key={muscle.id}
              muscle={muscle}
              isMastered={masteredIds.has(muscle.id)}
              isBookmarked={bookmarkedIds.has(muscle.id)}
              onToggleMaster={onToggleMaster}
              onToggleBookmark={onToggleBookmark}
              onOpenImageModal={onOpenImageModal}
              maskOriginInsertion={false}
              maskNerve={false}
              maskAction={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};
