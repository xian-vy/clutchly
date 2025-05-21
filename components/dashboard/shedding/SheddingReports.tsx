'use client'

import { useQuery } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { format, subMonths, differenceInDays } from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getReptiles } from '@/app/api/reptiles/reptiles'
import { Reptile } from '@/lib/types/reptile'
import { SheddingWithReptile } from '@/lib/types/shedding'
import { SheddingFilters } from './components/SheddingFilters'
import { SheddingOverview } from './components/SheddingOverview'
import { SheddingCharts } from './components/SheddingCharts'
import { SheddingDataTable } from './components/SheddingDataTable'

export function SheddingReports() {
  const supabase = createClientComponentClient()
  const [selectedReptileId, setSelectedReptileId] = useState<string>('')
  const [selectedMetric, setSelectedMetric] = useState<'intervals' | 'completeness'>('intervals')
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '1y' | 'all'>('6m')

  const { data: reptiles = [], isLoading: reptilesLoading } = useQuery<Reptile[]>({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  })

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

  // Filter records based on selected time range
  const filteredRecords = sheddingRecords?.filter(record => {
    if (timeRange === 'all') return true
    const months = timeRange === '3m' ? 3 : timeRange === '6m' ? 6 : 12
    return new Date(record.shed_date) >= subMonths(new Date(), months)
  })

  // Calculate shedding intervals for the selected reptile
  const calculateSheddingIntervals = (reptileId: string) => {
    const reptileSheds = filteredRecords
      ?.filter(record => record.reptile.id === reptileId)
      .sort((a, b) => new Date(a.shed_date).getTime() - new Date(b.shed_date).getTime())

    if (!reptileSheds || reptileSheds.length < 2) return []

    return reptileSheds.map((shed, index) => {
      if (index === 0) return null
      const prevShed = reptileSheds[index - 1]
      const interval = differenceInDays(
        new Date(shed.shed_date),
        new Date(prevShed.shed_date)
      )
      return {
        date: format(new Date(shed.shed_date), 'MMM d, yyyy'),
        interval,
        completeness: shed.completeness,
      }
    }).filter((item): item is NonNullable<typeof item> => item !== null)
  }

  // Calculate shedding completeness trends
  const calculateCompletenessTrends = (reptileId: string) => {
    const reptileSheds = filteredRecords
      ?.filter(record => record.reptile.id === reptileId)
      .sort((a, b) => new Date(a.shed_date).getTime() - new Date(b.shed_date).getTime())

    if (!reptileSheds) return []

    return reptileSheds.map(shed => ({
      date: format(new Date(shed.shed_date), 'MMM d, yyyy'),
      completeness: shed.completeness,
      completenessValue: shed.completeness === 'full' ? 3 : 
                        shed.completeness === 'partial' ? 2 :
                        shed.completeness === 'retained' ? 1 : 0
    }))
  }

  // Calculate shedding statistics
  const calculateSheddingStats = (reptileId: string) => {
    const intervals = calculateSheddingIntervals(reptileId)
    if (intervals.length === 0) return null

    const avgInterval = intervals.reduce((sum, item) => sum + item.interval, 0) / intervals.length
    const completenessCounts = intervals.reduce((acc, item) => {
      acc[item.completeness] = (acc[item.completeness] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      averageInterval: Math.round(avgInterval),
      totalSheds: intervals.length + 1,
      completenessBreakdown: completenessCounts,
      lastShedDate: intervals[intervals.length - 1].date,
      daysSinceLastShed: differenceInDays(
        new Date(),
        new Date(intervals[intervals.length - 1].date)
      )
    }
  }

  const sheddingStats = selectedReptileId ? calculateSheddingStats(selectedReptileId) : null
  const intervalData = selectedReptileId ? calculateSheddingIntervals(selectedReptileId) : []
  const completenessData = selectedReptileId ? calculateCompletenessTrends(selectedReptileId) : []
  const selectedReptile = reptiles.find(r => r.id === selectedReptileId)

  if (isLoading || reptilesLoading) {
    return (
      <div className="w-full flex flex-col justify-center items-center min-h-[70vh]">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SheddingFilters
        reptiles={reptiles}
        selectedReptileId={selectedReptileId}
        timeRange={timeRange}
        onReptileChange={setSelectedReptileId}
        onTimeRangeChange={setTimeRange}
      />

      {selectedReptileId && (
        <Tabs defaultValue="overview" className="w-full space-y-5">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="charts">Shedding Charts</TabsTrigger>
            <TabsTrigger value="data">Raw Data</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <SheddingOverview
              reptile={selectedReptile}
              sheddingStats={sheddingStats}
            />
          </TabsContent>

          <TabsContent value="charts">
            <SheddingCharts
              intervalData={intervalData}
              completenessData={completenessData}
              selectedMetric={selectedMetric}
              onMetricChange={setSelectedMetric}
            />
          </TabsContent>

          <TabsContent value="data">
            <SheddingDataTable
              reptile={selectedReptile}
              intervalData={intervalData}
              sheddingRecords={filteredRecords}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
} 