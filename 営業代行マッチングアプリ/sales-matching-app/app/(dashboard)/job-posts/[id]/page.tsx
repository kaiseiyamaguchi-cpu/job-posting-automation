"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type JobPost = {
  id: string;
  title: string;
  description: string;
  status: "draft" | "published" | "closed";
  appointment_fee: number;
};

type Application = {
  id: string;
  pitch: string;
  proposed_fee: number | null;
  status: "applied" | "accepted" | "rejected";
  created_at: string;
  agency_profile?: { id: string; name: string };
};

export default function JobPostDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [jobPost, setJobPost] = useState<JobPost | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/job-posts/${id}`);
      const data = await res.json();
      setJobPost(data.job_post || null);

      const appsRes = await fetch(`/api/applications?job_post_id=${id}`);
      const appsData = await appsRes.json();
      setApplications(appsData.applications || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [id]);

  const badge = useMemo(() => {
    if (!jobPost) return null;
    if (jobPost.status === "published") return <Badge className="bg-green-600">公開中</Badge>;
    if (jobPost.status === "closed") return <Badge variant="destructive">終了</Badge>;
    return <Badge variant="secondary">下書き</Badge>;
  }, [jobPost]);

  const publish = async () => {
    if (!jobPost) return;
    setIsUpdating(true);
    try {
      await fetch(`/api/job-posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      });
      await fetchAll();
    } finally {
      setIsUpdating(false);
    }
  };

  const close = async () => {
    if (!jobPost) return;
    setIsUpdating(true);
    try {
      await fetch(`/api/job-posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      });
      await fetchAll();
    } finally {
      setIsUpdating(false);
    }
  };

  const updateApplication = async (applicationId: string, status: "accepted" | "rejected") => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      await fetchAll();
      if (status === "accepted" && data.appointment?.id) {
        router.push(`/appointments/${data.appointment.id}`);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <p className="text-slate-400">読み込み中...</p>;
  }

  if (!jobPost) {
    return <p className="text-slate-400">案件が見つかりません</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">{jobPost.title}</h1>
            {badge}
          </div>
          <p className="text-slate-400 mt-2 whitespace-pre-wrap">{jobPost.description}</p>
          <p className="text-slate-300 mt-3">
            アポ単価: <span className="font-semibold text-white">¥{jobPost.appointment_fee.toLocaleString("ja-JP")}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/job-posts">一覧へ</Link>
          </Button>
          {jobPost.status === "draft" && (
            <Button onClick={publish} disabled={isUpdating}>
              公開する
            </Button>
          )}
          {jobPost.status === "published" && (
            <Button onClick={close} variant="outline" disabled={isUpdating}>
              募集を終了
            </Button>
          )}
        </div>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">応募一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <p className="text-slate-400">まだ応募がありません</p>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="p-4 rounded-lg border border-slate-700 bg-slate-900/40">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-white font-semibold">
                      {app.agency_profile?.name || "営業代行"}
                    </div>
                    <Badge variant={app.status === "accepted" ? "default" : app.status === "rejected" ? "destructive" : "secondary"}>
                      {app.status === "accepted" ? "採用" : app.status === "rejected" ? "却下" : "応募中"}
                    </Badge>
                  </div>
                  <p className="text-slate-300 text-sm mt-2 whitespace-pre-wrap">{app.pitch}</p>
                  {app.proposed_fee ? (
                    <p className="text-slate-400 text-sm mt-2">希望単価: ¥{app.proposed_fee.toLocaleString("ja-JP")}</p>
                  ) : null}
                  {app.status === "applied" && (
                    <div className="flex gap-2 mt-3">
                      <Button onClick={() => updateApplication(app.id, "accepted")} disabled={isUpdating}>
                        採用してアポ作成
                      </Button>
                      <Button onClick={() => updateApplication(app.id, "rejected")} variant="outline" disabled={isUpdating}>
                        却下
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

