'use client';

import { createReptile, deleteReptile, getReptiles, updateReptile } from '@/app/api/reptiles/reptiles';
import { getHealthLogs } from '@/app/api/health/entries';
import { getGrowthEntries } from '@/app/api/growth/entries';
import { getBreedingProjects } from '@/app/api/breeding/projects';
import { getClutches } from '@/app/api/breeding/clutches';
import { useResource } from '@/lib/hooks/useResource';
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { useSpeciesStore } from '@/lib/stores/speciesStore';
import { Reptile, NewReptile } from '@/lib/types/reptile';
import { HealthLogEntry } from '@/lib/types/health';
import { GrowthEntry } from '@/lib/types/growth';
import { BreedingProject, Clutch } from '@/lib/types/breeding';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { StatsCards } from './StatsCards';
import { ActionItems } from './ActionItems';
import { RecentActivity } from './RecentActivity';
import { CollectionOverview } from './CollectionOverview';
import { useQuery } from '@tanstack/react-query';

export function DashboardOverviewTab() {
  const [allClutches, setAllClutches] = useState<Clutch[]>([]);
  
  // Get reptiles data using useResource hook
  const {
    resources: reptiles,
    isLoading: reptilesLoading,
  } = useResource<Reptile, NewReptile>({
    resourceName: 'Reptile',
    queryKey: ['reptiles'],
    getResources: getReptiles,
    createResource: createReptile,
    updateResource: updateReptile,
    deleteResource: deleteReptile,
  });
  
  // Get species and morph data from their respective stores
  const { species, isLoading: speciesLoading } = useSpeciesStore();
  const { morphs, isLoading: morphsLoading } = useMorphsStore();
  
  // Fetch health logs using React Query
  const { data: healthLogs = [], isLoading: healthLoading } = useQuery({
    queryKey: ['health-logs'],
    queryFn: getHealthLogs,
  });
  
  // Fetch growth entries using React Query
  const { data: growthEntries = [], isLoading: growthLoading } = useQuery({
    queryKey: ['growth-entries'],
    queryFn: getGrowthEntries,
  });
  
  // Fetch breeding projects using React Query
  const { data: breedingProjects = [], isLoading: breedingLoading } = useQuery({
    queryKey: ['breeding-projects'],
    queryFn: getBreedingProjects,
  });
  
  // Fetch clutches for all breeding projects
  useEffect(() => {
    async function fetchAllClutches() {
      if (!breedingProjects.length) return;
      
      const clutchPromises = breedingProjects.map(project => getClutches(project.id));
      const clutchesArrays = await Promise.all(clutchPromises);
      
      // Flatten the array of arrays
      const allClutches = clutchesArrays.flat();
      setAllClutches(allClutches);
    }
    
    fetchAllClutches();
  }, [breedingProjects]);
  
  const isLoading = 
    reptilesLoading || 
    speciesLoading || 
    morphsLoading || 
    healthLoading || 
    growthLoading || 
    breedingLoading;
  
  if (isLoading) {
    return (
      <div className='w-full flex flex-col justify-center items-center min-h-[70vh]'>
        <Loader2 className='w-6 h-6 animate-spin text-black dark:text-white' />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      
      {/* Stats cards */}
      <StatsCards 
        reptiles={reptiles} 
        healthLogs={healthLogs} 
        breedingProjects={breedingProjects} 
        growthEntries={growthEntries} 
      />
      
      {/* Action items and Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <ActionItems 
          reptiles={reptiles}
          healthLogs={healthLogs}
          breedingProjects={breedingProjects}
          growthEntries={growthEntries}
          clutches={allClutches}
        />
        
        <RecentActivity 
          reptiles={reptiles}
          healthLogs={healthLogs}
          growthEntries={growthEntries}
        />
      </div>
      
      {/* Collection Overview */}
      <CollectionOverview 
        reptiles={reptiles}
        healthLogs={healthLogs}
        breedingProjects={breedingProjects}
        species={species}
        morphs={morphs}
      />
    </div>
  );
} 