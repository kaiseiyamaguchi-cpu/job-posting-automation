import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 受信した申請一覧取得（営業代行側）
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // ユーザー種別チェック
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "agency") {
      return NextResponse.json(
        { error: "営業代行アカウントのみアクセスできます" },
        { status: 403 }
      );
    }

    // 自分のagency_profileを取得
    const { data: agencyProfile } = await supabase
      .from("agency_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!agencyProfile) {
      return NextResponse.json(
        { error: "営業代行プロフィールが見つかりません" },
        { status: 404 }
      );
    }

    // クエリパラメータ取得
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;

    // 自分宛の申請を取得（agency_profiles.idで検索）
    let query = supabase
      .from("matching_requests")
      .select(`
        *,
        company_profile:company_profiles!matching_requests_company_id_fkey(
          id,
          company_name,
          industry,
          area
        )
      `, { count: "exact" })
      .eq("agency_id", agencyProfile.id);

    if (status) {
      query = query.eq("status", status);
    }

    query = query.order("created_at", { ascending: false });

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("申請取得エラー:", error);
      return NextResponse.json(
        { error: "申請一覧の取得に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      requests: data,
      total: count,
      page,
      total_pages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("サーバーエラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

