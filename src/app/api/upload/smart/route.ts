import { NextRequest, NextResponse } from 'next/server';
import { selectPassagesWithSonnet, isAnthropicConfigured } from '@/lib/anthropic';

/**
 * Smart upload endpoint that uses Claude Sonnet to intelligently select
 * the best SAT-quality passages from uploaded file text
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { extractedText, filename, maxPassages = 5 } = body;

    if (!extractedText) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    if (!isAnthropicConfigured()) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    if (extractedText.length < 500) {
      return NextResponse.json(
        { error: 'Text too short for AI passage selection (minimum 500 characters)' },
        { status: 400 }
      );
    }

    // Use Sonnet to intelligently select best passages
    const selectedPassages = await selectPassagesWithSonnet(extractedText, maxPassages);

    // Convert to passages format compatible with the app
    const passages = selectedPassages.map((passage, index) => ({
      id: `smart-${index}-${crypto.randomUUID().slice(0, 8)}`,
      text: passage.text,
      wordCount: passage.text.split(/\s+/).filter((w: string) => w.length > 0).length,
      selected: true,
      reason: passage.reason, // Keep the AI's explanation
    }));

    return NextResponse.json({
      success: true,
      documentId: crypto.randomUUID(),
      filename,
      extractedText,
      passages,
      stats: {
        totalWords: extractedText.split(/\s+/).length,
        totalPassages: passages.length,
        selectedPassages: passages.length,
        method: 'sonnet',
      },
    });
  } catch (error) {
    console.error('Smart upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze file content' },
      { status: 500 }
    );
  }
}
