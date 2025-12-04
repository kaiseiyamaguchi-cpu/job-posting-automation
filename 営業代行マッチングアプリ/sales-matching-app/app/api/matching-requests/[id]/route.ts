import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 申請承認/却下（営業代行側）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
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
        { error: "営業代行アカウントのみ更新できます" },
        { status: 403 }
      );
    }

    // リクエストボディ取得
    const body = await request.json();
    const { status, rejected_reason } = body;

    // バリデーション
    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "ステータスは approved または rejected である必要があります" },
        { status: 400 }
      );
    }

    if (status === "rejected" && !rejected_reason) {
      return NextResponse.json(
        { error: "却下する場合は理由を入力してください" },
        { status: 400 }
      );
    }

    // 申請が自分宛か確認
    const { data: matchingRequest } = await supabase
      .from("matching_requests")
      .select("*")
      .eq("id", id)
      .eq("agency_id", user.id)
      .single();

    if (!matchingRequest) {
      return NextResponse.json(
        { error: "申請が見つからないか、アクセス権限がありません" },
        { status: 404 }
      );
    }

    // ステータス更新
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === "rejected" && rejected_reason) {
      updateData.rejected_reason = rejected_reason;
    }

    const { data: updatedRequest, error: updateError } = await supabase
      .from("matching_requests")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("申請更新エラー:", updateError);
      return NextResponse.json(
        { error: "申請の更新に失敗しました" },
        { status: 500 }
      );
    }

    // 承認の場合、メッセージスレッドが自動作成される（トリガーによる）
    let threadCreated = false;
    if (status === "approved") {
      // スレッド作成を少し待つ（トリガー実行待ち）
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // スレッドが作成されたか確認
      const { data: thread } = await supabase
        .from("message_threads")
        .select("id")
        .eq("company_id", matchingRequest.company_id)
        .eq("agency_id", matchingRequest.agency_id)
        .single();

      threadCreated = !!thread;
    }

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      thread_created: threadCreated,
    });
  } catch (error) {
    console.error("サーバーエラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

