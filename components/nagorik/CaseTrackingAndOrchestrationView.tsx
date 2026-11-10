'use client';

import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Lock,
  RotateCcw,
  UserCheck,
  Building2,
  Camera,
  Link2,
  MapPin,
  Calendar,
} from 'lucide-react';
import { PlatformSnapshot, ActiveRole } from './types';

interface CaseTrackingAndOrchestrationViewProps {
  snapshot: PlatformSnapshot;
  activeRole: ActiveRole;
  selectedCaseNumber: string;
  onSelectCaseNumber: (caseNum: string) => void;
  onSnapshotUpdated: (snapshot: PlatformSnapshot) => void;
  onStartLinkedCase: (closedCaseNumber: string) => void;
}

const STATUS_DETAILS: Record<
  string,
  { labelBn: string; summaryBn: string; stepIndex: number; badgeType: 'process' | 'resolved' | 'alert' }
> = {
  Submitted: {
    labelBn: 'অভিযোগ জমা হয়েছে',
    summaryBn: 'আপনার অভিযোগটি গ্রহণ করা হয়েছে এবং সংশ্লিষ্ট দপ্তরে পাঠানোর প্রক্রিয়ায় রয়েছে।',
    stepIndex: 1,
    badgeType: 'process',
  },
  'Information needed': {
    labelBn: 'অতিরিক্ত তথ্য প্রয়োজন',
    summaryBn: 'সঠিক স্থানে টিম পাঠানোর জন্য অনুগ্রহ করে সুনির্দিষ্ট ল্যান্ডমার্ক বা তথ্য যোগ করুন।',
    stepIndex: 1,
    badgeType: 'alert',
  },
  'Under review': {
    labelBn: 'তদারকি কর্মকর্তার যাচাই চলছে',
    summaryBn: 'প্রধান সমন্বয় কর্মকর্তা আপনার সমস্যার বিভাগ ও কর্মপরিকল্পনা চূড়ান্ত করছেন।',
    stepIndex: 2,
    badgeType: 'process',
  },
  Assigned: {
    labelBn: 'কর্মকর্তা নিযুক্ত হয়েছেন',
    summaryBn: 'দায়িত্বপ্রাপ্ত বিভাগীয় কর্মকর্তার কাছে আপনার ফাইল পৌঁছেছে, দ্রুত মাঠ পর্যায়ে কাজ শুরু হবে।',
    stepIndex: 2,
    badgeType: 'process',
  },
  'In progress': {
    labelBn: 'সমাধানের কাজ চলছে (প্রক্রিয়াধীন)',
    summaryBn: 'দায়িত্বপ্রাপ্ত কর্মকর্তা ও মাঠ পর্যায়ের টিম বর্তমানে আপনার এলাকায় সমস্যাটি সমাধানের কাজ করছেন।',
    stepIndex: 3,
    badgeType: 'process',
  },
  Blocked: {
    labelBn: 'পূর্ববর্তী ধাপের কাজের অপেক্ষায়',
    summaryBn: 'একটি বিভাগের কাজ শেষ হলেই পরবর্তী বিভাগের কর্মকর্তা কাজ শুরু করবেন।',
    stepIndex: 3,
    badgeType: 'alert',
  },
  'Resolution submitted': {
    labelBn: 'কাজ শেষ — ঊর্ধ্বতন কর্মকর্তার যাচাই চলছে',
    summaryBn: 'মাঠ কর্মকর্তা কাজ শেষ করে ছবি ও প্রতিবেদন জমা দিয়েছেন; তদারকি কর্মকর্তা তা যাচাই করছেন।',
    stepIndex: 4,
    badgeType: 'process',
  },
  Resolved: {
    labelBn: 'সমাধান সম্পন্ন হয়েছে',
    summaryBn: 'কর্মকর্তা কাজ শেষ করেছেন এবং প্রমাণ যাচাই করা হয়েছে। আপনার মতামত জানান।',
    stepIndex: 5,
    badgeType: 'resolved',
  },
  Reopened: {
    labelBn: 'নাগরিকের আপত্তিতে পুনরায় চালু',
    summaryBn: 'সমস্যাটি পুরোপুরি সমাধান না হওয়ায় আপনার অনুরোধে পুনরায় কর্মকর্তাকে জরুরি নির্দেশ দেওয়া হয়েছে।',
    stepIndex: 3,
    badgeType: 'alert',
  },
  Closed: {
    labelBn: 'চূড়ান্তভাবে সমাধান ও নিষ্পত্তি সম্পন্ন',
    summaryBn: 'প্রমাণ যাচাই ও নাগরিকের সন্তুষ্টির ভিত্তিতে অভিযোগটি সফলভাবে নিষ্পত্তি হয়েছে।',
    stepIndex: 5,
    badgeType: 'resolved',
  },
};

const DEPT_OFFICER_MAP: Record<
  string,
  { name: string; title: string; deptBn: string; phone: string }
> = {
  'DEPT-WASTE': {
    name: 'প্রকৌ. কামরুল হাসান',
    title: 'নির্বাহী কর্মকর্তা (বর্জ্য ব্যবস্থাপনা)',
    deptBn: 'বর্জ্য ব্যবস্থাপনা বিভাগ',
    phone: '০১৭১১-০০০১০৩',
  },
  'DEPT-DRAIN': {
    name: 'প্রকৌ. তরিকুল ইসলাম',
    title: 'সহকারী প্রকৌশলী (ড্রেনেজ ও খাল)',
    deptBn: 'ড্রেনেজ ও খাল পরিষ্কার বিভাগ',
    phone: '০১৭১১-০০০১০৪',
  },
  'DEPT-LIGHT': {
    name: 'প্রকৌ. সাজ্জাদ হোসেন',
    title: 'উপ-সহকারী প্রকৌশলী (বিদ্যুৎ ও সড়কবাতি)',
    deptBn: 'বিদ্যুৎ ও সড়কবাতি বিভাগ',
    phone: '০১৭১১-০০০১০৬',
  },
  'DEPT-ROAD': {
    name: 'প্রকৌ. ফারহানা ইয়াসমিন',
    title: 'নির্বাহী প্রকৌশলী (সড়ক সংস্কার)',
    deptBn: 'সড়ক ও অবকাঠামো প্রকৌশল বিভাগ',
    phone: '০১৭১১-০০০১০৫',
  },
  'DEPT-COORD': {
    name: 'ড. মাহমুদুল হক',
    title: 'প্রধান সমন্বয় ও তদারকি কর্মকর্তা',
    deptBn: 'কেন্দ্রীয় নাগরিক সমন্বয় সেল',
    phone: '০১৭১১-০০০১০৭',
  },
};

export default function CaseTrackingAndOrchestrationView({
  snapshot,
  selectedCaseNumber,
  onSelectCaseNumber,
  onSnapshotUpdated,
  onStartLinkedCase,
}: CaseTrackingAndOrchestrationViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PROCESS' | 'RESOLVED'>('ALL');
  const [feedbackReason, setFeedbackReason] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [actionBanner, setActionBanner] = useState<string | null>(null);

  const filteredCases = snapshot.cases.filter((c) => {
    const matchesSearch =
      !searchTerm ||
      c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.landmark.toLowerCase().includes(searchTerm.toLowerCase());

    const isDone = c.status === 'Resolved' || c.status === 'Closed';
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'RESOLVED' && isDone) ||
      (statusFilter === 'PROCESS' && !isDone);

    return matchesSearch && matchesStatus;
  });

  const activeCase =
    snapshot.cases.find((c) => c.caseNumber === selectedCaseNumber) ||
    filteredCases[0] ||
    snapshot.cases[0];

  const subTasks = snapshot.caseTasks
    .filter((t) => t.caseNumber === activeCase?.caseNumber)
    .sort((a, b) => a.sequenceOrder - b.sequenceOrder);

  const caseEvidenceList = snapshot.evidence.filter(
    (ev) => ev.caseNumber === activeCase?.caseNumber
  );

  const caseEventLog = snapshot.caseEvents.filter(
    (ev) => ev.caseNumber === activeCase?.caseNumber
  );

  const handleCitizenSubmitFeedbackOrReopen = async (isSatisfied: boolean) => {
    if (!activeCase) return;
    const defaultNote = isSatisfied
      ? 'ধন্যবাদ, সমস্যাটি সঠিকভাবে সমাধান হয়েছে।'
      : 'সমস্যাটি এখনো পুরোপুরি সমাধান হয়নি, পুনরায় ব্যবস্থা নেওয়ার অনুরোধ করছি।';

    setIsSubmittingFeedback(true);
    setActionBanner(null);
    try {
      const res = await fetch('/api/platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CITIZEN_FEEDBACK',
          payload: {
            caseNumber: activeCase.caseNumber,
            citizenUid: 'demo-citizen-01',
            citizenName: activeCase.citizenName || 'আব্দুর রহিম',
            requestType: isSatisfied ? 'Feedback' : 'ReopenRequest',
            isResolvedSatisfaction: isSatisfied,
            reasonBn: feedbackReason.trim() || defaultNote,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'মতামত জমা দেওয়া যায়নি।');
      onSnapshotUpdated(data.snapshot);
      setFeedbackReason('');
      setActionBanner(
        isSatisfied
          ? `আপনার সন্তুষ্টি বার্তা সংরক্ষিত হয়েছে।`
          : `আপনার আপত্তি গৃহীত হয়েছে এবং অভিযোগ ${activeCase.caseNumber} পুনরায় চালু করে কর্মকর্তার কাছে পাঠানো হয়েছে।`
      );
    } catch (err: any) {
      setActionBanner(err.message);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  if (!activeCase) {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-8 text-center text-sm text-slate-600">
        কোনো অভিযোগ পাওয়া যায়নি।
      </div>
    );
  }

  const currentStatusMeta = STATUS_DETAILS[activeCase.status] || STATUS_DETAILS['In progress'];
  const currentActiveTask =
    subTasks.find((t) => t.status === 'In progress' || t.status === 'Reopened' || t.status === 'Assigned') ||
    subTasks[subTasks.length - 1];

  const primaryOfficer =
    DEPT_OFFICER_MAP[currentActiveTask?.departmentId || activeCase.primaryDepartmentId] ||
    DEPT_OFFICER_MAP['DEPT-COORD'];

  const isCaseSolved = activeCase.status === 'Resolved' || activeCase.status === 'Closed';

  return (
    <div className="space-y-6">
      {/* Top Search & Status Filter Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#004425]">
            অভিযোগের বর্তমান অবস্থা ও দায়িত্বপ্রাপ্ত কর্মকর্তা জানুন
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            আপনার সমস্যাটি বর্তমানে কোন পর্যায়ে আছে, কোন কর্মকর্তার কাছে গেছে এবং কীভাবে সমাধান হচ্ছে তা নিচে বিস্তারিত দেখুন।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="অভিযোগ নম্বর (NS-2026-1001) বা এলাকা..."
              className="pl-9 pr-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-md w-64 focus:outline-none focus:border-[#0891B2]"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-white text-[#005b32] shadow-xs' : 'text-slate-600'
              }`}
            >
              সব অভিযোগ ({snapshot.cases.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('PROCESS')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                statusFilter === 'PROCESS' ? 'bg-white text-[#005b32] shadow-xs' : 'text-slate-600'
              }`}
            >
              প্রক্রিয়াধীন (চলমান)
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('RESOLVED')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                statusFilter === 'RESOLVED' ? 'bg-white text-[#005b32] shadow-xs' : 'text-slate-600'
              }`}
            >
              সমাধান সম্পন্ন
            </button>
          </div>
        </div>
      </div>

      {actionBanner && (
        <div className="bg-[#E6F7FA] border border-[#0891B2]/40 rounded-lg px-4 py-3 text-xs text-[#004425] font-medium flex items-center justify-between">
          <span>{actionBanner}</span>
          <button
            type="button"
            onClick={() => setActionBanner(null)}
            className="text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      )}

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List of Complaints */}
        <div className="lg:col-span-4 bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
          <div className="px-4 py-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
            <span className="text-xs font-bold text-[#004425]">
              অভিযোগের তালিকা ({filteredCases.length}টি)
            </span>
            <span className="text-[11px] text-slate-500">ক্লিক করে বিস্তারিত দেখুন</span>
          </div>

          <div className="divide-y divide-[#E2E8F0] max-h-[750px] overflow-y-auto">
            {filteredCases.map((c) => {
              const isSelected = c.caseNumber === activeCase.caseNumber;
              const solved = c.status === 'Resolved' || c.status === 'Closed';
              const stLabel = STATUS_DETAILS[c.status]?.labelBn || c.status;

              return (
                <button
                  key={c.caseNumber}
                  type="button"
                  onClick={() => onSelectCaseNumber(c.caseNumber)}
                  className={`w-full text-left p-4 transition-colors cursor-pointer ${
                    isSelected ? 'bg-[#E6F7FA]/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono tabular-nums font-bold text-[#005b32]">
                      {c.caseNumber}
                    </span>
                    <span
                      className={`font-semibold ${
                        solved
                          ? 'text-emerald-700'
                          : c.status === 'Reopened'
                          ? 'text-red-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {solved ? '✓ সমাধান সম্পন্ন' : `● ${stLabel}`}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#004425] leading-snug">{c.title}</h4>
                  <div className="mt-1.5 text-xs text-slate-500">
                    <span>স্থান: {c.landmark}</span>
                    <span aria-hidden="true"> · </span>
                    <span>ওয়ার্ড: {c.wardId.replace('WARD-', '')}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Detailed View */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Clear Status & 5-Stage Progress Tracker */}
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E2E8F0] pb-4">
              <div>
                <div className="text-xs text-slate-500 font-mono tabular-nums">
                  ট্র্যাকিং নম্বর: <strong className="text-[#005b32] text-sm">{activeCase.caseNumber}</strong>
                  {' · '}অভিযোগকারী: <strong>{activeCase.citizenName}</strong>
                  {' · '}স্থান: {activeCase.landmark}
                </div>
                <h3 className="text-lg font-bold text-[#004425] mt-1">{activeCase.title}</h3>
              </div>

              <div
                className={`px-3.5 py-2 rounded-md text-xs font-bold border ${
                  isCaseSolved
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : activeCase.status === 'Reopened'
                    ? 'bg-red-50 text-red-800 border-red-200'
                    : 'bg-amber-50 text-amber-900 border-amber-200'
                }`}
              >
                {isCaseSolved ? '✓ সমস্যাটি সমাধান হয়েছে' : `⏳ প্রক্রিয়াধীন: ${currentStatusMeta.labelBn}`}
              </div>
            </div>

            {/* 5-Step Visual Progress Bar */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-700">
                সমাধানের অগ্রগতি ({currentStatusMeta.stepIndex}/৫ ধাপ):
              </div>
              <div className="grid grid-cols-5 gap-2 text-center text-[11px]">
                {[
                  { idx: 1, title: '১. অভিযোগ জমা' },
                  { idx: 2, title: '২. কর্মকর্তা নিযুক্ত' },
                  { idx: 3, title: '৩. কাজ চলছে' },
                  { idx: 4, title: '৪. প্রমাণ যাচাই' },
                  { idx: 5, title: '৫. সমাধান সম্পন্ন' },
                ].map((st) => {
                  const completed = currentStatusMeta.stepIndex >= st.idx;
                  const current = currentStatusMeta.stepIndex === st.idx;
                  return (
                    <div
                      key={st.idx}
                      className={`py-2 px-1.5 rounded-md font-semibold border transition-colors ${
                        current
                          ? 'bg-[#005b32] text-white border-[#005b32]'
                          : completed
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                          : 'bg-[#F8FAFC] text-slate-400 border-[#E2E8F0]'
                      }`}
                    >
                      {st.title}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-slate-700 bg-[#F8FAFC] p-3 rounded border border-[#E2E8F0] mt-2">
                <strong>বর্তমান অবস্থার বিবরণ:</strong> {currentStatusMeta.summaryBn}
              </p>
            </div>

            {/* Citizen's Submitted Problem Text */}
            <div className="p-4 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-xs space-y-1">
              <div className="font-semibold text-slate-700">আপনার জানানো সমস্যার বিবরণ:</div>
              <p className="text-slate-800 text-sm leading-relaxed">{activeCase.originalDescription}</p>
            </div>
          </div>

          {/* 2. Which Officer Has This Complaint? (Assigned Officer & Supervisor Card) */}
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 space-y-4">
            <h4 className="text-base font-bold text-[#004425] border-b border-[#E2E8F0] pb-3">
              সমস্যাটি বর্তমানে কোন কর্মকর্তার কাছে আছে?
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-[#E6F7FA]/60 border border-[#0891B2]/30 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#005b32] text-white flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-[#0891B2]">
                    মূল দায়িত্বপ্রাপ্ত কর্মকর্তা (Field Officer)
                  </div>
                  <div className="text-sm font-bold text-[#004425]">{primaryOfficer.name}</div>
                  <div className="text-slate-700 font-medium">{primaryOfficer.title}</div>
                  <div className="text-slate-600">{primaryOfficer.deptBn}</div>
                  <div className="text-slate-500 font-mono pt-0.5">
                    দাপ্তরিক যোগাযোগ: {primaryOfficer.phone}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-500">
                  তদারকি ও চূড়ান্ত অনুমোদনকারী কর্মকর্তা (Supervisor)
                </div>
                <div className="text-sm font-bold text-[#004425]">
                  {activeCase.routingApprovedBy || 'ড. মাহমুদুল হক (প্রধান সমন্বয় কর্মকর্তা)'}
                </div>
                <div className="text-slate-600">
                  কেন্দ্রীয় নাগরিক সেবা সমন্বয় ও তদারকি সেল
                </div>
                <div className="pt-1 text-slate-600 font-mono">
                  নির্ধারিত সময়সীমা (SLA): {activeCase.slaHours} ঘণ্টা
                </div>
              </div>
            </div>
          </div>

          {/* 3. How is the Problem Being Solved Step by Step? (Sub-tasks) */}
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 space-y-4">
            <div className="border-b border-[#E2E8F0] pb-3">
              <h4 className="text-base font-bold text-[#004425]">
                কীভাবে সমাধান করা হচ্ছে? (ধাপভিত্তিক কাজের অগ্রগতি — {subTasks.length}টি ধাপ)
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                একাধিক বিভাগ জড়িত থাকলে কোন বিভাগ আগে কাজ করছে এবং কোন ধাপ সম্পন্ন হয়েছে তা নিচে দেখুন:
              </p>
            </div>

            <div className="space-y-3">
              {subTasks.map((task) => {
                const isBlocked = task.status === 'Blocked';
                const isDone =
                  task.status === 'Verified' || task.status === 'Resolution submitted';
                const taskOfficer =
                  DEPT_OFFICER_MAP[task.departmentId] || DEPT_OFFICER_MAP['DEPT-COORD'];

                return (
                  <div
                    key={task.taskNumber}
                    className={`p-4 rounded-lg border ${
                      isBlocked
                        ? 'bg-amber-50/60 border-amber-300'
                        : isDone
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : 'bg-[#F8FAFC] border-[#E2E8F0]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-[#005b32]">
                        ধাপ {task.sequenceOrder}: {task.titleBn.replace(/Sub-task \d+:\s*/i, '')}
                      </span>
                      <span
                        className={`font-semibold px-2.5 py-0.5 rounded ${
                          isDone
                            ? 'bg-emerald-100 text-emerald-900'
                            : isBlocked
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-[#E6F7FA] text-[#005b32]'
                        }`}
                      >
                        {isDone
                          ? '✓ কাজ সম্পন্ন'
                          : isBlocked
                          ? '⏳ পূর্ববর্তী ধাপের অপেক্ষায়'
                          : '● বর্তমানে কাজ চলছে'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 mt-1.5">{task.descriptionBn}</p>

                    <div className="mt-3 pt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                      <span>
                        <strong>দায়িত্বপ্রাপ্ত কর্মকর্তা:</strong>{' '}
                        {task.assignedOfficerName || `${taskOfficer.name} (${taskOfficer.deptBn})`}
                      </span>
                      <span>নির্ধারিত সময়: {task.slaHours} ঘণ্টা</span>
                    </div>

                    {task.blockerReason && (
                      <div className="mt-2 px-3 py-2 rounded bg-amber-100/80 text-amber-950 text-xs">
                        <strong>অপেক্ষার কারণ:</strong> {task.blockerReason}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Work Completion Evidence (Before & After Photos) */}
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 space-y-4">
            <div className="border-b border-[#E2E8F0] pb-3">
              <h4 className="text-base font-bold text-[#004425] flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#0891B2]" />
                <span>সমাধানের প্রমাণ ও কর্মকর্তার প্রতিবেদন (কাজের আগে ও পরে)</span>
              </h4>
            </div>

            {caseEvidenceList.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">
                মাঠ পর্যায়ে কাজ চলমান রয়েছে। কাজ শেষ হওয়ার সাথে সাথে কর্মকর্তা এখানে কাজের আগের ও পরের ছবি যুক্ত করবেন।
              </p>
            ) : (
              <div className="space-y-4">
                {caseEvidenceList.map((ev) => (
                  <div
                    key={ev.evidenceCode}
                    className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-3 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-[#005b32]">
                        জমাদানকারী কর্মকর্তা: {ev.uploadedByName}
                      </span>
                      <span className="font-semibold text-emerald-800">
                        {ev.verificationStatus === 'Verified'
                          ? '✓ তদারকি কর্মকর্তা কর্তৃক যাচাইকৃত'
                          : ev.verificationStatus === 'Rejected'
                          ? '✕ পুনরায় কাজের নির্দেশ দেওয়া হয়েছে'
                          : '⏳ যাচাইয়ের অপেক্ষায়'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-white rounded border border-[#E2E8F0]">
                        <div className="font-semibold text-slate-700 mb-1">
                          কাজের আগের অবস্থা (Before):
                        </div>
                        <div className="h-24 rounded bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-600 text-xs p-2 text-center">
                          <span>সমস্যার প্রাথমিক স্থান পরিদর্শন ছবি</span>
                        </div>
                      </div>
                      <div className="p-3 bg-white rounded border border-[#E2E8F0]">
                        <div className="font-semibold text-[#0891B2] mb-1">
                          সমাধানের পরের অবস্থা (After):
                        </div>
                        <div className="h-24 rounded bg-[#E6F7FA]/50 border border-[#0891B2]/30 flex flex-col items-center justify-center text-[#004425] text-xs p-2 text-center">
                          <span>কাজ সম্পন্ন হওয়ার পরের যাচাইকৃত ছবি</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-800">
                      <strong>কর্মকর্তার প্রতিবেদন:</strong> {ev.officerCommentBn} —{' '}
                      {ev.workCompletionReportBn}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. Citizen Satisfaction or Reopen Box */}
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
              <div>
                <h4 className="text-base font-bold text-[#004425]">
                  সমস্যাটি কি সঠিকভাবে সমাধান হয়েছে? আপনার মতামত দিন
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  কাজ সন্তোষজনক না হলে আপনি এক ক্লিকেই অভিযোগটি পুনরায় চালু (Reopen) করতে পারেন।
                </p>
              </div>

              {activeCase.status === 'Closed' && (
                <button
                  type="button"
                  onClick={() => onStartLinkedCase(activeCase.caseNumber)}
                  className="px-3.5 py-2 bg-[#005b32] text-white text-xs font-semibold rounded-md hover:bg-[#004425] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>একই স্থানে নতুন সমস্যা? নতুন সংযুক্ত অভিযোগ করুন</span>
                </button>
              )}
            </div>

            <textarea
              rows={2}
              value={feedbackReason}
              onChange={(e) => setFeedbackReason(e.target.value)}
              placeholder="আপনার মন্তব্য বা কেন সমাধান হয়নি তা সংক্ষেপে লিখুন (ঐচ্ছিক)..."
              className="w-full px-3.5 py-2 text-xs bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#0891B2]"
            />

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={isSubmittingFeedback}
                onClick={() => handleCitizenSubmitFeedbackOrReopen(true)}
                className="px-4 py-2.5 bg-emerald-700 text-white text-xs font-semibold rounded-md hover:bg-emerald-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>হ্যাঁ, সমাধান সন্তোষজনক হয়েছে</span>
              </button>

              <button
                type="button"
                disabled={isSubmittingFeedback}
                onClick={() => handleCitizenSubmitFeedbackOrReopen(false)}
                className="px-4 py-2.5 bg-red-700 text-white text-xs font-semibold rounded-md hover:bg-red-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>না, সমস্যা এখনো সমাধান হয়নি — পুনরায় চালু করুন</span>
              </button>
            </div>
          </div>

          {/* 6. Clean Timeline History */}
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 space-y-3">
            <h4 className="text-sm font-bold text-[#004425] border-b border-[#E2E8F0] pb-2.5">
              সময়ানুক্রমিক কার্যপ্রবাহের ইতিহাস (Timeline)
            </h4>
            <div className="space-y-2.5">
              {caseEventLog.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-[#004425]">
                      {STATUS_DETAILS[ev.newState]?.labelBn || ev.newState}
                    </div>
                    <p className="text-slate-700">{ev.reasonBn}</p>
                    <div className="text-[11px] text-slate-500">
                      সম্পাদনকারী: <strong>{ev.actorName}</strong>
                    </div>
                  </div>
                  <div className="text-right font-mono tabular-nums text-[11px] text-slate-500 shrink-0">
                    {new Date(ev.createdAt).toLocaleString('bn-BD')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
