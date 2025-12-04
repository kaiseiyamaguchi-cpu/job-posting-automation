'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

// TODO: 担当者AのActions（A1.2, A1.3）完成後にServer Componentに変更

export default function AgencyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // TODO: 担当者AのActions完成後に実際のデータ取得
  // const agency = await getAgencyById(id)

  // 仮データ
  const agency = {
    id,
    name: '営業代行サンプル',
    specialties: ['IT', 'SaaS', 'BtoB'],
    areas: ['東京', '神奈川', '大阪'],
    bio: 'IT業界を中心に営業代行サービスを提供しています。',
    phone_number: '03-1234-5678',
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    // TODO: 担当者AのActions（A1.3）完成後に実装
    // const formData = new FormData(e.currentTarget)
    // await createMatchingRequest({ ... }, id)

    setLoading(false)
    setIsModalOpen(false)
    router.push('/matching-requests')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Button 
        variant="outline" 
        className="mb-6"
        onClick={() => router.back()}
      >
        ← 戻る
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{agency.name}</CardTitle>
          <CardDescription>営業代行プロフィール</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">得意分野</h3>
            <div className="flex flex-wrap gap-2">
              {agency.specialties.map((specialty) => (
                <Badge key={specialty}>{specialty}</Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">対応エリア</h3>
            <div className="flex flex-wrap gap-2">
              {agency.areas.map((area) => (
                <Badge key={area} variant="outline">{area}</Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">自己PR</h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {agency.bio}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">連絡先</h3>
            <p className="text-gray-700">{agency.phone_number}</p>
          </div>

          {/* マッチング申請モーダル */}
          {/* TODO: 担当者BのRequestModal（B1.5）完成後に置き換え */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full">
                マッチング申請を送る
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>マッチング申請</DialogTitle>
                <DialogDescription>
                  {agency.name}への申請内容を入力してください
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="monthly_budget">月予算（円）</Label>
                  <Input
                    id="monthly_budget"
                    name="monthly_budget"
                    type="number"
                    placeholder="300000"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="request_details">依頼内容</Label>
                  <Textarea
                    id="request_details"
                    name="request_details"
                    placeholder="具体的な依頼内容を入力してください"
                    rows={5}
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="proposal_deadline">提案期限</Label>
                  <Input
                    id="proposal_deadline"
                    name="proposal_deadline"
                    type="date"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsModalOpen(false)}
                    disabled={loading}
                  >
                    キャンセル
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? '送信中...' : '申請を送信'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}

