import { NextRequest, NextResponse } from 'next/server';
import { selectPassagesWithSonnet, isAnthropicConfigured } from '@/lib/anthropic';

export async function POST(request: NextRequest) {
  try {
    if (!isAnthropicConfigured()) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured. Add ANTHROPIC_API_KEY to .env.local' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { text, maxPassages = 5 } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const passages = await selectPassagesWithSonnet(text, maxPassages);

    return NextResponse.json({
      success: true,
      passages,
    });
  } catch (error) {
    console.error('Passage selection error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to select passages' },
      { status: 500 }
    );
  }
}
