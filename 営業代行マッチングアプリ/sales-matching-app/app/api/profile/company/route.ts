import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 企業プロフィール取得
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
      .from("company_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      // プロフィールがまだ作成されていない場合は空データを返す
      if (error.code === "PGRST116") {
        return NextResponse.json({
          company_name: "",
          industry: "",
          area: "",
          request_content: "",
          contact_person: "",
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

// 企業プロフィール更新
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

    if (profile?.role !== "company") {
      return NextResponse.json(
        { error: "企業アカウントのみ更新できます" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { company_name, industry, area, request_content, contact_person, phone_number } = body;

    // バリデーション
    if (!company_name || company_name.length < 2 || company_name.length > 200) {
      return NextResponse.json(
        { error: "会社名は2文字以上200文字以内で入力してください" },
        { status: 400 }
      );
    }

    if (!contact_person || contact_person.length < 2 || contact_person.length > 100) {
      return NextResponse.json(
        { error: "担当者名は2文字以上100文字以内で入力してください" },
        { status: 400 }
      );
    }

    // 既存のプロフィールがあるか確認
    const { data: existing } = await supabase
      .from("company_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existing) {
      // 更新
      const { data, error: updateError } = await supabase
        .from("company_profiles")
        .update({
          company_name,
          industry,
          area,
          request_content,
          contact_person,
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
        .from("company_profiles")
        .insert({
          user_id: user.id,
          company_name,
          industry,
          area,
          request_content,
          contact_person,
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

