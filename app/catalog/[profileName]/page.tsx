

import { CatalogPublicPage } from '@/components/catalog/CatalogPublicPage';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { APP_URL } from '@/lib/constants/app';
import { Metadata } from 'next';

type Params = Promise<{ profileName: string}>;


export async function generateMetadata(
  { params }: {params : Params}
): Promise<Metadata> {
  const { profileName } = await params;

  const ogUrl = new URL(`/api/og/catalog/${profileName}`, APP_URL);


  return {
    title: `${profileName}'s Collection | Clutchly`,
    description: `A curated catalog of ${profileName}'s reptiles. Browse morphs, species, and photos.`,
    openGraph: {
      title: `Check out ${profileName}'s Reptile Collection`,
      description: `A curated catalog of ${profileName}'s reptiles. Browse morphs, species, and photos.`,
      images: [{
        url: ogUrl.toString(),
        width: 1200,
        height: 630,
        alt: `${profileName}'s reptile catalog`,
      }],
      type: 'website',
      url: `${APP_URL}/catalog/${profileName}`,
      siteName: 'HerpTrack',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Check out ${profileName}'s Reptile Collection`,
      description: `A curated catalog of ${profileName}'s reptiles. Browse morphs, species, and photos.`,
      images: [ogUrl.toString()],
    },
  };
}

export default async function Page({
  params,
}: {params : Params}) {
  const resolvedParams = await params;
  const { profileName } = resolvedParams;
  
  return (
    <QueryProvider>
        <CatalogPublicPage profileName={profileName} />
    </QueryProvider>
  );
}
