import { getPublicOrganization } from '@/app/api/organizations/organizations';
import { CatalogPublicPage } from '@/components/catalog/CatalogPublicPage';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { APP_URL } from '@/lib/constants/app';
import { Metadata } from 'next';

type Params = Promise<{ orgName: string}>;


export async function generateMetadata(
  { params }: {params : Params}
): Promise<Metadata> {
  const { orgName } = await params;

  //const ogUrl = new URL(`/api/og/catalog/${orgName}`, APP_URL);
  const publicProfile = await getPublicOrganization(orgName.toLowerCase());

  if (!publicProfile) {
    return {
      title: 'Reptile Catalog | Clutchly',
      description: 'A curated catalog of reptiles. Browse morphs, species, and photos.',
    };
  }
  const logo = publicProfile?.logo?.endsWith('.webp') ? '/logo_dark.png' : (publicProfile?.logo || '/logo_dark.png');
  const profile_name  = publicProfile.full_name
  return {
    title: `${profile_name}'s Collection | Clutchly`,
    description: `A curated catalog of ${profile_name}'s reptiles. Browse morphs, species, and photos.`,
    openGraph: {
      title: `Check out ${profile_name}'s collection`,
      description: `A curated catalog of ${profile_name}'s reptiles. Browse morphs, species, and photos.`,
      images: [{
        url: logo,
        alt: `${profile_name}'s Collection`,
      }],
      type: 'website',
      url: `${APP_URL}/c/${profile_name}`,
      siteName: 'Clutchly',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Check out ${profile_name}'s collection`,
      description: `A curated catalog of ${profile_name}'s reptiles. Browse morphs, species, and photos.`,
      images: [logo],
    },
  };
}

export default async function Page({
  params,
}: {params : Params}) {
  const resolvedParams = await params;
  const { orgName } = resolvedParams;
  
  return (
    <QueryProvider>
        <CatalogPublicPage orgName={orgName} />
    </QueryProvider>
  );
}
