import { NextRequest, NextResponse } from 'next/server';
import {
  getPlacementTestQuestions,
  convertToAppFormat,
  getQuestionStats,
} from '@/lib/official-sat-questions';

/**
 * GET - Get stats about official SAT questions
 */
export async function GET() {
  try {
    const stats = getQuestionStats();
    const total = Object.values(stats).reduce((sum, s) => sum + s.total, 0);

    return NextResponse.json({
      success: true,
      totalQuestions: total,
      byDomain: stats,
    });
  } catch (error) {
    console.error('Error getting official question stats:', error);
    return NextResponse.json(
      { error: 'Failed to get question stats' },
      { status: 500 }
    );
  }
}

/**
 * POST - Generate a placement test from official SAT questions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { questionsPerModule = 27 } = body;

    // Get questions for both modules
    const { module1, module2 } = getPlacementTestQuestions();

    // Convert to app format
    const module1Questions = module1.slice(0, questionsPerModule).map((q, i) => ({
      ...convertToAppFormat(q),
      id: `M1_Q${i + 1}`,
    }));

    const module2Questions = module2.slice(0, questionsPerModule).map((q, i) => ({
      ...convertToAppFormat(q),
      id: `M2_Q${i + 1}`,
    }));

    // Build response
    const testId = `placement_official_${Date.now()}`;
    const testName = `SAT_RW_Official_${new Date().toISOString().split('T')[0]}`;

    return NextResponse.json({
      success: true,
      test: {
        testId,
        testName,
        modules: [
          {
            moduleId: 1,
            difficulty: 'Medium',
            questions: module1Questions,
            generatedAt: new Date().toISOString(),
          },
          {
            moduleId: 2,
            difficulty: 'Hard',
            questions: module2Questions,
            generatedAt: new Date().toISOString(),
          },
        ],
        allPassages: [...module1Questions, ...module2Questions].map(q => ({
          id: `passage_${q.id}`,
          source: q.passageSource,
          text: q.passage,
          moduleId: q.id.startsWith('M1') ? 1 : 2,
          questionId: q.id,
        })),
        sources: ['Official SAT (College Board)'],
        generatedAt: new Date().toISOString(),
      },
      stats: {
        totalQuestions: module1Questions.length + module2Questions.length,
        totalPassages: module1Questions.length + module2Questions.length,
        sourcesUsed: 1,
        isOfficial: true,
      },
    });
  } catch (error) {
    console.error('Placement test generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de la génération' },
      { status: 500 }
    );
  }
}
