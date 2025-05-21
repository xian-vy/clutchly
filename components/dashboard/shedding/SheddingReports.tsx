'use client'

import { useQuery } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SheddingWithReptile } from '@/lib/types/shedding'

export function SheddingReports() {
  const supabase = createClientComponentClient()

  const { data: sheddingRecords, isLoading } = useQuery({
    queryKey: ['shedding'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shedding')
        .select(`
          *,
          reptile:reptiles (
            id,
            name,
            reptile_code,
            location:locations (
              id,
              label,
              rack:racks (
                id,
                name,
                room:rooms (
                  id,
                  name
                )
              )
            )
          )
        `)
        .order('shed_date', { ascending: false })

      if (error) throw error
      return data as SheddingWithReptile[]
    },
  })

  if (isLoading) {
    return <div>Loading reports...</div>
  }

  // Calculate statistics
  const totalSheds = sheddingRecords?.length || 0
  const shedsByCompleteness = sheddingRecords?.reduce((acc, record) => {
    acc[record.completeness] = (acc[record.completeness] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  // Calculate average shed interval per reptile
  const reptileShedIntervals = sheddingRecords?.reduce((acc, record) => {
    if (!acc[record.reptile.id]) {
      acc[record.reptile.id] = {
        name: record.reptile.name,
        sheds: [],
      }
    }
    acc[record.reptile.id].sheds.push(new Date(record.shed_date))
    return acc
  }, {} as Record<string, { name: string; sheds: Date[] }>)

  const averageIntervals = Object.entries(reptileShedIntervals || {})
    .map(([id, data]) => {
      const sheds = data.sheds.sort((a, b) => a.getTime() - b.getTime())
      if (sheds.length < 2) return null

      const intervals = []
      for (let i = 1; i < sheds.length; i++) {
        const interval = (sheds[i].getTime() - sheds[i - 1].getTime()) / (1000 * 60 * 60 * 24) // in days
        intervals.push(interval)
      }

      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
      return {
        reptileId: id,
        reptileName: data.name,
        averageInterval: Math.round(avgInterval),
        shedCount: sheds.length,
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.shedCount - a.shedCount)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Total Sheds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSheds}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shed Completeness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(shedsByCompleteness).map(([type, count]) => (
              <div key={type} className="flex justify-between">
                <span className="capitalize">{type}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Average Shed Intervals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {averageIntervals.map(({ reptileId, reptileName, averageInterval, shedCount }) => (
              <div key={reptileId} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{reptileName}</div>
                  <div className="text-sm text-muted-foreground">
                    {shedCount} sheds recorded
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{averageInterval} days</div>
                  <div className="text-sm text-muted-foreground">average interval</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 