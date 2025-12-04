'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface AgencyCardProps {
  id: string
  name: string
  specialties: string[]
  areas: string[]
  bio?: string
}

export function AgencyCard({ id, name, specialties, areas, bio }: AgencyCardProps) {
  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:shadow-lg transition-all">
      <CardHeader>
        <CardTitle className="text-white">{name}</CardTitle>
        <CardDescription>
          <div className="flex flex-wrap gap-2 mt-3">
            {specialties.slice(0, 3).map((specialty) => (
              <Badge 
                key={specialty} 
                variant="secondary"
                className="bg-blue-500/10 text-blue-400 border-blue-500/20"
              >
                {specialty}
              </Badge>
            ))}
            {specialties.length > 3 && (
              <Badge variant="outline" className="border-slate-600 text-slate-400">
                +{specialties.length - 3}
              </Badge>
            )}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-slate-300 mb-2">対応エリア</p>
          <p className="text-sm text-slate-400">
            {areas.slice(0, 3).join('、')}
            {areas.length > 3 && '...'}
          </p>
        </div>

        {bio && (
          <div>
            <p className="text-sm font-medium text-slate-300 mb-2">自己PR</p>
            <p className="text-sm text-slate-400 line-clamp-2">
              {bio}
            </p>
          </div>
        )}

        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
          <Link href={`/agencies/${id}`}>
            詳細を見る
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

