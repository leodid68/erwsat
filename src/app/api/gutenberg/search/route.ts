import { NextRequest, NextResponse } from 'next/server';
import { searchGutenberg } from '@/lib/text-sources';

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const results = await searchGutenberg(query.trim());

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Gutenberg search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 }
    );
  }
}
