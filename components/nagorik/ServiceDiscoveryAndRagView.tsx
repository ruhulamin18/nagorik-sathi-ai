'use client';

import React, { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Search,
  ExternalLink,
  CheckSquare,
  LayoutGrid,
  Monitor,
  Building2,
  Trash2,
  Droplets,
  Lightbulb,
  Construction,
  TreePine,
  Waves,
  Clock,
  Coins,
  ShieldCheck,
  Share2,
  Printer,
  FileEdit,
  Send,
  Settings,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  ChevronUp,
  Plus,
  Minus,
  Headphones,
  FileText,
  FileDown,
  MapPin,
  PhoneCall,
  Landmark,
  Sparkles,
} from 'lucide-react';
import { PlatformSnapshot } from './types';
import {
  getDynamicImageSrc,
  useDynamicImageVersions,
} from './design-system';

interface ServiceDiscoveryAndRagViewProps {
  snapshot: PlatformSnapshot;
  onFileComplaint?: () => void;
  onOpenTrack?: () => void;
}

interface EnrichedServiceItem {
  serviceId: string;
  titleBn: string;
  shortTitleBn: string;
  titleEn: string;
  shortDescBn: string;
  descriptionBn: string;
  category: 'Waste' | 'Drainage' | 'Streetlight' | 'Road' | 'Other';
  slaBn: string;
  feeBn: string;
  serviceModeBn: 'অনলাইন' | 'সরাসরি';
  providerBn: string;
  providerAreaBn: string;
  requiredDocumentsBn: string[];
  officialUrl: string;
  lastVerifiedDate: string;
  iconType:
    | 'waste'
    | 'drainage'
    | 'streetlight'
    | 'road'
    | 'park'
    | 'building'
    | 'water'
    | 'other';
}

const DEFAULT_DIRECTORY_SERVICES: EnrichedServiceItem[] = [
  {
    serviceId: 'SRV-01',
    titleBn: 'গৃহস্থালি ও মহল্লা বর্জ্য অপসারণ সমন্বয় সেবা',
    shortTitleBn: 'গৃহস্থালি ও মহল্লা বর্জ্য অপসারণ সমন্বয় সেবা',
    titleEn: 'Neighborhood Solid Waste Removal Service',
    shortDescBn: 'মহল্লা, গলি ও আবাসিক বর্জ্য দ্রুত অপসারণ।',
    descriptionBn:
      'মহল্লা, গলি বা সেকেন্ডারি ট্রান্সফার স্টেশনের (STS) উপচে পড়া বর্জ্য দ্রুত অপসারণের জন্য সিটি কর্পোরেশন সেবা।',
    category: 'Waste',
    slaBn: '১২ – ২৪ ঘণ্টা',
    feeBn: 'বিনামূল্যে',
    serviceModeBn: 'অনলাইন',
    providerBn: 'ঢাকা উত্তর সিটি কর্পোরেশন',
    providerAreaBn: 'ঢাকা উত্তর সিটি কর্পোরেশন',
    requiredDocumentsBn: [
      'ওয়ার্ড বা রাস্তার নাম',
      'সমস্যার ছবি (ঐচ্ছিক)',
      'মোবাইল নম্বর (ট্র্যাকিংয়ের জন্য)',
    ],
    officialUrl: 'https://bangladesh.gov.bd/',
    lastVerifiedDate: '২০২৬-১০-২০',
    iconType: 'waste',
  },
  {
    serviceId: 'SRV-02',
    titleBn: 'স্টর্ম ড্রেনেজ প্রতিবন্ধকতা ও জলাবদ্ধতা নিরসন',
    shortTitleBn: 'স্টর্ম ড্রেনেজ প্রতিবন্ধকতা ও জলাবদ্ধতা নিরসন',
    titleEn: 'Storm Drainage & Waterlogging Clearance',
    shortDescBn: 'বৃষ্টির পানি জমে জলাবদ্ধতা দূরীকরণ সেবা।',
    descriptionBn:
      'বৃষ্টি বা আবর্জনার কারণে ড্রেন বন্ধ হয়ে রাস্তায় পানি জমলে জরুরি সাকার মেশিন ও পরিচ্ছন্নতাকর্মী প্রেরণের মাধ্যমে জলাবদ্ধতা নিরসন সেবা।',
    category: 'Drainage',
    slaBn: '২৪ – ৪৮ ঘণ্টা',
    feeBn: 'বিনামূল্যে',
    serviceModeBn: 'অনলাইন',
    providerBn: 'ঢাকা উত্তর সিটি কর্পোরেশন',
    providerAreaBn: 'ঢাকা উত্তর সিটি কর্পোরেশন',
    requiredDocumentsBn: [
      'ওয়ার্ড বা রাস্তার নাম ও ল্যান্ডমার্ক',
      'জলাবদ্ধ স্থানের ছবি (ঐচ্ছিক)',
      'মোবাইল নম্বর (ট্র্যাকিংয়ের জন্য)',
    ],
    officialUrl: 'https://www.mygov.bd/',
    lastVerifiedDate: '২০২৬-১০-২২',
    iconType: 'drainage',
  },
  {
    serviceId: 'SRV-03',
    titleBn: 'সড়কবাতি (LED Streetlight) মেরামত',
    shortTitleBn: 'সড়কবাতি (LED Streetlight) মেরামত',
    titleEn: 'LED Streetlight Repair & Maintenance Service',
    shortDescBn: 'নষ্ট সড়কবাতি মেরামত ও প্রতিস্থাপন সেবা।',
    descriptionBn:
      'গলি বা প্রধান সড়কের এলইডি বাতি নিভে গেলে, মিটমিট করলে বা সুইচিং বক্স নষ্ট হলে দ্রুত লাইনম্যান পাঠিয়ে মেরামত ও প্রতিস্থাপন সেবা।',
    category: 'Streetlight',
    slaBn: '২৪ – ৩৬ ঘণ্টা',
    feeBn: 'বিনামূল্যে',
    serviceModeBn: 'অনলাইন',
    providerBn: 'ঢাকা উত্তর সিটি কর্পোরেশন',
    providerAreaBn: 'ঢাকা উত্তর সিটি কর্পোরেশন',
    requiredDocumentsBn: [
      'বৈদ্যুতিক পোলের নম্বর বা রাস্তার নাম',
      'সমস্যার ছবি (ঐচ্ছিক)',
      'মোবাইল নম্বর (ট্র্যাকিংয়ের জন্য)',
    ],
    officialUrl: 'https://www.grs.gov.bd/',
    lastVerifiedDate: '২০২৬-১০-১৮',
    iconType: 'streetlight',
  },
  {
    serviceId: 'SRV-04',
    titleBn: 'ক্ষতিগ্রস্ত সড়ক কার্পেটিং ও গর্ত (Pothole) সংস্কার',
    shortTitleBn: 'ক্ষতিগ্রস্ত সড়ক কার্পেটিং ও গর্ত (Pothole) সংস্কার',
    titleEn: 'Road Pothole & Surface Patchwork Service',
    shortDescBn: 'রাস্তার গর্ত, পিচ উঠে যাওয়া ও ক্ষতিগ্রস্ত স্থান মেরামত।',
    descriptionBn:
      'রাস্তার মাঝখানে গর্ত, পিচ উঠে যাওয়া বা পানির কারণে ভেঙে যাওয়া অংশের জরুরি বিটুমিন কার্পেটিং ও প্যাচওয়ার্ক সংস্কার সেবা।',
    category: 'Road',
    slaBn: '৪৮ – ৭২ ঘণ্টা',
    feeBn: 'বিনামূল্যে',
    serviceModeBn: 'সরাসরি',
    providerBn: 'ঢাকা উত্তর সিটি কর্পোরেশন',
    providerAreaBn: 'ঢাকা উত্তর সিটি কর্পোরেশন',
    requiredDocumentsBn: [
      'ওয়ার্ড ও রাস্তার সুনির্দিষ্ট নাম',
      'ক্ষতিগ্রস্ত রাস্তার ছবি',
      'মোবাইল নম্বর (ট্র্যাকিংয়ের জন্য)',
    ],
    officialUrl: 'https://bangladesh.gov.bd/',
    lastVerifiedDate: '২০২৬-১০-২৫',
    iconType: 'road',
  },
  {
    serviceId: 'SRV-05',
    titleBn: 'পার্ক ও খেলার মাঠ পরিচ্ছন্নতা',
    shortTitleBn: 'পার্ক ও খেলার মাঠ পরিচ্ছন্নতা',
    titleEn: 'Public Parks & Playground Cleanliness Service',
    shortDescBn: 'পার্ক ও খেলার মাঠের পরিচ্ছন্নতা ও রক্ষণাবেক্ষণ।',
    descriptionBn:
      'সিটি কর্পোরেশনের আওতাধীন পার্ক, উদ্যান ও খেলার মাঠের আবর্জনা পরিষ্কার, ঘাস ছাঁটাই এবং হাঁটার পথ পরিচ্ছন্ন রাখার নাগরিক সেবা।',
    category: 'Waste',
    slaBn: '১২ – ২৪ ঘণ্টা',
    feeBn: 'বিনামূল্যে',
    serviceModeBn: 'অনলাইন',
    providerBn: 'ঢাকা উত্তর সিটি কর্পোরেশন',
    providerAreaBn: 'ঢাকা উত্তর সিটি কর্পোরেশন',
    requiredDocumentsBn: [
      'পার্ক বা খেলার মাঠের নাম ও ওয়ার্ড',
      'সমস্যার ছবি (ঐচ্ছিক)',
      'মোবাইল নম্বর (ট্র্যাকিংয়ের জন্য)',
    ],
    officialUrl: 'https://www.grs.gov.bd/',
    lastVerifiedDate: '২০২৬-১০-২৪',
    iconType: 'park',
  },
  {
    serviceId: 'SRV-06',
    titleBn: 'নগর উন্নয়ন ও অবকাঠামো রক্ষণাবেক্ষণ',
    shortTitleBn: 'নগর উন্নয়ন ও অবকাঠামো রক্ষণাবেক্ষণ',
    titleEn: 'Urban Infrastructure & Footpath Maintenance Service',
    shortDescBn: 'বিভিন্ন নাগরিক অবকাঠামোর রক্ষণাবেক্ষণ সেবা।',
    descriptionBn:
      'ভাঙা ফুটপাত টাইলস, স্ল্যাব, পথচারী পারাপার, হুইলচেয়ার র‍্যাম্প এবং পৌর অবকাঠামো সংস্কার ও রক্ষণাবেক্ষণের জন্য প্রকৌশল সেবা।',
    category: 'Road',
    slaBn: '৩ – ৫ কর্মদিবস',
    feeBn: 'বিনামূল্যে',
    serviceModeBn: 'সরাসরি',
    providerBn: 'ঢাকা উত্তর সিটি কর্পোরেশন',
    providerAreaBn: 'ঢাকা উত্তর সিটি কর্পোরেশন',
    requiredDocumentsBn: [
      'ওয়ার্ড বা রাস্তার নাম ও অবস্থান',
      'অবকাঠামোর বর্তমান অবস্থার ছবি',
      'মোবাইল নম্বর (ট্র্যাকিংয়ের জন্য)',
    ],
    officialUrl: 'https://www.mygov.bd/',
    lastVerifiedDate: '২০২৬-১০-১৫',
    iconType: 'building',
  },
  {
    serviceId: 'SRV-07',
    titleBn: 'পানি ও স্যানিটেশন সম্পর্কিত সেবা',
    shortTitleBn: 'পানি ও স্যানিটেশন সম্পর্কিত সেবা',
    titleEn: 'Water Supply & Municipal Sanitation Coordination',
    shortDescBn: 'পানি সরবরাহ, সংযোগ বা স্যানিটেশন সমস্যা।',
    descriptionBn:
      'পৌর এলাকায় স্যানিটেশন লাইন ওভারফ্লো, খোলা ম্যানহোল ঢাকনা প্রতিস্থাপন এবং পানি নিষ্কাশন সংক্রান্ত সমন্বিত নাগরিক সেবা।',
    category: 'Drainage',
    slaBn: '২৪ – ৪৮ ঘণ্টা',
    feeBn: 'বিনামূল্যে',
    serviceModeBn: 'অনলাইন',
    providerBn: 'ঢাকা উত্তর সিটি কর্পোরেশন',
    providerAreaBn: 'ঢাকা উত্তর সিটি কর্পোরেশন',
    requiredDocumentsBn: [
      'ওয়ার্ড বা রাস্তার নাম',
      'সমস্যার ছবি (ঐচ্ছিক)',
      'মোবাইল নম্বর (ট্র্যাকিংয়ের জন্য)',
    ],
    officialUrl: 'https://bangladesh.gov.bd/',
    lastVerifiedDate: '২০২৬-১০-১৯',
    iconType: 'water',
  },
  {
    serviceId: 'SRV-08',
    titleBn: 'অন্যান্য নাগরিক সেবা',
    shortTitleBn: 'অন্যান্য নাগরিক সেবা',
    titleEn: 'General Citizen Assistance & Ward Desk Services',
    shortDescBn: 'উপরিউক্তের বাইরের অন্যান্য নাগরিক সেবা।',
    descriptionBn:
      'মশক নিধন (ফগিং), বেওয়ারিশ পশু অপসারণ, অবৈধ ফুটপাত দখলমুক্তকরণ এবং ওয়ার্ড সহায়ক ডেস্কের মাধ্যমে সরাসরি নাগরিক অভিযোগ সেবা।',
    category: 'Other',
    slaBn: '১ – ৩ কর্মদিবস',
    feeBn: 'বিনামূল্যে',
    serviceModeBn: 'অনলাইন',
    providerBn: 'ঢাকা উত্তর সিটি কর্পোরেশন',
    providerAreaBn: 'ঢাকা উত্তর সিটি কর্পোরেশন',
    requiredDocumentsBn: [
      'ওয়ার্ড বা রাস্তার নাম',
      'সমস্যার সংক্ষিপ্ত বিবরণ ও ছবি (ঐচ্ছিক)',
      'মোবাইল নম্বর (ট্র্যাকিংয়ের জন্য)',
    ],
    officialUrl: 'https://bangladesh.gov.bd/',
    lastVerifiedDate: '২০২৬-১০-২৮',
    iconType: 'other',
  },
];

const FAQ_ITEMS = [
  {
    id: 'faq-1',
    questionBn: 'বর্জ্য অপসারণের জন্য কীভাবে অভিযোগ করব?',
    answerBn:
      "আপনি 'নতুন অভিযোগ' বাটন থেকে অনলাইন ফর্ম পূরণ করে অথবা ১৬১০৬ নম্বরে কল করে অভিযোগ জানাতে পারেন।",
  },
  {
    id: 'faq-2',
    questionBn: 'অভিযোগের অগ্রগতি কীভাবে জানব?',
    answerBn:
      "অভিযোগ দাখিলের পর প্রাপ্ত ট্র্যাকিং নম্বর (যেমন: NS-2026-1001) দিয়ে 'অভিযোগ ট্র্যাকিং' পাতায় গিয়ে বর্তমান অবস্থা, দায়িত্বপ্রাপ্ত বিভাগ এবং সমাধানের ছবি যাচাই করতে পারবেন।",
  },
  {
    id: 'faq-3',
    questionBn: 'সেবা পেতে কত সময় লাগে?',
    answerBn:
      'সেবার ধরনের ওপর ভিত্তি করে বর্জ্য অপসারণে ১২–২৪ ঘণ্টা, সড়কবাতি মেরামতে ২৪–৩৬ ঘণ্টা, ড্রেনেজ সংস্কারে ২৪–৪৮ ঘণ্টা এবং রাস্তা সংস্কারে ৪৮–৭২ ঘণ্টা সময় নির্ধারিত রয়েছে।',
  },
  {
    id: 'faq-4',
    questionBn: 'কোন কোন সমস্যা এই সেবার আওতাভুক্ত?',
    answerBn:
      'গৃহস্থালি ও মহল্লা বর্জ্য অপসারণ, স্টর্ম ড্রেনেজ ও জলাবদ্ধতা নিরসন, এলইডি সড়কবাতি মেরামত, রাস্তার গর্ত সংস্কার, পার্ক পরিচ্ছন্নতা এবং পানি ও স্যানিটেশন সংক্রান্ত নাগরিক সমস্যা এই সেবার আওতাভুক্ত।',
  },
  {
    id: 'faq-5',
    questionBn: 'সেবা কি বিনামূল্যে?',
    answerBn:
      'হ্যাঁ, নাগরিক সাথী এআই প্ল্যাটফর্মের মাধ্যমে অভিযোগ দাখিল, ট্র্যাকিং এবং সিটি কর্পোরেশনের নির্ধারিত পৌর সেবাসমূহ সম্পূর্ণ বিনামূল্যে প্রদান করা হয়।',
  },
];

function toBengaliNumber(n: number): string {
  const digits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n)
    .split('')
    .map((ch) => (digits[Number(ch)] !== undefined ? digits[Number(ch)] : ch))
    .join('');
}

function renderServiceIcon(
  iconType: EnrichedServiceItem['iconType'],
  sizeClass = 'w-5 h-5'
) {
  switch (iconType) {
    case 'waste':
      return <Trash2 className={sizeClass} />;
    case 'drainage':
      return <Droplets className={sizeClass} />;
    case 'streetlight':
      return <Lightbulb className={sizeClass} />;
    case 'road':
      return <Construction className={sizeClass} />;
    case 'park':
      return <TreePine className={sizeClass} />;
    case 'building':
      return <Building2 className={sizeClass} />;
    case 'water':
      return <Waves className={sizeClass} />;
    default:
      return <LayoutGrid className={sizeClass} />;
  }
}

function getIconBoxStyle(
  iconType: EnrichedServiceItem['iconType'],
  isSelected: boolean
) {
  if (isSelected) {
    return 'bg-[#DDF3E5] text-[#005b32] border-[#A7DFB9]';
  }
  switch (iconType) {
    case 'waste':
      return 'bg-[#EAF7EF] text-[#005b32] border-[#CBEAD6]';
    case 'drainage':
      return 'bg-[#EBF5FF] text-[#0284C7] border-[#BAE0FD]';
    case 'streetlight':
      return 'bg-[#FEF9C3] text-[#D97706] border-[#FDE047]';
    case 'road':
      return 'bg-[#EAF7EF] text-[#005b32] border-[#CBEAD6]';
    case 'park':
      return 'bg-[#ECFDF5] text-[#15803D] border-[#A7F3D0]';
    case 'building':
      return 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]';
    case 'water':
      return 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]';
    default:
      return 'bg-[#EFF6FF] text-[#0284C7] border-[#BFDBFE]';
  }
}

export default function ServiceDiscoveryAndRagView({
  snapshot,
  onFileComplaint,
  onOpenTrack,
}: ServiceDiscoveryAndRagViewProps) {
  const imageVersions = useDynamicImageVersions();

  // Merge backend snapshot.services urls/dates with our 8 canonical service cards
  const servicesList: EnrichedServiceItem[] = useMemo(() => {
    const dbServices = snapshot?.services || [];
    return DEFAULT_DIRECTORY_SERVICES.map((item, index) => {
      const dbMatch =
        dbServices.find((s: any) => s.serviceId === item.serviceId) ||
        dbServices[index];
      if (!dbMatch) return item;
      return {
        ...item,
        officialUrl: dbMatch.officialUrl || item.officialUrl,
        lastVerifiedDate: dbMatch.lastVerifiedDate || item.lastVerifiedDate,
      };
    });
  }, [snapshot?.services]);

  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceCat, setServiceCat] = useState<string>('ALL');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('SRV-01');
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [infoToast, setInfoToast] = useState<string | null>(null);

  const faqSectionRef = useRef<HTMLDivElement | null>(null);
  const processSectionRef = useRef<HTMLDivElement | null>(null);
  const requiredDocsRef = useRef<HTMLDivElement | null>(null);
  const detailsPanelRef = useRef<HTMLDivElement | null>(null);

  const filteredServices = useMemo(() => {
    return servicesList.filter((srv) => {
      const q = serviceSearch.trim().toLowerCase();
      const matchSearch =
        !q ||
        srv.titleBn.toLowerCase().includes(q) ||
        srv.shortDescBn.toLowerCase().includes(q) ||
        srv.descriptionBn.toLowerCase().includes(q) ||
        srv.titleEn.toLowerCase().includes(q);
      const matchCat = serviceCat === 'ALL' || srv.category === serviceCat;
      return matchSearch && matchCat;
    });
  }, [servicesList, serviceSearch, serviceCat]);

  const selectedService = useMemo(() => {
    return (
      servicesList.find((s) => s.serviceId === selectedServiceId) ||
      filteredServices[0] ||
      servicesList[0]
    );
  }, [servicesList, selectedServiceId, filteredServices]);

  const handleShareService = async () => {
    if (!selectedService) return;
    const shareText = `${selectedService.titleBn} — ${selectedService.descriptionBn}`;
    try {
      if (navigator.clipboard && window.location) {
        await navigator.clipboard.writeText(
          `${shareText} (${window.location.href})`
        );
      }
      setShareFeedback('লিংক কপি হয়েছে');
      setTimeout(() => setShareFeedback(null), 2500);
    } catch {
      setShareFeedback('শেয়ার প্রস্তুত');
      setTimeout(() => setShareFeedback(null), 2500);
    }
  };

  const handlePrintService = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-7 pb-4">
      {/* ================================================================== */}
      {/* 1 & 2. SERVICE DIRECTORY HERO SECTION & STATISTICS                 */}
      {/* ================================================================== */}
      <section className="relative rounded-2xl border border-[#CBEAD6] bg-gradient-to-r from-[#ECF9F1] via-[#F4FCF7] to-[#E5F6EC] overflow-hidden shadow-2xs">
        {/* Right-side Bangladesh City & Monument Illustration */}
        <div className="hidden md:block absolute inset-y-0 right-0 w-[48%] lg:w-[45%] pointer-events-none select-none overflow-hidden">
          <Image
            src={getDynamicImageSrc('hero_illustration.jpg', imageVersions)}
            alt="সিটি কর্পোরেশন সেবা নির্দেশিকা ও সেবা তালিকা ইলাস্ট্রেশন"
            fill
            sizes="(max-width: 1200px) 45vw, 600px"
            className="object-cover object-right opacity-95"
            style={{
              WebkitMaskImage:
                'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.22) 16%, rgba(0,0,0,0.75) 36%, rgba(0,0,0,1) 56%)',
              maskImage:
                'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.22) 16%, rgba(0,0,0,0.75) 36%, rgba(0,0,0,1) 56%)',
            }}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-y-0 left-0 w-36 bg-gradient-to-r from-[#F4FCF7] via-[#F4FCF7]/85 to-transparent" />
        </div>

        {/* Decorative bottom subtle wave */}
        <div className="relative z-10 px-6 py-7 sm:px-9 sm:py-8 lg:py-9 max-w-3xl">
          <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-[#172033] tracking-tight leading-snug">
            সিটি কর্পোরেশন সেবা নির্দেশিকা ও সেবা তালিকা
          </h1>
          <p className="text-sm sm:text-[15px] text-[#475569] mt-2 leading-relaxed max-w-2xl">
            নাগরিক সেবার বিস্তারিত তথ্য, প্রয়োজনীয় কাগজপত্র, সময়সীমা ও আবেদন পদ্ধতি এক জায়গায় দেখুন।
          </p>

          {/* Three Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 max-w-xl">
            {/* Stat 1: মোট সেবা */}
            <div className="bg-white/95 backdrop-blur-2xs border border-[#DCEEE3] rounded-xl px-4 py-3.5 flex items-center gap-3.5 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-[#EAF7EF] border border-[#CBEAD6] text-[#005b32] flex items-center justify-center shrink-0">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-medium text-[#64748B]">মোট সেবা</div>
                <div className="text-lg font-extrabold text-[#172033] leading-tight mt-0.5">
                  ৮টি
                </div>
              </div>
            </div>

            {/* Stat 2: অনলাইন সেবা */}
            <div className="bg-white/95 backdrop-blur-2xs border border-[#DCEEE3] rounded-xl px-4 py-3.5 flex items-center gap-3.5 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-[#EAF7EF] border border-[#CBEAD6] text-[#005b32] flex items-center justify-center shrink-0">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-medium text-[#64748B]">
                  অনলাইন সেবা
                </div>
                <div className="text-lg font-extrabold text-[#172033] leading-tight mt-0.5">
                  ৬টি
                </div>
              </div>
            </div>

            {/* Stat 3: সরাসরি সেবা */}
            <div className="bg-white/95 backdrop-blur-2xs border border-[#DCEEE3] rounded-xl px-4 py-3.5 flex items-center gap-3.5 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-[#EAF7EF] border border-[#CBEAD6] text-[#005b32] flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-medium text-[#64748B]">
                  সরাসরি সেবা
                </div>
                <div className="text-lg font-extrabold text-[#172033] leading-tight mt-0.5">
                  ২টি
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 3, 4, 5, 6, 7, 8, 9. TWO-COLUMN MAIN SERVICE DIRECTORY LAYOUT      */}
      {/* Left Sidebar (~40% / 5 cols) + Right Details Panel (~60% / 7 cols) */}
      {/* ================================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: CITIZEN SERVICE LIST */}
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-[17px] font-extrabold text-[#172033]">
              নাগরিক সেবাসমূহের তালিকা ({toBengaliNumber(filteredServices.length)}টি)
            </h2>
          </div>

          {/* Search Input */}
          <div className="relative mt-3.5">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
              placeholder="সেবার নাম খুঁজুন..."
              className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#172033] placeholder:text-[#64748B] focus:outline-none focus:bg-white focus:border-[#005b32] transition"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mt-3.5">
            {[
              { id: 'ALL', label: 'সকল সেবা' },
              { id: 'Waste', label: 'বর্জ্য' },
              { id: 'Drainage', label: 'ড্রেনেজ' },
              { id: 'Streetlight', label: 'সড়কবাতি' },
              { id: 'Road', label: 'রাস্তা' },
            ].map((cat) => {
              const active = serviceCat === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setServiceCat(cat.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
                    active
                      ? 'bg-[#005b32] text-white shadow-2xs'
                      : 'bg-[#F1F5F9] hover:bg-[#E2E8F0]/70 text-[#475569] border border-[#E2E8F0]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Service Cards List */}
          <div className="space-y-2.5 mt-4">
            {filteredServices.length === 0 ? (
              <div className="py-10 px-4 text-center border border-dashed border-[#CBD5E1] rounded-xl text-xs text-[#64748B]">
                আপনার অনুসন্ধানের সাথে মিলে এমন কোনো সেবা পাওয়া যায়নি।
              </div>
            ) : (
              filteredServices.map((srv) => {
                const isSelected =
                  selectedService?.serviceId === srv.serviceId;
                return (
                  <button
                    key={srv.serviceId}
                    type="button"
                    onClick={() => {
                      setSelectedServiceId(srv.serviceId);
                      if (
                        typeof window !== 'undefined' &&
                        window.innerWidth < 1024 &&
                        detailsPanelRef.current
                      ) {
                        detailsPanelRef.current.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        });
                      }
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-[#EAF7EF] border-[#7BC89B] shadow-2xs ring-1 ring-[#005b32]/15'
                        : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Service Icon */}
                      <div
                        className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${getIconBoxStyle(
                          srv.iconType,
                          isSelected
                        )}`}
                      >
                        {renderServiceIcon(srv.iconType, 'w-5 h-5')}
                      </div>

                      {/* Service Text Content */}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs sm:text-sm font-extrabold text-[#172033] leading-snug truncate">
                          {srv.shortTitleBn}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-[#64748B] mt-0.5 truncate">
                          {srv.shortDescBn}
                        </p>
                        <div className="flex items-center justify-between gap-2 mt-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#475569]">
                            <Clock className="w-3.5 h-3.5 text-[#005b32]" />
                            <span>{srv.slaBn}</span>
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              srv.serviceModeBn === 'অনলাইন'
                                ? 'bg-[#DDF3E5] text-[#005b32]'
                                : 'bg-[#FEF3C7] text-[#B45309]'
                            }`}
                          >
                            {srv.serviceModeBn}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Selection Indicator Chevron */}
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isSelected
                          ? 'text-[#005b32] translate-x-0.5'
                          : 'text-[#94A3B8]'
                      }`}
                    />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: SELECTED SERVICE DETAILS */}
        <div
          ref={detailsPanelRef}
          className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 shadow-2xs space-y-6"
        >
          {selectedService && (
            <>
              {/* Header with Icon, Badge, Title, Subtitle, and Share/Print Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-[#E2E8F0]">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#EAF7EF] border border-[#BFE5CD] text-[#005b32] flex items-center justify-center shrink-0">
                    {renderServiceIcon(selectedService.iconType, 'w-7 h-7')}
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded bg-[#EAF7EF] border border-[#CBEAD6] text-[#005b32] text-[11px] font-bold mb-1.5">
                      নাগরিক সেবা
                    </span>
                    <h2 className="text-lg sm:text-xl lg:text-[22px] font-extrabold text-[#172033] leading-snug">
                      {selectedService.titleBn}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-0.5">
                      {selectedService.titleEn}
                    </p>
                  </div>
                </div>

                {/* Share & Print Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-start">
                  <button
                    type="button"
                    onClick={handleShareService}
                    className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#172033] text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#475569]" />
                    <span>{shareFeedback || 'শেয়ার'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintService}
                    className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#172033] text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#475569]" />
                    <span>প্রিন্ট</span>
                  </button>
                </div>
              </div>

              {/* Service Description */}
              <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
                {selectedService.descriptionBn}
              </p>

              {/* 4 Compact Information Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {/* 1. সম্ভাব্য সময় */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF7EF] text-[#005b32] flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-[#64748B] font-medium">
                      সম্ভাব্য সময়
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-[#172033] mt-0.5">
                      {selectedService.slaBn}
                    </div>
                  </div>
                </div>

                {/* 2. সেবা ফি */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF7EF] text-[#005b32] flex items-center justify-center shrink-0 mt-0.5">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-[#64748B] font-medium">
                      সেবা ফি
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-[#172033] mt-0.5">
                      {selectedService.feeBn}
                    </div>
                  </div>
                </div>

                {/* 3. সেবার ধরন */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF7EF] text-[#005b32] flex items-center justify-center shrink-0 mt-0.5">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-[#64748B] font-medium">
                      সেবার ধরন
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-[#172033] mt-0.5">
                      {selectedService.serviceModeBn}
                    </div>
                  </div>
                </div>

                {/* 4. সেবা প্রদানকারী */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF7EF] text-[#005b32] flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-[#64748B] font-medium">
                      সেবা প্রদানকারী
                    </div>
                    <div className="text-xs sm:text-[13px] font-extrabold text-[#172033] leading-snug mt-0.5">
                      {selectedService.providerBn}
                    </div>
                  </div>
                </div>
              </div>

              {/* 7. REQUIRED INFORMATION CARD (With Waste Management Illustration on Right) */}
              <div
                ref={requiredDocsRef}
                className="relative rounded-xl border border-[#CBEAD6] bg-gradient-to-r from-[#ECF9F1] via-[#F2FBF5] to-[#E6F6EC] p-5 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-7 space-y-3 relative z-10">
                    <div className="flex items-center gap-2 text-sm sm:text-[15px] font-extrabold text-[#172033]">
                      <CheckSquare className="w-4 h-4 text-[#005b32] shrink-0" />
                      <span>আবেদনের আগে যেসব তথ্য সাথে রাখবেন:</span>
                    </div>
                    <ul className="space-y-2 pl-2">
                      {selectedService.requiredDocumentsBn.map((docItem, idx) => (
                        <li
                          key={`${selectedService.serviceId}-doc-${idx}`}
                          className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[#1E293B]"
                        >
                          <span className="w-2 h-2 rounded-full bg-[#005b32] shrink-0" />
                          <span>{docItem}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right Side Waste Management Illustration */}
                  <div className="md:col-span-5 relative h-28 sm:h-32 rounded-lg overflow-hidden">
                    <Image
                      src={getDynamicImageSrc(
                        'waste_service_illustration.jpg',
                        imageVersions
                      )}
                      alt="নাগরিক সেবা ও বর্জ্য ব্যবস্থাপনা ইলাস্ট্রেশন"
                      fill
                      sizes="(max-width: 768px) 100vw, 280px"
                      className="object-cover object-center rounded-lg"
                      style={{
                        WebkitMaskImage:
                          'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.65) 18%, rgba(0,0,0,1) 35%)',
                        maskImage:
                          'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.65) 18%, rgba(0,0,0,1) 35%)',
                      }}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>

              {/* 8. APPLICATION PROCESS (4-Step Horizontal Process) */}
              <div ref={processSectionRef} className="space-y-3.5 pt-1">
                <h3 className="text-sm sm:text-base font-extrabold text-[#172033] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#005b32]" />
                  <span>কীভাবে আবেদন করবেন?</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
                  {[
                    {
                      step: 1,
                      titleBn: 'অনলাইনে ফর্ম পূরণ করুন',
                      subBn: 'সহজ বাংলায় তথ্য দিন',
                      icon: FileEdit,
                    },
                    {
                      step: 2,
                      titleBn: 'তথ্য জমা দিন ও অভিযোগ নম্বর নিন',
                      subBn: 'তাৎক্ষণিক ট্র্যাকিং আইডি',
                      icon: Send,
                    },
                    {
                      step: 3,
                      titleBn: 'বিভাগ প্রয়োজনীয় কার্যক্রম গ্রহণ করবে',
                      subBn: 'দায়িত্বপ্রাপ্ত দপ্তরে প্রেরণ',
                      icon: Settings,
                    },
                    {
                      step: 4,
                      titleBn: 'সমাধান ও আপডেট দেখুন',
                      subBn: 'এসএমএস ও পোর্টালে যাচাই',
                      icon: CheckCircle2,
                    },
                  ].map((item, idx, arr) => {
                    const StepIcon = item.icon;
                    return (
                      <div
                        key={item.step}
                        className="relative flex items-center"
                      >
                        <div className="w-full h-full bg-[#F4FBF7] border border-[#D5EFE0] rounded-xl p-3.5 flex flex-col items-center text-center justify-center space-y-1.5">
                          <div className="w-9 h-9 rounded-lg bg-[#E2F5EA] text-[#005b32] flex items-center justify-center">
                            <StepIcon className="w-4 h-4" />
                          </div>
                          <div className="text-xs font-extrabold text-[#172033] leading-snug">
                            {item.titleBn}
                          </div>
                          <div className="text-[11px] text-[#64748B]">
                            {item.subBn}
                          </div>
                        </div>
                        {idx < arr.length - 1 && (
                          <div className="hidden lg:flex items-center justify-center text-[#94A3B8] -mr-2.5 ml-0.5 z-10">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 9. SERVICE PROVIDER CARD */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-[#E2E8F0] text-[#005b32] flex items-center justify-center shrink-0 mt-0.5">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="text-[#172033]">
                      <span className="font-bold">সেবা প্রদানকারী এলাকা:</span>{' '}
                      <span className="text-[#475569]">
                        {selectedService.providerAreaBn}
                      </span>
                    </div>
                    <div className="text-[#64748B]">
                      সর্বশেষ যাচাইকৃত: {selectedService.lastVerifiedDate}
                    </div>
                  </div>
                </div>

                <a
                  href={selectedService.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-[#005b32] hover:bg-[#004425] text-white text-xs sm:text-sm font-bold rounded-lg transition inline-flex items-center justify-center gap-2 shrink-0 shadow-2xs"
                >
                  <span>সরকারি পোর্টালে আবেদন করুন</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ================================================================== */}
      {/* 10. USEFUL INFORMATION SECTION (উপকারী তথ্য ও নির্দেশনা)             */}
      {/* ================================================================== */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base sm:text-lg font-extrabold text-[#172033] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#005b32]" />
            <span>উপকারী তথ্য ও নির্দেশনা</span>
          </h2>
          {infoToast && (
            <span className="text-xs font-bold text-[#005b32] bg-[#EAF7EF] border border-[#CBEAD6] px-3 py-1 rounded-md">
              {infoToast}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Card 1: সাধারণ জিজ্ঞাসা (FAQ) */}
          <button
            type="button"
            onClick={() =>
              faqSectionRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              })
            }
            className="bg-[#F2FBF6] hover:bg-[#E6F7EE] border border-[#D4EEDF] rounded-xl p-4 flex items-center gap-3.5 text-left transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-[#DDF3E5] text-[#005b32] flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-[#172033]">
                সাধারণ জিজ্ঞাসা
              </div>
              <div className="text-[11px] text-[#64748B] mt-0.5">(FAQ)</div>
            </div>
          </button>

          {/* Card 2: আবেদন নির্দেশিকা */}
          <button
            type="button"
            onClick={() =>
              processSectionRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              })
            }
            className="bg-[#F2FBF6] hover:bg-[#E6F7EE] border border-[#D4EEDF] rounded-xl p-4 flex items-center gap-3.5 text-left transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-[#DDF3E5] text-[#005b32] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-[#172033]">
                আবেদন নির্দেশিকা
              </div>
              <div className="text-[11px] text-[#64748B] mt-0.5">
                ধাপে ধাপে দেখুন
              </div>
            </div>
          </button>

          {/* Card 3: প্রয়োজনীয় কাগজ */}
          <button
            type="button"
            onClick={() => {
              requiredDocsRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              });
              setInfoToast('প্রয়োজনীয় তথ্যের তালিকা হাইলাইট করা হয়েছে');
              setTimeout(() => setInfoToast(null), 3000);
            }}
            className="bg-[#F2FBF6] hover:bg-[#E6F7EE] border border-[#D4EEDF] rounded-xl p-4 flex items-center gap-3.5 text-left transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-[#DDF3E5] text-[#005b32] flex items-center justify-center shrink-0">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-[#172033]">
                প্রয়োজনীয় কাগজ
              </div>
              <div className="text-[11px] text-[#64748B] mt-0.5">
                ডাউনলোড করুন
              </div>
            </div>
          </button>

          {/* Card 4: ওয়ার্ডভিত্তিক তথ্য */}
          <button
            type="button"
            onClick={() => {
              if (onOpenTrack) {
                onOpenTrack();
              } else {
                setInfoToast('ওয়ার্ড ০১–০৫ পাইলট অঞ্চলের সেবা সক্রিয় রয়েছে');
                setTimeout(() => setInfoToast(null), 3000);
              }
            }}
            className="bg-[#F2FBF6] hover:bg-[#E6F7EE] border border-[#D4EEDF] rounded-xl p-4 flex items-center gap-3.5 text-left transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-[#DDF3E5] text-[#005b32] flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-[#172033]">
                ওয়ার্ডভিত্তিক তথ্য
              </div>
              <div className="text-[11px] text-[#64748B] mt-0.5">
                আপনার এলাকা জানুন
              </div>
            </div>
          </button>

          {/* Card 5: সহায়তা প্রয়োজন? */}
          <a
            href="tel:16106"
            className="bg-[#F2FBF6] hover:bg-[#E6F7EE] border border-[#D4EEDF] rounded-xl p-4 flex items-center gap-3.5 text-left transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-[#DDF3E5] text-[#005b32] flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-[#172033]">
                সহায়তা প্রয়োজন?
              </div>
              <div className="text-[11px] text-[#64748B] mt-0.5">
                কল করুন: ১৬১০৬
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 11. FREQUENTLY ASKED QUESTIONS (সচরাচর জিজ্ঞাসিত প্রশ্ন - FAQ)        */}
      {/* ================================================================== */}
      <section
        ref={faqSectionRef}
        className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 shadow-2xs"
      >
        <h2 className="text-lg sm:text-xl font-extrabold text-[#172033] mb-5">
          সচরাচর জিজ্ঞাসিত প্রশ্ন (FAQ)
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Accordion List (7 Cols) */}
          <div className="lg:col-span-7 divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-xl overflow-hidden bg-white">
            {FAQ_ITEMS.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div key={faq.id} className="transition-colors">
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className={`w-full px-4 py-3.5 text-left flex items-center justify-between gap-3 cursor-pointer transition ${
                      isOpen ? 'bg-[#F8FAFC]' : 'hover:bg-[#F8FAFC]/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#172033]">
                      <span className="text-[#005b32] font-bold">
                        {isOpen ? (
                          <Minus className="w-4 h-4" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </span>
                      <span>{faq.questionBn}</span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#64748B] shrink-0" />
                    ) : (
                      <Plus className="w-4 h-4 text-[#005b32] shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 pl-10 text-xs sm:text-sm text-[#475569] bg-[#F8FAFC] leading-relaxed">
                      {faq.answerBn}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Park & Recycling Illustration (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="relative h-60 sm:h-68 w-full rounded-xl overflow-hidden border border-[#DCEEE3] bg-[#EFFAF3]">
              <Image
                src={getDynamicImageSrc(
                  'faq_recycling_illustration.jpg',
                  imageVersions
                )}
                alt="পরিচ্ছন্ন নগর ও বর্জ্য ব্যবস্থাপনা ইলাস্ট্রেশন"
                fill
                sizes="(max-width: 1024px) 100vw, 480px"
                className="object-cover object-center"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 12. CITIZEN COMPLAINT CTA BANNER                                   */}
      {/* ================================================================== */}
      <section className="rounded-2xl bg-gradient-to-r from-[#004D2A] via-[#005b32] to-[#006B32] text-white px-6 py-5 sm:px-8 sm:py-6 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          {/* Subtle Citizen-Service Smartphone Illustration on Left */}
          <div className="relative w-24 h-16 sm:w-28 sm:h-18 rounded-xl overflow-hidden border border-white/15 shrink-0 bg-[#004425]">
            <Image
              src={getDynamicImageSrc(
                'cta_phone_illustration.jpg',
                imageVersions
              )}
              alt="নতুন অভিযোগ জমা দিন"
              fill
              sizes="120px"
              className="object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-white tracking-tight">
              এখনই আপনার এলাকার সমস্যা জানান
            </h2>
            <p className="text-xs sm:text-sm text-white/90 mt-1">
              পরিষ্কার, নিরাপদ ও বাসযোগ্য নগর গড়তে আপনার অভিযোগ গুরুত্বপূর্ণ।
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onFileComplaint) {
              onFileComplaint();
            }
          }}
          className="px-6 py-3 rounded-xl bg-white hover:bg-[#F3FAF5] text-[#005b32] text-xs sm:text-sm font-extrabold shadow-xs inline-flex items-center gap-2 transition cursor-pointer shrink-0"
        >
          <span>নতুন অভিযোগ জমা দিন</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
}
