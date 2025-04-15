import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
interface ResolutionTimeAnalysisProps {
    stats: {
        totalIssues: number;
        activeIssues: number;
        resolvedIssues: number;
        highSeverityIssues: number;
        moderateSeverityIssues: number;
        lowSeverityIssues: number;
        resolutionRate: number;
        avgResolutionDays: number;
      };
}
const ResolutionTimeAnalysis = ({stats}: ResolutionTimeAnalysisProps) => {
  return (
    <Card>
        <CardHeader>
            <CardTitle>Resolution Time Analysis</CardTitle>
            <CardDescription>Average days to resolve health issues</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-center h-[200px]">
            <div className="text-center">
                <div className="text-4xl font-bold">{stats.avgResolutionDays.toFixed(1)}</div>
                <div className="text-sm text-gray-500">Average Days to Resolve</div>
                <div className="mt-4 text-sm">
                <div className="flex items-center justify-between">
                    <span>Resolution Rate:</span>
                    <span className="font-medium">{stats.resolutionRate.toFixed(1)}%</span>
                </div>
                </div>
            </div>
            </div>
        </CardContent>
</Card>
  )
}

export default ResolutionTimeAnalysis