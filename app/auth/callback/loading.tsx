import { TopLoader } from '@/components/ui/TopLoader';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <TopLoader />
      <div className="text-center mt-8">
        <h2 className="text-2xl font-bold mb-2">Processing your authentication...</h2>
        <p className="text-muted-foreground">Please wait while we securely log you in.</p>
      </div>
    </div>
  );
} 