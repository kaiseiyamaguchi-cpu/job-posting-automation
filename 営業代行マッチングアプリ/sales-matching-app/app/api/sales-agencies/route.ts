import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 営業代行一覧取得（検索・フィルター・ページネーション対応）
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // クエリパラメータ取得
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get("keyword") || "";
    const industry = searchParams.get("industry") || "";
    const area = searchParams.get("area") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // クエリ構築
    let query = supabase
      .from("agency_profiles")
      .select("*", { count: "exact" });

    // キーワード検索
    if (keyword) {
      query = query.or(`name.ilike.%${keyword}%,bio.ilike.%${keyword}%`);
    }

    // 業種フィルター（specialties配列内検索）
    if (industry) {
      query = query.contains("specialties", [industry]);
    }

    // エリアフィルター（areas配列内検索）
    if (area) {
      query = query.contains("areas", [area]);
    }

    // ソート
    query = query.order("created_at", { ascending: false });

    // ページネーション
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("営業代行一覧取得エラー:", error);
      return NextResponse.json(
        { error: "営業代行一覧の取得に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      agencies: data,
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

