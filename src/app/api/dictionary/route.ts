import { NextRequest, NextResponse } from 'next/server';

interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics?: Array<{
    text?: string;
    audio?: string;
  }>;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
      synonyms?: string[];
    }>;
  }>;
}

interface TranslationResponse {
  responseData: {
    translatedText: string;
  };
  responseStatus: number;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const word = searchParams.get('word');
  const translate = searchParams.get('translate') === 'true';

  if (!word) {
    return NextResponse.json({ error: 'Word parameter is required' }, { status: 400 });
  }

  const cleanWord = word.trim().toLowerCase();

  try {
    // Fetch definition from Free Dictionary API
    const dictResponse = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`
    );

    let definition = null;
    let phonetic = null;
    let audioUrl = null;
    let partOfSpeech = null;
    let example = null;
    let synonyms: string[] = [];

    if (dictResponse.ok) {
      const dictData: DictionaryEntry[] = await dictResponse.json();

      if (dictData && dictData.length > 0) {
        const entry = dictData[0];
        phonetic = entry.phonetic || entry.phonetics?.find(p => p.text)?.text;
        audioUrl = entry.phonetics?.find(p => p.audio)?.audio;

        if (entry.meanings && entry.meanings.length > 0) {
          const meaning = entry.meanings[0];
          partOfSpeech = meaning.partOfSpeech;

          if (meaning.definitions && meaning.definitions.length > 0) {
            definition = meaning.definitions[0].definition;
            example = meaning.definitions[0].example;
            synonyms = meaning.definitions[0].synonyms?.slice(0, 5) || [];
          }
        }
      }
    }

    // Fetch translation if requested
    let translation = null;
    if (translate) {
      try {
        const transResponse = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanWord)}&langpair=en|fr`
        );

        if (transResponse.ok) {
          const transData: TranslationResponse = await transResponse.json();
          if (transData.responseStatus === 200 && transData.responseData?.translatedText) {
            translation = transData.responseData.translatedText;
            // Don't return translation if it's the same as the word (not translated)
            if (translation.toLowerCase() === cleanWord) {
              translation = null;
            }
          }
        }
      } catch {
        // Translation failed, continue without it
      }
    }

    return NextResponse.json({
      word: cleanWord,
      definition,
      phonetic,
      audioUrl,
      partOfSpeech,
      example,
      synonyms,
      translation,
      found: !!definition,
    });

  } catch (error) {
    console.error('Dictionary API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch definition', found: false },
      { status: 500 }
    );
  }
}
