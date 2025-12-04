"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { AgencyProfile } from "@/types";

// マスターデータ
const INDUSTRIES = [
  "全て",
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

const AREAS = [
  "全て",
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

export default function AgenciesPage() {
  const router = useRouter();
  const [agencies, setAgencies] = useState<AgencyProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [industry, setIndustry] = useState("全て");
  const [area, setArea] = useState("全て");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAgencies();
  }, [keyword, industry, area, page]);

  const fetchAgencies = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.append("keyword", keyword);
      if (industry !== "全て") params.append("industry", industry);
      if (area !== "全て") params.append("area", area);
      params.append("page", page.toString());

      const response = await fetch(`/api/sales-agencies?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        setAgencies(data.agencies || []);
        setTotalPages(data.total_pages || 1);
      }
    } catch (error) {
      console.error("営業代行一覧取得エラー:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchAgencies();
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          営業代行を探す
        </h1>
        <p className="text-slate-400">
          条件に合う営業代行を検索できます
        </p>
      </div>

      {/* 検索バー */}
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="キーワードで検索（名前、自己PRなど）"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
              <Search className="h-4 w-4 mr-2" />
              検索
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-slate-200">業種</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200">エリア</Label>
              <Select value={area} onValueChange={setArea}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AREAS.map((ar) => (
                    <SelectItem key={ar} value={ar}>
                      {ar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* 営業代行一覧 */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-slate-400">読み込み中...</p>
        </div>
      ) : agencies.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700 p-12">
          <div className="text-center">
            <p className="text-slate-400">
              条件に一致する営業代行が見つかりませんでした
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agencies.map((agency) => (
              <Card
                key={agency.id}
                className="bg-slate-800/50 border-slate-700 p-6 hover:border-slate-600 transition-colors cursor-pointer"
                onClick={() => router.push(`/agencies/${agency.id}`)}
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {agency.name}
                    </h3>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 mb-2">得意分野</p>
                    <div className="flex flex-wrap gap-1">
                      {agency.specialties.slice(0, 3).map((specialty) => (
                        <Badge
                          key={specialty}
                          variant="outline"
                          className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/50"
                        >
                          {specialty}
                        </Badge>
                      ))}
                      {agency.specialties.length > 3 && (
                        <Badge
                          variant="outline"
                          className="text-xs text-slate-400"
                        >
                          +{agency.specialties.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 mb-2">対応エリア</p>
                    <div className="flex flex-wrap gap-1">
                      {agency.areas.slice(0, 3).map((ar) => (
                        <Badge
                          key={ar}
                          variant="outline"
                          className="text-xs bg-green-500/10 text-green-400 border-green-500/50"
                        >
                          {ar}
                        </Badge>
                      ))}
                      {agency.areas.length > 3 && (
                        <Badge
                          variant="outline"
                          className="text-xs text-slate-400"
                        >
                          +{agency.areas.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {agency.bio && (
                    <p className="text-sm text-slate-300 line-clamp-3">
                      {agency.bio}
                    </p>
                  )}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/agencies/${agency.id}`);
                    }}
                  >
                    詳細を見る
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="text-sm text-slate-400">
                {page} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
