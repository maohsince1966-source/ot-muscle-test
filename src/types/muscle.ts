export type CourseId = 'upper' | 'lower' | 'trunk_neck' | 'all';

export interface CourseInfo {
  id: CourseId;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  themeColor: string;
  categories: string[];
}

export type MuscleCategory = 
  // 上肢編
  | 'shoulder_thorax' 
  | 'shoulder_joint' 
  | 'arm' 
  | 'forearm' 
  | 'hand'
  // 下肢編
  | 'pelvis_lower' 
  | 'thigh' 
  | 'leg_foot'
  // 頭頸部・体幹編
  | 'head_neck' 
  | 'trunk'
  | 'custom';

export interface CategoryInfo {
  id: MuscleCategory;
  name: string;
  shortName: string;
  course: 'upper' | 'lower' | 'trunk_neck';
  description: string;
  color: string;
  badgeBg: string;
  badgeText: string;
}

export interface Muscle {
  id: string;
  name: string;
  kana?: string;
  english?: string;
  course: 'upper' | 'lower' | 'trunk_neck';
  category: MuscleCategory;
  origin: string;        // 起始
  insertion: string;     // 停止
  nerve: string;         // 支配神経
  segmentLevel: string;  // 髄節レベル
  action: string;        // 作用 (運動)
  imageUrl: string;      // 画像URL (Google DriveまたはWeb画像)
  notes?: string;        // メモ・ポイント
}

export type QuizType = 
  | 'origin_insertion'  // 筋名・図から起始・停止を答える
  | 'nerve_segment'     // 支配神経・髄節レベルを答える
  | 'action'            // 筋の作用を答える
  | 'muscle_name'       // 作用や起始停止から筋名を答える
  | 'all_random';       // 総合ランダムテスト

export type QuizFormat = 'multiple_choice' | 'flashcard';

export interface QuizQuestion {
  id: string;
  muscle: Muscle;
  type: 'origin_insertion' | 'nerve_segment' | 'action' | 'muscle_name';
  promptTitle: string;
  promptSubtitle?: string;
  options: string[];
  correctIndex: number;
  explanation: {
    origin: string;
    insertion: string;
    nerve: string;
    segmentLevel: string;
    action: string;
  };
}

export interface QuizResultRecord {
  timestamp: number;
  score: number;
  total: number;
  category: string;
  quizType: string;
  wrongMuscleIds: string[];
}
