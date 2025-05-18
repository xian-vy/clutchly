import { getProfile } from '@/app/api/profiles/profiles';
import { Profile } from '@/lib/types/profile';
import { useQuery } from '@tanstack/react-query';
import React from 'react'

const CatalogNavigation = () => {
    
    const { data } = useQuery<Profile>({
        queryKey: ['profile2'],
        queryFn: getProfile,
    }); 

    const profile = Array.isArray(data) ? data[0] : data;
  
  return (
    <div className="flex justify-between mb-3 lg:mb-4 xl:mb-6">
            <div className="">
                <h1 className="text-lg sm:text-xl 2xl:text-2xl 3xl:!text-3xl font-bold capitalize">{profile.full_name || 'Clutchly'}</h1>
            </div>
            <div className="flex items-center gap-3 lg:gap-5">
                <span className='text-xs sm:text-[0.8rem] xl:text-sm'>About</span>
                <span className='text-xs sm:text-[0.8rem] xl:text-sm'>Contact</span>
            </div>
    </div>
  )
}

export default CatalogNavigation