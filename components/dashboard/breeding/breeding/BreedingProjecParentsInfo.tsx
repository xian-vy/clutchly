import { Badge } from '@/components/ui/badge';
import { BreedingProject } from '@/lib/types/breeding';
import {  ReptileGeneInfo } from '@/lib/types/reptile';
import { Mars, Venus, X } from 'lucide-react';
import React from 'react'
interface Props {
    reptileMap :  Map<string,ReptileGeneInfo>;
    project: BreedingProject;
}
const BreedingProjecParentsInfo = ({reptileMap,project} : Props) => {
  return (
    <div className="flex items-start justify-center py-5 gap-10 2xl:gap-16 border rounded-md my-5">
        <div className='flex flex-col items-center gap-1'>
            <p className='text-sm xl:text-base text-center  flex gap-1 font-semibold'>
                {reptileMap.get(project.male_id)?.name || 'Unknown'}
                <Mars className="h-4 w-4 text-blue-400"/>
            </p>
            <p className='text-xs xl:text-sm text-center '> {reptileMap.get(project.male_id)?.morphName}</p>
            <div className='space-y-1'>
                <div className="flex items-center justify-center gap-1.5">
                    {reptileMap.get(project.male_id)?.visuals?.length === 0  &&
                        <span className='text-xs text-red-500 dark:text-red-300'>No Visual Traits</span>
                    }
                    {reptileMap.get(project.male_id)?.visuals?.map((visualtrait, index) =>
                        <Badge key={index}  variant="secondary" className='text-[0.7rem]'>{visualtrait}</Badge>
                    )}
                </div>
                <div className="flex  items-center justify-center gap-1.5">
                    {reptileMap.get(project.male_id)?.hets?.length === 0  &&
                        <span className='text-xs text-red-500 dark:text-red-300'>No Het Traits</span>
                    }
                    {reptileMap.get(project.male_id)?.hets?.map((het, index) =>
                        <Badge key={index}  variant="secondary"  className='text-[0.7rem]'>{het.percentage} {" % ph "}{het.trait}</Badge>
                    )}
                </div>
            </div>
        </div>
        <div className="my-auto">
            <X strokeWidth={1.5} className='text-muted-foreground'/>
        </div>                        
        <div  className='flex flex-col items-center  gap-1'>
            <p className='text-sm xl:text-base flex gap-1 font-semibold'>
                {reptileMap.get(project.female_id)?.name || 'Unknown'}
                <Venus className="h-4 w-4 text-red-500"/>
            </p>
            <p className='text-xs xl:text-sm  text-center'> {reptileMap.get(project.female_id)?.morphName} </p>
            <div className='space-y-1'>
                <div className="flex items-center justify-center gap-1.5">
                    {reptileMap.get(project.female_id)?.visuals?.length === 0  &&
                    <span className='text-xs text-red-500 dark:text-red-300'>No Visual Traits</span>
                    }
                    {reptileMap.get(project.female_id)?.visuals?.map((visualtrait, index) =>
                    <Badge key={index}  variant="secondary" className='text-[0.7rem]'>{visualtrait}</Badge>
                    )}
                </div>
                <div className="flex  items-center justify-center gap-1.5">
                    {reptileMap.get(project.female_id)?.hets?.length === 0  &&
                    <span className='text-xs text-red-500 dark:text-red-300'>No Het Traits</span>
                    }
                    {reptileMap.get(project.female_id)?.hets?.map((het, index) =>
                    <Badge key={index}  variant="secondary"  className='text-[0.7rem]'>{het.percentage} {" % ph "}{het.trait}</Badge>
                    )}
                </div>
            </div>
        </div>
    </div>
  )
}

export default BreedingProjecParentsInfo