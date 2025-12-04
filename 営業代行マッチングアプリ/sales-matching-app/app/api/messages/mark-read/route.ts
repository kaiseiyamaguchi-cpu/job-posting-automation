import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// メッセージ既読マーク
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { thread_id } = body;

    if (!thread_id) {
      return NextResponse.json(
        { error: "thread_idが必要です" },
        { status: 400 }
      );
    }

    // スレッドへのアクセス権限確認
    const { data: thread } = await supabase
      .from("message_threads")
      .select("company_id, agency_id")
      .eq("id", thread_id)
      .single();

    if (!thread || (thread.company_id !== user.id && thread.agency_id !== user.id)) {
      return NextResponse.json(
        { error: "このスレッドにアクセスする権限がありません" },
        { status: 403 }
      );
    }

    // 自分以外が送信したメッセージを既読にする
    const { data, error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("thread_id", thread_id)
      .neq("sender_id", user.id)
      .eq("is_read", false)
      .select();

    if (error) {
      console.error("既読マークエラー:", error);
      return NextResponse.json(
        { error: "既読マークに失敗しました" },
        { status: 500 }
      );
    }

    // 未読カウントをリセット
    const updateField = thread.company_id === user.id 
      ? "company_unread_count" 
      : "agency_unread_count";

    await supabase
      .from("message_threads")
      .update({ [updateField]: 0 })
      .eq("id", thread_id);

    return NextResponse.json({
      success: true,
      updated_count: data?.length || 0,
    });
  } catch (error) {
    console.error("サーバーエラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

