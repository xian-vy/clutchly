import { addCatalogImage } from '@/app/api/catalog';
import { getUser } from '@/lib/supabase/auth';
import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    const buffer = Buffer.from(await file.arrayBuffer());

    // Optimize image with sharp
    const optimizedImageBuffer = await sharp(buffer)
      .resize(1600, null, { fit: 'inside', withoutEnlargement: true }) // Resize to max width of 1600px
      .webp({ quality: 80 }) // Convert to WebP with 80% quality
      .toBuffer();

    // Check if optimized image is within the size limit (200KB)
    const OPTIMIZED_MAX_SIZE = 200 * 1024; // 200KB
    if (optimizedImageBuffer.byteLength > OPTIMIZED_MAX_SIZE) {
      // Try again with lower quality
      const furtherOptimizedImageBuffer = await sharp(buffer)
        .resize(1200, null, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 60 })
        .toBuffer();

      if (furtherOptimizedImageBuffer.byteLength > OPTIMIZED_MAX_SIZE) {
        return NextResponse.json(
          { error: 'Unable to optimize image to required size (200KB)' },
          { status: 400 }
        );
      }
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const filename = `${user.id}/${catalogEntryId}/${timestamp}.webp`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('catalog-images')
      .upload(filename, optimizedImageBuffer, {
        contentType: 'image/webp',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload image' },
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
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
} 