import { NextRequest, NextResponse } from 'next/server';
import {
  fetchGutenbergBook,
  fetchWikipediaArticle,
  fetchGuardianArticle,
} from '@/lib/text-sources';
import { getEnv } from '@/lib/env-loader';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, providerId } = body;

    if (!provider || providerId === undefined) {
      return NextResponse.json(
        { error: 'Provider and providerId are required' },
        { status: 400 }
      );
    }

    let chunks;

    switch (provider) {
      case 'gutenberg': {
        const result = await fetchGutenbergBook(Number(providerId));
        chunks = result.chunks;
        break;
      }
      case 'wikipedia': {
        const result = await fetchWikipediaArticle(String(providerId));
        chunks = result.chunks;
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
        const result = await fetchGuardianArticle(String(providerId), env.GUARDIAN_API_KEY);
        chunks = result.chunks;
        break;
      }
      default:
        return NextResponse.json(
          { error: `Unknown provider: ${provider}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      chunks,
    });
  } catch (error) {
    console.error('Library fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
