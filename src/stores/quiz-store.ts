import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Quiz,
  QuizAttempt,
  ExtractedDocument,
  Passage,
  QuestionResult,
} from '@/types/quiz';
import { AnswerId, Question, QuestionType } from '@/types/question';
import { UserProgress, createInitialProgress } from '@/types/progress';
import { SRSItem, SRSGrade, DEFAULT_EASE_FACTOR, calculateNextInterval } from '@/types/srs';
import { AVAILABLE_BADGES, UnlockedBadge, UserGoal, generateWeeklyChallenge, getCurrentWeek } from '@/types/gamification';
import { SavedPassage, CATEGORY_TO_GENRE } from '@/types/passage-library';
import { TextCategory } from '@/lib/text-library';
import { detectGenre } from '@/lib/question-selection';

// Migration map for old question types to new ones
const QUESTION_TYPE_MIGRATION: Record<string, QuestionType> = {
  // Old types that need migration
  'comprehension-analysis': 'central-ideas',
  'grammar-editing': 'boundaries',
  'expression-of-ideas': 'rhetorical-synthesis',
  // Types that still exist (no migration needed, but included for completeness)
  'words-in-context': 'words-in-context',
  'central-ideas': 'central-ideas',
  'inferences': 'inferences',
  'command-of-evidence': 'command-of-evidence',
  'text-structure-purpose': 'text-structure-purpose',
  'cross-text-connections': 'cross-text-connections',
  'rhetorical-synthesis': 'rhetorical-synthesis',
  'transitions': 'transitions',
  'boundaries': 'boundaries',
  'form-structure-sense': 'form-structure-sense',
};

// Check and unlock badges based on current progress
function checkAndUnlockBadges(
  progress: UserProgress,
  isPerfectQuiz: boolean
): UnlockedBadge[] {
  const today = new Date().toISOString().split('T')[0];
  const alreadyUnlocked = new Set(progress.unlockedBadges.map((b) => b.badgeId));
  const newlyUnlocked: UnlockedBadge[] = [];

  for (const badge of AVAILABLE_BADGES) {
    if (alreadyUnlocked.has(badge.id)) continue;

    let unlocked = false;
    const condition = badge.condition;

    switch (condition.type) {
      case 'quizzes_completed':
        unlocked = progress.totalQuizzesTaken >= condition.count;
        break;
      case 'streak_days':
        unlocked = progress.studyStreak >= condition.count;
        break;
      case 'accuracy_percent':
        unlocked = progress.overallAccuracy >= condition.value && progress.totalQuestionsAnswered >= 10;
        break;
      case 'questions_answered':
        unlocked = progress.totalQuestionsAnswered >= condition.count;
        break;
      case 'perfect_quiz':
        unlocked = isPerfectQuiz;
        break;
      case 'srs_reviews':
        unlocked = progress.srsReviewCount >= condition.count;
        break;
    }

    if (unlocked) {
      newlyUnlocked.push({ badgeId: badge.id, unlockedAt: today });
    }
  }

  return newlyUnlocked;
}

// Valid question types set for quick lookup
const VALID_QUESTION_TYPES = new Set<QuestionType>([
  'central-ideas',
  'inferences',
  'command-of-evidence',
  'words-in-context',
  'text-structure-purpose',
  'cross-text-connections',
  'rhetorical-synthesis',
  'transitions',
  'boundaries',
  'form-structure-sense',
]);

// Migrate old progress data to new question types
function migrateProgress(oldProgress: UserProgress): UserProgress {
  const newProgress = createInitialProgress();

  // Copy non-type-specific data
  newProgress.totalQuizzesTaken = oldProgress.totalQuizzesTaken || 0;
  newProgress.totalQuestionsAnswered = oldProgress.totalQuestionsAnswered || 0;
  newProgress.overallAccuracy = oldProgress.overallAccuracy || 0;
  newProgress.recentScores = oldProgress.recentScores || [];
  newProgress.studyStreak = oldProgress.studyStreak || 0;
  newProgress.lastStudyDate = oldProgress.lastStudyDate || '';
  newProgress.quizHistory = oldProgress.quizHistory || [];
  newProgress.srsQueue = oldProgress.srsQueue || [];
  newProgress.unlockedBadges = oldProgress.unlockedBadges || [];
  newProgress.weeklyChallenge = oldProgress.weeklyChallenge || null;
  newProgress.goals = oldProgress.goals || [];
  newProgress.srsReviewCount = oldProgress.srsReviewCount || 0;

  // Migrate accuracyByType
  if (oldProgress.accuracyByType) {
    for (const [oldType, stats] of Object.entries(oldProgress.accuracyByType)) {
      const newType = QUESTION_TYPE_MIGRATION[oldType];
      if (newType && VALID_QUESTION_TYPES.has(newType) && stats) {
        newProgress.accuracyByType[newType].correct += stats.correct || 0;
        newProgress.accuracyByType[newType].total += stats.total || 0;
      }
    }
  }

  return newProgress;
}

interface QuizStore {
  // Documents
  documents: ExtractedDocument[];
  addDocument: (doc: ExtractedDocument) => void;
  removeDocument: (id: string) => void;
  updatePassageSelection: (docId: string, passageId: string, selected: boolean) => void;

  // Quizzes
  quizzes: Quiz[];
  addQuiz: (quiz: Quiz) => void;
  removeQuiz: (id: string) => void;
  getQuiz: (id: string) => Quiz | undefined;

  // Active Quiz Session
  activeQuizId: string | null;
  currentQuestionIndex: number;
  answers: Record<string, AnswerId>;
  flaggedQuestions: string[];
  startTime: number | null;
  examMode: boolean;
  timeLimit: number | null; // in seconds, null = no limit

  startQuiz: (quizId: string) => void;
  startQuizWithTimer: (quizId: string, timeLimit: number | null) => void;
  setAnswer: (questionId: string, answer: AnswerId) => void;
  toggleFlagged: (questionId: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  submitQuiz: () => QuizAttempt | null;
  resetQuizSession: () => void;

  // Progress
  progress: UserProgress;
  updateProgress: (attempt: QuizAttempt, questions: Question[]) => void;
  resetProgress: () => void;

  // SRS (Spaced Repetition)
  addToSRS: (questionId: string, quizId: string) => void;
  reviewSRS: (questionId: string, grade: SRSGrade) => void;
  getSRSDueToday: () => SRSItem[];
  removeFromSRS: (questionId: string) => void;

  // Gamification
  addGoal: (goal: Omit<UserGoal, 'id' | 'current' | 'completed'>) => void;
  removeGoal: (goalId: string) => void;
  getUnlockedBadgeIds: () => string[];

  // Passage Library
  passageLibrary: SavedPassage[];
  addPassageToLibrary: (passage: Omit<SavedPassage, 'id' | 'timesUsed' | 'questionsGenerated' | 'savedAt'>) => void;
  addPassagesToLibrary: (passages: Array<Omit<SavedPassage, 'id' | 'timesUsed' | 'questionsGenerated' | 'savedAt'>>) => void;
  removePassageFromLibrary: (passageId: string) => void;
  markPassageUsed: (passageId: string, questionId?: string) => void;
  getPassageById: (passageId: string) => SavedPassage | undefined;
  getUnusedPassages: () => SavedPassage[];
  clearPassageLibrary: () => void;

  // Sync setters (for cloud sync)
  setDocuments: (documents: ExtractedDocument[]) => void;
  setQuizzes: (quizzes: Quiz[]) => void;
  setUserProgress: (progress: UserProgress) => void;
  setPassageLibrary: (passages: SavedPassage[]) => void;
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      // Documents
      documents: [],
      addDocument: (doc) =>
        set((state) => ({ documents: [...state.documents, doc] })),
      removeDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
        })),
      updatePassageSelection: (docId, passageId, selected) =>
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === docId
              ? {
                  ...doc,
                  passages: doc.passages.map((p) =>
                    p.id === passageId ? { ...p, selected } : p
                  ),
                }
              : doc
          ),
        })),

      // Quizzes
      quizzes: [],
      addQuiz: (quiz) =>
        set((state) => ({ quizzes: [...state.quizzes, quiz] })),
      removeQuiz: (id) =>
        set((state) => ({
          quizzes: state.quizzes.filter((q) => q.id !== id),
        })),
      getQuiz: (id) => get().quizzes.find((q) => q.id === id),

      // Active Quiz Session
      activeQuizId: null,
      currentQuestionIndex: 0,
      answers: {},
      flaggedQuestions: [],
      startTime: null,
      examMode: false,
      timeLimit: null,

      startQuiz: (quizId) =>
        set({
          activeQuizId: quizId,
          currentQuestionIndex: 0,
          answers: {},
          flaggedQuestions: [],
          startTime: Date.now(),
          examMode: false,
          timeLimit: null,
        }),

      startQuizWithTimer: (quizId, timeLimit) =>
        set({
          activeQuizId: quizId,
          currentQuestionIndex: 0,
          answers: {},
          flaggedQuestions: [],
          startTime: Date.now(),
          examMode: timeLimit !== null,
          timeLimit,
        }),

      setAnswer: (questionId, answer) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: answer },
        })),

      toggleFlagged: (questionId) =>
        set((state) => ({
          flaggedQuestions: state.flaggedQuestions.includes(questionId)
            ? state.flaggedQuestions.filter((id) => id !== questionId)
            : [...state.flaggedQuestions, questionId],
        })),

      nextQuestion: () =>
        set((state) => {
          const quiz = get().getQuiz(state.activeQuizId || '');
          if (!quiz) return state;
          const maxIndex = quiz.questions.length - 1;
          return {
            currentQuestionIndex: Math.min(
              state.currentQuestionIndex + 1,
              maxIndex
            ),
          };
        }),

      previousQuestion: () =>
        set((state) => ({
          currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
        })),

      goToQuestion: (index) => set({ currentQuestionIndex: index }),

      submitQuiz: () => {
        const state = get();
        const quiz = state.getQuiz(state.activeQuizId || '');
        if (!quiz || !state.startTime) return null;

        const questionResults: QuestionResult[] = quiz.questions.map((q) => ({
          questionId: q.id,
          selectedAnswer: state.answers[q.id] || null, // null = unanswered
          isCorrect: state.answers[q.id] === q.correctAnswer,
          timeSpent: 0,
        }));

        const correctCount = questionResults.filter((r) => r.isCorrect).length;
        const attempt: QuizAttempt = {
          id: crypto.randomUUID(),
          quizId: quiz.id,
          answers: state.answers,
          score: correctCount,
          totalQuestions: quiz.questions.length,
          timeSpent: Math.floor((Date.now() - state.startTime) / 1000),
          completedAt: new Date(),
          questionResults,
        };

        // Update progress
        get().updateProgress(attempt, quiz.questions);

        return attempt;
      },

      resetQuizSession: () =>
        set({
          activeQuizId: null,
          currentQuestionIndex: 0,
          answers: {},
          flaggedQuestions: [],
          startTime: null,
          examMode: false,
          timeLimit: null,
        }),

      // Progress
      progress: createInitialProgress(),

      updateProgress: (attempt, questions) =>
        set((state) => {
          const newProgress = { ...state.progress };

          // Update totals
          newProgress.totalQuizzesTaken += 1;
          newProgress.totalQuestionsAnswered += attempt.totalQuestions;

          // Update accuracy by type
          questions.forEach((q) => {
            const result = attempt.questionResults.find(
              (r) => r.questionId === q.id
            );
            if (result) {
              // Handle migration of old question types
              const qType = QUESTION_TYPE_MIGRATION[q.type] || q.type;
              if (VALID_QUESTION_TYPES.has(qType as QuestionType)) {
                newProgress.accuracyByType[qType as QuestionType].total += 1;
                if (result.isCorrect) {
                  newProgress.accuracyByType[qType as QuestionType].correct += 1;
                }
              }
            }
          });

          // Calculate overall accuracy
          const totalCorrect = Object.values(newProgress.accuracyByType).reduce(
            (sum, cat) => sum + cat.correct,
            0
          );
          const totalAnswered = Object.values(newProgress.accuracyByType).reduce(
            (sum, cat) => sum + cat.total,
            0
          );
          newProgress.overallAccuracy =
            totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;

          // Update recent scores
          const scorePercent = (attempt.score / attempt.totalQuestions) * 100;
          newProgress.recentScores = [
            scorePercent,
            ...newProgress.recentScores.slice(0, 9),
          ];

          // Update streak
          const today = new Date().toISOString().split('T')[0];
          const lastDate = newProgress.lastStudyDate;
          if (lastDate === today) {
            // Same day, streak unchanged
          } else if (lastDate) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            if (lastDate === yesterdayStr) {
              newProgress.studyStreak += 1;
            } else {
              newProgress.studyStreak = 1;
            }
          } else {
            newProgress.studyStreak = 1;
          }
          newProgress.lastStudyDate = today;

          // Add to history
          newProgress.quizHistory = [
            attempt,
            ...newProgress.quizHistory.slice(0, 49),
          ];

          // Auto-add incorrect questions to SRS queue
          questions.forEach((q) => {
            const result = attempt.questionResults.find((r) => r.questionId === q.id);
            if (result && !result.isCorrect) {
              // Check if not already in queue
              if (!newProgress.srsQueue.find((item) => item.questionId === q.id)) {
                newProgress.srsQueue.push({
                  questionId: q.id,
                  quizId: attempt.quizId,
                  interval: 1,
                  easeFactor: DEFAULT_EASE_FACTOR,
                  repetitions: 0,
                  nextReview: today,
                  lastReview: today,
                });
              }
            }
          });

          // Check for perfect quiz
          const isPerfectQuiz = attempt.score === attempt.totalQuestions;

          // Check and unlock badges
          const newBadges = checkAndUnlockBadges(newProgress, isPerfectQuiz);
          if (newBadges.length > 0) {
            newProgress.unlockedBadges = [...newProgress.unlockedBadges, ...newBadges];
          }

          // Update weekly challenge if exists
          if (newProgress.weeklyChallenge) {
            const challenge = newProgress.weeklyChallenge;
            const currentWeek = getCurrentWeek();

            // Reset if new week
            if (challenge.week !== currentWeek) {
              newProgress.weeklyChallenge = generateWeeklyChallenge();
            } else if (!challenge.completed) {
              // Update progress based on challenge type
              switch (challenge.type) {
                case 'quizzes':
                  challenge.current += 1;
                  break;
                case 'questions':
                  challenge.current += attempt.totalQuestions;
                  break;
              }

              if (challenge.current >= challenge.target) {
                challenge.completed = true;
              }
            }
          } else {
            // Initialize weekly challenge
            newProgress.weeklyChallenge = generateWeeklyChallenge();
          }

          // Update goals
          newProgress.goals = newProgress.goals.map((goal) => {
            if (goal.completed) return goal;

            let newCurrent = goal.current;
            switch (goal.type) {
              case 'quizzes':
                newCurrent += 1;
                break;
              case 'score':
                newCurrent = Math.max(newCurrent, scorePercent);
                break;
              case 'streak':
                newCurrent = newProgress.studyStreak;
                break;
            }

            return {
              ...goal,
              current: newCurrent,
              completed: newCurrent >= goal.target,
            };
          });

          return { progress: newProgress };
        }),

      resetProgress: () => set({ progress: createInitialProgress() }),

      // SRS Methods
      addToSRS: (questionId, quizId) =>
        set((state) => {
          // Check if already in queue
          if (state.progress.srsQueue.find((item) => item.questionId === questionId)) {
            return state;
          }

          const today = new Date().toISOString().split('T')[0];
          const newItem: SRSItem = {
            questionId,
            quizId,
            interval: 1,
            easeFactor: DEFAULT_EASE_FACTOR,
            repetitions: 0,
            nextReview: today, // Due immediately
            lastReview: today,
          };

          return {
            progress: {
              ...state.progress,
              srsQueue: [...state.progress.srsQueue, newItem],
            },
          };
        }),

      reviewSRS: (questionId, grade) =>
        set((state) => {
          const item = state.progress.srsQueue.find((i) => i.questionId === questionId);
          if (!item) return state;

          const { interval, easeFactor, repetitions } = calculateNextInterval(
            item.interval,
            item.easeFactor,
            grade,
            item.repetitions
          );

          const today = new Date();
          const nextReview = new Date(today);
          nextReview.setDate(nextReview.getDate() + interval);

          const updatedItem: SRSItem = {
            ...item,
            interval,
            easeFactor,
            repetitions,
            nextReview: nextReview.toISOString().split('T')[0],
            lastReview: today.toISOString().split('T')[0],
          };

          const newSrsReviewCount = state.progress.srsReviewCount + 1;

          // Check for SRS badges
          const newBadges = checkAndUnlockBadges(
            { ...state.progress, srsReviewCount: newSrsReviewCount },
            false
          );

          return {
            progress: {
              ...state.progress,
              srsQueue: state.progress.srsQueue.map((i) =>
                i.questionId === questionId ? updatedItem : i
              ),
              srsReviewCount: newSrsReviewCount,
              unlockedBadges: newBadges.length > 0
                ? [...state.progress.unlockedBadges, ...newBadges]
                : state.progress.unlockedBadges,
            },
          };
        }),

      getSRSDueToday: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        return state.progress.srsQueue.filter((item) => item.nextReview <= today);
      },

      removeFromSRS: (questionId) =>
        set((state) => ({
          progress: {
            ...state.progress,
            srsQueue: state.progress.srsQueue.filter((i) => i.questionId !== questionId),
          },
        })),

      // Gamification Methods
      addGoal: (goal) =>
        set((state) => ({
          progress: {
            ...state.progress,
            goals: [
              ...state.progress.goals,
              {
                ...goal,
                id: `goal-${Date.now()}`,
                current: 0,
                completed: false,
              },
            ],
          },
        })),

      removeGoal: (goalId) =>
        set((state) => ({
          progress: {
            ...state.progress,
            goals: state.progress.goals.filter((g) => g.id !== goalId),
          },
        })),

      getUnlockedBadgeIds: () => {
        return get().progress.unlockedBadges.map((b) => b.badgeId);
      },

      // Passage Library Methods
      passageLibrary: [],

      addPassageToLibrary: (passage) =>
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          const newPassage: SavedPassage = {
            ...passage,
            id: `passage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timesUsed: 0,
            questionsGenerated: [],
            savedAt: today,
          };
          return {
            passageLibrary: [...state.passageLibrary, newPassage],
          };
        }),

      addPassagesToLibrary: (passages) =>
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          const newPassages: SavedPassage[] = passages.map((passage, index) => ({
            ...passage,
            id: `passage-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
            timesUsed: 0,
            questionsGenerated: [],
            savedAt: today,
          }));
          return {
            passageLibrary: [...state.passageLibrary, ...newPassages],
          };
        }),

      removePassageFromLibrary: (passageId) =>
        set((state) => ({
          passageLibrary: state.passageLibrary.filter((p) => p.id !== passageId),
        })),

      markPassageUsed: (passageId, questionId) =>
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          return {
            passageLibrary: state.passageLibrary.map((p) =>
              p.id === passageId
                ? {
                    ...p,
                    timesUsed: p.timesUsed + 1,
                    questionsGenerated: questionId
                      ? [...p.questionsGenerated, questionId]
                      : p.questionsGenerated,
                    lastUsedAt: today,
                  }
                : p
            ),
          };
        }),

      getPassageById: (passageId) => {
        return get().passageLibrary.find((p) => p.id === passageId);
      },

      getUnusedPassages: () => {
        return get().passageLibrary.filter((p) => p.timesUsed === 0);
      },

      clearPassageLibrary: () => set({ passageLibrary: [] }),

      // Sync setters
      setDocuments: (documents) => set({ documents }),
      setQuizzes: (quizzes) => set({ quizzes }),
      setUserProgress: (progress) => set({ progress }),
      setPassageLibrary: (passageLibrary) => set({ passageLibrary }),
    }),
    {
      name: 'sat-erw-storage',
      version: 4, // Increment version to trigger migration
      partialize: (state) => ({
        documents: state.documents,
        quizzes: state.quizzes,
        progress: state.progress,
        passageLibrary: state.passageLibrary,
        // Session state - allows resuming after page reload
        activeQuizId: state.activeQuizId,
        currentQuestionIndex: state.currentQuestionIndex,
        answers: state.answers,
        flaggedQuestions: state.flaggedQuestions,
        startTime: state.startTime,
        examMode: state.examMode,
        timeLimit: state.timeLimit,
      }),
      // Migrate old data on version change
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Partial<QuizStore>;

        if (version < 2 && state.progress) {
          // Migrate from v1 (old question types) to v2 (new question types)
          state.progress = migrateProgress(state.progress);
        }

        if (version < 3 && state.progress) {
          // Migrate to v3: add SRS and gamification fields
          state.progress = {
            ...state.progress,
            srsQueue: state.progress.srsQueue || [],
            unlockedBadges: state.progress.unlockedBadges || [],
            weeklyChallenge: state.progress.weeklyChallenge || null,
            goals: state.progress.goals || [],
            srsReviewCount: state.progress.srsReviewCount || 0,
          };
        }

        if (version < 4) {
          // Migrate to v4: add passage library
          state.passageLibrary = state.passageLibrary || [];
        }

        return state as QuizStore;
      },
    }
  )
);
