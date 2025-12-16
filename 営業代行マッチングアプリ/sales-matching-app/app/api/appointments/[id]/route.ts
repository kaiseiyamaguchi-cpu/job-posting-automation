import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
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

    const { data: appointment, error } = await supabase
      .from("appointments")
      .select(
        `
        *,
        job_post:job_posts(id,title),
        application:applications(id,pitch,status),
        company_profile:company_profiles!appointments_company_id_fkey(id,company_name),
        agency_profile:agency_profiles!appointments_agency_id_fkey(id,name)
      `
      )
      .eq("id", id)
      .single();

    if (error || !appointment) {
      return NextResponse.json({ error: "取引が見つかりません" }, { status: 404 });
    }

    const { data: schedule } = await supabase
      .from("schedule_requests")
      .select("*")
      .eq("appointment_id", id)
      .maybeSingle();

    const { data: payment } = await supabase
      .from("payments")
      .select("*")
      .eq("appointment_id", id)
      .maybeSingle();

    return NextResponse.json({ appointment, schedule: schedule || null, payment: payment || null });
  } catch (error) {
    console.error("サーバーエラー:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

