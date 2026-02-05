import { NextRequest, NextResponse } from 'next/server';
import {
  getPracticeQuestions,
  convertToAppFormat,
  getAvailableSkills,
  getQuestionStats,
} from '@/lib/official-sat-questions';

/**
 * GET - Get available skills and stats for official questions
 */
export async function GET() {
  try {
    const skills = getAvailableSkills();
    const stats = getQuestionStats();
    const total = Object.values(stats).reduce((sum, s) => sum + s.total, 0);

    return NextResponse.json({
      success: true,
      totalQuestions: total,
      skills,
      domains: Object.keys(stats),
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
 * POST - Get practice questions from official SAT database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      count = 10,
      domains,
      skills,
      difficulty = 'mixed',
    } = body;

    // Get questions matching criteria
    const questions = getPracticeQuestions({
      count,
      domains,
      skills,
      difficulty,
    });

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'Aucune question trouvée avec ces critères' },
        { status: 404 }
      );
    }

    // Convert to app format
    const formattedQuestions = questions.map((q, i) => ({
      ...convertToAppFormat(q),
      id: `practice_${i + 1}`,
    }));

    return NextResponse.json({
      success: true,
      questions: formattedQuestions,
      stats: {
        requested: count,
        returned: formattedQuestions.length,
        isOfficial: true,
      },
    });
  } catch (error) {
    console.error('Practice questions error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}
