'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Search,
  MapPin,
  ArrowRight,
  ArrowUp,
  Eye,
  PhoneCall,
  Building2,
  Mail,
  Bell,
  User,
  RotateCcw,
  PenLine,
  Megaphone,
  BarChart3,
  FileText,
  Settings,
  CheckCircle2,
  Clock,
  Trash2,
  Droplets,
  Droplet,
  Route,
  Lightbulb,
  Trees,
  LayoutGrid,
  Users,
} from 'lucide-react';
import type { PlatformSnapshot, ActiveRole, WorkspaceTab } from './types';
import {
  StatusBadge,
  StatCard,
  PageHeader,
  getDynamicImageSrc,
  useDynamicImageVersions,
} from './design-system';
import IntakeAndAssistantView from './IntakeAndAssistantView';
import CaseTrackingAndOrchestrationView from './CaseTrackingAndOrchestrationView';
import ServiceDiscoveryAndRagView from './ServiceDiscoveryAndRagView';
import HelpdeskWorkspaceView from './HelpdeskWorkspaceView';
import OfficerAndSupervisorView from './OfficerAndSupervisorView';
import AdminAndResearchView from './AdminAndResearchView';
import WardInteractiveMap from './WardInteractiveMap';

interface NagorikSathiAppProps {
  initialTab?: WorkspaceTab | 'tracking' | 'report' | 'assistant' | string;
  initialRole?: ActiveRole | string;
  initialCaseNumber?: string;
}

function normalizeTab(tab?: string): WorkspaceTab {
  if (!tab) return 'home';
  const t = tab.toLowerCase();
  if (t === 'track' || t === 'tracking') return 'track';
  if (t === 'intake' || t === 'report' || t === 'assistant') return 'intake';
  if (t === 'services') return 'services';
  if (t === 'my_cases' || t === 'profile') return 'my_cases';
  if (t === 'about' || t === 'help' || t === 'about_help') return 'about_help';
  if (t === 'supervisor') return 'supervisor';
  if (t === 'officer') return 'officer';
  if (t === 'admin') return 'admin';
  if (t === 'research') return 'research';
  return 'home';
}

function normalizeRole(role?: string): ActiveRole {
  if (!role) return 'citizen';
  const r = role.toLowerCase();
  if (r === 'ward_desk' || r === 'assisted' || r === 'assisted_agent')
    return 'ward_desk';
  if (r === 'officer' || r === 'field_officer') return 'officer';
  if (r === 'supervisor') return 'supervisor';
  if (r === 'admin' || r === 'system_admin') return 'admin';
  if (r === 'researcher') return 'researcher';
  if (r === 'auditor') return 'auditor';
  return 'citizen';
}

const OFFICER_DIRECTORY: Record<
  string,
  {
    nameBn: string;
    designationBn: string;
    phone: string;
    deptBn: string;
    roomBn: string;
  }
> = {
  'DEPT-WASTE': {
    nameBn: 'প্রকৌ. কামরুল হাসান',
    designationBn: 'সহকারী প্রধান বর্জ্য ব্যবস্থাপনা কর্মকর্তা',
    phone: '০১৭১১-২২৩৩৪৪',
    deptBn: 'বর্জ্য ব্যবস্থাপনা বিভাগ',
    roomBn: 'কক্ষ নং ৩১২, নগর ভবন (জোন-২)',
  },
  'DEPT-DRAIN': {
    nameBn: 'প্রকৌ. তরিকুল ইসলাম',
    designationBn: 'নির্বাহী প্রকৌশলী (ড্রেনেজ ও খাল)',
    phone: '০১৭১১-৫৫৬৬৭৭',
    deptBn: 'ড্রেনেজ ও জলাবদ্ধতা নিরসন বিভাগ',
    roomBn: 'কক্ষ নং ৪০৫, নগর ভবন (জোন-২)',
  },
  'DEPT-LIGHT': {
    nameBn: 'প্রকৌ. সাজ্জাদ হোসেন',
    designationBn: 'নির্বাহী প্রকৌশলী (বিদ্যুৎ ও সড়কবাতি)',
    phone: '০১৭১১-৮৮৯৯০০',
    deptBn: 'বিদ্যুৎ ও সড়কবাতি বিভাগ',
    roomBn: 'কক্ষ নং ২১৮, নগর ভবন (জোন-২)',
  },
  'DEPT-ROAD': {
    nameBn: 'প্রকৌ. ফারহানা ইয়াসমিন',
    designationBn: 'নির্বাহী প্রকৌশলী (পুরকৌশল ও সড়ক)',
    phone: '০১৭১৩-১১২২৩৩',
    deptBn: 'সড়ক ও ফুটপাত সংস্কার বিভাগ',
    roomBn: 'কক্ষ নং ৪১০, নগর ভবন (জোন-২)',
  },
};

const EMPTY_SNAPSHOT: PlatformSnapshot = {
  users: [],
  roles: [],
  wards: [],
  departments: [],
  assets: [],
  responsibilityRules: [],
  slaRules: [],
  services: [],
  governmentDocuments: [],
  cases: [],
  caseTasks: [],
  caseEvents: [],
  evidence: [],
  routingReviews: [],
  duplicateCandidates: [],
  feedbackAppeals: [],
  notifications: [],
  auditLogs: [],
  integrationLogs: [],
  researchEvaluations: [],
  lastSyncedAt: '',
};

export default function NagorikSathiApp({
  initialTab = 'home',
  initialRole = 'citizen',
  initialCaseNumber,
}: NagorikSathiAppProps) {
  const [snapshot, setSnapshot] = useState<PlatformSnapshot>(EMPTY_SNAPSHOT);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(() =>
    normalizeTab(initialTab)
  );
  const [activeRole, setActiveRole] = useState<ActiveRole>(() =>
    normalizeRole(initialRole)
  );
  const [selectedCaseNumber, setSelectedCaseNumber] = useState<string>(
    initialCaseNumber || 'NS-2026-1001'
  );
  const [linkedCaseNumber, setLinkedCaseNumber] = useState<string | null>(null);
  const [selectedWardId, setSelectedWardId] = useState<string>('ALL');
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const [quickSearchError, setQuickSearchError] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const imageVersions = useDynamicImageVersions(snapshot?.imageVersions);

  const applyPlatformData = useCallback(
    (json: PlatformSnapshot) => {
      setSnapshot(json);
      if (initialCaseNumber && json.cases) {
        const matched = json.cases.find(
          (c: any) =>
            c.caseNumber?.toLowerCase() === initialCaseNumber.toLowerCase()
        );
        if (matched) {
          setSelectedCaseNumber(matched.caseNumber);
        }
      } else if (json.cases?.length > 0) {
        setSelectedCaseNumber((prev) => prev || json.cases[0].caseNumber);
      }
      setLoading(false);
    },
    [initialCaseNumber]
  );

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/platform', { cache: 'no-store' });
      const json = await res.json();
      applyPlatformData(json);
    } catch (err) {
      console.error('Failed to load platform data:', err);
      setLoading(false);
    }
  }, [applyPlatformData]);

  useEffect(() => {
    let active = true;
    fetch('/api/platform', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (active) applyPlatformData(json);
      })
      .catch((err) => {
        console.error('Failed to load platform data:', err);
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [applyPlatformData]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 260);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRoleSwitch = (newRole: ActiveRole) => {
    setActiveRole(newRole);
    if (newRole === 'citizen') {
      setActiveTab('home');
    } else if (newRole === 'officer') {
      setActiveTab('officer');
    } else if (newRole === 'supervisor') {
      setActiveTab('supervisor');
    } else if (newRole === 'admin' || newRole === 'researcher') {
      setActiveTab('admin');
    }
    scrollToTop();
  };

  const handleQuickTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuickSearchError('');
    const q = quickSearchQuery.trim().toLowerCase();
    if (!q) {
      setQuickSearchError(
        'অনুগ্রহ করে একটি বৈধ অভিযোগ নম্বর লিখুন (যেমন: NS-2026-1001)।'
      );
      return;
    }

    if (!snapshot?.cases) return;

    const found = snapshot.cases.find(
      (c: any) =>
        c.caseNumber?.toLowerCase().includes(q) ||
        c.titleBn?.toLowerCase().includes(q) ||
        c.landmarkText?.toLowerCase().includes(q)
    );

    if (found) {
      setSelectedCaseNumber(found.caseNumber);
      setActiveTab('track');
    } else {
      setQuickSearchError(
        'এই নম্বরে কোনো অভিযোগ পাওয়া যায়নি। উদাহরণ: NS-2026-1001 লিখে খুঁজুন।'
      );
    }
  };

  if (loading && activeRole !== 'citizen') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs mb-4">
          <Image
            src={getDynamicImageSrc('Logo.png', imageVersions)}
            alt="নাগরিক সাথী AI"
            width={220}
            height={52}
            className="h-12 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <p className="text-sm text-[#64748B] font-medium">
          নাগরিক সেবা সমন্বয় ও সমস্যা সমাধান প্ল্যাটফর্ম লোড হচ্ছে...
        </p>
      </div>
    );
  }

  // ============================================================================
  // SEPARATE INSTITUTIONAL WORKSPACES (B, C, D, E)
  // ============================================================================
  if (activeRole === 'ward_desk') {
    return (
      <HelpdeskWorkspaceView
        snapshot={snapshot}
        activeRole="ward_desk"
        onRoleChange={handleRoleSwitch}
        onSnapshotUpdated={setSnapshot}
      />
    );
  }

  if (activeRole === 'officer') {
    return (
      <OfficerAndSupervisorView
        mode="officer"
        snapshot={snapshot}
        activeRole="officer"
        onRoleChange={handleRoleSwitch}
        onSnapshotUpdated={setSnapshot}
        onOpenCaseTracker={(caseNum) => {
          setSelectedCaseNumber(caseNum);
          setActiveRole('citizen');
          setActiveTab('track');
        }}
      />
    );
  }

  if (activeRole === 'supervisor') {
    return (
      <OfficerAndSupervisorView
        mode="supervisor"
        snapshot={snapshot}
        activeRole="supervisor"
        onRoleChange={handleRoleSwitch}
        onSnapshotUpdated={setSnapshot}
        onOpenCaseTracker={(caseNum) => {
          setSelectedCaseNumber(caseNum);
          setActiveRole('citizen');
          setActiveTab('track');
        }}
      />
    );
  }

  if (
    activeRole === 'admin' ||
    activeRole === 'researcher' ||
    activeRole === 'auditor'
  ) {
    return (
      <AdminAndResearchView
        snapshot={snapshot}
        activeSubTab="admin"
        activeRole={activeRole}
        onRoleChange={handleRoleSwitch}
        onRefresh={fetchData}
        onSnapshotUpdated={setSnapshot}
      />
    );
  }

  // ============================================================================
  // WORKSPACE A: CITIZEN PORTAL (Public Website + Citizen Features)
  // ============================================================================
  const cases = snapshot.cases || [];
  const resolvedCount = cases.filter((c: any) =>
    ['Resolved', 'Closed'].includes(c.status)
  ).length;
  const activeCasesCount = cases.filter(
    (c: any) => !['Resolved', 'Closed'].includes(c.status)
  ).length;
  const reopenedCases = cases.filter((c: any) => c.status === 'Reopened');

  // Public Navigation Links (Strictly text-only, NO icons next to link text, NO duplicate "নতুন অভিযোগ" link)
  const publicNavLinks: { id: WorkspaceTab; label: string }[] = [
    { id: 'home', label: 'হোমপেজ' },
    { id: 'track', label: 'অভিযোগ ট্র্যাকিং' },
    { id: 'services', label: 'সেবা তালিকা' },
    { id: 'my_cases', label: 'আমার অভিযোগ ও প্রোফাইল' },
    { id: 'about_help', label: 'সহায়তা ও যোগাযোগ' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#1E293B] relative">
      {/* Full-Page Bangladesh Civic & Heritage Line-Art Frame (bg3.png) */}
      <div
        className="fixed inset-0 pointer-events-none opacity-45 z-0"
        style={{
          backgroundImage: `url('${getDynamicImageSrc('bg3.png', imageVersions)}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Top Institutional Utility Bar (#005b32) */}
      <div className="relative z-30 bg-[#005b32] text-white text-xs border-b border-[#004425]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-block w-2 h-2 rounded-full bg-white" />
            <span className="font-medium text-white">
              গণপ্রজাতন্ত্রী বাংলাদেশ সরকার • ঢাকা উত্তর সিটি কর্পোরেশন (DNCC) • নাগরিক সেবা বাতায়ন
            </span>
            <span className="hidden lg:inline text-white/40">|</span>
            <span className="hidden lg:inline text-white/90">
              হটলাইন: ১৬১০৬ • জরুরি সেবা: ৩৩৩ / ৯৯৯
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <label
              htmlFor="workspace-switcher"
              className="text-white/95 hidden sm:inline"
            >
              কর্মক্ষেত্র নির্বাচন (Workspace):
            </label>
            <select
              id="workspace-switcher"
              value={activeRole}
              onChange={(e) => handleRoleSwitch(e.target.value as ActiveRole)}
              className="bg-[#004425] text-white border border-white/30 rounded px-2.5 py-1 text-xs font-medium focus:outline-none focus:border-white"
            >
              <option value="citizen">১. নাগরিক পোর্টাল (Citizen Portal)</option>
              <option value="ward_desk">২. হেল্পডেস্ক কর্মক্ষেত্র (Helpdesk)</option>
              <option value="officer">৩. বিভাগীয় কর্মকর্তা কর্মক্ষেত্র (Officer)</option>
              <option value="supervisor">৪. তদারকি কর্মকর্তা কর্মক্ষেত্র (Supervisor)</option>
              <option value="admin">৫. প্রশাসনিক ব্যবস্থাপনা কর্মক্ষেত্র (Admin)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Public Navbar:
          - Left: Official Logo.png image (/public/Images/Logo.png)
          - Center: Pure Text Links (No icons, No duplication)
          - Right: Single Primary Action Button ("নতুন অভিযোগ") */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-[#E2E8F0] shadow-2xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          {/* Left Side: Official Logo.png Image */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('home');
              scrollToTop();
            }}
            aria-label="হোমপেজে ফিরে যান"
            className="flex items-center text-left focus:outline-none shrink-0 cursor-pointer"
          >
            <Image
              src={getDynamicImageSrc('Logo.png', imageVersions)}
              alt="নাগরিক সাথী AI — নাগরিক সেবা সমন্বয় ও সমস্যা সমাধান প্ল্যাটফর্ম"
              width={250}
              height={58}
              className="h-12 sm:h-14 w-auto object-contain"
              priority
              referrerPolicy="no-referrer"
            />
          </button>

          {/* Center: Text-Only Navigation Links (No Icons, No Duplicate CTA) */}
          <nav className="hidden lg:flex items-center gap-1">
            {publicNavLinks.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-2.5 rounded-md text-sm font-bold transition relative ${
                    isActive
                      ? 'text-[#005b32] bg-[#005b32]/8 after:content-[""] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-[#005b32]'
                      : 'text-[#1E293B] hover:text-[#005b32] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Side: Single Primary Action Button ("নতুন অভিযোগ") */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                setLinkedCaseNumber(null);
                setActiveTab('intake');
              }}
              className={`px-5 py-2.5 rounded-md text-xs sm:text-sm font-bold transition ${
                activeTab === 'intake'
                  ? 'bg-[#004425] text-white ring-2 ring-[#005b32]/30'
                  : 'bg-[#005b32] hover:bg-[#004425] text-white'
              }`}
            >
              নতুন অভিযোগ
            </button>
          </div>
        </div>

        {/* Mobile Text-Only Navigation Bar */}
        <div className="lg:hidden bg-[#F8FAFC] border-t border-[#E2E8F0] px-4 py-2 flex items-center gap-2 overflow-x-auto">
          {publicNavLinks.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-[#005b32] text-white'
                    : 'bg-white border border-[#CBD5E1] text-[#1E293B]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* ================================================================ */}
        {/* TAB 1: CITIZEN HOMEPAGE                                          */}
        {/* ================================================================ */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            {/* ============================================================== */}
            {/* REDESIGNED GOVERNMENT-GRADE HERO SECTION                       */}
            {/* ============================================================== */}
            <section
              aria-label="নাগরিক সাথী এআই প্রধান অংশ"
              className="relative rounded-2xl bg-gradient-to-br from-[#E8F5EC]/85 via-[#F3FAF5] to-[#E6F4F1]/80 border border-[#D5E8DC] p-3.5 sm:p-4 lg:p-5 shadow-xs overflow-hidden"
            >
              {/* Subtle Architectural Line-Art & Soft Wave Pattern Background */}
              <Image
                src={getDynamicImageSrc('bg2.png', imageVersions)}
                alt=""
                fill
                className="object-cover object-bottom opacity-20 pointer-events-none select-none"
                referrerPolicy="no-referrer"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#005b32]/8 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-24 right-1/3 w-80 h-80 rounded-full bg-[#0891B2]/8 blur-3xl"
              />

              {/* Two-Column Hero Grid: Wider Left (~63%) & More Compact Right (~37%) */}
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.68fr_1fr] gap-4 sm:gap-5 items-stretch">
                {/* LEFT COLUMN (Wider Length, Lower Height): Hero Content + Custom Bangladesh Civic Illustration */}
                <div className="relative rounded-xl bg-[#F7FCF9] border border-[#CFE6D8] p-5 sm:px-7 sm:py-5 lg:px-8 lg:py-5 shadow-xs overflow-hidden flex flex-col justify-center">
                  {/* Custom Generated Bangladesh Civic & National Memorial Illustration on Right Half */}
                  <div
                    className="absolute inset-y-0 right-0 w-[62%] sm:w-[55%] pointer-events-none select-none overflow-hidden"
                    style={{
                      WebkitMaskImage:
                        'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.45) 18%, rgba(0,0,0,0.88) 38%, rgba(0,0,0,1) 55%)',
                      maskImage:
                        'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.45) 18%, rgba(0,0,0,0.88) 38%, rgba(0,0,0,1) 55%)',
                    }}
                  >
                    <Image
                      src={getDynamicImageSrc(
                        'hero_illustration.jpg',
                        imageVersions
                      )}
                      alt="বাংলাদেশ আধুনিক নগর অবকাঠামো ও জাতীয় স্মৃতিসৌধ চিত্রায়ন"
                      fill
                      priority
                      className="object-cover object-right opacity-95 sm:opacity-100"
                      referrerPolicy="no-referrer"
                    />
                    {/* Soft White Left-Edge Blend Overlay */}
                    <div
                      className="absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-[#F7FCF9] via-[#F7FCF9]/70 to-transparent"
                      aria-hidden="true"
                    />
                  </div>

                  {/* Foreground Hero Text & Actions */}
                  <div className="relative z-10 max-w-2xl space-y-3 my-auto">
                    {/* Small Professional Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#E8F5EC] border border-[#B9DFC7] text-[#005b32] text-xs font-bold tracking-normal shadow-2xs">
                      <span>
                        ডিজিটাল পাবলিক ইনফ্রাস্ট্রাকচার • নাগরিক সেবা বাতায়ন
                      </span>
                    </div>

                    {/* Main Bengali Heading */}
                    <h1 className="text-xl sm:text-2xl lg:text-[29px] font-bold text-[#004D2A] leading-[1.32] tracking-normal">
                      <span className="block text-[#172033]">
                        নাগরিক সমস্যা সরাসরি জানান,
                      </span>
                      <span className="block text-[#005b32]">
                        দায়িত্বপ্রাপ্ত বিভাগ ও কর্মকর্তার কার্যক্রমের
                      </span>
                      <span className="inline-block text-[#B91C1C]">
                        অগ্রগতি যাচাই করুন
                      </span>
                    </h1>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-[#172033]/85 leading-[1.65] max-w-xl font-normal">
                      বর্জ্য ব্যবস্থাপনা, ড্রেনেজ ও জলাবদ্ধতা, সড়কবাতি কিংবা
                      রাস্তা সংস্কার—সহজ বাংলায় লিখে বা কণ্ঠস্বরের মাধ্যমে
                      অভিযোগ জমা দিন এবং সমাধানের অগ্রগতি দেখুন।
                    </p>

                    {/* Primary & Secondary CTA Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setLinkedCaseNumber(null);
                          setActiveTab('intake');
                        }}
                        className="px-4 py-2.5 rounded-lg bg-[#005b32] hover:bg-[#004D2A] text-white font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                      >
                        <PenLine className="w-4 h-4 shrink-0" />
                        <span>নতুন অভিযোগ জমা দিন</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('track')}
                        className="px-4 py-2.5 rounded-lg bg-white/95 hover:bg-[#E8F5EC] text-[#004D2A] border border-[#005b32]/40 font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-2xs cursor-pointer"
                      >
                        <Search className="w-4 h-4 text-[#005b32] shrink-0" />
                        <span>অভিযোগ ট্র্যাকিং করুন</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN (Narrower Length, Lower Height): Public Complaint Interaction Card */}
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-3.5">
                  {/* Top Area: Header + Primary Action + Tracking Search */}
                  <div className="space-y-2.5">
                    {/* Card Header */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-[#E8F5EC] border border-[#C5E5D1] text-[#005b32] flex items-center justify-center shrink-0">
                          <Megaphone className="w-4 h-4" />
                        </div>
                        <h2 className="text-base sm:text-[17px] font-bold text-[#172033]">
                          অভিযোগ জানান ও অগ্রগতি দেখুন
                        </h2>
                      </div>
                      <p className="text-[11px] sm:text-xs text-[#64748B] leading-snug">
                        লগইন ছাড়াই অভিযোগ জমা দিন এবং অভিযোগ নম্বর দিয়ে
                        অগ্রগতি যাচাই করুন।
                      </p>
                    </div>

                    {/* Primary Action Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setLinkedCaseNumber(null);
                        setActiveTab('intake');
                      }}
                      className="w-full py-2 px-3.5 rounded-lg bg-[#005b32] hover:bg-[#004D2A] text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <PenLine className="w-3.5 h-3.5 shrink-0" />
                      <span>নতুন অভিযোগ জমা দিন</span>
                    </button>

                    {/* Complaint Tracking Input Form */}
                    <form
                      onSubmit={handleQuickTrackSearch}
                      className="space-y-1.5"
                      noValidate
                    >
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5">
                        <div className="relative flex-1">
                          <Search className="w-3.5 h-3.5 text-[#005b32] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={quickSearchQuery}
                            onChange={(e) => {
                              setQuickSearchQuery(e.target.value);
                              if (quickSearchError) setQuickSearchError('');
                            }}
                            placeholder="অভিযোগ নম্বর লিখুন (যেমন: NS-2026-1001)"
                            aria-label="অভিযোগ নম্বর লিখুন"
                            className="w-full pl-8 pr-2.5 py-2 rounded-lg bg-[#F7FAFC] border border-[#CBD5E1] text-xs text-[#172033] placeholder:text-[#64748B] focus:bg-white focus:outline-none focus:border-[#005b32] focus:ring-1 focus:ring-[#005b32] transition"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-lg bg-[#E8F5EC] hover:bg-[#D0ECDA] text-[#004D2A] border border-[#B5DEC4] font-bold text-xs transition-colors shrink-0 cursor-pointer"
                        >
                          খুঁজুন
                        </button>
                      </div>

                      {quickSearchError && (
                        <p
                          role="alert"
                          className="text-[11px] text-[#B91C1C] bg-[#FEF2F2] border border-[#FECACA] rounded-md px-2.5 py-1 font-medium"
                        >
                          {quickSearchError}
                        </p>
                      )}
                    </form>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-[#E2E8F0] pt-3 space-y-2">
                    {/* Public Statistics Header with Explicit Demo Data Label */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#172033]">
                        <BarChart3 className="w-3.5 h-3.5 text-[#005b32] shrink-0" />
                        <span>সাম্প্রতিক অভিযোগের সারসংক্ষেপ</span>
                      </div>
                      <span className="text-[10px] font-bold text-[#005b32] bg-[#F3FAF5] border border-[#CBE5D4] px-2 py-0.5 rounded">
                        সর্বশেষ ২৪ ঘণ্টা
                      </span>
                    </div>

                    {/* Four Compact Public Statistic Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {/* 1. মোট অভিযোগ (Blue) */}
                      <div className="rounded-lg bg-[#EFF6FF] border border-[#DBEAFE] p-2 text-center space-y-0.5">
                        <div className="w-6 h-6 rounded-md bg-white/80 text-[#1D4ED8] flex items-center justify-center mx-auto shadow-2xs">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-sm sm:text-base font-bold text-[#1E40AF] tabular-nums leading-tight">
                          ১,২৭৫
                        </div>
                        <div className="text-[10px] font-bold text-[#1E3A8A]">
                          মোট অভিযোগ
                        </div>
                      </div>

                      {/* 2. প্রক্রিয়াধীন (Orange) */}
                      <div className="rounded-lg bg-[#FFFBEB] border border-[#FEF3C7] p-2 text-center space-y-0.5">
                        <div className="w-6 h-6 rounded-md bg-white/80 text-[#D97706] flex items-center justify-center mx-auto shadow-2xs">
                          <Settings className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-sm sm:text-base font-bold text-[#B45309] tabular-nums leading-tight">
                          ৯৫৩
                        </div>
                        <div className="text-[10px] font-bold text-[#92400E]">
                          প্রক্রিয়াধীন
                        </div>
                      </div>

                      {/* 3. সমাধান হয়েছে (Green) */}
                      <div className="rounded-lg bg-[#F0FDF4] border border-[#DCFCE7] p-2 text-center space-y-0.5">
                        <div className="w-6 h-6 rounded-md bg-white/80 text-[#15803D] flex items-center justify-center mx-auto shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-sm sm:text-base font-bold text-[#15803D] tabular-nums leading-tight">
                          ৩০৮
                        </div>
                        <div className="text-[10px] font-bold text-[#166534]">
                          সমাধান হয়েছে
                        </div>
                      </div>

                      {/* 4. সময়সীমা পার (Red) */}
                      <div className="rounded-lg bg-[#FEF2F2] border border-[#FEE2E2] p-2 text-center space-y-0.5">
                        <div className="w-6 h-6 rounded-md bg-white/80 text-[#DC2626] flex items-center justify-center mx-auto shadow-2xs">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-sm sm:text-base font-bold text-[#B91C1C] tabular-nums leading-tight">
                          ১৪
                        </div>
                        <div className="text-[10px] font-bold text-[#991B1B]">
                          সময়সীমা পার
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ============================================================== */}
            {/* BELOW HERO SECTION: POPULAR SERVICES, STATS & HOW IT WORKS     */}
            {/* ============================================================== */}
            <section
              aria-label="জনপ্রিয় সেবা, পরিসংখ্যান ও কাজের প্রক্রিয়া"
              className="relative rounded-2xl bg-white border border-[#E2E8F0] shadow-xs overflow-hidden"
            >
              <div className="p-5 sm:p-7 lg:p-8 space-y-7">
                {/* 1. জনপ্রিয় সেবা ও অভিযোগের বিভাগ (8 Category Cards) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="w-1.5 h-6 rounded-full bg-[#005b32] inline-block"
                      />
                      <h2 className="text-lg sm:text-xl font-bold text-[#172033]">
                        জনপ্রিয় সেবা ও অভিযোগের বিভাগ
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('services')}
                      className="text-xs sm:text-sm font-bold text-[#005b32] hover:text-[#004D2A] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>সব সেবা দেখুন</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5">
                    {[
                      {
                        labelBn: 'বর্জ্য ব্যবস্থাপনা',
                        icon: Trash2,
                        bgClass:
                          'bg-[#EAF7EE] hover:bg-[#DCF2E3] border-[#D5EEDD]',
                        iconColor: 'text-[#15803D]',
                      },
                      {
                        labelBn: 'ড্রেনেজ ও জলাবদ্ধতা',
                        icon: Droplets,
                        bgClass:
                          'bg-[#EAF5FF] hover:bg-[#DBEAFE] border-[#D5E8FA]',
                        iconColor: 'text-[#0284C7]',
                      },
                      {
                        labelBn: 'সড়ক ও যানবাহন',
                        icon: Route,
                        bgClass:
                          'bg-[#FFF6EB] hover:bg-[#FFEDD5] border-[#FDE8CE]',
                        iconColor: 'text-[#EA580C]',
                      },
                      {
                        labelBn: 'আলোকসজ্জা',
                        icon: Lightbulb,
                        bgClass:
                          'bg-[#F3EEFF] hover:bg-[#EDE9FE] border-[#E6DEFA]',
                        iconColor: 'text-[#6D28D9]',
                      },
                      {
                        labelBn: 'পার্ক ও খেলার মাঠ',
                        icon: Trees,
                        bgClass:
                          'bg-[#EBF9F4] hover:bg-[#D5F3EB] border-[#D0EFE5]',
                        iconColor: 'text-[#16A34A]',
                      },
                      {
                        labelBn: 'নগর উন্নয়ন',
                        icon: Building2,
                        bgClass:
                          'bg-[#FFF0F0] hover:bg-[#FEE2E2] border-[#FADADA]',
                        iconColor: 'text-[#DC2626]',
                      },
                      {
                        labelBn: 'পানি ও স্যানিটেশন',
                        icon: Droplet,
                        bgClass:
                          'bg-[#ECF5FC] hover:bg-[#E0F2FE] border-[#D6EBF8]',
                        iconColor: 'text-[#0284C7]',
                      },
                      {
                        labelBn: 'অন্যান্য সেবা',
                        icon: LayoutGrid,
                        bgClass:
                          'bg-[#ECF3FA] hover:bg-[#E2EDF8] border-[#D8E6F3]',
                        iconColor: 'text-[#0284C7]',
                      },
                    ].map((cat) => {
                      const IconComponent = cat.icon;
                      return (
                        <button
                          key={cat.labelBn}
                          type="button"
                          onClick={() => {
                            setLinkedCaseNumber(null);
                            setActiveTab('intake');
                          }}
                          className={`group rounded-xl border py-4 px-3 flex flex-col items-center justify-center text-center gap-2.5 transition-all cursor-pointer ${cat.bgClass}`}
                        >
                          <div className="w-10 h-10 rounded-lg bg-white/90 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                            <IconComponent
                              className={`w-6 h-6 ${cat.iconColor}`}
                            />
                          </div>
                          <span className="text-xs sm:text-[13px] font-bold text-[#172033] leading-snug">
                            {cat.labelBn}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Two-Column Strip: [নাগরিক সেবা ও অভিযোগ] + [কীভাবে কাজ করে?] */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  {/* Left Box (6 Cols): Dark Green Gradient Banner — নাগরিক সেবা ও অভিযোগ */}
                  <div className="lg:col-span-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#00582A] via-[#005b32] to-[#004D2A] text-white p-5 sm:p-6 shadow-sm flex flex-col justify-between">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-[#10B981]/15 blur-2xl"
                    />
                    <div className="relative z-10 flex items-center justify-between gap-2">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-white">
                          নাগরিক সেবা ও অভিযোগ
                        </h3>
                        <div className="w-32 h-0.5 bg-[#34D399]/75 mt-1.5 rounded-full" />
                      </div>
                      <span className="text-[11px] font-medium text-white/85 bg-white/10 border border-white/15 px-2.5 py-0.5 rounded">
                        ডেমো পরিসংখ্যান
                      </span>
                    </div>

                    <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:divide-x sm:divide-white/15 pt-5">
                      <div className="flex items-center gap-2.5 sm:pr-2">
                        <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-[#A7F3D0]" />
                        </div>
                        <div>
                          <div className="text-base sm:text-lg font-bold text-white tabular-nums leading-tight">
                            ১,২৬,৪৫০+
                          </div>
                          <div className="text-[11px] text-white/85 mt-0.5">
                            মোট অভিযোগ
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 sm:pl-3 sm:pr-2">
                        <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-[#A7F3D0]" />
                        </div>
                        <div>
                          <div className="text-base sm:text-lg font-bold text-white tabular-nums leading-tight">
                            ১,০৮,৩২০+
                          </div>
                          <div className="text-[11px] text-white/85 mt-0.5">
                            সমাধান হয়েছে
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 sm:pl-3 sm:pr-2">
                        <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                          <Clock className="w-5 h-5 text-[#A7F3D0]" />
                        </div>
                        <div>
                          <div className="text-base sm:text-lg font-bold text-white tabular-nums leading-tight">
                            ১৮,১৩০+
                          </div>
                          <div className="text-[11px] text-white/85 mt-0.5">
                            প্রক্রিয়াধীন
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 sm:pl-3">
                        <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5 text-[#A7F3D0]" />
                        </div>
                        <div>
                          <div className="text-base sm:text-lg font-bold text-white tabular-nums leading-tight">
                            ৯৮%
                          </div>
                          <div className="text-[11px] text-white/85 mt-0.5">
                            সমাধানের হার
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Box (6 Cols): Soft Mint Card — কীভাবে কাজ করে? */}
                  <div className="lg:col-span-6 rounded-2xl bg-gradient-to-r from-[#EFF9F4] via-[#F5FBF8] to-[#EBF7F2] border border-[#CDE6D8] p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
                    <h3 className="text-base sm:text-lg font-bold text-[#172033]">
                      কীভাবে কাজ করে?
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                      {[
                        {
                          titleBn: 'অভিযোগ দাখিল',
                          subBn: 'সহজ ফর্মে জানান',
                          icon: FileText,
                        },
                        {
                          titleBn: 'বিভাগে প্রেরণ',
                          subBn: 'সংশ্লিষ্ট বিভাগে পাঠানো হয়',
                          icon: Search,
                        },
                        {
                          titleBn: 'কার্যক্রম গ্রহণ',
                          subBn: 'নির্ধারিত সময়ে ব্যবস্থা',
                          icon: Settings,
                        },
                        {
                          titleBn: 'সমাধান ও আপডেট',
                          subBn: 'অগ্রগতি জানুন',
                          icon: CheckCircle2,
                        },
                      ].map((stepItem, idx, arr) => {
                        const StepIcon = stepItem.icon;
                        return (
                          <div
                            key={stepItem.titleBn}
                            className="relative flex flex-col items-center text-center px-1"
                          >
                            <div className="w-10 h-10 rounded-xl bg-white border border-[#B9DFC7] text-[#005b32] flex items-center justify-center shadow-2xs mb-2">
                              <StepIcon className="w-5 h-5" />
                            </div>
                            <div className="text-xs sm:text-[13px] font-bold text-[#172033] leading-snug">
                              {stepItem.titleBn}
                            </div>
                            <div className="text-[11px] text-[#64748B] mt-0.5 leading-tight">
                              {stepItem.subBn}
                            </div>

                            {/* Connector Arrow on Desktop */}
                            {idx < arr.length - 1 && (
                              <ArrowRight
                                aria-hidden="true"
                                className="hidden sm:block w-4 h-4 text-[#005b32]/55 absolute -right-2 top-3"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Decorative Bangladesh Architectural Skyline & Soft Mint Wave */}
              <div className="relative h-20 sm:h-24 w-full overflow-hidden bg-gradient-to-b from-white via-[#EAF7F0] to-[#C8EAD8]/85 pointer-events-none select-none">
                <Image
                  src={getDynamicImageSrc('bg2.png', imageVersions)}
                  alt=""
                  fill
                  className="object-cover object-bottom opacity-85"
                  referrerPolicy="no-referrer"
                />
              </div>
            </section>

            {/* Live Citizen Complaint Register Data Table */}
            <section className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-2xs">
              <div className="px-6 py-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#1E293B]">
                    সাম্প্রতিক অভিযোগ ও কাজের অবস্থা রেজিস্টার
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    প্রতিটি অভিযোগ কোন দপ্তর ও কর্মকর্তার কাছে আছে এবং সমাধানের অগ্রগতি দেখুন
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('track')}
                  className="text-xs font-bold text-[#005b32] hover:underline"
                >
                  সকল ফাইল ট্র্যাকিংয়ে দেখুন →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F1F5F9] border-b border-[#CBD5E1] text-xs font-bold text-[#1E293B]">
                      <th className="py-3 px-4">অভিযোগ নম্বর</th>
                      <th className="py-3 px-4">অভিযোগের বিবরণ ও স্থান</th>
                      <th className="py-3 px-4">দায়িত্বপ্রাপ্ত বিভাগ ও কর্মকর্তা</th>
                      <th className="py-3 px-4">উপ-কাজের অগ্রগতি</th>
                      <th className="py-3 px-4">কাজের অবস্থা</th>
                      <th className="py-3 px-4 text-right">পদক্ষেপ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-xs">
                    {cases.slice(0, 8).map((c: any) => {
                      const dept = (snapshot.departments || []).find(
                        (d: any) => d.departmentId === c.primaryDepartmentId
                      );
                      const officer =
                        OFFICER_DIRECTORY[c.primaryDepartmentId] ||
                        OFFICER_DIRECTORY['DEPT-WASTE'];
                      const caseSubtasks = (snapshot.caseTasks || []).filter(
                        (st: any) => st.caseNumber === c.caseNumber
                      );
                      const completedSubtasks = caseSubtasks.filter((st: any) =>
                        ['Completed', 'Resolution submitted'].includes(
                          st.status
                        )
                      ).length;

                      return (
                        <tr key={c.caseNumber} className="hover:bg-[#F8FAFC]">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#005b32] whitespace-nowrap">
                            {c.caseNumber}
                            <div className="text-[11px] font-normal text-[#64748B]">
                              {c.wardId}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-bold text-[#1E293B] truncate">
                              {c.titleBn}
                            </div>
                            <div className="text-[#64748B] truncate mt-0.5">
                              {c.landmarkText}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#1E293B]">
                              {officer.nameBn}
                            </div>
                            <div className="text-[#64748B]">
                              {dept?.nameBn || officer.deptBn}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-[#1E293B]">
                              {caseSubtasks.length > 0
                                ? `${completedSubtasks}/${caseSubtasks.length} ধাপ সম্পন্ন`
                                : 'প্রাথমিক যাচাই'}
                            </div>
                            <div className="text-[#64748B]">
                              সময়সীমা: {c.slaHours || 24} ঘণ্টা
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusBadge status={c.status} />
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCaseNumber(c.caseNumber);
                                setActiveTab('track');
                              }}
                              className="px-3 py-1.5 rounded border border-[#CBD5E1] bg-white hover:bg-[#005b32] hover:text-white text-xs font-bold text-[#1E293B] transition inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>বিস্তারিত</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Departmental Directory Cards with bg1.png Subtle Texture */}
            <section className="relative overflow-hidden bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-2xs space-y-4">
              <Image
                src={getDynamicImageSrc('bg1.png', imageVersions)}
                alt=""
                fill
                className="object-cover object-bottom opacity-35 pointer-events-none select-none"
                referrerPolicy="no-referrer"
              />
              <div className="relative z-10">
                <span className="text-xs font-bold text-[#005b32]">
                  দপ্তর ও দায়িত্বপ্রাপ্ত কর্মকর্তা পরিচিতি
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-[#1E293B] mt-0.5">
                  কোন সমস্যার জন্য কোন দপ্তর ও কর্মকর্তা দায়িত্বপ্রাপ্ত
                </h2>
              </div>

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    code: 'DEPT-WASTE',
                    titleBn: 'বর্জ্য অপসারণ ও পরিচ্ছন্নতা ব্যবস্থাপনা',
                    howSolvedBn:
                      'ওয়ার্ড সুপারভাইজার স্থান পরিদর্শন করেন → পরিচ্ছন্নতা কর্মী ও কম্প্যাক্টর ট্রাক পাঠিয়ে বর্জ্য অপসারণ → পরিষ্কার স্থানের ছবি আপলোড।',
                    sla: '২৪ ঘণ্টা',
                  },
                  {
                    code: 'DEPT-DRAIN',
                    titleBn: 'ড্রেনেজ, কালভার্ট ও জলাবদ্ধতা নিরসন',
                    howSolvedBn:
                      'বর্জ্য বিভাগ প্রথমে ড্রেনের মুখের আবর্জনা পরিষ্কার করে → ড্রেনেজ প্রকৌশলী ব্লকেজ খোলেন ও ভাঙা স্ল্যাব মেরামত করেন।',
                    sla: '৪৮ ঘণ্টা',
                  },
                  {
                    code: 'DEPT-LIGHT',
                    titleBn: 'সড়কবাতি (LED) ও বৈদ্যুতিক পোল মেরামত',
                    howSolvedBn:
                      'বৈদ্যুতিক লাইনম্যান সংযোগ ও সুইচ বোর্ড পরীক্ষা করেন → নষ্ট এলইডি বাল্ব বা ক্যাবল পরিবর্তন → রাতে বাতি জ্বলার ছবি যুক্ত করা হয়।',
                    sla: '২৪ ঘণ্টা',
                  },
                  {
                    code: 'DEPT-ROAD',
                    titleBn: 'রাস্তার গর্ত (Pothole) ও ফুটপাত সংস্কার',
                    howSolvedBn:
                      'পুরকৌশল প্রকৌশলী গর্তের মাপ ও ঝুঁকি যাচাই করেন → বিটুমিন কার্পেটিং দিয়ে সমতল মেরামত → রোলার কমপ্যাকশন শেষে ছবি জমা।',
                    sla: '৭২ ঘণ্টা',
                  },
                ].map((item) => {
                  const officer = OFFICER_DIRECTORY[item.code];
                  return (
                    <div
                      key={item.code}
                      className="bg-white/95 backdrop-blur-2xs border border-[#CBD5E1] rounded-lg p-5 flex flex-col justify-between space-y-4 shadow-2xs"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                          <span className="text-xs font-bold text-[#005b32]">
                            {officer.deptBn}
                          </span>
                          <span className="text-xs font-mono text-[#64748B]">
                            সময়সীমা: {item.sla}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-[#1E293B]">
                          {item.titleBn}
                        </h3>
                        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded p-3 text-xs space-y-0.5">
                          <div className="text-[#64748B]">
                            দায়িত্বপ্রাপ্ত কর্মকর্তা:
                          </div>
                          <div className="font-bold text-[#1E293B]">
                            {officer.nameBn}
                          </div>
                          <div className="text-[#64748B]">
                            {officer.designationBn} • {officer.roomBn}
                          </div>
                        </div>
                        <p className="text-xs text-[#64748B] leading-relaxed">
                          <strong className="text-[#1E293B]">
                            সমাধান প্রক্রিয়া:
                          </strong>{' '}
                          {item.howSolvedBn}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setLinkedCaseNumber(null);
                          setActiveTab('intake');
                        }}
                        className="w-full py-2 px-4 rounded border border-[#005b32] text-[#005b32] hover:bg-[#005b32] hover:text-white text-xs font-bold transition"
                      >
                        এই দপ্তরে অভিযোগ জানান
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Ward-wise Interactive Map */}
            <section className="space-y-3">
              <div>
                <span className="text-xs font-bold text-[#005b32]">
                  ভৌগোলিক তথ্যচিত্র (GIS Map)
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-[#1E293B]">
                  ওয়ার্ড ১ থেকে ৫-এর অভিযোগ ও পৌর সম্পদের অবস্থান
                </h2>
              </div>
              <WardInteractiveMap
                wards={snapshot.wards || []}
                assets={snapshot.assets || []}
                cases={snapshot.cases || []}
                selectedWardId={selectedWardId}
                onSelectWard={setSelectedWardId}
                onSelectCase={(caseNum) => {
                  setSelectedCaseNumber(caseNum);
                  setActiveTab('track');
                }}
              />
            </section>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 2: AI ASSISTANT & COMPLAINT SUBMISSION                       */}
        {/* ================================================================ */}
        {activeTab === 'intake' && (
          <IntakeAndAssistantView
            snapshot={snapshot}
            activeRole="citizen"
            linkedCaseNumber={linkedCaseNumber}
            onCaseCreated={(caseNum, updatedSnapshot) => {
              setSnapshot(updatedSnapshot);
              setSelectedCaseNumber(caseNum);
              setLinkedCaseNumber(null);
              setActiveTab('track');
            }}
          />
        )}

        {/* ================================================================ */}
        {/* TAB 3: COMPLAINT TRACKING                                        */}
        {/* ================================================================ */}
        {activeTab === 'track' && (
          <CaseTrackingAndOrchestrationView
            snapshot={snapshot}
            activeRole="citizen"
            selectedCaseNumber={selectedCaseNumber}
            onSelectCaseNumber={setSelectedCaseNumber}
            onSnapshotUpdated={setSnapshot}
            onStartLinkedCase={(closedCaseNum) => {
              setLinkedCaseNumber(closedCaseNum);
              setActiveTab('intake');
            }}
          />
        )}

        {/* ================================================================ */}
        {/* TAB 4: GOVERNMENT SERVICES & SERVICE DETAILS                     */}
        {/* ================================================================ */}
        {activeTab === 'services' && (
          <ServiceDiscoveryAndRagView
            snapshot={snapshot}
            onFileComplaint={() => {
              setLinkedCaseNumber(null);
              setActiveTab('intake');
              scrollToTop();
            }}
            onOpenTrack={() => {
              setActiveTab('track');
              scrollToTop();
            }}
          />
        )}

        {/* ================================================================ */}
        {/* TAB 5: CITIZEN MY CASES, PROFILE, NOTIFICATIONS, APPEALS         */}
        {/* ================================================================ */}
        {activeTab === 'my_cases' && (
          <div className="space-y-6">
            <PageHeader
              breadcrumbs={['নাগরিক পোর্টাল', 'আমার অভিযোগ ও প্রোফাইল']}
              titleBn="আমার অভিযোগসমূহ, প্রোফাইল, বিজ্ঞপ্তি ও আপিল ব্যবস্থাপনা"
              descriptionBn="আপনার দাখিলকৃত সকল অভিযোগের তালিকা, সিস্টেম বিজ্ঞপ্তি, নাগরিক প্রতিক্রিয়া এবং পুনরায় খোলার আবেদন।"
              actions={
                <button
                  type="button"
                  onClick={() => setActiveTab('intake')}
                  className="px-4 py-2 rounded-md bg-[#005b32] hover:bg-[#004425] text-white text-xs font-bold"
                >
                  নতুন অভিযোগ জমা দিন
                </button>
              }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 space-y-3">
                <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-3">
                  <div className="w-10 h-10 rounded-full bg-[#005b32] text-white flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1E293B]">
                      জনাব আব্দুর রহিম
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      নিবন্ধিত নাগরিক • ওয়ার্ড নং ০২ (কাজীপাড়া)
                    </p>
                  </div>
                </div>
                <div className="text-xs space-y-1.5 text-[#1E293B]">
                  <div>
                    <span className="text-[#64748B]">যোগাযোগ নম্বর:</span>{' '}
                    ০১৭১১-০০০১০১
                  </div>
                  <div>
                    <span className="text-[#64748B]">বিজ্ঞপ্তি মাধ্যম:</span> ওয়েব
                    পোর্টাল ও এসএমএস
                  </div>
                  <div>
                    <span className="text-[#64748B]">দাখিলকৃত মোট অভিযোগ:</span>{' '}
                    <span className="font-bold">{cases.length} টি</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-lg p-5 space-y-3">
                <h3 className="text-sm font-bold text-[#005b32] flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-[#005b32]" />
                  <span>সাম্প্রতিক নাগরিক বিজ্ঞপ্তি ও আপিল আপডেট</span>
                </h3>
                <div className="divide-y divide-[#E2E8F0] text-xs">
                  {(snapshot.notifications || []).slice(0, 4).map((n: any, i: number) => (
                    <div
                      key={n.id || i}
                      className="py-2.5 flex items-center justify-between gap-2"
                    >
                      <div>
                        <span className="font-bold text-[#1E293B]">
                          {n.titleBn || n.messageBn}
                        </span>
                        <div className="text-[#64748B]">{n.messageBn}</div>
                      </div>
                      <span className="font-mono text-[#64748B] shrink-0">
                        {n.channel || 'Web/SMS'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
              <div className="px-5 py-3.5 bg-[#F1F5F9] border-b border-[#CBD5E1] flex items-center justify-between">
                <span className="text-xs font-bold text-[#1E293B]">
                  আমার দাখিলকৃত অভিযোগ ও আপিল তালিকা ({cases.length} টি)
                </span>
                <span className="text-xs text-[#B91C1C] font-bold">
                  পুনরায় খোলা (Reopened): {reopenedCases.length} টি
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#CBD5E1] text-xs font-bold text-[#1E293B]">
                      <th className="py-3 px-4">অভিযোগ নম্বর</th>
                      <th className="py-3 px-4">অভিযোগের বিবরণ</th>
                      <th className="py-3 px-4">দায়িত্বপ্রাপ্ত বিভাগ</th>
                      <th className="py-3 px-4">কাজের অবস্থা</th>
                      <th className="py-3 px-4 text-right">প্রতিক্রিয়া / আপিল</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-xs">
                    {cases.map((c: any) => (
                      <tr key={c.caseNumber} className="hover:bg-[#F8FAFC]">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#005b32]">
                          {c.caseNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#1E293B]">
                            {c.titleBn}
                          </div>
                          <div className="text-[#64748B]">{c.landmarkText}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#005b32] font-bold">
                          {c.primaryDepartmentId}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCaseNumber(c.caseNumber);
                              setActiveTab('track');
                            }}
                            className="px-3 py-1.5 rounded bg-[#005b32] hover:bg-[#004425] text-white text-xs font-bold inline-flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>ট্র্যাকিং, প্রতিক্রিয়া ও পুনরায় খোলা</span>
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

        {/* ================================================================ */}
        {/* TAB 6: ABOUT, HELP / FAQ & CONTACT                               */}
        {/* ================================================================ */}
        {activeTab === 'about_help' && (
          <div className="space-y-6">
            <PageHeader
              breadcrumbs={['নাগরিক পোর্টাল', 'সহায়তা, প্রশ্নোত্তর ও যোগাযোগ']}
              titleBn="প্ল্যাটফর্ম পরিচিতি, সচরাচর জিজ্ঞাসিত প্রশ্নোত্তর (FAQ) ও যোগাযোগ"
              descriptionBn="নাগরিক সাথী এআই প্ল্যাটফর্মের উদ্দেশ্য, অভিযোগ নিষ্পত্তির নিয়মাবলি এবং দপ্তরসমূহের যোগাযোগের ঠিকানা।"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 space-y-3">
                <h2 className="text-base font-bold text-[#005b32]">
                  আমাদের সম্পর্কে (About Nagorik Sathi AI)
                </h2>
                <p className="text-xs text-[#1E293B] leading-relaxed">
                  নাগরিক সাথী এআই একটি প্রাতিষ্ঠানিক ডিজিটাল নাগরিক সেবা ও বহু-বিভাগীয় অভিযোগ সমন্বয় প্ল্যাটফর্ম। এর মূল লক্ষ্য হলো নাগরিকের বাংলা ভাষায় প্রদত্ত অভিযোগ (লিখিত বা ভয়েস) সঠিকভাবে বিশ্লেষণ করে সংশ্লিষ্ট দপ্তরে প্রেরণ করা এবং আন্তঃবিভাগীয় কাজের নির্ভরশীলতা (যেমন বর্জ্য অপসারণ → ড্রেনেজ পরিষ্কার → সড়ক মেরামত) স্বচ্ছভাবে সম্পন্ন করা।
                </p>
                <div className="p-4 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-xs space-y-1.5">
                  <div className="font-bold text-[#005b32]">
                    যোগাযোগের ঠিকানা (Contact Information):
                  </div>
                  <div>নগর ভবন (জোন-২ আঞ্চলিক কার্যালয়), মিরপুর, ঢাকা।</div>
                  <div>হেল্পডেস্ক হটলাইন: ১৬১০৬ • জাতীয় সেবা: ৩৩৩</div>
                  <div>ইমেইল: support@nagoriksathi.gov.bd</div>
                </div>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 space-y-3">
                <h2 className="text-base font-bold text-[#005b32]">
                  সচরাচর জিজ্ঞাসিত প্রশ্নোত্তর (Help & FAQ)
                </h2>
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded border border-[#E2E8F0]">
                    <div className="font-bold text-[#1E293B]">
                      ১. কীভাবে নতুন অভিযোগ জমা দেব?
                    </div>
                    <p className="text-[#64748B] mt-1">
                      উপরের ‘নতুন অভিযোগ’ বাটনে ক্লিক করে আপনার ওয়ার্ড, স্থান ও সমস্যার বিবরণ বাংলায় লিখুন অথবা মাইক্রোফোন বাটনে চাপ দিয়ে মুখে বলুন।
                    </p>
                  </div>
                  <div className="p-3 rounded border border-[#E2E8F0]">
                    <div className="font-bold text-[#1E293B]">
                      ২. একের অধিক দপ্তর জড়িত থাকলে কীভাবে কাজ হয়?
                    </div>
                    <p className="text-[#64748B] mt-1">
                      সিস্টেম স্বয়ংক্রিয়ভাবে ক্রমানুসারে উপ-কাজ (Sub-tasks) তৈরি করে। প্রথম দপ্তর কাজ শেষ করে ছবি আপলোড করলে দ্বিতীয় দপ্তরের কাজ স্বয়ংক্রিয়ভাবে আনলক হয়।
                    </p>
                  </div>
                  <div className="p-3 rounded border border-[#E2E8F0]">
                    <div className="font-bold text-[#1E293B]">
                      ৩. কাজ সন্তোষজনক না হলে কী করব?
                    </div>
                    <p className="text-[#64748B] mt-1">
                      ‘অভিযোগ ট্র্যাকিং’ পাতায় গিয়ে আপনার ফাইলটি খুলুন এবং ‘পুনরায় খোলা (Reopen)’ বাটনে ক্লিক করে কারণ উল্লেখ করুন।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Institutional Government Footer (Deep Green #00331b Theme with Logo.png and bg2.png watermark) */}
      <footer className="relative z-20 overflow-hidden bg-[#00331b] text-white border-t-4 border-[#005b32] mt-16">
        <Image
          src={getDynamicImageSrc('bg2.png', imageVersions)}
          alt=""
          fill
          className="object-cover object-bottom opacity-12 mix-blend-screen pointer-events-none select-none"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-white/15">
            {/* Col 1 (4 Cols): Official Logo.png + Description */}
            <div className="lg:col-span-4 space-y-4">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('home');
                  scrollToTop();
                }}
                aria-label="হোমপেজে ফিরে যান"
                className="bg-white px-4 py-2.5 rounded-lg inline-block shadow-xs cursor-pointer hover:opacity-95 transition focus:outline-none"
              >
                <Image
                  src={getDynamicImageSrc('Logo.png', imageVersions)}
                  alt="নাগরিক সাথী AI — নাগরিক সেবা সমন্বয় ও সমস্যা সমাধান প্ল্যাটফর্ম"
                  width={230}
                  height={54}
                  className="h-12 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </button>
              <p className="text-xs text-white/95 leading-relaxed">
                নাগরিক অভিযোগ গ্রহণ, দপ্তরভিত্তিক স্বয়ংক্রিয় রাউটিং, আন্তঃবিভাগীয় উপ-কাজ সমন্বয় এবং সমাধানের প্রমাণ যাচাইয়ের সমন্বিত সরকারি ডিজিটাল সেবা প্ল্যাটফর্ম।
              </p>
              <div className="text-xs text-white/90 space-y-1 pt-1">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>আঞ্চলিক কার্যালয় (জোন-২), ওয়ার্ড ১–৫, ঢাকা</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>support@nagoriksathi.gov.bd</span>
                </div>
              </div>
            </div>

            {/* Col 2 (3 Cols) */}
            <div className="lg:col-span-3 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/15 pb-1.5">
                নাগরিক পোর্টাল মেনু
              </h4>
              <ul className="space-y-2 text-xs text-white/90">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('intake');
                      scrollToTop();
                    }}
                    className="hover:underline transition"
                  >
                    নতুন অভিযোগ জমা দিন
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('track');
                      scrollToTop();
                    }}
                    className="hover:underline transition"
                  >
                    অভিযোগ ট্র্যাকিং ও প্রমাণ যাচাই
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('services');
                      scrollToTop();
                    }}
                    className="hover:underline transition"
                  >
                    সরকারি সেবা তালিকা ও নির্দেশিকা
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('my_cases');
                      scrollToTop();
                    }}
                    className="hover:underline transition"
                  >
                    আমার অভিযোগ, প্রোফাইল ও আপিল
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('about_help');
                      scrollToTop();
                    }}
                    className="hover:underline transition"
                  >
                    সহায়তা, প্রশ্নোত্তর ও যোগাযোগ
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3 (3 Cols) */}
            <div className="lg:col-span-3 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/15 pb-1.5">
                প্রাতিষ্ঠানিক কর্মক্ষেত্রসমূহ
              </h4>
              <ul className="space-y-2 text-xs text-white/90">
                <li>
                  <button
                    type="button"
                    onClick={() => handleRoleSwitch('ward_desk')}
                    className="hover:underline transition"
                  >
                    হেল্পডেস্ক কর্মক্ষেত্র (Helpdesk Workspace)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleRoleSwitch('officer')}
                    className="hover:underline transition"
                  >
                    বিভাগীয় কর্মকর্তা কর্মক্ষেত্র (Officer Workspace)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleRoleSwitch('supervisor')}
                    className="hover:underline transition"
                  >
                    তদারকি কর্মকর্তা কর্মক্ষেত্র (Supervisor Workspace)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleRoleSwitch('admin')}
                    className="hover:underline transition"
                  >
                    প্রশাসনিক ব্যবস্থাপনা কর্মক্ষেত্র (Admin Workspace)
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4 (2 Cols) */}
            <div className="lg:col-span-2 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/15 pb-1.5">
                জরুরি সহায়তা কেন্দ্র
              </h4>
              <div className="space-y-2 text-xs">
                <div className="bg-[#002413] border border-white/15 rounded p-2.5">
                  <div className="text-white/90 text-[11px]">
                    পৌর সেবা কন্ট্রোল রুম
                  </div>
                  <div className="text-base font-bold text-white font-mono mt-0.5 flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-white" />
                    <span>১৬১০৬</span>
                  </div>
                </div>
                <div className="bg-[#002413] border border-white/15 rounded p-2.5">
                  <div className="text-white/90 text-[11px]">
                    জাতীয় তথ্য ও জরুরি সেবা
                  </div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">
                    ৩৩৩ / ৯৯৯
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/90">
            <div>
              © {new Date().getFullYear()} নাগরিক সাথী এআই — নাগরিক সেবা সমন্বয় ও সমস্যা সমাধান প্ল্যাটফর্ম।
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <span>নাগরিক সেবা সনদ</span>
              <span>•</span>
              <span>তথ্য গোপনীয়তা নীতি</span>
              <span>•</span>
              <span>প্রবেশগম্যতা মানদণ্ড</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Bottom-to-Top Button at Bottom Right (#005b32) */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="উপরে ফিরে যান"
          title="উপরে ফিরে যান (Back to Top)"
          className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-md bg-[#005b32] hover:bg-[#004425] text-white border border-white/30 shadow-md flex items-center justify-center transition-transform hover:-translate-y-0.5 focus:outline-none"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
