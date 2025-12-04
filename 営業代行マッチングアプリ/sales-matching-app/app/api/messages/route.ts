import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// メッセージ一覧取得
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

    // クエリパラメータ取得
    const searchParams = request.nextUrl.searchParams;
    const threadId = searchParams.get("thread_id");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!threadId) {
      return NextResponse.json(
        { error: "thread_idが必要です" },
        { status: 400 }
      );
    }

    // スレッドへのアクセス権限確認
    const { data: thread } = await supabase
      .from("message_threads")
      .select("company_id, agency_id")
      .eq("id", threadId)
      .single();

    if (!thread || (thread.company_id !== user.id && thread.agency_id !== user.id)) {
      return NextResponse.json(
        { error: "このスレッドにアクセスする権限がありません" },
        { status: 403 }
      );
    }

    // メッセージ取得
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("メッセージ取得エラー:", error);
      return NextResponse.json(
        { error: "メッセージの取得に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      messages: data,
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

// メッセージ送信
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

    const body = await request.json();
    const { thread_id, content } = body;

    // バリデーション
    if (!thread_id || !content) {
      return NextResponse.json(
        { error: "thread_idとcontentは必須です" },
        { status: 400 }
      );
    }

    if (content.length < 1 || content.length > 5000) {
      return NextResponse.json(
        { error: "メッセージは1文字以上5000文字以内で入力してください" },
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

    // メッセージ作成
    const { data: message, error: insertError } = await supabase
      .from("messages")
      .insert({
        thread_id,
        sender_id: user.id,
        content,
        is_read: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error("メッセージ作成エラー:", insertError);
      return NextResponse.json(
        { error: "メッセージの送信に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message,
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

