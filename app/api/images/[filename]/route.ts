import { NextRequest, NextResponse } from 'next/server';
import { resolvePublicImageFile } from '@/src/lib/image-manifest';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  const { filename } = await context.params;
  const resolved = resolvePublicImageFile(filename);

  if (!resolved) {
    return new NextResponse('Image not found', { status: 404 });
  }

  return new NextResponse(new Uint8Array(resolved.buffer), {
    status: 200,
    headers: {
      'Content-Type': resolved.contentType,
      'Content-Length': String(resolved.buffer.length),
      'Cache-Control':
        'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      ETag: `"${resolved.version}"`,
    },
  });
}
