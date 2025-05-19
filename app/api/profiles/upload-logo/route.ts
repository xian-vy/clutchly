import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized - User ID is required' }, { status: 401 });
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Missing file' },
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

    // Check file size limit (300KB)
    const MAX_SIZE = 300 * 1024; // 300KB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size must not exceed 300KB' },
        { status: 400 }
      );
    }

    try {
      // Read the file as buffer
      const buffer = Buffer.from(await file.arrayBuffer());

      // Optimize image with sharp
      const optimizedImageBuffer = await sharp(buffer)
        .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 90 })
        .toBuffer();

      // Check if optimized image is within the size limit (100KB)
      const OPTIMIZED_MAX_SIZE = 100 * 1024; // 100KB
      let finalBuffer = optimizedImageBuffer;
      
      if (optimizedImageBuffer.byteLength > OPTIMIZED_MAX_SIZE) {
        // Try again with lower quality
        finalBuffer = await sharp(buffer)
          .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();
          
        if (finalBuffer.byteLength > OPTIMIZED_MAX_SIZE) {
          return NextResponse.json(
            { error: 'Unable to optimize image to required size (100KB)' },
            { status: 400 }
          );
        }
      }

      // Generate a unique filename (overwrite for user)
      const filename = `${user.id}/logo.webp`;

      try {
        // Remove any existing logo for this user
        await supabase.storage.from('profile-logos').remove([filename]);
      } catch (removeError) {
        console.error('Error removing existing logo:', removeError);
      }

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-logos')
        .upload(filename, finalBuffer, {
          contentType: 'image/webp',
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload image', details: uploadError.message },
          { status: 500 }
        );
      }

      // Get the public URL for the image
      const { data: { publicUrl } } = supabase.storage
        .from('profile-logos')
        .getPublicUrl(filename);

      const { error: profileError } = await supabase
      .from('profiles')
      .update({ logo: publicUrl })
      .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        return NextResponse.json(
          { error: 'Failed to update profile with logo', details: profileError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        imageUrl: publicUrl,
      });
    } catch (processingError) {
      console.error('Image processing error:', processingError);
      return NextResponse.json(
        { error: 'Failed to process image', details: processingError instanceof Error ? processingError.message : String(processingError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error uploading logo:', error);
    return NextResponse.json(
      { error: 'Failed to process logo', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}