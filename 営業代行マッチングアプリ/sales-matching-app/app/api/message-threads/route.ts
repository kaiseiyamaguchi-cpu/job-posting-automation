import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// メッセージスレッド一覧取得
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

    // 自分が参加しているスレッドを取得
    let query = supabase
      .from("message_threads")
      .select(`
        *,
        company_profile:company_profiles!message_threads_company_id_fkey(
          id,
          company_name
        ),
        agency_profile:agency_profiles!message_threads_agency_id_fkey(
          id,
          name
        )
      `)
      .order("last_message_at", { ascending: false, nullsFirst: false });

    if (profile.role === "company") {
      query = query.eq("company_id", user.id);
    } else if (profile.role === "agency") {
      query = query.eq("agency_id", user.id);
    } else {
      // 管理者の場合は全て
      // query はそのまま
    }

    const { data, error } = await query;

    if (error) {
      console.error("スレッド一覧取得エラー:", error);
      return NextResponse.json(
        { error: "スレッド一覧の取得に失敗しました" },
        { status: 500 }
      );
    }

    // 未読カウントを追加
    const threadsWithUnread = data?.map(thread => ({
      ...thread,
      unread_count: profile.role === "company" 
        ? thread.company_unread_count 
        : thread.agency_unread_count,
    })) || [];

    return NextResponse.json({
      threads: threadsWithUnread,
      total: data?.length || 0,
    });
  } catch (error) {
    console.error("サーバーエラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

