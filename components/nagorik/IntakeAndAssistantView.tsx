'use client';

import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Upload,
  Save,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  UserCheck,
  Clock,
  PhoneCall,
  Building2,
  ArrowRight,
} from 'lucide-react';
import WardInteractiveMap from './WardInteractiveMap';
import { ActiveRole, PlatformSnapshot } from './types';

interface IntakeAndAssistantViewProps {
  snapshot: PlatformSnapshot;
  activeRole: ActiveRole;
  linkedCaseNumber?: string | null;
  onCaseCreated: (caseNumber: string, updatedSnapshot: PlatformSnapshot) => void;
}

const OFFICER_DIRECTORY: Record<
  string,
  { officerName: string; designation: string; deptName: string; slaText: string }
> = {
  'DEPT-WASTE': {
    officerName: 'প্রকৌ. কামরুল হাসান',
    designation: 'নির্বাহী কর্মকর্তা, বর্জ্য ব্যবস্থাপনা বিভাগ',
    deptName: 'বর্জ্য ব্যবস্থাপনা বিভাগ',
    slaText: '১২ – ২৪ ঘণ্টা',
  },
  'DEPT-DRAIN': {
    officerName: 'প্রকৌ. তরিকুল ইসলাম',
    designation: 'সহকারী প্রকৌশলী, ড্রেনেজ ও পয়ঃনিষ্কাশন বিভাগ',
    deptName: 'ড্রেনেজ ও খাল পরিষ্কার বিভাগ',
    slaText: '২৪ – ৪৮ ঘণ্টা',
  },
  'DEPT-LIGHT': {
    officerName: 'প্রকৌ. সাজ্জাদ হোসেন',
    designation: 'উপ-সহকারী প্রকৌশলী, বিদ্যুৎ ও সড়কবাতি বিভাগ',
    deptName: 'বিদ্যুৎ ও সড়কবাতি বিভাগ',
    slaText: '২৪ – ৩৬ ঘণ্টা',
  },
  'DEPT-ROAD': {
    officerName: 'প্রকৌ. ফারহানা ইয়াসমিন',
    designation: 'নির্বাহী প্রকৌশলী, সড়ক ও অবকাঠামো সংস্কার বিভাগ',
    deptName: 'সড়ক ও অবকাঠামো প্রকৌশল বিভাগ',
    slaText: '৪৮ – ৭২ ঘণ্টা',
  },
  'DEPT-COORD': {
    officerName: 'ড. মাহমুদুল হক',
    designation: 'প্রধান সমন্বয় কর্মকর্তা, নাগরিক সেবা সেল',
    deptName: 'কেন্দ্রীয় নাগরিক সমন্বয় সেল',
    slaText: '২৪ ঘণ্টা',
  },
};

const QUICK_EXAMPLES = [
  {
    label: 'ময়লা জমে ড্রেন বন্ধ ও রাস্তা ভাঙা',
    text: 'মিরপুর কাজীপাড়া মসজিদের পাশের গলিতে ময়লা জমে ড্রেন বন্ধ হয়ে পানি জমেছে এবং রাস্তার কার্পেটিং উঠে বড় গর্ত হয়েছে।',
    wardId: 'WARD-03',
    landmark: 'কাজীপাড়া কেন্দ্রীয় জামে মসজিদ গলি',
    assetId: 'AST-DRN-201',
    lat: 23.7955,
    lng: 90.3735,
  },
  {
    label: 'রাস্তার বাতি জ্বলছে না',
    text: 'গত তিনদিন ধরে পল্লবী সাড়ে এগারো মোড়ের রাস্তার বাতি জ্বলছে না, রাতে পুরো রাস্তা অন্ধকার থাকে।',
    wardId: 'WARD-02',
    landmark: 'পল্লবী সাড়ে এগারো বাসস্ট্যান্ড মোড়',
    assetId: 'AST-LGT-401',
    lat: 23.8275,
    lng: 90.3649,
  },
  {
    label: 'ডাস্টবিন উপচে রাস্তায় ময়লা',
    text: 'রূপনগর মডেল স্কুলের সামনে ময়লার কন্টেইনার উপচে রাস্তায় আবর্জনা ছড়িয়ে আছে, চলাচল করা যাচ্ছে না।',
    wardId: 'WARD-06',
    landmark: 'রূপনগর মডেল স্কুলের সামনে',
    assetId: 'AST-WST-102',
    lat: 23.8141,
    lng: 90.3562,
  },
  {
    label: 'রাস্তার মাঝখানে বড় গর্ত',
    text: 'শেওড়াপাড়া বাসস্ট্যান্ডের পূর্ব পাশে প্রধান সড়কে বড় গর্ত হয়ে রিকশা ও গাড়ি চলাচলে দুর্ঘটনার ঝুঁকি তৈরি হয়েছে।',
    wardId: 'WARD-03',
    landmark: 'শেওড়াপাড়া বাসস্ট্যান্ড থেকে ২০০ মিটার পূর্বে',
    assetId: 'AST-RD-301',
    lat: 23.7918,
    lng: 90.3751,
  },
];

export default function IntakeAndAssistantView({
  snapshot,
  activeRole,
  linkedCaseNumber,
  onCaseCreated,
}: IntakeAndAssistantViewProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [wardId, setWardId] = useState('WARD-03');
  const [landmark, setLandmark] = useState('');
  const [assetId, setAssetId] = useState('');
  const [latitude, setLatitude] = useState(23.7955);
  const [longitude, setLongitude] = useState(90.3735);
  const [citizenName, setCitizenName] = useState('আব্দুর রহিম');
  const [citizenPhone, setCitizenPhone] = useState('01711-000101');
  const [contactPreference, setContactPreference] = useState('Web + SMS');
  const [consentGiven, setConsentGiven] = useState(true);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [draftSavedNotice, setDraftSavedNotice] = useState<string | null>(null);

  const [pipelineResult, setPipelineResult] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSaveDraft = () => {
    try {
      localStorage.setItem(
        'nagorik_sathi_complaint_draft',
        JSON.stringify({
          title,
          description,
          wardId,
          landmark,
          savedAt: new Date().toISOString(),
        })
      );
      setDraftSavedNotice('আপনার খসড়া অভিযোগটি সংরক্ষিত হয়েছে। পরবর্তীতে যেকোনো সময় জমা দিতে পারবেন।');
      setTimeout(() => setDraftSavedNotice(null), 4000);
    } catch {
      setErrorMsg('খসড়া সংরক্ষণ করা যায়নি।');
    }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    setIsRecording(true);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'bn-BD';
        recognition.interimResults = false;
        recognition.onresult = (event: any) => {
          const transcript = event.results?.[0]?.[0]?.transcript || '';
          if (transcript) {
            setVoiceTranscript(transcript);
            setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
          setIsRecording(false);
        };
        recognition.onerror = () => {
          const fallbackTranscript =
            'আমাদের কাজীপাড়া গলিতে ময়লা জমে ড্রেন বন্ধ হয়ে পানি রাস্তায় উঠে গেছে এবং রাস্তায় বড় গর্ত হয়েছে।';
          setVoiceTranscript(fallbackTranscript);
          setDescription((prev) => (prev ? prev : fallbackTranscript));
          if (!landmark) setLandmark('কাজীপাড়া কেন্দ্রীয় জামে মসজিদ মোড়');
          if (!title) setTitle('কাজীপাড়া গলিতে ময়লা ও ড্রেন বন্ধ হয়ে জলাবদ্ধতা');
          setIsRecording(false);
        };
        recognition.start();
      } catch {
        setIsRecording(false);
      }
    } else {
      setTimeout(() => {
        const sampleVoice =
          'আমাদের এলাকার ড্রেনটি অনেকদিন ধরে বন্ধ। বৃষ্টির সময় ময়লা পানি রাস্তায় উঠে যায় এবং রাস্তা ভেঙে গেছে।';
        setVoiceTranscript(sampleVoice);
        setDescription((prev) => (prev ? prev : sampleVoice));
        if (!landmark) setLandmark('কাজীপাড়া মসজিদ রোড');
        if (!title) setTitle('ড্রেন বন্ধ হয়ে জলাবদ্ধতা ও রাস্তা ক্ষতিগ্রস্ত');
        setIsRecording(false);
      }, 800);
    }
  };

  const handleAnalyzeWithPipeline = async (
    customText?: string,
    customWard?: string,
    customLandmark?: string
  ) => {
    setErrorMsg(null);
    const textToAnalyze = customText ?? description;
    const wardToUse = customWard ?? wardId;
    const landmarkToUse = (customLandmark ?? landmark) || 'প্রধান সড়ক সংলগ্ন এলাকা';

    if (!textToAnalyze || textToAnalyze.trim().length < 6) {
      setErrorMsg('অনুগ্রহ করে সমস্যার বিবরণ অন্তত এক বাক্যে বাংলায় লিখুন অথবা কণ্ঠে বলুন।');
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToAnalyze,
          voiceTranscript,
          wardId: wardToUse,
          landmark: landmarkToUse,
          assetId,
          latitude,
          longitude,
          hasImage: Boolean(uploadedFileName),
          consentGiven,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'তথ্য যাচাইয়ে সমস্যা হয়েছে।');
      setPipelineResult(data);
      if (!landmark) setLandmark(landmarkToUse);
      if (!title && textToAnalyze) {
        setTitle(textToAnalyze.slice(0, 60));
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmAndSubmitCase = async () => {
    if (!consentGiven) {
      setErrorMsg('অভিযোগ জমা দেওয়ার আগে সম্মতি বক্সে টিক দিন।');
      return;
    }
    if (!description || description.trim().length < 6) {
      setErrorMsg('অনুগ্রহ করে আপনার সমস্যার বিবরণ লিখুন।');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_CASE',
          payload: {
            title: title || description.slice(0, 58),
            originalDescription: description,
            category: pipelineResult?.step3Classification?.category,
            severity: pipelineResult?.step4Entities?.severityClue || 'Medium',
            citizenUid: 'demo-citizen-01',
            citizenName,
            citizenPhone,
            contactPreference,
            submittedVia:
              activeRole === 'ward_desk'
                ? 'ওয়ার্ড সহায়ক ডেস্ক'
                : voiceTranscript
                ? 'কণ্ঠস্বর (Voice)'
                : 'ওয়েব পোর্টাল',
            wardId,
            roadName: landmark || 'প্রধান সড়ক',
            landmark: landmark || 'ওয়ার্ড কেন্দ্র সংলগ্ন',
            assetId,
            latitude,
            longitude,
            voiceTranscript,
            imageUrl: uploadedFileName ? `photo://${uploadedFileName}` : undefined,
            linkedParentCaseNumber: linkedCaseNumber || undefined,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'অভিযোগ জমা দেওয়া যায়নি।');

      localStorage.removeItem('nagorik_sathi_complaint_draft');
      onCaseCreated(data.createdCase.caseNumber, data.snapshot);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const assignedOfficerInfo =
    pipelineResult &&
    (OFFICER_DIRECTORY[pipelineResult.step6Responsibility.primaryDepartmentId] ||
      OFFICER_DIRECTORY['DEPT-COORD']);

  return (
    <div className="space-y-6">
      {/* Clean Page Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#004425]">
            নতুন সমস্যা বা অভিযোগ জানান
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            আপনার এলাকার বর্জ্য, ড্রেনেজ, সড়কবাতি বা রাস্তার সমস্যা সহজ বাংলায় লিখুন অথবা কণ্ঠে বলুন। কোন বিভাগ ও কোন কর্মকর্তা সমাধান করবেন তা তাৎক্ষণিক দেখতে পাবেন।
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveDraft}
          className="px-4 py-2 rounded-md text-xs font-semibold bg-[#F8FAFC] text-[#005b32] border border-[#E2E8F0] hover:bg-slate-100 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4 text-[#0891B2]" />
          <span>খসড়া সেভ করে রাখুন</span>
        </button>
      </div>

      {draftSavedNotice && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{draftSavedNotice}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-xs text-red-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Quick Fill Sample Problems */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-4">
        <div className="text-xs font-semibold text-slate-600 mb-2.5">
          দ্রুত পরীক্ষার জন্য নিচের যেকোনো একটি সাধারণ সমস্যায় ক্লিক করুন:
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_EXAMPLES.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setTitle(ex.label);
                setDescription(ex.text);
                setWardId(ex.wardId);
                setLandmark(ex.landmark);
                setAssetId(ex.assetId);
                setLatitude(ex.lat);
                setLongitude(ex.lng);
                handleAnalyzeWithPipeline(ex.text, ex.wardId, ex.landmark);
              }}
              className="px-3.5 py-2 text-xs font-medium bg-[#F8FAFC] hover:bg-[#E6F7FA] text-[#005b32] border border-[#E2E8F0] rounded-md transition-colors text-left cursor-pointer"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Form on Left, Officer & Solution Roadmap Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: User-Friendly Complaint Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 space-y-5">
            <h3 className="text-base font-bold text-[#004425] border-b border-[#E2E8F0] pb-3">
              ১. সমস্যার বিস্তারিত তথ্য দিন
            </h3>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-800">
                  আপনার সমস্যাটি বাংলায় লিখুন বা মাইক্রোফোনে বলুন *
                </label>
                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isRecording
                      ? 'bg-red-600 text-white'
                      : 'bg-[#E6F7FA] text-[#005b32] hover:bg-[#0891B2] hover:text-white'
                  }`}
                >
                  {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{isRecording ? 'কথা বলা শেষ হলে থামান' : 'কণ্ঠে বলুন (Voice)'}</span>
                </button>
              </div>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="উদাহরণ: আমাদের গলিতে ময়লা জমে ড্রেন বন্ধ হয়ে রাস্তায় পানি উঠে গেছে এবং চলাচল করা যাচ্ছে না..."
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#0891B2]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  আপনার ওয়ার্ড নির্বাচন করুন *
                </label>
                <select
                  value={wardId}
                  onChange={(e) => setWardId(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#0891B2]"
                >
                  {snapshot.wards.map((w) => (
                    <option key={w.wardId} value={w.wardId}>
                      {w.nameBn.replace('(পাইলট)', '').trim()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  সুনির্দিষ্ট স্থান বা রাস্তার নাম (ল্যান্ডমার্ক) *
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="উদা: কাজীপাড়া মসজিদ গলি / ১০ নং রোড"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#0891B2]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  সংক্ষিপ্ত শিরোনাম (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="উদা: ড্রেন বন্ধ ও জলাবদ্ধতা"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#0891B2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  সমস্যার ছবি যুক্ত করুন (ঐচ্ছিক)
                </label>
                <label className="flex items-center justify-between px-3.5 py-2 text-xs bg-[#F8FAFC] border border-dashed border-slate-300 rounded-md cursor-pointer hover:bg-slate-100">
                  <span className="truncate text-slate-600">
                    {uploadedFileName || 'ছবি আপলোড করুন (JPG/PNG)'}
                  </span>
                  <Upload className="w-4 h-4 text-[#005b32] shrink-0 ml-2" />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setUploadedFileName(f.name);
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Contact Info */}
            <div className="pt-3 border-t border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">আপনার নাম</label>
                <input
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">মোবাইল নম্বর</label>
                <input
                  type="text"
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#E2E8F0] rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">আপডেট পাওয়ার মাধ্যম</label>
                <select
                  value={contactPreference}
                  onChange={(e) => setContactPreference(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-md"
                >
                  <option value="Web + SMS">ওয়েব পোর্টাল ও SMS</option>
                  <option value="Web Portal Only">শুধু ওয়েব পোর্টাল</option>
                  <option value="Ward Desk Assisted Call">ওয়ার্ড ডেস্ক ফোন কল</option>
                </select>
              </div>
            </div>

            <label className="flex items-start gap-2.5 text-xs text-slate-700 bg-[#F8FAFC] p-3.5 rounded-md border border-[#E2E8F0] cursor-pointer">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-[#005b32]"
              />
              <span>
                আমি সম্মতি দিচ্ছি যে আমার প্রদত্ত তথ্য ও অবস্থান শুধুমাত্র সিটি কর্পোরেশনের সংশ্লিষ্ট বিভাগের মাধ্যমে সমস্যাটি সমাধানের জন্য ব্যবহৃত হবে।
              </span>
            </label>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleAnalyzeWithPipeline()}
                disabled={isAnalyzing}
                className="px-4 py-2.5 rounded-md text-xs font-semibold bg-[#E6F7FA] text-[#005b32] border border-[#0891B2]/30 hover:bg-[#0891B2] hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAnalyzing ? 'যাচাই করা হচ্ছে...' : 'দায়িত্বপ্রাপ্ত বিভাগ ও কর্মকর্তা দেখুন'}</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmAndSubmitCase}
                disabled={isSubmitting || pipelineResult?.step1Validation?.isEmergency}
                className="px-6 py-2.5 rounded-md text-xs font-semibold bg-[#005b32] text-white hover:bg-[#004425] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'জমা হচ্ছে...' : 'অভিযোগ জমা দিন'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Location Picker Map */}
          <WardInteractiveMap
            wards={snapshot.wards}
            assets={snapshot.assets}
            cases={snapshot.cases}
            selectedWardId={wardId}
            interactivePicker={true}
            onSelectWard={(wId) => setWardId(wId)}
            onPickCoordinates={(lat, lng, closestWard) => {
              setLatitude(lat);
              setLongitude(lng);
              setWardId(closestWard);
            }}
          />
        </div>

        {/* Right: Clear Preview of How It Will Be Solved & Which Officer Gets It */}
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-lg p-6 space-y-5">
          <div className="border-b border-[#E2E8F0] pb-3">
            <h3 className="text-base font-bold text-[#004425]">
              ২. কীভাবে সমাধান হবে এবং কার কাছে যাবে?
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              অভিযোগ জমা দেওয়ার আগেই দেখে নিন কোন দপ্তর, কোন কর্মকর্তা এবং কয়টি ধাপে আপনার সমস্যার সমাধান করা হবে।
            </p>
          </div>

          {!pipelineResult ? (
            <div className="py-10 space-y-4">
              <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-3 text-xs text-slate-700">
                <div className="font-bold text-[#004425] text-sm">
                  সমস্যা জানানোর ৩টি সহজ ধাপ:
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#005b32] text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    ১
                  </span>
                  <p>
                    <strong>সমস্যার কথা জানান:</strong> বাম পাশের বক্সে বাংলায় লিখুন বা কণ্ঠে বলুন এবং আপনার ওয়ার্ড ও স্থান নির্বাচন করুন।
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#0891B2] text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    ২
                  </span>
                  <p>
                    <strong>কর্মকর্তা ও সমাধান প্রক্রিয়া দেখুন:</strong> সিস্টেম স্বয়ংক্রিয়ভাবে নির্ধারণ করবে কোন বিভাগের কোন কর্মকর্তা কাজটি করবেন।
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    ৩
                  </span>
                  <p>
                    <strong>ট্র্যাকিং ও সমাধানের প্রমাণ:</strong> অভিযোগ জমা দিলে একটি ট্র্যাকিং নম্বর পাবেন এবং কাজের আগের ও পরের ছবিসহ অগ্রগতি দেখতে পাবেন।
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              {pipelineResult.step1Validation.isEmergency && (
                <div className="p-4 rounded-md bg-red-50 border border-red-300 text-red-950 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-red-800 text-sm">
                    <PhoneCall className="w-4 h-4" />
                    <span>জরুরি জীবন ও নিরাপত্তা ঝুঁকি সতর্কতা (৯৯৯)</span>
                  </div>
                  <p className="leading-relaxed">{pipelineResult.step1Validation.emergencyWarningBn}</p>
                </div>
              )}

              {/* Assigned Department & Officer Card */}
              {assignedOfficerInfo && (
                <div className="p-4 rounded-lg bg-[#E6F7FA]/70 border border-[#0891B2]/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#0891B2] uppercase">
                      প্রস্তাবিত দায়িত্বপ্রাপ্ত কর্মকর্তা ও দপ্তর
                    </span>
                    <span className="font-mono font-semibold text-[#005b32]">
                      সম্ভাব্য সময়: {assignedOfficerInfo.slaText}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#005b32] text-white flex items-center justify-center shrink-0 font-bold text-sm">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#004425]">
                        {assignedOfficerInfo.officerName}
                      </div>
                      <div className="text-slate-700 font-medium">
                        {assignedOfficerInfo.designation}
                      </div>
                      <div className="text-slate-600 mt-0.5 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-[#0891B2]" />
                        <span>{assignedOfficerInfo.deptName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step-by-Step Solution Plan */}
              <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <div className="font-bold text-[#004425] text-sm">
                  সমস্যাটি যেভাবে ধাপে ধাপে সমাধান হবে:
                </div>

                <div className="space-y-2.5">
                  {pipelineResult.step6Responsibility.secondaryDepartments.map((sub: any) => {
                    const off = OFFICER_DIRECTORY[sub.deptId] || OFFICER_DIRECTORY['DEPT-COORD'];
                    return (
                      <div
                        key={sub.sequenceOrder}
                        className="p-3 bg-white rounded-md border border-[#E2E8F0] space-y-1"
                      >
                        <div className="flex items-center justify-between font-semibold text-[#005b32]">
                          <span>
                            ধাপ {sub.sequenceOrder}: {sub.taskTitleBn}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {sub.sequenceOrder === 1
                              ? 'প্রথমে শুরু হবে'
                              : `ধাপ ${sub.sequenceOrder - 1} শেষ হলে শুরু হবে`}
                          </span>
                        </div>
                        <div className="text-slate-600">
                          দপ্তর: <strong>{sub.nameBn}</strong> · দায়িত্বপ্রাপ্ত কর্মকর্তা:{' '}
                          <strong>{off.officerName}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Relevant Service Guidance */}
              {pipelineResult.step8RagGuidance && (
                <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                  <div className="font-semibold text-[#005b32]">সরকারি সেবা নিয়ম ও সময়সীমা:</div>
                  <p className="text-slate-700 leading-relaxed">
                    {pipelineResult.step8RagGuidance.answerBn}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleConfirmAndSubmitCase}
                disabled={isSubmitting || pipelineResult?.step1Validation?.isEmergency}
                className="w-full py-3 bg-[#005b32] text-white font-semibold rounded-md hover:bg-[#004425] transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'অভিযোগ নিবন্ধিত হচ্ছে...' : 'সব তথ্য ঠিক আছে — এখনই অভিযোগ জমা দিন'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
