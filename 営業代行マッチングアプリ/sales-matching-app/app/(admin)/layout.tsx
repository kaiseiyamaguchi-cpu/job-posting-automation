import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { createClient } from "@/lib/supabase/server";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("users").select("*").eq("id", user?.id).single();

  if (!profile) {
    return <div>ユーザー情報を取得できませんでした</div>;
  }

  if (profile.role !== "admin") {
    return <div>管理者権限が必要です</div>;
  }

  const userData = {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  };

  return <DashboardLayout user={userData}>{children}</DashboardLayout>;
}

