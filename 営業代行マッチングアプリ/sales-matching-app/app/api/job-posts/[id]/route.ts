import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type JobPostStatus = "draft" | "published" | "closed";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

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

    const { data: jobPost, error } = await supabase
      .from("job_posts")
      .select(
        `
        *,
        company_profile:company_profiles!job_posts_company_id_fkey(
          id,
          company_name
        )
      `
      )
      .eq("id", id)
      .single();

    if (error || !jobPost) {
      return NextResponse.json({ error: "案件が見つかりません" }, { status: 404 });
    }

    if (profile?.role === "company") {
      const { data: companyProfile } = await supabase
        .from("company_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (!companyProfile || companyProfile.id !== jobPost.company_id) {
        return NextResponse.json({ error: "閲覧権限がありません" }, { status: 403 });
      }
    } else if (profile?.role === "agency") {
      // 公開案件のみ閲覧可（応募済みなら closed でも見えるようにする）
      if (jobPost.status !== "published") {
        const { data: agencyProfile } = await supabase
          .from("agency_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();
        if (!agencyProfile) {
          return NextResponse.json({ error: "閲覧権限がありません" }, { status: 403 });
        }
        const { data: existing } = await supabase
          .from("applications")
          .select("id")
          .eq("job_post_id", id)
          .eq("agency_id", agencyProfile.id)
          .maybeSingle();
        if (!existing) {
          return NextResponse.json({ error: "閲覧権限がありません" }, { status: 403 });
        }
      }
    } else if (profile?.role === "admin") {
      // ok
    } else {
      return NextResponse.json({ error: "不明なユーザー種別です" }, { status: 400 });
    }

    return NextResponse.json({ job_post: jobPost });
  } catch (error) {
    console.error("サーバーエラー:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

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

    if (profile?.role !== "company" && profile?.role !== "admin") {
      return NextResponse.json({ error: "更新権限がありません" }, { status: 403 });
    }

    const { data: jobPost } = await supabase
      .from("job_posts")
      .select("id, company_id")
      .eq("id", id)
      .single();

    if (!jobPost) {
      return NextResponse.json({ error: "案件が見つかりません" }, { status: 404 });
    }

    if (profile?.role === "company") {
      const { data: companyProfile } = await supabase
        .from("company_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (!companyProfile || companyProfile.id !== jobPost.company_id) {
        return NextResponse.json({ error: "更新権限がありません" }, { status: 403 });
      }
    }

    const body = await request.json();
    const update: Partial<{
      title: string;
      description: string;
      industry: string | null;
      area: string | null;
      appointment_fee: number;
      status: JobPostStatus;
    }> = {};

    if (typeof body.title === "string") update.title = body.title.trim();
    if (typeof body.description === "string") update.description = body.description.trim();
    if (typeof body.industry === "string") update.industry = body.industry.trim();
    if (body.industry === null) update.industry = null;
    if (typeof body.area === "string") update.area = body.area.trim();
    if (body.area === null) update.area = null;
    if (typeof body.appointment_fee === "number") update.appointment_fee = body.appointment_fee;
    if (body.status && ["draft", "published", "closed"].includes(body.status)) {
      update.status = body.status;
    }

    const { data, error } = await supabase
      .from("job_posts")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("案件更新エラー:", error);
      return NextResponse.json({ error: "案件の更新に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ success: true, job_post: data });
  } catch (error) {
    console.error("サーバーエラー:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

