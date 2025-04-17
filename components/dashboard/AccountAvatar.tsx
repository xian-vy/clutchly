'use client'
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
import { createClient } from '@/lib/supabase/client';
import {
    ChevronDown,
    LogOut,
    Moon,
    Sun
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
interface Props {
    isCollapsed : boolean
}
const AccountAvatar =   ({isCollapsed } : Props) => {
    const { theme, setTheme } = useTheme();
    const supabase = createClient();
    const [userEmail, setUserEmail] = useState<string | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUserEmail(user?.email || null);
        };
        getUser();
    }, []);
  return (
    <div className='mb-5 w-full'>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative rounded-md hover:!bg-inherit hover:!text-primary cursor-pointer w-full">
                    <div className="flex items-center w-full">
                        <div className="flex items-center gap-2 w-full flex-1">
                                <Avatar className="cursor-pointer">
                                    <AvatarFallback className='bg-primary dark:bg-slate-800/90 text-white dark:text-primary'> {userEmail?.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                {!isCollapsed &&
                                    <div className="flex flex-col items-start">
                                        <span className='text-xs'>User X</span>
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
                    <DropdownMenuItem onClick={() => logout()}>
                        <LogOut className="mr-2 cursor-pointer" />
                        <span>Log out</span>
                    </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
    </div>
  )
}

export default AccountAvatar