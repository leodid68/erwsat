import { extractText } from 'unpdf';

/**
 * Extract text from a PDF file
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { text } = await extractText(buffer, { mergePages: true });

  // Clean up the extracted text
  return cleanExtractedText(text);
}

/**
 * Extract text from a TXT file
 */
export async function extractTextFromTXT(file: File): Promise<string> {
  const text = await file.text();
  return cleanExtractedText(text);
}

/**
 * Clean up extracted text
 */
function cleanExtractedText(text: string): string {
  return text
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove excessive whitespace but preserve paragraph breaks
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{4,}/g, '\n\n\n')
    // Remove leading/trailing whitespace from lines
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    // Trim the whole text
    .trim();
}

/**
 * Detect file type and extract text
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.pdf')) {
    return extractTextFromPDF(file);
  } else if (fileName.endsWith('.txt')) {
    return extractTextFromTXT(file);
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or TXT file.');
  }
}

/**
 * Validate file before processing
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const fileName = file.name.toLowerCase();
  const maxSizePDF = 10 * 1024 * 1024; // 10MB
  const maxSizeTXT = 5 * 1024 * 1024; // 5MB

  if (!fileName.endsWith('.pdf') && !fileName.endsWith('.txt')) {
    return { valid: false, error: 'Please upload a PDF or TXT file.' };
  }

  if (fileName.endsWith('.pdf') && file.size > maxSizePDF) {
    return { valid: false, error: 'PDF file size must be under 10MB.' };
  }

  if (fileName.endsWith('.txt') && file.size > maxSizeTXT) {
    return { valid: false, error: 'TXT file size must be under 5MB.' };
  }

  return { valid: true };
}
