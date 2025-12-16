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

    if (profile.role !== "agency" && profile.role !== "admin") {
      return NextResponse.json({ error: "営業代行アカウントのみ実施報告できます" }, { status: 403 });
    }

    if (profile.role === "agency") {
      const { data: agencyProfile } = await supabase
        .from("agency_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();
      const { data: appointment } = await supabase
        .from("appointments")
        .select("id, agency_id")
        .eq("id", id)
        .single();

      if (!agencyProfile || !appointment || appointment.agency_id !== agencyProfile.id) {
        return NextResponse.json({ error: "実施報告権限がありません" }, { status: 403 });
      }
    }

    const doneAt = new Date().toISOString();
    const { data: updated, error } = await supabase
      .from("appointments")
      .update({ status: "done", done_at: doneAt })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("実施報告エラー:", error);
      return NextResponse.json({ error: "実施報告に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ success: true, appointment: updated });
  } catch (error) {
    console.error("サーバーエラー:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

