'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Stethoscope, Droplets, Thermometer, Scale, Clock, Calendar } from 'lucide-react';
import { HealthLogEntry } from '@/lib/types/health';
import { Reptile } from '@/lib/types/reptile';

interface RecommendationsTabProps {
  filteredLogs: HealthLogEntry[];
  reptiles: Reptile[];
  categories: any[];
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

export function RecommendationsTab({ 
  filteredLogs, 
  reptiles, 
  categories, 
  stats 
}: RecommendationsTabProps) {
  // Generate health recommendations based on the data
  const getRecommendations = () => {
    const recommendations = [];
    
    // Check for high severity active issues
    const highSeverityActive = filteredLogs.filter(
      log => !log.resolved && log.severity === 'high'
    );
    
    if (highSeverityActive.length > 0) {
      recommendations.push({
        type: 'urgent',
        title: 'Urgent Health Concerns',
        description: `You have ${highSeverityActive.length} high severity active health issues that require immediate attention.`,
        icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
        action: 'Review these issues and consult with a veterinarian if necessary.'
      });
    }
    
    // Check for reptile-specific recommendations
    const reptileIssues: Record<string, number> = {};
    filteredLogs.forEach(log => {
      if (!log.resolved) {
        reptileIssues[log.reptile_id] = (reptileIssues[log.reptile_id] || 0) + 1;
      }
    });
    
    // Find reptiles with multiple active issues
    Object.entries(reptileIssues).forEach(([reptileId, count]) => {
      if (count >= 2) {
        const reptile = reptiles.find(r => r.id === reptileId);
        if (reptile) {
          recommendations.push({
            type: 'reptile',
            title: `${reptile.name} Needs Attention`,
            description: `${reptile.name} has ${count} active health issues.`,
            icon: <Stethoscope className="h-5 w-5 text-orange-500" />,
            action: 'Schedule a health check and review husbandry conditions.'
          });
        }
      }
    });
    
    // Check for environmental recommendations based on categories
    const categoryCounts: Record<string, number> = {};
    filteredLogs.forEach(log => {
      if (!log.resolved) {
        const category = categories.find(c => c.id === log.category_id);
        if (category) {
          categoryCounts[category.label] = (categoryCounts[category.label] || 0) + 1;
        }
      }
    });
    
    // Respiratory issues might indicate humidity problems
    if (categoryCounts['Respiratory'] > 0) {
      recommendations.push({
        type: 'environment',
        title: 'Humidity Management',
        description: 'Respiratory issues may indicate improper humidity levels.',
        icon: <Droplets className="h-5 w-5 text-blue-500" />,
        action: 'Check and adjust humidity levels in enclosures. Consider using a hygrometer.'
      });
    }
    
    // Temperature-related issues
    if (categoryCounts['Temperature'] > 0) {
      recommendations.push({
        type: 'environment',
        title: 'Temperature Regulation',
        description: 'Temperature-related health issues detected.',
        icon: <Thermometer className="h-5 w-5 text-orange-500" />,
        action: 'Verify temperature gradients and heating equipment functionality.'
      });
    }
    
    // Weight-related issues
    if (categoryCounts['Weight'] > 0) {
      recommendations.push({
        type: 'diet',
        title: 'Feeding Schedule Review',
        description: 'Weight-related health issues detected.',
        icon: <Scale className="h-5 w-5 text-green-500" />,
        action: 'Review feeding schedules and portion sizes. Consider consulting a nutrition specialist.'
      });
    }
    
    // If no specific issues, provide general maintenance reminder
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'maintenance',
        title: 'Routine Health Check',
        description: 'No active health issues detected. Time for routine maintenance.',
        icon: <Clock className="h-5 w-5 text-blue-500" />,
        action: 'Schedule routine health checks and update records.'
      });
    }
    
    return recommendations;
  };
  
  const recommendations = getRecommendations();
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Health Recommendations</CardTitle>
          <CardDescription>
            Actionable insights based on your health data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex gap-4 p-4 rounded-lg border">
                <div className="flex-shrink-0 mt-1">
                  {rec.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium">{rec.title}</h3>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                  <p className="text-sm font-medium text-primary mt-2">{rec.action}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Preventive Care Schedule</CardTitle>
          <CardDescription>
            Recommended preventive care based on your collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
              <div className="flex-shrink-0">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Monthly Health Check</h3>
                <p className="text-sm text-muted-foreground">
                  Visual inspection, weight check, and behavior assessment
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
              <div className="flex-shrink-0">
                <Stethoscope className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Quarterly Vet Visit</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive health examination for all reptiles
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
              <div className="flex-shrink-0">
                <Thermometer className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Bi-annual Environment Check</h3>
                <p className="text-sm text-muted-foreground">
                  Verify temperature, humidity, and lighting systems
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
              <div className="flex-shrink-0">
                <Scale className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Annual Breeding Assessment</h3>
                <p className="text-sm text-muted-foreground">
                  Evaluate breeding pairs and prepare for upcoming season
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Health Resources</CardTitle>
          <CardDescription>
            Useful resources for reptile health management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium">Common Health Issues</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Respiratory infections</li>
                <li>• Shedding problems</li>
                <li>• Parasites</li>
                <li>• Metabolic bone disease</li>
                <li>• Dehydration</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Emergency Signs</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Sudden weight loss</li>
                <li>• Unusual lethargy</li>
                <li>• Discolored scales</li>
                <li>• Difficulty breathing</li>
                <li>• Refusal to eat for extended periods</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 