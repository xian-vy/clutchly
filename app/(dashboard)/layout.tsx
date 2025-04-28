import { Navigation } from '@/components/navigation/Navigation';
import TopNavigation from '@/components/navigation/TopNavigation';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ProfileSetupDialog } from '@/components/profile/ProfileSetupDialog';
import './dashboard.css';

interface LayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
  return (
    <QueryProvider>
        <div className="flex min-h-screen bg-background">
          <Navigation />
          <div className="flex-1 lg:ml-[18rem] 3xl:ml-[20rem] transition-all duration-200">
            <TopNavigation />
            <div className="p-4 lg:p-6 2xl:p-7">
                <ProfileSetupDialog />
                {children}
            </div>
          </div>
        </div>
    </QueryProvider>
  );
} 