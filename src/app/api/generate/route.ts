import { NextRequest, NextResponse } from 'next/server';
import { generateWithOllama } from '@/lib/ollama';
import { generateWithMLX, shouldUseMLX } from '@/lib/mlx-inference';
import { generateQuestionWithSonnet } from '@/lib/anthropic';
import { getApiKeyFromRequest } from '@/lib/env-loader';
import {
  buildQuestionPrompt,
  buildBatchQuestionPrompt,
  parseQuestionResponse,
} from '@/lib/prompts/sat-question-prompts';
import { QuestionType, Question, AnswerId } from '@/types/question';
import { z } from 'zod';

const GenerateRequestSchema = z.object({
  passages: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      wordCount: z.number(),
      selected: z.boolean(),
    })
  ),
  questionTypes: z.array(
    z.enum([
      // Information and Ideas
      'central-ideas',
      'inferences',
      'command-of-evidence',
      // Craft and Structure
      'words-in-context',
      'text-structure-purpose',
      'cross-text-connections',
      // Expression of Ideas
      'rhetorical-synthesis',
      'transitions',
      // Standard English Conventions
      'boundaries',
      'form-structure-sense',
    ])
  ),
  questionsPerPassage: z.number().min(1).max(5).default(1),
  // Accept either a single difficulty or an array
  difficulty: z.union([
    z.enum(['easy', 'medium', 'hard']),
    z.array(z.enum(['easy', 'medium', 'hard']))
  ]).default('medium'),
  model: z.string().optional(),
});

const QuestionSchema = z.object({
  type: z.enum([
    // Information and Ideas
    'central-ideas',
    'inferences',
    'command-of-evidence',
    // Craft and Structure
    'words-in-context',
    'text-structure-purpose',
    'cross-text-connections',
    // Expression of Ideas
    'rhetorical-synthesis',
    'transitions',
    // Standard English Conventions
    'boundaries',
    'form-structure-sense',
  ]),
  passage: z.string(),
  questionText: z.string(),
  choices: z.array(
    z.object({
      id: z.enum(['A', 'B', 'C', 'D']),
      text: z.string(),
    })
  ),
  correctAnswer: z.enum(['A', 'B', 'C', 'D']),
  explanation: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  distractorAnalysis: z.object({
    A: z.string(),
    B: z.string(),
    C: z.string(),
  }).optional(),
});

// Type for generation task
interface GenerationTask {
  passageId: string;
  passageText: string;
  questionType: QuestionType;
  difficulty: 'easy' | 'medium' | 'hard';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = GenerateRequestSchema.parse(body);

    const selectedPassages = parsed.passages.filter((p) => p.selected);

    if (selectedPassages.length === 0) {
      return NextResponse.json(
        { error: 'No passages selected' },
        { status: 400 }
      );
    }

    const questions: Question[] = [];
    const errors: string[] = [];

    const useSonnet = parsed.model === 'claude-sonnet';

    // Get API key from request header or env
    const apiKey = getApiKeyFromRequest(request);

    // Check if Sonnet is requested but no API key available
    if (useSonnet && !apiKey) {
      return NextResponse.json(
        { error: 'Clé API Anthropic requise. Ajoutez-la dans Paramètres.' },
        { status: 401 }
      );
    }

    // Normalize difficulty to array and create random picker
    const difficulties = Array.isArray(parsed.difficulty) ? parsed.difficulty : [parsed.difficulty];
    const getRandomDifficulty = () => difficulties[Math.floor(Math.random() * difficulties.length)];

    if (useSonnet) {
      // PARALLEL GENERATION with Sonnet
      // Build all generation tasks first
      const tasks: GenerationTask[] = [];

      for (const passage of selectedPassages) {
        const typesToGenerate =
          parsed.questionsPerPassage === 1
            ? [parsed.questionTypes[Math.floor(Math.random() * parsed.questionTypes.length)]]
            : parsed.questionTypes.slice(0, parsed.questionsPerPassage);

        for (const questionType of typesToGenerate) {
          tasks.push({
            passageId: passage.id,
            passageText: passage.text,
            questionType,
            difficulty: getRandomDifficulty(),
          });
        }
      }

      // Execute all tasks in parallel
      const results = await Promise.allSettled(
        tasks.map(async (task) => {
          const questionData = await generateQuestionWithSonnet(
            task.passageText,
            task.questionType,
            task.difficulty,
            apiKey!
          );
          const validated = QuestionSchema.parse(questionData);
          return {
            ...validated,
            passageId: task.passageId,
          };
        })
      );

      // Process results
      for (const result of results) {
        if (result.status === 'fulfilled') {
          const validated = result.value;
          questions.push({
            id: crypto.randomUUID(),
            type: validated.type,
            passage: validated.passage,
            passageSource: validated.passageId,
            questionText: validated.questionText,
            choices: validated.choices as { id: AnswerId; text: string }[],
            correctAnswer: validated.correctAnswer as AnswerId,
            explanation: validated.explanation,
            difficulty: validated.difficulty,
            distractorAnalysis: validated.distractorAnalysis,
            createdAt: new Date(),
          });
        } else {
          errors.push(
            `Sonnet error: ${result.reason instanceof Error ? result.reason.message : 'Unknown error'}`
          );
        }
      }
    } else {
      // Sequential generation for MLX/Ollama (local models)
      for (const passage of selectedPassages) {
        try {
          const typesToGenerate =
            parsed.questionsPerPassage === 1
              ? [parsed.questionTypes[Math.floor(Math.random() * parsed.questionTypes.length)]]
              : parsed.questionTypes.slice(0, parsed.questionsPerPassage);

          if (typesToGenerate.length === 1) {
            // Generate single question
            const useMLX = shouldUseMLX(parsed.model);

            let questionData;
            if (useMLX) {
              questionData = await generateWithMLX({
                passage: passage.text,
                questionType: typesToGenerate[0],
                difficulty: getRandomDifficulty(),
              });
            } else {
              const prompt = buildQuestionPrompt(passage.text, typesToGenerate[0], getRandomDifficulty());
              const text = await generateWithOllama({
                model: parsed.model,
                prompt,
                maxTokens: 1500,
                temperature: 0.7,
              });
              questionData = parseQuestionResponse(text);
            }

            const validated = QuestionSchema.parse(questionData);
            questions.push({
              id: crypto.randomUUID(),
              type: validated.type,
              passage: validated.passage,
              passageSource: passage.id,
              questionText: validated.questionText,
              choices: validated.choices as { id: AnswerId; text: string }[],
              correctAnswer: validated.correctAnswer as AnswerId,
              explanation: validated.explanation,
              difficulty: validated.difficulty,
              createdAt: new Date(),
            });
          } else {
            // Generate multiple questions
            const useMLX = shouldUseMLX(parsed.model);

            if (useMLX) {
              for (const questionType of typesToGenerate) {
                try {
                  const qData = await generateWithMLX({
                    passage: passage.text,
                    questionType,
                    difficulty: getRandomDifficulty(),
                  });
                  const validated = QuestionSchema.parse(qData);
                  questions.push({
                    id: crypto.randomUUID(),
                    type: validated.type,
                    passage: validated.passage,
                    passageSource: passage.id,
                    questionText: validated.questionText,
                    choices: validated.choices as { id: AnswerId; text: string }[],
                    correctAnswer: validated.correctAnswer as AnswerId,
                    explanation: validated.explanation,
                    difficulty: validated.difficulty,
                    createdAt: new Date(),
                  });
                } catch (mlxError) {
                  errors.push(
                    `MLX error for ${questionType}: ${mlxError instanceof Error ? mlxError.message : 'Unknown error'}`
                  );
                }
              }
            } else {
              // Ollama batch generation
              const prompt = buildBatchQuestionPrompt(passage.text, typesToGenerate, getRandomDifficulty());
              const text = await generateWithOllama({
                model: parsed.model,
                prompt,
                maxTokens: 3000,
                temperature: 0.7,
              });

              const questionsData = parseQuestionResponse(text);
              const questionsArray = Array.isArray(questionsData) ? questionsData : [questionsData];

              for (const qData of questionsArray) {
                try {
                  const validated = QuestionSchema.parse(qData);
                  questions.push({
                    id: crypto.randomUUID(),
                    type: validated.type,
                    passage: validated.passage,
                    passageSource: passage.id,
                    questionText: validated.questionText,
                    choices: validated.choices as { id: AnswerId; text: string }[],
                    correctAnswer: validated.correctAnswer as AnswerId,
                    explanation: validated.explanation,
                    difficulty: validated.difficulty,
                    createdAt: new Date(),
                  });
                } catch (validationError) {
                  errors.push(
                    `Failed to validate question: ${validationError instanceof Error ? validationError.message : 'Unknown error'}`
                  );
                }
              }
            }
          }
        } catch (passageError) {
          errors.push(
            `Failed to generate for passage: ${passageError instanceof Error ? passageError.message : 'Unknown error'}`
          );
        }
      }
    }

    if (questions.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to generate any questions',
          details: errors,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      questions,
      stats: {
        totalGenerated: questions.length,
        passagesProcessed: selectedPassages.length,
        errors: errors.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Generate error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate questions',
      },
      { status: 500 }
    );
  }
}
