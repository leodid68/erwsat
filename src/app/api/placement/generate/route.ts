import { NextRequest, NextResponse } from 'next/server';
import {
  generatePlacementQuestionWithPassage,
  isAnthropicConfigured,
  PlacementQuestionSpec,
  GeneratedPlacementQuestion,
} from '@/lib/anthropic';

// Distribution for SAT ERW (official proportions)
const MODULE_DISTRIBUTION = {
  'Craft & Structure': {
    percentage: 28,
    skills: ['Words in Context', 'Text Structure and Purpose'],
  },
  'Information & Ideas': {
    percentage: 26,
    skills: ['Central Ideas and Details', 'Command of Evidence (Textual)', 'Command of Evidence (Quantitative)', 'Inferences'],
  },
  'Standard English Conventions': {
    percentage: 26,
    skills: ['Boundaries', 'Form, Structure, and Sense'],
  },
  'Expression of Ideas': {
    percentage: 20,
    skills: ['Transitions', 'Rhetorical Synthesis'],
  },
} as const;

type Domain = keyof typeof MODULE_DISTRIBUTION;

function generateModuleSpecs(
  moduleNumber: 1 | 2,
  questionsCount: number = 27
): PlacementQuestionSpec[] {
  const difficulty = moduleNumber === 1 ? 'Medium' : 'Hard';
  const specs: PlacementQuestionSpec[] = [];

  // Calculate questions per domain based on percentage
  const domainCounts: Record<Domain, number> = {
    'Craft & Structure': Math.round(questionsCount * 0.28),
    'Information & Ideas': Math.round(questionsCount * 0.26),
    'Standard English Conventions': Math.round(questionsCount * 0.26),
    'Expression of Ideas': Math.round(questionsCount * 0.20),
  };

  // Adjust to ensure we hit exactly questionsCount
  const total = Object.values(domainCounts).reduce((a, b) => a + b, 0);
  const diff = questionsCount - total;
  if (diff !== 0) {
    domainCounts['Craft & Structure'] += diff;
  }

  // Generate specs for each domain
  for (const [domain, config] of Object.entries(MODULE_DISTRIBUTION)) {
    const count = domainCounts[domain as Domain];
    const skills = config.skills;

    for (let i = 0; i < count; i++) {
      specs.push({
        domain: domain as Domain,
        skill: skills[i % skills.length],
        difficulty,
      });
    }
  }

  // Shuffle specs to mix domains
  for (let i = specs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [specs[i], specs[j]] = [specs[j], specs[i]];
  }

  return specs;
}

export interface GeneratedPlacementModule {
  moduleId: 1 | 2;
  difficulty: 'Medium' | 'Hard';
  questions: Array<GeneratedPlacementQuestion & { id: string }>;
  generatedAt: string;
}

export interface GeneratedPlacementTest {
  testId: string;
  testName: string;
  modules: [GeneratedPlacementModule, GeneratedPlacementModule];
  allPassages: Array<{
    id: string;
    source: string;
    text: string;
    moduleId: number;
    questionId: string;
  }>;
  generatedAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { moduleToGenerate, questionsPerModule = 27 } = body;

    if (!isAnthropicConfigured()) {
      return NextResponse.json(
        { error: 'Claude API (Anthropic) non configurée. Ajoutez ANTHROPIC_API_KEY dans .env.local' },
        { status: 500 }
      );
    }

    // Generate specs for requested module(s)
    const modulesToGenerate: Array<1 | 2> = moduleToGenerate
      ? [moduleToGenerate]
      : [1, 2];

    const generatedModules: GeneratedPlacementModule[] = [];
    const allPassages: GeneratedPlacementTest['allPassages'] = [];
    const errors: string[] = [];

    for (const moduleNum of modulesToGenerate) {
      const specs = generateModuleSpecs(moduleNum, questionsPerModule);
      const questions: Array<GeneratedPlacementQuestion & { id: string }> = [];

      // Generate questions in parallel (batches of 5 to avoid rate limits)
      const batchSize = 5;
      for (let i = 0; i < specs.length; i += batchSize) {
        const batch = specs.slice(i, i + batchSize);

        const results = await Promise.allSettled(
          batch.map((spec, batchIndex) =>
            generatePlacementQuestionWithPassage(spec, i + batchIndex)
          )
        );

        for (let j = 0; j < results.length; j++) {
          const result = results[j];
          const questionId = `M${moduleNum}_Q${i + j + 1}`;

          if (result.status === 'fulfilled') {
            questions.push({
              ...result.value,
              id: questionId,
            });

            allPassages.push({
              id: `passage_${questionId}`,
              source: result.value.passageSource,
              text: result.value.passage,
              moduleId: moduleNum,
              questionId,
            });
          } else {
            errors.push(`Failed to generate ${questionId}: ${result.reason}`);
          }
        }

        // Small delay between batches to respect rate limits
        if (i + batchSize < specs.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      generatedModules.push({
        moduleId: moduleNum,
        difficulty: moduleNum === 1 ? 'Medium' : 'Hard',
        questions,
        generatedAt: new Date().toISOString(),
      });
    }

    const testId = `placement_${Date.now()}`;
    const response: Partial<GeneratedPlacementTest> = {
      testId,
      testName: `SAT_RW_Placement_${new Date().toISOString().split('T')[0]}`,
      modules: generatedModules as [GeneratedPlacementModule, GeneratedPlacementModule],
      allPassages,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      test: response,
      stats: {
        totalQuestions: generatedModules.reduce((sum, m) => sum + m.questions.length, 0),
        totalPassages: allPassages.length,
        errors: errors.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Placement test generation error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erreur lors de la génération du test',
      },
      { status: 500 }
    );
  }
}
