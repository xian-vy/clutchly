import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Loader2, Download, FileSpreadsheet, FileText as FileTextIcon, BarChart, PieChart, LineChart, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

interface ReportsPanelProps {
  filterStatus: 'all' | 'fed' | 'unfed';
  dateRange: DateRange;
  filteredEventsCount: number;
  isGeneratingReport: boolean;
  onGenerateReport: () => void;
}

export function ReportsPanel({
  filterStatus,
  dateRange,
  filteredEventsCount,
  isGeneratingReport,
  onGenerateReport,
}: ReportsPanelProps) {
  const [reportType, setReportType] = useState('summary');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [groupBy, setGroupBy] = useState('reptile');

  // Get icon for report format
  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileTextIcon className="h-4 w-4" />;
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'csv':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Get icon for report type
  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'summary':
        return <BarChart className="h-4 w-4" />;
      case 'detailed':
        return <FileText className="h-4 w-4" />;
      case 'reptile':
        return <PieChart className="h-4 w-4" />;
      case 'species':
        return <LineChart className="h-4 w-4" />;
      case 'growth':
        return <BarChart className="h-4 w-4" />;
      case 'health':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feeding Reports</CardTitle>
        <CardDescription>
          Generate comprehensive reports on feeding patterns and completion rates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="standard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="standard">Standard Reports</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="standard" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="report-type" className="mb-2 block">Report Type</Label>
                  <Select 
                    value={reportType} 
                    onValueChange={setReportType}
                  >
                    <SelectTrigger id="report-type">
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">Summary Report</SelectItem>
                      <SelectItem value="detailed">Detailed Log</SelectItem>
                      <SelectItem value="reptile">Per-Reptile Stats</SelectItem>
                      <SelectItem value="species">Per-Species Stats</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="report-format" className="mb-2 block">Format</Label>
                  <Select 
                    value={reportFormat} 
                    onValueChange={setReportFormat}
                  >
                    <SelectTrigger id="report-format">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-3">Applied Filters</h3>
                <div className="text-sm text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Status</Badge>
                    <span>{filterStatus === 'all' ? 'All Events' : filterStatus === 'fed' ? 'Fed Only' : 'Unfed Only'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Date Range</Badge>
                    <span>{dateRange.from 
                      ? `${format(dateRange.from, 'MMM d, yyyy')} - ${dateRange.to ? format(dateRange.to, 'MMM d, yyyy') : 'Present'}`
                      : 'All time'
                    }</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Events</Badge>
                    <span>{filteredEventsCount} matching events</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-charts" 
                checked={includeCharts} 
                onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
              />
              <Label htmlFor="include-charts" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Include visual charts
              </Label>
            </div>

            <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                {getFormatIcon(reportFormat)}
                <h3 className="text-lg font-medium">
                  {reportType === 'summary' ? 'Summary Report' : 
                   reportType === 'detailed' ? 'Detailed Log' : 
                   reportType === 'reptile' ? 'Per-Reptile Stats' : 'Per-Species Stats'}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground text-center mb-4">
                This report will include all {filteredEventsCount} events matching your current filters.
              </p>
              <Button 
                className="w-full md:w-auto" 
                onClick={onGenerateReport}
                disabled={isGeneratingReport || filteredEventsCount === 0}
              >
                {isGeneratingReport ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="advanced-report-type" className="mb-2 block">Report Type</Label>
                  <Select 
                    value={reportType} 
                    onValueChange={setReportType}
                  >
                    <SelectTrigger id="advanced-report-type">
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="growth">Growth Tracking</SelectItem>
                      <SelectItem value="health">Health Indicators</SelectItem>
                      <SelectItem value="breeding">Breeding Readiness</SelectItem>
                      <SelectItem value="cost">Feeding Cost Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="group-by" className="mb-2 block">Group By</Label>
                  <Select 
                    value={groupBy} 
                    onValueChange={setGroupBy}
                  >
                    <SelectTrigger id="group-by">
                      <SelectValue placeholder="Select grouping" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reptile">Individual Reptile</SelectItem>
                      <SelectItem value="species">Species</SelectItem>
                      <SelectItem value="morph">Morph</SelectItem>
                      <SelectItem value="age">Age Group</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="advanced-format" className="mb-2 block">Format</Label>
                  <Select 
                    value={reportFormat} 
                    onValueChange={setReportFormat}
                  >
                    <SelectTrigger id="advanced-format">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-3">Report Features</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="include-charts-advanced" 
                      checked={includeCharts} 
                      onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                    />
                    <Label htmlFor="include-charts-advanced" className="text-sm">
                      Include visual charts and graphs
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="include-recommendations" 
                      checked={includeRecommendations} 
                      onCheckedChange={(checked) => setIncludeRecommendations(checked as boolean)}
                    />
                    <Label htmlFor="include-recommendations" className="text-sm">
                      Include feeding recommendations
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="include-comparison" 
                      defaultChecked
                    />
                    <Label htmlFor="include-comparison" className="text-sm">
                      Compare with previous period
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="include-export" 
                      defaultChecked
                    />
                    <Label htmlFor="include-export" className="text-sm">
                      Export data for external analysis
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                {getReportTypeIcon(reportType)}
                <h3 className="text-lg font-medium">
                  {reportType === 'growth' ? 'Growth Tracking Report' : 
                   reportType === 'health' ? 'Health Indicators Report' : 
                   reportType === 'breeding' ? 'Breeding Readiness Report' : 'Feeding Cost Analysis'}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground text-center mb-4">
                This advanced report will analyze {filteredEventsCount} events to provide insights for reptile breeders.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-4">
                <div className="bg-background p-3 rounded-md border flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm">Feeding Schedule Analysis</span>
                </div>
                <div className="bg-background p-3 rounded-md border flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Completion Rate Trends</span>
                </div>
                <div className="bg-background p-3 rounded-md border flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">Health Warning Indicators</span>
                </div>
              </div>
              <Button 
                className="w-full md:w-auto" 
                onClick={onGenerateReport}
                disabled={isGeneratingReport || filteredEventsCount === 0}
              >
                {isGeneratingReport ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
                    Generating Advanced Report...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Generate Advanced Report
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 