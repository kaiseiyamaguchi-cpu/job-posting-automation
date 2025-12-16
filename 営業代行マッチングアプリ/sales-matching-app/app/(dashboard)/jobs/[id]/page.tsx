"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

type JobPost = {
  id: string;
  title: string;
  description: string;
  appointment_fee: number;
  company_profile?: { company_name: string };
};

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [job, setJob] = useState<JobPost | null>(null);
  const [pitch, setPitch] = useState("");
  const [proposedFee, setProposedFee] = useState<number | "">("");
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const fetchJob = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/job-posts/${id}`);
      const data = await res.json();
      setJob(data.job_post || null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  const apply = async () => {
    if (!pitch.trim()) return;
    setIsApplying(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_post_id: id,
          pitch,
          proposed_fee: proposedFee === "" ? undefined : proposedFee,
        }),
      });
      if (res.ok) {
        setApplied(true);
      }
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return <p className="text-slate-400">読み込み中...</p>;
  }
  if (!job) {
    return <p className="text-slate-400">案件が見つかりません</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{job.title}</h1>
          <p className="text-slate-400 mt-2 whitespace-pre-wrap">{job.description}</p>
          <p className="text-slate-300 mt-3">
            アポ単価: <span className="font-semibold text-white">¥{job.appointment_fee.toLocaleString("ja-JP")}</span>
          </p>
          {job.company_profile?.company_name ? (
            <p className="text-slate-500 text-sm mt-1">{job.company_profile.company_name}</p>
          ) : null}
        </div>
        <Button asChild variant="outline">
          <Link href="/jobs">一覧へ</Link>
        </Button>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">応募（こんな人を紹介できます）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {applied ? (
            <div className="space-y-2">
              <p className="text-green-400">応募しました。</p>
              <Button asChild>
                <Link href="/applications">応募一覧へ</Link>
              </Button>
            </div>
          ) : (
            <>
              <Textarea
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                placeholder="紹介できる顧客像、業界、決裁者、過去実績など"
                className="bg-slate-900 border-slate-700 text-white"
              />
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={proposedFee}
                  onChange={(e) => setProposedFee(e.target.value ? parseInt(e.target.value, 10) : "")}
                  className="bg-slate-900 border-slate-700 text-white w-48"
                  placeholder="任意"
                />
                <span className="text-slate-400 text-sm">希望単価（円・任意）</span>
              </div>
              <Button onClick={apply} disabled={!pitch.trim() || isApplying}>
                {isApplying ? "応募中..." : "応募する"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

