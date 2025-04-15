import { Card, CardContent } from "@/components/ui/card";

interface TooltipData {
  name: string;
  value: number;
  payload: {
    parent: Array<{ name: string; value: number }>;
  };
}

export const CustomTooltip = ({ 
    active, 
    payload 
  }: {
    active?: boolean;
    payload?: Array<TooltipData>;
  }) => {
    if (active && payload && payload.length) {
      const parentData = payload[0].payload.parent;
      const total = parentData.reduce((sum, item) => sum + item.value, 0);
      const percentage = (payload[0].value / total) * 100;

      return (
        <Card className="shadow-md border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75">
          <CardContent className="p-3 space-y-1">
            <p className="font-medium text-foreground/90">{payload[0].name}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Count: {payload[0].value}</span>
              <span>•</span>
              <span>{percentage.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>
      );
    }
    return null;
  };


  export const HealthIssuesToolTip = ({ 
    active, 
    payload, 
    label 
  }: {
    active?: boolean;
    payload?: {
      name: string;
      value: number;
      dataKey: string;
      color: string;
    }[];
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const activeIssues = payload[0].value;
      const resolvedIssues = payload[1].value;
      const total = activeIssues + resolvedIssues;
  
      return (
        <Card className="shadow-md border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75">
          <CardContent className="p-3 space-y-2">
            <p className="font-medium text-foreground/90">{label}</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-3 h-3 rounded-full bg-[#FF8042]" />
                <span>Active: {activeIssues}</span>
                <span>•</span>
                <span>{((activeIssues / total) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-3 h-3 rounded-full bg-[#00C49F]" />
                <span>Resolved: {resolvedIssues}</span>
                <span>•</span>
                <span>{((resolvedIssues / total) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    return null;
  };


  export const MonthlyTrendsTooltip = ({ 
      active, 
      payload, 
      label 
    }: {
      active?: boolean;
      payload?: {
        name: string;
        value: number;
        color: string;
      }[];
      label?: string;
    }) => {
      if (active && payload && payload.length) {
        return (
          <Card className="shadow-md border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75 min-w-[160px]">
            <CardContent className="p-3 space-y-2">
              <p className="font-medium text-foreground/90">{label}</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-3 h-3 rounded-full bg-[#8884d8]" />
                  <span>Total: {payload[0].value}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-3 h-3 rounded-full bg-[#FF8042]" />
                  <span>Active: {payload[1].value}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-3 h-3 rounded-full bg-[#00C49F]" />
                  <span>Resolved: {payload[2].value}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      }
      return null;
    };


  export const CategoryTooltip = ({ 
      active, 
      payload, 
      label 
    }: {
      active?: boolean;
      payload?: {
        name: string;
        value: number;
        color: string;
      }[];
      label?: string;
    }) => {
      if (active && payload && payload.length) {
        return (
          <Card className="shadow-md border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75 min-w-[160px]">
            <CardContent className="p-3 space-y-2">
              <p className="font-medium text-foreground/90">{label}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-3 h-3 rounded-full bg-[#8884d8]" />
                <span>Issues: {payload[0].value}</span>
              </div>
            </CardContent>
          </Card>
        );
      }
      return null;
    };


  export const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
