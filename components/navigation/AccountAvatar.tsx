'use client'
import { getOrganization } from '@/app/api/organizations/organizations';
import { logout } from '@/app/auth/logout/actions';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Organization } from '@/lib/types/organizations';
import { useQuery } from '@tanstack/react-query';
import {
    ChevronDown,
    LogOut,
    Moon,
    Sun
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { TopLoader } from '../ui/TopLoader';

interface Props {
    isCollapsed : boolean
}
const AccountAvatar =   ({isCollapsed } : Props) => {
    const { theme, setTheme } = useTheme();
    const { data, isLoading } = useQuery<Organization>({
        queryKey: ['organization2'],
        queryFn: getOrganization,
    }); 
    const queryClient = useQueryClient();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    if (isLoading) {
        return (
            <div className='mb-3 2xl:mb-4 3xl:mb-5 w-full'>
                 <Button variant="ghost" className="relative rounded-md hover:!bg-inherit hover:!text-primary cursor-pointer w-full">
                    <div className="flex items-center w-full">
                        <div className="flex items-center gap-2 w-full flex-1">
                                <Avatar className="cursor-pointer">
                                    <AvatarFallback className='bg-primary dark:bg-slate-800/90 text-white dark:text-primary'>G</AvatarFallback>
                                </Avatar>
                                {!isCollapsed &&
                                    <div className="flex flex-col items-start">
                                        <span className='text-xs'>User X</span>
                                        <span className='text-xs text-muted-foreground'>...</span>
                                    </div>
                                }
                        </div>
                        {!isCollapsed &&
                             <ChevronDown className="ml-4 text-muted-foreground" />
                        }
                    </div>
                </Button>
            </div>
        )
    }
    const organization = Array.isArray(data) ? data[0] : data;
    const userEmail = organization?.email;
    const userFullname = organization?.full_name;

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await logout();
            queryClient.clear();
            window.location.reload();
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };


  return (
    <div className='mb-3 2xl:mb-4 3xl:mb-5 w-full'>
        {isLoggingOut &&  <TopLoader />}
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative rounded-md hover:!bg-inherit hover:!text-primary cursor-pointer w-full focus-visible:ring-0">
                    <div className="flex items-center w-full 2xl:pr-2">
                        <div className="flex items-center gap-2 w-full flex-1">
                                <Avatar className="cursor-pointer">
                                    <AvatarFallback className='bg-primary dark:bg-slate-800/90 text-white dark:text-primary'> {userEmail?.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                {!isCollapsed &&
                                    <div className="flex flex-col items-start">
                                        <span className='text-xs'>{userFullname}</span>
                                        <span className='text-xs text-muted-foreground'>{userEmail}</span>
                                    </div>
                                }
                        </div>
                        {!isCollapsed &&
                             <ChevronDown className="ml-4 text-muted-foreground" />
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
                    <DropdownMenuItem  onClick={handleLogout}
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