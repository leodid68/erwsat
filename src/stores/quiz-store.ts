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

  startQuiz: (quizId: string) => void;
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

      startQuiz: (quizId) =>
        set({
          activeQuizId: quizId,
          currentQuestionIndex: 0,
          answers: {},
          flaggedQuestions: [],
          startTime: Date.now(),
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

          return { progress: newProgress };
        }),

      resetProgress: () => set({ progress: createInitialProgress() }),
    }),
    {
      name: 'sat-erw-storage',
      version: 2, // Increment version to trigger migration
      partialize: (state) => ({
        documents: state.documents,
        quizzes: state.quizzes,
        progress: state.progress,
        // Session state - allows resuming after page reload
        activeQuizId: state.activeQuizId,
        currentQuestionIndex: state.currentQuestionIndex,
        answers: state.answers,
        flaggedQuestions: state.flaggedQuestions,
        startTime: state.startTime,
      }),
      // Migrate old data on version change
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Partial<QuizStore>;

        if (version < 2 && state.progress) {
          // Migrate from v1 (old question types) to v2 (new question types)
          state.progress = migrateProgress(state.progress);
        }

        return state as QuizStore;
      },
    }
  )
);
