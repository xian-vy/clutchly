import { Calendar } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FormData } from './types'

interface Props {
  form: UseFormReturn<FormData>
}

export function DetailsSection({ form }: Props) {
  return (
    <div className="space-y-3 2xl:space-y-4 border rounded-xl p-2 md:p-3 xl:p-4">
      <div className="flex items-center gap-1 text-sm 2xl:text-base font-medium">
        <Calendar className="h-4 w-4" />
        <h3>Details</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3 3xl:gap-5">
        <FormField
          control={form.control}
          name="shed_date"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="completeness"
          render={({ field }) => (
            <FormItem>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select completeness" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="full">Full Shed</SelectItem>
                  <SelectItem value="partial">Partial Shed</SelectItem>
                  <SelectItem value="retained">Retained Shed</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem className='col-span-2'>
              <FormControl>
                <Textarea
                  placeholder="Add notes ..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="photo_url"
          render={({ field }) => (
            <FormItem className='hidden'>
              <FormLabel>Photo URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter URL to shedding photo"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
} 