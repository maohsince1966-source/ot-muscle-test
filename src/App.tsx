import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { CourseEntrance } from './components/CourseEntrance';
import { StudyMode } from './components/StudyMode';
import { QuizMode } from './components/QuizMode';
import { MatrixTable } from './components/MatrixTable';
import { WeaknessMode } from './components/WeaknessMode';
import { ImageModal } from './components/ImageModal';
import { ManageModal } from './components/ManageModal';
import { Muscle, MuscleCategory, CourseId } from './types/muscle';
import { INITIAL_MUSCLES } from './data/initialMuscles';
import { parseMuscleCSV } from './utils/csvParser';
import { getOptimizedImageUrl } from './utils/imageHelper';

export default function App() {
  // Muscles data (persisted in localStorage, upgraded to v3 for comprehensive upper/lower/trunk datasets)
  const [muscles, setMuscles] = useState<Muscle[]>(() => {
    try {
      const saved = localStorage.getItem('ot_muscles_data_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 60) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_MUSCLES;
  });

  // Course state: 'upper' | 'lower' | 'trunk_neck' | 'all'
  const [currentCourse, setCurrentCourse] = useState<CourseId>(() => {
    try {
      const saved = localStorage.getItem('ot_current_course_v3') as CourseId;
      if (saved && ['upper', 'lower', 'trunk_neck', 'all'].includes(saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'upper';
  });

  // UI Navigation states (defaults to 'portal' for initial course selection entrance)
  const [currentTab, setCurrentTab] = useState<NavTab>('portal');

  // Mastered IDs (習得済み)
  const [masteredIds, setMasteredIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('ot_mastered_ids_v3');
      if (saved) return new Set(JSON.parse(saved));
    } catch {
      // ignore
    }
    return new Set<string>();
  });

  // Bookmarked IDs (要復習マーク)
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('ot_bookmarked_ids_v3');
      if (saved) return new Set(JSON.parse(saved));
    } catch {
      // ignore
    }
    return new Set<string>();
  });

  // Weakness IDs (間違えた問題)
  const [weaknessIds, setWeaknessIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('ot_weakness_ids_v3');
      if (saved) return new Set(JSON.parse(saved));
    } catch {
      // ignore
    }
    return new Set<string>();
  });

  const [preselectedQuizCategory, setPreselectedQuizCategory] = useState<MuscleCategory | 'all' | 'weakness'>('all');
  const [imageModalMuscle, setImageModalMuscle] = useState<Muscle | null>(null);
  const [isManageOpen, setIsManageOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ot_muscles_data_v3', JSON.stringify(muscles));
    } catch {
      // ignore
    }
  }, [muscles]);

  useEffect(() => {
    try {
      localStorage.setItem('ot_current_course_v3', currentCourse);
    } catch {
      // ignore
    }
  }, [currentCourse]);

  useEffect(() => {
    try {
      localStorage.setItem('ot_mastered_ids_v3', JSON.stringify(Array.from(masteredIds)));
    } catch {
      // ignore
    }
  }, [masteredIds]);

  useEffect(() => {
    try {
      localStorage.setItem('ot_bookmarked_ids_v3', JSON.stringify(Array.from(bookmarkedIds)));
    } catch {
      // ignore
    }
  }, [bookmarkedIds]);

  useEffect(() => {
    try {
      localStorage.setItem('ot_weakness_ids_v3', JSON.stringify(Array.from(weaknessIds)));
    } catch {
      // ignore
    }
  }, [weaknessIds]);

  // Handlers
  const handleToggleMaster = (id: string) => {
    setMasteredIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleRecordWrongMuscle = (muscleId: string) => {
    setWeaknessIds(prev => new Set(prev).add(muscleId));
  };

  const handleClearWrongMuscle = (muscleId: string) => {
    setWeaknessIds(prev => {
      const next = new Set(prev);
      next.delete(muscleId);
      return next;
    });
  };

  const handleClearAllWeakness = () => {
    setWeaknessIds(new Set());
    setBookmarkedIds(new Set());
  };

  // Course Entrance selection handler
  const handleSelectCourseFromEntrance = (courseId: CourseId, initialTab: 'study' | 'quiz' = 'study') => {
    setCurrentCourse(courseId);
    setCurrentTab(initialTab);
    setPreselectedQuizCategory('all');
  };

  // Manage Handlers
  const handleAddMuscle = (newMuscle: Muscle) => {
    setMuscles(prev => [newMuscle, ...prev]);
  };

  const handleUpdateMuscle = (updated: Muscle) => {
    setMuscles(prev => prev.map(m => m.id === updated.id ? updated : m));
  };

  const handleDeleteMuscle = (id: string) => {
    setMuscles(prev => prev.filter(m => m.id !== id));
    setMasteredIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setWeaknessIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleResetMuscles = () => {
    setMuscles(INITIAL_MUSCLES);
    setMasteredIds(new Set());
    setBookmarkedIds(new Set());
    setWeaknessIds(new Set());
    localStorage.removeItem('ot_muscles_data_v3');
    localStorage.removeItem('ot_mastered_ids_v3');
    localStorage.removeItem('ot_bookmarked_ids_v3');
    localStorage.removeItem('ot_weakness_ids_v3');
  };

  const handleImportCSV = (csvText: string, category: MuscleCategory) => {
    const imported = parseMuscleCSV(csvText, category);
    if (imported.length > 0) {
      setMuscles(prev => [...imported, ...prev]);
      return { success: imported.length, errors: 0 };
    }
    return { success: 0, errors: 1 };
  };

  const handleStartQuizWithFilter = (category: MuscleCategory | 'all' | 'weakness') => {
    setPreselectedQuizCategory(category);
    setCurrentTab('quiz');
  };

  // Active muscle list filtered by the currently chosen course
  const activeMuscles = currentCourse === 'all'
    ? muscles
    : muscles.filter(m => m.course === currentCourse);

  const activeWeaknessCount = activeMuscles.filter(
    m => weaknessIds.has(m.id) || bookmarkedIds.has(m.id)
  ).length;

  const activeMasteredCount = activeMuscles.filter(
    m => masteredIds.has(m.id)
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar Contract compliant Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentCourse={currentCourse}
        onSelectCourse={(c) => {
          setCurrentCourse(c);
          if (currentTab === 'portal') setCurrentTab('study');
        }}
        weaknessCount={activeWeaknessCount}
        masteredCount={activeMasteredCount}
        totalCount={activeMuscles.length}
        onOpenManage={() => setIsManageOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'portal' && (
          <CourseEntrance
            muscles={muscles}
            masteredIds={masteredIds}
            bookmarkedIds={bookmarkedIds}
            weaknessIds={weaknessIds}
            onSelectCourse={handleSelectCourseFromEntrance}
          />
        )}

        {currentTab === 'study' && (
          <StudyMode
            muscles={activeMuscles}
            currentCourse={currentCourse}
            onGoToPortal={() => setCurrentTab('portal')}
            masteredIds={masteredIds}
            bookmarkedIds={bookmarkedIds}
            onToggleMaster={handleToggleMaster}
            onToggleBookmark={handleToggleBookmark}
            onOpenImageModal={(m) => setImageModalMuscle(m)}
            onStartQuizWithFilter={handleStartQuizWithFilter}
          />
        )}

        {currentTab === 'quiz' && (
          <QuizMode
            muscles={activeMuscles}
            currentCourse={currentCourse}
            onGoToPortal={() => setCurrentTab('portal')}
            preselectedCategory={preselectedQuizCategory}
            weaknessIds={weaknessIds}
            onRecordWrongMuscle={handleRecordWrongMuscle}
            onClearWrongMuscle={handleClearWrongMuscle}
            onOpenImageModal={(m) => setImageModalMuscle(m)}
            onGoToStudy={() => setCurrentTab('study')}
          />
        )}

        {currentTab === 'matrix' && (
          <MatrixTable
            muscles={activeMuscles}
            currentCourse={currentCourse}
            onGoToPortal={() => setCurrentTab('portal')}
            onOpenImageModal={(m) => setImageModalMuscle(m)}
            masteredIds={masteredIds}
            onToggleMaster={handleToggleMaster}
          />
        )}

        {currentTab === 'weakness' && (
          <WeaknessMode
            muscles={activeMuscles}
            currentCourse={currentCourse}
            onGoToPortal={() => setCurrentTab('portal')}
            weaknessIds={weaknessIds}
            masteredIds={masteredIds}
            bookmarkedIds={bookmarkedIds}
            onToggleMaster={handleToggleMaster}
            onToggleBookmark={handleToggleBookmark}
            onOpenImageModal={(m) => setImageModalMuscle(m)}
            onStartWeaknessQuiz={() => {
              setPreselectedQuizCategory('weakness');
              setCurrentTab('quiz');
            }}
            onClearAllWeakness={handleClearAllWeakness}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="font-semibold text-slate-800">
              作業療法士・理学療法士養成校 解剖学 筋肉暗記マスター
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              【上肢編】肩甲帯・肩関節・上腕・前腕・手 ／ 【下肢編】骨盤帯・股関節・大腿・下腿・足 ／ 【頭頸部・体幹編】頭頸部・舌骨・胸郭・腹壁・背筋
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setCurrentTab('portal')}
              className="text-teal-700 hover:text-teal-800 font-semibold"
            >
              入口（分野選択）
            </button>
            <span>·</span>
            <span>起始・停止・支配神経・髄節・作用 統合学習システム</span>
          </div>
        </div>
      </footer>

      {/* High-Resolution Image Zoom Modal */}
      {imageModalMuscle && (
        <ImageModal
          isOpen={!!imageModalMuscle}
          onClose={() => setImageModalMuscle(null)}
          imageUrl={getOptimizedImageUrl(imageModalMuscle.imageUrl).primaryUrl || imageModalMuscle.imageUrl}
          muscleName={imageModalMuscle.name}
          categoryLabel={
            imageModalMuscle.category === 'shoulder_thorax' 
              ? '肩甲帯・胸郭' 
              : imageModalMuscle.category === 'pelvis_lower' 
              ? '骨盤・下肢' 
              : '頸部・舌骨'
          }
        />
      )}

      {/* Teacher Data Management Modal */}
      <ManageModal
        isOpen={isManageOpen}
        onClose={() => setIsManageOpen(false)}
        muscles={muscles}
        onAddMuscle={handleAddMuscle}
        onUpdateMuscle={handleUpdateMuscle}
        onDeleteMuscle={handleDeleteMuscle}
        onResetMuscles={handleResetMuscles}
        onImportCSV={handleImportCSV}
      />
    </div>
  );
}
