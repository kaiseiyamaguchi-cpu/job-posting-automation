import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: NextRequest) {
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

    let query = supabase
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

    if (profile?.role === "company") {
      const { data: companyProfile } = await supabase
        .from("company_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (!companyProfile) {
        return NextResponse.json({ appointments: [] });
      }
      query = query.eq("company_id", companyProfile.id);
    } else if (profile?.role === "agency") {
      const { data: agencyProfile } = await supabase
        .from("agency_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (!agencyProfile) {
        return NextResponse.json({ appointments: [] });
      }
      query = query.eq("agency_id", agencyProfile.id);
    } else if (profile?.role === "admin") {
      // ok
    } else {
      return NextResponse.json({ error: "不明なユーザー種別です" }, { status: 400 });
    }

    const { data, error } = await query;
    if (error) {
      console.error("取引一覧取得エラー:", error);
      return NextResponse.json({ error: "取引一覧の取得に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ appointments: data || [] });
  } catch (error) {
    console.error("サーバーエラー:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

