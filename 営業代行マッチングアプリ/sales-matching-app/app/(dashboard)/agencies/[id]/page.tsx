"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RequestModal } from "@/components/matching/RequestModal";
import { ArrowLeft, MapPin, Briefcase, Phone } from "lucide-react";
import type { AgencyProfile } from "@/types";

interface AgencyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AgencyDetailPage({ params }: AgencyDetailPageProps) {
  const router = useRouter();
  const [agency, setAgency] = useState<AgencyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [agencyId, setAgencyId] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      const resolvedParams = await params;
      setAgencyId(resolvedParams.id);
      fetchAgency(resolvedParams.id);
    };
    fetchData();
  }, [params]);

  const fetchAgency = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/sales-agencies/${id}`);

      if (response.ok) {
        const data = await response.json();
        setAgency(data);
      } else {
        console.error("営業代行が見つかりません");
      }
    } catch (error) {
      console.error("営業代行詳細取得エラー:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-400">読み込み中...</p>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-slate-400">営業代行が見つかりませんでした</p>
        <Button variant="outline" onClick={() => router.push("/agencies")}>
          一覧に戻る
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 戻るボタン */}
      <Button
        variant="ghost"
        onClick={() => router.push("/agencies")}
        className="text-slate-400 hover:text-white"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        一覧に戻る
      </Button>

      {/* メインカード */}
      <Card className="bg-slate-800/50 border-slate-700 p-8">
        <div className="space-y-6">
          {/* 名前 */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{agency.name}</h1>
            {agency.phone_number && (
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="h-4 w-4" />
                <span>{agency.phone_number}</span>
              </div>
            )}
          </div>

          {/* 得意分野 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="h-5 w-5 text-slate-400" />
              <h2 className="text-lg font-semibold text-white">得意分野</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {agency.specialties.map((specialty) => (
                <Badge
                  key={specialty}
                  variant="outline"
                  className="bg-blue-500/10 text-blue-400 border-blue-500/50"
                >
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>

          {/* 対応エリア */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-slate-400" />
              <h2 className="text-lg font-semibold text-white">対応エリア</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {agency.areas.map((area) => (
                <Badge
                  key={area}
                  variant="outline"
                  className="bg-green-500/10 text-green-400 border-green-500/50"
                >
                  {area}
                </Badge>
              ))}
            </div>
          </div>

          {/* 自己PR */}
          {agency.bio && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">自己PR</h2>
              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {agency.bio}
                </p>
              </div>
            </div>
          )}

          {/* マッチング申請ボタン */}
          <div className="pt-4">
            <Button
              onClick={() => setShowRequestModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
            >
              マッチング申請を送る
            </Button>
          </div>
        </div>
      </Card>

      {/* マッチング申請モーダル */}
      {agency && (
        <RequestModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          agencyName={agency.name}
          agencyId={agencyId}
          onSubmit={async (formData) => {
            try {
              const response = await fetch('/api/matching-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...formData,
                  agency_id: agencyId,
                }),
              });

              if (response.ok) {
                alert('マッチング申請を送信しました');
                router.push('/matching-requests');
              } else {
                const data = await response.json();
                alert(data.error || '申請に失敗しました');
              }
            } catch (error) {
              console.error('申請エラー:', error);
              alert('サーバーエラーが発生しました');
            }
          }}
        />
      )}
    </div>
  );
}
