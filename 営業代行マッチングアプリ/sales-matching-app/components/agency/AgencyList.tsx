'use client'

import { AgencyCard } from './AgencyCard'
import { Card, CardContent } from '@/components/ui/card'

interface Agency {
  id: string
  name: string
  specialties: string[]
  areas: string[]
  bio?: string
}

interface AgencyListProps {
  agencies: Agency[]
  isLoading?: boolean
}

export function AgencyList({ agencies, isLoading }: AgencyListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-slate-800/50 border-slate-700 animate-pulse">
            <CardContent className="h-64" />
          </Card>
        ))}
      </div>
    )
  }

  if (agencies.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="py-16 text-center">
          <p className="text-slate-400 mb-2">該当する営業代行が見つかりませんでした</p>
          <p className="text-sm text-slate-500">
            検索条件を変更してお試しください
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {agencies.map((agency) => (
        <AgencyCard
          key={agency.id}
          id={agency.id}
          name={agency.name}
          specialties={agency.specialties}
          areas={agency.areas}
          bio={agency.bio}
        />
      ))}
    </div>
  )
}

