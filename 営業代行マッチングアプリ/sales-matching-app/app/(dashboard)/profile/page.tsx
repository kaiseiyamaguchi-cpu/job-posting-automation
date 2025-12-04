import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: { setup?: string }
}) {
  const user = await requireAuth()
  const supabase = await createClient()
  const isSetup = searchParams.setup === 'true'

  // プロフィールの存在チェック
  let hasProfile = false
  
  if (user.role === 'company') {
    const { data } = await supabase
      .from('company_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()
    hasProfile = !!data
  } else if (user.role === 'agency') {
    const { data } = await supabase
      .from('agency_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()
    hasProfile = !!data
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {isSetup ? 'プロフィール作成' : 'プロフィール管理'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isSetup 
            ? 'サービスを利用するために、プロフィールを入力してください' 
            : 'プロフィール情報を編集できます'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {user.role === 'company' ? '企業情報' : '営業代行情報'}
          </CardTitle>
          <CardDescription>
            {user.role === 'company' 
              ? '会社の情報と依頼内容を入力してください' 
              : '営業代行としてのプロフィールを入力してください'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* TODO: 担当者AのActions（A1.1）と担当者BのForm（B1.3）完成後に統合 */}
          {user.role === 'company' ? (
            <div className="space-y-4">
              <p className="text-gray-500">
                企業プロフィールフォーム（担当者Bが実装中）
              </p>
              {/* 
              <CompanyProfileForm 
                userId={user.id}
                initialData={existingProfile}
                isSetup={isSetup}
              />
              */}
            </div>
          ) : user.role === 'agency' ? (
            <div className="space-y-4">
              <p className="text-gray-500">
                営業代行プロフィールフォーム（担当者Bが実装中）
              </p>
              {/*
              <AgencyProfileForm 
                userId={user.id}
                initialData={existingProfile}
                isSetup={isSetup}
              />
              */}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {isSetup && (
        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            💡 プロフィールを入力すると、すべての機能が利用できるようになります
          </p>
        </div>
      )}
    </div>
  )
}

