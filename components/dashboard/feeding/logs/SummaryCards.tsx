import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Calendar, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface SummaryCardsProps {
  totalEvents: number;
  completedEvents: number;
  completionRate: number;
  last7DaysEvents: number;
  last7DaysCompleted: number;
  last7DaysRate: number;
  todayEvents: number;
}

export function SummaryCards({
  totalEvents,
  completedEvents,
  completionRate,
  last7DaysEvents,
  last7DaysCompleted,
  last7DaysRate,
  todayEvents,
}: SummaryCardsProps) {
  const today = new Date();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-gradient-to-br from-background to-muted/30">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Feeding Events
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalEvents}</div>
          <div className="flex items-center gap-1 mt-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <p className="text-xs text-muted-foreground">
              {completedEvents} completed ({completionRate}%)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-background to-muted/30">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last 7 Days
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{last7DaysEvents}</div>
          <div className="flex items-center gap-1 mt-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <p className="text-xs text-muted-foreground">
              {last7DaysCompleted} completed ({last7DaysRate}%)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-background to-muted/30">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today&apos;s Feedings
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todayEvents}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {format(today, 'EEEE, MMM d')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 