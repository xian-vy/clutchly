'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Reptile } from '@/lib/types/reptile'
import { SheddingWithReptile } from '@/lib/types/shedding'
import { format } from 'date-fns'

interface ChartData {
  date: string
  interval: number
  completeness: string
}

interface SheddingDataTableProps {
  reptile: Reptile | undefined
  intervalData: ChartData[]
  sheddingRecords: SheddingWithReptile[] | undefined
}

export function SheddingDataTable({ reptile, intervalData, sheddingRecords }: SheddingDataTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shedding Data</CardTitle>
        <CardDescription>
          Raw shedding records for {reptile?.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Completeness</TableHead>
              <TableHead>Days Since Previous</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {intervalData.map((record, index) => (
              <TableRow key={index}>
                <TableCell>{record.date}</TableCell>
                <TableCell className="capitalize">{record.completeness}</TableCell>
                <TableCell>{record.interval} days</TableCell>
                <TableCell>
                  {sheddingRecords?.find(r => 
                    format(new Date(r.shed_date), 'MMM d, yyyy') === record.date
                  )?.notes || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
} 