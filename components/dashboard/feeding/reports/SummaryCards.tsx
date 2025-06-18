import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FeedingReportData } from '@/app/api/feeding/reports';
import { Utensils, TrendingUp, CheckCircle, XCircle } from 'lucide-react';

interface SummaryCardsProps {
  data: FeedingReportData;
}

export function SummaryCards({ data }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Feedings</CardTitle>
          <div className="bg-muted dark:bg-muted/80 p-2 rounded-md">
             <Utensils className="h-4 w-4 text-foreground/80" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold">{data.totalFeedings}</div>
          <p className="text-xs text-muted-foreground">
            In selected period
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <div className="bg-muted dark:bg-muted/80 p-2 rounded-md">
            <CheckCircle className="h-4 w-4 text-foreground/80" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold">{data.successRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            Successful feeding rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Refusal Rate</CardTitle>
          <div className="bg-muted dark:bg-muted/80 p-2 rounded-md">
             <XCircle className="h-4 w-4 text-foreground/80" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold">{data.refusalRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            Feeding refusal rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Most Fed </CardTitle>
          <div className="bg-muted dark:bg-muted/80 p-2 rounded-md">
             <TrendingUp className="h-4 w-4 text-foreground/80" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold">
            {data.mostFedSpecies[0]?.name || 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground">
            {data.mostFedSpecies[0]?.count || 0} feedings
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
