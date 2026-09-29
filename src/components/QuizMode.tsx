import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  RotateCcw, 
  ArrowRight, 
  Award, 
  BookOpen, 
  ZoomIn, 
  ExternalLink,
  Zap,
  Activity,
  Layers,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Muscle, MuscleCategory, QuizType, QuizQuestion, CourseId } from '../types/muscle';
import { CATEGORIES } from '../data/initialMuscles';
import { getOptimizedImageUrl, getAnatomicalDiagramMeta } from '../utils/imageHelper';

interface QuizModeProps {
  muscles: Muscle[];
  currentCourse: CourseId;
  onGoToPortal: () => void;
  preselectedCategory?: MuscleCategory | 'all' | 'weakness';
  weaknessIds: Set<string>;
  onRecordWrongMuscle: (muscleId: string) => void;
  onClearWrongMuscle: (muscleId: string) => void;
  onOpenImageModal: (muscle: Muscle) => void;
  onGoToStudy: () => void;
}

export const QuizMode: React.FC<QuizModeProps> = ({
  muscles,
  currentCourse,
  onGoToPortal,
  preselectedCategory = 'all',
  weaknessIds,
  onRecordWrongMuscle,
  onClearWrongMuscle,
  onOpenImageModal,
  onGoToStudy
}) => {
  // Quiz setup states
  const [categoryFilter, setCategoryFilter] = useState<MuscleCategory | 'all' | 'weakness'>(preselectedCategory);
  const [quizType, setQuizType] = useState<QuizType>('all_random');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Active quiz states
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<Array<{
    question: QuizQuestion;
    userChoice: number;
    isCorrect: boolean;
  }>>([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Sync category if preselectedCategory changes
  useEffect(() => {
    if (preselectedCategory) {
      setCategoryFilter(preselectedCategory);
    }
  }, [preselectedCategory]);

  // Quiz Question Generator
  const generateQuestions = (pool: Muscle[], targetCount: number, type: QuizType): QuizQuestion[] => {
    if (pool.length === 0) return [];

    // Shuffle pool
    const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
    const count = Math.min(targetCount, shuffledPool.length);
    const selectedMuscles = shuffledPool.slice(0, count);

    const questionTypes: Array<'origin_insertion' | 'nerve_segment' | 'action' | 'muscle_name'> = [
      'origin_insertion',
      'nerve_segment',
      'action',
      'muscle_name'
    ];

    return selectedMuscles.map((muscle, idx) => {
      // Determine question type
      let qType: 'origin_insertion' | 'nerve_segment' | 'action' | 'muscle_name';
      if (type === 'all_random') {
        qType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
      } else {
        qType = type as 'origin_insertion' | 'nerve_segment' | 'action' | 'muscle_name';
      }

      // Generate correct text and distractors from all muscles
      let correctAnswer = '';
      let promptTitle = '';
      let promptSubtitle = '';

      switch (qType) {
        case 'origin_insertion':
          promptTitle = `【${muscle.name}】の『起始・停止』として正しいものはどれか？`;
          promptSubtitle = '図と筋名を手がかりに、解剖学的な起始・停止の組み合わせを選択してください。';
          correctAnswer = `起始: ${muscle.origin}\n停止: ${muscle.insertion}`;
          break;

        case 'nerve_segment':
          promptTitle = `【${muscle.name}】の『支配神経・髄節レベル』として正しいものはどれか？`;
          promptSubtitle = '運動神経支配および対応する脊髄髄節レベルを選択してください。';
          correctAnswer = muscle.segmentLevel 
            ? `${muscle.nerve} (${muscle.segmentLevel})` 
            : `${muscle.nerve}`;
          break;

        case 'action':
          promptTitle = `【${muscle.name}】の『筋の作用（運動）』として正しいものはどれか？`;
          promptSubtitle = '筋収縮に伴う主要な関節運動や吸息・固定作用を選択してください。';
          correctAnswer = muscle.action;
          break;

        case 'muscle_name':
        default:
          promptTitle = 'この解剖図および特徴を持つ「筋肉名」はどれか？';
          promptSubtitle = `【起始】${muscle.origin} ／ 【停止】${muscle.insertion}\n【神経】${muscle.nerve} ／ 【作用】${muscle.action}`;
          correctAnswer = muscle.name;
          break;
      }

      // Collect 3 distractor choices from other muscles
      const otherMuscles = muscles.filter(m => m.id !== muscle.id);
      const shuffledOthers = [...otherMuscles].sort(() => 0.5 - Math.random());

      const distractors: string[] = [];
      for (const other of shuffledOthers) {
        if (distractors.length >= 3) break;
        let dText = '';
        if (qType === 'origin_insertion') {
          dText = `起始: ${other.origin}\n停止: ${other.insertion}`;
        } else if (qType === 'nerve_segment') {
          dText = other.segmentLevel ? `${other.nerve} (${other.segmentLevel})` : other.nerve;
        } else if (qType === 'action') {
          dText = other.action;
        } else {
          dText = other.name;
        }

        // Avoid duplicate choices
        if (dText !== correctAnswer && !distractors.includes(dText)) {
          distractors.push(dText);
        }
      }

      // In case pool is very small, pad
      while (distractors.length < 3) {
        distractors.push(`（選択肢 ${distractors.length + 1}）`);
      }

      // Combine and shuffle choices
      const allChoices = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random());
      const correctIndex = allChoices.indexOf(correctAnswer);

      return {
        id: `q-${idx}-${muscle.id}`,
        muscle,
        type: qType,
        promptTitle,
        promptSubtitle,
        options: allChoices,
        correctIndex,
        explanation: {
          origin: muscle.origin,
          insertion: muscle.insertion,
          nerve: muscle.nerve,
          segmentLevel: muscle.segmentLevel,
          action: muscle.action
        }
      };
    });
  };

  const handleStartQuiz = (overrideWeaknessOnly = false) => {
    let pool = muscles;
    const cat = overrideWeaknessOnly ? 'weakness' : categoryFilter;

    if (cat === 'weakness') {
      pool = muscles.filter(m => weaknessIds.has(m.id));
      if (pool.length === 0) {
        alert('要復習（間違えた問題）の筋肉が登録されていません。通常のクイズを開始します。');
        pool = muscles;
      }
    } else if (cat !== 'all') {
      pool = muscles.filter(m => m.category === cat);
    }

    const generated = generateQuestions(pool, questionCount, quizType);
    if (generated.length === 0) return;

    setQuestions(generated);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setUserAnswers([]);
    setIsFinished(false);
    setIsPlaying(true);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const currentQ = questions[currentIndex];
    const isCorrect = idx === currentQ.correctIndex;

    setUserAnswers(prev => [
      ...prev,
      {
        question: currentQ,
        userChoice: idx,
        isCorrect
      }
    ]);

    if (isCorrect) {
      onClearWrongMuscle(currentQ.muscle.id);
    } else {
      onRecordWrongMuscle(currentQ.muscle.id);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      // Confetti on good score
      const correctCount = userAnswers.filter(a => a.isCorrect).length;
      const ratio = correctCount / questions.length;
      if (ratio >= 0.8) {
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }
      }
    }
  };

  // -------------------------------------------------------------
  // VIEW: Quiz Finished Summary
  // -------------------------------------------------------------
  if (isFinished) {
    const correctCount = userAnswers.filter(a => a.isCorrect).length;
    const scorePercent = Math.round((correctCount / questions.length) * 100);
    const wrongAnswers = userAnswers.filter(a => !a.isCorrect);

    let rankLabel = '可 (C)';
    let rankColor = 'text-slate-700 bg-slate-100';
    if (scorePercent === 100) {
      rankLabel = '満点合格！秀 (S+)';
      rankColor = 'text-emerald-800 bg-emerald-100';
    } else if (scorePercent >= 80) {
      rankLabel = '優秀！優 (S)';
      rankColor = 'text-teal-800 bg-teal-100';
    } else if (scorePercent >= 60) {
      rankLabel = '合格ライン！良 (B)';
      rankColor = 'text-indigo-800 bg-indigo-100';
    }

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Score Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 text-center shadow-xs">
          <div className="inline-flex p-3 bg-teal-50 rounded-2xl text-teal-700 mb-3">
            <Award className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">クイズ結果発表</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            出題範囲: {categoryFilter === 'all' ? '全31筋' : categoryFilter === 'weakness' ? '弱点特訓' : '選択カテゴリー'}
          </p>

          <div className="my-6 py-6 border-y border-slate-100 flex items-center justify-center gap-8">
            <div>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 tabular-nums">
                {correctCount}
                <span className="text-lg sm:text-xl font-normal text-slate-400"> / {questions.length}</span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">正解数</p>
            </div>
            <div className="h-12 w-px bg-slate-200"></div>
            <div>
              <div className="text-4xl sm:text-5xl font-black text-teal-700 tabular-nums">
                {scorePercent}%
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">正答率</p>
            </div>
          </div>

          <div className="inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-6">
            <span className={`px-3 py-1 rounded-full ${rankColor}`}>{rankLabel}</span>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => handleStartQuiz()}
              className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>もう一度挑戦する</span>
            </button>

            {wrongAnswers.length > 0 && (
              <button
                onClick={() => handleStartQuiz(true)}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-colors flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>間違えた問題({wrongAnswers.length}問)だけ復習</span>
              </button>
            )}

            <button
              onClick={onGoToStudy}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm rounded-lg transition-colors flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>図鑑でじっくり確認する</span>
            </button>
          </div>
        </div>

        {/* Detailed Review of Each Question */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>回答の振り返りと解説</span>
            <span className="text-xs font-normal text-slate-500">（全{questions.length}問）</span>
          </h3>

          <div className="divide-y divide-slate-100 space-y-4">
            {userAnswers.map((item, i) => {
              const q = item.question;
              return (
                <div key={q.id} className="pt-4 first:pt-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 shrink-0">
                        {item.isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-600" />
                        )}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-500">第 {i + 1} 問</span>
                          <span className="text-sm font-bold text-slate-900">{q.muscle.name}</span>
                          <span className="text-xs text-slate-500 font-medium">({q.muscle.category === 'shoulder_thorax' ? '肩甲帯・胸郭' : q.muscle.category === 'pelvis_lower' ? '骨盤・下肢' : '頸部・舌骨'})</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-700 mt-0.5">{q.promptTitle}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenImageModal(q.muscle)}
                      className="text-xs text-teal-700 hover:text-teal-900 font-semibold shrink-0"
                    >
                      図を見る
                    </button>
                  </div>

                  {/* Options check */}
                  <div className="mt-3 ml-7 space-y-1.5 text-xs">
                    {!item.isCorrect && (
                      <div className="p-2 rounded bg-rose-50 border border-rose-100 text-rose-900">
                        <span className="font-bold text-rose-700 mr-1.5">あなたの回答:</span>
                        <span className="whitespace-pre-line">{q.options[item.userChoice]}</span>
                      </div>
                    )}
                    <div className="p-2 rounded bg-emerald-50 border border-emerald-100 text-emerald-900">
                      <span className="font-bold text-emerald-700 mr-1.5">正解:</span>
                      <span className="whitespace-pre-line font-medium">{q.options[q.correctIndex]}</span>
                    </div>

                    {/* Explanatory breakdown */}
                    <div className="p-2.5 bg-slate-50 rounded text-slate-700 mt-2 space-y-1 text-[11px] leading-relaxed border border-slate-100">
                      <div><strong className="text-slate-900">【起始】</strong>{q.explanation.origin}</div>
                      <div><strong className="text-slate-900">【停止】</strong>{q.explanation.insertion}</div>
                      <div>
                        <strong className="text-slate-900">【支配神経】</strong>{q.explanation.nerve}
                        {q.explanation.segmentLevel && ` (${q.explanation.segmentLevel})`}
                      </div>
                      <div><strong className="text-slate-900">【作用】</strong>{q.explanation.action}</div>
                      {q.muscle.notes && (
                        <div className="text-amber-800 pt-0.5 border-t border-slate-200">
                          <strong>【国試・臨床ポイント】</strong> {q.muscle.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: Playing Active Quiz
  // -------------------------------------------------------------
  if (isPlaying && questions.length > 0) {
    const currentQ = questions[currentIndex];
    const muscle = currentQ.muscle;
    const { primaryUrl, driveViewUrl } = getOptimizedImageUrl(muscle.imageUrl);
    const diagramMeta = getAnatomicalDiagramMeta(muscle.name, muscle.category);
    const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

    return (
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Top Progress & Quit */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3">
            <span className="text-teal-700 font-bold">
              第 <span className="text-base tabular-nums">{currentIndex + 1}</span> / {questions.length} 問
            </span>
            <div className="w-32 sm:w-48 bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-teal-600 h-2 rounded-full transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          <button
            onClick={() => setIsPlaying(false)}
            className="text-slate-400 hover:text-slate-700 text-xs font-medium"
          >
            クイズを中断
          </button>
        </div>

        {/* Question Board */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          {/* Question Title */}
          <div className="p-4 sm:p-6 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/50">
                {currentQ.type === 'origin_insertion' 
                  ? '起始・停止' 
                  : currentQ.type === 'nerve_segment' 
                  ? '支配神経・髄節' 
                  : currentQ.type === 'action' 
                  ? '筋の作用' 
                  : '筋肉名'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {muscle.category === 'shoulder_thorax' 
                  ? '肩甲帯・胸郭' 
                  : muscle.category === 'pelvis_lower' 
                  ? '骨盤・股関節' 
                  : '頸部・舌骨'}
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {currentQ.promptTitle}
            </h2>
            {currentQ.promptSubtitle && (
              <p className="text-xs text-slate-500 mt-1 whitespace-pre-line leading-relaxed">
                {currentQ.promptSubtitle}
              </p>
            )}
          </div>

          {/* Muscle Anatomy Diagram Figure Box */}
          <div className="bg-slate-50 p-4 border-b border-slate-100">
            <div className="relative max-w-sm mx-auto h-48 sm:h-56 rounded-lg bg-white border border-slate-200/80 overflow-hidden flex items-center justify-center shadow-2xs">
              {primaryUrl ? (
                <img
                  src={primaryUrl}
                  alt={`${muscle.name}の筋肉図`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="p-4 text-center">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-1">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">{muscle.name}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">{diagramMeta.region}</p>
                </div>
              )}

              {/* Zoom action */}
              <button
                onClick={() => onOpenImageModal(muscle)}
                className="absolute bottom-2 right-2 px-2.5 py-1 bg-slate-900/80 hover:bg-slate-900 text-white text-[11px] font-medium rounded-md shadow-xs flex items-center gap-1 backdrop-blur-xs transition-colors"
                title="高解像度拡大図を見る"
              >
                <ZoomIn className="w-3 h-3" />
                <span>拡大図</span>
              </button>
            </div>
          </div>

          {/* 4 Choices */}
          <div className="p-4 sm:p-6 space-y-3">
            <p className="text-xs font-bold text-slate-500 mb-1">4つの選択肢から選んでください：</p>
            {currentQ.options.map((option, idx) => {
              const optionLetter = ['A', 'B', 'C', 'D'][idx];
              let optionStyle = 'bg-white border-slate-200 hover:border-teal-500 hover:bg-teal-50/20 text-slate-800';

              if (isAnswered) {
                if (idx === currentQ.correctIndex) {
                  optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500 font-semibold';
                } else if (idx === selectedOption) {
                  optionStyle = 'bg-rose-50 border-rose-500 text-rose-950 ring-1 ring-rose-500';
                } else {
                  optionStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`w-full text-left p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm transition-all duration-150 flex items-start gap-3 ${optionStyle}`}
                >
                  <span className={`w-6 h-6 rounded-lg text-xs font-bold shrink-0 flex items-center justify-center border ${
                    isAnswered && idx === currentQ.correctIndex
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : isAnswered && idx === selectedOption
                      ? 'bg-rose-600 border-rose-600 text-white'
                      : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}>
                    {optionLetter}
                  </span>
                  <span className="flex-1 whitespace-pre-line leading-relaxed">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Immediate Feedback & Explanatory Accordion */}
          {isAnswered && (
            <div className={`p-4 sm:p-6 border-t ${
              selectedOption === currentQ.correctIndex
                ? 'bg-emerald-50/60 border-emerald-200'
                : 'bg-rose-50/60 border-rose-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {selectedOption === currentQ.correctIndex ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-bold text-emerald-800">正解！ よく覚えています！</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-600" />
                      <span className="text-sm font-bold text-rose-800">不正解... 次回確実に覚えましょう！</span>
                    </>
                  )}
                </div>

                <button
                  onClick={handleNextQuestion}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <span>{currentIndex < questions.length - 1 ? '次の問題へ' : '結果を見る'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Anatomy details card */}
              <div className="bg-white rounded-lg p-3.5 border border-slate-200/80 text-xs text-slate-800 space-y-1.5 shadow-2xs">
                <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 mb-1">
                  【{muscle.name}の解剖学まとめ】
                </div>
                <div><span className="font-semibold text-slate-600">起始:</span> {currentQ.explanation.origin}</div>
                <div><span className="font-semibold text-slate-600">停止:</span> {currentQ.explanation.insertion}</div>
                <div>
                  <span className="font-semibold text-slate-600">支配神経:</span> {currentQ.explanation.nerve}
                  {currentQ.explanation.segmentLevel && (
                    <span className="ml-1 text-indigo-700 font-mono font-semibold">({currentQ.explanation.segmentLevel})</span>
                  )}
                </div>
                <div><span className="font-semibold text-slate-600">作用:</span> {currentQ.explanation.action}</div>
                {muscle.notes && (
                  <div className="text-amber-800 bg-amber-50 p-2 rounded mt-2 border border-amber-200/60 leading-relaxed">
                    <span className="font-bold">臨床・国試ポイント:</span> {muscle.notes}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: Quiz Mode Launcher / Setup Screen
  // -------------------------------------------------------------
  const weaknessCount = muscles.filter(m => weaknessIds.has(m.id)).length;

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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Intro Box */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
            <span className="text-xs font-bold text-teal-800">{courseTitle} 暗記実戦テスト</span>
          </div>

          <button
            onClick={onGoToPortal}
            className="text-xs text-slate-500 hover:text-teal-700 font-semibold"
          >
            ← 分野選択に戻る
          </button>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          {courseTitle} 筋肉暗記クイズ＆実戦テスト
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
          筋肉名と解剖図を見て、起始・停止、支配神経・髄節レベル、筋の作用を4択から解答します。
          間違えた筋肉は自動的に「弱点リスト」に記録され、効率的な反復復習が可能です。
        </p>

        {/* 1. Category Selection */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 mb-2">
            1. 出題する筋肉の領域（カテゴリー）
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`p-3 rounded-lg border text-left text-xs font-medium transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-teal-50 border-teal-500 text-teal-900 ring-1 ring-teal-500'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="font-bold text-slate-900">{courseTitle} 全筋 ({muscles.length}筋)</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{courseTitle}の全範囲から出題</div>
            </button>

            {courseCategories.map(cat => {
              const count = muscles.filter(m => m.category === cat.id).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`p-3 rounded-lg border text-left text-xs font-medium transition-colors ${
                    categoryFilter === cat.id
                      ? 'bg-teal-50 border-teal-500 text-teal-900 ring-1 ring-teal-500'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-bold text-slate-900">{cat.name} ({count}筋)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{cat.description}</div>
                </button>
              );
            })}

            <button
              onClick={() => setCategoryFilter('weakness')}
              className={`p-3 rounded-lg border text-left text-xs font-medium transition-colors sm:col-span-2 ${
                categoryFilter === 'weakness'
                  ? 'bg-rose-50 border-rose-500 text-rose-900 ring-1 ring-rose-500'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="font-bold text-rose-700 flex items-center justify-between">
                <span>弱点特訓（間違えた筋肉のみ）</span>
                <span className="text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold">
                  {weaknessCount} 筋登録中
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                過去のクイズで間違えた筋肉や要復習マークを優先して克服
              </div>
            </button>
          </div>
        </div>

        {/* 2. Quiz Question Type */}
        <div className="mt-5">
          <label className="block text-xs font-bold text-slate-700 mb-2">
            2. 出題形式（テストする項目）
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => setQuizType('all_random')}
              className={`p-2.5 rounded-lg border text-left transition-colors ${
                quizType === 'all_random'
                  ? 'bg-teal-50 border-teal-500 text-teal-900 font-semibold ring-1 ring-teal-500'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="font-bold text-slate-900">総合模試（ランダム出題）</div>
              <div className="text-[11px] text-slate-500">起始停止・神経・作用をミックス</div>
            </button>

            <button
              onClick={() => setQuizType('origin_insertion')}
              className={`p-2.5 rounded-lg border text-left transition-colors ${
                quizType === 'origin_insertion'
                  ? 'bg-teal-50 border-teal-500 text-teal-900 font-semibold ring-1 ring-teal-500'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="font-bold text-slate-900">起始・停止テスト</div>
              <div className="text-[11px] text-slate-500">筋名・図から起始停止を選択</div>
            </button>

            <button
              onClick={() => setQuizType('nerve_segment')}
              className={`p-2.5 rounded-lg border text-left transition-colors ${
                quizType === 'nerve_segment'
                  ? 'bg-teal-50 border-teal-500 text-teal-900 font-semibold ring-1 ring-teal-500'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="font-bold text-slate-900">支配神経・髄節テスト</div>
              <div className="text-[11px] text-slate-500">筋名・図から神経と髄節を選択</div>
            </button>

            <button
              onClick={() => setQuizType('action')}
              className={`p-2.5 rounded-lg border text-left transition-colors ${
                quizType === 'action'
                  ? 'bg-teal-50 border-teal-500 text-teal-900 font-semibold ring-1 ring-teal-500'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="font-bold text-slate-900">筋の作用（運動）テスト</div>
              <div className="text-[11px] text-slate-500">筋名・図から関節運動を選択</div>
            </button>
          </div>
        </div>

        {/* 3. Question Count */}
        <div className="mt-5">
          <label className="block text-xs font-bold text-slate-700 mb-2">
            3. 問題数
          </label>
          <div className="flex items-center gap-2">
            {[5, 10, 20, 31].map(num => (
              <button
                key={num}
                onClick={() => setQuestionCount(num)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${
                  questionCount === num
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {num === 31 ? '全問 (31問)' : `${num}問`}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="mt-8">
          <button
            onClick={() => handleStartQuiz()}
            className="w-full py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>暗記クイズを開始する</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
