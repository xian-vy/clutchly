import { createClient } from "@/lib/supabase/client"
import { GeneticCalculation } from "@/lib/types/genetic-calculator"

export async function getGeneticCalculations() : Promise<GeneticCalculation[]> {
    const supabase = await createClient()
    const currentUser= await supabase.auth.getUser()
    const userId = currentUser.data.user?.id
        
    if (!userId) {
        console.error('Genetic History : No authenticated user found');
        throw new Error('Authentication required');
      }

    const { data: calculations, error } = await supabase
    .from('genetic_calculations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
    if (error) throw error
    return calculations as GeneticCalculation[]
  }
  