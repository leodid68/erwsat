import { NextRequest, NextResponse } from 'next/server';
import {
  fetchGutenbergBookRaw,
  fetchWikipediaArticleRaw,
  fetchGuardianArticleRaw,
} from '@/lib/text-sources';
import { selectPassagesWithSonnet, isAnthropicConfigured } from '@/lib/anthropic';
import { getEnv } from '@/lib/env-loader';

/**
 * Smart fetch endpoint that uses Claude Sonnet to intelligently select
 * the best SAT-quality passages from the source text
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, providerId, maxPassages = 5 } = body;

    if (!provider || providerId === undefined) {
      return NextResponse.json(
        { error: 'Provider and providerId are required' },
        { status: 400 }
      );
    }

    if (!isAnthropicConfigured()) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    // Fetch raw text from the source
    let fullText: string;
    let title: string;

    switch (provider) {
      case 'gutenberg': {
        const result = await fetchGutenbergBookRaw(Number(providerId));
        fullText = result.fullText;
        title = result.book.title;
        break;
      }
      case 'wikipedia': {
        const result = await fetchWikipediaArticleRaw(String(providerId));
        fullText = result.fullText;
        title = result.title;
        break;
      }
      case 'guardian': {
        const env = getEnv();
        if (!env.GUARDIAN_API_KEY) {
          return NextResponse.json(
            { error: 'Guardian API key not configured' },
            { status: 500 }
          );
        }
        const result = await fetchGuardianArticleRaw(String(providerId), env.GUARDIAN_API_KEY);
        fullText = result.fullText;
        title = result.title;
        break;
      }
      default:
        return NextResponse.json(
          { error: `Unknown provider: ${provider}` },
          { status: 400 }
        );
    }

    if (!fullText || fullText.length < 500) {
      return NextResponse.json(
        { error: `Source text too short for passage selection` },
        { status: 400 }
      );
    }

    // Use Sonnet to intelligently select best passages
    const selectedPassages = await selectPassagesWithSonnet(fullText, maxPassages);

    // Convert to chunks format
    const chunks = selectedPassages.map((passage, index) => ({
      id: `smart-${index}`,
      name: `Passage ${index + 1} (AI)`,
      text: passage.text,
      wordCount: passage.text.split(/\s+/).filter((w: string) => w.length > 0).length,
      reason: passage.reason,
    }));

    return NextResponse.json({
      success: true,
      title,
      chunks,
      method: 'sonnet',
    });
  } catch (error) {
    console.error('Smart fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch and analyze content' },
      { status: 500 }
    );
  }
}
