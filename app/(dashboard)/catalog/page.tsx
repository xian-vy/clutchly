import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { CatalogTab } from '@/components/dashboard/catalog/CatalogTab';

export default function CatalogPage() {
  return (
    <div className="container mx-auto">
        <ProtectedRoute pageName='Website'>
            <CatalogTab />
        </ProtectedRoute>
    </div>
  );
} 