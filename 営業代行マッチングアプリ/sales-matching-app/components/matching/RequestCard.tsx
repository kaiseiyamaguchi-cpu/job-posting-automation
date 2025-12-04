'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { MatchingRequest } from '@/types'

interface RequestCardProps {
  request: MatchingRequest
  isCompany: boolean
}

export function RequestCard({ request, isCompany }: RequestCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">申請中</Badge>
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">承認済み</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20">却下</Badge>
      default:
        return null
    }
  }

  const partnerName = isCompany 
    ? request.agency_profile?.name 
    : request.company_profile?.company_name

  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white">
            {partnerName || '---'}
          </CardTitle>
          {getStatusBadge(request.status)}
        </div>
        <p className="text-sm text-slate-400">
          申請日: {new Date(request.created_at).toLocaleDateString('ja-JP')}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-slate-300 mb-1">月予算</p>
          <p className="text-2xl font-bold text-white">
            ¥{request.monthly_budget.toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-300 mb-1">依頼内容</p>
          <p className="text-sm text-slate-400 line-clamp-3">
            {request.request_details}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-300 mb-1">提案期限</p>
          <p className="text-sm text-slate-400">
            {new Date(request.proposal_deadline).toLocaleDateString('ja-JP')}
          </p>
        </div>

        {/* 承認済みの場合はメッセージへのリンク */}
        {request.status === 'approved' && (
          <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
            <Link href={`/messages/${request.id}`}>
              メッセージを見る
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
