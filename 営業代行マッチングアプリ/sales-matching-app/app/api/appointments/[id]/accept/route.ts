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
      return NextResponse.json({ error: "企業アカウントのみ承諾できます" }, { status: 403 });
    }

    if (profile.role === "company") {
      const { data: companyProfile } = await supabase
        .from("company_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();
      const { data: appointment } = await supabase
        .from("appointments")
        .select("id, company_id")
        .eq("id", id)
        .single();

      if (!companyProfile || !appointment || appointment.company_id !== companyProfile.id) {
        return NextResponse.json({ error: "承諾権限がありません" }, { status: 403 });
      }
    }

    const acceptedAt = new Date().toISOString();
    const { data: updated, error } = await supabase
      .from("appointments")
      .update({ status: "accepted", accepted_at: acceptedAt, payout_status: "pending" })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("承諾エラー:", error);
      return NextResponse.json({ error: "承諾に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ success: true, appointment: updated });
  } catch (error) {
    console.error("サーバーエラー:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

