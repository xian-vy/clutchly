'use client';

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
import { AvatarImage } from '@radix-ui/react-avatar';
import {
    Crown,
    LogOut,
    Menu,
    Moon,
    Sun,
    X
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { Badge } from '../ui/badge';

const TopNavigation = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { theme, setTheme } = useTheme();
  return (
    <div className="h-16 border-b border-border flex items-center justify-between px-4 lg:px-6">
        <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
            {isSidebarOpen ? (
            <X className="h-6 w-6" />
            ) : (
            <Menu className="h-6 w-6" />
            )}
        </Button>

        <div className="flex items-center gap-3 2xl:gap-5 ml-auto">
             <Badge variant="default" className="flex items-center gap-1 font-medium">
                <Crown className="h-3 w-3" />
                 Premium
             </Badge>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="cursor-pointer">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40" align="end" forceMount>
                <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 cursor-pointer" />
                    <span>Log out</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className='cursor-pointer'>
                    {theme === 'dark'? 
                      <Moon className="mr-2" />
                     : <Sun className="mr-2" />
                    }
                     Theme
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>

        </div>
    </div>
  )
}

export default TopNavigation