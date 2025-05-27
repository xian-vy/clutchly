import { createClient } from "@/lib/supabase/client"
import { GeneticCalculation } from "@/lib/types/genetic-calculator"
import { getUserAndOrganizationInfo } from "../utils_client";

export async function getGeneticCalculations() : Promise<GeneticCalculation[]> {
    const supabase = await createClient()
    const { organization } = await getUserAndOrganizationInfo()
        
    if (!organization) {
        console.error('Genetic History : No authenticated user found');
        throw new Error('Authentication required');
      }

    const { data: calculations, error } = await supabase
    .from('genetic_calculations')
    .select('*')
    .eq('org_id', organization.id)
    .order('created_at', { ascending: false });
  
    if (error) throw error
    return calculations as GeneticCalculation[]
  }
  