import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Eye, 
  EyeOff, 
  Bookmark, 
  CheckCircle, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Layers,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import { Muscle, MuscleCategory, CourseId } from '../types/muscle';
import { CATEGORIES, COURSES } from '../data/initialMuscles';
import { MuscleCard } from './MuscleCard';

interface StudyModeProps {
  muscles: Muscle[];
  currentCourse: CourseId;
  onGoToPortal: () => void;
  masteredIds: Set<string>;
  bookmarkedIds: Set<string>;
  onToggleMaster: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onOpenImageModal: (muscle: Muscle) => void;
  onStartQuizWithFilter: (category: MuscleCategory | 'all' | 'weakness') => void;
}

export const StudyMode: React.FC<StudyModeProps> = ({
  muscles,
  currentCourse,
  onGoToPortal,
  masteredIds,
  bookmarkedIds,
  onToggleMaster,
  onToggleBookmark,
  onOpenImageModal,
  onStartQuizWithFilter
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MuscleCategory | 'all' | 'bookmarked' | 'unmastered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewStyle, setViewStyle] = useState<'grid' | 'single'>('grid');
  const [singleIndex, setSingleIndex] = useState(0);

  // Red sheet global masks
  const [maskOI, setMaskOI] = useState(false);
  const [maskNerve, setMaskNerve] = useState(false);
  const [maskAction, setMaskAction] = useState(false);

  // Relevant categories for this course
  const courseCategories = useMemo(() => {
    if (currentCourse === 'all') return CATEGORIES;
    return CATEGORIES.filter(c => c.course === currentCourse);
  }, [currentCourse]);

  // Current course metadata
  const currentCourseInfo = useMemo(() => {
    return COURSES.find(c => c.id === currentCourse);
  }, [currentCourse]);

  // Filtered muscles
  const filteredMuscles = useMemo(() => {
    return muscles.filter(m => {
      // Category filter
      if (selectedCategory === 'bookmarked') {
        if (!bookmarkedIds.has(m.id)) return false;
      } else if (selectedCategory === 'unmastered') {
        if (masteredIds.has(m.id)) return false;
      } else if (selectedCategory !== 'all') {
        if (m.category !== selectedCategory) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inName = m.name.toLowerCase().includes(q);
        const inKana = (m.kana || '').toLowerCase().includes(q);
        const inEnglish = (m.english || '').toLowerCase().includes(q);
        const inOrigin = m.origin.toLowerCase().includes(q);
        const inInsertion = m.insertion.toLowerCase().includes(q);
        const inNerve = m.nerve.toLowerCase().includes(q);
        const inSegment = m.segmentLevel.toLowerCase().includes(q);
        const inAction = m.action.toLowerCase().includes(q);
        const inNotes = (m.notes || '').toLowerCase().includes(q);

        return inName || inKana || inEnglish || inOrigin || inInsertion || inNerve || inSegment || inAction || inNotes;
      }

      return true;
    });
  }, [muscles, selectedCategory, searchQuery, bookmarkedIds, masteredIds]);

  const masteredInCourse = muscles.filter(m => masteredIds.has(m.id)).length;
  const bookmarkedInCourse = muscles.filter(m => bookmarkedIds.has(m.id)).length;
  const progressPercent = Math.round((masteredInCourse / Math.max(muscles.length, 1)) * 100);

  // Single focus card handlers
  const handlePrev = () => {
    setSingleIndex((prev) => (prev > 0 ? prev - 1 : filteredMuscles.length - 1));
  };

  const handleNext = () => {
    setSingleIndex((prev) => (prev < filteredMuscles.length - 1 ? prev + 1 : 0));
  };

  const currentSingleMuscle = filteredMuscles[singleIndex] || filteredMuscles[0];

  const courseTitle = currentCourseInfo ? currentCourseInfo.title : '全分野総合';

  return (
    <div className="space-y-6">
      {/* Overview & Study Stats Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={onGoToPortal}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-teal-700 transition-colors"
                title="分野選択（入口）に戻る"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>分野選択</span>
              </button>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                {courseTitle}
              </span>
              <span className="text-xs text-slate-500">
                収録数: {muscles.length} 筋
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {courseTitle} 筋肉暗記図鑑＆学習モード
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              起始・停止、支配神経、髄節レベル、筋の作用を筋肉図と合わせて確認。暗記シート（目隠し）機能で試験前の暗記定着を促します。
            </p>
          </div>

          {/* Quick Quiz CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onStartQuizWithFilter(selectedCategory === 'bookmarked' || selectedCategory === 'unmastered' ? 'all' : selectedCategory)}
              className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              <span>{courseTitle}のクイズに挑戦</span>
            </button>
          </div>
        </div>

        {/* Mastery Progress Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span>
              {courseTitle} 習得状況: <strong className="text-slate-900 font-bold tabular-nums">{masteredInCourse}</strong> / {muscles.length} 筋
            </span>
            <span className="text-slate-300">|</span>
            <span>
              要復習マーク: <strong className="text-amber-700 font-bold tabular-nums">{bookmarkedInCourse}</strong> 筋
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-64">
            <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-teal-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700 tabular-nums w-10 text-right">
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Blind Mask Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => { setSelectedCategory('all'); setSingleIndex(0); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {courseTitle} 全筋 ({muscles.length})
          </button>

          {courseCategories.map((cat) => {
            const count = muscles.filter(m => m.category === cat.id).length;
            if (count === 0) return null;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setSingleIndex(0); }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'bg-teal-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.shortName} ({count})
              </button>
            );
          })}

          <button
            onClick={() => { setSelectedCategory('bookmarked'); setSingleIndex(0); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
              selectedCategory === 'bookmarked'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Bookmark className="w-3 h-3" />
            <span>要復習のみ ({bookmarkedInCourse})</span>
          </button>

          <button
            onClick={() => { setSelectedCategory('unmastered'); setSingleIndex(0); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === 'unmastered'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            未習得のみ ({muscles.length - masteredInCourse})
          </button>
        </div>

        {/* Search & Red Sheet (Mask) Controls */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSingleIndex(0); }}
              placeholder={`${courseTitle}の筋名、起始、停止、神経、作用（例: 結節, 屈曲, 橈骨神経）`}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Red sheet (Blind) Toggles */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-500 font-medium mr-1 flex items-center gap-1">
              <EyeOff className="w-3.5 h-3.5 text-teal-700" />
              <span>暗記目隠し:</span>
            </span>

            <button
              onClick={() => setMaskOI(!maskOI)}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors border ${
                maskOI
                  ? 'bg-teal-50 text-teal-800 border-teal-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              起始・停止 {maskOI ? '✓ 隠し中' : '隠す'}
            </button>

            <button
              onClick={() => setMaskNerve(!maskNerve)}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors border ${
                maskNerve
                  ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              支配神経 {maskNerve ? '✓ 隠し中' : '隠す'}
            </button>

            <button
              onClick={() => setMaskAction(!maskAction)}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors border ${
                maskAction
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              作用 {maskAction ? '✓ 隠し中' : '隠す'}
            </button>

            {(maskOI || maskNerve || maskAction) && (
              <button
                onClick={() => {
                  setMaskOI(false);
                  setMaskNerve(false);
                  setMaskAction(false);
                }}
                className="text-slate-400 hover:text-slate-700 underline text-xs ml-1"
              >
                全て解除
              </button>
            )}

            {/* View style toggle */}
            <div className="ml-auto flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
              <button
                onClick={() => setViewStyle('grid')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewStyle === 'grid'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                一覧
              </button>
              <button
                onClick={() => setViewStyle('single')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewStyle === 'single'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1問ずつ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Rendering: Grid vs Single */}
      {filteredMuscles.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Layers className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">該当する筋肉が見つかりませんでした</h3>
          <p className="text-xs text-slate-500 mt-1">検索条件を変更するか、カテゴリーを「全筋」に戻してください</p>
          <button
            onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
          >
            条件をリセット
          </button>
        </div>
      ) : viewStyle === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMuscles.map((muscle) => (
            <MuscleCard
              key={muscle.id}
              muscle={muscle}
              isMastered={masteredIds.has(muscle.id)}
              isBookmarked={bookmarkedIds.has(muscle.id)}
              onToggleMaster={onToggleMaster}
              onToggleBookmark={onToggleBookmark}
              onOpenImageModal={onOpenImageModal}
              maskOriginInsertion={maskOI}
              maskNerve={maskNerve}
              maskAction={maskAction}
            />
          ))}
        </div>
      ) : (
        /* Single Muscle Focus Mode */
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between px-2 text-xs font-semibold text-slate-600">
            <span>
              カード {singleIndex + 1} / {filteredMuscles.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1 font-medium transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>前へ</span>
              </button>
              <button
                onClick={handleNext}
                className="px-3 py-1.5 bg-teal-700 text-white rounded-lg hover:bg-teal-800 flex items-center gap-1 font-medium transition-colors"
              >
                <span>次へ</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {currentSingleMuscle && (
            <MuscleCard
              muscle={currentSingleMuscle}
              isMastered={masteredIds.has(currentSingleMuscle.id)}
              isBookmarked={bookmarkedIds.has(currentSingleMuscle.id)}
              onToggleMaster={onToggleMaster}
              onToggleBookmark={onToggleBookmark}
              onOpenImageModal={onOpenImageModal}
              maskOriginInsertion={maskOI}
              maskNerve={maskNerve}
              maskAction={maskAction}
            />
          )}
        </div>
      )}
    </div>
  );
};
