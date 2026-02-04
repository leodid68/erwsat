import { NextResponse } from 'next/server';
import { isAnthropicConfigured } from '@/lib/anthropic';

export async function GET() {
  return NextResponse.json({
    configured: isAnthropicConfigured(),
  });
}
