import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  // 認証チェック
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  // ユーザー情報取得
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
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
