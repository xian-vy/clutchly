import { createClient } from "@/lib/supabase/client";
import { getUserAndOrganizationInfo } from "../utils_client";
import { SheddingWithReptile } from "@/lib/types/shedding";
import { subMonths } from "date-fns";

export async function getSheddingReports(months: number = 1): Promise<SheddingWithReptile[]> {
    const supabase = createClient()
    const { organization } = await getUserAndOrganizationInfo()
    
    const startDate = subMonths(new Date(), months).toISOString()
    
    const { data, error } = await supabase
    .from('shedding')
    .select(`
      *,
      reptile:reptiles (
        id,
        name,
        reptile_code,
        location:locations (
          id,
          label,
          rack:racks (
            id,
            name,
            room:rooms (
              id,
              name
            )
          )
        )
      )
    `)
    .order('shed_date', { ascending: false })
    .eq('org_id', organization?.id)
    .gte('shed_date', startDate)
    
    if (error) throw error
    
    return data as SheddingWithReptile[]
}