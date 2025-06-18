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
    ChevronDown,
    LogOut,
    Moon,
    Sun
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { User } from '@/lib/types/users';
import { Skeleton } from '../ui/skeleton';

interface Props {
    isCollapsed : boolean
    onLogout: () => void;
     user : User | undefined,
     isLoading : boolean
}
const AccountAvatar =   ({isCollapsed ,onLogout, user , isLoading} : Props) => {
    const { theme, setTheme } = useTheme();
  

    if (isLoading) {
        return (
            <div className='mb-3 2xl:mb-4 3xl:mb-5 w-full'>
                <Button variant="ghost" className="relative rounded-md hover:!bg-inherit hover:!text-primary cursor-pointer w-full">
                    <div className="flex items-center w-full">
                        <div className="flex items-center gap-2 w-full flex-1">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            {!isCollapsed && (
                                <div className="flex flex-col items-start gap-1">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                            )}
                        </div>
                        {!isCollapsed && (
                            <Skeleton className="h-4 w-4 ml-4" />
                        )}
                    </div>
                </Button>
            </div>
        );
    }
    const organization = Array.isArray(user) ? user[0] : user;
    const userEmail = organization?.email;
    const userFullname = organization?.full_name;


  return (
    <div className='mb-3 2xl:mb-4 3xl:mb-5 w-full'>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative rounded-md hover:!bg-inherit hover:!text-primary cursor-pointer w-full focus-visible:ring-0">
                    <div className="flex items-center w-full 2xl:pr-2">
                        <div className="flex items-center gap-2 3xl:gap-2.5 w-full flex-1">
                                <Avatar className="cursor-pointer">
                                    <AvatarFallback className='bg-primary dark:bg-slate-800/90 text-white dark:text-primary'> {userEmail?.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                {!isCollapsed &&
                                    <div className="flex flex-col items-start">
                                        <span className='text-xs 3xl:text-[0.8rem] capitalize'>{userFullname}</span>
                                        <span className='text-xs 3xl:text-[0.8rem] text-muted-foreground'>{userEmail}</span>
                                    </div>
                                }
                        </div>
                        {!isCollapsed &&
                             <ChevronDown className="ml-4 !h-3.5 !w-3.5" />
                        }
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