import { NextRequest, NextResponse } from 'next/server';
import { fetchGuardianArticle, fetchGuardianArticleRaw, TextChunk } from '@/lib/text-sources';
import { selectPassagesWithSonnet, isAnthropicConfigured } from '@/lib/anthropic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId } = body;
    const apiKey = process.env.GUARDIAN_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Guardian API key not configured' },
        { status: 500 }
      );
    }

    if (!articleId || typeof articleId !== 'string') {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    // If Anthropic is configured, use Sonnet for intelligent passage selection
    if (isAnthropicConfigured()) {
      const rawResult = await fetchGuardianArticleRaw(articleId, apiKey);

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
          article: rawResult.article,
          chunks,
          usedSonnet: true,
        });
      } catch (sonnetError) {
        // Fallback to basic chunking if Sonnet fails
        console.error('Sonnet passage selection failed, using fallback:', sonnetError);
        const result = await fetchGuardianArticle(articleId, apiKey);
        return NextResponse.json({
          success: true,
          ...result,
          usedSonnet: false,
        });
      }
    }

    // Fallback: use basic chunking
    const result = await fetchGuardianArticle(articleId, apiKey);

    return NextResponse.json({
      success: true,
      ...result,
      usedSonnet: false,
    });
  } catch (error) {
    console.error('Guardian fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch article' },
      { status: 500 }
    );
  }
}
