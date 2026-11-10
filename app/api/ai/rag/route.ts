import { NextRequest, NextResponse } from 'next/server';
import { getPlatformSnapshot } from '@/src/db/repository.ts';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { query, wardFilter, includeStale } = await req.json();
    const q = (query || '').trim();
    if (!q) {
      return NextResponse.json({ error: 'অনুগ্রহ করে একটি প্রশ্ন লিখুন।' }, { status: 400 });
    }

    const snapshot = await getPlatformSnapshot();
    const docs = snapshot.governmentDocuments;

    // Out-of-scope check (Land, Tax, Passport, NID, License, Police emergency etc.)
    const outOfScopeRegex = /ভূমি|নামজারি|খতিয়ান|পাসপোর্ট|ভিসা|আয়কর|ট্যাক্স|ট্রেড লাইসেন্স|জন্ম নিবন্ধন|জাতীয় পরিচয়পত্র|এনআইডি|ব্যাংক ঋণ|land|passport|tax|license|nid/i;
    if (outOfScopeRegex.test(q)) {
      return NextResponse.json({
        found: false,
        answerBn:
          'এই প্রশ্নের জন্য যাচাইকৃত সরকারি তথ্য পাওয়া যায়নি। অনুগ্রহ করে সংশ্লিষ্ট সরকারি দপ্তরে যাচাই করুন। (দ্রষ্টব্য: নাগরিক সাথী AI-এর প্রথম পর্যায়ে শুধু বর্জ্য, ড্রেনেজ, সড়কবাতি ও রাস্তা সংক্রান্ত অনুমোদিত সিটি কর্পোরেশন নথি অন্তর্ভুক্ত রয়েছে; ভূমি, কর বা লাইসেন্স সেবা এর পরিসরের বাইরে।)',
        citations: [],
        outOfScope: true,
      });
    }

    // Score documents by keyword and content overlap
    const scoredDocs = docs
      .filter((doc) => includeStale || !doc.isStale)
      .map((doc) => {
        let score = 0;
        const kwList: string[] = Array.isArray(doc.keywords) ? (doc.keywords as string[]) : [];
        for (const kw of kwList) {
          if (q.toLowerCase().includes(kw.toLowerCase())) {
            score += 3;
          }
        }
        if (q.includes('ময়লা') || q.includes('বর্জ্য') || q.includes('ডাস্টবিন')) {
          if (doc.category === 'Waste') score += 4;
        }
        if (q.includes('ড্রেন') || q.includes('পানি') || q.includes('জলাবদ্ধতা') || q.includes('ম্যানহোল')) {
          if (doc.category === 'Drainage') score += 4;
        }
        if (q.includes('বাতি') || q.includes('লাইট') || q.includes('পোল') || q.includes('অন্ধকার')) {
          if (doc.category === 'Streetlight') score += 4;
        }
        if (q.includes('রাস্তা') || q.includes('সড়ক') || q.includes('গর্ত') || q.includes('ফুটপাত') || q.includes('খনন')) {
          if (doc.category === 'Road') score += 4;
        }
        if (q.includes('আপিল') || q.includes('রিওপেন') || q.includes('সমাধান হয়নি') || q.includes('প্রমাণ')) {
          if (doc.docId === 'DOC-GRS-APPEAL-2026') score += 5;
        }
        return { doc, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    if (scoredDocs.length === 0) {
      return NextResponse.json({
        found: false,
        answerBn:
          'এই প্রশ্নের জন্য যাচাইকৃত সরকারি তথ্য পাওয়া যায়নি। অনুগ্রহ করে সংশ্লিষ্ট সরকারি দপ্তরে যাচাই করুন।',
        citations: [],
      });
    }

    const topDocs = scoredDocs.slice(0, 2).map((s) => s.doc);
    let synthesizedAnswer = topDocs.map((d) => d.contentBn).join('\n\n');

    // Enhance with Gemini strictly grounded on topDocs if API key is present
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
        });
        const contextStr = topDocs
          .map(
            (d) =>
              `[DocID: ${d.docId} | Title: ${d.titleBn} | Effective: ${d.effectiveDate} | Jurisdiction: ${d.jurisdictionBn} | Stale: ${d.isStale}]\nContent: ${d.contentBn}`
          )
          .join('\n---\n');

        const resp = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `প্রশ্ন: "${q}"\nনির্বাচিত প্রযোজ্য এলাকা: "${wardFilter || 'সকল পাইলট ওয়ার্ড'}"\n\nঅনুমোদিত সরকারি নথিসমূহ:\n${contextStr}`,
          config: {
            systemInstruction:
              'You are the Nagorik Sathi AI Approved-Document RAG Assistant. Answer ONLY in Bangla using strictly the provided documents. Never invent fees, deadlines, or laws. Mention the SLA and rule clearly.',
          },
        });
        if (resp.text) {
          synthesizedAnswer = resp.text;
        }
      } catch {
        // Fallback to direct document excerpt
      }
    }

    return NextResponse.json({
      found: true,
      answerBn: synthesizedAnswer,
      hasStaleSource: topDocs.some((d) => d.isStale),
      citations: topDocs.map((d) => ({
        docId: d.docId,
        titleBn: d.titleBn,
        sourceAgencyBn: d.sourceAgencyBn,
        sourceUrl: d.sourceUrl,
        version: d.version,
        effectiveDate: d.effectiveDate,
        lastVerifiedDate: d.lastVerifiedDate,
        jurisdictionBn: d.jurisdictionBn,
        isStale: d.isStale,
      })),
    });
  } catch (error: any) {
    console.error('POST /api/ai/rag error:', error);
    return NextResponse.json(
      { error: error.message || 'RAG উত্তর তৈরিতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
