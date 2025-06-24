import { Badge } from '@/components/ui/badge';
import { BreedingProject } from '@/lib/types/breeding';
import { ReptileGeneInfo } from '@/lib/types/reptile';
import { Mars, Venus } from 'lucide-react';
import React from 'react'
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface Props {
    reptileMap: Map<string, ReptileGeneInfo>;
    project: BreedingProject;
}

const ParentCard = ({ reptile, gender }: { reptile: ReptileGeneInfo | undefined, gender: 'male' | 'female' }) => {
    if (!reptile) return (
        <Card className="w-full p-4 flex flex-col items-center  shadow-none">
             <p className="text-[0.8rem] sm:text-sm md:text-base font-semibold flex items-center gap-1.5 sm:gap-2">
                {gender === 'male' ? 
                    <Mars className="h-4 w-4 text-blue-400"/> : 
                    <Venus className="h-4 w-4 text-red-500"/>}
                Unknown
            </p>
            <p className="text-sm text-muted-foreground">No {gender === 'male' ? 'Male' : 'Female'} Selected</p>
        </Card>
    )

    return (
        <Card className="w-full p-3 sm:p-4 flex flex-col items-center shadow-none">
            <div className="flex flex-col items-center gap-1 mb-3">
                <p className="text-[0.8rem] sm:text-sm md:text-base font-semibold flex items-center gap-1.5 sm:gap-2">
                {gender === 'male' ? 
                        <Mars className="h-4 w-4 text-blue-400"/> : 
                        <Venus className="h-4 w-4 text-red-500"/>}
                    {reptile.name}
                  
                </p>
                <p className="text-[0.65rem] sm:text-xs md:text-[0.8rem] text-muted-foreground">{reptile.reptile_code || '--'}</p>
                <Badge variant="default" className="mt-1">{reptile.morphName}</Badge>
            </div>

            <Separator className="my-0 md:my-3"/>

            <div className="w-full space-y-3">
                <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Visual Traits</p>
                    <div className="flex flex-wrap gap-1.5">
                        {reptile.visuals?.length === 0 ? (
                            <span className="text-xs text-muted-foreground">No Visual Traits</span>
                        ) : (
                            reptile.visuals?.map((trait, index) => (
                                <Badge key={index} variant="secondary" className="text-[0.7rem]">
                                    {trait}
                                </Badge>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Het Traits</p>
                    <div className="flex flex-wrap gap-1.5">
                        {reptile.hets?.length === 0 ? (
                            <span className="text-xs text-muted-foreground">No Het Traits</span>
                        ) : (
                            reptile.hets?.map((het, index) => (
                                <Badge key={index} variant="secondary" className="text-[0.7rem]">
                                    {het.percentage}% ph {het.trait}
                                </Badge>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </Card>
    )
}

const BreedingProjecParentsInfo = ({ reptileMap, project }: Props) => {
    const male = reptileMap.get(project.male_id);
    const female = reptileMap.get(project.female_id);

    return (
        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 sm:gap-5 py-2 sm:py-5">
            <ParentCard reptile={male} gender="male" />
            <ParentCard reptile={female} gender="female" />
        </div>
    )
}

export default BreedingProjecParentsInfo