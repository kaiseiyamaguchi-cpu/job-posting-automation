import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 営業代行プロフィール取得
export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("agency_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      // プロフィールがまだ作成されていない場合は空データを返す
      if (error.code === "PGRST116") {
        return NextResponse.json({
          name: "",
          specialties: [],
          areas: [],
          bio: "",
          phone_number: "",
        });
      }

      console.error("プロフィール取得エラー:", error);
      return NextResponse.json(
        { error: "プロフィールの取得に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("サーバーエラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

// 営業代行プロフィール更新
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    
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

    const body = await request.json();
    const { name, specialties, areas, bio, phone_number } = body;

    // バリデーション
    if (!name || name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { error: "名前は2文字以上100文字以内で入力してください" },
        { status: 400 }
      );
    }

    if (!Array.isArray(specialties) || specialties.length === 0) {
      return NextResponse.json(
        { error: "得意分野を1つ以上選択してください" },
        { status: 400 }
      );
    }

    if (!Array.isArray(areas) || areas.length === 0) {
      return NextResponse.json(
        { error: "対応エリアを1つ以上選択してください" },
        { status: 400 }
      );
    }

    if (bio && bio.length > 2000) {
      return NextResponse.json(
        { error: "自己PRは2000文字以内で入力してください" },
        { status: 400 }
      );
    }

    // 既存のプロフィールがあるか確認
    const { data: existing } = await supabase
      .from("agency_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existing) {
      // 更新
      const { data, error: updateError } = await supabase
        .from("agency_profiles")
        .update({
          name,
          specialties,
          areas,
          bio,
          phone_number,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (updateError) {
        console.error("プロフィール更新エラー:", updateError);
        return NextResponse.json(
          { error: "プロフィールの更新に失敗しました" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, profile: data });
    } else {
      // 新規作成
      const { data, error: insertError } = await supabase
        .from("agency_profiles")
        .insert({
          user_id: user.id,
          name,
          specialties,
          areas,
          bio,
          phone_number,
        })
        .select()
        .single();

      if (insertError) {
        console.error("プロフィール作成エラー:", insertError);
        return NextResponse.json(
          { error: "プロフィールの作成に失敗しました" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, profile: data });
    }
  } catch (error) {
    console.error("サーバーエラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

