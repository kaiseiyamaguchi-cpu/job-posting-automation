'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  onSearch: (filters: {
    keyword?: string
    specialty?: string
    area?: string
  }) => void
  initialKeyword?: string
  initialSpecialty?: string
  initialArea?: string
}

export function SearchBar({
  onSearch,
  initialKeyword = '',
  initialSpecialty = '',
  initialArea = '',
}: SearchBarProps) {
  const [keyword, setKeyword] = useState(initialKeyword)
  const [specialty, setSpecialty] = useState(initialSpecialty)
  const [area, setArea] = useState(initialArea)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch({ keyword, specialty, area })
  }

  const handleClear = () => {
    setKeyword('')
    setSpecialty('')
    setArea('')
    onSearch({})
  }

  const hasFilters = keyword || specialty || area

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="キーワードで検索（名前、自己PR など）"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-10 bg-slate-900 border-slate-600 text-white"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <Input
              type="text"
              placeholder="得意分野（例：IT、SaaS）"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="bg-slate-900 border-slate-600 text-white"
            />
            <Input
              type="text"
              placeholder="対応エリア（例：東京）"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="bg-slate-900 border-slate-600 text-white"
            />
          </div>

          <div className="flex gap-3">
            {hasFilters && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <X className="w-4 h-4 mr-2" />
                クリア
              </Button>
            )}
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Search className="w-4 h-4 mr-2" />
              検索
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

