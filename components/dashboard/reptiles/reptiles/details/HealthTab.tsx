'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { EnrichedHealthLogEntry } from "./types";
import { ReptileTabProps } from "./types";

export function HealthTab({ reptileDetails }: ReptileTabProps) {
  if (!reptileDetails) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified";
    return format(parseISO(dateString), "MMM dd, yyyy");
  };

  // Group health logs by resolved status
  const activeIssues = reptileDetails.health_logs.filter(log => !log.resolved);
  const resolvedIssues = reptileDetails.health_logs.filter(log => log.resolved);
  
  if (!activeIssues.length && !resolvedIssues.length) {
    return (
      <div className="space-y-4 mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
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
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Health Records
          </CardTitle>
        </CardHeader>
        <CardContent className="py-4 space-y-6">
          {activeIssues.length > 0 && (
            <div>
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
                  {activeIssues.slice(0, 5).map((entry: EnrichedHealthLogEntry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>
                        {entry.category?.label && <span>{entry.category.label}</span>}
                        {entry.subcategory?.label && <span> - {entry.subcategory.label}</span>}
                        {entry.type?.label && <span> - {entry.type.label}</span>}
                        {entry.custom_type_label && <span> - {entry.custom_type_label}</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={entry.severity === 'high' ? 'destructive' : entry.severity === 'moderate' ? 'secondary' : 'outline'}>
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
            <div>
              <h4 className="text-sm font-medium mb-2">Past Health Records</h4>
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
                  {resolvedIssues.slice(0, 3).map((entry: EnrichedHealthLogEntry) => (
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