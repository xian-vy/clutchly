'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Turtle, Heart, LineChart, Users } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Reptiles",
      value: "0",
      icon: Turtle,
      description: "Active reptiles in your collection",
    },
    {
      title: "Health Checks",
      value: "0",
      icon: Heart,
      description: "Scheduled for this week",
    },
    {
      title: "Growth Records",
      value: "0",
      icon: LineChart,
      description: "Updates needed this week",
    },
    {
      title: "Breeding Pairs",
      value: "0",
      icon: Users,
      description: "Active breeding projects",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground pt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
