"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Application = {
  id: string;
  status: "applied" | "accepted" | "rejected";
  pitch: string;
  created_at: string;
  job_post?: { id: string; title: string };
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchApps = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/applications");
      const data = await res.json();
      setApplications(data.applications || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const badge = (status: Application["status"]) => {
    if (status === "accepted") return <Badge className="bg-green-600">採用</Badge>;
    if (status === "rejected") return <Badge variant="destructive">却下</Badge>;
    return <Badge variant="secondary">応募中</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">応募一覧</h1>
        <p className="text-slate-400">自分が応募した案件の一覧です。</p>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">応募</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-slate-400">読み込み中...</p>
          ) : applications.length === 0 ? (
            <p className="text-slate-400">まだ応募がありません</p>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="p-4 rounded-lg border border-slate-700 bg-slate-900/40">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-white font-semibold">{app.job_post?.title || "案件"}</div>
                    {badge(app.status)}
                  </div>
                  <div className="text-slate-400 text-sm mt-2 line-clamp-3">{app.pitch}</div>
                  <div className="mt-3">
                    {app.job_post?.id ? (
                      <Link className="text-blue-400 hover:underline text-sm" href={`/jobs/${app.job_post.id}`}>
                        案件を見る
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

