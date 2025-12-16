"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Appointment = {
  id: string;
  status: string;
  payment_status: "unpaid" | "paid" | "refunded";
  appointment_fee: number;
  platform_fee_amount: number;
  agency_amount: number;
  created_at: string;
  job_post?: { title: string };
  company_profile?: { company_name: string };
  agency_profile?: { name: string };
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      setAppointments(data.appointments || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const paymentBadge = (status: Appointment["payment_status"]) => {
    if (status === "paid") return <Badge className="bg-green-600">支払い済み</Badge>;
    if (status === "refunded") return <Badge variant="destructive">返金済み</Badge>;
    return <Badge variant="secondary">未払い</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">アポ取引一覧</h1>
        <p className="text-slate-400">日程・支払い（モック）・承諾までの進捗を確認できます。</p>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">取引</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-slate-400">読み込み中...</p>
          ) : appointments.length === 0 ? (
            <p className="text-slate-400">取引がありません</p>
          ) : (
            <div className="space-y-3">
              {appointments.map((a) => (
                <Link key={a.id} href={`/appointments/${a.id}`}>
                  <div className="p-4 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-900/40 cursor-pointer">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-white font-semibold">
                        {a.job_post?.title || "アポ取引"}{" "}
                        <span className="text-slate-400 text-sm font-normal">
                          （{a.company_profile?.company_name || "企業"} × {a.agency_profile?.name || "営業代行"}）
                        </span>
                      </div>
                      {paymentBadge(a.payment_status)}
                    </div>
                    <div className="text-slate-300 text-sm mt-2">
                      総額: ¥{a.appointment_fee.toLocaleString("ja-JP")} / 取り分: ¥{a.platform_fee_amount.toLocaleString("ja-JP")} /
                      支払予定: ¥{a.agency_amount.toLocaleString("ja-JP")}
                    </div>
                    <div className="text-slate-500 text-xs mt-2">status: {a.status}</div>
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

