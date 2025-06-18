'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { DetailedReptile } from "@/app/api/reptiles/reptileDetails";
import { Shedding } from "@/lib/types/shedding";
import { SHEDDING_COLORS } from "@/lib/constants/colors";
import { Sprout } from "lucide-react";

interface SheddingTabProps {
  reptileDetails: DetailedReptile | null;
}

export function SheddingTab({ reptileDetails }: SheddingTabProps) {
  if (!reptileDetails) return null;

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "MMM dd, yyyy");
  };


  const sheddingRecords = reptileDetails.shedding_records || [];

  if (!sheddingRecords.length) {
    return (
      <div className="space-y-4">
        <Card className="px-0 py-3 gap-3 border-0 shadow-none">
          <CardHeader className="p-0">
          <CardTitle className="text-base flex items-center gap-2">
              <Sprout className="h-5 w-5" />
                Shedding History
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <p className="text-muted-foreground text-sm">No shedding records available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="pt-3 px-0 gap-3 border-0 shadow-none">
        <CardHeader className="px-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sprout className="h-4 w-4" />
            Shedding History</CardTitle>
        </CardHeader>
        <CardContent className=" px-0">
          <div className="max-w-[320px] sm:max-w-[640px] md:max-w-[700px] lg:max-w-full lg:w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Completeness</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Photo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sheddingRecords.map((record: Shedding) => (
                  <TableRow key={record.id}>
                    <TableCell>{formatDate(record.shed_date)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" 
                      className={`${SHEDDING_COLORS[record.completeness] || 'bg-secondary'} capitalize`}>
                        {record.completeness}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{record.notes || '-'}</TableCell>
                    <TableCell>
                      {record.photo_url ? (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={record.photo_url} target="_blank" rel="noopener noreferrer">
                            View Photo
                          </a>
                        </Button>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 