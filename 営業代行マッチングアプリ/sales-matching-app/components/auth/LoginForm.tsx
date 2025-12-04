"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import type { LoginForm as LoginFormType } from "@/types";

export function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormType>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "ログインに失敗しました");
        setIsLoading(false);
        return;
      }

      // 成功 - ダッシュボードへリダイレクト
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("ログインエラー:", err);
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
          ログイン
        </CardTitle>
        <CardDescription className="text-center text-slate-400">
          メールアドレスとパスワードを入力してください
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200">
              メールアドレス
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

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-200">
              パスワード
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
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
            {isLoading ? "ログイン中..." : "ログイン"}
          </Button>

          <div className="text-center text-sm text-slate-400">
            アカウントをお持ちでない方は
            <Link
              href="/register"
              className="ml-1 text-blue-400 hover:text-blue-300 underline"
            >
              新規登録
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

