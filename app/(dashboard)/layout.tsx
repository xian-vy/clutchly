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
          <div className="flex-1 lg:ml-[var(--sidebar-width)] 3xl:ml-[var(--sidebar-width-3xl)] transition-all duration-200">
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