import { NextRequest, NextResponse } from 'next/server';
import {
  getPlatformSnapshot,
  createNewComplaintCase,
  updateSubTaskAndEvidence,
  executeSupervisorAction,
  submitCitizenFeedbackOrReopen,
  createAdminConfigItem,
  getOrCreateFirebaseUser,
} from '@/src/db/repository.ts';
import { runTenStepComplaintPipeline } from '@/src/lib/ai-pipeline.ts';
import { getPublicImagesManifest } from '@/src/lib/image-manifest';

export async function GET() {
  try {
    const snapshot = await getPlatformSnapshot();
    const imageVersions = getPublicImagesManifest();
    return NextResponse.json({ ...snapshot, imageVersions });
  } catch (error: any) {
    console.error('GET /api/platform error:', error);
    return NextResponse.json(
      { error: error.message || 'ডাটাবেস থেকে তথ্য লোড করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    if (action === 'SYNC_AUTH_USER') {
      const user = await getOrCreateFirebaseUser(
        payload.uid || 'demo-citizen-01',
        payload.email || 'citizen@dncc.gov.bd',
        payload.name || 'আব্দুর রহিম'
      );
      const snapshot = await getPlatformSnapshot();
      return NextResponse.json({ user, snapshot });
    }

    if (action === 'CREATE_CASE') {
      const snapshotBefore = await getPlatformSnapshot();
      const pipelineResult = await runTenStepComplaintPipeline(
        {
          text: payload.originalDescription,
          voiceTranscript: payload.voiceTranscript,
          wardId: payload.wardId,
          landmark: payload.landmark,
          assetId: payload.assetId,
          latitude: payload.latitude,
          longitude: payload.longitude,
          consentGiven: true,
        },
        snapshotBefore.cases
      );

      const createdCase = await createNewComplaintCase({
        title: payload.title,
        originalDescription: payload.originalDescription,
        normalizedDescription: pipelineResult.step2Normalization.normalizedText,
        category: payload.category || pipelineResult.step3Classification.category,
        severity: payload.severity || pipelineResult.step4Entities.severityClue,
        citizenUid: payload.citizenUid || 'demo-citizen-01',
        citizenName: payload.citizenName || 'আব্দুর রহিম',
        citizenPhone: payload.citizenPhone || '01711-000101',
        contactPreference: payload.contactPreference || 'Web + SMS',
        submittedVia: payload.submittedVia || 'Web Portal',
        wardId: payload.wardId || 'WARD-03',
        roadName: payload.roadName || payload.landmark,
        landmark: payload.landmark,
        assetId: payload.assetId || pipelineResult.step5Geospatial.resolvedAssetId || undefined,
        latitude: Number(payload.latitude) || 23.7955,
        longitude: Number(payload.longitude) || 90.3735,
        voiceTranscript: payload.voiceTranscript,
        imageUrl: payload.imageUrl,
        linkedParentCaseNumber: payload.linkedParentCaseNumber,
        aiConfidence: pipelineResult.step3Classification.confidence,
        aiExtractedEntities: pipelineResult.step4Entities,
        aiRecommendedDeptId: pipelineResult.step6Responsibility.primaryDepartmentId,
        aiRoutingReason: pipelineResult.step6Responsibility.routingReasonBn,
        aiRuleReference: pipelineResult.step6Responsibility.ruleReference,
        requiresHumanReview: pipelineResult.step9Escalation.requiresHumanReview,
        humanReviewReason: pipelineResult.step9Escalation.escalationReasonsBn.join(' | '),
        secondaryDepartments: pipelineResult.step6Responsibility.secondaryDepartments,
        duplicateCandidatesFound: pipelineResult.step7Duplicates,
      });

      const snapshot = await getPlatformSnapshot();
      return NextResponse.json({ createdCase, pipelineResult, snapshot });
    }

    if (action === 'UPDATE_SUBTASK') {
      const result = await updateSubTaskAndEvidence(payload);
      const snapshot = await getPlatformSnapshot();
      return NextResponse.json({ result, snapshot });
    }

    if (action === 'SUPERVISOR_ACTION') {
      const result = await executeSupervisorAction(payload);
      const snapshot = await getPlatformSnapshot();
      return NextResponse.json({ result, snapshot });
    }

    if (action === 'CITIZEN_FEEDBACK') {
      const result = await submitCitizenFeedbackOrReopen(payload);
      const snapshot = await getPlatformSnapshot();
      return NextResponse.json({ result, snapshot });
    }

    if (action === 'ADMIN_CONFIG') {
      const result = await createAdminConfigItem(payload);
      const snapshot = await getPlatformSnapshot();
      return NextResponse.json({ result, snapshot });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('POST /api/platform error:', error);
    return NextResponse.json(
      { error: error.message || 'অপারেশনটি সম্পন্ন করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
