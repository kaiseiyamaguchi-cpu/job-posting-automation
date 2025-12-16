import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

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
      return NextResponse.json({ error: "管理者のみアクセスできます" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        *,
        job_post:job_posts(id,title),
        company_profile:company_profiles!appointments_company_id_fkey(id,company_name),
        agency_profile:agency_profiles!appointments_agency_id_fkey(id,name)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("マネー一覧取得エラー:", error);
      return NextResponse.json({ error: "マネー一覧の取得に失敗しました" }, { status: 500 });
    }

    const rows = (data || []) as Array<{
      appointment_fee: number | null;
      platform_fee_amount: number | null;
      agency_amount: number | null;
    }>;

    const totals = rows.reduce(
      (acc, r) => {
        acc.gmv += r.appointment_fee || 0;
        acc.platform_fee += r.platform_fee_amount || 0;
        acc.agency_payable += r.agency_amount || 0;
        return acc;
      },
      { gmv: 0, platform_fee: 0, agency_payable: 0 }
    );

    return NextResponse.json({ appointments: rows, totals });
  } catch (error) {
    console.error("サーバーエラー:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

