"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import type { User, UserRole } from "@/types";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  useEffect(() => {
    // TODO: 実際のデータ取得APIを実装
    // ダッシュボード統計から未読数・申請数を取得
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats");
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.unread_messages || 0);
          
          if (user.role === "company") {
            setPendingRequestsCount(data.pending_requests || 0);
          } else if (user.role === "agency") {
            setPendingRequestsCount(data.new_requests || 0);
          }
        }
      } catch (error) {
        console.error("統計データの取得に失敗しました:", error);
      }
    };

    fetchStats();

    // 30秒ごとに更新
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, [user.role]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.push("/login");
      }
    } catch (error) {
      console.error("ログアウトに失敗しました:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header user={user} onLogout={handleLogout} />
      
      <div className="flex">
        <Sidebar
          userRole={user.role as UserRole}
          unreadCount={unreadCount}
          pendingRequestsCount={pendingRequestsCount}
        />
        
        <main className="ml-64 w-full p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

