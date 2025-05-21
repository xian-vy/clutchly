'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Reptile } from '@/lib/types/reptile'

interface SheddingStats {
  averageInterval: number
  totalSheds: number
  completenessBreakdown: Record<string, number>
  lastShedDate: string
  daysSinceLastShed: number
}

interface SheddingOverviewProps {
  reptile: Reptile | undefined
  sheddingStats: SheddingStats | null
}

export function SheddingOverview({ reptile, sheddingStats }: SheddingOverviewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Shedding Summary</CardTitle>
          <CardDescription>
            Key shedding metrics for {reptile?.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sheddingStats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm sm:text-base xl:text-lg font-medium">Shedding Intervals</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Average Interval</p>
                    <p className="text-xs sm:text-sm font-medium">{sheddingStats.averageInterval} days</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Total Sheds</p>
                    <p className="text-xs sm:text-sm font-medium">{sheddingStats.totalSheds}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Last Shed</p>
                    <p className="text-xs sm:text-sm font-medium">{sheddingStats.lastShedDate}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Days Since Last Shed</p>
                    <p className="text-xs sm:text-sm font-medium">{sheddingStats.daysSinceLastShed} days</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm sm:text-base xl:text-lg font-medium">Shedding Completeness</h3>
                <div className="space-y-2">
                  {Object.entries(sheddingStats.completenessBreakdown).map(([type, count]) => (
                    <div key={type} className="flex justify-between">
                      <span className="capitalize text-xs sm:text-sm">{type}</span>
                      <span className="text-xs sm:text-sm font-medium">{count} sheds</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p>Not enough data to calculate shedding statistics. Need at least 2 sheds recorded.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shedding Insights</CardTitle>
          <CardDescription>Analysis and recommendations based on shedding data</CardDescription>
        </CardHeader>
        <CardContent>
          {sheddingStats ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm sm:text-base xl:text-lg font-medium mb-2">Shedding Pattern Analysis</h3>
                <p className="text-xs sm:text-sm">
                  {sheddingStats.daysSinceLastShed > sheddingStats.averageInterval * 1.5
                    ? "Your reptile is overdue for shedding. Monitor closely and ensure proper humidity levels."
                    : sheddingStats.daysSinceLastShed > sheddingStats.averageInterval
                      ? "Your reptile may be entering a shedding cycle soon. Prepare for potential shedding."
                      : "Your reptile is within normal shedding cycle range. Continue current husbandry practices."}
                </p>
              </div>

              <div>
                <h3 className="text-sm sm:text-base xl:text-lg font-medium mb-2">Recommendations</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li className="text-xs sm:text-sm">Monitor humidity levels during shedding cycles</li>
                  <li className="text-xs sm:text-sm">Document any retained sheds or incomplete sheds</li>
                  <li className="text-xs sm:text-sm">Consider seasonal variations in shedding frequency</li>
                  <li className="text-xs sm:text-sm">Track shedding patterns for breeding planning</li>
                </ul>
              </div>
            </div>
          ) : (
            <p>Not enough data to provide shedding insights. Add more shedding records to get personalized recommendations.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 