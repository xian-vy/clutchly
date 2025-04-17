import { createClient } from '@/lib/supabase/client'
import { Reptile } from '@/lib/types/reptile'

const supabase = createClient()

// Interfaces for breeding reports
export interface BreedingStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalClutches: number
  totalEggs: number
  totalFertileEggs: number
  totalHatchlings: number
  successRate: number // percentage of fertile eggs that hatched
  projectsBySpecies: {
    species_id: string
    species_name: string
    count: number
  }[]
  fertileRateByMonth: {
    month: string // format: "YYYY-MM"
    fertile_rate: number
  }[]
  hatchRateBySpecies: {
    species_id: string
    species_name: string
    hatch_rate: number
    total_clutches: number
  }[]
}

export interface BreedingReportFilters {
  startDate?: string
  endDate?: string
  speciesIds?: string[]
  status?: string[]
}

// Get comprehensive breeding statistics
export async function getBreedingStats(filters?: BreedingReportFilters): Promise<BreedingStats> {
  const supabase = createClient()
  
  // Fetch all breeding projects based on filters
  let projectsQuery = supabase
    .from('breeding_projects')
    .select('*')
  
  // Apply filters if provided
  if (filters) {
    if (filters.startDate) {
      projectsQuery = projectsQuery.gte('start_date', filters.startDate)
    }
    if (filters.endDate) {
      projectsQuery = projectsQuery.lte('start_date', filters.endDate)
    }
    if (filters.speciesIds && filters.speciesIds.length > 0) {
      projectsQuery = projectsQuery.in('species_id', filters.speciesIds)
    }
    if (filters.status && filters.status.length > 0) {
      projectsQuery = projectsQuery.in('status', filters.status)
    }
  }
  
  const { data: projectsData, error: projectsError } = await projectsQuery
  
  if (projectsError) throw projectsError
  
  // Get all species data for the projects
  const speciesIds = [...new Set(projectsData.map(p => p.species_id))]
  const { data: speciesData, error: speciesError } = await supabase
    .from('species')
    .select('id, name')
    .in('id', speciesIds)
  
  if (speciesError) throw speciesError
  
  // Create a map of species IDs to species names
  const speciesMap = new Map()
  speciesData.forEach((species) => {
    speciesMap.set(species.id.toString(), species.name)
  })
  
  // Add species names to projects
  const projectsWithSpecies = projectsData.map(project => ({
    ...project,
    species: {
      name: speciesMap.get(project.species_id.toString()) || 'Unknown'
    }
  }))
  
  // Fetch all clutches related to these projects
  const projectIds = projectsData.map(p => p.id)
  
  let clutchesQuery = supabase
    .from('clutches')
    .select('*')
    .in('breeding_project_id', projectIds)
  
  const { data: clutchesData, error: clutchesError } = await clutchesQuery
  
  if (clutchesError) throw clutchesError
  
  // Fetch all hatchlings based on clutches
  const clutchIds = clutchesData.map(c => c.id)
  
  let hatchlingsQuery = supabase
    .from('reptiles')
    .select('*')
    .in('parent_clutch_id', clutchIds)
  
  const { data: hatchlingsData, error: hatchlingsError } = await hatchlingsQuery
  
  if (hatchlingsError) throw hatchlingsError
  
  // Calculate statistics
  const totalProjects = projectsData.length
  const activeProjects = projectsData.filter(p => p.status === 'active').length
  const completedProjects = projectsData.filter(p => p.status === 'completed').length
  const totalClutches = clutchesData.length
  const totalEggs = clutchesData.reduce((sum, clutch) => sum + (clutch.egg_count || 0), 0)
  const totalFertileEggs = clutchesData.reduce((sum, clutch) => sum + (clutch.fertile_count || 0), 0)
  const totalHatchlings = hatchlingsData.length
  
  // Calculate success rate - percentage of fertile eggs that hatched
  const successRate = totalFertileEggs > 0 
    ? Math.round((totalHatchlings / totalFertileEggs) * 100) 
    : 0
  
  // Projects grouped by species
  const projectsBySpecies = Object.values(
    projectsWithSpecies.reduce((acc: Record<string, any>, project) => {
      const speciesId = project.species_id
      const speciesName = project.species?.name || 'Unknown'
      
      if (!acc[speciesId]) {
        acc[speciesId] = {
          species_id: speciesId,
          species_name: speciesName,
          count: 0
        }
      }
      
      acc[speciesId].count++
      return acc
    }, {})
  )
  
  // Monthly fertile rates
  const clutchesByMonth: Record<string, { total: number, fertile: number }> = {}
  
  clutchesData.forEach(clutch => {
    const layDate = new Date(clutch.lay_date)
    const monthKey = `${layDate.getFullYear()}-${String(layDate.getMonth() + 1).padStart(2, '0')}`
    
    if (!clutchesByMonth[monthKey]) {
      clutchesByMonth[monthKey] = { total: 0, fertile: 0 }
    }
    
    clutchesByMonth[monthKey].total += clutch.egg_count || 0
    clutchesByMonth[monthKey].fertile += clutch.fertile_count || 0
  })
  
  const fertileRateByMonth = Object.entries(clutchesByMonth).map(([month, data]) => ({
    month,
    fertile_rate: data.total > 0 ? Math.round((data.fertile / data.total) * 100) : 0
  }))
  
  // Hatch rate by species
  const clutchesBySpecies: Record<string, { 
    species_name: string,
    total_eggs: number, 
    fertile_eggs: number,
    hatched: number,
    total_clutches: number
  }> = {}
  
  // First, map clutches to their projects to get species information
  const clutchToProject = projectsWithSpecies.reduce((acc: Record<string, any>, project) => {
    acc[project.id] = {
      species_id: project.species_id,
      species_name: project.species?.name || 'Unknown'
    }
    return acc
  }, {})
  
  // Then aggregate clutch data by species
  clutchesData.forEach(clutch => {
    const projectInfo = clutchToProject[clutch.breeding_project_id]
    if (!projectInfo) return
    
    const speciesId = projectInfo.species_id
    
    if (!clutchesBySpecies[speciesId]) {
      clutchesBySpecies[speciesId] = {
        species_name: projectInfo.species_name,
        total_eggs: 0,
        fertile_eggs: 0,
        hatched: 0,
        total_clutches: 0
      }
    }
    
    clutchesBySpecies[speciesId].total_eggs += clutch.egg_count || 0
    clutchesBySpecies[speciesId].fertile_eggs += clutch.fertile_count || 0
    clutchesBySpecies[speciesId].total_clutches += 1
  })
  
  // Count hatched by species
  hatchlingsData.forEach(hatchling => {
    // Find the clutch this hatchling belongs to
    const clutch = clutchesData.find(c => c.id === hatchling.parent_clutch_id)
    if (!clutch) return
    
    // Find the project this clutch belongs to
    const projectInfo = clutchToProject[clutch.breeding_project_id]
    if (!projectInfo) return
    
    const speciesId = projectInfo.species_id
    if (clutchesBySpecies[speciesId]) {
      clutchesBySpecies[speciesId].hatched += 1
    }
  })
  
  const hatchRateBySpecies = Object.entries(clutchesBySpecies).map(([speciesId, data]) => ({
    species_id: speciesId,
    species_name: data.species_name,
    hatch_rate: data.fertile_eggs > 0 ? Math.round((data.hatched / data.fertile_eggs) * 100) : 0,
    total_clutches: data.total_clutches
  }))
  
  return {
    totalProjects,
    activeProjects,
    completedProjects,
    totalClutches,
    totalEggs,
    totalFertileEggs,
    totalHatchlings,
    successRate,
    projectsBySpecies,
    fertileRateByMonth,
    hatchRateBySpecies
  }
}

// Get detailed breeding project data with clutches and hatchlings
export async function getDetailedBreedingProjects(filters?: BreedingReportFilters): Promise<any[]> {
  const supabase = createClient()
  
  // Fetch all breeding projects based on filters
  let projectsQuery = supabase
    .from('breeding_projects')
    .select('*')
  
  // Apply filters if provided
  if (filters) {
    if (filters.startDate) {
      projectsQuery = projectsQuery.gte('start_date', filters.startDate)
    }
    if (filters.endDate) {
      projectsQuery = projectsQuery.lte('start_date', filters.endDate)
    }
    if (filters.speciesIds && filters.speciesIds.length > 0) {
      projectsQuery = projectsQuery.in('species_id', filters.speciesIds)
    }
    if (filters.status && filters.status.length > 0) {
      projectsQuery = projectsQuery.in('status', filters.status)
    }
  }
  
  const { data: projects, error: projectsError } = await projectsQuery
  
  if (projectsError) throw projectsError
  
  // Get species data
  const speciesIds = [...new Set(projects.map(p => p.species_id))]
  const { data: speciesData, error: speciesError } = await supabase
    .from('species')
    .select('id, name')
    .in('id', speciesIds)
  
  if (speciesError) throw speciesError
  
  // Create a map of species IDs to species data
  const speciesMap = new Map()
  speciesData.forEach((species) => {
    speciesMap.set(species.id.toString(), { id: species.id, name: species.name })
  })
  
  // For each project, fetch related clutches and hatchlings
  const projectsWithDetails = await Promise.all(
    projects.map(async project => {
      // Add species data
      const species = speciesMap.get(project.species_id.toString()) || { name: 'Unknown' }
      
      // Fetch clutches for this project
      const { data: clutches, error: clutchesError } = await supabase
        .from('clutches')
        .select('*')
        .eq('breeding_project_id', project.id)
      
      if (clutchesError) throw clutchesError
      
      // For each clutch, fetch related hatchlings
      const clutchesWithHatchlings = await Promise.all(
        clutches.map(async clutch => {
          const { data: hatchlings, error: hatchlingsError } = await supabase
            .from('reptiles')
            .select('*')
            .eq('parent_clutch_id', clutch.id)
          
          if (hatchlingsError) throw hatchlingsError
          
          return {
            ...clutch,
            hatchlings: hatchlings || []
          }
        })
      )
      
      // Get parent reptiles and their morphs
      const { data: male, error: maleError } = await supabase
        .from('reptiles')
        .select('*')
        .eq('id', project.male_id)
        .single()
      
      if (maleError && maleError.code !== 'PGRST116') throw maleError // Ignore not found
      
      // Get male morph data
      let maleMorph = null
      if (male && male.morph_id) {
        const { data: morphData, error: morphError } = await supabase
          .from('morphs')
          .select('name')
          .eq('id', male.morph_id)
          .single()
        
        if (!morphError) {
          maleMorph = morphData
        }
      }
      
      // Add morph data to male
      const maleWithMorph = male ? {
        ...male,
        morph: maleMorph
      } : null
      
      const { data: female, error: femaleError } = await supabase
        .from('reptiles')
        .select('*')
        .eq('id', project.female_id)
        .single()
      
      if (femaleError && femaleError.code !== 'PGRST116') throw femaleError // Ignore not found
      
      // Get female morph data
      let femaleMorph = null
      if (female && female.morph_id) {
        const { data: morphData, error: morphError } = await supabase
          .from('morphs')
          .select('name')
          .eq('id', female.morph_id)
          .single()
        
        if (!morphError) {
          femaleMorph = morphData
        }
      }
      
      // Add morph data to female
      const femaleWithMorph = female ? {
        ...female,
        morph: femaleMorph
      } : null
      
      return {
        ...project,
        species,
        male: maleWithMorph,
        female: femaleWithMorph,
        clutches: clutchesWithHatchlings || []
      }
    })
  )
  
  return projectsWithDetails
}

// Get data for genetic outcome analysis
export async function getGeneticOutcomes(filters?: BreedingReportFilters): Promise<any> {
  // Get detailed projects first
  const detailedProjects = await getDetailedBreedingProjects(filters)
  
  // Analyze genetic outcomes by pairing types
  const outcomes = detailedProjects.reduce((acc: Record<string, any>, project) => {
    // Skip projects without both parents or clutches
    if (!project.male || !project.female || project.clutches.length === 0) {
      return acc
    }
    
    // Create a key for this pairing type (could be based on morphs)
    const maleMorph = project.male.morph?.name || 'Unknown'
    const femaleMorph = project.female.morph?.name || 'Unknown'
    const pairingKey = `${maleMorph} × ${femaleMorph}`
    
    if (!acc[pairingKey]) {
      acc[pairingKey] = {
        male_morph: maleMorph,
        female_morph: femaleMorph,
        total_clutches: 0,
        total_eggs: 0,
        total_fertile: 0,
        total_hatched: 0,
        hatched_morphs: {},
        projects_count: 0,
        projects: []
      }
    }
    
    // Count clutches and eggs
    project.clutches.forEach((clutch: any) => {
      acc[pairingKey].total_clutches++
      acc[pairingKey].total_eggs += clutch.egg_count || 0
      acc[pairingKey].total_fertile += clutch.fertile_count || 0
      acc[pairingKey].total_hatched += clutch.hatchlings.length
      
      // Count morphs in offspring
      clutch.hatchlings.forEach((hatchling: Reptile) => {
        const hatchlingMorph = hatchling.visual_traits?.join(', ') || 'Unknown'
        if (!acc[pairingKey].hatched_morphs[hatchlingMorph]) {
          acc[pairingKey].hatched_morphs[hatchlingMorph] = 0
        }
        acc[pairingKey].hatched_morphs[hatchlingMorph]++
      })
    })
    
    // Track project info
    acc[pairingKey].projects_count++
    acc[pairingKey].projects.push({
      id: project.id,
      name: project.name,
      start_date: project.start_date
    })
    
    return acc
  }, {})
  
  // Convert to array and calculate percentages
  const outcomesArray = Object.entries(outcomes).map(([key, data]: [string, any]) => {
    // Calculate success percentages
    const fertility_rate = data.total_eggs > 0 
      ? Math.round((data.total_fertile / data.total_eggs) * 100) 
      : 0
    
    const hatch_rate = data.total_fertile > 0 
      ? Math.round((data.total_hatched / data.total_fertile) * 100) 
      : 0
    
    // Convert morph distribution to percentages
    const morph_distribution = Object.entries(data.hatched_morphs).map(([morph, count]: [string, any]) => ({
      morph,
      count,
      percentage: data.total_hatched > 0 
        ? Math.round((count / data.total_hatched) * 100) 
        : 0
    }))
    
    return {
      pairing: key,
      male_morph: data.male_morph,
      female_morph: data.female_morph,
      total_clutches: data.total_clutches,
      total_eggs: data.total_eggs,
      total_fertile: data.total_fertile,
      total_hatched: data.total_hatched,
      fertility_rate,
      hatch_rate,
      morph_distribution,
      projects_count: data.projects_count,
      projects: data.projects
    }
  })
  
  return outcomesArray
} 