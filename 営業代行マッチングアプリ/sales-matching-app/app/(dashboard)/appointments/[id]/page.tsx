"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MoneyFlow } from "@/components/appointments/MoneyFlow";

type Appointment = {
  id: string;
  status: string;
  payment_status: "unpaid" | "paid" | "refunded";
  payout_status: "none" | "pending" | "paid" | "reversed";
  appointment_fee: number;
  platform_fee_amount: number;
  agency_amount: number;
  scheduled_at: string | null;
  meeting_url: string | null;
  company_profile?: { company_name: string };
  agency_profile?: { name: string };
  job_post?: { title: string };
};

type Schedule = {
  id: string;
  appointment_id: string;
  proposed_times: string[];
  confirmed_time: string | null;
  meeting_url: string | null;
  status: "pending" | "confirmed" | "cancelled";
};

export default function AppointmentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [t1, setT1] = useState("");
  const [t2, setT2] = useState("");
  const [t3, setT3] = useState("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [meetingUrl, setMeetingUrl] = useState("");

  const fetchDetail = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/appointments/${id}`);
      const data = await res.json();
      setAppointment(data.appointment || null);
      setSchedule(data.schedule || null);
      setMeetingUrl(data.schedule?.meeting_url || data.appointment?.meeting_url || "");
      if (data.schedule?.confirmed_time) {
        setSelectedTime(data.schedule.confirmed_time);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const proposeTimes = async () => {
    const proposed: string[] = [];
    for (const v of [t1, t2, t3]) {
      if (!v) continue;
      // datetime-local -> ISO
      const d = new Date(v);
      if (!Number.isNaN(d.getTime())) proposed.push(d.toISOString());
    }
    if (proposed.length === 0) return;

    setIsUpdating(true);
    try {
      await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointment_id: id, proposed_times: proposed }),
      });
      await fetchDetail();
    } finally {
      setIsUpdating(false);
    }
  };

  const confirm = async () => {
    if (!schedule || !selectedTime) return;
    setIsUpdating(true);
    try {
      await fetch(`/api/schedules/${schedule.id}/confirm`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed_time: selectedTime, meeting_url: meetingUrl }),
      });
      await fetchDetail();
    } finally {
      setIsUpdating(false);
    }
  };

  const pay = async () => {
    setIsUpdating(true);
    try {
      await fetch(`/api/appointments/${id}/pay`, { method: "POST" });
      await fetchDetail();
    } finally {
      setIsUpdating(false);
    }
  };

  const complete = async () => {
    setIsUpdating(true);
    try {
      await fetch(`/api/appointments/${id}/complete`, { method: "POST" });
      await fetchDetail();
    } finally {
      setIsUpdating(false);
    }
  };

  const accept = async () => {
    setIsUpdating(true);
    try {
      await fetch(`/api/appointments/${id}/accept`, { method: "POST" });
      await fetchDetail();
    } finally {
      setIsUpdating(false);
    }
  };

  const statusBadge = useMemo(() => {
    if (!appointment) return null;
    const s = appointment.status;
    if (s === "accepted") return <Badge className="bg-green-600">承諾済み</Badge>;
    if (s === "done") return <Badge className="bg-blue-600">実施報告済み</Badge>;
    if (s === "paid") return <Badge className="bg-green-600">支払い済み</Badge>;
    if (s === "scheduled") return <Badge variant="secondary">日程確定</Badge>;
    return <Badge variant="secondary">準備中</Badge>;
  }, [appointment]);

  if (isLoading) return <p className="text-slate-400">読み込み中...</p>;
  if (!appointment) return <p className="text-slate-400">取引が見つかりません</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">{appointment.job_post?.title || "アポ取引"}</h1>
            {statusBadge}
          </div>
          <p className="text-slate-400 mt-2">
            {appointment.company_profile?.company_name || "企業"} × {appointment.agency_profile?.name || "営業代行"}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/appointments">一覧へ</Link>
        </Button>
      </div>

      <MoneyFlow
        appointmentFee={appointment.appointment_fee}
        platformFeeAmount={appointment.platform_fee_amount}
        agencyAmount={appointment.agency_amount}
        paymentStatus={appointment.payment_status}
        payoutStatus={appointment.payout_status}
      />

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">日程調整</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!schedule ? (
            <p className="text-slate-400 text-sm">まだ日程候補がありません。候補を提示してください。</p>
          ) : (
            <>
              <div className="text-slate-300 text-sm">ステータス: {schedule.status}</div>
              {schedule.proposed_times?.length ? (
                <div className="space-y-2">
                  <div className="text-slate-200 text-sm font-semibold">候補日時</div>
                  {schedule.proposed_times.map((t) => (
                    <label key={t} className="flex items-center gap-2 text-slate-200 text-sm">
                      <input
                        type="radio"
                        name="confirmed"
                        value={t}
                        checked={selectedTime === t}
                        onChange={() => setSelectedTime(t)}
                        disabled={schedule.status === "confirmed"}
                      />
                      <span>{new Date(t).toLocaleString("ja-JP")}</span>
                    </label>
                  ))}
                </div>
              ) : null}
            </>
          )}

          <div className="grid gap-3 md:grid-cols-3">
            <Input
              type="datetime-local"
              value={t1}
              onChange={(e) => setT1(e.target.value)}
              className="bg-slate-900 border-slate-700 text-white"
            />
            <Input
              type="datetime-local"
              value={t2}
              onChange={(e) => setT2(e.target.value)}
              className="bg-slate-900 border-slate-700 text-white"
            />
            <Input
              type="datetime-local"
              value={t3}
              onChange={(e) => setT3(e.target.value)}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>
          <Button onClick={proposeTimes} disabled={isUpdating}>
            候補を送る
          </Button>

          <div className="space-y-2">
            <div className="text-slate-200 text-sm font-semibold">会議URL（手動）</div>
            <Input
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder="https://zoom.us/..."
              className="bg-slate-900 border-slate-700 text-white"
            />
            <Button onClick={confirm} disabled={!schedule || !selectedTime || isUpdating}>
              日程を確定
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">状態操作（モック）</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={pay} disabled={isUpdating}>
            支払い（モック）
          </Button>
          <Button onClick={complete} variant="outline" disabled={isUpdating}>
            実施報告（営業代行）
          </Button>
          <Button onClick={accept} variant="outline" disabled={isUpdating}>
            承諾（企業）
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

