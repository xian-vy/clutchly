'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Utensils } from "lucide-react";
import { format, parseISO } from "date-fns";
import { FeedingEvent } from "@/lib/types/feeding";
import { YES_NO_COLORS } from "@/lib/constants/colors";
import { DetailedReptile } from "@/app/api/reptiles/reptileDetails";
interface FeedingTabProps {
  reptileDetails: DetailedReptile | null;
}
export function FeedingTab({ reptileDetails }: FeedingTabProps) {
  if (!reptileDetails) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified";
    return format(parseISO(dateString), "MMM dd, yyyy");
  };

  const feedingHistory = reptileDetails.feeding_history;

  if (!feedingHistory || feedingHistory.length === 0) {
    return (
      <div className="space-y-4 mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Feeding History
            </CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            <p className="text-muted-foreground">No feeding history available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate feeding statistics
  const totalEvents = feedingHistory.length;
  const fedEvents = feedingHistory.filter((event: FeedingEvent) => event.fed).length;
  const fedPercentage = totalEvents > 0 ? Math.round((fedEvents / totalEvents) * 100) : 0;

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Feeding History
          </CardTitle>
        </CardHeader>
        <CardContent className="py-4 space-y-6">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Feeding Success Rate</h4>
            <Progress value={fedPercentage} className="h-2" />
            <p className="text-sm text-muted-foreground">{fedPercentage}% success rate ({fedEvents} out of {totalEvents} feeds)</p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Recent Feeding History</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedingHistory.slice(0, 5).map((entry: FeedingEvent) => (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDate(entry.scheduled_date)}</TableCell>
                    <TableCell>
                      <Badge variant={entry.fed ? "custom" : "destructive"} className={entry.fed ? YES_NO_COLORS.yes : ""}>
                        {entry.fed ? "Fed" : "Refused"}
                      </Badge>
                    </TableCell>
                    <TableCell>{entry.notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {feedingHistory.length > 5 && (
              <div className="text-center mt-2">
                <Button variant="link" size="sm">View Complete Feeding History</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 