import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
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

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "管理者のみ実行できます" }, { status: 403 });
    }

    const body = (await request.json()) as Record<string, unknown>;

    // 最低限の防御: 触って良いフィールドのみ許可
    const allowed = [
      "status",
      "payment_status",
      "payout_status",
      "scheduled_at",
      "meeting_url",
      "paid_at",
      "done_at",
      "accepted_at",
    ];

    const sanitized: Record<string, unknown> = {};
    for (const k of allowed) {
      if (k in body) sanitized[k] = body[k];
    }

    const { data, error } = await supabase
      .from("appointments")
      .update(sanitized)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("強制更新エラー:", error);
      return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ success: true, appointment: data });
  } catch (error) {
    console.error("サーバーエラー:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

