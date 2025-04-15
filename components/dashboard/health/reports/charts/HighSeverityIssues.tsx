import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HealthCategory, HealthLogEntry } from '@/lib/types/health'
import { Reptile } from '@/lib/types/reptile'
import { format } from 'date-fns'
interface HighSeverityIssuesProps {
  filteredLogs: HealthLogEntry[]
  reptiles : Reptile[]
  categories : HealthCategory[]
}
const HighSeverityIssues = ({filteredLogs, reptiles, categories} : HighSeverityIssuesProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Card>
      <CardHeader>
        <CardTitle>High Severity Issues</CardTitle>
        <CardDescription>Most critical health issues</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {filteredLogs
            .filter(log => log.severity === 'high' && !log.resolved)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5)
            .map(log => {
              const reptile = reptiles.find(r => r.id === log.reptile_id);
              const category = categories.find(c => c.id === log.category_id);
              return (
                <div key={log.id} className="p-3 border rounded-md">
                  <div className="flex justify-between">
                    <span className="font-medium">{reptile?.name || 'Unknown Reptile'}</span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(log.date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="text-sm">{category?.label || 'Unknown Category'}</div>
                  <div className="text-xs text-gray-500 mt-1">{log.notes || 'No notes'}</div>
                </div>
              );
            })}
          {filteredLogs.filter(log => log.severity === 'high' && !log.resolved).length === 0 && (
            <div className="text-center text-gray-500 py-4">No active high severity issues</div>
          )}
        </div>
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader>
        <CardTitle>Recent Resolutions</CardTitle>
        <CardDescription>Recently resolved health issues</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {filteredLogs
            .filter(log => log.resolved)
            .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
            .slice(0, 5)
            .map(log => {
              const reptile = reptiles.find(r => r.id === log.reptile_id);
              const category = categories.find(c => c.id === log.category_id);
              return (
                <div key={log.id} className="p-3 border rounded-md">
                  <div className="flex justify-between">
                    <span className="font-medium">{reptile?.name || 'Unknown Reptile'}</span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(log.updated_at || log.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="text-sm">{category?.label || 'Unknown Category'}</div>
                  <div className="text-xs text-gray-500 mt-1">{log.notes || 'No notes'}</div>
                </div>
              );
            })}
          {filteredLogs.filter(log => log.resolved).length === 0 && (
            <div className="text-center text-gray-500 py-4">No resolved issues</div>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
  )
}

export default HighSeverityIssues