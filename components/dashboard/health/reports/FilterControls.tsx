'use client';

import { getReptiles } from '@/app/api/reptiles/reptiles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGroupedReptileSelect } from '@/lib/hooks/useGroupedReptileSelect';
import { HealthCategory } from '@/lib/types/health';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Filter } from 'lucide-react';

interface FilterControlsProps {
  categories: HealthCategory[];
  selectedReptile: string | null;
  setSelectedReptile: (value: string | null) => void;
  dateRange: { start: string; end: string };
  setDateRange: (value: { start: string; end: string }) => void;
  severityFilter: string | null;
  setSeverityFilter: (value: string | null) => void;
  statusFilter: string | null;
  setStatusFilter: (value: string | null) => void;
  categoryFilter: string | null;
  setCategoryFilter: (value: string | null) => void;
  resetFilters: () => void;
  filteredLogsCount: number;
}

export function FilterControls({ 
  categories, 
  selectedReptile, 
  setSelectedReptile, 
  dateRange, 
  setDateRange, 
  severityFilter, 
  setSeverityFilter, 
  statusFilter, 
  setStatusFilter, 
  categoryFilter, 
  setCategoryFilter,
  resetFilters,
  filteredLogsCount
}: FilterControlsProps) {
  const { data: reptiles = [] } = useQuery({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  })
 
  const { ReptileSelect } = useGroupedReptileSelect({filteredReptiles: reptiles});


  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4 mb-6">

       <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
            <ReptileSelect
                value={selectedReptile || undefined}
                onValueChange={(value) => setSelectedReptile(value === 'all' ? null : value)}
                placeholder="Select a reptile"
            />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select
            value={categoryFilter || undefined}
            onValueChange={(value) => setCategoryFilter(value === 'all' ? null : value)}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Severity</label>
          <Select
            value={severityFilter || undefined}
            onValueChange={(value) => setSeverityFilter(value === 'all' ? null : value)}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder="All Severities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select
            value={statusFilter || undefined}
            onValueChange={(value) => setStatusFilter(value === 'all' ? null : value)}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Start Date</label>
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">End Date</label>
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-start items-center mb-5">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetFilters}
          >
            <Filter className="mr-1 h-4 w-4" />
            Reset Filters
          </Button>
          <span className="text-sm text-muted-foreground">
            {filteredLogsCount} records found
          </span>
        </div>
      </div>
    </>
  );
} 