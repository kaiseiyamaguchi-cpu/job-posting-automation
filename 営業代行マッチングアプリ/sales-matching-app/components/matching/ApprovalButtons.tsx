'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface ApprovalButtonsProps {
  requestId: string
  onApprove: (reason?: string) => Promise<void>
  onReject: (reason?: string) => Promise<void>
}

export function ApprovalButtons({ requestId, onApprove, onReject }: ApprovalButtonsProps) {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    setLoading(true)
    try {
      await onApprove()
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    setLoading(true)
    try {
      await onReject(rejectReason)
      setIsRejectModalOpen(false)
      setRejectReason('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-3">
      {/* 却下ボタン */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
            disabled={loading}
          >
            却下
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">申請を却下</DialogTitle>
            <DialogDescription className="text-slate-400">
              却下理由を入力してください（任意）
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="reject-reason" className="text-slate-300">
                却下理由
              </Label>
              <Textarea
                id="reject-reason"
                placeholder="例：現在、新規案件を受け付けておりません"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="bg-slate-900 border-slate-600 text-white mt-2"
                disabled={loading}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 border-slate-600"
                onClick={() => setIsRejectModalOpen(false)}
                disabled={loading}
              >
                キャンセル
              </Button>
              <Button
                variant="destructive"
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleReject}
                disabled={loading}
              >
                {loading ? '処理中...' : '却下する'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 承認ボタン */}
      <Button 
        className="flex-1 bg-green-600 hover:bg-green-700"
        onClick={handleApprove}
        disabled={loading}
      >
        {loading ? '処理中...' : '承認'}
      </Button>
    </div>
  )
}
