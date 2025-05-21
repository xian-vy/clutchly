'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Heart } from "lucide-react";
import { format, parseISO } from "date-fns";
import { DetailedReptile } from "@/app/api/reptiles/reptileDetails";
import { HealthLogEntryWithCategory } from "@/lib/types/health";
import { SEVERITY_COLORS } from "@/lib/constants/colors";

interface ReptileTabProps {
  reptileDetails: DetailedReptile | null;
}
export function HealthTab({ reptileDetails }: ReptileTabProps) {
  if (!reptileDetails) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified";
    return format(parseISO(dateString), "MMM dd, yyyy");
  };

  // Find last defecation record
  const lastDefecation = reptileDetails.health_logs
    .filter(log => log.category_id === 'def-cat')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  // Group health logs by resolved status
  const activeIssues = reptileDetails.health_logs.filter(log => !log.resolved);
  const resolvedIssues = reptileDetails.health_logs.filter(log => log.resolved);
  
  if (!activeIssues.length && !resolvedIssues.length) {
    return (
      <div className="space-y-4 ">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Health Records
            </CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            <p className="text-muted-foreground">No health records available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-2 ">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="px-0 gap-3 border-0">
          <CardHeader className="px-0">
            <CardTitle className="text-base">Last Defecation</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {lastDefecation ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">Date:</span>
                  <span className="text-xs sm:text-sm">{formatDate(lastDefecation.date)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">Type:</span>
                  <span className="text-xs sm:text-sm">
                    {lastDefecation.subcategory?.label && <span>{lastDefecation.subcategory.label}</span>}
                    {lastDefecation.type?.label && <span> - {lastDefecation.type.label}</span>}
                  </span>
                </div>
                {lastDefecation.notes && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm">Notes:</span>
                    <p className="line-clamp-2">{lastDefecation.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-xs sm:text-sm">No defecation records available</p>
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="px-0 gap-3 border-0">
        <CardHeader className="px-0">
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Health Records
          </CardTitle>
        </CardHeader>
        <CardContent className="py-4 space-y-6 px-0">
          {activeIssues.length > 0 && (
            <div className="max-w-[320px] sm:max-w-[640px] md:max-w-[700px] lg:max-w-full lg:w-full overflow-x-auto">
              <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Active Health Issues ({activeIssues.length})
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Issue</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeIssues.slice(0, 5).map((entry: HealthLogEntryWithCategory) => (
                    <TableRow key={entry.id}>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>
                        {entry.category?.label && <span>{entry.category.label}</span>}
                        {entry.subcategory?.label && <span> - {entry.subcategory.label}</span>}
                        {entry.type?.label && <span> - {entry.type.label}</span>}
                        {entry.custom_type_label && <span> - {entry.custom_type_label}</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="custom" className={`${SEVERITY_COLORS[entry.severity ?? 'low']} capitalize`}>
                          {entry.severity || 'Low'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{entry.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {activeIssues.length > 5 && (
                <div className="text-center mt-2">
                  <Button variant="link" size="sm">View All Active Issues</Button>
                </div>
              )}
            </div>
          )}

          {resolvedIssues.length > 0 && (
            <div className="max-w-[320px] sm:max-w-[640px] md:max-w-[700px] lg:max-w-full lg:w-full overflow-x-auto">
              <h4 className="text-sm font-medium mb-2 ">Past Health Records</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Issue</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resolvedIssues.slice(0, 3).map((entry: HealthLogEntryWithCategory) => (
                    <TableRow key={entry.id}>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>
                        {entry.category?.label && <span>{entry.category.label}</span>}
                        {entry.subcategory?.label && <span> - {entry.subcategory.label}</span>}
                        {entry.type?.label && <span> - {entry.type.label}</span>}
                        {entry.custom_type_label && <span> - {entry.custom_type_label}</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {entry.severity || 'Low'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{entry.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {resolvedIssues.length > 3 && (
                <div className="text-center mt-2">
                  <Button variant="link" size="sm">View All Health Records</Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}