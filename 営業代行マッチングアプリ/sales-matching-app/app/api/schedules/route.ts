import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const appointmentId = request.nextUrl.searchParams.get("appointment_id");
    if (!appointmentId) {
      return NextResponse.json({ error: "appointment_id が必要です" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("schedule_requests")
      .select("*")
      .eq("appointment_id", appointmentId)
      .maybeSingle();

    if (error) {
      console.error("日程取得エラー:", error);
      return NextResponse.json({ error: "日程の取得に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ schedule: data || null });
  } catch (error) {
    console.error("サーバーエラー:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await request.json();
    const { appointment_id, proposed_times } = body as {
      appointment_id?: string;
      proposed_times?: string[];
    };

    if (!appointment_id || !Array.isArray(proposed_times)) {
      return NextResponse.json(
        { error: "appointment_id と proposed_times（配列）が必要です" },
        { status: 400 }
      );
    }

    const times = proposed_times
      .map((t) => new Date(t))
      .filter((d) => !Number.isNaN(d.getTime()))
      .map((d) => d.toISOString());

    if (times.length === 0) {
      return NextResponse.json({ error: "proposed_times が不正です" }, { status: 400 });
    }

    // 既存があれば更新、なければ作成
    const { data: existing } = await supabase
      .from("schedule_requests")
      .select("id")
      .eq("appointment_id", appointment_id)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from("schedule_requests")
        .update({ proposed_times: times, status: "pending" })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        console.error("日程更新エラー:", error);
        return NextResponse.json({ error: "日程の更新に失敗しました" }, { status: 500 });
      }

      return NextResponse.json({ success: true, schedule: data });
    }

    const { data, error } = await supabase
      .from("schedule_requests")
      .insert({ appointment_id, proposed_times: times, status: "pending" })
      .select()
      .single();

    if (error) {
      console.error("日程作成エラー:", error);
      return NextResponse.json({ error: "日程の作成に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ success: true, schedule: data }, { status: 201 });
  } catch (error) {
    console.error("サーバーエラー:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

