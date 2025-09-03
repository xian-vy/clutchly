import { useEffect } from 'react'
import { useResource } from '../useResource'
import { NewReptile, Reptile } from '@/lib/types/reptile'
import { createReptile, deleteReptile, getReptiles, updateReptile } from '@/app/api/reptiles/reptiles'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/authStore'
import { CACHE_KEYS } from '@/lib/constants/cache_keys'

const useRealtimeReptiles = () => {
    const { user, isLoading :userLoading, organization} = useAuthStore();

    const supabase  = createClient()

    const {
      addResourceToCache,
      updateResourceInCache,
      removeResourceFromCache,
    } = useResource<Reptile, NewReptile>({
      resourceName: 'Reptile',
      queryKey: [CACHE_KEYS.REPTILES],
      getResources: async () => {
        if (!organization?.id) return [];
        return getReptiles(organization);
      },
      createResource: createReptile,
      updateResource: updateReptile,
      deleteResource: deleteReptile,
    })

    useEffect(() => {   
        if (!organization?.id || userLoading) return;
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
        userLoading
    ]);
}

export default useRealtimeReptiles
