'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 3000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  })
export function QueryProvider({ children }: { children: React.ReactNode }) {

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}