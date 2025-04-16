import { Navigation } from '@/components/dashboard/Navigation';
import TopNavigation from '@/components/dashboard/TopNavigation';
import { QueryProvider } from '@/components/providers/QueryProvider';

interface LayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <div className="flex-1">
        <TopNavigation />
        <div className="p-4 lg:p-6 2xl:p-7">
          <QueryProvider>
            {children}
          </QueryProvider>
        </div>
      </div>
    </div>
  );
} 