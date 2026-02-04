import { NextRequest, NextResponse } from 'next/server';
import { searchGuardian } from '@/lib/text-sources';

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('q');
    const apiKey = process.env.GUARDIAN_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Guardian API key not configured. Add GUARDIAN_API_KEY to your .env.local file.' },
        { status: 500 }
      );
    }

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const results = await searchGuardian(query.trim(), apiKey);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Guardian search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 }
    );
  }
}
