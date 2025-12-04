"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import type { RegisterForm as RegisterFormType } from "@/types";

export function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormType>({
    email: "",
    password: "",
    confirmPassword: "",
    role: "company",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // バリデーション
    if (formData.password.length < 8) {
      setError("パスワードは8文字以上で入力してください");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "登録に失敗しました");
        setIsLoading(false);
        return;
      }

      // 成功 - プロフィール作成ページまたはダッシュボードへ
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("登録エラー:", err);
      setError("サーバーエラーが発生しました");
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-slate-800/50 border-slate-700">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
            <span className="text-2xl">🤝</span>
          </div>
        </div>
        <CardTitle className="text-2xl text-center text-white">
          新規登録
        </CardTitle>
        <CardDescription className="text-center text-slate-400">
          アカウントを作成して始めましょう
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* ユーザー種別 */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-slate-200">
              ユーザー種別 <span className="text-red-400">*</span>
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value: "company" | "agency" | "admin") =>
                setFormData({ ...formData, role: value })
              }
              disabled={isLoading}
            >
              <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="company">企業</SelectItem>
                <SelectItem value="agency">営業代行</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-400">
              {formData.role === "company"
                ? "営業代行を探す企業の方"
                : "営業代行サービスを提供する方"}
            </p>
          </div>

          {/* メールアドレス */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200">
              メールアドレス <span className="text-red-400">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="example@company.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="bg-slate-900 border-slate-700 text-white"
              required
              disabled={isLoading}
            />
          </div>

          {/* パスワード */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-200">
              パスワード <span className="text-red-400">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="8文字以上"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="bg-slate-900 border-slate-700 text-white"
              required
              minLength={8}
              disabled={isLoading}
            />
          </div>

          {/* パスワード確認 */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-200">
              パスワード（確認） <span className="text-red-400">*</span>
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="パスワードを再入力"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="bg-slate-900 border-slate-700 text-white"
              required
              disabled={isLoading}
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? "登録中..." : "登録する"}
          </Button>

          <div className="text-center text-sm text-slate-400">
            すでにアカウントをお持ちの方は
            <Link
              href="/login"
              className="ml-1 text-blue-400 hover:text-blue-300 underline"
            >
              ログイン
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

