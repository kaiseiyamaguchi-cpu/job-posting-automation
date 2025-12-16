"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function yen(amount: number) {
  return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(amount || 0);
}

export function MoneyFlow(props: {
  appointmentFee: number;
  platformFeeAmount: number;
  agencyAmount: number;
  paymentStatus: "unpaid" | "paid" | "refunded";
  payoutStatus: "none" | "pending" | "paid" | "reversed";
}) {
  const paymentBadge =
    props.paymentStatus === "paid"
      ? { label: "支払い済み", variant: "default" as const }
      : props.paymentStatus === "refunded"
        ? { label: "返金済み", variant: "destructive" as const }
        : { label: "未払い", variant: "secondary" as const };

  const payoutBadge =
    props.payoutStatus === "paid"
      ? { label: "支払済み", variant: "default" as const }
      : props.payoutStatus === "pending"
        ? { label: "支払予定", variant: "secondary" as const }
        : props.payoutStatus === "reversed"
          ? { label: "取消/相殺", variant: "destructive" as const }
          : { label: "未設定", variant: "secondary" as const };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">お金の流れ（モック）</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <div className="text-slate-200">企業 → 鬼カナ（支払総額）</div>
          <div className="flex items-center gap-2">
            <Badge variant={paymentBadge.variant}>{paymentBadge.label}</Badge>
            <span className="text-white font-semibold">{yen(props.appointmentFee)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-slate-200">鬼カナ取り分（手数料）</div>
          <div className="text-white font-semibold">{yen(props.platformFeeAmount)}</div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-slate-200">鬼カナ → 営業代行（支払予定）</div>
          <div className="flex items-center gap-2">
            <Badge variant={payoutBadge.variant}>{payoutBadge.label}</Badge>
            <span className="text-white font-semibold">{yen(props.agencyAmount)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

