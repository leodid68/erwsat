import { NextRequest, NextResponse } from 'next/server';
import { fetchWikipediaArticle, fetchWikipediaArticleRaw, TextChunk } from '@/lib/text-sources';
import { selectPassagesWithSonnet, isAnthropicConfigured } from '@/lib/anthropic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Article title is required' },
        { status: 400 }
      );
    }

    // If Anthropic is configured, use Sonnet for intelligent passage selection
    if (isAnthropicConfigured()) {
      const rawResult = await fetchWikipediaArticleRaw(title.trim());

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
          title: rawResult.title,
          extract: rawResult.fullText,
          chunks,
          usedSonnet: true,
        });
      } catch (sonnetError) {
        console.error('Sonnet passage selection failed, using fallback:', sonnetError);
        const result = await fetchWikipediaArticle(title.trim());
        return NextResponse.json({
          success: true,
          ...result,
          usedSonnet: false,
        });
      }
    }

    const result = await fetchWikipediaArticle(title.trim());

    return NextResponse.json({
      success: true,
      ...result,
      usedSonnet: false,
    });
  } catch (error) {
    console.error('Wikipedia fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch article' },
      { status: 500 }
    );
  }
}
