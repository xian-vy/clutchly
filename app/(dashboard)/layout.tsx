import { Navigation } from '@/components/navigation/Navigation';
import TopNavigation from '@/components/navigation/TopNavigation';
import { QueryProvider } from '@/components/providers/QueryProvider';
import './dashboard.css';

interface LayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
  return (
    <QueryProvider>
        <div className="flex min-h-screen bg-background">
          <Navigation />
          <div className="flex-1 lg:ml-[var(--sidebar-width)]  3xl:!ml-[var(--sidebar-width-3xl)] transition-all duration-200">
            <TopNavigation />
            <div className="pt-20 xl:pt-24 2xl:!pt-28 px-4 lg:px-6 xl:px-7 2xl:px-9 3xl:!px-10 max-w-screen-2xl mx-auto">
                {children}
            </div>
          </div>
        </div>
    </QueryProvider>
  );
} 