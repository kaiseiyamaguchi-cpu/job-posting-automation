'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface RequestModalProps {
  isOpen: boolean
  onClose: () => void
  agencyName: string
  agencyId: string
  onSubmit: (data: {
    monthly_budget: number
    request_details: string
    proposal_deadline: string
  }) => Promise<void>
}

export function RequestModal({ 
  isOpen, 
  onClose, 
  agencyName, 
  agencyId, 
  onSubmit 
}: RequestModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    monthly_budget: '',
    request_details: '',
    proposal_deadline: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit({
        monthly_budget: parseInt(formData.monthly_budget),
        request_details: formData.request_details,
        proposal_deadline: formData.proposal_deadline,
      })
      
      // フォームをリセット
      setFormData({
        monthly_budget: '',
        request_details: '',
        proposal_deadline: '',
      })
      onClose()
    } catch (error) {
      console.error('申請エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">
            マッチング申請
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            <span className="font-semibold text-blue-400">{agencyName}</span> への申請内容を入力してください
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div>
            <Label htmlFor="monthly_budget" className="text-slate-300 mb-2 block">
              月予算（円）<span className="text-red-500">*</span>
            </Label>
            <Input
              id="monthly_budget"
              type="number"
              placeholder="300000"
              value={formData.monthly_budget}
              onChange={(e) => setFormData({ ...formData, monthly_budget: e.target.value })}
              required
              disabled={loading}
              className="bg-slate-900 border-slate-600 text-white"
              min="0"
              step="10000"
            />
            <p className="text-xs text-slate-500 mt-1">
              ※ 1万円単位で入力してください
            </p>
          </div>

          <div>
            <Label htmlFor="request_details" className="text-slate-300 mb-2 block">
              依頼内容<span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="request_details"
              placeholder="具体的な依頼内容を入力してください&#10;例：新規顧客開拓のための営業代行を依頼したいです。&#10;対象業界：IT・SaaS企業&#10;想定アポイント数：月20件以上"
              value={formData.request_details}
              onChange={(e) => setFormData({ ...formData, request_details: e.target.value })}
              required
              disabled={loading}
              rows={8}
              className="bg-slate-900 border-slate-600 text-white"
            />
            <p className="text-xs text-slate-500 mt-1">
              ※ 業界、ターゲット、目標などを具体的に記載してください
            </p>
          </div>

          <div>
            <Label htmlFor="proposal_deadline" className="text-slate-300 mb-2 block">
              提案期限<span className="text-red-500">*</span>
            </Label>
            <Input
              id="proposal_deadline"
              type="date"
              value={formData.proposal_deadline}
              onChange={(e) => setFormData({ ...formData, proposal_deadline: e.target.value })}
              required
              disabled={loading}
              className="bg-slate-900 border-slate-600 text-white"
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-slate-500 mt-1">
              ※ 営業代行からの返答期限を設定してください
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              onClick={onClose}
              disabled={loading}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? '送信中...' : '申請を送信'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
