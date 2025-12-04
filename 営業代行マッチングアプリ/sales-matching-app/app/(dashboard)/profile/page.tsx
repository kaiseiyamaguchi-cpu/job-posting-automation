"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { UserRole, CompanyProfileForm, AgencyProfileForm } from "@/types";

// 業種マスター
const INDUSTRIES = [
  "IT・通信",
  "製造業",
  "商社",
  "金融・保険",
  "不動産",
  "小売・卸売",
  "飲食・宿泊",
  "医療・福祉",
  "教育",
  "コンサルティング",
  "その他",
];

// エリアマスター
const AREAS = [
  "北海道",
  "東北",
  "関東",
  "中部",
  "関西",
  "中国",
  "四国",
  "九州・沖縄",
  "全国対応",
  "オンラインのみ",
];

// 得意分野マスター
const SPECIALTIES = [
  "新規開拓営業",
  "ルート営業",
  "インサイドセールス",
  "フィールドセールス",
  "カスタマーサクセス",
  "テレアポ",
  "提案営業",
  "技術営業",
  "代理店営業",
  "BtoB営業",
  "BtoC営業",
];

export default function ProfilePage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // 企業プロフィール
  const [companyProfile, setCompanyProfile] = useState<CompanyProfileForm>({
    company_name: "",
    industry: "",
    area: "",
    request_content: "",
    contact_person: "",
    phone_number: "",
  });

  // 営業代行プロフィール
  const [agencyProfile, setAgencyProfile] = useState<AgencyProfileForm>({
    name: "",
    specialties: [],
    areas: [],
    bio: "",
    phone_number: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // ユーザー情報取得
      const sessionResponse = await fetch("/api/auth/session");
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        const role = sessionData.user?.role;
        setUserRole(role);

        // プロフィール取得
        if (role === "company") {
          const profileResponse = await fetch("/api/profile/company");
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setCompanyProfile(profileData);
          }
        } else if (role === "agency") {
          const profileResponse = await fetch("/api/profile/agency");
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setAgencyProfile(profileData);
          }
        }
      }
    } catch (error) {
      console.error("プロフィール取得エラー:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const endpoint =
        userRole === "company"
          ? "/api/profile/company"
          : "/api/profile/agency";

      const body =
        userRole === "company" ? companyProfile : agencyProfile;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "保存に失敗しました");
      } else {
        setMessage("プロフィールを保存しました");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error("保存エラー:", err);
      setError("サーバーエラーが発生しました");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSpecialty = (specialty: string) => {
    setAgencyProfile((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }));
  };

  const toggleArea = (area: string) => {
    setAgencyProfile((prev) => ({
      ...prev,
      areas: prev.areas.includes(area)
        ? prev.areas.filter((a) => a !== area)
        : [...prev.areas, area],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-400">読み込み中...</p>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-400">ユーザー情報を取得できませんでした</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* ヘッダー */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {userRole === "company" ? "企業プロフィール" : "営業代行プロフィール"}
        </h1>
        <p className="text-slate-400">
          プロフィール情報を入力・編集できます
        </p>
      </div>

      {/* メッセージ */}
      {message && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/50 p-3">
          <p className="text-sm text-green-400">{message}</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* 企業プロフィールフォーム */}
      {userRole === "company" && (
        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="company_name" className="text-slate-200">
                会社名 <span className="text-red-400">*</span>
              </Label>
              <Input
                id="company_name"
                value={companyProfile.company_name}
                onChange={(e) =>
                  setCompanyProfile({
                    ...companyProfile,
                    company_name: e.target.value,
                  })
                }
                className="bg-slate-900 border-slate-700 text-white"
                placeholder="株式会社〇〇"
                required
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="industry" className="text-slate-200">
                  業種
                </Label>
                <Select
                  value={companyProfile.industry}
                  onValueChange={(value) =>
                    setCompanyProfile({ ...companyProfile, industry: value })
                  }
                >
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="area" className="text-slate-200">
                  エリア
                </Label>
                <Select
                  value={companyProfile.area}
                  onValueChange={(value) =>
                    setCompanyProfile({ ...companyProfile, area: value })
                  }
                >
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {AREAS.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="request_content" className="text-slate-200">
                依頼内容
              </Label>
              <Textarea
                id="request_content"
                value={companyProfile.request_content}
                onChange={(e) =>
                  setCompanyProfile({
                    ...companyProfile,
                    request_content: e.target.value,
                  })
                }
                className="bg-slate-900 border-slate-700 text-white resize-none"
                placeholder="営業代行に依頼したい内容を記入してください"
                rows={5}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact_person" className="text-slate-200">
                  担当者名 <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="contact_person"
                  value={companyProfile.contact_person}
                  onChange={(e) =>
                    setCompanyProfile({
                      ...companyProfile,
                      contact_person: e.target.value,
                    })
                  }
                  className="bg-slate-900 border-slate-700 text-white"
                  placeholder="山田太郎"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number" className="text-slate-200">
                  電話番号
                </Label>
                <Input
                  id="phone_number"
                  type="tel"
                  value={companyProfile.phone_number}
                  onChange={(e) =>
                    setCompanyProfile({
                      ...companyProfile,
                      phone_number: e.target.value,
                    })
                  }
                  className="bg-slate-900 border-slate-700 text-white"
                  placeholder="090-1234-5678"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 営業代行プロフィールフォーム */}
      {userRole === "agency" && (
        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-200">
                名前 <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                value={agencyProfile.name}
                onChange={(e) =>
                  setAgencyProfile({ ...agencyProfile, name: e.target.value })
                }
                className="bg-slate-900 border-slate-700 text-white"
                placeholder="山田太郎"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200">
                得意分野 <span className="text-red-400">*</span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {agencyProfile.specialties.map((specialty) => (
                  <Badge
                    key={specialty}
                    variant="outline"
                    className="bg-blue-500/10 text-blue-400 border-blue-500/50 cursor-pointer"
                    onClick={() => toggleSpecialty(specialty)}
                  >
                    {specialty}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
              <Select onValueChange={toggleSpecialty}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue placeholder="追加する分野を選択" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTIES.filter(
                    (s) => !agencyProfile.specialties.includes(s)
                  ).map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200">
                対応エリア <span className="text-red-400">*</span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {agencyProfile.areas.map((area) => (
                  <Badge
                    key={area}
                    variant="outline"
                    className="bg-green-500/10 text-green-400 border-green-500/50 cursor-pointer"
                    onClick={() => toggleArea(area)}
                  >
                    {area}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
              <Select onValueChange={toggleArea}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue placeholder="追加するエリアを選択" />
                </SelectTrigger>
                <SelectContent>
                  {AREAS.filter((a) => !agencyProfile.areas.includes(a)).map(
                    (area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-slate-200">
                自己PR
              </Label>
              <Textarea
                id="bio"
                value={agencyProfile.bio}
                onChange={(e) =>
                  setAgencyProfile({ ...agencyProfile, bio: e.target.value })
                }
                className="bg-slate-900 border-slate-700 text-white resize-none"
                placeholder="営業経験や得意な業界、強みなどを記入してください"
                rows={6}
              />
              <p className="text-xs text-slate-400">
                {agencyProfile.bio?.length || 0}/2000文字
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number_agency" className="text-slate-200">
                電話番号
              </Label>
              <Input
                id="phone_number_agency"
                type="tel"
                value={agencyProfile.phone_number}
                onChange={(e) =>
                  setAgencyProfile({
                    ...agencyProfile,
                    phone_number: e.target.value,
                  })
                }
                className="bg-slate-900 border-slate-700 text-white"
                placeholder="090-1234-5678"
              />
            </div>
          </div>
        </Card>
      )}

      {/* 保存ボタン */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 bg-blue-600 hover:bg-blue-700"
        >
          {isSaving ? "保存中..." : "保存する"}
        </Button>
      </div>
    </div>
  );
}
