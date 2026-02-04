import { NextRequest, NextResponse } from 'next/server';
import { answerWithSATModel, checkSATModelHealth } from '@/lib/sat-model';
import { z } from 'zod';

const AnswerRequestSchema = z.object({
  passage: z.string(),
  question: z.string(),
  choices: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
    })
  ),
  skill: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = AnswerRequestSchema.parse(body);

    const result = await answerWithSATModel({
      passage: parsed.passage,
      question: parsed.question,
      choices: parsed.choices,
      skill: parsed.skill,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('SAT answer error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get answer' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const health = await checkSATModelHealth();
  return NextResponse.json(health);
}
