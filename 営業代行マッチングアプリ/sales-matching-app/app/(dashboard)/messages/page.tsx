"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Search } from "lucide-react";
import type { MessageThread, Message, UserRole } from "@/types";

export default function MessagesPage() {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchUserAndThreads();
  }, []);

  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread.id);
      markAsRead(selectedThread.id);
    }
  }, [selectedThread]);

  const fetchUserAndThreads = async () => {
    try {
      // ユーザー情報取得
      const sessionResponse = await fetch("/api/auth/session");
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        setUserRole(sessionData.user?.role || null);
        setUserId(sessionData.user?.id || "");
      }

      // スレッド一覧取得
      const threadsResponse = await fetch("/api/message-threads");
      if (threadsResponse.ok) {
        const threadsData = await threadsResponse.json();
        setThreads(threadsData.threads || []);
      }
    } catch (error) {
      console.error("データ取得エラー:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (threadId: string) => {
    try {
      const response = await fetch(`/api/messages?thread_id=${threadId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("メッセージ取得エラー:", error);
    }
  };

  const markAsRead = async (threadId: string) => {
    try {
      await fetch("/api/messages/mark-read", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ thread_id: threadId }),
      });

      // スレッド一覧の未読カウントを更新
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId ? { ...t, unread_count: 0 } : t
        )
      );
    } catch (error) {
      console.error("既読マークエラー:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim() || !selectedThread) return;

    setIsSending(true);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          thread_id: selectedThread.id,
          content: messageInput.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, data.message]);
        setMessageInput("");
      }
    } catch (error) {
      console.error("メッセージ送信エラー:", error);
    } finally {
      setIsSending(false);
    }
  };

  const getPartnerName = (thread: MessageThread) => {
    // TODO: 実際のデータから相手の名前を取得
    return userRole === "company" ? "営業代行" : "企業";
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}分前`;
    } else if (hours < 24) {
      return `${hours}時間前`;
    } else {
      return date.toLocaleDateString("ja-JP", {
        month: "short",
        day: "numeric",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-400">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">メッセージ</h1>
        <p className="text-slate-400">
          承認済みの営業代行とメッセージでやり取りできます
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* スレッド一覧 */}
        <Card className="bg-slate-800/50 border-slate-700 lg:col-span-1">
          <div className="p-4 border-b border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="検索..."
                className="pl-10 bg-slate-900 border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-700">
            {threads.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-slate-400">
                  メッセージスレッドがありません
                </p>
              </div>
            ) : (
              threads.map((thread) => (
                <div
                  key={thread.id}
                  className={`p-4 cursor-pointer hover:bg-slate-700/50 transition-colors ${
                    selectedThread?.id === thread.id ? "bg-slate-700/50" : ""
                  }`}
                  onClick={() => setSelectedThread(thread)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-white">
                      {getPartnerName(thread)}
                    </h3>
                    {thread.unread_count && thread.unread_count > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {thread.unread_count}
                      </Badge>
                    )}
                  </div>
                  {thread.last_message_at && (
                    <p className="text-xs text-slate-400">
                      {formatTime(thread.last_message_at)}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        {/* チャット画面 */}
        <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
          {selectedThread ? (
            <div className="flex flex-col h-[600px]">
              {/* ヘッダー */}
              <div className="p-4 border-b border-slate-700">
                <h2 className="font-semibold text-white">
                  {getPartnerName(selectedThread)}
                </h2>
              </div>

              {/* メッセージエリア */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-slate-400">
                      メッセージを送信してやり取りを開始しましょう
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMine = message.sender_id === userId;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            isMine
                              ? "bg-blue-600 text-white"
                              : "bg-slate-700 text-slate-100"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              isMine ? "text-blue-200" : "text-slate-400"
                            }`}
                          >
                            {new Date(message.created_at).toLocaleTimeString(
                              "ja-JP",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* 入力エリア */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700">
                <div className="flex gap-2">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="メッセージを入力..."
                    className="bg-slate-900 border-slate-700 text-white"
                    disabled={isSending}
                  />
                  <Button
                    type="submit"
                    disabled={!messageInput.trim() || isSending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[600px]">
              <p className="text-slate-400">
                スレッドを選択してください
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
