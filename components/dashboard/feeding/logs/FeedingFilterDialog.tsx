import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRange } from 'react-day-picker';
import { format, addMonths, differenceInDays } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';

interface FeedingFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filterStatus: 'all' | 'fed' | 'unfed';
  setFilterStatus: (value: 'all' | 'fed' | 'unfed') => void;
  dateRange: DateRange;
  setDateRange: (value: DateRange) => void;
}

export function FeedingFilterDialog({
  open,
  onOpenChange,
  filterStatus,
  setFilterStatus,
  dateRange,
  setDateRange,
}: FeedingFilterDialogProps) {
  const handleReset = () => {
    setFilterStatus('all');
    const today = new Date();
    setDateRange({ from: today, to: today });
  };

  const validateDateRange = (from: Date | undefined, to: Date | undefined) => {
    if (from && to) {
      const daysDiff = differenceInDays(to, from);
      if (daysDiff > 30) {
        toast.error('Date range cannot exceed 30 days');
        return false;
      }
    }
    return true;
  };

  const handleDateSelect = (date: Date | undefined, isFrom: boolean) => {
    if (!date) return;

    const newDateRange = {
      ...dateRange,
      [isFrom ? 'from' : 'to']: date
    };

    // If selecting "from" date, ensure "to" date is within 30 days
    if (isFrom && newDateRange.to) {
      const maxDate = addMonths(date, 1);
      if (newDateRange.to > maxDate) {
        newDateRange.to = maxDate;
      }
    }

    // If selecting "to" date, ensure it's not before "from" date
    if (!isFrom && newDateRange.from && date < newDateRange.from) {
      toast.error('End date cannot be before start date');
      return;
    }

    if (validateDateRange(newDateRange.from, newDateRange.to)) {
      setDateRange(newDateRange);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter Feeding Events</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Status</h4>
            <Select value={filterStatus} onValueChange={(value: 'all' | 'fed' | 'unfed') => setFilterStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="fed">Fed</SelectItem>
                <SelectItem value="unfed">Not Fed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Date Range</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">From</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange?.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        format(dateRange.from, "LLL dd, y")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="single"
                      selected={dateRange?.from}
                      onSelect={(date) => handleDateSelect(date, true)}
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">To</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange?.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.to ? (
                        format(dateRange.to, "LLL dd, y")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="single"
                      selected={dateRange?.to}
                      onSelect={(date) => handleDateSelect(date, false)}
                      disabled={(date) => {
                        if (dateRange?.from) {
                          const maxDate = addMonths(dateRange.from, 1);
                          return date < dateRange.from || date > maxDate;
                        }
                        return date > new Date();
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 