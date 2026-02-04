import { NextRequest, NextResponse } from 'next/server';
import { fetchGutenbergBook, fetchGutenbergBookRaw, TextChunk } from '@/lib/text-sources';
import { selectPassagesWithSonnet, isAnthropicConfigured } from '@/lib/anthropic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId } = body;

    if (!bookId || typeof bookId !== 'number') {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      );
    }

    // If Anthropic is configured, use Sonnet for intelligent passage selection
    if (isAnthropicConfigured()) {
      const rawResult = await fetchGutenbergBookRaw(bookId);

      try {
        const passages = await selectPassagesWithSonnet(rawResult.fullText, 5);

        const chunks: TextChunk[] = passages.map((p, i) => ({
          id: `sonnet-${i}`,
          name: `Passage ${i + 1}`,
          text: p.text,
          wordCount: p.text.split(/\s+/).filter(w => w.length > 0).length,
        }));

        return NextResponse.json({
          success: true,
          book: rawResult.book,
          chunks,
          usedSonnet: true,
        });
      } catch (sonnetError) {
        console.error('Sonnet passage selection failed, using fallback:', sonnetError);
        const result = await fetchGutenbergBook(bookId);
        return NextResponse.json({
          success: true,
          ...result,
          usedSonnet: false,
        });
      }
    }

    const result = await fetchGutenbergBook(bookId);

    return NextResponse.json({
      success: true,
      ...result,
      usedSonnet: false,
    });
  } catch (error) {
    console.error('Gutenberg fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch book' },
      { status: 500 }
    );
  }
}
