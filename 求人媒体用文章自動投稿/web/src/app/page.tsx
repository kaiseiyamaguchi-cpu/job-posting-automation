"use client";

import { useState, useEffect } from "react";

// マスターデータの型
type MasterData = {
  // 基本情報
  companyName: string;
  businessDescription: string;
  jobTitle: string;
  jobCategory: string;
  employmentType: string;
  recruitmentCount: string;
  // 給与
  salaryType: string;
  salaryMin: string;
  salaryMax: string;
  bonus: string;
  // 勤務条件
  location: string;
  nearestStation: string;
  workHours: string;
  holidays: string;
  benefits: string;
  // 仕事内容
  jobDescription: string;
  jobFeatures: string;
  // 媒体別ペルソナ
  personaIndeed: string;
  personaEngage: string;
  personaKyujinbox: string;
};

// 各媒体の生成データ型
type MediaData = {
  jobTitle: string;
  jobDescription: string;
  appealPoints: string;
  targetPerson: string;
  requirements: string;
  salary: string;
  benefits: string;
  workConditions: string;
  other: string;
};

type GeneratedData = {
  indeed: MediaData;
  kyujinbox: MediaData;
  engage: MediaData;
};

const initialMasterData: MasterData = {
  companyName: "",
  businessDescription: "",
  jobTitle: "",
  jobCategory: "",
  employmentType: "正社員",
  recruitmentCount: "",
  salaryType: "月給",
  salaryMin: "",
  salaryMax: "",
  bonus: "",
  location: "",
  nearestStation: "",
  workHours: "",
  holidays: "",
  benefits: "",
  jobDescription: "",
  jobFeatures: "",
  personaIndeed: "",
  personaEngage: "",
  personaKyujinbox: "",
};

export default function Home() {
  const [step, setStep] = useState<1 | 2>(1);
  const [masterData, setMasterData] = useState<MasterData>(initialMasterData);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);
  const [error, setError] = useState("");
  const [extensionInstalled, setExtensionInstalled] = useState(false);
  const [savedToExtension, setSavedToExtension] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'OLP_EXTENSION_READY') {
        setExtensionInstalled(true);
      }
      if (event.data.type === 'OLP_DATA_SAVED' && event.data.success) {
        setSavedToExtension(true);
        setTimeout(() => setSavedToExtension(false), 3000);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleMasterChange = (field: keyof MasterData, value: string) => {
    setMasterData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!masterData.companyName || !masterData.jobTitle) {
      setError("会社名と職種名は必須です");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masterData }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      setGeneratedData(result.data);
      setStep(2);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaDataChange = (
    media: keyof GeneratedData,
    field: keyof MediaData,
    value: string
  ) => {
    if (!generatedData) return;
    setGeneratedData(prev => ({
      ...prev!,
      [media]: {
        ...prev![media],
        [field]: value,
      },
    }));
  };

  const handleSaveToExtension = () => {
    if (!generatedData) return;
    
    const dataToSave = {
      masterData,
      ...generatedData,
    };
    localStorage.setItem("olp_job_data", JSON.stringify(dataToSave));
    setSavedToExtension(true);
    setTimeout(() => setSavedToExtension(false), 3000);
  };

  const mediaConfig = {
    indeed: { name: "Indeed", color: "from-blue-500 to-blue-600", icon: "🔵" },
    kyujinbox: { name: "求人ボックス", color: "from-orange-500 to-orange-600", icon: "📦" },
    engage: { name: "エンゲージ", color: "from-green-500 to-green-600", icon: "💚" },
  };

  const fieldLabels: Record<keyof MediaData, string> = {
    jobTitle: "職種名/タイトル",
    jobDescription: "仕事内容",
    appealPoints: "アピールポイント/やりがい",
    targetPerson: "求める人材/対象者",
    requirements: "応募資格/経験・スキル",
    salary: "給与詳細",
    benefits: "待遇・福利厚生",
    workConditions: "勤務条件（時間・休日）",
    other: "その他・特記事項",
  };

  const jobCategories = [
    "営業", "事務・管理", "企画・マーケティング", "販売・サービス",
    "IT・エンジニア", "クリエイティブ", "専門職", "製造・物流",
    "医療・福祉", "教育", "飲食", "その他"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xl">
              🚀
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">OLP求人オートメーション</h1>
              <p className="text-xs text-slate-400">Indeed・エンゲージ・求人ボックス 同時生成</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-sm text-slate-300 hover:text-white"
              >
                ← 入力に戻る
              </button>
            )}
            <div className="flex items-center gap-1 text-sm">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step === 1 ? 'bg-violet-500 text-white' : 'bg-slate-600 text-slate-300'}`}>1</span>
              <span className="text-slate-500">→</span>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step === 2 ? 'bg-violet-500 text-white' : 'bg-slate-600 text-slate-300'}`}>2</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Step 1: 入力フォーム */}
        {step === 1 && (
          <div className="space-y-6">
            {/* 会社・基本情報 */}
            <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🏢</span>
                会社・基本情報
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    会社名 <span className="text-red-400">*</span>
                    <span className="text-xs text-slate-500 ml-2">全媒体必須</span>
                  </label>
                  <input
                    type="text"
                    value={masterData.companyName}
                    onChange={(e) => handleMasterChange("companyName", e.target.value)}
                    placeholder="株式会社〇〇"
                    className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    事業内容
                    <span className="text-xs text-green-400 ml-2">エンゲージ必須</span>
                  </label>
                  <input
                    type="text"
                    value={masterData.businessDescription}
                    onChange={(e) => handleMasterChange("businessDescription", e.target.value)}
                    placeholder="人材紹介事業、コンサルティング事業"
                    className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    職種名 <span className="text-red-400">*</span>
                    <span className="text-xs text-slate-500 ml-2">全媒体必須</span>
                  </label>
                  <input
                    type="text"
                    value={masterData.jobTitle}
                    onChange={(e) => handleMasterChange("jobTitle", e.target.value)}
                    placeholder="法人営業、コールセンターSV など"
                    className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    職種カテゴリ
                    <span className="text-xs text-green-400 ml-2">エンゲージ必須</span>
                  </label>
                  <select
                    value={masterData.jobCategory}
                    onChange={(e) => handleMasterChange("jobCategory", e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  >
                    <option value="">選択してください</option>
                    {jobCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    雇用形態
                    <span className="text-xs text-slate-500 ml-2">全媒体必須</span>
                  </label>
                  <select
                    value={masterData.employmentType}
                    onChange={(e) => handleMasterChange("employmentType", e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  >
                    <option value="正社員">正社員</option>
                    <option value="契約社員">契約社員</option>
                    <option value="アルバイト・パート">アルバイト・パート</option>
                    <option value="業務委託">業務委託</option>
                    <option value="派遣社員">派遣社員</option>
                    <option value="新卒・インターン">新卒・インターン</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    募集人数
                    <span className="text-xs text-green-400 ml-2">エンゲージ必須</span>
                  </label>
                  <input
                    type="text"
                    value={masterData.recruitmentCount}
                    onChange={(e) => handleMasterChange("recruitmentCount", e.target.value)}
                    placeholder="3名"
                    className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>
              </div>
            </section>

            {/* 給与・待遇 */}
            <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">💰</span>
                給与・待遇
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">給与</label>
                  <div className="flex gap-2 items-center flex-wrap">
                    <select
                      value={masterData.salaryType}
                      onChange={(e) => handleMasterChange("salaryType", e.target.value)}
                      className="bg-slate-900/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    >
                      <option value="月給">月給</option>
                      <option value="時給">時給</option>
                      <option value="日給">日給</option>
                      <option value="年収">年収</option>
                    </select>
                    <input
                      type="text"
                      value={masterData.salaryMin}
                      onChange={(e) => handleMasterChange("salaryMin", e.target.value)}
                      placeholder="30"
                      className="w-20 bg-slate-900/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />
                    <span className="text-slate-400">〜</span>
                    <input
                      type="text"
                      value={masterData.salaryMax}
                      onChange={(e) => handleMasterChange("salaryMax", e.target.value)}
                      placeholder="40"
                      className="w-20 bg-slate-900/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />
                    <span className="text-slate-400">{masterData.salaryType === "時給" ? "円" : "万円"}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">賞与・手当</label>
                  <input
                    type="text"
                    value={masterData.bonus}
                    onChange={(e) => handleMasterChange("bonus", e.target.value)}
                    placeholder="賞与年2回、インセンティブあり"
                    className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-1">待遇・福利厚生</label>
                  <textarea
                    value={masterData.benefits}
                    onChange={(e) => handleMasterChange("benefits", e.target.value)}
                    placeholder="社会保険完備、交通費支給（月3万円まで）、昇給年1回、有給休暇、産休・育休制度"
                    rows={2}
                    className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                  />
                </div>
              </div>
            </section>

            {/* 勤務条件 */}
            <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📍</span>
                勤務条件
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    勤務地
                    <span className="text-xs text-slate-500 ml-2">全媒体必須</span>
                  </label>
                  <input
                    type="text"
                    value={masterData.location}
                    onChange={(e) => handleMasterChange("location", e.target.value)}
                    placeholder="東京都渋谷区〇〇 1-2-3"
                    className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">最寄り駅・アクセス</label>
                  <input
                    type="text"
                    value={masterData.nearestStation}
                    onChange={(e) => handleMasterChange("nearestStation", e.target.value)}
                    placeholder="渋谷駅 徒歩5分"
                    className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    勤務時間
                    <span className="text-xs text-green-400 ml-2">エンゲージ必須</span>
                  </label>
                  <input
                    type="text"
                    value={masterData.workHours}
                    onChange={(e) => handleMasterChange("workHours", e.target.value)}
                    placeholder="9:00〜18:00（休憩1時間）"
                    className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    休日・休暇
                    <span className="text-xs text-green-400 ml-2">エンゲージ必須</span>
                  </label>
                  <input
                    type="text"
                    value={masterData.holidays}
                    onChange={(e) => handleMasterChange("holidays", e.target.value)}
                    placeholder="完全週休2日（土日祝）、年間休日120日"
                    className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>
              </div>
            </section>

            {/* 仕事内容 */}
            <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">💼</span>
                仕事内容
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    仕事内容（キーワードや箇条書きでOK）
                    <span className="text-xs text-slate-500 ml-2">全媒体必須</span>
                  </label>
                  <textarea
                    value={masterData.jobDescription}
                    onChange={(e) => handleMasterChange("jobDescription", e.target.value)}
                    placeholder={`例：
・法人向け営業（新規開拓7割、ルート営業3割）
・提案書作成、見積もり作成
・顧客管理、アフターフォロー
・チームメンバーのマネジメント`}
                    rows={5}
                    className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">仕事の特徴・やりがい</label>
                  <textarea
                    value={masterData.jobFeatures}
                    onChange={(e) => handleMasterChange("jobFeatures", e.target.value)}
                    placeholder={`例：
・成果がダイレクトに評価に反映される
・裁量が大きく、自分のペースで働ける
・チームの雰囲気が良い`}
                    rows={3}
                    className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                  />
                </div>
              </div>
            </section>

            {/* 媒体別ペルソナ */}
            <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">👤</span>
                求める人物像（媒体別ペルソナ）
              </h2>
              <p className="text-sm text-slate-400 mb-4">
                各媒体の特性に合わせて、求める人物像を入力してください。空欄の場合は共通のペルソナが適用されます。
              </p>
              <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <label className="block text-sm text-blue-400 mb-2 font-medium">
                    🔵 Indeed向けペルソナ
                    <span className="text-xs text-slate-400 ml-2">検索重視・具体的なスキル・経験を明記</span>
                  </label>
                  <textarea
                    value={masterData.personaIndeed}
                    onChange={(e) => handleMasterChange("personaIndeed", e.target.value)}
                    placeholder={`例：
・営業経験3年以上
・法人営業の経験がある方
・目標達成意欲の高い方
・Excel、PowerPointが使える方`}
                    rows={3}
                    className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                  />
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <label className="block text-sm text-green-400 mb-2 font-medium">
                    💚 エンゲージ向けペルソナ
                    <span className="text-xs text-slate-400 ml-2">人柄重視・会社の雰囲気にフィットする人</span>
                  </label>
                  <textarea
                    value={masterData.personaEngage}
                    onChange={(e) => handleMasterChange("personaEngage", e.target.value)}
                    placeholder={`例：
・チームで協力して働くのが好きな方
・新しいことにチャレンジしたい方
・お客様の課題解決にやりがいを感じる方
・成長意欲のある方`}
                    rows={3}
                    className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none"
                  />
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                  <label className="block text-sm text-orange-400 mb-2 font-medium">
                    📦 求人ボックス向けペルソナ
                    <span className="text-xs text-slate-400 ml-2">訴求力重視・未経験OKなど間口を広げる表現</span>
                  </label>
                  <textarea
                    value={masterData.personaKyujinbox}
                    onChange={(e) => handleMasterChange("personaKyujinbox", e.target.value)}
                    placeholder={`例：
・未経験OK、第二新卒歓迎
・学歴不問
・人と話すのが好きな方
・安定した環境で長く働きたい方`}
                    rows={3}
                    className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
                  />
                </div>
              </div>
            </section>

            {/* 生成ボタン */}
            <div className="flex flex-col items-center gap-4">
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="px-12 py-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-3 shadow-lg shadow-violet-500/25 text-lg"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    生成中...
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    3媒体分を一括生成
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 生成結果（編集可能） */}
        {step === 2 && generatedData && (
          <div className="space-y-6">
            {(["indeed", "kyujinbox", "engage"] as const).map((media) => (
              <section
                key={media}
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden"
              >
                <div className={`bg-gradient-to-r ${mediaConfig[media].color} px-6 py-3`}>
                  <h2 className="text-white font-semibold flex items-center gap-2">
                    <span>{mediaConfig[media].icon}</span>
                    {mediaConfig[media].name}
                  </h2>
                </div>
                <div className="p-6 grid md:grid-cols-2 gap-4">
                  {(Object.keys(fieldLabels) as (keyof MediaData)[]).map((field) => (
                    <div key={field} className={field === "jobDescription" ? "md:col-span-2" : ""}>
                      <label className="block text-sm text-slate-400 mb-1">{fieldLabels[field]}</label>
                      <textarea
                        value={generatedData[media][field]}
                        onChange={(e) => handleMediaDataChange(media, field, e.target.value)}
                        rows={field === "jobDescription" ? 6 : 3}
                        className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                      />
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {/* 保存ボタン */}
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={handleSaveToExtension}
                className="px-12 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-3 shadow-lg shadow-green-500/25 text-lg"
              >
                {savedToExtension ? (
                  <>
                    <span>✅</span>
                    保存完了！
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    保存して拡張機能に送信
                  </>
                )}
              </button>
              
              <div className={`rounded-xl p-4 max-w-xl text-center ${
                extensionInstalled 
                  ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20'
                  : 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20'
              }`}>
                {extensionInstalled ? (
                  <p className="text-slate-300 text-sm">
                    ✅ Chrome拡張が検出されました。保存後、各媒体のページで拡張機能の「自動入力」ボタンを押してください。
                  </p>
                ) : (
                  <p className="text-slate-300 text-sm">
                    ⚠️ Chrome拡張をインストールすると、各媒体のフォームに自動入力できます。
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
