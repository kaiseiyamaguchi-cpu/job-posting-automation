import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type ApplicationStatus = "applied" | "accepted" | "rejected";

function calcMoney(appointmentFee: number, platformFeeRate: number) {
  const platformFeeAmount = Math.round(appointmentFee * platformFeeRate);
  const agencyAmount = appointmentFee - platformFeeAmount;
  return { platformFeeAmount, agencyAmount };
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
      return NextResponse.json({ error: "企業アカウントのみ更新できます" }, { status: 403 });
    }

    const body = await request.json();
    const status = body.status as ApplicationStatus | undefined;

    if (!status || !["accepted", "rejected"].includes(status)) {
      return NextResponse.json({ error: "status は accepted / rejected のみ対応です" }, { status: 400 });
    }

    // 応募 + 案件を取得
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select(
        `
        *,
        job_post:job_posts(
          id,
          company_id,
          appointment_fee
        )
      `
      )
      .eq("id", id)
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: "応募が見つかりません" }, { status: 404 });
    }

    if (profile?.role === "company") {
      const { data: companyProfile } = await supabase
        .from("company_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!companyProfile || companyProfile.id !== application.job_post?.company_id) {
        return NextResponse.json({ error: "更新権限がありません" }, { status: 403 });
      }
    }

    // ステータス更新
    const { data: updated, error: updateError } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("応募更新エラー:", updateError);
      return NextResponse.json({ error: "応募の更新に失敗しました" }, { status: 500 });
    }

    // 採用時: 取引（appointments）を作成（既にあれば再利用）
    let appointment: Record<string, unknown> | null = null;
    if (status === "accepted") {
      const { data: existing } = await supabase
        .from("appointments")
        .select("*")
        .eq("application_id", id)
        .maybeSingle();

      if (existing) {
        appointment = existing as Record<string, unknown>;
      } else {
        const appointmentFee = application.job_post?.appointment_fee ?? 50000;
        const platformFeeRate = 0.2;
        const { platformFeeAmount, agencyAmount } = calcMoney(appointmentFee, platformFeeRate);

        const insert = {
          job_post_id: application.job_post_id,
          application_id: id,
          company_id: application.job_post?.company_id,
          agency_id: application.agency_id,
          appointment_fee: appointmentFee,
          platform_fee_rate: platformFeeRate,
          platform_fee_amount: platformFeeAmount,
          agency_amount: agencyAmount,
          status: "draft",
          payment_status: "unpaid",
          payout_status: "none",
        };

        const { data: created, error: createError } = await supabase
          .from("appointments")
          .insert(insert)
          .select()
          .single();

        if (createError) {
          console.error("取引作成エラー:", createError);
          return NextResponse.json(
            { error: "取引（アポ）の作成に失敗しました", application: updated },
            { status: 500 }
          );
        }

        appointment = created;
      }
    }

    return NextResponse.json({
      success: true,
      application: updated,
      appointment,
    });
  } catch (error) {
    console.error("サーバーエラー:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

