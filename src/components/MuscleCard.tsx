import React, { useState } from 'react';
import { 
  CheckCircle, 
  Bookmark, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  ZoomIn, 
  Activity,
  Zap,
  Sparkles,
  Info
} from 'lucide-react';
import { Muscle } from '../types/muscle';
import { getOptimizedImageUrl, getAnatomicalDiagramMeta } from '../utils/imageHelper';

interface MuscleCardProps {
  muscle: Muscle;
  isMastered: boolean;
  isBookmarked: boolean;
  onToggleMaster: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onOpenImageModal: (muscle: Muscle) => void;
  // Red sheet global overrides
  maskOriginInsertion: boolean;
  maskNerve: boolean;
  maskAction: boolean;
}

export const MuscleCard: React.FC<MuscleCardProps> = ({
  muscle,
  isMastered,
  isBookmarked,
  onToggleMaster,
  onToggleBookmark,
  onOpenImageModal,
  maskOriginInsertion,
  maskNerve,
  maskAction
}) => {
  // Local reveals for individual card interaction
  const [revealedOI, setRevealedOI] = useState(false);
  const [revealedNerve, setRevealedNerve] = useState(false);
  const [revealedAction, setRevealedAction] = useState(false);
  const [imageError, setImageError] = useState(false);

  const { primaryUrl, fallbackUrl, driveViewUrl, isDrive } = getOptimizedImageUrl(muscle.imageUrl);
  const diagramMeta = getAnatomicalDiagramMeta(muscle.name, muscle.category);

  const isOIMasked = maskOriginInsertion && !revealedOI;
  const isNerveMasked = maskNerve && !revealedNerve;
  const isActionMasked = maskAction && !revealedAction;

  return (
    <div className={`bg-white rounded-xl border transition-all duration-200 shadow-xs hover:shadow-md flex flex-col ${
      isMastered 
        ? 'border-emerald-200 ring-1 ring-emerald-100 bg-emerald-50/20' 
        : isBookmarked
        ? 'border-amber-200 bg-amber-50/10'
        : 'border-slate-200'
    }`}>
      {/* Card Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-medium text-slate-500">
              {muscle.category === 'shoulder_thorax' 
                ? '肩甲帯・胸郭' 
                : muscle.category === 'pelvis_lower' 
                ? '骨盤・下肢' 
                : '頸部・舌骨'}
            </span>
            {muscle.english && (
              <>
                <span className="text-slate-300 text-xs">/</span>
                <span className="text-xs font-mono text-slate-500 truncate">{muscle.english}</span>
              </>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {muscle.name}
            </h3>
            {muscle.kana && (
              <span className="text-xs text-slate-500 font-medium">{muscle.kana}</span>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onToggleBookmark(muscle.id)}
            className={`p-1.5 rounded-lg transition-colors ${
              isBookmarked
                ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title={isBookmarked ? '要復習から解除' : '要復習にチェック'}
            aria-label="要復習チェック"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={() => onToggleMaster(muscle.id)}
            className={`p-1.5 rounded-lg transition-colors ${
              isMastered
                ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title={isMastered ? '習得済みを解除' : '覚えた！(習得済みにする)'}
            aria-label="習得済みチェック"
          >
            <CheckCircle className={`w-4 h-4 ${isMastered ? 'fill-current text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Anatomy Visual Container */}
      <div className="relative bg-slate-50 border-b border-slate-100 h-48 sm:h-52 overflow-hidden flex items-center justify-center group">
        {primaryUrl && !imageError ? (
          <>
            <img
              src={primaryUrl}
              alt={`${muscle.name}の筋肉解剖図`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain p-2 transition-transform duration-200 group-hover:scale-105"
              onError={() => {
                if (fallbackUrl && fallbackUrl !== primaryUrl) {
                  // try fallback thumbnail
                  const img = new Image();
                  img.src = fallbackUrl;
                  img.onload = () => {
                    // if fallback works, update
                  };
                  img.onerror = () => setImageError(true);
                } else {
                  setImageError(true);
                }
              }}
            />
            {/* Overlay quick actions */}
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[1px]">
              <button
                onClick={() => onOpenImageModal(muscle)}
                className="px-3 py-1.5 bg-white/95 text-slate-800 text-xs font-semibold rounded-lg shadow-sm hover:bg-white transition-all flex items-center gap-1.5"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>拡大表示</span>
              </button>
              {driveViewUrl && (
                <a
                  href={driveViewUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="px-3 py-1.5 bg-slate-900/90 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-slate-900 transition-all flex items-center gap-1.5"
                  title="Google Driveで開く"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Drive</span>
                </a>
              )}
            </div>
          </>
        ) : (
          /* Anatomical Schema Fallback */
          <div className="w-full h-full p-4 flex flex-col justify-between bg-linear-to-br from-slate-50 to-slate-100/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <Activity className="w-3 h-3 text-teal-600" />
                <span>{diagramMeta.region}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                {muscle.segmentLevel || '髄節確認'}
              </span>
            </div>

            <div className="text-center my-auto py-2">
              <div className="w-12 h-12 mx-auto rounded-xl bg-teal-50 border border-teal-200/60 text-teal-700 flex items-center justify-center mb-1.5">
                <Zap className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-800">{muscle.name}</p>
              <p className="text-[11px] text-slate-500 mt-0.5 max-w-[200px] mx-auto line-clamp-2">
                {diagramMeta.focusArea}
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/60 pt-1.5">
              <span>作用: {muscle.action.split(' ')[0] || '屈曲・伸展'}</span>
              <button
                onClick={() => onOpenImageModal(muscle)}
                className="text-teal-700 hover:text-teal-900 font-medium flex items-center gap-1"
              >
                <span>詳細</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Anatomy Knowledge Specs (Origin / Insertion / Nerve / Action) */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col gap-3.5 text-xs sm:text-sm">
        {/* 1. 起始 & 停止 */}
        <div className="rounded-lg bg-slate-50/80 border border-slate-100 p-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span className="flex items-center gap-1 text-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              起始・停止
            </span>
            {maskOriginInsertion && (
              <button
                onClick={() => setRevealedOI(!revealedOI)}
                className="text-[11px] text-teal-700 hover:text-teal-800 font-medium inline-flex items-center gap-1"
              >
                {isOIMasked ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <span>{isOIMasked ? '見る' : '隠す'}</span>
              </button>
            )}
          </div>

          {isOIMasked ? (
            <div 
              onClick={() => setRevealedOI(true)}
              className="py-3 px-2 text-center text-xs font-medium text-slate-400 bg-white border border-dashed border-slate-200 rounded cursor-pointer hover:bg-teal-50/50 hover:text-teal-700 transition-colors"
            >
              タップして起始・停止を表示
            </div>
          ) : (
            <div className="space-y-1.5 text-slate-800 leading-relaxed">
              <div>
                <span className="text-[11px] font-bold text-slate-500 mr-1.5">【起始】</span>
                <span>{muscle.origin || '—'}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 mr-1.5">【停止】</span>
                <span>{muscle.insertion || '—'}</span>
              </div>
            </div>
          )}
        </div>

        {/* 2. 支配神経 & 髄節レベル */}
        <div className="rounded-lg bg-slate-50/80 border border-slate-100 p-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span className="flex items-center gap-1 text-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              支配神経・髄節
            </span>
            {maskNerve && (
              <button
                onClick={() => setRevealedNerve(!revealedNerve)}
                className="text-[11px] text-indigo-700 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
              >
                {isNerveMasked ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <span>{isNerveMasked ? '見る' : '隠す'}</span>
              </button>
            )}
          </div>

          {isNerveMasked ? (
            <div 
              onClick={() => setRevealedNerve(true)}
              className="py-3 px-2 text-center text-xs font-medium text-slate-400 bg-white border border-dashed border-slate-200 rounded cursor-pointer hover:bg-indigo-50/50 hover:text-indigo-700 transition-colors"
            >
              タップして支配神経・髄節を表示
            </div>
          ) : (
            <div className="space-y-1 text-slate-800 leading-relaxed">
              <div>
                <span className="text-[11px] font-bold text-slate-500 mr-1.5">【神経】</span>
                <span className="font-medium text-indigo-950">{muscle.nerve || '—'}</span>
              </div>
              {muscle.segmentLevel && (
                <div>
                  <span className="text-[11px] font-bold text-slate-500 mr-1.5">【髄節】</span>
                  <span className="font-mono text-slate-700 font-semibold tabular-nums">{muscle.segmentLevel}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. 作用 (運動) */}
        <div className="rounded-lg bg-slate-50/80 border border-slate-100 p-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span className="flex items-center gap-1 text-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              筋の作用 (運動)
            </span>
            {maskAction && (
              <button
                onClick={() => setRevealedAction(!revealedAction)}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium inline-flex items-center gap-1"
              >
                {isActionMasked ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <span>{isActionMasked ? '見る' : '隠す'}</span>
              </button>
            )}
          </div>

          {isActionMasked ? (
            <div 
              onClick={() => setRevealedAction(true)}
              className="py-3 px-2 text-center text-xs font-medium text-slate-400 bg-white border border-dashed border-slate-200 rounded cursor-pointer hover:bg-emerald-50/50 hover:text-emerald-700 transition-colors"
            >
              タップして筋の作用を表示
            </div>
          ) : (
            <p className="text-slate-800 leading-relaxed font-medium">
              {muscle.action || '—'}
            </p>
          )}
        </div>

        {/* Clinical notes / Exam points */}
        {muscle.notes && (
          <div className="mt-auto pt-2 flex items-start gap-1.5 text-xs text-slate-600 bg-amber-50/60 rounded-md p-2 border border-amber-100">
            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{muscle.notes}</span>
          </div>
        )}
      </div>

      {/* Card Footer status */}
      <div className="px-4 py-2.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>{isMastered ? '✓ 習得済み' : isBookmarked ? '★ 要復習マーク中' : '未チェック'}</span>
        <button
          onClick={() => onToggleMaster(muscle.id)}
          className={`font-semibold transition-colors ${
            isMastered ? 'text-slate-500 hover:text-slate-700' : 'text-teal-700 hover:text-teal-900'
          }`}
        >
          {isMastered ? '未習得に戻す' : '覚えた！'}
        </button>
      </div>
    </div>
  );
};
