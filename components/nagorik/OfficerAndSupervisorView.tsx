'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  FolderKanban,
  GitBranch,
  Camera,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  BarChart3,
  ArrowUpRight,
  Lock,
} from 'lucide-react';
import type { PlatformSnapshot, ActiveRole } from './types';
import {
  InstitutionalAppShell,
  PageHeader,
  StatCard,
  StatusBadge,
  ConfirmationDialog,
  type SidebarMenuItem,
} from './design-system';

interface OfficerAndSupervisorViewProps {
  mode: 'officer' | 'supervisor';
  snapshot: PlatformSnapshot;
  activeRole: ActiveRole;
  onRoleChange?: (role: ActiveRole) => void;
  onSnapshotUpdated: (snapshot: PlatformSnapshot) => void;
  onOpenCaseTracker: (caseNumber: string) => void;
}

export default function OfficerAndSupervisorView({
  mode,
  snapshot,
  activeRole,
  onRoleChange,
  onSnapshotUpdated,
  onOpenCaseTracker,
}: OfficerAndSupervisorViewProps) {
  const [officerMenu, setOfficerMenu] = useState<string>('dashboard');
  const [supervisorMenu, setSupervisorMenu] = useState<string>('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');

  // Officer State
  const [selectedDeptId, setSelectedDeptId] = useState('DEPT-DRAIN');
  const [selectedTaskNum, setSelectedTaskNum] = useState<string>('TSK-1001-2');
  const [newTaskStatus, setNewTaskStatus] = useState('Resolution submitted');
  const [officerComment, setOfficerComment] = useState(
    'ড্রেন লাইন পরিষ্কার করা হয়েছে এবং জমে থাকা পানি নিষ্কাশন সম্পন্ন হয়েছে।'
  );
  const [beforeImg, setBeforeImg] = useState(
    'https://picsum.photos/seed/drain-before-1001/600/400'
  );
  const [afterImg, setAfterImg] = useState(
    'https://picsum.photos/seed/drain-after-1001/600/400'
  );
  const [evidenceNote, setEvidenceNote] = useState(
    'কাজীপাড়া মেইন রোড কালভার্ট পরিষ্কার করার আগের ও পরের আলোকচিত্র।'
  );
  const [submitting, setSubmitting] = useState(false);
  const [actionBanner, setActionBanner] = useState<string | null>(null);

  // Supervisor State
  const [supCaseNum, setSupCaseNum] = useState('NS-2026-1001');
  const [supActionNote, setSupActionNote] = useState(
    'তদারকি কর্মকর্তা কর্তৃক সরেজমিন ও প্রমাণ যাচাইপূর্বক অনুমোদিত।'
  );
  const [overrideDeptId, setOverrideDeptId] = useState('DEPT-DRAIN');
  const [confirmAction, setConfirmAction] = useState<{
    subAction: string;
    titleBn: string;
    descBn: string;
  } | null>(null);

  const tasks = snapshot.caseTasks || [];
  const cases = snapshot.cases || [];
  const departments = snapshot.departments || [];
  const evidenceList = snapshot.evidence || [];

  const deptTasks = tasks.filter(
    (t: any) =>
      (selectedDeptId === 'ALL' || t.departmentId === selectedDeptId) &&
      (!globalSearch.trim() ||
        t.caseNumber?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        t.taskNumber?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        t.titleBn?.toLowerCase().includes(globalSearch.toLowerCase()))
  );

  const deptCases = cases.filter(
    (c: any) =>
      selectedDeptId === 'ALL' ||
      c.primaryDepartmentId === selectedDeptId ||
      (c.supportingDepartmentIds || []).includes(selectedDeptId)
  );

  const blockedTasks = tasks.filter(
    (t: any) => t.status === 'Blocked' || t.dependsOnTaskNumber
  );

  const selectedTask =
    tasks.find((t: any) => t.taskNumber === selectedTaskNum) ||
    deptTasks[0] ||
    tasks[0];

  const handleUpdateSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    setSubmitting(true);
    setActionBanner(null);
    try {
      const res = await fetch('/api/platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_SUBTASK',
          payload: {
            taskNumber: selectedTask.taskNumber,
            caseNumber: selectedTask.caseNumber,
            status: newTaskStatus,
            officerComment,
            actorName:
              selectedTask.assignedOfficerName || 'প্রকৌ. তরিকুল ইসলাম',
            beforeImageUrl: beforeImg,
            afterImageUrl: afterImg,
            evidenceNote,
          },
        }),
      });
      const data = await res.json();
      if (data.snapshot) {
        onSnapshotUpdated(data.snapshot);
        setActionBanner(
          `উপ-কাজ ${selectedTask.taskNumber} সফলভাবে হালনাগাদ করা হয়েছে এবং সমাধানের প্রমাণ সংরক্ষিত হয়েছে।`
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const executeSupAction = async (subAction: string) => {
    setSubmitting(true);
    setActionBanner(null);
    setConfirmAction(null);
    try {
      const res = await fetch('/api/platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SUPERVISOR_ACTION',
          payload: {
            subAction,
            caseNumber: supCaseNum,
            supervisorName: 'প্রকৌ. মাহবুবুর রহমান (তদারকি কর্মকর্তা)',
            note: supActionNote,
            newDepartmentId: overrideDeptId,
          },
        }),
      });
      const data = await res.json();
      if (data.snapshot) {
        onSnapshotUpdated(data.snapshot);
        setActionBanner(
          `তদারকি নির্দেশনা (${subAction}) ফাইল #${supCaseNum}-এ সফলভাবে কার্যকর হয়েছে।`
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================================
  // WORKSPACE C: OFFICER WORKSPACE
  // ============================================================================
  if (mode === 'officer') {
    const officerMenus: SidebarMenuItem[] = [
      {
        id: 'dashboard',
        labelBn: 'কর্মকর্তা ড্যাশবোর্ড',
        groupBn: 'দপ্তর পরিচালনা',
        icon: LayoutDashboard,
      },
      {
        id: 'assigned_tasks',
        labelBn: 'নির্ধারিত কাজসমূহ',
        groupBn: 'দপ্তর পরিচালনা',
        icon: ClipboardList,
        badgeCount: deptTasks.length,
      },
      {
        id: 'dept_cases',
        labelBn: 'বিভাগীয় ও মূল অভিযোগ',
        groupBn: 'অভিযোগ ও উপ-কাজ',
        icon: FolderKanban,
        badgeCount: deptCases.length,
      },
      {
        id: 'dependencies',
        labelBn: 'উপ-কাজ ও নির্ভরশীলতা',
        groupBn: 'অভিযোগ ও উপ-কাজ',
        icon: GitBranch,
        badgeCount: blockedTasks.length,
      },
      {
        id: 'evidence_submit',
        labelBn: 'সমাধানের প্রমাণ ও জমা',
        groupBn: 'সমাধান ও সময়সীমা',
        icon: Camera,
      },
      {
        id: 'sla_blocked',
        labelBn: 'এসএলএ ও অবরুদ্ধ কাজ',
        groupBn: 'সমাধান ও সময়সীমা',
        icon: Clock,
      },
    ];

    return (
      <InstitutionalAppShell
        activeRole="officer"
        onRoleChange={(r) => onRoleChange && onRoleChange(r)}
        menuItems={officerMenus}
        activeMenuId={officerMenu}
        onSelectMenu={setOfficerMenu}
        globalSearchValue={globalSearch}
        onGlobalSearchChange={setGlobalSearch}
        notifications={snapshot.notifications || []}
      >
        {/* Department Selector Filter Bar */}
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#005b32]">
              দায়িত্বপ্রাপ্ত বিভাগ নির্বাচন:
            </span>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="px-3 py-1.5 rounded border border-[#CBD5E1] bg-white text-xs font-bold text-[#1E293B] focus:outline-none focus:border-[#087F8C]"
            >
              <option value="ALL">সকল দপ্তর (সমন্বিত ভিউ)</option>
              {departments.map((d: any, idx: number) => {
                const deptCode = d.deptId || d.departmentId || `DEPT-${idx}`;
                return (
                  <option key={`${deptCode}-${idx}`} value={deptCode}>
                    {d.nameBn} ({deptCode})
                  </option>
                );
              })}
            </select>
          </div>
          <div className="text-xs text-[#64748B]">
            নির্ধারিত মোট উপ-কাজ:{' '}
            <span className="font-bold text-[#1E293B]">{deptTasks.length} টি</span>
          </div>
        </div>

        {actionBanner && (
          <div className="mb-5 p-3.5 rounded-lg bg-[#15803D]/10 border border-[#15803D]/30 text-xs font-bold text-[#15803D] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{actionBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionBanner(null)}
              className="underline"
            >
              বন্ধ করুন
            </button>
          </div>
        )}

        {/* 1. Officer Dashboard */}
        {officerMenu === 'dashboard' && (
          <div className="space-y-6">
            <PageHeader
              breadcrumbs={[
                'বিভাগীয় কর্মকর্তা কর্মক্ষেত্র',
                'কর্মকর্তা ড্যাশবোর্ড',
              ]}
              titleBn="বিভাগীয় প্রকৌশলী ও মাঠ কর্মকর্তা ড্যাশবোর্ড"
              descriptionBn="দপ্তরে প্রেরিত অভিযোগ, নির্ধারিত উপ-কাজ, আন্তঃবিভাগীয় নির্ভরশীলতা এবং সমাধানের প্রমাণ আপলোড প্যানেল।"
              actions={
                <button
                  type="button"
                  onClick={() => setOfficerMenu('evidence_submit')}
                  className="px-4 py-2 rounded-md bg-[#005b32] hover:bg-[#004425] text-white text-xs font-bold transition"
                >
                  সমাধানের প্রমাণ জমা দিন
                </button>
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                labelBn="নির্ধারিত মোট উপ-কাজ"
                value={`${deptTasks.length} টি`}
                subtextBn="নির্বাচিত দপ্তরের অধীনে"
                accentColor="#005b32"
              />
              <StatCard
                labelBn="কার্যক্রম চলমান"
                value={`${
                  deptTasks.filter((t: any) =>
                    ['Assigned', 'In progress'].includes(t.status)
                  ).length
                } টি`}
                subtextBn="মাঠ পর্যায়ে বাস্তবায়নাধীন"
                accentColor="#087F8C"
              />
              <StatCard
                labelBn="পূর্ববর্তী কাজের অপেক্ষায় (Blocked)"
                value={`${
                  deptTasks.filter((t: any) => t.status === 'Blocked').length
                } টি`}
                subtextBn="অন্য বিভাগের কাজ শেষ হওয়ার অপেক্ষায়"
                accentColor="#B45309"
              />
              <StatCard
                labelBn="সম্পন্ন ও প্রমাণ জমাকৃত"
                value={`${
                  deptTasks.filter((t: any) =>
                    ['Completed', 'Resolution submitted'].includes(t.status)
                  ).length
                } টি`}
                subtextBn="তদারকি অনুমোদনের জন্য প্রস্তুত"
                accentColor="#15803D"
              />
            </div>

            {/* Assigned Subtasks Table */}
            <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
                <h2 className="text-base font-bold text-[#1E293B]">
                  দপ্তরের নির্ধারিত উপ-কাজ তালিকা (Assigned Sub-tasks)
                </h2>
                <button
                  type="button"
                  onClick={() => setOfficerMenu('assigned_tasks')}
                  className="text-xs font-bold text-[#087F8C] hover:underline"
                >
                  সকল কাজ দেখুন
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F1F5F9] border-b border-[#CBD5E1] text-xs font-bold text-[#1E293B]">
                      <th className="py-3 px-4">উপ-কাজ নম্বর</th>
                      <th className="py-3 px-4">মূল অভিযোগ</th>
                      <th className="py-3 px-4">কাজের বিবরণ ও ক্রম</th>
                      <th className="py-3 px-4">দায়িত্বপ্রাপ্ত কর্মকর্তা</th>
                      <th className="py-3 px-4">নির্ভরশীলতা</th>
                      <th className="py-3 px-4">কাজের অবস্থা</th>
                      <th className="py-3 px-4 text-right">পদক্ষেপ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-xs">
                    {deptTasks.map((t: any, idx: number) => (
                      <tr key={`${t.taskNumber || t.id || 'task'}-${idx}`} className="hover:bg-[#F8FAFC]">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#005b32]">
                          {t.taskNumber}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#087F8C] font-bold">
                          <button
                            type="button"
                            onClick={() => onOpenCaseTracker(t.caseNumber)}
                            className="hover:underline inline-flex items-center gap-1"
                          >
                            <span>{t.caseNumber}</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#1E293B]">
                            ধাপ {t.sequenceOrder}: {t.titleBn}
                          </div>
                          <div className="text-[#64748B]">
                            সময়সীমা: {t.slaHours} ঘণ্টা
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-[#1E293B]">
                          {t.assignedOfficerName}
                        </td>
                        <td className="py-3.5 px-4">
                          {t.dependsOnTaskNumber ? (
                            <span className="inline-flex items-center gap-1 text-[#B45309] font-mono">
                              <Lock className="w-3 h-3" />
                              <span>{t.dependsOnTaskNumber}-এর পর</span>
                            </span>
                          ) : (
                            <span className="text-[#64748B]">স্বতন্ত্র (ধাপ ১)</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={t.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTaskNum(t.taskNumber);
                              setOfficerMenu('evidence_submit');
                            }}
                            className="px-3 py-1.5 rounded bg-[#005b32] hover:bg-[#004425] text-white text-xs font-bold transition"
                          >
                            প্রমাণ ও হালনাগাদ
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. Assigned Tasks & 4. Dependencies & 6. SLA/Blocked */}
        {(officerMenu === 'assigned_tasks' ||
          officerMenu === 'dependencies' ||
          officerMenu === 'sla_blocked') && (
          <div className="space-y-6">
            <PageHeader
              breadcrumbs={[
                'বিভাগীয় কর্মকর্তা কর্মক্ষেত্র',
                officerMenu === 'assigned_tasks'
                  ? 'নির্ধারিত কাজসমূহ'
                  : officerMenu === 'dependencies'
                  ? 'উপ-কাজ ও নির্ভরশীলতা'
                  : 'এসএলএ ও অবরুদ্ধ কাজ',
              ]}
              titleBn={
                officerMenu === 'assigned_tasks'
                  ? 'দপ্তরের নির্ধারিত সকল উপ-কাজ'
                  : officerMenu === 'dependencies'
                  ? 'আন্তঃবিভাগীয় উপ-কাজ ও নির্ভরশীলতা তালিকা'
                  : 'এসএলএ সময়সীমা পর্যবেক্ষণ ও অবরুদ্ধ (Blocked) কাজসমূহ'
              }
              descriptionBn="কোন বিভাগের কাজের পর কোন বিভাগের কাজ স্বয়ংক্রিয়ভাবে আনলক হবে এবং নির্ধারিত সময়সীমার অবস্থা।"
            />

            <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F1F5F9] border-b border-[#CBD5E1] text-xs font-bold text-[#1E293B]">
                      <th className="py-3 px-4">উপ-কাজ নম্বর</th>
                      <th className="py-3 px-4">মূল অভিযোগ</th>
                      <th className="py-3 px-4">কাজের শিরোনাম</th>
                      <th className="py-3 px-4">পূর্বশর্ত (Dependency)</th>
                      <th className="py-3 px-4">এসএলএ সময়সীমা</th>
                      <th className="py-3 px-4">কাজের অবস্থা</th>
                      <th className="py-3 px-4 text-right">পদক্ষেপ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-xs">
                    {(officerMenu === 'dependencies' ||
                    officerMenu === 'sla_blocked'
                      ? blockedTasks
                      : deptTasks
                    ).map((t: any, idx: number) => (
                      <tr key={`${t.taskNumber || t.id || 'task'}-${idx}`} className="hover:bg-[#F8FAFC]">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#005b32]">
                          {t.taskNumber}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#087F8C] font-bold">
                          {t.caseNumber}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#1E293B]">
                          ধাপ {t.sequenceOrder}: {t.titleBn}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#B45309]">
                          {t.dependsOnTaskNumber || 'প্রযোজ্য নয়'}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#1E293B]">
                          {t.slaHours} ঘণ্টা
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={t.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTaskNum(t.taskNumber);
                              setOfficerMenu('evidence_submit');
                            }}
                            className="px-3 py-1.5 rounded bg-[#005b32] text-white text-xs font-bold"
                          >
                            হালনাগাদ করুন
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. Department & Parent Cases */}
        {officerMenu === 'dept_cases' && (
          <div className="space-y-6">
            <PageHeader
              breadcrumbs={[
                'বিভাগীয় কর্মকর্তা কর্মক্ষেত্র',
                'বিভাগীয় ও মূল অভিযোগ',
              ]}
              titleBn="দপ্তর সংশ্লিষ্ট মূল অভিযোগসমূহ (Parent Cases)"
              descriptionBn="প্রধান বা সহযোগী দপ্তর হিসেবে আপনার বিভাগে প্রেরিত সকল নাগরিক অভিযোগ।"
            />

            <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F1F5F9] border-b border-[#CBD5E1] text-xs font-bold text-[#1E293B]">
                      <th className="py-3 px-4">অভিযোগ নম্বর</th>
                      <th className="py-3 px-4">ওয়ার্ড ও স্থান</th>
                      <th className="py-3 px-4">অভিযোগের বিবরণ</th>
                      <th className="py-3 px-4">প্রধান বিভাগ</th>
                      <th className="py-3 px-4">সহযোগী বিভাগসমূহ</th>
                      <th className="py-3 px-4">কাজের অবস্থা</th>
                      <th className="py-3 px-4 text-right">বিস্তারিত</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-xs">
                    {deptCases.map((c: any, idx: number) => (
                      <tr key={`${c.caseNumber || c.id || 'case'}-${idx}`} className="hover:bg-[#F8FAFC]">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#005b32]">
                          {c.caseNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#1E293B]">
                            {c.wardId}
                          </div>
                          <div className="text-[#64748B]">{c.landmarkText || c.landmark}</div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#1E293B] max-w-xs truncate">
                          {c.titleBn || c.title}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#005b32]">
                          {c.primaryDepartmentId}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#64748B]">
                          {(c.supportingDepartmentIds || []).join(', ') ||
                            'একক দপ্তর'}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => onOpenCaseTracker(c.caseNumber)}
                            className="px-3 py-1.5 rounded border border-[#CBD5E1] hover:bg-[#005b32] hover:text-white text-xs font-bold"
                          >
                            সম্পূর্ণ ফাইল
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. Evidence Upload & Resolution Submission */}
        {officerMenu === 'evidence_submit' && (
          <div className="space-y-6">
            <PageHeader
              breadcrumbs={[
                'বিভাগীয় কর্মকর্তা কর্মক্ষেত্র',
                'সমাধানের প্রমাণ ও জমা',
              ]}
              titleBn="মাঠ পর্যায়ের কাজের অবস্থা হালনাগাদ ও সমাধানের প্রমাণ জমা"
              descriptionBn="নির্ধারিত উপ-কাজ সম্পন্ন করার পর কাজের আগের ও পরের আলোকচিত্র (Before/After Photo) এবং প্রকৌশলীর মন্তব্য জমা দিন।"
            />

            <form
              onSubmit={handleUpdateSubtask}
              className="bg-white border border-[#E2E8F0] rounded-lg p-6 space-y-5 max-w-3xl"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                    নির্ধারিত উপ-কাজ নির্বাচন করুন <span className="text-[#B91C1C]">*</span>
                  </label>
                  <select
                    value={selectedTaskNum}
                    onChange={(e) => setSelectedTaskNum(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-md text-xs font-bold text-[#1E293B]"
                  >
                    {tasks.map((t: any, idx: number) => (
                      <option key={`${t.taskNumber || t.id || 'task-opt'}-${idx}`} value={t.taskNumber}>
                        {t.taskNumber} ({t.caseNumber}) — {t.titleBn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                    হালনাগাদকৃত কাজের অবস্থা <span className="text-[#B91C1C]">*</span>
                  </label>
                  <select
                    value={newTaskStatus}
                    onChange={(e) => setNewTaskStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-md text-xs font-bold text-[#1E293B]"
                  >
                    <option value="In progress">কার্যক্রম চলমান (In progress)</option>
                    <option value="Resolution submitted">
                      সমাধান জমা হয়েছে (Resolution submitted)
                    </option>
                    <option value="Completed">সম্পন্ন হয়েছে (Completed)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                  বিভাগীয় প্রকৌশলীর কারিগরি প্রতিবেদন / মন্তব্য{' '}
                  <span className="text-[#B91C1C]">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={officerComment}
                  onChange={(e) => setOfficerComment(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-md text-xs text-[#1E293B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                    কাজের পূর্ববর্তী আলোকচিত্র (Before Image URL)
                  </label>
                  <input
                    type="text"
                    value={beforeImg}
                    onChange={(e) => setBeforeImg(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-md text-xs text-[#1E293B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                    কাজের পরবর্তী আলোকচিত্র (After Image URL)
                  </label>
                  <input
                    type="text"
                    value={afterImg}
                    onChange={(e) => setAfterImg(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-md text-xs text-[#1E293B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                  সমাধানের প্রমাণের সংক্ষিপ্ত বিবরণ
                </label>
                <input
                  type="text"
                  value={evidenceNote}
                  onChange={(e) => setEvidenceNote(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-md text-xs text-[#1E293B]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOfficerMenu('dashboard')}
                  className="px-4 py-2 rounded-md border border-[#CBD5E1] bg-white text-xs font-bold text-[#1E293B]"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-md bg-[#005b32] hover:bg-[#004425] text-white text-xs font-bold transition disabled:opacity-50"
                >
                  {submitting
                    ? 'সংরক্ষণ হচ্ছে...'
                    : 'সমাধানের প্রমাণ ও অবস্থা জমা দিন'}
                </button>
              </div>
            </form>
          </div>
        )}
      </InstitutionalAppShell>
    );
  }

  // ============================================================================
  // WORKSPACE D: SUPERVISOR WORKSPACE
  // ============================================================================
  const reviewQueueCases = cases.filter(
    (c: any) =>
      c.requiresHumanReview ||
      c.status === 'Under review' ||
      c.status === 'Resolution submitted' ||
      c.status === 'Reopened'
  );
  const escalatedCases = cases.filter(
    (c: any) =>
      c.severity === 'Critical' ||
      c.severity === 'High' ||
      c.status === 'Reopened'
  );

  const supervisorMenus: SidebarMenuItem[] = [
    {
      id: 'dashboard',
      labelBn: 'তদারকি ড্যাশবোর্ড',
      groupBn: 'তদারকি পরিচালনা',
      icon: LayoutDashboard,
    },
    {
      id: 'review_routing',
      labelBn: 'পর্যালোচনা ও রাউটিং অনুমোদন',
      groupBn: 'তদারকি পরিচালনা',
      icon: ShieldCheck,
      badgeCount: reviewQueueCases.length,
    },
    {
      id: 'coordination',
      labelBn: 'মূল অভিযোগ ও বিভাগীয় সমন্বয়',
      groupBn: 'সমন্বয় ও এস্কেলেশন',
      icon: GitBranch,
      badgeCount: cases.length,
    },
    {
      id: 'escalations',
      labelBn: 'জরুরি এস্কেলেশন',
      groupBn: 'সমন্বয় ও এস্কেলেশন',
      icon: AlertTriangle,
      badgeCount: escalatedCases.length,
    },
    {
      id: 'evidence_review',
      labelBn: 'সমাধানের প্রমাণ যাচাই',
      groupBn: 'নিষ্পত্তি ও মূল্যায়ন',
      icon: Camera,
      badgeCount: evidenceList.length,
    },
    {
      id: 'closure_reopen',
      labelBn: 'নিষ্পত্তি ও পুনরায় খোলা অনুমোদন',
      groupBn: 'নিষ্পত্তি ও মূল্যায়ন',
      icon: RotateCcw,
    },
    {
      id: 'dept_performance',
      labelBn: 'বিভাগীয় কার্যকারিতা',
      groupBn: 'নিষ্পত্তি ও মূল্যায়ন',
      icon: BarChart3,
    },
  ];

  return (
    <InstitutionalAppShell
      activeRole="supervisor"
      onRoleChange={(r) => onRoleChange && onRoleChange(r)}
      menuItems={supervisorMenus}
      activeMenuId={supervisorMenu}
      onSelectMenu={setSupervisorMenu}
      globalSearchValue={globalSearch}
      onGlobalSearchChange={setGlobalSearch}
      notifications={snapshot.notifications || []}
    >
      <ConfirmationDialog
        open={!!confirmAction}
        titleBn={confirmAction?.titleBn || ''}
        descriptionBn={confirmAction?.descBn || ''}
        confirmLabelBn="অনুমোদন নিশ্চিত করুন"
        onConfirm={() =>
          confirmAction && executeSupAction(confirmAction.subAction)
        }
        onCancel={() => setConfirmAction(null)}
      />

      {actionBanner && (
        <div className="mb-5 p-3.5 rounded-lg bg-[#15803D]/10 border border-[#15803D]/30 text-xs font-bold text-[#15803D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionBanner(null)}
            className="underline"
          >
            বন্ধ করুন
          </button>
        </div>
      )}

      {/* 1. Supervisor Dashboard */}
      {supervisorMenu === 'dashboard' && (
        <div className="space-y-6">
          <PageHeader
            breadcrumbs={['তদারকি কর্মকর্তা কর্মক্ষেত্র', 'তদারকি ড্যাশবোর্ড']}
            titleBn="আঞ্চলিক তদারকি ও আন্তঃবিভাগীয় সমন্বয় ড্যাশবোর্ড"
            descriptionBn="এআই রাউটিং পর্যালোচনা, বহু-বিভাগীয় কাজের সমন্বয়, মাঠ পর্যায়ের প্রমাণ যাচাই এবং চূড়ান্ত নিষ্পত্তি অনুমোদন।"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              labelBn="অনুমোদনের অপেক্ষায় (Review Queue)"
              value={`${reviewQueueCases.length} টি`}
              subtextBn="রাউটিং বা নিষ্পত্তি অনুমোদন প্রয়োজন"
              accentColor="#B45309"
            />
            <StatCard
              labelBn="জরুরি ও উচ্চ অগ্রাধিকার ফাইল"
              value={`${escalatedCases.length} টি`}
              subtextBn="অগ্রাধিকার ভিত্তিতে তদারকি প্রয়োজন"
              accentColor="#B91C1C"
            />
            <StatCard
              labelBn="জমাকৃত সমাধানের প্রমাণ"
              value={`${evidenceList.length} টি`}
              subtextBn="কাজের আগের ও পরের আলোকচিত্র"
              accentColor="#087F8C"
            />
            <StatCard
              labelBn="চূড়ান্ত নিষ্পত্তিকৃত ফাইল"
              value={`${
                cases.filter((c: any) =>
                  ['Resolved', 'Closed'].includes(c.status)
                ).length
              } টি`}
              subtextBn="যাচাইকৃত ও সন্তোষজনক সমাধান"
              accentColor="#15803D"
            />
          </div>

          {/* Supervisor Direct Action Control Box */}
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 space-y-4">
            <h2 className="text-base font-bold text-[#1E293B]">
              দ্রুত তদারকি সিদ্ধান্ত ও অনুমোদন প্যানেল
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  অভিযোগ ফাইল নির্বাচন করুন
                </label>
                <select
                  value={supCaseNum}
                  onChange={(e) => setSupCaseNum(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-md text-xs font-bold text-[#1E293B]"
                >
                  {cases.map((c: any, idx: number) => (
                    <option key={`${c.caseNumber || c.id || 'case-opt'}-${idx}`} value={c.caseNumber}>
                      {c.caseNumber} — {c.titleBn || c.title} ({c.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  দপ্তর পুনঃনির্ধারণ (প্রয়োজনে)
                </label>
                <select
                  value={overrideDeptId}
                  onChange={(e) => setOverrideDeptId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-md text-xs font-bold text-[#1E293B]"
                >
                  {departments.map((d: any, idx: number) => {
                    const deptCode = d.deptId || d.departmentId || `DEPT-${idx}`;
                    return (
                      <option key={`${deptCode}-${idx}`} value={deptCode}>
                        {d.nameBn} ({deptCode})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  তদারকি কর্মকর্তার মন্তব্য
                </label>
                <input
                  type="text"
                  value={supActionNote}
                  onChange={(e) => setSupActionNote(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-md text-xs text-[#1E293B]"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() =>
                  setConfirmAction({
                    subAction: 'APPROVE_ROUTING',
                    titleBn: 'রাউটিং অনুমোদন নিশ্চিতকরণ',
                    descBn: `আপনি কি ফাইল #${supCaseNum}-এর বিভাগীয় রাউটিং চূড়ান্তভাবে অনুমোদন করতে চান?`,
                  })
                }
                className="px-4 py-2 rounded-md bg-[#005b32] hover:bg-[#004425] text-white text-xs font-bold transition"
              >
                রাউটিং অনুমোদন করুন
              </button>

              <button
                type="button"
                onClick={() =>
                  setConfirmAction({
                    subAction: 'OVERRIDE_ROUTING',
                    titleBn: 'দায়িত্বপ্রাপ্ত বিভাগ পরিবর্তন নিশ্চিতকরণ',
                    descBn: `আপনি কি ফাইল #${supCaseNum}-কে ${overrideDeptId} বিভাগে পুনঃপ্রেরণ করতে চান?`,
                  })
                }
                className="px-4 py-2 rounded-md bg-[#087F8C] hover:bg-[#005b32] text-white text-xs font-bold transition"
              >
                দপ্তর পরিবর্তন করুন
              </button>

              <button
                type="button"
                onClick={() =>
                  setConfirmAction({
                    subAction: 'APPROVE_RESOLUTION',
                    titleBn: 'সমাধান ও নিষ্পত্তি অনুমোদন',
                    descBn: `ফাইল #${supCaseNum}-এর মাঠ পর্যায়ের প্রমাণ যাচাইপূর্বক চূড়ান্ত সমাধান হিসেবে অনুমোদন করতে চান?`,
                  })
                }
                className="px-4 py-2 rounded-md bg-[#15803D] hover:bg-green-800 text-white text-xs font-bold transition"
              >
                সমাধান অনুমোদন করুন (Approve Resolution)
              </button>

              <button
                type="button"
                onClick={() =>
                  setConfirmAction({
                    subAction: 'APPROVE_REOPEN',
                    titleBn: 'অভিযোগ পুনরায় চালুকরণ অনুমোদন',
                    descBn: `নাগরিকের আপত্তির প্রেক্ষিতে ফাইল #${supCaseNum} পুনরায় তদন্তের জন্য চালু করতে চান?`,
                  })
                }
                className="px-4 py-2 rounded-md bg-[#B91C1C] hover:bg-red-800 text-white text-xs font-bold transition"
              >
                পুনরায় খোলা অনুমোদন (Reopen)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Review Queue, 3. Coordination, 4. Escalations, 6. Closure/Reopen */}
      {(supervisorMenu === 'review_routing' ||
        supervisorMenu === 'coordination' ||
        supervisorMenu === 'escalations' ||
        supervisorMenu === 'closure_reopen') && (
        <div className="space-y-6">
          <PageHeader
            breadcrumbs={[
              'তদারকি কর্মকর্তা কর্মক্ষেত্র',
              supervisorMenu === 'review_routing'
                ? 'পর্যালোচনা ও রাউটিং অনুমোদন'
                : supervisorMenu === 'coordination'
                ? 'মূল অভিযোগ ও বিভাগীয় সমন্বয়'
                : supervisorMenu === 'escalations'
                ? 'জরুরি এস্কেলেশন'
                : 'নিষ্পত্তি ও পুনরায় খোলা অনুমোদন',
            ]}
            titleBn={
              supervisorMenu === 'review_routing'
                ? 'মানবিক পর্যালোচনা ও রাউটিং অনুমোদন কিউ'
                : supervisorMenu === 'coordination'
                ? 'বহু-বিভাগীয় মূল অভিযোগ ও সমন্বয় তালিকা'
                : supervisorMenu === 'escalations'
                ? 'জরুরি এস্কেলেশন ও অগ্রাধিকার ফাইলসমূহ'
                : 'নিষ্পত্তি ও পুনরায় খোলা অনুমোদন তালিকা'
            }
            descriptionBn="সংশ্লিষ্ট অভিযোগগুলো যাচাই করে অনুমোদন বা পুনঃনির্দেশ প্রদান করুন।"
          />

          <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F1F5F9] border-b border-[#CBD5E1] text-xs font-bold text-[#1E293B]">
                    <th className="py-3 px-4">অভিযোগ নম্বর</th>
                    <th className="py-3 px-4">অভিযোগের বিবরণ ও স্থান</th>
                    <th className="py-3 px-4">প্রধান ও সহযোগী বিভাগ</th>
                    <th className="py-3 px-4">গুরুত্ব (Severity)</th>
                    <th className="py-3 px-4">কাজের অবস্থা</th>
                    <th className="py-3 px-4 text-right">তদারকি পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-xs">
                  {(supervisorMenu === 'escalations'
                    ? escalatedCases
                    : supervisorMenu === 'review_routing'
                    ? reviewQueueCases
                    : cases
                  ).map((c: any, idx: number) => (
                    <tr key={`${c.caseNumber || c.id || 'sup-case'}-${idx}`} className="hover:bg-[#F8FAFC]">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#005b32]">
                        {c.caseNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#1E293B]">
                          {c.titleBn || c.title}
                        </div>
                        <div className="text-[#64748B]">
                          {c.wardId} • {c.landmarkText || c.landmark}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#005b32]">
                          প্রধান: {c.primaryDepartmentId}
                        </div>
                        <div className="text-[#64748B]">
                          সহযোগী:{' '}
                          {(c.supportingDepartmentIds || []).join(', ') ||
                            'নেই'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#B45309]">
                        {c.severity}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSupCaseNum(c.caseNumber);
                            setSupervisorMenu('dashboard');
                          }}
                          className="px-2.5 py-1.5 rounded bg-[#005b32] text-white text-xs font-bold"
                        >
                          সিদ্ধান্ত দিন
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenCaseTracker(c.caseNumber)}
                          className="px-2.5 py-1.5 rounded border border-[#CBD5E1] text-[#1E293B] text-xs font-bold"
                        >
                          ফাইল দেখুন
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. Evidence Review */}
      {supervisorMenu === 'evidence_review' && (
        <div className="space-y-6">
          <PageHeader
            breadcrumbs={[
              'তদারকি কর্মকর্তা কর্মক্ষেত্র',
              'সমাধানের প্রমাণ যাচাই',
            ]}
            titleBn="মাঠ কর্মকর্তাদের জমাকৃত সমাধানের প্রমাণ যাচাই"
            descriptionBn="কাজের পূর্ববর্তী ও পরবর্তী আলোকচিত্র যাচাই করে নিষ্পত্তি অনুমোদন করুন।"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evidenceList.map((ev: any, idx: number) => (
              <div
                key={ev.id || idx}
                className="bg-white border border-[#E2E8F0] rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                  <span className="font-mono text-xs font-bold text-[#005b32]">
                    অভিযোগ: {ev.caseNumber} ({ev.taskNumber || 'মূল ফাইল'})
                  </span>
                  <span className="text-xs font-bold text-[#15803D]">
                    প্রমাণ সংযুক্ত
                  </span>
                </div>
                <p className="text-xs text-[#1E293B] font-medium">
                  {ev.notes || ev.captionBn || 'মাঠ পর্যায়ের কাজের আলোকচিত্র'}
                </p>
                <div className="text-[11px] text-[#64748B]">
                  জমাদানকারী: {ev.uploadedBy}
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => onOpenCaseTracker(ev.caseNumber)}
                    className="px-3 py-1.5 rounded bg-[#087F8C] text-white text-xs font-bold"
                  >
                    পূর্ণাঙ্গ ফাইল ও ছবি দেখুন
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Department Performance */}
      {supervisorMenu === 'dept_performance' && (
        <div className="space-y-6">
          <PageHeader
            breadcrumbs={[
              'তদারকি কর্মকর্তা কর্মক্ষেত্র',
              'বিভাগীয় কার্যকারিতা',
            ]}
            titleBn="দপ্তরভিত্তিক সেবা নিষ্পত্তি ও কার্যকারিতা মূল্যায়ন"
            descriptionBn="প্রতিটি বিভাগের চলমান কাজ, নিষ্পত্তির হার এবং গড় সময়সীমা।"
          />

          <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F1F5F9] border-b border-[#CBD5E1] text-xs font-bold text-[#1E293B]">
                  <th className="py-3 px-4">দপ্তরের নাম</th>
                  <th className="py-3 px-4">দপ্তর কোড</th>
                  <th className="py-3 px-4">চলমান ফাইল</th>
                  <th className="py-3 px-4">নিষ্পত্তিকৃত ফাইল</th>
                  <th className="py-3 px-4">নিষ্পত্তি হার</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                {departments.map((d: any, idx: number) => {
                  const deptCode = d.deptId || d.departmentId || `DEPT-${idx}`;
                  const dCases = cases.filter(
                    (c: any) => c.primaryDepartmentId === deptCode
                  );
                  const solved = dCases.filter((c: any) =>
                    ['Resolved', 'Closed'].includes(c.status)
                  ).length;
                  const active = dCases.length - solved;
                  const rate =
                    dCases.length > 0
                      ? Math.round((solved / dCases.length) * 100)
                      : 100;
                  return (
                    <tr key={`${deptCode}-${idx}`} className="hover:bg-[#F8FAFC]">
                      <td className="py-3.5 px-4 font-bold text-[#1E293B]">
                        {d.nameBn}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#005b32]">
                        {deptCode}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#1D4ED8]">
                        {active} টি
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#15803D]">
                        {solved} টি
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#1E293B]">
                        {rate}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </InstitutionalAppShell>
  );
}
