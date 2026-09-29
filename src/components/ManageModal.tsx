import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Upload, 
  RotateCcw, 
  Trash2, 
  Edit3, 
  Save, 
  FileSpreadsheet,
  AlertCircle,
  Check
} from 'lucide-react';
import { Muscle, MuscleCategory } from '../types/muscle';
import { CATEGORIES } from '../data/initialMuscles';
import { inferCourseFromCategory } from '../utils/csvParser';

interface ManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  muscles: Muscle[];
  onAddMuscle: (muscle: Muscle) => void;
  onUpdateMuscle: (muscle: Muscle) => void;
  onDeleteMuscle: (id: string) => void;
  onResetMuscles: () => void;
  onImportCSV: (csvText: string, category: MuscleCategory) => { success: number; errors: number };
}

export const ManageModal: React.FC<ManageModalProps> = ({
  isOpen,
  onClose,
  muscles,
  onAddMuscle,
  onUpdateMuscle,
  onDeleteMuscle,
  onResetMuscles,
  onImportCSV
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'csv' | 'reset'>('list');
  const [editingMuscle, setEditingMuscle] = useState<Muscle | null>(null);

  // New muscle form state
  const [formData, setFormData] = useState<Partial<Muscle>>({
    category: 'shoulder_thorax',
    name: '',
    kana: '',
    english: '',
    origin: '',
    insertion: '',
    nerve: '',
    segmentLevel: '',
    action: '',
    imageUrl: '',
    notes: ''
  });

  // CSV paste state
  const [csvText, setCsvText] = useState('');
  const [csvCategory, setCsvCategory] = useState<MuscleCategory>('shoulder_thorax');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('筋名を入力してください');
      return;
    }

    const newMuscle: Muscle = {
      id: `custom-${Date.now()}`,
      name: formData.name.trim(),
      kana: formData.kana?.trim(),
      english: formData.english?.trim(),
      course: inferCourseFromCategory(formData.category || 'shoulder_thorax'),
      category: formData.category || 'shoulder_thorax',
      origin: formData.origin?.trim() || '',
      insertion: formData.insertion?.trim() || '',
      nerve: formData.nerve?.trim() || '',
      segmentLevel: formData.segmentLevel?.trim() || '',
      action: formData.action?.trim() || '',
      imageUrl: formData.imageUrl?.trim() || '',
      notes: formData.notes?.trim()
    };

    onAddMuscle(newMuscle);
    setFormData({
      category: 'shoulder_thorax',
      name: '',
      kana: '',
      english: '',
      origin: '',
      insertion: '',
      nerve: '',
      segmentLevel: '',
      action: '',
      imageUrl: '',
      notes: ''
    });
    setActiveTab('list');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMuscle || !editingMuscle.name.trim()) return;

    onUpdateMuscle(editingMuscle);
    setEditingMuscle(null);
  };

  const handleRunCSVImport = () => {
    if (!csvText.trim()) {
      alert('CSVテキストを貼り付けてください');
      return;
    }

    const res = onImportCSV(csvText, csvCategory);
    setImportStatus(`${res.success} 件の筋肉データを追加・更新しました`);
    setCsvText('');
    setTimeout(() => {
      setActiveTab('list');
      setImportStatus(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">筋肉データ管理＆スプレッドシート連携</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              教員用: 筋肉の追加・編集・Google SheetsのCSV取り込みが可能です
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100/60 px-6 gap-2 pt-2 text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('list'); setEditingMuscle(null); }}
            className={`px-3.5 py-2.5 rounded-t-lg transition-colors ${
              activeTab === 'list'
                ? 'bg-white text-slate-900 border-t-2 border-teal-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            登録済み筋肉 ({muscles.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-3.5 py-2.5 rounded-t-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'add'
                ? 'bg-white text-slate-900 border-t-2 border-teal-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新規筋肉の追加</span>
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`px-3.5 py-2.5 rounded-t-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'csv'
                ? 'bg-white text-slate-900 border-t-2 border-teal-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV一括取り込み</span>
          </button>
          <button
            onClick={() => setActiveTab('reset')}
            className={`px-3.5 py-2.5 rounded-t-lg transition-colors ml-auto text-rose-600 hover:text-rose-700 flex items-center gap-1 ${
              activeTab === 'reset'
                ? 'bg-white text-rose-700 border-t-2 border-rose-600'
                : ''
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>初期状態に戻す</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: Muscle List & Edit */}
          {activeTab === 'list' && (
            <div>
              {editingMuscle ? (
                /* Edit Form */
                <form onSubmit={handleSaveEdit} className="space-y-4 max-w-2xl mx-auto">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-bold text-slate-900 text-sm">【{editingMuscle.name}】のデータを編集</h3>
                    <button
                      type="button"
                      onClick={() => setEditingMuscle(null)}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      キャンセル
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">筋名 *</label>
                      <input
                        type="text"
                        value={editingMuscle.name}
                        onChange={(e) => setEditingMuscle({ ...editingMuscle, name: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">領域（カテゴリー）</label>
                      <select
                        value={editingMuscle.category}
                        onChange={(e) => setEditingMuscle({ ...editingMuscle, category: e.target.value as MuscleCategory })}
                        className="w-full px-3 py-1.5 border rounded-lg bg-white"
                      >
                        {CATEGORIES.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">かな読み</label>
                      <input
                        type="text"
                        value={editingMuscle.kana || ''}
                        onChange={(e) => setEditingMuscle({ ...editingMuscle, kana: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">英語・ラテン名</label>
                      <input
                        type="text"
                        value={editingMuscle.english || ''}
                        onChange={(e) => setEditingMuscle({ ...editingMuscle, english: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-lg"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">起始</label>
                      <textarea
                        rows={2}
                        value={editingMuscle.origin}
                        onChange={(e) => setEditingMuscle({ ...editingMuscle, origin: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-lg"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">停止</label>
                      <textarea
                        rows={2}
                        value={editingMuscle.insertion}
                        onChange={(e) => setEditingMuscle({ ...editingMuscle, insertion: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">支配神経</label>
                      <input
                        type="text"
                        value={editingMuscle.nerve}
                        onChange={(e) => setEditingMuscle({ ...editingMuscle, nerve: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">髄節レベル</label>
                      <input
                        type="text"
                        value={editingMuscle.segmentLevel}
                        onChange={(e) => setEditingMuscle({ ...editingMuscle, segmentLevel: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-lg"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">作用 (運動)</label>
                      <textarea
                        rows={2}
                        value={editingMuscle.action}
                        onChange={(e) => setEditingMuscle({ ...editingMuscle, action: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-lg"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">画像URL (Google DriveまたはWeb画像)</label>
                      <input
                        type="url"
                        value={editingMuscle.imageUrl}
                        onChange={(e) => setEditingMuscle({ ...editingMuscle, imageUrl: e.target.value })}
                        placeholder="https://drive.google.com/file/d/..."
                        className="w-full px-3 py-1.5 border rounded-lg font-mono text-[11px]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">国試・臨床ポイント（メモ）</label>
                      <input
                        type="text"
                        value={editingMuscle.notes || ''}
                        onChange={(e) => setEditingMuscle({ ...editingMuscle, notes: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t">
                    <button
                      type="button"
                      onClick={() => setEditingMuscle(null)}
                      className="px-4 py-2 border rounded-lg text-slate-700 text-xs font-semibold"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-teal-700 text-white rounded-lg text-xs font-semibold hover:bg-teal-800"
                    >
                      変更を保存
                    </button>
                  </div>
                </form>
              ) : (
                /* List Table */
                <div className="divide-y divide-slate-100 text-xs">
                  {muscles.map((m) => (
                    <div key={m.id} className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-2 h-2 rounded-full shrink-0 bg-teal-500"></span>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">
                            {m.name}
                            <span className="text-slate-400 font-normal ml-1.5 text-[11px]">
                              ({m.category === 'shoulder_thorax' ? '肩甲帯・胸郭' : m.category === 'pelvis_lower' ? '骨盤・下肢' : '頸部・舌骨'})
                            </span>
                          </div>
                          <div className="text-slate-500 text-[11px] truncate">
                            神経: {m.nerve || '—'} {m.segmentLevel && `(${m.segmentLevel})`} | 作用: {m.action.slice(0, 30)}...
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setEditingMuscle(m)}
                          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                          title="編集"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`筋肉「${m.name}」を削除してもよろしいですか？`)) {
                              onDeleteMuscle(m.id);
                            }
                          }}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                          title="削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Add New Muscle */}
          {activeTab === 'add' && (
            <form onSubmit={handleSaveNew} className="space-y-4 max-w-2xl mx-auto text-xs">
              <h3 className="font-bold text-slate-900 text-sm border-b pb-2">新しい筋肉の登録</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">筋名 *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例: 上腕二頭筋"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">領域（カテゴリー）</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as MuscleCategory })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">かな読み</label>
                  <input
                    type="text"
                    value={formData.kana}
                    onChange={(e) => setFormData({ ...formData, kana: e.target.value })}
                    placeholder="例: じょうわんにとうきん"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">英語・ラテン名</label>
                  <input
                    type="text"
                    value={formData.english}
                    onChange={(e) => setFormData({ ...formData, english: e.target.value })}
                    placeholder="例: Biceps brachii"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">起始</label>
                  <textarea
                    rows={2}
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    placeholder="例: 長頭: 関節上結節 / 短頭: 烏口突起先端"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">停止</label>
                  <textarea
                    rows={2}
                    value={formData.insertion}
                    onChange={(e) => setFormData({ ...formData, insertion: e.target.value })}
                    placeholder="例: 橈骨粗面, 上腕二頭筋腱膜を経て前腕筋膜"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">支配神経</label>
                  <input
                    type="text"
                    value={formData.nerve}
                    onChange={(e) => setFormData({ ...formData, nerve: e.target.value })}
                    placeholder="例: 筋皮神経"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">髄節レベル</label>
                  <input
                    type="text"
                    value={formData.segmentLevel}
                    onChange={(e) => setFormData({ ...formData, segmentLevel: e.target.value })}
                    placeholder="例: C5, 6"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">作用 (運動)</label>
                  <textarea
                    rows={2}
                    value={formData.action}
                    onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                    placeholder="例: 肘関節の屈曲, 前腕の回外, 肩関節の屈曲補助"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">画像URL (Google Drive共有リンクまたはWeb画像)</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full px-3 py-2 border rounded-lg font-mono text-[11px]"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    ※Googleドライブの「リンクを知っている全員」共有URLをそのまま貼り付けると自動で表示最適化されます。
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">臨床・国試ワンポイント（メモ）</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="例: 前腕回外位で最強の屈筋として作用する"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg transition-colors"
                >
                  筋肉を追加する
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: CSV Import */}
          {activeTab === 'csv' && (
            <div className="max-w-2xl mx-auto space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm mb-1">Googleスプレッドシート CSV一括取り込み</h3>
                <p className="text-slate-600 leading-relaxed">
                  スプレッドシートやApps Scriptで作成した以下の列構成のCSVテキストを貼り付けてインポートできます:
                </p>
                <div className="mt-2 p-2 bg-white rounded border border-slate-200 font-mono text-[11px] text-slate-700">
                  筋名,起始,停止,支配神経,髄節レベル,作用(運動),画像URL
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  追加先の領域（カテゴリー）
                </label>
                <select
                  value={csvCategory}
                  onChange={(e) => setCsvCategory(e.target.value as MuscleCategory)}
                  className="w-full px-3 py-2 border rounded-lg bg-white font-medium"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  CSVデータ貼り付け（ヘッダー行を含んでいても自動認識します）
                </label>
                <textarea
                  rows={8}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="鎖骨下筋,第1肋骨と第1肋軟骨,鎖骨の中央1/3の下面(鎖骨下筋溝),鎖骨下筋神経,&quot;C5, (6)&quot;,鎖骨を前下方に引く,https://drive.google.com/..."
                  className="w-full p-3 border rounded-lg font-mono text-[11px] leading-relaxed"
                />
              </div>

              {importStatus && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">{importStatus}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleRunCSVImport}
                  className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>CSVを取り込む</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Reset */}
          {activeTab === 'reset' && (
            <div className="max-w-md mx-auto text-center py-6 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">初期データにリセットしますか？</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                追加・編集した筋肉データや要復習マークをリセットし、教員様が指定された31筋の初期データに戻します。この操作は取り消せません。
              </p>
              <div className="pt-3 flex justify-center gap-3">
                <button
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => {
                    onResetMuscles();
                    onClose();
                  }}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg"
                >
                  初期状態に戻す
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
