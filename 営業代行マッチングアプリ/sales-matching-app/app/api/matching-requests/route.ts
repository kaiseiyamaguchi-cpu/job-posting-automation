import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// マッチング申請作成（企業側）
export async function POST(request: NextRequest) {
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

    if (profile?.role !== "company") {
      return NextResponse.json(
        { error: "企業アカウントのみ申請を作成できます" },
        { status: 403 }
      );
    }

    // 自分のcompany_profileを取得
    const { data: companyProfile } = await supabase
      .from("company_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!companyProfile) {
      return NextResponse.json(
        { error: "企業プロフィールが見つかりません" },
        { status: 404 }
      );
    }

    // リクエストボディ取得
    const body = await request.json();
    const { agency_id, monthly_budget, request_details, proposal_deadline } = body;

    // バリデーション
    if (!agency_id || !request_details) {
      return NextResponse.json(
        { error: "営業代行IDと依頼内容は必須です" },
        { status: 400 }
      );
    }

    if (request_details.length < 10 || request_details.length > 2000) {
      return NextResponse.json(
        { error: "依頼内容は10文字以上2000文字以内で入力してください" },
        { status: 400 }
      );
    }

    // 重複チェック（company_profiles.idで検索）
    const { data: existing } = await supabase
      .from("matching_requests")
      .select("id")
      .eq("company_id", companyProfile.id)
      .eq("agency_id", agency_id)
      .eq("status", "pending")
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "この営業代行への申請は既に存在します" },
        { status: 400 }
      );
    }

    // 申請作成（company_profiles.idを使用）
    const { data: matchingRequest, error: insertError } = await supabase
      .from("matching_requests")
      .insert({
        company_id: companyProfile.id,
        agency_id,
        monthly_budget,
        request_details,
        proposal_deadline,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("申請作成エラー:", insertError);
      return NextResponse.json(
        { error: "申請の作成に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        request: matchingRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("サーバーエラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

// 自分の申請一覧取得（企業側）
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

    // ユーザー種別取得
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "ユーザー情報が見つかりません" },
        { status: 404 }
      );
    }

    // 企業の場合：自分が作成した申請を取得
    if (profile.role === "company") {
      // 自分のcompany_profileを取得
      const { data: companyProfile } = await supabase
        .from("company_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!companyProfile) {
        return NextResponse.json({
          requests: [],
          total: 0,
          page: 1,
          total_pages: 0,
        });
      }

      // クエリパラメータ取得
      const searchParams = request.nextUrl.searchParams;
      const status = searchParams.get("status");
      const page = parseInt(searchParams.get("page") || "1");
      const limit = 20;

      let query = supabase
        .from("matching_requests")
        .select(`
          *,
          agency_profile:agency_profiles!matching_requests_agency_id_fkey(
            id,
            name,
            specialties,
            areas
          )
        `, { count: "exact" })
        .eq("company_id", companyProfile.id);

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
    }

    return NextResponse.json(
      { error: "この操作を実行する権限がありません" },
      { status: 403 }
    );
  } catch (error) {
    console.error("サーバーエラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

