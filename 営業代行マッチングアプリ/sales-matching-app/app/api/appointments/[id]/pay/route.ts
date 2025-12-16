import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "ユーザー情報が見つかりません" }, { status: 404 });
    }

    if (profile.role !== "company" && profile.role !== "admin") {
      return NextResponse.json({ error: "企業アカウントのみ支払いできます" }, { status: 403 });
    }

    const { data: appointment } = await supabase
      .from("appointments")
      .select("id, appointment_fee, company_id, payment_status")
      .eq("id", id)
      .single();

    if (!appointment) {
      return NextResponse.json({ error: "取引が見つかりません" }, { status: 404 });
    }

    if (profile.role === "company") {
      const { data: companyProfile } = await supabase
        .from("company_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (!companyProfile || companyProfile.id !== appointment.company_id) {
        return NextResponse.json({ error: "支払い権限がありません" }, { status: 403 });
      }
    }

    if (appointment.payment_status === "paid") {
      return NextResponse.json({ success: true, message: "既に支払い済みです" });
    }

    const paidAt = new Date().toISOString();
    const mockPaymentId = `mock_${id}_${Date.now()}`;

    // payments upsert（1取引=1支払い想定）
    const { data: existing } = await supabase
      .from("payments")
      .select("id")
      .eq("appointment_id", id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("payments")
        .update({ status: "paid", mock_payment_id: mockPaymentId, amount: appointment.appointment_fee })
        .eq("id", existing.id);
    } else {
      await supabase.from("payments").insert({
        appointment_id: id,
        amount: appointment.appointment_fee,
        status: "paid",
        mock_payment_id: mockPaymentId,
      });
    }

    const { data: updated, error } = await supabase
      .from("appointments")
      .update({ payment_status: "paid", status: "paid", paid_at: paidAt })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("支払い更新エラー:", error);
      return NextResponse.json({ error: "支払い処理に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ success: true, appointment: updated });
  } catch (error) {
    console.error("サーバーエラー:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

