"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Appointment = {
  id: string;
  status: string;
  payment_status: string;
  appointment_fee: number;
  platform_fee_amount: number;
  agency_amount: number;
  company_profile?: { company_name: string };
  agency_profile?: { name: string };
  job_post?: { title: string };
};

export default function AdminMoneyPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [totals, setTotals] = useState<{ gmv: number; platform_fee: number; agency_payable: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMoney = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/money");
      const data = await res.json();
      setAppointments(data.appointments || []);
      setTotals(data.totals || null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMoney();
  }, []);

  const yen = (n: number) => `¥${(n || 0).toLocaleString("ja-JP")}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">マネー一覧（オニかな）</h1>
        <p className="text-slate-400">取引ごとの金額（総額/手数料/支払予定）を俯瞰できます（モック）。</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <p className="text-sm text-slate-400">総流通（GMV）</p>
            <CardTitle className="text-2xl text-white">{yen(totals?.gmv || 0)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <p className="text-sm text-slate-400">鬼カナ取り分（合計）</p>
            <CardTitle className="text-2xl text-white">{yen(totals?.platform_fee || 0)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <p className="text-sm text-slate-400">営業代行支払予定（合計）</p>
            <CardTitle className="text-2xl text-white">{yen(totals?.agency_payable || 0)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">取引一覧</CardTitle>
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
                      <Badge variant={a.payment_status === "paid" ? "default" : "secondary"}>
                        {a.payment_status === "paid" ? "支払い済み" : "未払い"}
                      </Badge>
                    </div>
                    <div className="text-slate-300 text-sm mt-2">
                      総額 {yen(a.appointment_fee)} / 手数料 {yen(a.platform_fee_amount)} / 支払予定 {yen(a.agency_amount)}
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

