import React from 'react';
import { X, ExternalLink, ZoomIn } from 'lucide-react';
import { extractDriveFileId } from '../utils/imageHelper';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  muscleName: string;
  categoryLabel?: string;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  muscleName,
  categoryLabel
}) => {
  if (!isOpen) return null;

  const driveId = extractDriveFileId(imageUrl);
  const driveUrl = driveId ? `https://drive.google.com/file/d/${driveId}/view` : null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl w-full bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">{muscleName}</h3>
              {categoryLabel && (
                <span className="text-xs text-slate-500 font-medium">({categoryLabel})</span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">解剖学・筋走行プレビュー</p>
          </div>
          <div className="flex items-center gap-2">
            {driveUrl && (
              <a
                href={driveUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                title="Googleドライブで元ファイルを開く"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Google Driveで開く</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              aria-label="閉じる"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Content */}
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-slate-100 min-h-[360px]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${muscleName}の解剖図`}
              referrerPolicy="no-referrer"
              className="max-h-[70vh] w-auto max-w-full object-contain rounded-md shadow-sm bg-white"
              onError={(e) => {
                // If direct fails, try thumbnail or display message
                const target = e.currentTarget;
                if (driveId && !target.src.includes('drive.google.com/thumbnail')) {
                  target.src = `https://drive.google.com/thumbnail?id=${driveId}&sz=w1000`;
                }
              }}
            />
          ) : (
            <div className="text-center py-12 text-slate-500">
              <ZoomIn className="w-12 h-12 mx-auto mb-2 text-slate-400" />
              <p className="text-sm font-medium">この筋肉には画像URLが登録されていません</p>
              <p className="text-xs text-slate-400 mt-1">「筋肉データ管理」から画像の追加が可能です</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>解剖学の起始部・停止部と筋線維の走向を確認してください</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
