'use client'
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ChevronsUpDown,
    LogOut,
    Moon,
    Sun,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { User } from '@/lib/types/users';
import { Skeleton } from '../ui/skeleton';
import UpdatePasswordDialog from './UpdatePasswordDialog';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface Props {
    onLogout: () => void;
     user : User | undefined,
     isLoading : boolean
     onDropdownOpenChange: (open: boolean) => void
}
const AccountAvatar =   ({onLogout, user , isLoading, onDropdownOpenChange} : Props) => {
    const { theme, setTheme } = useTheme();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleDropdownChange = (open: boolean) => {
        setIsDropdownOpen(open);
        onDropdownOpenChange(open);
    };

    if (isLoading) {
        return (
            <div className='mb-3 2xl:mb-4 3xl:mb-5 w-full'>
                <Button variant="ghost" className="relative rounded-md hover:!bg-inherit hover:!text-primary cursor-pointer w-full">
                    <div className="flex items-center w-full">
                        <div className="flex items-center gap-2 w-full flex-1">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex flex-col items-start gap-1 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                        </div>
                        <Skeleton className="h-4 w-4 ml-4 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300" />
                    </div>
                </Button>
            </div>
        );
    }
    const organization = Array.isArray(user) ? user[0] : user;
    const userEmail = organization?.email;
    const userFullname = organization?.full_name;

  return (
    <div className='w-full'>
        <DropdownMenu onOpenChange={handleDropdownChange}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative rounded-md hover:!bg-inherit hover:!text-primary cursor-pointer w-full focus-visible:ring-0 px-1">
                    <div className="flex items-center w-full ">
                        <div className="flex items-center gap-2 3xl:gap-2.5 w-full flex-1">
                                <Avatar className="cursor-pointer">
                                    <AvatarFallback className='bg-primary dark:bg-slate-800/90 text-white dark:text-primary'> {userEmail?.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className={cn(
                                    "flex flex-col items-start transition-opacity duration-300",
                                    isDropdownOpen ? "opacity-100" : "lg:opacity-0 group-hover/sidebar:opacity-100" //only hide in lg screen
                                )}>
                                    <span className='text-xs 2xl:text-[0.8rem] capitalize'>{userFullname}</span>
                                    <span className='text-xs 2xl:text-[0.8rem] text-muted-foreground'>{userEmail}</span>
                                </div>
                        </div>
                        <ChevronsUpDown className={cn(
                            "ml-4 !h-4 !w-4 transition-opacity duration-300",
                            isDropdownOpen ? "opacity-100" : "opacity-0 group-hover/sidebar:opacity-100"
                        )} />
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40" align="end" forceMount>
                <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className='cursor-pointer'>
                        {theme === 'dark'? 
                        <Moon className="mr-2" />
                        : <Sun className="mr-2" />
                        }
                        Theme
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <UpdatePasswordDialog />
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem  onClick={onLogout}
                    >
                        <LogOut className="mr-2 cursor-pointer" />
                        <span>Log out</span>
                    </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
    </div>
  )
}

export default AccountAvatar