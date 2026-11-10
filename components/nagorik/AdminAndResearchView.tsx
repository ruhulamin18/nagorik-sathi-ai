'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  MapPin,
  BookOpen,
  Sliders,
  History,
  Settings,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import type { PlatformSnapshot, ActiveRole } from './types';
import {
  InstitutionalAppShell,
  PageHeader,
  StatCard,
  SidebarMenuItem,
} from './design-system';

interface Props {
  snapshot: PlatformSnapshot;
  activeSubTab: 'admin' | 'research';
  activeRole: ActiveRole;
  onRoleChange?: (role: ActiveRole) => void;
  onRefresh: () => void;
  onSnapshotUpdated?: (snapshot: PlatformSnapshot) => void;
}

export default function AdminAndResearchView({
  snapshot,
  activeRole,
  onRoleChange,
  onRefresh,
  onSnapshotUpdated,
}: Props) {
  const [adminMenu, setAdminMenu] = useState<string>('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');

  // Admin Rule Creation Form State
  const [ruleCode, setRuleCode] = useState('R-109');
  const [issueCategory, setIssueCategory] = useState('Drainage & Waterlogging');
  const [primaryDeptId, setPrimaryDeptId] = useState('DEPT-DRAIN');
  const [supportingDeptId, setSupportingDeptId] = useState('DEPT-WASTE');
  const [ruleDescBn, setRuleDescBn] = useState(
    'কালভার্টের মুখে বর্জ্য জমে জলাবদ্ধতা তৈরি হলে প্রথমে বর্জ্য অপসারণ ও পরে ড্রেনেজ বিভাগ কাজ করবে।'
  );
  const [savingRule, setSavingRule] = useState(false);
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);

  const cases = snapshot.cases || [];
  const departments = snapshot.departments || [];
  const wards = snapshot.wards || [];
  const assets = snapshot.assets || [];
  const users = snapshot.users || [];
  const roles = snapshot.roles || [];
  const services = snapshot.services || [];
  const docs = snapshot.governmentDocuments || [];
  const rules = snapshot.responsibilityRules || [];
  const slaRules = snapshot.slaRules || [];
  const auditLogs = snapshot.auditLogs || [];
  const integrationLogs = snapshot.integrationLogs || [];

  const adminMenus: SidebarMenuItem[] = [
    {
      id: 'dashboard',
      labelBn: 'প্রশাসনিক ড্যাশবোর্ড',
      groupBn: 'সিস্টেম তদারকি',
      icon: LayoutDashboard,
    },
    {
      id: 'users_roles',
      labelBn: 'ব্যবহারকারী ও ভূমিকা ব্যবস্থাপনা',
      groupBn: 'প্রশাসনিক ব্যবস্থাপনা',
      icon: Users,
      badgeCount: users.length,
    },
    {
      id: 'departments',
      labelBn: 'দপ্তর ব্যবস্থাপনা',
      groupBn: 'প্রশাসনিক ব্যবস্থাপনা',
      icon: Building2,
      badgeCount: departments.length,
    },
    {
      id: 'wards_assets',
      labelBn: 'ওয়ার্ড ও সম্পদ ব্যবস্থাপনা',
      groupBn: 'প্রশাসনিক ব্যবস্থাপনা',
      icon: MapPin,
      badgeCount: assets.length,
    },
    {
      id: 'services_docs',
      labelBn: 'সেবা তালিকা ও সরকারি নথি',
      groupBn: 'তথ্য ও কনফিগারেশন',
      icon: BookOpen,
      badgeCount: services.length,
    },
    {
      id: 'routing_sla',
      labelBn: 'রাউটিং নিয়ম ও এসএলএ',
      groupBn: 'তথ্য ও কনফিগারেশন',
      icon: Sliders,
      badgeCount: rules.length,
    },
    {
      id: 'audit_settings',
      labelBn: 'ইন্টিগ্রেশন, নিরীক্ষা লগ ও সেটিংস',
      groupBn: 'নিরাপত্তা ও নিরীক্ষা',
      icon: History,
      badgeCount: auditLogs.length,
    },
  ];

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRule(true);
    setBannerMsg(null);
    try {
      const res = await fetch('/api/platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADMIN_CONFIG',
          payload: {
            configType: 'RESPONSIBILITY_RULE',
            ruleCode,
            issueCategory,
            primaryDepartmentId: primaryDeptId,
            supportingDepartmentIds: supportingDeptId ? [supportingDeptId] : [],
            descriptionBn: ruleDescBn,
            actorName: 'ড. শফিকুল ইসলাম (সিস্টেম প্রশাসক)',
          },
        }),
      });
      const data = await res.json();
      if (data.snapshot && onSnapshotUpdated) {
        onSnapshotUpdated(data.snapshot);
      } else {
        onRefresh();
      }
      setBannerMsg(`নতুন রাউটিং নিয়ম (${ruleCode}) সফলভাবে সংরক্ষিত হয়েছে।`);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingRule(false);
    }
  };

  return (
    <InstitutionalAppShell
      activeRole={activeRole === 'citizen' ? 'admin' : activeRole}
      onRoleChange={(r) => onRoleChange && onRoleChange(r)}
      menuItems={adminMenus}
      activeMenuId={adminMenu}
      onSelectMenu={setAdminMenu}
      globalSearchValue={globalSearch}
      onGlobalSearchChange={setGlobalSearch}
      notifications={snapshot.notifications || []}
    >
      {bannerMsg && (
        <div className="mb-5 p-3.5 rounded-lg bg-[#15803D]/10 border border-[#15803D]/30 text-xs font-bold text-[#15803D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{bannerMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setBannerMsg(null)}
            className="underline"
          >
            বন্ধ করুন
          </button>
        </div>
      )}

      {/* 1. Admin Dashboard */}
      {adminMenu === 'dashboard' && (
        <div className="space-y-6">
          <PageHeader
            breadcrumbs={[
              'প্রশাসনিক ব্যবস্থাপনা কর্মক্ষেত্র',
              'প্রশাসনিক ড্যাশবোর্ড',
            ]}
            titleBn="কেন্দ্রীয় প্রশাসনিক ব্যবস্থাপনা ড্যাশবোর্ড"
            descriptionBn="সিটি কর্পোরেশনের দপ্তরসমূহ, ওয়ার্ড, সরকারি সম্পদ, রাউটিং নিয়ম, এসএলএ মানদণ্ড এবং সিস্টেম নিরীক্ষা লগের সামগ্রিক চিত্র।"
            actions={
              <button
                type="button"
                onClick={onRefresh}
                className="px-4 py-2 rounded-md bg-[#005b32] hover:bg-[#004425] text-white text-xs font-bold transition"
              >
                সিস্টেম তথ্য হালনাগাদ করুন
              </button>
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              labelBn="মোট সক্রিয় দপ্তর ও ওয়ার্ড"
              value={`${departments.length} দপ্তর / ${wards.length} ওয়ার্ড`}
              subtextBn="সরকারি অবকাঠামো নেটওয়ার্ক"
              accentColor="#005b32"
            />
            <StatCard
              labelBn="তালিকাভুক্ত সরকারি সম্পদ (Assets)"
              value={`${assets.length} টি`}
              subtextBn="সড়কবাতি পোল, ড্রেন, কন্টেইনার ও রাস্তা"
              accentColor="#087F8C"
            />
            <StatCard
              labelBn="রাউটিং ও এসএলএ নিয়মাবলি"
              value={`${rules.length + slaRules.length} টি`}
              subtextBn="বহু-বিভাগীয় স্বয়ংক্রিয় কর্মধারা"
              accentColor="#1D4ED8"
            />
            <StatCard
              labelBn="নিরীক্ষা লগ এন্ট্রি (Audit Logs)"
              value={`${auditLogs.length} টি`}
              subtextBn="অপরিবর্তনীয় সরকারি কার্যক্রম রেকর্ড"
              accentColor="#15803D"
            />
          </div>

          {/* Department Overview Table */}
          <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <h2 className="text-base font-bold text-[#1E293B]">
                দপ্তরভিত্তিক সারসংক্ষেপ ও কার্যভার
              </h2>
              <button
                type="button"
                onClick={() => setAdminMenu('departments')}
                className="text-xs font-bold text-[#087F8C] hover:underline"
              >
                দপ্তর ব্যবস্থাপনায় যান
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F1F5F9] border-b border-[#CBD5E1] text-xs font-bold text-[#1E293B]">
                    <th className="py-3 px-4">দপ্তর কোড</th>
                    <th className="py-3 px-4">দপ্তরের নাম</th>
                    <th className="py-3 px-4">প্রধান কর্মকর্তা</th>
                    <th className="py-3 px-4">চলমান ফাইল</th>
                    <th className="py-3 px-4">নিষ্পত্তিকৃত ফাইল</th>
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
                    return (
                      <tr key={`${deptCode}-${idx}`} className="hover:bg-[#F8FAFC]">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#005b32]">
                          {deptCode}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#1E293B]">
                          {d.nameBn}
                        </td>
                        <td className="py-3.5 px-4 text-[#1E293B]">
                          {d.headOfficerName || d.escalationContact || 'প্রধান নির্বাহী প্রকৌশলী'}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#1D4ED8]">
                          {active} টি
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#15803D]">
                          {solved} টি
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

      {/* 2. User Management & Role Management */}
      {adminMenu === 'users_roles' && (
        <div className="space-y-6">
          <PageHeader
            breadcrumbs={[
              'প্রশাসনিক ব্যবস্থাপনা কর্মক্ষেত্র',
              'ব্যবহারকারী ও ভূমিকা ব্যবস্থাপনা',
            ]}
            titleBn="ব্যবহারকারী ও প্রাতিষ্ঠানিক ভূমিকা ব্যবস্থাপনা (RBAC)"
            descriptionBn="সিস্টেমে নিবন্ধিত নাগরিক, হেল্পডেস্ক এজেন্ট, বিভাগীয় কর্মকর্তা, তদারকি কর্মকর্তা এবং প্রশাসকদের তালিকা ও অনুমতি।"
          />

          <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 bg-[#F1F5F9] border-b border-[#CBD5E1] font-bold text-xs text-[#1E293B]">
              নিবন্ধিত ব্যবহারকারী তালিকা ({users.length} জন)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#CBD5E1] text-xs font-bold text-[#1E293B]">
                    <th className="py-3 px-4">ব্যবহারকারী আইডি</th>
                    <th className="py-3 px-4">নাম</th>
                    <th className="py-3 px-4">ভূমিকা (Role)</th>
                    <th className="py-3 px-4">সংশ্লিষ্ট দপ্তর / ওয়ার্ড</th>
                    <th className="py-3 px-4">যোগাযোগ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-xs">
                  {users.map((u: any, idx: number) => (
                    <tr key={u.uid || idx} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4 font-mono font-bold text-[#005b32]">
                        {u.uid}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#1E293B]">
                        {u.nameBn || u.fullName}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#087F8C] font-bold">
                        {u.roleCode || u.role}
                      </td>
                      <td className="py-3 px-4 text-[#1E293B]">
                        {u.departmentId || u.wardId || 'সার্বজনীন'}
                      </td>
                      <td className="py-3 px-4 text-[#64748B]">
                        {u.email || u.phone}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 bg-[#F1F5F9] border-b border-[#CBD5E1] font-bold text-xs text-[#1E293B]">
              অনুমোদিত ভূমিকা ও অধিকারসমূহ ({roles.length} টি)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#CBD5E1] text-xs font-bold text-[#1E293B]">
                    <th className="py-3 px-4">ভূমিকা কোড</th>
                    <th className="py-3 px-4">ভূমিকার নাম</th>
                    <th className="py-3 px-4">কার্যপরিধি ও অধিকার</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-xs">
                  {roles.map((r: any, idx: number) => (
                    <tr key={`${r.roleCode || r.code || 'role'}-${idx}`} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4 font-mono font-bold text-[#005b32]">
                        {r.roleCode || r.code}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#1E293B]">
                        {r.nameBn || r.nameEn}
                      </td>
                      <td className="py-3 px-4 text-[#64748B]">
                        {r.descriptionBn || r.allowedActions || r.permissions}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Department Management */}
      {adminMenu === 'departments' && (
        <div className="space-y-6">
          <PageHeader
            breadcrumbs={[
              'প্রশাসনিক ব্যবস্থাপনা কর্মক্ষেত্র',
              'দপ্তর ব্যবস্থাপনা',
            ]}
            titleBn="সিটি কর্পোরেশন দপ্তর ব্যবস্থাপনা"
            descriptionBn="সেবা প্রদানকারী বিভাগসমূহের তালিকা, দায়িত্বপ্রাপ্ত প্রধান কর্মকর্তা এবং নির্ধারিত কাজের পরিধি।"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((d: any, idx: number) => {
              const deptCode = d.deptId || d.departmentId || `DEPT-${idx}`;
              return (
                <div
                  key={`${deptCode}-${idx}`}
                  className="bg-white border border-[#E2E8F0] rounded-lg p-5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#005b32]">
                      {deptCode}
                    </span>
                    <span className="text-xs font-bold text-[#15803D]">সক্রিয় দপ্তর</span>
                  </div>
                  <h3 className="text-base font-bold text-[#1E293B]">
                    {d.nameBn}
                  </h3>
                  <p className="text-xs text-[#64748B]">{d.nameEn}</p>
                  <div className="pt-2 border-t border-[#E2E8F0] text-xs text-[#1E293B]">
                    প্রধান কর্মকর্তা:{' '}
                    <span className="font-bold">
                      {d.headOfficerName || d.escalationContact || 'নির্বাহী প্রকৌশলী'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Ward Management & Asset Management */}
      {adminMenu === 'wards_assets' && (
        <div className="space-y-6">
          <PageHeader
            breadcrumbs={[
              'প্রশাসনিক ব্যবস্থাপনা কর্মক্ষেত্র',
              'ওয়ার্ড ও সম্পদ ব্যবস্থাপনা',
            ]}
            titleBn="ওয়ার্ড ও পৌর সম্পদ ব্যবস্থাপনা (Wards & Municipal Assets)"
            descriptionBn="ওয়ার্ড ১ থেকে ৫-এর সীমানা এবং জিও-ট্যাগকৃত সড়কবাতি, ড্রেন, বর্জ্য কন্টেইনার ও সড়ক সম্পদের তালিকা।"
          />

          <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 bg-[#F1F5F9] border-b border-[#CBD5E1] font-bold text-xs text-[#1E293B]">
              ওয়ার্ড তালিকা ({wards.length} টি)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#CBD5E1] text-xs font-bold text-[#1E293B]">
                    <th className="py-3 px-4">ওয়ার্ড আইডি</th>
                    <th className="py-3 px-4">ওয়ার্ড নাম</th>
                    <th className="py-3 px-4">জোন / অঞ্চল</th>
                    <th className="py-3 px-4">তদারকি কর্মকর্তা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-xs">
                  {wards.map((w: any, idx: number) => (
                    <tr key={`${w.wardId || w.id || 'ward'}-${idx}`} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4 font-mono font-bold text-[#005b32]">
                        {w.wardId}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#1E293B]">
                        ওয়ার্ড {w.wardNumber} — {w.nameBn}
                      </td>
                      <td className="py-3 px-4 text-[#64748B]">
                        {w.zoneName || 'মিরপুর জোন-২'}
                      </td>
                      <td className="py-3 px-4 text-[#1E293B]">
                        {w.councillorName || w.councillorOffice || 'আঞ্চলিক নির্বাহী কর্মকর্তা'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 bg-[#F1F5F9] border-b border-[#CBD5E1] font-bold text-xs text-[#1E293B]">
              সরকারি পৌর সম্পদ রেজিস্টার ({assets.length} টি)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#CBD5E1] text-xs font-bold text-[#1E293B]">
                    <th className="py-3 px-4">সম্পদ আইডি (Asset ID)</th>
                    <th className="py-3 px-4">সম্পদের নাম ও ধরন</th>
                    <th className="py-3 px-4">ওয়ার্ড ও অবস্থান</th>
                    <th className="py-3 px-4">রক্ষণাবেক্ষণকারী দপ্তর</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-xs">
                  {assets.map((a: any, idx: number) => {
                    const assetKey = a.assetId || a.assetCode || `AST-${idx}`;
                    return (
                      <tr key={`${assetKey}-${idx}`} className="hover:bg-[#F8FAFC]">
                        <td className="py-3 px-4 font-mono font-bold text-[#005b32]">
                          {assetKey}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#1E293B]">
                          {a.nameBn} ({a.assetType})
                        </td>
                        <td className="py-3 px-4 text-[#64748B]">
                          {a.wardId} • {a.roadName || a.landmark}
                        </td>
                        <td className="py-3 px-4 font-mono text-[#087F8C] font-bold">
                          {a.departmentId || a.maintenanceDepartmentId || a.ownerDepartmentId}
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

      {/* 5. Service Catalogue & Government Documents */}
      {adminMenu === 'services_docs' && (
        <div className="space-y-6">
          <PageHeader
            breadcrumbs={[
              'প্রশাসনিক ব্যবস্থাপনা কর্মক্ষেত্র',
              'সেবা তালিকা ও সরকারি নথি',
            ]}
            titleBn="নাগরিক সেবা তালিকা ও সরকারি নীতিমালা নথি"
            descriptionBn="নাগরিক পোর্টালে প্রদর্শিত সরকারি সেবাসমূহ এবং এআই সহায়কের (RAG) অনুমোদিত সরকারি নথিপত্র।"
          />

          <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 bg-[#F1F5F9] border-b border-[#CBD5E1] font-bold text-xs text-[#1E293B]">
              সরকারি সেবা তালিকা ({services.length} টি)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#CBD5E1] text-xs font-bold text-[#1E293B]">
                    <th className="py-3 px-4">সেবা কোড</th>
                    <th className="py-3 px-4">সেবার নাম</th>
                    <th className="py-3 px-4">দপ্তর</th>
                    <th className="py-3 px-4">প্রক্রিয়াকরণ সময়</th>
                    <th className="py-3 px-4">নির্ধারিত ফি</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-xs">
                  {services.map((s: any, idx: number) => {
                    const srvCode = s.serviceId || s.serviceCode || `SRV-${idx}`;
                    return (
                      <tr key={`${srvCode}-${idx}`} className="hover:bg-[#F8FAFC]">
                        <td className="py-3 px-4 font-mono font-bold text-[#005b32]">
                          {srvCode}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#1E293B]">
                          {s.titleBn}
                        </td>
                        <td className="py-3 px-4 font-mono text-[#087F8C]">
                          {s.departmentId}
                        </td>
                        <td className="py-3 px-4 text-[#1E293B]">
                          {s.processingTime || s.slaBn}
                        </td>
                        <td className="py-3 px-4 text-[#15803D] font-bold">
                          {s.fee || s.feeBn}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 bg-[#F1F5F9] border-b border-[#CBD5E1] font-bold text-xs text-[#1E293B]">
              অনুমোদিত সরকারি নথি ও সিটি চার্টার ({docs.length} টি)
            </div>
            <div className="divide-y divide-[#E2E8F0] text-xs">
              {docs.map((doc: any, idx: number) => (
                <div key={`${doc.docId || doc.docCode || 'doc'}-${idx}`} className="p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#005b32]">
                      {doc.docId || doc.docCode}
                    </span>
                    <span className="text-[#64748B]">{doc.sourceAuthority || doc.sourceAgencyBn}</span>
                  </div>
                  <div className="font-bold text-[#1E293B]">{doc.titleBn}</div>
                  <p className="text-[#64748B] leading-relaxed">
                    {doc.contentBn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. Routing Rules & SLA Configuration */}
      {adminMenu === 'routing_sla' && (
        <div className="space-y-6">
          <PageHeader
            breadcrumbs={[
              'প্রশাসনিক ব্যবস্থাপনা কর্মক্ষেত্র',
              'রাউটিং নিয়ম ও এসএলএ কনফিগারেশন',
            ]}
            titleBn="বহু-বিভাগীয় রাউটিং নিয়ম ও এসএলএ (SLA) কনফিগারেশন"
            descriptionBn="অভিযোগের ধরন অনুযায়ী প্রধান ও সহযোগী দপ্তর নির্ধারণের নিয়ম এবং সেবা নিষ্পত্তির সময়সীমা।"
          />

          {/* Create New Routing Rule Form */}
          <form
            onSubmit={handleCreateRule}
            className="bg-white border border-[#E2E8F0] rounded-lg p-5 space-y-4"
          >
            <h3 className="text-sm font-bold text-[#005b32] flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>নতুন রাউটিং নিয়ম যোগ করুন</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  নিয়ম কোড <span className="text-[#B91C1C]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ruleCode}
                  onChange={(e) => setRuleCode(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#CBD5E1] rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  সমস্যার ক্যাটাগরি <span className="text-[#B91C1C]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={issueCategory}
                  onChange={(e) => setIssueCategory(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#CBD5E1] rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  প্রধান দপ্তর <span className="text-[#B91C1C]">*</span>
                </label>
                <select
                  value={primaryDeptId}
                  onChange={(e) => setPrimaryDeptId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#CBD5E1] rounded text-xs font-bold"
                >
                  {departments.map((d: any, idx: number) => {
                    const deptCode = d.deptId || d.departmentId || `DEPT-${idx}`;
                    return (
                      <option key={`${deptCode}-${idx}`} value={deptCode}>
                        {d.nameBn}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  সহযোগী দপ্তর
                </label>
                <select
                  value={supportingDeptId}
                  onChange={(e) => setSupportingDeptId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#CBD5E1] rounded text-xs font-bold"
                >
                  <option value="">প্রযোজ্য নয়</option>
                  {departments.map((d: any, idx: number) => {
                    const deptCode = d.deptId || d.departmentId || `DEPT-${idx}`;
                    return (
                      <option key={`${deptCode}-sup-${idx}`} value={deptCode}>
                        {d.nameBn}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  রাউটিং ও কাজের ক্রমধারা বিবরণ (বাংলায়){' '}
                  <span className="text-[#B91C1C]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ruleDescBn}
                  onChange={(e) => setRuleDescBn(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#CBD5E1] rounded text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={savingRule}
                className="px-4 py-2 rounded bg-[#005b32] hover:bg-[#004425] text-white text-xs font-bold shrink-0"
              >
                {savingRule ? 'সংরক্ষণ হচ্ছে...' : 'নিয়ম সংরক্ষণ করুন'}
              </button>
            </div>
          </form>

          {/* Existing Routing Rules Table */}
          <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 bg-[#F1F5F9] border-b border-[#CBD5E1] font-bold text-xs text-[#1E293B]">
              সক্রিয় রাউটিং নিয়মাবলি ({rules.length} টি)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#CBD5E1] text-xs font-bold text-[#1E293B]">
                    <th className="py-3 px-4">নিয়ম কোড</th>
                    <th className="py-3 px-4">সমস্যার ধরন</th>
                    <th className="py-3 px-4">প্রধান ও সহযোগী দপ্তর</th>
                    <th className="py-3 px-4">বিবরণ ও ক্রমধারা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-xs">
                  {rules.map((r: any, idx: number) => (
                    <tr key={r.ruleCode || idx} className="hover:bg-[#F8FAFC]">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#005b32]">
                        {r.ruleCode}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#1E293B]">
                        {r.issueCategory}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#005b32]">
                          প্রধান: {r.primaryDepartmentId}
                        </div>
                        <div className="text-[#64748B]">
                          সহযোগী:{' '}
                          {Array.isArray(r.supportingDepartmentIds)
                            ? r.supportingDepartmentIds.join(', ')
                            : r.supportingDepartmentIds || 'নেই'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#1E293B]">
                        {r.descriptionBn || r.routingLogic}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. Integration Monitoring, Audit Logs & System Settings */}
      {adminMenu === 'audit_settings' && (
        <div className="space-y-6">
          <PageHeader
            breadcrumbs={[
              'প্রশাসনিক ব্যবস্থাপনা কর্মক্ষেত্র',
              'ইন্টিগ্রেশন, নিরীক্ষা লগ ও সেটিংস',
            ]}
            titleBn="নিরীক্ষা লগ (Audit Logs), ইন্টিগ্রেশন ও সিস্টেম সেটিংস"
            descriptionBn="সিস্টেমের প্রতিটি কার্যক্রমের অপরিবর্তনীয় নিরীক্ষা রেকর্ড এবং আন্তঃসিস্টেম ইন্টিগ্রেশন মনিটরিং।"
          />

          <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 bg-[#F1F5F9] border-b border-[#CBD5E1] flex items-center justify-between">
              <span className="font-bold text-xs text-[#1E293B]">
                সিস্টেম নিরীক্ষা লগ ({auditLogs.length} টি)
              </span>
              <span className="text-xs text-[#64748B]">
                ইন্টিগ্রেশন লগ: {integrationLogs.length} টি
              </span>
            </div>
            <div className="divide-y divide-[#E2E8F0] text-xs">
              {auditLogs.map((log: any, idx: number) => (
                <div
                  key={log.id || idx}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#F8FAFC]"
                >
                  <div>
                    <div className="font-bold text-[#1E293B]">
                      {log.summary || log.detailsBn || log.action}
                    </div>
                    <div className="text-[#64748B] mt-0.5">
                      অ্যাকশন: <span className="font-mono">{log.action}</span> •
                      সম্পাদনকারী:{' '}
                      <span className="font-medium">
                        {log.actorName || log.actorRole}
                      </span>
                    </div>
                  </div>
                  <div className="font-mono text-[#64748B] shrink-0">
                    {log.createdAt
                      ? new Date(log.createdAt).toLocaleString('bn-BD')
                      : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#005b32] flex items-center gap-1.5">
              <Settings className="w-4 h-4" />
              <span>সিস্টেম কনফিগারেশন ও নিরাপত্তা নীতিমালা</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded border border-[#E2E8F0] bg-[#F8FAFC]">
                <div className="font-bold text-[#1E293B]">
                  এআই আস্থার থ্রেশহোল্ড (Confidence Threshold)
                </div>
                <div className="text-[#64748B] mt-1">
                  ৮৫% এর নিচে হলে স্বয়ংক্রিয়ভাবে মানবিক পর্যালোচনায় (Human Review) প্রেরণ।
                </div>
              </div>
              <div className="p-3.5 rounded border border-[#E2E8F0] bg-[#F8FAFC]">
                <div className="font-bold text-[#1E293B]">
                  নাগরিক তথ্য গোপনীয়তা ও সম্মতি
                </div>
                <div className="text-[#64748B] mt-1">
                  অভিযোগ জমার পূর্বে নাগরিকের সম্মতি গ্রহণ এবং ব্যক্তিগত ফোন নম্বর মাস্কিং সক্রিয়।
                </div>
              </div>
              <div className="p-3.5 rounded border border-[#E2E8F0] bg-[#F8FAFC]">
                <div className="font-bold text-[#1E293B]">
                  ডাটাবেস ও নিরীক্ষা সুরক্ষা
                </div>
                <div className="text-[#64748B] mt-1">
                  PostgreSQL রিলেশনাল ডাটাবেস ও অপরিবর্তনীয় অডিট ট্রেইল সক্রিয়।
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </InstitutionalAppShell>
  );
}
