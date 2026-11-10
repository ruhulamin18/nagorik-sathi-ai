# নাগরিক সাথী AI (Nagorik Sathi AI) — R&D Prototype v2.0

**বাংলাদেশের সিটি কর্পোরেশনভিত্তিক নাগরিক সেবা সমন্বয় ও সমস্যা সমাধান প্ল্যাটফর্ম**

## ১. R&D প্রস্তাবনার ফিচার ম্যাপিং (R&D Proposal Feature Mapping)

- **প্রাথমিক পাইলট পরিসর (সারণি ১ ও ৪):** ১টি সিটি কর্পোরেশন (`DNCC-PILOT`), ৫টি পাইলট ওয়ার্ড (`WARD-01`, `WARD-02`, `WARD-03`, `WARD-06`, `WARD-29`), ৪টি সমস্যা খাত (**বর্জ্য, ড্রেনেজ, সড়কবাতি ও রাস্তা**)।
- **১০-ধাপ বাংলা AI অভিযোগ প্রক্রিয়াকরণ পাইপলাইন (চিত্র ৬, পৃষ্ঠা ১৬):**
  1. Input validation ও জাতীয় জরুরি সেবা ৯৯৯ বিপদ সতর্কতা
  2. বাংলা বানানভেদ, কথ্য শব্দ ও Code-switching প্রমিতকরণ (মূল বক্তব্য অক্ষুণ্ণ রেখে সংরক্ষণ)
  3. Issue classification (Waste, Drainage, Streetlight, Road, Other, Uncertain)
  4. Entity extraction (Landmark, Ward, Asset, Duration, Severity)
  5. Geospatial resolution (Ward Polygon ও Asset Registry মিলকরণ; নাগরিকের নিশ্চিত করা স্থান অপরিবর্তিত থাকে)
  6. Rules-first Responsibility Recommendation (`RULE-WM-01`, `RULE-DRN-02`, `RULE-LGT-03`, `RULE-RD-04`, `RULE-MULTI-05`) + ML Ranking
  7. Duplicate Candidate Detection (স্বয়ংক্রিয় মার্জ নিষিদ্ধ; কর্মকর্তার নিশ্চিতকরণ ও Unmerge সুবিধা)
  8. অনুমোদিত নথিভিত্তিক RAG উত্তর (উৎস লিংক, কার্যকর তারিখ, প্রযোজ্য এলাকা ও Stale-Source সতর্কতা)
  9. Confidence & Human-in-the-Loop (HITL) Escalation
  10. Outcome Learning ও De-identified Dataset Export
- **বহু-বিভাগীয় Parent Case ও Sub-task অর্কেস্ট্রেশন (চিত্র ১, ৪ ও ৫):**
  - উদাহরণ কেস `NS-2026-1001`: **Sub-task ১ (বর্জ্য অপসারণ)** → **Sub-task ২ (ড্রেন পরিষ্কার)** → **Sub-task ৩ (ক্ষতিগ্রস্ত রাস্তা মেরামত)**।
  - পূর্ববর্তী টাস্ক সম্পন্ন ও প্রমাণ জমা হলে পরবর্তী নির্ভরশীল (Blocked) টাস্ক স্বয়ংক্রিয়ভাবে আনব্লক হয়।
- **প্রমাণ যাচাই, আপত্তি ও Reopen প্রটোকল (পৃষ্ঠা ২১–২২):**
  - বিফোর/আফটার ছবি, জিপিএস ও টাইমস্ট্যাম্প যাচাই।
  - নাগরিকের নীরবতাকে সন্তুষ্টি ধরা হয় না; `"সমস্যা সমাধান হয়নি"` বাটনে ক্লিক করলে কেস ও টাস্ক `Reopened` হয়।
  - বন্ধ (`Closed`) কেসের পর নতুন ঘটনা ঘটলে `Linked Case` হিসেবে খোলা যায়।
- **৭-স্তরের RBAC ও Tamper-Evident Audit Log (সারণি ১৫, পৃষ্ঠা ১৯):**
  - Citizen, Ward Desk / Assistant, Department Officer, Supervisor / Chief Officer, System Admin, Data / AI Researcher, এবং Compliance Auditor।
