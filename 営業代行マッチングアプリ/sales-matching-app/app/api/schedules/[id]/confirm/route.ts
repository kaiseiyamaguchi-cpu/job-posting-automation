import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
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

    const body = await request.json();
    const { confirmed_time, meeting_url } = body as {
      confirmed_time?: string;
      meeting_url?: string;
    };

    if (!confirmed_time) {
      return NextResponse.json({ error: "confirmed_time が必要です" }, { status: 400 });
    }

    const confirmed = new Date(confirmed_time);
    if (Number.isNaN(confirmed.getTime())) {
      return NextResponse.json({ error: "confirmed_time が不正です" }, { status: 400 });
    }

    // schedule を取得（RLSで権限チェックされる）
    const { data: schedule } = await supabase
      .from("schedule_requests")
      .select("id, appointment_id")
      .eq("id", id)
      .single();

    if (!schedule) {
      return NextResponse.json({ error: "日程調整が見つかりません" }, { status: 404 });
    }

    const { data: updated, error } = await supabase
      .from("schedule_requests")
      .update({
        confirmed_time: confirmed.toISOString(),
        meeting_url: meeting_url?.trim() || null,
        status: "confirmed",
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("日程確定エラー:", error);
      return NextResponse.json({ error: "日程の確定に失敗しました" }, { status: 500 });
    }

    // appointment も更新（scheduled）
    await supabase
      .from("appointments")
      .update({
        scheduled_at: confirmed.toISOString(),
        meeting_url: meeting_url?.trim() || null,
        status: "scheduled",
      })
      .eq("id", schedule.appointment_id);

    return NextResponse.json({ success: true, schedule: updated });
  } catch (error) {
    console.error("サーバーエラー:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

