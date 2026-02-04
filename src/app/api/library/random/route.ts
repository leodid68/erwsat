import { NextRequest, NextResponse } from 'next/server';
import {
  TextCategory,
  getRandomSources,
  getRandomMixSources,
  CATEGORY_SOURCES,
} from '@/lib/text-library';
import { searchGutenberg, searchWikipedia, searchGuardian } from '@/lib/text-sources';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category') as TextCategory | 'mix' | null;
  const countParam = searchParams.get('count');
  const count = countParam ? parseInt(countParam, 10) : 3;

  if (!category) {
    return NextResponse.json(
      { error: 'Category parameter required (or "mix" for random mix)' },
      { status: 400 }
    );
  }

  // Validate category
  if (category !== 'mix' && !CATEGORY_SOURCES[category]) {
    return NextResponse.json(
      { error: `Invalid category: ${category}` },
      { status: 400 }
    );
  }

  try {
    // Get random sources
    const sources = category === 'mix'
      ? getRandomMixSources(count)
      : getRandomSources(category, count);

    // Fetch results from each source in parallel
    const results = await Promise.all(
      sources.map(async (source) => {
        try {
          switch (source.provider) {
            case 'gutenberg': {
              const books = await searchGutenberg(source.query);
              if (books.length === 0) return null;
              const randomBook = books[Math.floor(Math.random() * Math.min(books.length, 5))];
              return {
                id: `gutenberg-${randomBook.id}`,
                title: randomBook.title,
                author: randomBook.authors[0] || undefined,
                category: source.category,
                provider: 'gutenberg' as const,
                providerId: randomBook.id,
                preview: randomBook.subjects.slice(0, 2).join(', ') || 'Classic literature',
              };
            }
            case 'wikipedia': {
              const articles = await searchWikipedia(source.query);
              if (articles.length === 0) return null;
              const randomArticle = articles[Math.floor(Math.random() * Math.min(articles.length, 5))];
              return {
                id: `wikipedia-${randomArticle.title}`,
                title: randomArticle.title,
                category: source.category,
                provider: 'wikipedia' as const,
                providerId: randomArticle.title,
                preview: randomArticle.snippet.slice(0, 100) + '...',
              };
            }
            case 'guardian': {
              const apiKey = process.env.GUARDIAN_API_KEY;
              if (!apiKey) return null;
              const articles = await searchGuardian(source.query, apiKey);
              if (articles.length === 0) return null;
              const randomArticle = articles[Math.floor(Math.random() * Math.min(articles.length, 5))];
              return {
                id: `guardian-${randomArticle.id}`,
                title: randomArticle.title,
                category: source.category,
                provider: 'guardian' as const,
                providerId: randomArticle.id,
                preview: `${randomArticle.section} • ${randomArticle.date}`,
              };
            }
          }
        } catch (err) {
          console.error(`Failed to fetch from ${source.provider}:`, err);
          return null;
        }
      })
    );

    // Filter out nulls
    const items = results.filter(Boolean);

    return NextResponse.json({
      success: true,
      category: category,
      items,
      count: items.length,
    });
  } catch (error) {
    console.error('Library random error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch random texts' },
      { status: 500 }
    );
  }
}
