"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type JobPost = {
  id: string;
  title: string;
  description: string;
  appointment_fee: number;
  created_at: string;
  company_profile?: { company_name: string };
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [q, setQ] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = async (query?: string) => {
    setIsLoading(true);
    try {
      const url = query?.trim() ? `/api/job-posts?q=${encodeURIComponent(query.trim())}` : "/api/job-posts";
      const res = await fetch(url);
      const data = await res.json();
      setJobs(data.job_posts || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">案件一覧</h1>
        <p className="text-slate-400">公開中の案件に応募できます（デモ用）。</p>
      </div>

      <div className="flex gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="キーワード検索"
          className="bg-slate-900 border-slate-700 text-white"
        />
        <button
          className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => fetchJobs(q)}
        >
          検索
        </button>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">公開案件</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-slate-400">読み込み中...</p>
          ) : jobs.length === 0 ? (
            <p className="text-slate-400">案件がありません</p>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`}>
                  <div className="p-4 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-900/40 cursor-pointer">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-white font-semibold">{job.title}</div>
                      <div className="text-slate-300 text-sm">
                        ¥{job.appointment_fee?.toLocaleString("ja-JP")}
                      </div>
                    </div>
                    <div className="text-slate-400 text-sm mt-1 line-clamp-2">{job.description}</div>
                    {job.company_profile?.company_name ? (
                      <div className="text-slate-500 text-xs mt-2">{job.company_profile.company_name}</div>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

