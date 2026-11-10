import { NextResponse } from 'next/server';
import { getPublicImagesManifest } from '@/src/lib/image-manifest';

export const dynamic = 'force-dynamic';

export async function GET() {
  const manifest = getPublicImagesManifest();
  return NextResponse.json(
    { imageVersions: manifest },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    }
  );
}
