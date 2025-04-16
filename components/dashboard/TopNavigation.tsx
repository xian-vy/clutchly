'use client';

import { logout } from '@/app/auth/logout/actions';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AvatarImage } from '@radix-ui/react-avatar';
import {
    Crown,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../ui/badge';

const TopNavigation = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

        <div className="flex items-center gap-3 ml-auto">
             <Badge variant="default" className="flex items-center gap-1 font-medium">
                <Crown className="h-3 w-3" />
                 Premium
             </Badge>
            <ThemeToggle />
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="cursor-pointer">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem onClick={() => logout()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>

        </div>
    </div>
  )
}

export default TopNavigation