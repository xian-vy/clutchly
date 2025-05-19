import { addCatalogImage } from '@/app/api/catalog';
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()
  
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized - User ID is required' }, { status: 401 });
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const catalogEntryId = formData.get('catalogEntryId') as string;

    if (!file || !catalogEntryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate catalogEntryId is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(catalogEntryId)) {
      return NextResponse.json(
        { error: 'Invalid catalog entry ID format' },
        { status: 400 }
      );
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, and WebP images are allowed' },
        { status: 400 }
      );
    }

    // Check file size limit (2MB)
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size must not exceed 2MB' },
        { status: 400 }
      );
    }

    // Read the file as buffer
    const buffer = Buffer.from(await file.arrayBuffer()) as Buffer;
    const MAX_DIMENSION = 1200;
    const OPTIMIZED_MAX_SIZE = 500 * 1024; // 500KB for PNG

    // Get original image metadata
    const metadata = await sharp(buffer).metadata();
    const needsResize = (metadata.width || 0) > MAX_DIMENSION || (metadata.height || 0) > MAX_DIMENSION;
    const needsOptimization = buffer.byteLength > OPTIMIZED_MAX_SIZE;

    let optimizedImageBuffer: Buffer = buffer;
    
    // Only optimize if needed
    if (needsResize || needsOptimization) {
      const sharpInstance = sharp(buffer);
      
      if (needsResize) {
        sharpInstance.resize(MAX_DIMENSION, null, { 
          fit: 'inside', 
          withoutEnlargement: true 
        });
      }

      // Only apply PNG optimization if the original size is too large
      if (needsOptimization) {
        sharpInstance.png({ 
          quality: 80,
          compressionLevel: 9,
          effort: 10 // Maximum compression effort
        });
      }

      optimizedImageBuffer = await sharpInstance.toBuffer();

      // If still too large, try more aggressive optimization
      if (optimizedImageBuffer.byteLength > OPTIMIZED_MAX_SIZE) {
        optimizedImageBuffer = await sharp(buffer)
          .resize(MAX_DIMENSION, null, { fit: 'inside', withoutEnlargement: true })
          .png({ 
            quality: 60,
            compressionLevel: 9,
            effort: 10,
            palette: true // En80le palette mode for better compression
          })
          .toBuffer();

        if (optimizedImageBuffer.byteLength > OPTIMIZED_MAX_SIZE) {
          return NextResponse.json(
            { error: 'Unable to optimize image to required size (500KB)' },
            { status: 400 }
          );
        }
      }
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const filename = `${user.id}/${catalogEntryId}/${timestamp}.png`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('catalog-images')
      .upload(filename, optimizedImageBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload image', details: uploadError },
        { status: 500 }
      );
    }

    // Get the public URL for the image
    const { data: { publicUrl } } = supabase.storage
      .from('catalog-images')
      .getPublicUrl(filename);

    // Save the image to the database
    const catalogImage = await addCatalogImage({
      catalog_entry_id: catalogEntryId,
      image_url: publicUrl,
      image_path: filename,
      display_order: 0, // Will be first image
    });

    return NextResponse.json({
      success: true,
      image: catalogImage,
    });
    
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to process image', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 