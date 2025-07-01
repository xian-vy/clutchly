import  { useEffect } from 'react'
import { useFeedersStore } from '../stores/feedersStore';
import { useSpeciesStore } from '../stores/speciesStore';
import { useAuthStore } from '../stores/authStore';
import { useMorphsStore } from '../stores/morphsStore';

const useInitializeCommonData = () => {
    const { feederSizes,feederTypes,fetchFeederSizes,fetchFeederTypes } = useFeedersStore();
    const { species, fetchSpecies,fetchInitialSpecies } = useSpeciesStore();
    const { morphs, downloadCommonMorphs  } = useMorphsStore();
    const {organization, isLoading} = useAuthStore();

      useEffect(() => {
          if (species.length !== 0 || isLoading) return
          if (!organization) return
        
          //org selected species
          const speciesIds = organization.selected_species
          if (speciesIds?.length === 0) {
              fetchInitialSpecies()
          }else {
              fetchSpecies(organization)
          }
      }, [fetchSpecies,species,organization,isLoading,fetchInitialSpecies]);
    
      useEffect(() => {
        if (feederSizes.length !== 0) return
        if (!organization) return

          fetchFeederSizes(organization)
      }, [fetchFeederSizes,feederSizes,organization])
    
      useEffect(() => {
        if (feederTypes.length !== 0) return
        if (!organization) return

          fetchFeederTypes(organization)
      }, [fetchFeederTypes,feederTypes,organization])

      useEffect(() => {
    
         async function fetchMorphs() {
            if (morphs.length !== 0) return
            if (!organization) return

            const speciesIds = organization.selected_species
            if (!speciesIds) {
              console.log('Download Morph Failed. No species IDs found in organization');
              return;
            }
             console.log("Downloading common morphs...");
             await downloadCommonMorphs(organization,speciesIds);
          }

          fetchMorphs()
        
      }, [organization, morphs, downloadCommonMorphs]);
   
}

export default useInitializeCommonData
