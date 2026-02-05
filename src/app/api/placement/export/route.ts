import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { passages, testName, format = 'txt' } = body;

    if (!passages || !Array.isArray(passages)) {
      return NextResponse.json(
        { error: 'Passages array is required' },
        { status: 400 }
      );
    }

    if (format === 'txt') {
      // Generate TXT content
      const lines: string[] = [
        `SAT ERW Placement Test - Passages`,
        `Test: ${testName || 'Unknown'}`,
        `Generated: ${new Date().toISOString()}`,
        `Total Passages: ${passages.length}`,
        '',
        '=' .repeat(80),
        '',
      ];

      for (const passage of passages) {
        lines.push(`[${passage.id}]`);
        lines.push(`Source: ${passage.source}`);
        lines.push(`Module: ${passage.moduleId}`);
        lines.push(`Question: ${passage.questionId}`);
        lines.push('');
        lines.push(passage.text);
        lines.push('');
        lines.push('-'.repeat(80));
        lines.push('');
      }

      const txtContent = lines.join('\n');

      return new NextResponse(txtContent, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="${testName || 'placement_test'}_passages.txt"`,
        },
      });
    } else if (format === 'json') {
      // Export as JSON
      const jsonContent = JSON.stringify(
        {
          testName,
          exportedAt: new Date().toISOString(),
          totalPassages: passages.length,
          passages,
        },
        null,
        2
      );

      return new NextResponse(jsonContent, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${testName || 'placement_test'}_passages.json"`,
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid format. Use "txt" or "json"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Export failed' },
      { status: 500 }
    );
  }
}
