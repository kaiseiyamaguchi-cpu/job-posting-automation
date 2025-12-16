"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Search,
  FileText,
  MessageSquare,
  User,
  Users,
  ClipboardList,
  MessagesSquare,
  BriefcaseBusiness,
  HandCoins,
} from "lucide-react";
import type { UserRole } from "@/types";

interface SidebarProps {
  userRole: UserRole;
  unreadCount?: number;
  pendingRequestsCount?: number;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export function Sidebar({
  userRole,
  unreadCount = 0,
  pendingRequestsCount = 0,
}: SidebarProps) {
  const pathname = usePathname();

  // ユーザー種別に応じたナビゲーションアイテム
  const getNavItems = (): NavItem[] => {
    if (userRole === "company") {
      return [
        {
          href: "/dashboard",
          label: "ダッシュボード",
          icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
          href: "/job-posts",
          label: "案件募集",
          icon: <BriefcaseBusiness className="h-5 w-5" />,
        },
        {
          href: "/agencies",
          label: "営業代行を探す",
          icon: <Search className="h-5 w-5" />,
        },
        {
          href: "/matching-requests",
          label: "申請一覧",
          icon: <FileText className="h-5 w-5" />,
          badge: pendingRequestsCount,
        },
        {
          href: "/appointments",
          label: "アポ取引",
          icon: <HandCoins className="h-5 w-5" />,
        },
        {
          href: "/messages",
          label: "メッセージ",
          icon: <MessageSquare className="h-5 w-5" />,
          badge: unreadCount,
        },
        {
          href: "/profile",
          label: "プロフィール",
          icon: <User className="h-5 w-5" />,
        },
      ];
    } else if (userRole === "agency") {
      return [
        {
          href: "/dashboard",
          label: "ダッシュボード",
          icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
          href: "/jobs",
          label: "案件一覧",
          icon: <BriefcaseBusiness className="h-5 w-5" />,
        },
        {
          href: "/applications",
          label: "応募一覧",
          icon: <FileText className="h-5 w-5" />,
        },
        {
          href: "/matching-requests",
          label: "申請一覧",
          icon: <FileText className="h-5 w-5" />,
          badge: pendingRequestsCount,
        },
        {
          href: "/appointments",
          label: "アポ取引",
          icon: <HandCoins className="h-5 w-5" />,
        },
        {
          href: "/messages",
          label: "メッセージ",
          icon: <MessageSquare className="h-5 w-5" />,
          badge: unreadCount,
        },
        {
          href: "/profile",
          label: "プロフィール",
          icon: <User className="h-5 w-5" />,
        },
      ];
    } else if (userRole === "admin") {
      return [
        {
          href: "/admin/dashboard",
          label: "ダッシュボード",
          icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
          href: "/admin/money",
          label: "マネー一覧",
          icon: <HandCoins className="h-5 w-5" />,
        },
        {
          href: "/admin/users",
          label: "ユーザー管理",
          icon: <Users className="h-5 w-5" />,
        },
        {
          href: "/admin/matching-requests",
          label: "申請管理",
          icon: <ClipboardList className="h-5 w-5" />,
        },
        {
          href: "/admin/threads",
          label: "スレッド監視",
          icon: <MessagesSquare className="h-5 w-5" />,
        },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  return (
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-slate-700 bg-slate-900">
      <nav className="flex h-full flex-col gap-2 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

