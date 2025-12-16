import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type JobPostStatus = "draft" | "published" | "closed";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") as JobPostStatus | null;
    const q = searchParams.get("q");

    let query = supabase
      .from("job_posts")
      .select(
        `
        *,
        company_profile:company_profiles!job_posts_company_id_fkey(
          id,
          company_name
        )
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    if (profile?.role === "company") {
      const { data: companyProfile } = await supabase
        .from("company_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!companyProfile) {
        return NextResponse.json({ job_posts: [], total: 0 });
      }

      query = query.eq("company_id", companyProfile.id);
    } else if (profile?.role === "agency") {
      query = query.eq("status", "published");
    } else if (profile?.role === "admin") {
      // admin: no extra filter
    } else {
      return NextResponse.json({ error: "不明なユーザー種別です" }, { status: 400 });
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (q && q.trim()) {
      // title / description の簡易検索
      const keyword = q.trim().replace(/%/g, "\\%");
      query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("案件一覧取得エラー:", error);
      return NextResponse.json({ error: "案件一覧の取得に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ job_posts: data || [], total: count || 0 });
  } catch (error) {
    console.error("サーバーエラー:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "company") {
      return NextResponse.json({ error: "企業アカウントのみ作成できます" }, { status: 403 });
    }

    const { data: companyProfile } = await supabase
      .from("company_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!companyProfile) {
      return NextResponse.json({ error: "企業プロフィールが見つかりません" }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, industry, area, appointment_fee, status } = body as {
      title?: string;
      description?: string;
      industry?: string;
      area?: string;
      appointment_fee?: number;
      status?: JobPostStatus;
    };

    if (!title || !description) {
      return NextResponse.json({ error: "title と description は必須です" }, { status: 400 });
    }

    const insert = {
      company_id: companyProfile.id,
      title: title.trim(),
      description: description.trim(),
      industry: industry?.trim() || null,
      area: area?.trim() || null,
      appointment_fee: typeof appointment_fee === "number" ? appointment_fee : 50000,
      status: status || "draft",
    };

    const { data, error } = await supabase.from("job_posts").insert(insert).select().single();

    if (error) {
      console.error("案件作成エラー:", error);
      return NextResponse.json({ error: "案件の作成に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ success: true, job_post: data }, { status: 201 });
  } catch (error) {
    console.error("サーバーエラー:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

