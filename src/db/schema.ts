import { relations } from 'drizzle-orm';
import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  doublePrecision,
  jsonb,
} from 'drizzle-orm/pg-core';

// 1. Users & RBAC Profiles
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID or demo UID
  email: text('email').notNull(),
  name: text('name').notNull(),
  nameBn: text('name_bn'),
  phone: text('phone'),
  role: text('role').notNull().default('citizen'), // citizen | ward_desk | officer | supervisor | admin | researcher | auditor
  departmentId: text('department_id'),
  wardId: text('ward_id'),
  mfaEnabled: boolean('mfa_enabled').default(false),
  isActive: boolean('is_active').default(true),
  isSynthetic: boolean('is_synthetic').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Roles & Permissions
export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  nameBn: text('name_bn').notNull(),
  nameEn: text('name_en').notNull(),
  allowedActions: text('allowed_actions').notNull(),
  restrictedActions: text('restricted_actions').notNull(),
});

// 3. City Corporations & Wards
export const cityCorporations = pgTable('city_corporations', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  nameBn: text('name_bn').notNull(),
  nameEn: text('name_en').notNull(),
  isPilot: boolean('is_pilot').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const wards = pgTable('wards', {
  id: serial('id').primaryKey(),
  wardId: text('ward_id').notNull().unique(), // e.g. WARD-01
  cityCorpCode: text('city_corp_code').notNull(),
  wardNumber: integer('ward_number').notNull(),
  nameBn: text('name_bn').notNull(),
  nameEn: text('name_en').notNull(),
  zoneName: text('zone_name').notNull(),
  centerLat: doublePrecision('center_lat').notNull(),
  centerLng: doublePrecision('center_lng').notNull(),
  polygonGeoJson: jsonb('polygon_geojson').notNull(),
  councillorOffice: text('councillor_office'),
  deskContact: text('desk_contact'),
  effectiveDate: text('effective_date').notNull(),
});

// 4. Departments
export const departments = pgTable('departments', {
  id: serial('id').primaryKey(),
  deptId: text('dept_id').notNull().unique(), // e.g. DEPT-WASTE
  nameBn: text('name_bn').notNull(),
  nameEn: text('name_en').notNull(),
  serviceArea: text('service_area').notNull(),
  operatingHours: text('operating_hours').notNull(),
  escalationContact: text('escalation_contact').notNull(),
  responsibleCategories: jsonb('responsible_categories').notNull(), // string[]
  defaultSlaHours: integer('default_sla_hours').notNull().default(48),
  isActive: boolean('is_active').default(true),
});

// 5. Assets Registry
export const assets = pgTable('assets', {
  id: serial('id').primaryKey(),
  assetId: text('asset_id').notNull().unique(), // e.g. AST-DRN-101
  assetType: text('asset_type').notNull(), // Drain | Road | Streetlight | WasteBin | TransferStation
  nameBn: text('name_bn').notNull(),
  wardId: text('ward_id').notNull(),
  landmark: text('landmark').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  ownerDepartmentId: text('owner_department_id').notNull(),
  maintenanceDepartmentId: text('maintenance_department_id').notNull(),
  status: text('status').notNull().default('Active'),
  isSynthetic: boolean('is_synthetic').default(true),
});

// 6. Responsibility & Routing Rules
export const responsibilityRules = pgTable('responsibility_rules', {
  id: serial('id').primaryKey(),
  ruleCode: text('rule_code').notNull().unique(), // e.g. RULE-WM-01
  category: text('category').notNull(), // Waste | Drainage | Streetlight | Road | Multi
  assetType: text('asset_type'),
  wardScope: text('ward_scope').default('ALL'),
  primaryDepartmentId: text('primary_department_id').notNull(),
  secondaryDepartments: jsonb('secondary_departments'), // string[] for multi-department workflows
  defaultSubTasksTemplate: jsonb('default_sub_tasks_template'), // sequential workflow template
  confidenceThreshold: doublePrecision('confidence_threshold').notNull().default(0.75),
  requiresHumanReviewIfLow: boolean('requires_human_review_if_low').default(true),
  descriptionBn: text('description_bn').notNull(),
  isActive: boolean('is_active').default(true),
});

// 7. SLA Rules
export const slaRules = pgTable('sla_rules', {
  id: serial('id').primaryKey(),
  departmentId: text('department_id').notNull(),
  category: text('category').notNull(),
  severity: text('severity').notNull(), // High | Medium | Low | Critical
  slaHours: integer('sla_hours').notNull(),
  warningThresholdHours: integer('warning_threshold_hours').notNull(),
  escalationThresholdHours: integer('escalation_threshold_hours').notNull(),
});

// 8. Government Services Catalogue (Level 1 Discover)
export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  serviceId: text('service_id').notNull().unique(),
  titleBn: text('title_bn').notNull(),
  titleEn: text('title_en').notNull(),
  category: text('category').notNull(),
  departmentId: text('department_id').notNull(),
  descriptionBn: text('description_bn').notNull(),
  eligibilityBn: text('eligibility_bn').notNull(),
  requiredDocumentsBn: jsonb('required_documents_bn').notNull(), // string[]
  feeBn: text('fee_bn').notNull(),
  slaBn: text('sla_bn').notNull(),
  officialUrl: text('official_url').notNull(),
  jurisdictionBn: text('jurisdiction_bn').notNull(),
  effectiveDate: text('effective_date').notNull(),
  lastVerifiedDate: text('last_verified_date').notNull(),
  integrationLevel: text('integration_level').notNull().default('Level 1: Discover'),
  isSynthetic: boolean('is_synthetic').default(true),
});

// 9. Approved Government Documents & Chunks (for RAG)
export const governmentDocuments = pgTable('government_documents', {
  id: serial('id').primaryKey(),
  docId: text('doc_id').notNull().unique(),
  titleBn: text('title_bn').notNull(),
  sourceAgencyBn: text('source_agency_bn').notNull(),
  sourceUrl: text('source_url').notNull(),
  category: text('category').notNull(),
  contentBn: text('content_bn').notNull(),
  keywords: jsonb('keywords').notNull(), // string[]
  jurisdictionBn: text('jurisdiction_bn').notNull(),
  version: text('version').notNull(),
  effectiveDate: text('effective_date').notNull(),
  reviewDate: text('review_date').notNull(),
  lastVerifiedDate: text('last_verified_date').notNull(),
  isStale: boolean('is_stale').default(false),
  approvalStatus: text('approval_status').notNull().default('Approved'),
  isSynthetic: boolean('is_synthetic').default(true),
});

// 10. Parent Cases (Core Citizen Incidents)
export const cases = pgTable('cases', {
  id: serial('id').primaryKey(),
  caseNumber: text('case_number').notNull().unique(), // e.g. NS-2026-1001
  title: text('title').notNull(),
  originalDescription: text('original_description').notNull(),
  normalizedDescription: text('normalized_description').notNull(),
  category: text('category').notNull(), // Waste | Drainage | Streetlight | Road | Other | Uncertain
  severity: text('severity').notNull().default('Medium'), // Low | Medium | High | Emergency
  status: text('status').notNull().default('Submitted'),
  // States: Submitted | Information needed | Under review | Assigned | In progress | Blocked | Resolution submitted | Resolved | Reopened | Closed | Rejected with reason
  citizenUid: text('citizen_uid').notNull(),
  citizenName: text('citizen_name').notNull(),
  citizenPhone: text('citizen_phone'),
  contactPreference: text('contact_preference').default('Web + SMS'),
  submittedVia: text('submitted_via').default('Web Portal'), // Web Portal | Voice Intake | Ward Desk Assisted
  wardId: text('ward_id').notNull(),
  roadName: text('road_name'),
  landmark: text('landmark').notNull(),
  assetId: text('asset_id'),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  locationConfirmed: boolean('location_confirmed').default(true),
  consentGiven: boolean('consent_given').default(true),
  // AI Pipeline Outputs
  aiPredictedCategory: text('ai_predicted_category'),
  aiConfidence: doublePrecision('ai_confidence').default(0.85),
  aiExtractedEntities: jsonb('ai_extracted_entities'),
  aiRecommendedDeptId: text('ai_recommended_dept_id'),
  aiRoutingReason: text('ai_routing_reason'),
  aiRuleReference: text('ai_rule_reference'),
  requiresHumanReview: boolean('requires_human_review').default(false),
  humanReviewReason: text('human_review_reason'),
  // Routing & Ownership
  primaryDepartmentId: text('primary_department_id').notNull(),
  isMultiDepartment: boolean('is_multi_department').default(false),
  routingApprovedBy: text('routing_approved_by'),
  routingOverrideReason: text('routing_override_reason'),
  // SLA & Linked Cases
  slaHours: integer('sla_hours').notNull().default(48),
  dueAt: timestamp('due_at').notNull(),
  isOverdue: boolean('is_overdue').default(false),
  isEscalated: boolean('is_escalated').default(false),
  linkedParentCaseNumber: text('linked_parent_case_number'),
  imageUrl: text('image_url'),
  voiceTranscript: text('voice_transcript'),
  citizenSatisfied: boolean('citizen_satisfied'),
  reopenCount: integer('reopen_count').default(0),
  closureApprovedBy: text('closure_approved_by'),
  closureReason: text('closure_reason'),
  isSynthetic: boolean('is_synthetic').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 11. Department Sub-Tasks (Under a Parent Case)
export const caseTasks = pgTable('case_tasks', {
  id: serial('id').primaryKey(),
  taskNumber: text('task_number').notNull().unique(), // e.g. TSK-1001-1
  caseNumber: text('case_number').notNull(),
  departmentId: text('department_id').notNull(),
  assignedOfficerUid: text('assigned_officer_uid'),
  assignedOfficerName: text('assigned_officer_name'),
  titleBn: text('title_bn').notNull(),
  descriptionBn: text('description_bn').notNull(),
  sequenceOrder: integer('sequence_order').notNull().default(1),
  predecessorTaskNumber: text('predecessor_task_number'), // Task ID this task depends on
  priority: text('priority').notNull().default('Medium'),
  status: text('status').notNull().default('Assigned'), // Assigned | Blocked | In progress | Resolution submitted | Verified | Reopened
  blockerReason: text('blocker_reason'),
  slaHours: integer('sla_hours').notNull().default(24),
  dueAt: timestamp('due_at').notNull(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 12. Append-Only Tamper-Evident Case & Task Events
export const caseEvents = pgTable('case_events', {
  id: serial('id').primaryKey(),
  caseNumber: text('case_number').notNull(),
  taskNumber: text('task_number'),
  actorUid: text('actor_uid').notNull(),
  actorName: text('actor_name').notNull(),
  actorRole: text('actor_role').notNull(),
  previousState: text('previous_state').notNull(),
  newState: text('new_state').notNull(),
  eventType: text('event_type').notNull(), // StateTransition | RoutingReview | TaskUpdate | EvidenceUpload | Escalation | Reopen | Closure
  reasonBn: text('reason_bn').notNull(),
  evidenceReference: text('evidence_reference'),
  tamperHash: text('tamper_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 13. Evidence Verification Records
export const evidence = pgTable('evidence', {
  id: serial('id').primaryKey(),
  evidenceCode: text('evidence_code').notNull().unique(), // e.g. EVD-1001-1
  caseNumber: text('case_number').notNull(),
  taskNumber: text('task_number'),
  uploadedByUid: text('uploaded_by_uid').notNull(),
  uploadedByName: text('uploaded_by_name').notNull(),
  departmentId: text('department_id').notNull(),
  beforeImageUrl: text('before_image_url'),
  afterImageUrl: text('after_image_url'),
  officerCommentBn: text('officer_comment_bn').notNull(),
  workCompletionReportBn: text('work_completion_report_bn').notNull(),
  capturedLat: doublePrecision('captured_lat'),
  capturedLng: doublePrecision('captured_lng'),
  locationVerified: boolean('location_verified').default(true),
  timestampVerified: boolean('timestamp_verified').default(true),
  completenessScore: doublePrecision('completeness_score').default(1.0),
  verificationStatus: text('verification_status').notNull().default('Pending'), // Pending | Verified | Rejected
  verifiedByName: text('verified_by_name'),
  verificationCommentBn: text('verification_comment_bn'),
  citizenObjectionBn: text('citizen_objection_bn'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 14. Routing Recommendations & Human-in-the-Loop Reviews
export const routingReviews = pgTable('routing_reviews', {
  id: serial('id').primaryKey(),
  caseNumber: text('case_number').notNull(),
  aiCategory: text('ai_category').notNull(),
  aiRecommendedDeptId: text('ai_recommended_dept_id').notNull(),
  aiConfidence: doublePrecision('ai_confidence').notNull(),
  ruleReference: text('rule_reference').notNull(),
  routingReasonBn: text('routing_reason_bn').notNull(),
  reviewDecision: text('review_decision').notNull().default('Pending'), // Pending | Approved | Overridden
  finalDeptId: text('final_dept_id').notNull(),
  overrideReasonBn: text('override_reason_bn'),
  reviewedByUid: text('reviewed_by_uid'),
  reviewedByName: text('reviewed_by_name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 15. Duplicate Candidates & Human Confirmation
export const duplicateCandidates = pgTable('duplicate_candidates', {
  id: serial('id').primaryKey(),
  primaryCaseNumber: text('primary_case_number').notNull(),
  candidateCaseNumber: text('candidate_case_number').notNull(),
  similarityScore: doublePrecision('similarity_score').notNull(),
  distanceMeters: doublePrecision('distance_meters').notNull(),
  timeDeltaHours: doublePrecision('time_delta_hours').notNull(),
  matchExplanationBn: text('match_explanation_bn').notNull(),
  reviewStatus: text('review_status').notNull().default('Candidate'), // Candidate | ConfirmedSameIncident | ConfirmedDifferent | Unmerged
  reviewedByName: text('reviewed_by_name'),
  reviewNoteBn: text('review_note_bn'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 16. Citizen Feedback, Appeals & Reopen Requests
export const feedbackAppeals = pgTable('feedback_appeals', {
  id: serial('id').primaryKey(),
  caseNumber: text('case_number').notNull(),
  citizenUid: text('citizen_uid').notNull(),
  citizenName: text('citizen_name').notNull(),
  requestType: text('request_type').notNull(), // Feedback | ReopenRequest | RoutingObjection | InfoCorrection
  isResolvedSatisfaction: boolean('is_resolved_satisfaction').default(false),
  reasonBn: text('reason_bn').notNull(),
  status: text('status').notNull().default('Pending'), // Pending | Approved | Rejected
  supervisorResponseBn: text('supervisor_response_bn'),
  reviewedByName: text('reviewed_by_name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 17. Notifications
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  recipientRole: text('recipient_role').notNull(), // citizen | officer | supervisor | all
  recipientUid: text('recipient_uid'),
  caseNumber: text('case_number'),
  titleBn: text('title_bn').notNull(),
  messageBn: text('message_bn').notNull(),
  channel: text('channel').notNull().default('Web + SMS Mock'),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 18. System Audit Logs & Integration Adapters Status
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  actorUid: text('actor_uid').notNull(),
  actorName: text('actor_name').notNull(),
  actorRole: text('actor_role').notNull(),
  action: text('action').notNull(),
  resourceType: text('resource_type').notNull(),
  resourceId: text('resource_id').notNull(),
  detailsBn: text('details_bn').notNull(),
  ipHash: text('ip_hash').notNull(),
  tamperDigest: text('tamper_digest').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const integrationLogs = pgTable('integration_logs', {
  id: serial('id').primaryKey(),
  adapterName: text('adapter_name').notNull().unique(),
  integrationLevel: text('integration_level').notNull(),
  status: text('status').notNull(), // Connected (Mock) | Stale Warning | Retry Queue
  lastSyncAt: timestamp('last_sync_at').defaultNow().notNull(),
  retryQueueCount: integer('retry_queue_count').default(0),
  idempotencyEnabled: boolean('idempotency_enabled').default(true),
  notesBn: text('notes_bn').notNull(),
});

// 19. Research Evaluations & Experiments (E1 - E5)
export const researchEvaluations = pgTable('research_evaluations', {
  id: serial('id').primaryKey(),
  experimentCode: text('experiment_code').notNull().unique(), // E1_ROUTING | E2_DUPLICATE | E3_WORKFLOW | E4_RAG | E5_USABILITY
  researchQuestion: text('research_question').notNull(),
  titleBn: text('title_bn').notNull(),
  baselineMethodBn: text('baseline_method_bn').notNull(),
  proposedMethodBn: text('proposed_method_bn').notNull(),
  metricsJson: jsonb('metrics_json').notNull(),
  sampleSize: integer('sample_size').notNull(),
  datasetLabel: text('dataset_label').notNull().default('Demo Evaluation — Synthetic Dataset'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
