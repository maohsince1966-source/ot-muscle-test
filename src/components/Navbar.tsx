import React, { useState } from 'react';
import { 
  BookOpen, 
  HelpCircle, 
  TableProperties, 
  AlertCircle, 
  Settings, 
  ChevronDown, 
  LayoutGrid,
  Hand,
  Footprints,
  Activity,
  Layers
} from 'lucide-react';
import { CourseId } from '../types/muscle';

export type NavTab = 'portal' | 'study' | 'quiz' | 'matrix' | 'weakness';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentCourse: CourseId;
  onSelectCourse: (course: CourseId) => void;
  weaknessCount: number;
  masteredCount: number;
  totalCount: number;
  onOpenManage: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentCourse,
  onSelectCourse,
  weaknessCount,
  onOpenManage
}) => {
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);

  const getCourseLabel = (id: CourseId) => {
    switch (id) {
      case 'upper': return '上肢編';
      case 'lower': return '下肢編';
      case 'trunk_neck': return '頭頸部・体幹編';
      case 'all': return '全分野総合';
      default: return '編を選択';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Zone 1: Single text element wordmark */}
        <button 
          onClick={() => onSelectTab('portal')}
          className="text-left group flex items-center gap-2.5 focus:outline-none shrink-0"
          title="分野選択（入口）に戻る"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            OT
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
              解剖学 筋肉マスター
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (single line controls) */}
        <nav className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={() => onSelectTab('portal')}
            className={`px-2.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-1 whitespace-nowrap ${
              currentTab === 'portal'
                ? 'bg-teal-50 text-teal-800 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
            <span>入口</span>
          </button>

          <button
            onClick={() => onSelectTab('study')}
            className={`px-2.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-1 whitespace-nowrap ${
              currentTab === 'study'
                ? 'bg-teal-50 text-teal-800 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>筋肉図鑑</span>
          </button>

          <button
            onClick={() => onSelectTab('quiz')}
            className={`px-2.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-1 whitespace-nowrap ${
              currentTab === 'quiz'
                ? 'bg-teal-50 text-teal-800 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 shrink-0" />
            <span>暗記クイズ</span>
          </button>

          <button
            onClick={() => onSelectTab('matrix')}
            className={`hidden sm:inline-flex px-2.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors items-center gap-1 whitespace-nowrap ${
              currentTab === 'matrix'
                ? 'bg-teal-50 text-teal-800 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TableProperties className="w-3.5 h-3.5 shrink-0" />
            <span>一覧表</span>
          </button>

          <button
            onClick={() => onSelectTab('weakness')}
            className={`px-2.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-1 whitespace-nowrap ${
              currentTab === 'weakness'
                ? 'bg-rose-50 text-rose-800 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>弱点</span>
            {weaknessCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-rose-600 text-white text-[11px] font-bold rounded-full tabular-nums">
                {weaknessCount}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Actions (Course Switcher Dropdown & Management) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Active Course Selector Button */}
          <div className="relative">
            <button
              onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)}
              className="px-2.5 py-1.5 text-xs font-bold bg-teal-50 text-teal-900 border border-teal-200/80 rounded-lg hover:bg-teal-100 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <span className="hidden md:inline text-teal-600 font-normal">分野:</span>
              <span>{getCourseLabel(currentCourse)}</span>
              <ChevronDown className="w-3 h-3 text-teal-600" />
            </button>

            {/* Course Switcher Dropdown */}
            {isCourseDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsCourseDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400">
                    学習分野を切り替え
                  </div>
                  
                  <button
                    onClick={() => {
                      onSelectCourse('upper');
                      setIsCourseDropdownOpen(false);
                      if (currentTab === 'portal') onSelectTab('study');
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 transition-colors ${
                      currentCourse === 'upper' ? 'text-sky-800 bg-sky-50/50 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <Hand className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>上肢編</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectCourse('lower');
                      setIsCourseDropdownOpen(false);
                      if (currentTab === 'portal') onSelectTab('study');
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 transition-colors ${
                      currentCourse === 'lower' ? 'text-emerald-800 bg-emerald-50/50 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <Footprints className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>下肢編</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectCourse('trunk_neck');
                      setIsCourseDropdownOpen(false);
                      if (currentTab === 'portal') onSelectTab('study');
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 transition-colors ${
                      currentCourse === 'trunk_neck' ? 'text-indigo-800 bg-indigo-50/50 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>頭頸部・体幹編</span>
                  </button>

                  <div className="my-1 border-t border-slate-100"></div>

                  <button
                    onClick={() => {
                      onSelectCourse('all');
                      setIsCourseDropdownOpen(false);
                      if (currentTab === 'portal') onSelectTab('study');
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 transition-colors ${
                      currentCourse === 'all' ? 'text-slate-900 bg-slate-100 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>全分野総合（国家試験対策）</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Manage Modal Trigger */}
          <button
            onClick={onOpenManage}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="筋肉データの追加・CSV連携"
            aria-label="管理"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
