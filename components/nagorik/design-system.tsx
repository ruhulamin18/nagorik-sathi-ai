'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Search,
  Bell,
  ChevronRight,
  Menu,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Info,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  LogOut,
  Building2,
} from 'lucide-react';
import type { ActiveRole } from './types';

/**
 * Dynamic Image URL Resolver & Live File Watcher Hook
 * Ensures replacing any file in /public/Images/ (Logo.png, bg1.png, bg2.png, bg3.png, etc.)
 * with the same filename automatically updates everywhere without stale caching.
 */
export function getDynamicImageSrc(
  filename: string,
  versions?: Record<string, string>
): string {
  const v =
    versions?.[filename] ||
    versions?.[filename.toLowerCase()] ||
    'live';
  return `/api/images/${encodeURIComponent(filename)}?v=${encodeURIComponent(v)}`;
}

export function useDynamicImageVersions(
  initialVersions?: Record<string, string>
): Record<string, string> {
  return initialVersions || {};
}


/**
 * Centralized Bangla Institutional Dictionary
 */
export const BN_DICT = {
  appName: 'নাগরিক সাথী এআই',
  appSubtitle: 'নাগরিক সেবা সমন্বয় ও সমস্যা সমাধান প্ল্যাটফর্ম',
  dashboard: 'ড্যাশবোর্ড',
  newComplaint: 'নতুন অভিযোগ',
  complaintManagement: 'অভিযোগ ব্যবস্থাপনা',
  complaintDetails: 'অভিযোগের বিবরণ',
  responsibleDepartment: 'দায়িত্বপ্রাপ্ত বিভাগ',
  taskStatus: 'কাজের অবস্থা',
  resolutionEvidence: 'সমাধানের প্রমাণ',
  awaitingApproval: 'অনুমোদনের অপেক্ষায়',
  inProgress: 'কার্যক্রম চলমান',
  resolutionSubmitted: 'সমাধান জমা হয়েছে',
  reopened: 'পুনরায় খোলা হয়েছে',
  closed: 'বন্ধ করা হয়েছে',
  citizenFeedback: 'নাগরিক প্রতিক্রিয়া',
  departmentalCoordination: 'বিভাগীয় সমন্বয়',
  supervision: 'তদারকি',
  adminManagement: 'প্রশাসনিক ব্যবস্থাপনা',
  userManagement: 'ব্যবহারকারী ব্যবস্থাপনা',
  serviceCatalogue: 'সেবা তালিকা',
  departmentManagement: 'দপ্তর ব্যবস্থাপনা',
  wardManagement: 'ওয়ার্ড ব্যবস্থাপনা',
  assetManagement: 'সম্পদ ব্যবস্থাপনা',
  auditLogs: 'নিরীক্ষা লগ',
};

export const WORKSPACE_LABELS: Record<
  ActiveRole,
  {
    titleBn: string;
    subtitleBn: string;
    actorNameBn: string;
    designationBn: string;
  }
> = {
  citizen: {
    titleBn: 'নাগরিক পোর্টাল',
    subtitleBn: 'সার্বজনীন নাগরিক সেবা ও অভিযোগ ট্র্যাকিং বাতায়ন',
    actorNameBn: 'জনাব আব্দুর রহিম',
    designationBn: 'নিবন্ধিত নাগরিক (ওয়ার্ড নং ০২, কাজীপাড়া)',
  },
  ward_desk: {
    titleBn: 'হেল্পডেস্ক কর্মক্ষেত্র',
    subtitleBn: 'নাগরিক সহায়তা, অভিযোগ নিবন্ধন ও তথ্য যাচাই কেন্দ্র',
    actorNameBn: 'শারমিন আক্তার',
    designationBn: 'ওয়ার্ড সহায়ক কর্মকর্তা (হেল্পডেস্ক ও কল সেন্টার)',
  },
  officer: {
    titleBn: 'বিভাগীয় কর্মকর্তা কর্মক্ষেত্র',
    subtitleBn: 'দপ্তরভিত্তিক নির্ধারিত কাজ, উপ-কাজ ও সমাধানের প্রমাণ ব্যবস্থাপনা',
    actorNameBn: 'প্রকৌ. তরিকুল ইসলাম',
    designationBn: 'নির্বাহী প্রকৌশলী (ড্রেনেজ ও জলাবদ্ধতা নিরসন বিভাগ)',
  },
  supervisor: {
    titleBn: 'তদারকি কর্মকর্তা কর্মক্ষেত্র',
    subtitleBn: 'রাউটিং অনুমোদন, আন্তঃবিভাগীয় সমন্বয় ও নিষ্পত্তি যাচাই',
    actorNameBn: 'প্রকৌ. মাহবুবুর রহমান',
    designationBn: 'তত্ত্বাবধায়ক প্রকৌশলী ও আঞ্চলিক তদারকি কর্মকর্তা',
  },
  admin: {
    titleBn: 'প্রশাসনিক ব্যবস্থাপনা কর্মক্ষেত্র',
    subtitleBn: 'দপ্তর, ওয়ার্ড, রাউটিং নিয়ম, এসএলএ ও নিরীক্ষা লগ ব্যবস্থাপনা',
    actorNameBn: 'ড. শফিকুল ইসলাম',
    designationBn: 'সিস্টেম প্রশাসক ও প্রধান ডিজিটাল সেবা কর্মকর্তা',
  },
  researcher: {
    titleBn: 'প্রশাসনিক ও মূল্যায়ন কর্মক্ষেত্র',
    subtitleBn: 'সিস্টেম কার্যকারিতা ও সেবা মানদণ্ড বিশ্লেষণ',
    actorNameBn: 'ড. শফিকুল ইসলাম',
    designationBn: 'সিস্টেম বিশ্লেষক',
  },
  auditor: {
    titleBn: 'নিরীক্ষা কর্মক্ষেত্র',
    subtitleBn: 'কার্যক্রম ও নিরীক্ষা লগ যাচাই',
    actorNameBn: 'জনাব মাহমুদুল হাসান',
    designationBn: 'নিরীক্ষা কর্মকর্তা',
  },
};

export const STATUS_META: Record<
  string,
  {
    labelBn: string;
    variant: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  }
> = {
  Submitted: { labelBn: 'অভিযোগ জমা হয়েছে', variant: 'info' },
  'Under review': { labelBn: 'অনুমোদনের অপেক্ষায়', variant: 'warning' },
  Assigned: { labelBn: 'দায়িত্বপ্রাপ্ত বিভাগে প্রেরিত', variant: 'info' },
  'In progress': { labelBn: 'কার্যক্রম চলমান', variant: 'info' },
  Blocked: { labelBn: 'পূর্ববর্তী কাজের অপেক্ষায়', variant: 'warning' },
  'Resolution submitted': { labelBn: 'সমাধান জমা হয়েছে', variant: 'warning' },
  Resolved: { labelBn: 'সমাধান সম্পন্ন', variant: 'success' },
  Reopened: { labelBn: 'পুনরায় খোলা হয়েছে', variant: 'error' },
  Closed: { labelBn: 'বন্ধ করা হয়েছে', variant: 'success' },
  Completed: { labelBn: 'সম্পন্ন হয়েছে', variant: 'success' },
  Pending: { labelBn: 'অপেক্ষমাণ', variant: 'neutral' },
};

export function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] || {
    labelBn: status,
    variant: 'neutral',
  };

  const styles: Record<string, string> = {
    success: 'bg-[#005b32]/10 text-[#005b32] border-[#005b32]/30',
    warning: 'bg-[#B45309]/10 text-[#B45309] border-[#B45309]/30',
    error: 'bg-[#B91C1C]/10 text-[#B91C1C] border-[#B91C1C]/30',
    info: 'bg-[#1D4ED8]/10 text-[#1D4ED8] border-[#1D4ED8]/30',
    neutral: 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border text-xs font-medium whitespace-nowrap ${styles[meta.variant]}`}
    >
      {meta.variant === 'success' && <CheckCircle2 className="w-3.5 h-3.5" />}
      {meta.variant === 'warning' && <Clock className="w-3.5 h-3.5" />}
      {meta.variant === 'error' && <AlertTriangle className="w-3.5 h-3.5" />}
      {meta.variant === 'info' && <Info className="w-3.5 h-3.5" />}
      <span>{meta.labelBn}</span>
    </span>
  );
}

export function StatCard({
  labelBn,
  value,
  subtextBn,
  accentColor = '#005b32',
}: {
  labelBn: string;
  value: string | number;
  subtextBn?: string;
  accentColor?: string;
}) {
  return (
    <div
      className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-2xs"
      style={{ borderLeftWidth: '4px', borderLeftColor: accentColor }}
    >
      <div className="text-xs font-bold text-[#64748B]">{labelBn}</div>
      <div className="text-2xl font-bold text-[#1E293B] tabular-nums mt-1">
        {value}
      </div>
      {subtextBn && (
        <div className="text-xs text-[#64748B] mt-1">{subtextBn}</div>
      )}
    </div>
  );
}

export function PageHeader({
  breadcrumbs,
  titleBn,
  descriptionBn,
  actions,
}: {
  breadcrumbs: string[];
  titleBn: string;
  descriptionBn?: string;
  actions?: React.ReactNode;
}) {
  const imageVersions = useDynamicImageVersions();

  return (
    <div className="relative overflow-hidden bg-white border border-[#CBD5E1] border-l-4 border-l-[#005b32] rounded-lg p-5 sm:p-6 mb-5 shadow-2xs">
      <Image
        src={getDynamicImageSrc('bg2.png', imageVersions)}
        alt=""
        fill
        className="object-cover object-center opacity-25 pointer-events-none select-none"
        referrerPolicy="no-referrer"
      />
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <nav
            aria-label="Breadcrumb"
            className="flex items-center flex-wrap gap-1.5 text-xs text-[#64748B] mb-1.5"
          >
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
                )}
                <span
                  className={
                    idx === breadcrumbs.length - 1
                      ? 'font-bold text-[#005b32]'
                      : 'text-[#64748B]'
                  }
                >
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </nav>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1E293B]">
            {titleBn}
          </h1>
          {descriptionBn && (
            <p className="text-sm text-[#64748B] mt-1 max-w-3xl">
              {descriptionBn}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2.5 shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
}

export function SearchBar({
  value,
  onChange,
  placeholderBn = 'অভিযোগ নম্বর, শিরোনাম বা এলাকার নাম দিয়ে খুঁজুন...',
}: {
  value: string;
  onChange: (val: string) => void;
  placeholderBn?: string;
}) {
  return (
    <div className="relative flex-1 min-w-[220px]">
      <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholderBn}
        className="w-full pl-9 pr-3 py-2 bg-white border border-[#CBD5E1] rounded-md text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#005b32] focus:ring-1 focus:ring-[#005b32]"
      />
    </div>
  );
}

export function EmptyState({
  titleBn,
  descriptionBn,
  actionButton,
}: {
  titleBn: string;
  descriptionBn: string;
  actionButton?: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg p-8 text-center">
      <div className="w-10 h-10 rounded-full bg-[#F1F5F9] text-[#64748B] flex items-center justify-center mx-auto mb-3">
        <Info className="w-5 h-5" />
      </div>
      <h3 className="text-base font-bold text-[#1E293B]">{titleBn}</h3>
      <p className="text-xs text-[#64748B] mt-1 max-w-md mx-auto">
        {descriptionBn}
      </p>
      {actionButton && <div className="mt-4">{actionButton}</div>}
    </div>
  );
}

export function ConfirmationDialog({
  open,
  titleBn,
  descriptionBn,
  confirmLabelBn = 'নিশ্চিত করুন',
  cancelLabelBn = 'বাতিল করুন',
  variant = 'primary',
  onConfirm,
  onCancel,
}: {
  open: boolean;
  titleBn: string;
  descriptionBn: string;
  confirmLabelBn?: string;
  cancelLabelBn?: string;
  variant?: 'primary' | 'destructive';
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white border border-[#CBD5E1] rounded-lg max-w-md w-full p-6 shadow-lg">
        <h3 className="text-lg font-bold text-[#1E293B]">{titleBn}</h3>
        <p className="text-sm text-[#64748B] mt-2 leading-relaxed">
          {descriptionBn}
        </p>
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-md border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-xs font-bold text-[#1E293B] transition"
          >
            {cancelLabelBn}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-md text-xs font-bold text-white transition ${
              variant === 'destructive'
                ? 'bg-[#B91C1C] hover:bg-red-800'
                : 'bg-[#005b32] hover:bg-[#004425]'
            }`}
          >
            {confirmLabelBn}
          </button>
        </div>
      </div>
    </div>
  );
}

export interface SidebarMenuItem {
  id: string;
  labelBn: string;
  groupBn?: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: number;
}

export function InstitutionalAppShell({
  activeRole,
  onRoleChange,
  menuItems,
  activeMenuId,
  onSelectMenu,
  globalSearchValue,
  onGlobalSearchChange,
  notifications = [],
  children,
}: {
  activeRole: ActiveRole;
  onRoleChange: (role: ActiveRole) => void;
  menuItems: SidebarMenuItem[];
  activeMenuId: string;
  onSelectMenu: (id: string) => void;
  globalSearchValue: string;
  onGlobalSearchChange: (val: string) => void;
  notifications?: any[];
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const imageVersions = useDynamicImageVersions();

  const meta = WORKSPACE_LABELS[activeRole] || WORKSPACE_LABELS.officer;

  const groups = Array.from(
    new Set(menuItems.map((m) => m.groupBn || 'মূল মেনু'))
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#1E293B]">
      {/* Institutional Topbar (#005b32) */}
      <header className="sticky top-0 z-40 h-16 bg-[#005b32] text-white border-b border-[#004425] px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Official Logo + Workspace Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="lg:hidden p-2 rounded hover:bg-[#004425] text-white"
            aria-label="মেনু টগল করুন"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => onRoleChange('citizen')}
            aria-label="হোমপেজে ফিরে যান"
            className="flex items-center gap-3 text-left focus:outline-none cursor-pointer"
          >
            <div className="bg-white px-2.5 py-1 rounded-md shadow-2xs shrink-0">
              <Image
                src={getDynamicImageSrc('Logo.png', imageVersions)}
                alt="নাগরিক সাথী AI"
                width={170}
                height={40}
                className="h-8 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="hidden sm:block">
              <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded bg-[#004425] text-white border border-white/20">
                {meta.titleBn}
              </span>
              <p className="text-[11px] text-white/90 mt-0.5">
                {meta.subtitleBn}
              </p>
            </div>
          </button>
        </div>

        {/* Center: Global Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-white/80 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalSearchValue}
              onChange={(e) => onGlobalSearchChange(e.target.value)}
              placeholder="অভিযোগ নম্বর (NS-2026-1001), ওয়ার্ড বা দপ্তর অনুসন্ধান..."
              className="w-full pl-9 pr-3 py-1.5 rounded bg-[#004425] border border-white/25 text-xs text-white placeholder:text-white/75 focus:outline-none focus:border-white"
            />
          </div>
        </div>

        {/* Right: Workspace Selector + Notifications + User Profile */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="institutional-workspace-select"
              className="text-xs text-white/90 hidden xl:inline"
            >
              কর্মক্ষেত্র:
            </label>
            <select
              id="institutional-workspace-select"
              value={activeRole}
              onChange={(e) => onRoleChange(e.target.value as ActiveRole)}
              className="bg-[#004425] text-white border border-white/30 rounded px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-white"
            >
              <option value="citizen">১. নাগরিক পোর্টাল (Public Website)</option>
              <option value="ward_desk">২. হেল্পডেস্ক কর্মক্ষেত্র (Helpdesk)</option>
              <option value="officer">৩. বিভাগীয় কর্মকর্তা কর্মক্ষেত্র (Officer)</option>
              <option value="supervisor">৪. তদারকি কর্মকর্তা কর্মক্ষেত্র (Supervisor)</option>
              <option value="admin">৫. প্রশাসনিক ব্যবস্থাপনা কর্মক্ষেত্র (Admin)</option>
            </select>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 rounded bg-[#004425] hover:bg-[#00521E] border border-white/20 text-white relative transition"
              title="বিজ্ঞপ্তি"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#B91C1C] text-[10px] font-bold flex items-center justify-center">
                  {Math.min(notifications.length, 9)}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#CBD5E1] rounded-lg shadow-lg text-[#1E293B] z-50 overflow-hidden">
                <div className="px-4 py-2.5 bg-[#F1F5F9] border-b border-[#E2E8F0] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#005b32]">
                    সিস্টেম বিজ্ঞপ্তি ({notifications.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setNotifOpen(false)}
                    className="text-xs text-[#64748B] hover:text-[#1E293B]"
                  >
                    বন্ধ করুন
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-[#E2E8F0]">
                  {notifications.slice(0, 6).map((n: any, i: number) => (
                    <div key={n.id || i} className="p-3 text-xs space-y-1">
                      <div className="font-bold text-[#1E293B]">
                        {n.titleBn || n.messageBn || 'অভিযোগ হালনাগাদ বিজ্ঞপ্তি'}
                      </div>
                      <div className="text-[#64748B]">
                        {n.messageBn || n.channel}
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="p-4 text-xs text-center text-[#64748B]">
                      নতুন কোনো বিজ্ঞপ্তি নেই
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-white/25">
            <div className="w-7 h-7 rounded-full bg-[#004425] border border-white/30 flex items-center justify-center text-xs font-bold">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="text-left hidden lg:block">
              <div className="text-xs font-bold text-white leading-tight">
                {meta.actorNameBn}
              </div>
              <div className="text-[10px] text-white/85 leading-tight truncate max-w-[160px]">
                {meta.designationBn}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRoleChange('citizen')}
              title="নাগরিক পোর্টালে ফিরে যান (প্রস্থান)"
              className="p-1.5 rounded bg-[#004425] hover:bg-[#B91C1C] text-white border border-white/20 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Institutional Body */}
      <div className="flex-1 flex relative">
        <aside
          className={`hidden lg:flex flex-col relative z-20 bg-white border-r border-[#CBD5E1] shadow-2xs transition-all duration-200 shrink-0 ${
            sidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          <div className="p-3.5 border-b border-[#CBD5E1] bg-[#F3FAF5] flex items-center justify-between">
            {!sidebarCollapsed && (
              <span className="text-xs font-bold text-[#005b32] uppercase tracking-wider">
                {meta.titleBn}
              </span>
            )}
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded hover:bg-[#E8F5EC] text-[#005b32] hover:text-[#004425] transition-colors"
              title={sidebarCollapsed ? 'সাইডবার বড় করুন' : 'সাইডবার ছোট করুন'}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>

          <nav className="relative z-10 flex-1 overflow-y-auto p-3 space-y-4 bg-white">
            {groups.map((groupName) => {
              const items = menuItems.filter(
                (m) => (m.groupBn || 'মূল মেনু') === groupName
              );
              return (
                <div key={groupName} className="space-y-1">
                  {!sidebarCollapsed && (
                    <div className="px-2.5 py-1 text-[11px] font-bold text-[#005b32] uppercase tracking-wider">
                      {groupName}
                    </div>
                  )}
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active = activeMenuId === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectMenu(item.id)}
                        title={item.labelBn}
                        className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-md text-xs font-bold transition ${
                          active
                            ? 'bg-[#005b32] text-white shadow-xs border border-[#004425]'
                            : 'text-[#172033] hover:bg-[#E8F5EC] hover:text-[#005b32]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              active ? 'text-white' : 'text-[#005b32]'
                            }`}
                          />
                          {!sidebarCollapsed && (
                            <span className="truncate">{item.labelBn}</span>
                          )}
                        </div>
                        {!sidebarCollapsed &&
                          typeof item.badgeCount === 'number' && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold ${
                                active
                                  ? 'bg-[#00381e] text-white'
                                  : 'bg-[#E8F5EC] text-[#005b32] border border-[#B9DFC7]'
                              }`}
                            >
                              {item.badgeCount}
                            </span>
                          )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </nav>

          {!sidebarCollapsed && (
            <div className="relative z-10 p-3.5 border-t border-[#CBD5E1] bg-[#F3FAF5] text-[11px] text-[#172033] space-y-1">
              <div className="font-bold text-[#005b32] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#005b32]" />
                <span>সিটি কর্পোরেশন জোন-২</span>
              </div>
              <div className="text-[#475569] font-medium">
                ওয়ার্ড ১–৫ সমন্বিত নেটওয়ার্ক
              </div>
            </div>
          )}
        </aside>

        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/60"
              onClick={() => setMobileDrawerOpen(false)}
            />
            <aside className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col z-10 shadow-xl">
              <div className="p-4 bg-[#005b32] text-white flex items-center justify-between">
                <span className="text-sm font-bold">{meta.titleBn}</span>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded hover:bg-[#004425]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-3 space-y-4 bg-white">
                {groups.map((groupName) => {
                  const items = menuItems.filter(
                    (m) => (m.groupBn || 'মূল মেনু') === groupName
                  );
                  return (
                    <div key={groupName} className="space-y-1">
                      <div className="px-2.5 py-1 text-[11px] font-bold text-[#005b32] uppercase">
                        {groupName}
                      </div>
                      {items.map((item) => {
                        const Icon = item.icon;
                        const active = activeMenuId === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              onSelectMenu(item.id);
                              setMobileDrawerOpen(false);
                            }}
                            className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-md text-xs font-bold ${
                              active
                                ? 'bg-[#005b32] text-white shadow-xs'
                                : 'text-[#172033] hover:bg-[#E8F5EC] hover:text-[#005b32]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon className="w-4 h-4 shrink-0" />
                              <span>{item.labelBn}</span>
                            </div>
                            {typeof item.badgeCount === 'number' && (
                              <span
                                className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                                  active
                                    ? 'bg-[#00381e] text-white'
                                    : 'bg-[#E8F5EC] text-[#005b32]'
                                }`}
                              >
                                {item.badgeCount}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        <main className="flex-1 min-w-0 p-4 sm:p-6 overflow-x-hidden relative bg-[#F8FAFC]">
          <div
            className="absolute inset-0 pointer-events-none opacity-15 z-0"
            style={{
              backgroundImage: `url('${getDynamicImageSrc('bg3.png', imageVersions)}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'top center',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <div className="max-w-[1360px] mx-auto relative z-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
