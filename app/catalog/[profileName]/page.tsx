

import { getPublicProfile } from '@/app/api/profiles/profiles';
import { CatalogPublicPage } from '@/components/catalog/CatalogPublicPage';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { APP_URL } from '@/lib/constants/app';
import { Metadata } from 'next';

type Params = Promise<{ profileName: string}>;


export async function generateMetadata(
  { params }: {params : Params}
): Promise<Metadata> {
  const { profileName } = await params;

  //const ogUrl = new URL(`/api/og/catalog/${profileName}`, APP_URL);
  const publicProfile = await getPublicProfile(profileName);

  if (!publicProfile) {
    return {
      title: 'Reptile Catalog | Clutchly',
      description: 'A curated catalog of reptiles. Browse morphs, species, and photos.',
    };
  }
  const logo = publicProfile?.logo || '/logo_dark.png';
  const profile_name  = publicProfile.full_name
  return {
    title: `${profile_name}'s Collection | Clutchly`,
    description: `A curated catalog of ${profile_name}'s reptiles. Browse morphs, species, and photos.`,
    openGraph: {
      title: `Check out ${profile_name}'s Reptile Collection`,
      description: `A curated catalog of ${profile_name}'s reptiles. Browse morphs, species, and photos.`,
      images: [{
        url: logo,
        alt: `${profile_name}'s Collection`,
      }],
      type: 'website',
      url: `${APP_URL}/catalog/${profile_name}`,
      siteName: 'Clutchly',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Check out ${profile_name}'s Reptile Collection`,
      description: `A curated catalog of ${profile_name}'s reptiles. Browse morphs, species, and photos.`,
      images: [logo],
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
