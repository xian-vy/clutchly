"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { format, subDays } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

interface DatePickerWithRangeProps {
  date?: DateRange | undefined
  onDateChange: (date: DateRange | undefined) => void
  className?: string
  align?: "center" | "start" | "end"
  calendarClassName?: string
}

export function DatePickerWithRange({
  date,
  onDateChange,
  className,
  align = "end",
  calendarClassName,
}: DatePickerWithRangeProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  // Function to apply a preset date range
  const handleSelectPreset = (days: number) => {
    const end = new Date()
    const start = subDays(end, days)
    const newRange = { from: start, to: end }
    onDateChange(newRange)
    setIsOpen(false)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size="sm"
            className={cn(
              "w-[180px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <div className="p-3 border-b">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Select Range</h4>
              <Select 
                onValueChange={(value) => handleSelectPreset(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a preset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={2}
            className={cn("p-3", calendarClassName)}
          />
          <div className="flex p-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onDateChange(undefined)
                setIsOpen(false)
              }}
              className="mr-auto"
            >
              Clear
            </Button>
            <Button
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 