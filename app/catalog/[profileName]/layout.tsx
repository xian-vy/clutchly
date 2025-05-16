import type { Metadata } from 'next';

interface CatalogLayoutProps {
  children: React.ReactNode;
  params: {
    profileName: string;
  };
}

export async function generateMetadata(
  { params }: CatalogLayoutProps
): Promise<Metadata> {
  const { profileName } = params;

  const ogUrl = new URL(`/api/og/catalog/${profileName}`, 'https://clutcly.vercel.app');

  return {
    title: `${profileName}'s Reptile Collection | HerpTrack`,
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
      url: `https://clutcly.vercel.app/catalog/${profileName}`,
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

export default function Layout({ children }: CatalogLayoutProps) {
  return (
    <>
      {children}
    </>
  );
} 