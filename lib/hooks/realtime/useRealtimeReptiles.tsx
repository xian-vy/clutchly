import { getCurrentUser, getOrganization } from '@/app/api/organizations/organizations'
import { Organization } from '@/lib/types/organizations'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useResource } from '../useResource'
import { NewReptile, Reptile } from '@/lib/types/reptile'
import { createReptile, deleteReptile, getReptiles, updateReptile } from '@/app/api/reptiles/reptiles'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner';
import { User } from '@/lib/types/users'

const useRealtimeReptiles = () => {
    const { data: organization, isLoading : orgLoading } = useQuery<Organization>({
        queryKey: ['organization2'],
        queryFn: getOrganization
      })
      const { data: user, isLoading : userLoading } = useQuery<User>({
        queryKey: ['user2'],
        queryFn: getCurrentUser,
      })    
    const supabase  = createClient()

    const {
      addResourceToCache,
      updateResourceInCache,
      removeResourceFromCache,
    } = useResource<Reptile, NewReptile>({
      resourceName: 'Reptile',
      queryKey: ['reptiles'],
      getResources: getReptiles,
      createResource: createReptile,
      updateResource: updateReptile,
      deleteResource: deleteReptile,
    })

    useEffect(() => {   
        if (!organization?.id || orgLoading) return;
        const channel = supabase
        .channel("reptiles" + organization.id)
        .on("postgres_changes", { event: "*", schema: "public", table: "reptiles" }, async (payload) => {
            const newReptile = payload.new as Reptile;

            //if (payload.new.user_id === user.id) return // Ignore changes made by the source user

            if (payload.eventType === "INSERT") {
                addResourceToCache(newReptile);
            } else if (payload.eventType === "UPDATE") {
                updateResourceInCache(newReptile);
            } else if (payload.eventType === "DELETE") {
                removeResourceFromCache(payload.old.id);
            }
            console.log("Realtime reptile event:", payload.eventType, payload.new, payload.old);
            toast.success(`Reptile ${payload.eventType.toLowerCase()}d successfully`);
        })
        .subscribe();

        return () => {
            channel.unsubscribe();
        };   
    }, [
        organization,
        user, 
        supabase, 
        addResourceToCache,
        updateResourceInCache,
        removeResourceFromCache,
        orgLoading,
        userLoading
    ]);
}

export default useRealtimeReptiles
