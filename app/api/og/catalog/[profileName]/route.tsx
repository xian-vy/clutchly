import { getOpenGraphImages } from '@/app/api/catalog';
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

type Params = Promise<{ profileName: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { profileName } = await params;
    
    // Get simplified OG data
    const ogData = await getOpenGraphImages(profileName);
    
    // Limit to 6 entries max
    const limitedEntries = ogData.slice(0, 3);
    
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
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '20px',
              width: '100%',
            }}
          >
            <h1
              style={{
                fontSize: '36px',
                fontWeight: 'bold',
                margin: '0 0 10px 0',
                color: '#111',
                textAlign: 'center',
              }}
            >
              {profileName}&apos;s Collection
            </h1>
            <p
              style={{
                fontSize: '16px',
                color: '#666',
                margin: '0 0 30px 0',
                textAlign: 'center',
              }}
            >
              {limitedEntries.length} Featured Reptiles
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '30px',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'flex-start',
            }}
          >
            {limitedEntries.map((entry, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '300px',
                  overflow: 'hidden',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                }}
              >
                {entry.image_url ? (
                  <div style={{ display: 'flex', width: '100%' }}>
                    <img
                      src={entry.image_url}
                      alt={entry.reptile}
                      width="300"
                      height="150"
                      style={{
                        objectFit: 'cover',
                        width: '100%',
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      height: '150px',
                      backgroundColor: '#e2e8f0',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b',
                      width: '100%',
                    }}
                  >
                    No Image
                  </div>
                )}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  padding: '20px',
                  width: '100%',
                }}>
                  <h2
                    style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      margin: '0 0 5px 0',
                      color: '#111',
                    }}
                  >
                    {entry.reptile}
                  </h2>
                  <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                    {entry.morph_name}
                  </p>
                  {entry.price && (
                    <p style={{ fontSize: '16px', color: '#0f172a', margin: '5px 0 0 0' }}>
                      {entry.price}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '30px',
              width: '100%',
            }}
          >
            <p
              style={{
                fontSize: '18px',
                color: '#111',
                textAlign: 'center',
              }}
            >
              Visit <span style={{ borderBottom: "2px solid #666", paddingBottom: "1px" ,marginLeft:"10px",marginRight:"10px"}}>clutchly.vercel.app/c/{profileName}</span> to see more
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