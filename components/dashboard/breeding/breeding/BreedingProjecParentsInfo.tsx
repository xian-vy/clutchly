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
    <div className=" flex justify-center items-start p-5 gap-3 sm:gap-5 md:gap-8 xl:gap-10 2xl:gap-16 border rounded-md my-5">
        <div className='min-w-[40%] lg:min-w-[30%] flex flex-col items-center gap-1'>
            <p className='text-sm xl:text-base text-center  flex items-center gap-1 font-semibold !leading-[1.1]'>
                {reptileMap.get(project.male_id)?.name || 'Unknown'}
                <Mars className="h-3 w-3 text-blue-400 shrink-0"/>
            </p>
            <span className='text-[0.7rem] sm:text-xs text-muted-foreground'>{reptileMap.get(project.male_id)?.reptile_code || '--'}</span>
            <Badge variant="default">{reptileMap.get(project.male_id)?.morphName} </Badge>
            <div className='space-y-1 xl:space-y-2 mt-4'>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {reptileMap.get(project.male_id)?.visuals?.length === 0  &&
                        <span className='text-xs text-muted-foreground'>No Visual Traits</span>
                    }
                    {reptileMap.get(project.male_id)?.visuals?.map((visualtrait, index) =>
                        <Badge key={index}  variant="secondary" className='text-nowrap text-[0.7rem]'>{visualtrait}</Badge>
                    )}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {reptileMap.get(project.male_id)?.hets?.length === 0  &&
                        <span className='text-xs text-muted-foreground'>No Het Traits</span>
                    }
                    {reptileMap.get(project.male_id)?.hets?.map((het, index) =>
                        <Badge key={index}  variant="secondary"  className='text-nowrap text-[0.7rem]'>{het.percentage} {" % ph "}{het.trait}</Badge>
                    )}
                </div>
            </div>
        </div>
        <div className="my-auto">
            <X strokeWidth={1} className='text-muted-foreground h-4 w-4 sm:w-5 sm:h-5'/>
        </div>              
        <div  className='min-w-[40%] lg:min-w-[30%] flex flex-col items-center  gap-1'>
            <p className='text-sm xl:text-base flex items-center gap-1 font-semibold !leading-[1.1]'>
                {reptileMap.get(project.female_id)?.name || 'Unknown'}
                <Venus className="h-3 w-3 text-red-500 shrink-0"/>
            </p>
            <span className='text-[0.7rem] sm:text-xs text-muted-foreground'>{reptileMap.get(project.female_id)?.reptile_code || '--'}</span>
            <Badge variant="default">{reptileMap.get(project.female_id)?.morphName} </Badge>
            <div className='space-y-1 xl:space-y-2 mt-4'>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {reptileMap.get(project.female_id)?.visuals?.length === 0  &&
                    <span className='text-xs text-muted-foreground'>No Visual Traits</span>
                    }
                    {reptileMap.get(project.female_id)?.visuals?.map((visualtrait, index) =>
                    <Badge key={index}  variant="secondary" className='text-nowrap text-[0.7rem]'>{visualtrait}</Badge>
                    )}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {reptileMap.get(project.female_id)?.hets?.length === 0  &&
                    <span className='text-xs text-muted-foreground'>No Het Traits</span>
                    }
                    {reptileMap.get(project.female_id)?.hets?.map((het, index) =>
                    <Badge key={index}  variant="secondary"  className='text-nowrap text-[0.7rem]'>{het.percentage} {" % ph "}{het.trait}</Badge>
                    )}
                </div>
            </div>
        </div>
    </div>
  )
}

export default BreedingProjecParentsInfo