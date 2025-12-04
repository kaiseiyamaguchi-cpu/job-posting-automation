"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequestCard } from "@/components/matching/RequestCard";
import { ApprovalButtons } from "@/components/matching/ApprovalButtons";
import { Card } from "@/components/ui/card";
import type { MatchingRequest, UserRole } from "@/types";

export default function MatchingRequestsPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [requests, setRequests] = useState<MatchingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (userRole) {
      fetchRequests(activeTab);
    }
  }, [activeTab, userRole]);

  const fetchUserRole = async () => {
    try {
      const response = await fetch("/api/auth/session");
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.user?.role || null);
      }
    } catch (error) {
      console.error("ユーザー情報取得エラー:", error);
    }
  };

  const fetchRequests = async (status: string) => {
    setIsLoading(true);
    try {
      const endpoint =
        userRole === "agency"
          ? `/api/matching-requests/received?status=${status}`
          : `/api/matching-requests?status=${status}`;

      const response = await fetch(endpoint);

      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error("申請一覧取得エラー:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproval = async (requestId: string, approved: boolean, reason?: string) => {
    try {
      const response = await fetch(`/api/matching-requests/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: approved ? "approved" : "rejected",
          rejected_reason: reason,
        }),
      });

      if (response.ok) {
        // リストを再取得
        fetchRequests(activeTab);
      } else {
        const data = await response.json();
        alert(data.error || "更新に失敗しました");
      }
    } catch (error) {
      console.error("承認/却下エラー:", error);
      alert("サーバーエラーが発生しました");
    }
  };

  if (!userRole) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-400">読み込み中...</p>
      </div>
    );
  }

  const isCompany = userRole === "company";
  const isAgency = userRole === "agency";

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {isCompany ? "マッチング申請一覧" : "受信した申請"}
        </h1>
        <p className="text-slate-400">
          {isCompany
            ? "営業代行への申請状況を確認できます"
            : "企業からの申請を確認・承認できます"}
        </p>
      </div>

      {/* タブ */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger value="pending">
            {isCompany ? "申請中" : "新着"}
          </TabsTrigger>
          <TabsTrigger value="approved">承認済み</TabsTrigger>
          <TabsTrigger value="rejected">却下済み</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-slate-400">読み込み中...</p>
            </div>
          ) : requests.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700 p-12">
              <div className="text-center">
                <p className="text-slate-400">
                  {isCompany ? "申請中の案件はありません" : "新着申請はありません"}
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id}>
                  <RequestCard request={request} isCompany={isCompany} />
                  {isAgency && request.status === "pending" && (
                    <div className="mt-3">
                      <ApprovalButtons
                        requestId={request.id}
                        onApprove={(reason) => handleApproval(request.id, true)}
                        onReject={(reason) => handleApproval(request.id, false, reason)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-slate-400">読み込み中...</p>
            </div>
          ) : requests.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700 p-12">
              <div className="text-center">
                <p className="text-slate-400">承認済みの案件はありません</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  isCompany={isCompany}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-slate-400">読み込み中...</p>
            </div>
          ) : requests.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700 p-12">
              <div className="text-center">
                <p className="text-slate-400">却下された案件はありません</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  isCompany={isCompany}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ページネーション（TODO） */}
      {total > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          <p className="text-sm text-slate-400">全{total}件</p>
        </div>
      )}
    </div>
  );
}
