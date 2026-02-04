import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromFile, validateFile } from '@/lib/pdf-parser';
import { splitIntoPassages, SplitMode } from '@/lib/text-processor';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const splitMode = (formData.get('splitMode') as SplitMode) || 'medium';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate the file
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Extract text from the file
    const extractedText = await extractTextFromFile(file);

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not extract text from the file. The file may be empty or contain only images.' },
        { status: 400 }
      );
    }

    // Split into passages based on selected mode
    const passages = splitIntoPassages(extractedText, splitMode);

    if (passages.length === 0) {
      return NextResponse.json(
        { error: 'The extracted text is too short to create passages (minimum 25 words per passage).' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      documentId: crypto.randomUUID(),
      filename: file.name,
      extractedText,
      passages,
      stats: {
        totalWords: extractedText.split(/\s+/).length,
        totalPassages: passages.length,
        selectedPassages: passages.filter((p) => p.selected).length,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process file' },
      { status: 500 }
    );
  }
}
