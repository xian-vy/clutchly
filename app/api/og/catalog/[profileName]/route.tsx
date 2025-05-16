import { getCatalogEntriesByProfileName } from '@/app/api/catalog';
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Define the enriched type for the API response
type EnrichedCatalogEntry = {
  id: string;
  user_id: string;
  reptile_id: string;
  featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  reptiles: {
    id: string;
    name: string;
    species_id: string;
    morph_id: string;
  };
  catalog_images: Array<{
    id: string;
    image_url: string;
  }>;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { profileName: string } }
) {
  try {
    const { profileName } = params;
    
    // Get catalog entries for the user
    const catalogEntries = await getCatalogEntriesByProfileName(profileName) as EnrichedCatalogEntry[];
    
    // Filter for featured entries, or use all entries if none are featured
    const featuredEntries = catalogEntries.filter(entry => entry.featured);
    const entriesToShow = featuredEntries.length > 0 ? featuredEntries : catalogEntries;
    
    // Limit to 6 entries max
    const limitedEntries = entriesToShow.slice(0, 6);
    
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: 'white',
            padding: '40px 50px',
            fontFamily: 'sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <h1
                style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  margin: '0 0 10px 0',
                  color: '#0f172a',
                }}
              >
                {profileName}&apos;s Reptile Collection
              </h1>
              <p
                style={{
                  fontSize: '20px',
                  color: '#64748b',
                  margin: '0 0 30px 0',
                }}
              >
                A curated catalog of {limitedEntries.length} reptiles
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
              width: '100%',
            }}
          >
            {limitedEntries.map((entry, index) => {
              const reptile = entry.reptiles;
              const imageUrl = entry.catalog_images?.[0]?.image_url;
              
              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                  }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={reptile.name}
                      width="100%"
                      height="150px"
                      style={{
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        height: '150px',
                        backgroundColor: '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b',
                      }}
                    >
                      No Image
                    </div>
                  )}
                  <div style={{ padding: '10px' }}>
                    <h2
                      style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        margin: '0 0 5px 0',
                        color: '#0f172a',
                      }}
                    >
                      {reptile.name}
                    </h2>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                      {reptile.morph_id}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '30px',
            }}
          >
            <p
              style={{
                fontSize: '16px',
                color: '#64748b',
              }}
            >
              Visit https://clutcly.vercel.app/catalog/{profileName} to see more
            </p>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error(error);
    return new Response('Failed to generate OG image', { status: 500 });
  }
} 