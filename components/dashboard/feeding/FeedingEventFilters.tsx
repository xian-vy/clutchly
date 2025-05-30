'use client';

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useGroupedFeederSelect } from '@/lib/hooks/useGroupedFeederSelect';
import { Check, Loader2, Search } from 'lucide-react';

interface FeedingEventFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: 'species' | 'name' | 'morph' | 'all';
  onSortChange: (value: 'species' | 'name' | 'morph' | 'all') => void;
  onSetFeederForAll: (feederSizeId: string) => void;
  onFeedAll: () => void;
  feedingAll: boolean;
}

export function FeedingEventFilters({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onSetFeederForAll,
  onFeedAll,
  feedingAll
}: FeedingEventFiltersProps) {
  const { FeederSelect } = useGroupedFeederSelect();


  return (
    <div className="flex flex-col sm:flex-row justify-between sm:justify-end items-stretch sm:items-center gap-2 w-full">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-none sm:w-[200px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reptiles..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 text-xs"
          />
        </div>
        <Select 
          value={sortBy}
          onValueChange={(value) => onSortChange(value as 'species' | 'name' | 'morph' | 'all')}
        >
          <SelectTrigger className="w-[120px] !text-xs dark:!border-0">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Sort By</SelectItem>
            <SelectItem value="name">Reptile Name</SelectItem>
            <SelectItem value="species">Species</SelectItem>
            <SelectItem value="morph">Morph</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="w-full sm:w-[150px]">
          <FeederSelect
            value=""
            onValueChange={onSetFeederForAll}
            placeholder="Set feeder for all"
          />
        </div>
        <Button 
          variant="default" 
          className="text-xs w-[150px] sm:w-auto"
          onClick={onFeedAll}
          disabled={feedingAll}
        >
          {feedingAll ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              Feeding All...
            </>
          ) : (
            <>
              <Check className="h-3 w-3" />
              Feed All
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 