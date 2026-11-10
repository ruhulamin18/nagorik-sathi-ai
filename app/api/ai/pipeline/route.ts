import { NextRequest, NextResponse } from 'next/server';
import { getPlatformSnapshot } from '@/src/db/repository.ts';
import { runTenStepComplaintPipeline } from '@/src/lib/ai-pipeline.ts';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const snapshot = await getPlatformSnapshot();

    const pipelineOutput = await runTenStepComplaintPipeline(
      {
        text: body.text || '',
        voiceTranscript: body.voiceTranscript || '',
        wardId: body.wardId || 'WARD-03',
        landmark: body.landmark || '',
        assetId: body.assetId || '',
        latitude: body.latitude,
        longitude: body.longitude,
        hasImage: Boolean(body.hasImage),
        consentGiven: Boolean(body.consentGiven),
      },
      snapshot.cases
    );

    return NextResponse.json(pipelineOutput);
  } catch (error: any) {
    console.error('POST /api/ai/pipeline error:', error);
    return NextResponse.json(
      { error: error.message || 'AI পাইপলাইন বিশ্লেষণে ত্রুটি হয়েছে।' },
      { status: 500 }
    );
  }
}
