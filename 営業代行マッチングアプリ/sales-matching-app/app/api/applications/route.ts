import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type ApplicationStatus = "applied" | "accepted" | "rejected";

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
    const jobPostId = searchParams.get("job_post_id");
    const status = searchParams.get("status") as ApplicationStatus | null;

    let query = supabase
      .from("applications")
      .select(
        `
        *,
        job_post:job_posts!inner(
          id,
          title,
          company_id,
          appointment_fee,
          status
        ),
        agency_profile:agency_profiles!applications_agency_id_fkey(
          id,
          name
        )
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    if (profile?.role === "agency") {
      const { data: agencyProfile } = await supabase
        .from("agency_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!agencyProfile) {
        return NextResponse.json({ applications: [], total: 0 });
      }
      query = query.eq("agency_id", agencyProfile.id);
    } else if (profile?.role === "company") {
      const { data: companyProfile } = await supabase
        .from("company_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!companyProfile) {
        return NextResponse.json({ applications: [], total: 0 });
      }

      // company: 自社案件の応募のみ
      query = query.eq("job_post.company_id", companyProfile.id);
    } else if (profile?.role === "admin") {
      // ok
    } else {
      return NextResponse.json({ error: "不明なユーザー種別です" }, { status: 400 });
    }

    if (jobPostId) {
      query = query.eq("job_post_id", jobPostId);
    }
    if (status) {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query;
    if (error) {
      console.error("応募一覧取得エラー:", error);
      return NextResponse.json({ error: "応募一覧の取得に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ applications: data || [], total: count || 0 });
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

    if (profile?.role !== "agency") {
      return NextResponse.json({ error: "営業代行アカウントのみ応募できます" }, { status: 403 });
    }

    const { data: agencyProfile } = await supabase
      .from("agency_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!agencyProfile) {
      return NextResponse.json({ error: "営業代行プロフィールが見つかりません" }, { status: 404 });
    }

    const body = await request.json();
    const { job_post_id, pitch, proposed_fee } = body as {
      job_post_id?: string;
      pitch?: string;
      proposed_fee?: number;
    };

    if (!job_post_id || !pitch) {
      return NextResponse.json({ error: "job_post_id と pitch は必須です" }, { status: 400 });
    }

    const { data: jobPost } = await supabase
      .from("job_posts")
      .select("id, status")
      .eq("id", job_post_id)
      .single();

    if (!jobPost) {
      return NextResponse.json({ error: "案件が見つかりません" }, { status: 404 });
    }

    if (jobPost.status !== "published") {
      return NextResponse.json({ error: "公開中の案件にのみ応募できます" }, { status: 400 });
    }

    const insert = {
      job_post_id,
      agency_id: agencyProfile.id,
      pitch: pitch.trim(),
      proposed_fee: typeof proposed_fee === "number" ? proposed_fee : null,
      status: "applied" as const,
    };

    const { data, error } = await supabase
      .from("applications")
      .insert(insert)
      .select()
      .single();

    if (error) {
      console.error("応募作成エラー:", error);
      return NextResponse.json({ error: "応募の作成に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ success: true, application: data }, { status: 201 });
  } catch (error) {
    console.error("サーバーエラー:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

