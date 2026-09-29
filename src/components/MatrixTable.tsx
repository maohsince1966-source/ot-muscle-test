import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  Printer, 
  ExternalLink, 
  ZoomIn, 
  Filter, 
  Check, 
  SlidersHorizontal,
  Activity
} from 'lucide-react';
import { Muscle, MuscleCategory, CourseId } from '../types/muscle';
import { CATEGORIES } from '../data/initialMuscles';
import { getOptimizedImageUrl } from '../utils/imageHelper';

interface MatrixTableProps {
  muscles: Muscle[];
  currentCourse: CourseId;
  onGoToPortal: () => void;
  onOpenImageModal: (muscle: Muscle) => void;
  masteredIds: Set<string>;
  onToggleMaster: (id: string) => void;
}

export const MatrixTable: React.FC<MatrixTableProps> = ({
  muscles,
  currentCourse,
  onGoToPortal,
  onOpenImageModal,
  masteredIds,
  onToggleMaster
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MuscleCategory | 'all'>('all');
  const [selectedActionKeyword, setSelectedActionKeyword] = useState<string>('all');

  const courseCategories = currentCourse === 'all'
    ? CATEGORIES
    : CATEGORIES.filter(c => c.course === currentCourse);

  const courseTitle = currentCourse === 'upper' 
    ? '上肢編' 
    : currentCourse === 'lower' 
    ? '下肢編' 
    : currentCourse === 'trunk_neck' 
    ? '頭頸部・体幹編' 
    : '全分野総合';

  const actionKeywords = [
    { id: 'all', label: 'すべての作用' },
    { id: '屈曲', label: '屈曲' },
    { id: '伸展', label: '伸展' },
    { id: '外転', label: '外転' },
    { id: '内転', label: '内転' },
    { id: '外旋', label: '外旋' },
    { id: '内旋', label: '内旋' },
    { id: '挙上', label: '挙上' },
    { id: '舌骨', label: '舌骨運動' },
    { id: '吸息', label: '呼吸補助' }
  ];

  const filteredMuscles = useMemo(() => {
    return muscles.filter(m => {
      if (selectedCategory !== 'all' && m.category !== selectedCategory) {
        return false;
      }

      if (selectedActionKeyword !== 'all' && !m.action.includes(selectedActionKeyword)) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inName = m.name.toLowerCase().includes(q);
        const inKana = (m.kana || '').toLowerCase().includes(q);
        const inOrigin = m.origin.toLowerCase().includes(q);
        const inInsertion = m.insertion.toLowerCase().includes(q);
        const inNerve = m.nerve.toLowerCase().includes(q);
        const inSegment = m.segmentLevel.toLowerCase().includes(q);
        const inAction = m.action.toLowerCase().includes(q);
        const inNotes = (m.notes || '').toLowerCase().includes(q);
        return inName || inKana || inOrigin || inInsertion || inNerve || inSegment || inAction || inNotes;
      }

      return true;
    });
  }, [muscles, selectedCategory, selectedActionKeyword, searchQuery]);

  // Export to CSV (with UTF-8 BOM for Japanese Excel compatibility)
  const handleExportCSV = () => {
    const headers = ['筋名', 'かな', '英語', '領域', '起始', '停止', '支配神経', '髄節レベル', '作用(運動)', '臨床ポイント', '画像URL'];
    const rows = filteredMuscles.map(m => [
      `"${m.name}"`,
      `"${m.kana || ''}"`,
      `"${m.english || ''}"`,
      `"${m.category === 'shoulder_thorax' ? '肩甲帯・胸郭' : m.category === 'pelvis_lower' ? '骨盤・下肢' : '頸部・舌骨'}"`,
      `"${m.origin.replace(/"/g, '""')}"`,
      `"${m.insertion.replace(/"/g, '""')}"`,
      `"${m.nerve.replace(/"/g, '""')}"`,
      `"${m.segmentLevel.replace(/"/g, '""')}"`,
      `"${m.action.replace(/"/g, '""')}"`,
      `"${(m.notes || '').replace(/"/g, '""')}"`,
      `"${m.imageUrl}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `解剖学筋肉一覧_${courseTitle}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs no-print">
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
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                {courseTitle}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {courseTitle} 全筋対比一覧表（解剖学マトリクス）
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {courseTitle}の全筋肉データを統合。作用や支配神経で横断検索・対比学習ができます。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
              title="CSV形式でダウンロード"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>CSV出力</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
              title="印刷またはPDF保存"
            >
              <Printer className="w-4 h-4" />
              <span>印刷 / PDF</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {courseTitle} 全筋 ({muscles.length})
            </button>

            {courseCategories.map(cat => {
              const count = muscles.filter(m => m.category === cat.id).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.shortName} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="筋肉名、骨指標、神経、髄節を検索"
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Action quick tags */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto text-xs pb-1 text-slate-600">
          <span className="font-semibold text-slate-500 text-[11px] shrink-0">作用で絞り込み:</span>
          {actionKeywords.map(act => (
            <button
              key={act.id}
              onClick={() => setSelectedActionKeyword(act.id)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors whitespace-nowrap ${
                selectedActionKeyword === act.id
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {act.label}
            </button>
          ))}
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <th className="py-3 px-3 w-10 text-center">習得</th>
                <th className="py-3 px-3 w-16 text-center">図</th>
                <th className="py-3 px-3 min-w-[130px]">筋名</th>
                <th className="py-3 px-3 min-w-[80px]">領域</th>
                <th className="py-3 px-3 min-w-[180px]">起始</th>
                <th className="py-3 px-3 min-w-[180px]">停止</th>
                <th className="py-3 px-3 min-w-[140px]">支配神経</th>
                <th className="py-3 px-3 min-w-[90px]">髄節レベル</th>
                <th className="py-3 px-3 min-w-[200px]">作用 (運動)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredMuscles.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    該当する筋肉がありません
                  </td>
                </tr>
              ) : (
                filteredMuscles.map((muscle) => {
                  const isMastered = masteredIds.has(muscle.id);
                  const { primaryUrl, driveViewUrl } = getOptimizedImageUrl(muscle.imageUrl);

                  return (
                    <tr 
                      key={muscle.id}
                      className={`hover:bg-teal-50/20 transition-colors print-break-inside-avoid ${
                        isMastered ? 'bg-emerald-50/15' : ''
                      }`}
                    >
                      {/* 習得 Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onToggleMaster(muscle.id)}
                          className={`w-5 h-5 rounded border inline-flex items-center justify-center transition-colors ${
                            isMastered
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-white border-slate-300 hover:border-slate-500'
                          }`}
                          title={isMastered ? '習得解除' : '習得チェック'}
                        >
                          {isMastered && <Check className="w-3.5 h-3.5" />}
                        </button>
                      </td>

                      {/* 画像サムネイル */}
                      <td className="py-2.5 px-3 text-center">
                        {primaryUrl ? (
                          <button
                            onClick={() => onOpenImageModal(muscle)}
                            className="relative w-12 h-10 rounded border border-slate-200 overflow-hidden bg-slate-50 inline-block group hover:ring-2 hover:ring-teal-500 transition-all"
                            title="クリックで拡大表示"
                          >
                            <img
                              src={primaryUrl}
                              alt={muscle.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <ZoomIn className="w-3 h-3" />
                            </div>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">図なし</span>
                        )}
                      </td>

                      {/* 筋名 */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 text-sm leading-snug">
                          {muscle.name}
                        </div>
                        {muscle.kana && (
                          <div className="text-[10px] text-slate-500">{muscle.kana}</div>
                        )}
                        {muscle.english && (
                          <div className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">
                            {muscle.english}
                          </div>
                        )}
                      </td>

                      {/* 領域 */}
                      <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap">
                        {muscle.category === 'shoulder_thorax' 
                          ? '肩甲帯・胸郭' 
                          : muscle.category === 'pelvis_lower' 
                          ? '骨盤・下肢' 
                          : '頸部・舌骨'}
                      </td>

                      {/* 起始 */}
                      <td className="py-3 px-3 leading-relaxed">
                        {muscle.origin}
                      </td>

                      {/* 停止 */}
                      <td className="py-3 px-3 leading-relaxed">
                        {muscle.insertion}
                      </td>

                      {/* 支配神経 */}
                      <td className="py-3 px-3 font-medium text-indigo-950 leading-relaxed">
                        {muscle.nerve}
                      </td>

                      {/* 髄節レベル */}
                      <td className="py-3 px-3 font-mono font-semibold text-slate-700 tabular-nums whitespace-nowrap">
                        {muscle.segmentLevel || '—'}
                      </td>

                      {/* 作用 */}
                      <td className="py-3 px-3 leading-relaxed">
                        {muscle.action}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Counter */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>表示中: <strong className="text-slate-800 tabular-nums">{filteredMuscles.length}</strong> / {muscles.length} 筋</span>
          <span className="text-[11px] text-slate-400">作業療法士 国家試験出題基準 解剖学準拠</span>
        </div>
      </div>
    </div>
  );
};
