'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  UserPlus,
  FilePlus2,
  Search,
  AlertCircle,
  Compass,
  CheckCircle2,
  Eye,
  Phone,
  MapPin,
} from 'lucide-react';
import type { PlatformSnapshot, ActiveRole } from './types';
import {
  InstitutionalAppShell,
  PageHeader,
  StatCard,
  StatusBadge,
  SearchBar,
  EmptyState,
  type SidebarMenuItem,
} from './design-system';
import IntakeAndAssistantView from './IntakeAndAssistantView';
import CaseTrackingAndOrchestrationView from './CaseTrackingAndOrchestrationView';

interface HelpdeskWorkspaceViewProps {
  snapshot: PlatformSnapshot;
  activeRole: ActiveRole;
  onRoleChange: (role: ActiveRole) => void;
  onSnapshotUpdated: (snapshot: PlatformSnapshot) => void;
}

export default function HelpdeskWorkspaceView({
  snapshot,
  activeRole,
  onRoleChange,
  onSnapshotUpdated,
}: HelpdeskWorkspaceViewProps) {
  const [activeMenu, setActiveMenu] = useState<string>('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedCaseNumber, setSelectedCaseNumber] = useState<string>(
    snapshot.cases?.[0]?.caseNumber || 'NS-2026-1001'
  );
  const [wardFilter, setWardFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const cases = snapshot.cases || [];
  const assistedCases = cases.filter(
    (c: any) =>
      c.submittedChannel === 'Ward Desk' ||
      c.submittedChannel === 'Assisted' ||
      c.requiresHumanReview
  );
  const missingInfoCases = cases.filter(
    (c: any) =>
      !c.assetId ||
      c.requiresHumanReview ||
      (c.confidenceScore && Number(c.confidenceScore) < 0.85)
  );

  const menuItems: SidebarMenuItem[] = [
    {
      id: 'dashboard',
      labelBn: 'হেল্পডেস্ক ড্যাশবোর্ড',
      groupBn: 'হেল্পডেস্ক পরিচালনা',
      icon: LayoutDashboard,
    },
    {
      id: 'assistance',
      labelBn: 'নাগরিক সহায়তা ও নিবন্ধন',
      groupBn: 'হেল্পডেস্ক পরিচালনা',
      icon: UserPlus,
      badgeCount: assistedCases.length,
    },
    {
      id: 'entry',
      labelBn: 'অভিযোগ এন্ট্রি ফরম',
      groupBn: 'অভিযোগ ব্যবস্থাপনা',
      icon: FilePlus2,
    },
    {
      id: 'search',
      labelBn: 'অভিযোগ অনুসন্ধান',
      groupBn: 'অভিযোগ ব্যবস্থাপনা',
      icon: Search,
      badgeCount: cases.length,
    },
    {
      id: 'missing',
      labelBn: 'অসম্পূর্ণ তথ্য যাচাই',
      groupBn: 'তথ্য ও ট্র্যাকিং সহায়তা',
      icon: AlertCircle,
      badgeCount: missingInfoCases.length,
    },
    {
      id: 'tracking_assist',
      labelBn: 'নাগরিক ট্র্যাকিং সহায়তা',
      groupBn: 'তথ্য ও ট্র্যাকিং সহায়তা',
      icon: Compass,
    },
  ];

  const filteredCases = cases.filter((c: any) => {
    const matchesSearch =
      !globalSearch.trim() ||
      c.caseNumber?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      c.titleBn?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      c.landmarkText?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      c.citizenName?.toLowerCase().includes(globalSearch.toLowerCase());
    const matchesWard = wardFilter === 'ALL' || c.wardId === wardFilter;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesWard && matchesStatus;
  });

  return (
    <InstitutionalAppShell
      activeRole={activeRole}
      onRoleChange={onRoleChange}
      menuItems={menuItems}
      activeMenuId={activeMenu}
      onSelectMenu={setActiveMenu}
      globalSearchValue={globalSearch}
      onGlobalSearchChange={setGlobalSearch}
      notifications={snapshot.notifications || []}
    >
      {/* 1. Helpdesk Dashboard */}
      {activeMenu === 'dashboard' && (
        <div className="space-y-6">
          <PageHeader
            breadcrumbs={['হেল্পডেস্ক কর্মক্ষেত্র', 'হেল্পডেস্ক ড্যাশবোর্ড']}
            titleBn="ওয়ার্ড হেল্পডেস্ক ও নাগরিক সহায়তা ড্যাশবোর্ড"
            descriptionBn="সশরীরে বা ফোনে আসা নাগরিকদের অভিযোগ নিবন্ধন, অসম্পূর্ণ তথ্য হালনাগাদ এবং ট্র্যাকিং সহায়তা প্রদান।"
            actions={
              <button
                type="button"
                onClick={() => setActiveMenu('entry')}
                className="px-4 py-2 rounded-md bg-[#005b32] hover:bg-[#004425] text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <FilePlus2 className="w-4 h-4" />
                <span>নতুন অভিযোগ নিবন্ধন করুন</span>
              </button>
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              labelBn="মোট নিবন্ধিত অভিযোগ"
              value={`${cases.length} টি`}
              subtextBn="ওয়ার্ড ১–৫ সমন্বিত রেকর্ড"
              accentColor="#005b32"
            />
            <StatCard
              labelBn="হেল্পডেস্কের মাধ্যমে নিবন্ধিত"
              value={`${assistedCases.length} টি`}
              subtextBn="সহায়ক এজেন্ট কর্তৃক এন্ট্রিকৃত"
              accentColor="#087F8C"
            />
            <StatCard
              labelBn="অসম্পূর্ণ তথ্য যাচাই প্রয়োজন"
              value={`${missingInfoCases.length} টি`}
              subtextBn="লোকেশন বা সম্পদ আইডি সংযুক্তি বাকি"
              accentColor="#B45309"
            />
            <StatCard
              labelBn="সমাধান সম্পন্ন অভিযোগ"
              value={`${
                cases.filter((c: any) =>
                  ['Resolved', 'Closed'].includes(c.status)
                ).length
              } টি`}
              subtextBn="নাগরিককে ফোনে অবহিতকরণযোগ্য"
              accentColor="#15803D"
            />
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[#1E293B]">
                  সাম্প্রতিক নাগরিক অভিযোগ তালিকা
                </h2>
                <p className="text-xs text-[#64748B]">
                  নাগরিকের ফোন নম্বর বা অভিযোগ নম্বর দিয়ে দ্রুত অবস্থা জানান
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveMenu('missing')}
                  className="px-3 py-1.5 rounded border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-xs font-bold text-[#1E293B]"
                >
                  অসম্পূর্ণ তথ্য কিউ ({missingInfoCases.length})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F1F5F9] border-b border-[#CBD5E1] text-xs font-bold text-[#1E293B]">
                    <th className="py-3 px-4">অভিযোগ নম্বর</th>
                    <th className="py-3 px-4">নাগরিকের নাম ও মাধ্যম</th>
                    <th className="py-3 px-4">অভিযোগের বিবরণ ও স্থান</th>
                    <th className="py-3 px-4">দায়িত্বপ্রাপ্ত বিভাগ</th>
                    <th className="py-3 px-4">কাজের অবস্থা</th>
                    <th className="py-3 px-4 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-xs">
                  {filteredCases.slice(0, 8).map((c: any, idx: number) => {
                    const dept = (snapshot.departments || []).find(
                      (d: any) => (d.deptId || d.departmentId) === c.primaryDepartmentId
                    );
                    return (
                      <tr key={`${c.caseNumber || c.id || 'hd-case'}-${idx}`} className="hover:bg-[#F8FAFC]">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#005b32]">
                          {c.caseNumber}
                          <div className="text-[11px] font-normal text-[#64748B]">
                            {c.wardId}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#1E293B]">
                            {c.citizenName || 'জনাব আব্দুর রহিম'}
                          </div>
                          <div className="text-[#64748B]">
                            মাধ্যম: {c.submittedChannel || c.submittedVia || 'ওয়েব পোর্টাল'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-bold text-[#1E293B] truncate">
                            {c.titleBn || c.title}
                          </div>
                          <div className="text-[#64748B] truncate">
                            {c.landmarkText || c.landmark}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-[#1E293B]">
                          {dept?.nameBn || c.primaryDepartmentId}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCaseNumber(c.caseNumber);
                              setActiveMenu('tracking_assist');
                            }}
                            className="px-2.5 py-1.5 rounded border border-[#CBD5E1] hover:bg-[#005b32] hover:text-white text-xs font-bold text-[#1E293B] transition inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>ট্র্যাকিং দেখুন</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Citizen Assistance & Registration OR 3. Complaint Entry */}
      {(activeMenu === 'assistance' || activeMenu === 'entry') && (
        <div className="space-y-6">
          <PageHeader
            breadcrumbs={[
              'হেল্পডেস্ক কর্মক্ষেত্র',
              activeMenu === 'assistance'
                ? 'নাগরিক সহায়তা ও নিবন্ধন'
                : 'অভিযোগ এন্ট্রি ফরম',
            ]}
            titleBn={
              activeMenu === 'assistance'
                ? 'নাগরিক সহায়তা ও নতুন অভিযোগ নিবন্ধন'
                : 'হেল্পডেস্ক অভিযোগ এন্ট্রি ফরম'
            }
            descriptionBn="নাগরিকের বক্তব্য শুনে বা লিখিত দরখাস্তের ভিত্তিতে এআই বিশ্লেষণসহ অভিযোগটি নিবন্ধন করুন এবং ট্র্যাকিং নম্বর নাগরিককে প্রদান করুন।"
          />
          <IntakeAndAssistantView
            snapshot={snapshot}
            activeRole="ward_desk"
            onCaseCreated={(caseNum, updatedSnapshot) => {
              onSnapshotUpdated(updatedSnapshot);
              setSelectedCaseNumber(caseNum);
              setActiveMenu('tracking_assist');
            }}
          />
        </div>
      )}

      {/* 4. Case Search */}
      {activeMenu === 'search' && (
        <div className="space-y-6">
          <PageHeader
            breadcrumbs={['হেল্পডেস্ক কর্মক্ষেত্র', 'অভিযোগ অনুসন্ধান']}
            titleBn="সার্বিক অভিযোগ অনুসন্ধান ও ফিল্টার"
            descriptionBn="ওয়ার্ড, কাজের অবস্থা অথবা অভিযোগ নম্বর দিয়ে যেকোনো ফাইল অনুসন্ধান করুন।"
          />

          <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 flex flex-wrap items-center gap-3">
            <SearchBar
              value={globalSearch}
              onChange={setGlobalSearch}
              placeholderBn="অভিযোগ নম্বর, নাগরিকের নাম বা ল্যান্ডমার্ক লিখুন..."
            />
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-[#CBD5E1] rounded-md text-xs font-bold text-[#1E293B]"
            >
              <option value="ALL">সকল ওয়ার্ড</option>
              {(snapshot.wards || []).map((w: any, idx: number) => (
                <option key={`${w.wardId || w.id || 'ward'}-${idx}`} value={w.wardId}>
                  ওয়ার্ড {w.wardNumber} — {w.nameBn}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-[#CBD5E1] rounded-md text-xs font-bold text-[#1E293B]"
            >
              <option value="ALL">সকল অবস্থা</option>
              <option value="In progress">কার্যক্রম চলমান</option>
              <option value="Assigned">দায়িত্বপ্রাপ্ত বিভাগে প্রেরিত</option>
              <option value="Resolution submitted">সমাধান জমা হয়েছে</option>
              <option value="Resolved">সমাধান সম্পন্ন</option>
              <option value="Reopened">পুনরায় খোলা হয়েছে</option>
            </select>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
            {filteredCases.length === 0 ? (
              <EmptyState
                titleBn="কোনো অভিযোগ পাওয়া যায়নি"
                descriptionBn="অনুসন্ধান শর্ত পরিবর্তন করে পুনরায় চেষ্টা করুন।"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F1F5F9] border-b border-[#CBD5E1] text-xs font-bold text-[#1E293B]">
                      <th className="py-3 px-4">অভিযোগ নম্বর</th>
                      <th className="py-3 px-4">ওয়ার্ড ও স্থান</th>
                      <th className="py-3 px-4">অভিযোগের শিরোনাম</th>
                      <th className="py-3 px-4">দায়িত্বপ্রাপ্ত বিভাগ</th>
                      <th className="py-3 px-4">কাজের অবস্থা</th>
                      <th className="py-3 px-4 text-right">বিস্তারিত</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-xs">
                    {filteredCases.map((c: any, idx: number) => {
                      const dept = (snapshot.departments || []).find(
                        (d: any) => (d.deptId || d.departmentId) === c.primaryDepartmentId
                      );
                      return (
                        <tr key={`${c.caseNumber || c.id || 'search-case'}-${idx}`} className="hover:bg-[#F8FAFC]">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#005b32]">
                            {c.caseNumber}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#1E293B]">
                              {c.wardId}
                            </div>
                            <div className="text-[#64748B]">
                              {c.landmarkText || c.landmark}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#1E293B]">
                            {c.titleBn || c.title}
                          </td>
                          <td className="py-3.5 px-4 text-[#1E293B]">
                            {dept?.nameBn || c.primaryDepartmentId}
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusBadge status={c.status} />
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCaseNumber(c.caseNumber);
                                setActiveMenu('tracking_assist');
                              }}
                              className="px-3 py-1.5 rounded bg-[#005b32] text-white text-xs font-bold"
                            >
                              ফাইল খুলুন
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Missing Information Queue */}
      {activeMenu === 'missing' && (
        <div className="space-y-6">
          <PageHeader
            breadcrumbs={['হেল্পডেস্ক কর্মক্ষেত্র', 'অসম্পূর্ণ তথ্য যাচাই']}
            titleBn="অসম্পূর্ণ তথ্য ও লোকেশন যাচাই তালিকা"
            descriptionBn="যেসব অভিযোগে সুনির্দিষ্ট ল্যান্ডমার্ক, পোল/ড্রেন সম্পদ আইডি বা স্পষ্ট বিভাগ উল্লেখ নেই, সেগুলো নাগরিকের সাথে কথা বলে পরিমার্জন করুন।"
          />

          <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F1F5F9] border-b border-[#CBD5E1] text-xs font-bold text-[#1E293B]">
                    <th className="py-3 px-4">অভিযোগ নম্বর</th>
                    <th className="py-3 px-4">অভিযোগের বিবরণ</th>
                    <th className="py-3 px-4">যাচাইয়ের কারণ</th>
                    <th className="py-3 px-4">বর্তমান অবস্থা</th>
                    <th className="py-3 px-4 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-xs">
                  {missingInfoCases.map((c: any, idx: number) => (
                    <tr key={`${c.caseNumber || c.id || 'missing-case'}-${idx}`} className="hover:bg-[#F8FAFC]">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#005b32]">
                        {c.caseNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#1E293B]">
                          {c.titleBn || c.title}
                        </div>
                        <div className="text-[#64748B] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{c.landmarkText || c.landmark || 'ল্যান্ডমার্ক অস্পষ্ট'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#B45309] font-medium">
                        {!c.assetId
                          ? 'সরকারি সম্পদ আইডি (Asset ID) সংযুক্ত নেই'
                          : 'একাধিক দপ্তর সংশ্লিষ্ট — মানবিক যাচাই প্রয়োজন'}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCaseNumber(c.caseNumber);
                            setActiveMenu('tracking_assist');
                          }}
                          className="px-3 py-1.5 rounded bg-[#087F8C] hover:bg-[#005b32] text-white text-xs font-bold transition"
                        >
                          তথ্য যাচাই ও ট্র্যাকিং
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

      {/* 6. Citizen Tracking Assistance */}
      {activeMenu === 'tracking_assist' && (
        <div className="space-y-6">
          <PageHeader
            breadcrumbs={[
              'হেল্পডেস্ক কর্মক্ষেত্র',
              'নাগরিক ট্র্যাকিং সহায়তা',
            ]}
            titleBn="নাগরিক ট্র্যাকিং ও প্রতিক্রিয়া সহায়তা"
            descriptionBn="নাগরিকের পক্ষ থেকে অভিযোগের অগ্রগতি দেখা, দায়িত্বপ্রাপ্ত কর্মকর্তার তথ্য জানানো এবং নাগরিকের মতামত বা পুনরায় খোলার আবেদন এন্ট্রি করা।"
          />
          <CaseTrackingAndOrchestrationView
            snapshot={snapshot}
            activeRole="ward_desk"
            selectedCaseNumber={selectedCaseNumber}
            onSelectCaseNumber={setSelectedCaseNumber}
            onSnapshotUpdated={onSnapshotUpdated}
            onStartLinkedCase={() => setActiveMenu('entry')}
          />
        </div>
      )}
    </InstitutionalAppShell>
  );
}
