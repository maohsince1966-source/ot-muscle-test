import React from 'react';
import { 
  Hand, 
  Footprints, 
  Activity, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  Bookmark, 
  HelpCircle,
  BookOpen,
  Award,
  Sparkles
} from 'lucide-react';
import { CourseId, Muscle } from '../types/muscle';
import { COURSES } from '../data/initialMuscles';

interface CourseEntranceProps {
  muscles: Muscle[];
  masteredIds: Set<string>;
  bookmarkedIds: Set<string>;
  weaknessIds: Set<string>;
  onSelectCourse: (courseId: CourseId, initialTab?: 'study' | 'quiz') => void;
}

export const CourseEntrance: React.FC<CourseEntranceProps> = ({
  muscles,
  masteredIds,
  bookmarkedIds,
  weaknessIds,
  onSelectCourse
}) => {
  const getCourseMuscles = (courseId: 'upper' | 'lower' | 'trunk_neck') => {
    return muscles.filter(m => m.course === courseId);
  };

  const getCourseStats = (courseId: 'upper' | 'lower' | 'trunk_neck') => {
    const courseMuscles = getCourseMuscles(courseId);
    const masteredInCourse = courseMuscles.filter(m => masteredIds.has(m.id)).length;
    const weakInCourse = courseMuscles.filter(m => weaknessIds.has(m.id) || bookmarkedIds.has(m.id)).length;
    const percent = Math.round((masteredInCourse / Math.max(courseMuscles.length, 1)) * 100);
    return {
      total: courseMuscles.length,
      mastered: masteredInCourse,
      weak: weakInCourse,
      percent
    };
  };

  const totalMastered = masteredIds.size;
  const totalPercent = Math.round((totalMastered / Math.max(muscles.length, 1)) * 100);

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      {/* Portal Hero */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-800 text-xs font-bold mb-3">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
            作業療法士(OT)・理学療法士(PT) 解剖学暗記システム
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            学習コース（分野）を選択
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
            「上肢編」「下肢編」「頭頸部・体幹編」の3分野から学習する領域を選択してください。
            各コース内で、筋肉図鑑、赤シート目隠し暗記、4択実戦クイズ、全筋対比一覧表を統一された操作で学習できます。
          </p>

          {/* Overall Quick Stats */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs sm:text-sm text-slate-600">
            <div>
              <span>全収録筋肉:</span>{' '}
              <strong className="text-slate-900 font-bold tabular-nums text-base">{muscles.length}</strong> 筋
            </div>
            <div className="h-4 w-px bg-slate-200"></div>
            <div>
              <span>習得済み:</span>{' '}
              <strong className="text-emerald-700 font-bold tabular-nums text-base">{totalMastered}</strong> 筋
              <span className="text-xs text-slate-400 ml-1">({totalPercent}%)</span>
            </div>
            <div className="h-4 w-px bg-slate-200"></div>
            <div>
              <span>要復習・弱点:</span>{' '}
              <strong className="text-rose-600 font-bold tabular-nums text-base">
                {weaknessIds.size + bookmarkedIds.size}
              </strong> 筋
            </div>
          </div>
        </div>
      </div>

      {/* 3 Main Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COURSES.map((course) => {
          const stats = getCourseStats(course.id as 'upper' | 'lower' | 'trunk_neck');
          const isSky = course.id === 'upper';
          const isEmerald = course.id === 'lower';
          const isIndigo = course.id === 'trunk_neck';

          const accentBg = isSky ? 'bg-sky-50 text-sky-800 border-sky-200' : isEmerald ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-indigo-50 text-indigo-800 border-indigo-200';
          const buttonBg = isSky ? 'bg-sky-700 hover:bg-sky-800 text-white' : isEmerald ? 'bg-emerald-700 hover:bg-emerald-800 text-white' : 'bg-indigo-700 hover:bg-indigo-800 text-white';
          const progressBg = isSky ? 'bg-sky-600' : isEmerald ? 'bg-emerald-600' : 'bg-indigo-600';

          return (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 group"
            >
              <div>
                {/* Course Badge & Icon */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${accentBg}`}>
                    {course.title}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 group-hover:scale-105 transition-transform">
                    {course.id === 'upper' && <Hand className="w-5 h-5 text-sky-600" />}
                    {course.id === 'lower' && <Footprints className="w-5 h-5 text-emerald-600" />}
                    {course.id === 'trunk_neck' && <Activity className="w-5 h-5 text-indigo-600" />}
                  </div>
                </div>

                {/* Course Title & Subtitle */}
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {course.title}
                </h2>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  {course.subtitle}
                </p>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {course.description}
                </p>

                {/* Progress bar */}
                <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
                    <span className="text-slate-600">習得進捗</span>
                    <span className="text-slate-900 font-bold tabular-nums">
                      {stats.mastered} / {stats.total} 筋 ({stats.percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${progressBg}`}
                      style={{ width: `${stats.percent}%` }}
                    ></div>
                  </div>
                  {stats.weak > 0 && (
                    <div className="text-[11px] text-rose-600 mt-2 font-medium flex items-center gap-1">
                      <span>★ 弱点・要復習: {stats.weak} 筋</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => onSelectCourse(course.id, 'study')}
                  className={`w-full py-2.5 px-4 font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-2 ${buttonBg}`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{course.title}の学習を始める</span>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </button>

                <button
                  onClick={() => onSelectCourse(course.id, 'quiz')}
                  className="w-full py-2 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>暗記クイズに挑戦</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comprehensive All-Course Option */}
      <div className="bg-linear-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>国家試験 総合実戦</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight">
            全分野総合モード（上肢・下肢・頭頸部体幹 全{muscles.length}筋）
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            分野の垣根を越えて、全身の筋肉からランダムに出題される総合模試や、全筋対比一覧表で横断的に学習できます。
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectCourse('all', 'quiz')}
            className="px-5 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            <span>総合模試を解く</span>
          </button>
          <button
            onClick={() => onSelectCourse('all', 'study')}
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors border border-white/20"
          >
            全筋図鑑を開く
          </button>
        </div>
      </div>
    </div>
  );
};
