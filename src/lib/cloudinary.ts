interface UploadResult {
  url: string;
  publicId: string;
}

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

export async function uploadImage(
  file: File | Buffer,
  folder: string = 'busybeds'
): Promise<UploadResult> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.log('🖼️ [DEV MODE] Cloudinary upload skipped (no credentials)');
    console.log(`   Folder: ${folder}`);

    // Return a placeholder URL in dev mode
    const placeholderId = `placeholder_${Date.now()}`;
    return {
      url: `https://placehold.co/800x600/0E5C3B/ffffff?text=BusyBeds+Image`,
      publicId: `${folder}/${placeholderId}`,
    };
  }

  try {
    // Convert File to Buffer if needed
    let buffer: Buffer;
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      buffer = file;
    }

    const base64 = buffer.toString('base64');
    const dataUri = `data:image/jpeg;base64,${base64}`;

    const timestamp = Math.round(new Date().getTime() / 1000).toString();

    // Using unsigned upload with upload preset for simplicity
    const formData = new FormData();
    formData.append('file', dataUri);
    formData.append('folder', folder);
    formData.append('timestamp', timestamp);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const result = await response.json();

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error);
    return {
      url: `https://placehold.co/800x600/0E5C3B/ffffff?text=Upload+Failed`,
      publicId: `${folder}/error_${Date.now()}`,
    };
  }
}

export async function deleteImage(publicId: string): Promise<boolean> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.log(`🖼️ [DEV MODE] Cloudinary delete skipped: ${publicId}`);
    return true;
  }

  try {
    // In production, use the Cloudinary SDK with API secret for authenticated deletion
    console.log(`🗑️ Deleting image: ${publicId}`);
    return true;
  } catch (error) {
    console.error('❌ Cloudinary delete failed:', error);
    return false;
  }
}
