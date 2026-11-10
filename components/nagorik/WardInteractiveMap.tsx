'use client';

import React, { useState } from 'react';
import { MapPin, Compass, UserCheck } from 'lucide-react';

interface WardInteractiveMapProps {
  wards: any[];
  assets: any[];
  cases: any[];
  selectedWardId?: string;
  onSelectWard?: (wardId: string) => void;
  onSelectAsset?: (asset: any) => void;
  onSelectCase?: (caseNumber: string) => void;
  onPickCoordinates?: (lat: number, lng: number, wardId: string) => void;
  interactivePicker?: boolean;
}

const STATUS_BN: Record<string, string> = {
  Submitted: 'জমা হয়েছে',
  'Under review': 'যাচাই চলছে',
  Assigned: 'কর্মকর্তা নিযুক্ত',
  'In progress': 'সমাধানের কাজ চলছে',
  Blocked: 'পূর্ববর্তী কাজের অপেক্ষায়',
  'Resolution submitted': 'কাজ শেষ (যাচাইয়ের অপেক্ষায়)',
  Resolved: 'সমাধান সম্পন্ন',
  Reopened: 'পুনরায় চালু',
  Closed: 'চূড়ান্তভাবে নিষ্পত্তি',
};

export default function WardInteractiveMap({
  wards,
  assets,
  cases,
  selectedWardId = 'ALL',
  onSelectWard,
  onSelectAsset,
  onSelectCase,
  onPickCoordinates,
  interactivePicker = false,
}: WardInteractiveMapProps) {
  const [hoveredItem, setHoveredItem] = useState<any | null>(null);

  const projectPoint = (lat: number, lng: number) => {
    const minLat = 23.75;
    const maxLat = 23.89;
    const minLng = 90.34;
    const maxLng = 90.415;
    const x = ((lng - minLng) / (maxLng - minLng)) * 680 + 60;
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * 320 + 40;
    return {
      x: Math.max(45, Math.min(755, Math.round(x))),
      y: Math.max(35, Math.min(365, Math.round(y))),
    };
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!interactivePicker || !onPickCoordinates) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 800;
    const clickY = ((e.clientY - rect.top) / rect.height) * 400;

    const minLat = 23.75;
    const maxLat = 23.89;
    const minLng = 90.34;
    const maxLng = 90.415;

    const lng = Number((((clickX - 60) / 680) * (maxLng - minLng) + minLng).toFixed(4));
    const lat = Number(((1 - (clickY - 40) / 320) * (maxLat - minLat) + minLat).toFixed(4));

    let closestWard = 'WARD-03';
    let minDist = Infinity;
    for (const w of wards) {
      const d = Math.hypot(w.centerLat - lat, w.centerLng - lng);
      if (d < minDist) {
        minDist = d;
        closestWard = w.wardId;
      }
    }
    onPickCoordinates(lat, lng, closestWard);
  };

  const filteredCases =
    selectedWardId === 'ALL' ? cases : cases.filter((c) => c.wardId === selectedWardId);

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#0891B2]" />
          <h3 className="text-sm font-semibold text-[#004425]">
            এলাকা ও ওয়ার্ড ম্যাপ {interactivePicker ? '(ম্যাপে ক্লিক করে সমস্যার স্থান চিহ্নিত করুন)' : ''}
          </h3>
        </div>
        <span className="text-xs text-slate-500">
          মোট সক্রিয় অভিযোগ: {filteredCases.length}টি
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4">
        <div className="lg:col-span-3 relative bg-[#004425] overflow-hidden">
          <svg
            viewBox="0 0 800 400"
            onClick={handleSvgClick}
            className={`w-full h-[320px] sm:h-[360px] block select-none ${
              interactivePicker ? 'cursor-crosshair' : 'cursor-pointer'
            }`}
          >
            <defs>
              <pattern id="ward-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>

            <rect width="800" height="400" fill="#0F2537" />
            <rect width="800" height="400" fill="url(#ward-grid)" />

            <path
              d="M 40 340 Q 220 260 380 200 T 740 65"
              fill="none"
              stroke="rgba(8, 145, 178, 0.25)"
              strokeWidth="8"
            />
            <path
              d="M 180 35 L 340 200 L 370 370"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="3"
              strokeDasharray="6 4"
            />

            {wards.map((w) => {
              const center = projectPoint(w.centerLat, w.centerLng);
              const isSelected = selectedWardId === w.wardId;
              const wardCaseCount = cases.filter((c) => c.wardId === w.wardId).length;
              const cleanName = w.nameBn.replace('(পাইলট)', '').split('—')[1]?.trim() || w.nameBn;

              return (
                <g
                  key={w.wardId}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onSelectWard?.(w.wardId);
                  }}
                  className="cursor-pointer"
                >
                  <rect
                    x={center.x - 68}
                    y={center.y - 40}
                    width="136"
                    height="80"
                    rx="8"
                    fill={isSelected ? 'rgba(8, 145, 178, 0.28)' : 'rgba(23, 54, 93, 0.55)'}
                    stroke={isSelected ? '#22D3EE' : 'rgba(148, 163, 184, 0.35)'}
                    strokeWidth={isSelected ? '2' : '1.2'}
                  />
                  <text
                    x={center.x}
                    y={center.y - 18}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="11"
                    fontWeight="600"
                  >
                    ওয়ার্ড {w.wardNumber} ({wardCaseCount}টি)
                  </text>
                  <text
                    x={center.x}
                    y={center.y + 28}
                    textAnchor="middle"
                    fill="#CBD5E1"
                    fontSize="9.5"
                  >
                    {cleanName}
                  </text>
                </g>
              );
            })}

            {filteredCases.map((c, idx) => {
              const pt = projectPoint(c.latitude, c.longitude);
              const offsetX = (idx % 3 - 1) * 12;
              const offsetY = (idx % 2 === 0 ? -1 : 1) * 8;
              const fillColor =
                c.status === 'Closed' || c.status === 'Resolved'
                  ? '#16A34A'
                  : c.status === 'Reopened'
                  ? '#DC2626'
                  : '#D97706';

              return (
                <g
                  key={c.caseNumber}
                  transform={`translate(${pt.x + offsetX}, ${pt.y + offsetY})`}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    setHoveredItem(c);
                    onSelectCase?.(c.caseNumber);
                  }}
                >
                  <circle r="8" fill={fillColor} stroke="#FFFFFF" strokeWidth="2" />
                  <title>{`${c.caseNumber}: ${c.title}`}</title>
                </g>
              );
            })}
          </svg>

          <div className="px-4 py-2.5 bg-[#0B1C2C] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] inline-block" />
                প্রক্রিয়াধীন / সমাধানের কাজ চলছে
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] inline-block" />
                সমাধান সম্পন্ন
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] inline-block" />
                পুনরায় চালু / জরুরি মনোযোগ
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t lg:border-t-0 lg:border-l border-[#E2E8F0] flex flex-col justify-between">
          {hoveredItem ? (
            <div className="space-y-2.5 text-xs">
              <div className="font-mono font-bold text-[#0891B2]">
                অভিযোগ নং: {hoveredItem.caseNumber}
              </div>
              <p className="font-bold text-sm text-[#004425] leading-snug">
                {hoveredItem.title}
              </p>
              <p className="text-slate-600">স্থান: {hoveredItem.landmark}</p>
              <p className="text-slate-700">
                বর্তমান অবস্থা:{' '}
                <strong className="text-[#005b32]">
                  {STATUS_BN[hoveredItem.status] || hoveredItem.status}
                </strong>
              </p>
              {onSelectCase && (
                <button
                  type="button"
                  onClick={() => onSelectCase(hoveredItem.caseNumber)}
                  className="w-full mt-2 px-3 py-2 bg-[#005b32] text-white rounded-md font-semibold hover:bg-[#004425] transition-colors cursor-pointer"
                >
                  বিস্তারিত অগ্রগতি ও কর্মকর্তা দেখুন
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-semibold text-[#004425]">
                <Compass className="w-4 h-4 text-[#0891B2]" />
                <span>ওয়ার্ডভিত্তিক অভিযোগের তালিকা</span>
              </div>
              <p>
                ম্যাপে যেকোনো ওয়ার্ড বা গোল চিহ্নে ক্লিক করে সেই এলাকার সমস্যার অগ্রগতি এবং দায়িত্বপ্রাপ্ত কর্মকর্তার তথ্য দেখুন।
              </p>
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                {wards.map((w) => {
                  const cnt = cases.filter((c) => c.wardId === w.wardId).length;
                  const cleanName = w.nameBn.replace('(পাইলট)', '').split('—')[1]?.trim() || w.nameBn;
                  return (
                    <button
                      key={w.wardId}
                      type="button"
                      onClick={() => onSelectWard?.(w.wardId)}
                      className="w-full flex items-center justify-between py-1.5 px-2 rounded hover:bg-slate-100 text-left cursor-pointer"
                    >
                      <span className="truncate font-medium text-slate-800">
                        ওয়ার্ড {w.wardNumber} · {cleanName}
                      </span>
                      <span className="font-mono tabular-nums font-semibold text-[#005b32] shrink-0 ml-2">
                        {cnt}টি
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
