"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type JobPost = {
  id: string;
  title: string;
  description: string;
  status: "draft" | "published" | "closed";
  appointment_fee: number;
  created_at: string;
};

export default function JobPostsPage() {
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [appointmentFee, setAppointmentFee] = useState<number>(50000);
  const [isCreating, setIsCreating] = useState(false);

  const fetchJobPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/job-posts");
      const data = await res.json();
      setJobPosts(data.job_posts || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobPosts();
  }, []);

  const createJobPost = async () => {
    if (!title.trim() || !description.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/job-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          appointment_fee: appointmentFee,
          status: "draft",
        }),
      });
      if (res.ok) {
        setTitle("");
        setDescription("");
        await fetchJobPosts();
      }
    } finally {
      setIsCreating(false);
    }
  };

  const statusBadge = (status: JobPost["status"]) => {
    if (status === "published") return <Badge className="bg-green-600">公開中</Badge>;
    if (status === "closed") return <Badge variant="destructive">終了</Badge>;
    return <Badge variant="secondary">下書き</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">案件募集</h1>
        <p className="text-slate-400">案件を作成して、営業代行からの応募を受け付けます（デモ用）。</p>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">新規案件作成</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="案件タイトル"
            className="bg-slate-900 border-slate-700 text-white"
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="案件内容（どんなアポが欲しいか等）"
            className="bg-slate-900 border-slate-700 text-white"
          />
          <div className="flex items-center gap-3">
            <Input
              type="number"
              value={appointmentFee}
              onChange={(e) => setAppointmentFee(parseInt(e.target.value || "50000", 10))}
              className="bg-slate-900 border-slate-700 text-white w-48"
            />
            <span className="text-slate-400 text-sm">アポ単価（円）</span>
          </div>
          <Button onClick={createJobPost} disabled={isCreating || !title.trim() || !description.trim()}>
            {isCreating ? "作成中..." : "下書きで作成"}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">自社の案件一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-slate-400">読み込み中...</p>
          ) : jobPosts.length === 0 ? (
            <p className="text-slate-400">まだ案件がありません</p>
          ) : (
            <div className="space-y-3">
              {jobPosts.map((jp) => (
                <Link key={jp.id} href={`/job-posts/${jp.id}`}>
                  <div className="p-4 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-900/40 cursor-pointer">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-white font-semibold">{jp.title}</div>
                      {statusBadge(jp.status)}
                    </div>
                    <div className="text-slate-400 text-sm mt-1 line-clamp-2">{jp.description}</div>
                    <div className="text-slate-300 text-sm mt-2">
                      アポ単価: ¥{jp.appointment_fee?.toLocaleString("ja-JP")}
                    </div>
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

