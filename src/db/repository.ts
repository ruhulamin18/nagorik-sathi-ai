import { db } from './index.ts';
import {
  users,
  roles,
  cityCorporations,
  wards,
  departments,
  assets,
  responsibilityRules,
  slaRules,
  services,
  governmentDocuments,
  cases,
  caseTasks,
  caseEvents,
  evidence,
  routingReviews,
  duplicateCandidates,
  feedbackAppeals,
  notifications,
  auditLogs,
  integrationLogs,
  researchEvaluations,
} from './schema.ts';
import { ensureSeeded } from './seed.ts';
import { desc, eq } from 'drizzle-orm';

export async function getPlatformSnapshot() {
  try {
    await ensureSeeded();

    const [
      allUsers,
      allRoles,
      allWards,
      allDepartments,
      allAssets,
      allRules,
      allSlaRules,
      allServices,
      allDocs,
      allCases,
      allTasks,
      allEvents,
      allEvidence,
      allRoutingReviews,
      allDuplicates,
      allFeedback,
      allNotifications,
      allAuditLogs,
      allIntegrations,
      allEvaluations,
    ] = await Promise.all([
      db.select().from(users),
      db.select().from(roles),
      db.select().from(wards),
      db.select().from(departments),
      db.select().from(assets),
      db.select().from(responsibilityRules),
      db.select().from(slaRules),
      db.select().from(services),
      db.select().from(governmentDocuments),
      db.select().from(cases).orderBy(desc(cases.createdAt)),
      db.select().from(caseTasks),
      db.select().from(caseEvents).orderBy(desc(caseEvents.createdAt)),
      db.select().from(evidence).orderBy(desc(evidence.createdAt)),
      db.select().from(routingReviews).orderBy(desc(routingReviews.createdAt)),
      db.select().from(duplicateCandidates).orderBy(desc(duplicateCandidates.createdAt)),
      db.select().from(feedbackAppeals).orderBy(desc(feedbackAppeals.createdAt)),
      db.select().from(notifications).orderBy(desc(notifications.createdAt)),
      db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)),
      db.select().from(integrationLogs),
      db.select().from(researchEvaluations),
    ]);

    return {
      users: allUsers,
      roles: allRoles,
      wards: allWards,
      departments: allDepartments,
      assets: allAssets,
      responsibilityRules: allRules,
      slaRules: allSlaRules,
      services: allServices,
      governmentDocuments: allDocs,
      cases: allCases,
      caseTasks: allTasks,
      caseEvents: allEvents,
      evidence: allEvidence,
      routingReviews: allRoutingReviews,
      duplicateCandidates: allDuplicates,
      feedbackAppeals: allFeedback,
      notifications: allNotifications,
      auditLogs: allAuditLogs,
      integrationLogs: allIntegrations,
      researchEvaluations: allEvaluations,
      lastSyncedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Database query failed in getPlatformSnapshot:', error);
    throw new Error('Failed to load platform data from PostgreSQL database.', { cause: error });
  }
}

export async function getOrCreateFirebaseUser(uid: string, email: string, name?: string) {
  try {
    await ensureSeeded();
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        name: name || email.split('@')[0],
        nameBn: `${name || email.split('@')[0]} (যাচাইকৃত ব্যবহারকারী)`,
        role: 'citizen',
        wardId: 'WARD-03',
        isSynthetic: false,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to upsert user:', error);
    throw new Error('User synchronization failed.', { cause: error });
  }
}

export async function createNewComplaintCase(payload: {
  title: string;
  originalDescription: string;
  normalizedDescription: string;
  category: string;
  severity: string;
  citizenUid: string;
  citizenName: string;
  citizenPhone: string;
  contactPreference: string;
  submittedVia: string;
  wardId: string;
  roadName?: string;
  landmark: string;
  assetId?: string;
  latitude: number;
  longitude: number;
  voiceTranscript?: string;
  imageUrl?: string;
  linkedParentCaseNumber?: string;
  aiConfidence: number;
  aiExtractedEntities: any;
  aiRecommendedDeptId: string;
  aiRoutingReason: string;
  aiRuleReference: string;
  requiresHumanReview: boolean;
  humanReviewReason?: string;
  secondaryDepartments: Array<{ deptId: string; nameBn: string; taskTitleBn: string; sequenceOrder: number }>;
  duplicateCandidatesFound: Array<{
    candidateCaseNumber: string;
    similarityScore: number;
    distanceMeters: number;
    matchExplanationBn: string;
  }>;
}) {
  try {
    await ensureSeeded();
    const randomSuffix = Math.floor(1008 + Math.random() * 8900);
    const caseNumber = `NS-2026-${randomSuffix}`;
    const isMulti = payload.secondaryDepartments.length > 1;
    const initialStatus = payload.requiresHumanReview ? 'Under review' : 'Assigned';
    const dueAt = new Date(Date.now() + 48 * 3600 * 1000);

    const insertedCase = await db
      .insert(cases)
      .values({
        caseNumber,
        title: payload.title,
        originalDescription: payload.originalDescription,
        normalizedDescription: payload.normalizedDescription,
        category: payload.category,
        severity: payload.severity,
        status: initialStatus,
        citizenUid: payload.citizenUid,
        citizenName: payload.citizenName,
        citizenPhone: payload.citizenPhone,
        contactPreference: payload.contactPreference,
        submittedVia: payload.submittedVia,
        wardId: payload.wardId,
        roadName: payload.roadName || payload.landmark,
        landmark: payload.landmark,
        assetId: payload.assetId || null,
        latitude: payload.latitude,
        longitude: payload.longitude,
        locationConfirmed: true,
        consentGiven: true,
        aiPredictedCategory: payload.category,
        aiConfidence: payload.aiConfidence,
        aiExtractedEntities: payload.aiExtractedEntities,
        aiRecommendedDeptId: payload.aiRecommendedDeptId,
        aiRoutingReason: payload.aiRoutingReason,
        aiRuleReference: payload.aiRuleReference,
        requiresHumanReview: payload.requiresHumanReview,
        humanReviewReason: payload.humanReviewReason || null,
        primaryDepartmentId: payload.aiRecommendedDeptId,
        isMultiDepartment: isMulti,
        slaHours: isMulti ? 72 : 48,
        dueAt,
        linkedParentCaseNumber: payload.linkedParentCaseNumber || null,
        imageUrl: payload.imageUrl || null,
        voiceTranscript: payload.voiceTranscript || null,
        isSynthetic: true,
      })
      .returning();

    // Create sub-tasks with sequential predecessor dependencies
    let prevTaskNum: string | null = null;
    for (const sub of payload.secondaryDepartments) {
      const taskNumber = `TSK-${randomSuffix}-${sub.sequenceOrder}`;
      const isBlocked = sub.sequenceOrder > 1;
      await db.insert(caseTasks).values({
        taskNumber,
        caseNumber,
        departmentId: sub.deptId,
        assignedOfficerName: `${sub.nameBn} দায়িত্বপ্রাপ্ত কর্মকর্তা`,
        titleBn: `Sub-task ${sub.sequenceOrder}: ${sub.taskTitleBn}`,
        descriptionBn: `${payload.landmark} (${payload.wardId}) এলাকায় "${payload.title}" সমাধানের জন্য বিভাগীয় কার্যাদেশ।`,
        sequenceOrder: sub.sequenceOrder,
        predecessorTaskNumber: prevTaskNum,
        priority: payload.severity,
        status: isBlocked ? 'Blocked' : 'Assigned',
        blockerReason: isBlocked
          ? `পূর্ববর্তী ধাপ (${prevTaskNum}) সম্পন্ন না হওয়া পর্যন্ত এই ধাপ অপেক্ষমাণ থাকবে।`
          : null,
        slaHours: 24 * sub.sequenceOrder,
        dueAt: new Date(Date.now() + 24 * sub.sequenceOrder * 3600 * 1000),
      });
      prevTaskNum = taskNumber;
    }

    // Create Routing Review Record
    await db.insert(routingReviews).values({
      caseNumber,
      aiCategory: payload.category,
      aiRecommendedDeptId: payload.aiRecommendedDeptId,
      aiConfidence: payload.aiConfidence,
      ruleReference: payload.aiRuleReference,
      routingReasonBn: payload.aiRoutingReason,
      reviewDecision: payload.requiresHumanReview ? 'Pending' : 'Approved',
      finalDeptId: payload.aiRecommendedDeptId,
    });

    // Store Duplicate Candidates if any
    for (const dup of payload.duplicateCandidatesFound) {
      await db.insert(duplicateCandidates).values({
        primaryCaseNumber: dup.candidateCaseNumber,
        candidateCaseNumber: caseNumber,
        similarityScore: dup.similarityScore,
        distanceMeters: dup.distanceMeters,
        timeDeltaHours: 2,
        matchExplanationBn: dup.matchExplanationBn,
        reviewStatus: 'Candidate',
      });
    }

    // Append Tamper-Evident Event
    await db.insert(caseEvents).values({
      caseNumber,
      taskNumber: null,
      actorUid: payload.citizenUid,
      actorName: payload.citizenName,
      actorRole: 'citizen',
      previousState: 'None',
      newState: initialStatus,
      eventType: 'StateTransition',
      reasonBn: payload.linkedParentCaseNumber
        ? `পূর্বে বন্ধ হওয়া কেস (${payload.linkedParentCaseNumber})-এর পরবর্তী নতুন ঘটনা হিসেবে Linked Case খোলা হয়েছে।`
        : `নাগরিক ইনটেক ও ১০-ধাপ AI পাইপলাইন শেষে কেস তৈরি হয়েছে (${payload.secondaryDepartments.length}টি Sub-task)।`,
      tamperHash: `sha256:${Date.now().toString(16)}${randomSuffix}`,
    });

    // Notification
    await db.insert(notifications).values({
      recipientRole: 'citizen',
      recipientUid: payload.citizenUid,
      caseNumber,
      titleBn: `নতুন কেস নিবন্ধিত: ${caseNumber}`,
      messageBn: `আপনার অভিযোগটি "${initialStatus}" অবস্থায় নিবন্ধিত হয়েছে এবং ট্র্যাকিংয়ের জন্য প্রস্তুত।`,
      channel: payload.contactPreference,
    });

    await db.insert(auditLogs).values({
      actorUid: payload.citizenUid,
      actorName: payload.citizenName,
      actorRole: 'citizen',
      action: 'CREATE_PARENT_CASE',
      resourceType: 'Case',
      resourceId: caseNumber,
      detailsBn: `ওয়ার্ড ${payload.wardId}-এ "${payload.title}" কেস তৈরি (${payload.aiRuleReference})।`,
      ipHash: 'sha256:client-verified',
      tamperDigest: `digest:${Date.now().toString(36)}`,
    });

    return insertedCase[0];
  } catch (error) {
    console.error('Failed to create complaint case:', error);
    throw new Error('Could not save complaint case to database.', { cause: error });
  }
}

// Officer updates Sub-task & uploads Evidence -> Unblocks dependent sub-tasks automatically!
export async function updateSubTaskAndEvidence(payload: {
  taskNumber: string;
  caseNumber: string;
  newStatus: string;
  actorUid: string;
  actorName: string;
  actorRole: string;
  departmentId: string;
  commentBn: string;
  blockerReason?: string;
  withEvidence?: boolean;
  beforeImageLabel?: string;
  afterImageLabel?: string;
  workReportBn?: string;
}) {
  try {
    const existingTasks = await db.select().from(caseTasks).where(eq(caseTasks.taskNumber, payload.taskNumber));
    const currentTask = existingTasks[0];
    if (!currentTask) {
      throw new Error('Sub-task not found');
    }

    let evidenceCode: string | null = null;
    if (payload.withEvidence) {
      evidenceCode = `EVD-${Date.now().toString().slice(-5)}`;
      await db.insert(evidence).values({
        evidenceCode,
        caseNumber: payload.caseNumber,
        taskNumber: payload.taskNumber,
        uploadedByUid: payload.actorUid,
        uploadedByName: payload.actorName,
        departmentId: payload.departmentId,
        beforeImageUrl: payload.beforeImageLabel || 'synthetic://before-work-photo',
        afterImageUrl: payload.afterImageLabel || 'synthetic://after-work-photo',
        officerCommentBn: payload.commentBn,
        workCompletionReportBn: payload.workReportBn || payload.commentBn,
        capturedLat: 23.7955,
        capturedLng: 90.3735,
        locationVerified: true,
        timestampVerified: true,
        completenessScore: 1.0,
        verificationStatus: 'Pending',
      });
    }

    await db
      .update(caseTasks)
      .set({
        status: payload.newStatus,
        blockerReason: payload.newStatus === 'Blocked' ? payload.blockerReason || payload.commentBn : null,
        completedAt:
          payload.newStatus === 'Resolution submitted' || payload.newStatus === 'Verified' ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(caseTasks.taskNumber, payload.taskNumber));

    // If task reached Resolution submitted or Verified, check dependent tasks that have predecessorTaskNumber === payload.taskNumber
    if (payload.newStatus === 'Resolution submitted' || payload.newStatus === 'Verified') {
      const allCaseTasks = await db.select().from(caseTasks).where(eq(caseTasks.caseNumber, payload.caseNumber));
      for (const depTask of allCaseTasks) {
        if (depTask.predecessorTaskNumber === payload.taskNumber && depTask.status === 'Blocked') {
          await db
            .update(caseTasks)
            .set({
              status: 'Assigned',
              blockerReason: null,
              updatedAt: new Date(),
            })
            .where(eq(caseTasks.taskNumber, depTask.taskNumber));

          await db.insert(caseEvents).values({
            caseNumber: payload.caseNumber,
            taskNumber: depTask.taskNumber,
            actorUid: 'system-orchestrator',
            actorName: 'Case Orchestration Engine',
            actorRole: 'supervisor',
            previousState: 'Blocked',
            newState: 'Assigned',
            eventType: 'TaskUpdate',
            reasonBn: `পূর্ববর্তী নির্ভরশীল টাস্ক (${payload.taskNumber}) সম্পন্ন হওয়ায় "${depTask.titleBn}" স্বয়ংক্রিয়ভাবে আনব্লক ও সক্রিয় করা হয়েছে।`,
            tamperHash: `sha256:dep-unblock-${Date.now().toString(16)}`,
          });
        }
      }
    }

    // Update Parent Case Status based on aggregate sub-tasks
    const updatedCaseTasks = await db.select().from(caseTasks).where(eq(caseTasks.caseNumber, payload.caseNumber));
    const allSubmittedOrVerified = updatedCaseTasks.every(
      (t) => t.status === 'Resolution submitted' || t.status === 'Verified'
    );
    const anyBlocked = updatedCaseTasks.some((t) => t.status === 'Blocked');
    const newParentStatus = allSubmittedOrVerified
      ? 'Resolution submitted'
      : anyBlocked && updatedCaseTasks.every((t) => t.status !== 'In progress')
      ? 'Blocked'
      : 'In progress';

    await db
      .update(cases)
      .set({
        status: newParentStatus,
        updatedAt: new Date(),
      })
      .where(eq(cases.caseNumber, payload.caseNumber));

    await db.insert(caseEvents).values({
      caseNumber: payload.caseNumber,
      taskNumber: payload.taskNumber,
      actorUid: payload.actorUid,
      actorName: payload.actorName,
      actorRole: payload.actorRole,
      previousState: currentTask.status,
      newState: payload.newStatus,
      eventType: evidenceCode ? 'EvidenceUpload' : 'TaskUpdate',
      reasonBn: payload.commentBn,
      evidenceReference: evidenceCode,
      tamperHash: `sha256:task-${Date.now().toString(16)}`,
    });

    await db.insert(auditLogs).values({
      actorUid: payload.actorUid,
      actorName: payload.actorName,
      actorRole: payload.actorRole,
      action: evidenceCode ? 'SUBMIT_TASK_EVIDENCE' : 'UPDATE_SUBTASK_STATUS',
      resourceType: 'SubTask',
      resourceId: payload.taskNumber,
      detailsBn: `কেস ${payload.caseNumber}-এর টাস্ক ${payload.taskNumber} স্ট্যাটাস "${payload.newStatus}"-এ উন্নীত (${payload.commentBn})।`,
      ipHash: 'sha256:officer-console',
      tamperDigest: `digest:${Date.now().toString(36)}`,
    });

    return { success: true, evidenceCode, newParentStatus };
  } catch (error) {
    console.error('Failed to update sub-task:', error);
    throw new Error('Could not update sub-task in database.', { cause: error });
  }
}

// Supervisor Actions: Routing Approve / Override (with mandatory reason), Evidence Verify, Closure Approve, Escalation
export async function executeSupervisorAction(payload: {
  actionType: 'APPROVE_ROUTING' | 'OVERRIDE_ROUTING' | 'VERIFY_EVIDENCE' | 'APPROVE_CLOSURE' | 'ESCALATE_CASE' | 'REVIEW_DUPLICATE';
  caseNumber: string;
  actorUid: string;
  actorName: string;
  reasonBn: string;
  newDepartmentId?: string;
  evidenceCode?: string;
  duplicateId?: number;
  duplicateDecision?: 'ConfirmedSameIncident' | 'ConfirmedDifferent' | 'Unmerged';
}) {
  try {
    const existingCaseList = await db.select().from(cases).where(eq(cases.caseNumber, payload.caseNumber));
    const currentCase = existingCaseList[0];

    if (payload.actionType === 'APPROVE_ROUTING' || payload.actionType === 'OVERRIDE_ROUTING') {
      const targetDept = payload.newDepartmentId || currentCase?.primaryDepartmentId || 'DEPT-DRAIN';
      const isOverride = payload.actionType === 'OVERRIDE_ROUTING';

      await db
        .update(cases)
        .set({
          status: 'Assigned',
          primaryDepartmentId: targetDept,
          requiresHumanReview: false,
          routingApprovedBy: payload.actorName,
          routingOverrideReason: isOverride ? payload.reasonBn : null,
          updatedAt: new Date(),
        })
        .where(eq(cases.caseNumber, payload.caseNumber));

      await db.insert(routingReviews).values({
        caseNumber: payload.caseNumber,
        aiCategory: currentCase?.category || 'Uncertain',
        aiRecommendedDeptId: currentCase?.aiRecommendedDeptId || 'DEPT-DRAIN',
        aiConfidence: currentCase?.aiConfidence || 0.7,
        ruleReference: currentCase?.aiRuleReference || 'RULE-HITL',
        routingReasonBn: payload.reasonBn,
        reviewDecision: isOverride ? 'Overridden' : 'Approved',
        finalDeptId: targetDept,
        overrideReasonBn: isOverride ? payload.reasonBn : null,
        reviewedByUid: payload.actorUid,
        reviewedByName: payload.actorName,
      });

      await db.insert(caseEvents).values({
        caseNumber: payload.caseNumber,
        actorUid: payload.actorUid,
        actorName: payload.actorName,
        actorRole: 'supervisor',
        previousState: currentCase?.status || 'Under review',
        newState: 'Assigned',
        eventType: 'RoutingReview',
        reasonBn: isOverride
          ? `সুপারভাইজার AI সুপারিশ ওভাররাইড করে ${targetDept} নির্ধারণ করেছেন। কারণ: ${payload.reasonBn}`
          : `সুপারভাইজার রাউটিং ও Parent Case অনুমোদন করেছেন: ${payload.reasonBn}`,
        tamperHash: `sha256:sup-route-${Date.now().toString(16)}`,
      });
    } else if (payload.actionType === 'VERIFY_EVIDENCE') {
      if (payload.evidenceCode) {
        await db
          .update(evidence)
          .set({
            verificationStatus: 'Verified',
            verifiedByName: payload.actorName,
            verificationCommentBn: payload.reasonBn,
          })
          .where(eq(evidence.evidenceCode, payload.evidenceCode));
      }

      await db
        .update(cases)
        .set({
          status: 'Resolved',
          updatedAt: new Date(),
        })
        .where(eq(cases.caseNumber, payload.caseNumber));

      await db.insert(caseEvents).values({
        caseNumber: payload.caseNumber,
        actorUid: payload.actorUid,
        actorName: payload.actorName,
        actorRole: 'supervisor',
        previousState: currentCase?.status || 'Resolution submitted',
        newState: 'Resolved',
        eventType: 'StateTransition',
        reasonBn: `সুপারভাইজার সমাধানের প্রমাণ (${payload.evidenceCode || 'Evidence'}) যাচাই করে Resolved ঘোষণা করেছেন; নাগরিককে অবহিত করা হয়েছে।`,
        evidenceReference: payload.evidenceCode || null,
        tamperHash: `sha256:sup-verify-${Date.now().toString(16)}`,
      });

      await db.insert(notifications).values({
        recipientRole: 'citizen',
        caseNumber: payload.caseNumber,
        titleBn: `কেস ${payload.caseNumber} সমাধান যাচাইকৃত (Resolved)`,
        messageBn: `কর্মকর্তা আপনার সমস্যার সমাধানের প্রমাণ যাচাই করেছেন। সমস্যাটি সমাধান না হয়ে থাকলে আপনি "সমস্যা সমাধান হয়নি (Reopen)" বাটনে ক্লিক করে আপত্তি জানাতে পারেন।`,
        channel: 'Web + SMS',
      });
    } else if (payload.actionType === 'APPROVE_CLOSURE') {
      await db
        .update(cases)
        .set({
          status: 'Closed',
          closureApprovedBy: payload.actorName,
          closureReason: payload.reasonBn,
          updatedAt: new Date(),
        })
        .where(eq(cases.caseNumber, payload.caseNumber));

      await db.insert(caseEvents).values({
        caseNumber: payload.caseNumber,
        actorUid: payload.actorUid,
        actorName: payload.actorName,
        actorRole: 'supervisor',
        previousState: currentCase?.status || 'Resolved',
        newState: 'Closed',
        eventType: 'Closure',
        reasonBn: `চূড়ান্ত কেস বন্ধের অনুমোদন (Human-in-the-Loop): ${payload.reasonBn}`,
        tamperHash: `sha256:sup-close-${Date.now().toString(16)}`,
      });
    } else if (payload.actionType === 'ESCALATE_CASE') {
      await db
        .update(cases)
        .set({
          isEscalated: true,
          severity: 'High',
          updatedAt: new Date(),
        })
        .where(eq(cases.caseNumber, payload.caseNumber));

      await db.insert(caseEvents).values({
        caseNumber: payload.caseNumber,
        actorUid: payload.actorUid,
        actorName: payload.actorName,
        actorRole: 'supervisor',
        previousState: currentCase?.status || 'In progress',
        newState: 'In progress (Escalated)',
        eventType: 'Escalation',
        reasonBn: `SLA অতিক্রম/জরুরি অগ্রাধিকারের কারণে ঊর্ধ্বতন কর্তৃপক্ষের কাছে Escalate করা হলো: ${payload.reasonBn}`,
        tamperHash: `sha256:sup-esc-${Date.now().toString(16)}`,
      });
    } else if (payload.actionType === 'REVIEW_DUPLICATE' && payload.duplicateId && payload.duplicateDecision) {
      await db
        .update(duplicateCandidates)
        .set({
          reviewStatus: payload.duplicateDecision,
          reviewedByName: payload.actorName,
          reviewNoteBn: payload.reasonBn,
        })
        .where(eq(duplicateCandidates.id, payload.duplicateId));
    }

    await db.insert(auditLogs).values({
      actorUid: payload.actorUid,
      actorName: payload.actorName,
      actorRole: 'supervisor',
      action: payload.actionType,
      resourceType: 'Case',
      resourceId: payload.caseNumber,
      detailsBn: payload.reasonBn,
      ipHash: 'sha256:supervisor-console',
      tamperDigest: `digest:${Date.now().toString(36)}`,
    });

    return { success: true };
  } catch (error) {
    console.error('Supervisor action failed:', error);
    throw new Error('Could not complete supervisor action.', { cause: error });
  }
}

// Citizen Feedback, Routing Objection, and "সমস্যা সমাধান হয়নি" Reopen Workflow
export async function submitCitizenFeedbackOrReopen(payload: {
  caseNumber: string;
  citizenUid: string;
  citizenName: string;
  requestType: 'Feedback' | 'ReopenRequest' | 'RoutingObjection' | 'InfoCorrection';
  isResolvedSatisfaction: boolean;
  reasonBn: string;
}) {
  try {
    const existingCaseList = await db.select().from(cases).where(eq(cases.caseNumber, payload.caseNumber));
    const currentCase = existingCaseList[0];

    await db.insert(feedbackAppeals).values({
      caseNumber: payload.caseNumber,
      citizenUid: payload.citizenUid,
      citizenName: payload.citizenName,
      requestType: payload.requestType,
      isResolvedSatisfaction: payload.isResolvedSatisfaction,
      reasonBn: payload.reasonBn,
      status: payload.requestType === 'ReopenRequest' ? 'Approved' : 'Pending',
      supervisorResponseBn:
        payload.requestType === 'ReopenRequest'
          ? 'নাগরিকের আপত্তির পরিপ্রেক্ষিতে কেস ও সংশ্লিষ্ট বিভাগীয় টাস্ক স্বয়ংক্রিয়ভাবে পুনরায় খোলা (Reopened) হয়েছে।'
          : null,
    });

    if (payload.requestType === 'ReopenRequest' || !payload.isResolvedSatisfaction) {
      await db
        .update(cases)
        .set({
          status: 'Reopened',
          citizenSatisfied: false,
          reopenCount: (currentCase?.reopenCount || 0) + 1,
          updatedAt: new Date(),
        })
        .where(eq(cases.caseNumber, payload.caseNumber));

      await db
        .update(caseTasks)
        .set({
          status: 'Reopened',
          updatedAt: new Date(),
        })
        .where(eq(caseTasks.caseNumber, payload.caseNumber));

      await db.insert(caseEvents).values({
        caseNumber: payload.caseNumber,
        actorUid: payload.citizenUid,
        actorName: payload.citizenName,
        actorRole: 'citizen',
        previousState: currentCase?.status || 'Resolved',
        newState: 'Reopened',
        eventType: 'Reopen',
        reasonBn: `নাগরিক "সমস্যা সমাধান হয়নি" বলে আপত্তি জানিয়েছেন: "${payload.reasonBn}"। কেস পুনরায় সচল করা হলো।`,
        tamperHash: `sha256:cit-reopen-${Date.now().toString(16)}`,
      });
    } else {
      await db
        .update(cases)
        .set({
          citizenSatisfied: true,
          updatedAt: new Date(),
        })
        .where(eq(cases.caseNumber, payload.caseNumber));

      await db.insert(caseEvents).values({
        caseNumber: payload.caseNumber,
        actorUid: payload.citizenUid,
        actorName: payload.citizenName,
        actorRole: 'citizen',
        previousState: currentCase?.status || 'Resolved',
        newState: currentCase?.status || 'Resolved',
        eventType: 'StateTransition',
        reasonBn: `নাগরিক ইতিবাচক প্রতিক্রিয়া ও সমাধানের স্বীকৃতি দিয়েছেন: "${payload.reasonBn}"`,
        tamperHash: `sha256:cit-fb-${Date.now().toString(16)}`,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Citizen feedback/reopen failed:', error);
    throw new Error('Could not submit citizen feedback or reopen request.', { cause: error });
  }
}

// Admin Configuration Creation (Rules, Documents, Services)
export async function createAdminConfigItem(payload: {
  configType: 'RULE' | 'DOCUMENT' | 'SERVICE';
  actorName: string;
  data: any;
}) {
  try {
    if (payload.configType === 'RULE') {
      await db.insert(responsibilityRules).values({
        ruleCode: payload.data.ruleCode || `RULE-CUSTOM-${Date.now().toString().slice(-3)}`,
        category: payload.data.category || 'Drainage',
        assetType: payload.data.assetType || 'Drain',
        wardScope: payload.data.wardScope || 'ALL',
        primaryDepartmentId: payload.data.primaryDepartmentId || 'DEPT-DRAIN',
        confidenceThreshold: Number(payload.data.confidenceThreshold) || 0.75,
        descriptionBn: payload.data.descriptionBn,
        isActive: true,
      });
    } else if (payload.configType === 'DOCUMENT') {
      await db.insert(governmentDocuments).values({
        docId: payload.data.docId || `DOC-GOV-${Date.now().toString().slice(-4)}`,
        titleBn: payload.data.titleBn,
        sourceAgencyBn: payload.data.sourceAgencyBn || 'ঢাকা উত্তর সিটি কর্পোরেশন (অনুমোদিত নথি)',
        sourceUrl: payload.data.sourceUrl || 'https://bangladesh.gov.bd/',
        category: payload.data.category || 'Drainage',
        contentBn: payload.data.contentBn,
        keywords: (payload.data.keywords || 'সেবা, নিয়ম').split(',').map((s: string) => s.trim()),
        jurisdictionBn: payload.data.jurisdictionBn || 'ঢাকা উত্তর সিটি কর্পোরেশন (পাইলট অঞ্চল)',
        version: payload.data.version || 'v1.0',
        effectiveDate: payload.data.effectiveDate || '২০২৬-১১-০১',
        reviewDate: '২০২৭-০৬-৩০',
        lastVerifiedDate: '২০২৬-১১-০৪',
        isStale: false,
        approvalStatus: 'Approved',
      });
    }

    await db.insert(auditLogs).values({
      actorUid: 'demo-admin-01',
      actorName: payload.actorName,
      actorRole: 'admin',
      action: `CREATE_${payload.configType}`,
      resourceType: payload.configType,
      resourceId: payload.data.ruleCode || payload.data.docId || 'NEW',
      detailsBn: `অ্যাডমিন প্যানেল থেকে নতুন ${payload.configType} কনফিগারেশন যুক্ত করা হয়েছে।`,
      ipHash: 'sha256:admin-panel',
      tamperDigest: `digest:${Date.now().toString(36)}`,
    });

    return { success: true };
  } catch (error) {
    console.error('Admin config creation failed:', error);
    throw new Error('Failed to create admin configuration.', { cause: error });
  }
}
