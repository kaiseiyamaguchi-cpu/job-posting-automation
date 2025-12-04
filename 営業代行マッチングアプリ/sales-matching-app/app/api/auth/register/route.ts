import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { email, password, role } = body;

    // バリデーション
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "メールアドレス、パスワード、ユーザー種別は必須です" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "パスワードは8文字以上で入力してください" },
        { status: 400 }
      );
    }

    if (!["company", "agency", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "無効なユーザー種別です" },
        { status: 400 }
      );
    }

    // ユーザー登録
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      console.error("サインアップエラー:", signUpError);
      return NextResponse.json(
        { error: signUpError.message || "登録に失敗しました" },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "ユーザーの作成に失敗しました" },
        { status: 500 }
      );
    }

    // usersテーブルにプロフィール作成
    const { error: profileError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        email: authData.user.email!,
        role,
      });

    if (profileError) {
      console.error("プロフィール作成エラー:", profileError);
      return NextResponse.json(
        { 
          error: "ユーザープロフィールの作成に失敗しました。データベースの設定を確認してください。",
          details: profileError.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role,
      },
    });
  } catch (error) {
    console.error("サーバーエラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

