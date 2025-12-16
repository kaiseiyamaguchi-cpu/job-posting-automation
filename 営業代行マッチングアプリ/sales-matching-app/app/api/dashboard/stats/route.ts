import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ダッシュボード統計取得
export async function GET() {
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

    // 企業向け統計
    if (profile.role === "company") {
      // 自分のcompany_profileを取得
      const { data: companyProfile } = await supabase
        .from("company_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!companyProfile) {
        return NextResponse.json({
          pending_requests: 0,
          approved_requests: 0,
          active_threads: 0,
          unread_messages: 0,
        });
      }

      // 申請中の件数（company_profiles.idで検索）
      const { count: pendingCount } = await supabase
        .from("matching_requests")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyProfile.id)
        .eq("status", "pending");

      // 承認済みの件数
      const { count: approvedCount } = await supabase
        .from("matching_requests")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyProfile.id)
        .eq("status", "approved");

      // アクティブスレッド数（message_threads.company_idはusers.idを参照）
      const { count: activeThreadsCount } = await supabase
        .from("message_threads")
        .select("*", { count: "exact", head: true })
        .eq("company_id", user.id);

      // 未読メッセージ数（合計）
      const { data: threads } = await supabase
        .from("message_threads")
        .select("company_unread_count")
        .eq("company_id", user.id);

      const unreadMessages = threads?.reduce(
        (sum, thread) => sum + (thread.company_unread_count || 0),
        0
      ) || 0;

      return NextResponse.json({
        pending_requests: pendingCount || 0,
        approved_requests: approvedCount || 0,
        active_threads: activeThreadsCount || 0,
        unread_messages: unreadMessages,
      });
    }

    // 営業代行向け統計
    if (profile.role === "agency") {
      // 自分のagency_profileを取得
      const { data: agencyProfile } = await supabase
        .from("agency_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!agencyProfile) {
        return NextResponse.json({
          new_requests: 0,
          active_companies: 0,
          active_threads: 0,
          unread_messages: 0,
        });
      }

      // 新着申請数（agency_profiles.idで検索）
      const { count: newRequestsCount } = await supabase
        .from("matching_requests")
        .select("*", { count: "exact", head: true })
        .eq("agency_id", agencyProfile.id)
        .eq("status", "pending");

      // 対応中企業数（承認済みの申請数）
      const { count: activeCompaniesCount } = await supabase
        .from("matching_requests")
        .select("*", { count: "exact", head: true })
        .eq("agency_id", agencyProfile.id)
        .eq("status", "approved");

      // アクティブスレッド数（message_threads.agency_idはusers.idを参照）
      const { count: activeThreadsCount } = await supabase
        .from("message_threads")
        .select("*", { count: "exact", head: true })
        .eq("agency_id", user.id);

      // 未読メッセージ数（合計）
      const { data: threads } = await supabase
        .from("message_threads")
        .select("agency_unread_count")
        .eq("agency_id", user.id);

      const unreadMessages = threads?.reduce(
        (sum, thread) => sum + (thread.agency_unread_count || 0),
        0
      ) || 0;

      return NextResponse.json({
        new_requests: newRequestsCount || 0,
        active_companies: activeCompaniesCount || 0,
        active_threads: activeThreadsCount || 0,
        unread_messages: unreadMessages,
      });
    }

    // 管理者向け統計（TODO: 実装）
    if (profile.role === "admin") {
      return NextResponse.json({
        total_users: 0,
        total_companies: 0,
        total_agencies: 0,
        total_requests: 0,
        approval_rate: 0,
        active_threads: 0,
      });
    }

    return NextResponse.json(
      { error: "不明なユーザー種別です" },
      { status: 400 }
    );
  } catch (error) {
    console.error("サーバーエラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

