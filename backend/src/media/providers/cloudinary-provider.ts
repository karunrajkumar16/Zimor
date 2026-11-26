// Production media provider: Cloudinary
// Switch from local: set USE_MOCK_MEDIA=false and provide CLOUDINARY_* env vars
import { v2 as cloudinary } from 'cloudinary';
import { MediaProvider, UploadResult } from './interface.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Cloudinary folder structure:
// zimor/products/           — main product images
// zimor/products/gallery/   — product gallery images
// zimor/products/variants/  — per-color variant images
// zimor/homepage/hero/      — hero banners
// zimor/homepage/lifestyle/ — lifestyle section images
// zimor/about/              — about page images
// zimor/banners/            — promotional banners
// zimor/videos/             — video assets

export class CloudinaryProvider implements MediaProvider {
  async upload(file: Buffer, options: {
    filename: string;
    mimeType: string;
    folder: string;
    publicId?: string;
    alt?: string;
  }): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const targetFolder = options.folder.startsWith('zimor')
        ? options.folder
        : `zimor/${options.folder}`;
      const uploadOptions: Record<string, unknown> = {
        folder: targetFolder,
        resource_type: options.mimeType.startsWith('video') ? 'video' : 'image',
        use_filename: true,
        unique_filename: true,
      };
      if (options.publicId) uploadOptions.public_id = options.publicId;
      
      cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error || !result) {
          reject(error || new Error('Cloudinary upload failed'));
          return;
        }
        resolve({
          id: result.public_id,
          url: result.secure_url,
          publicId: result.public_id,
          filename: result.original_filename || options.filename,
          mimeType: options.mimeType,
          size: result.bytes,
          width: result.width,
          height: result.height,
          folder: options.folder,
          createdAt: new Date().toISOString(),
        });
      }).end(file);
    });
  }
  
  async delete(publicId: string): Promise<boolean> {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  }
  
  getUrl(publicId: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  }): string {
    return cloudinary.url(publicId, {
      secure: true,
      quality: options?.quality || 'auto',
      fetch_format: options?.format || 'auto',
      width: options?.width,
      height: options?.height,
      crop: options?.width || options?.height ? 'fill' : undefined,
    });
  }
  
  async listFiles(folder: string): Promise<UploadResult[]> {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: `zimor/${folder}`,
      max_results: 500,
    });
    return result.resources.map((r: Record<string, unknown>) => ({
      id: r.public_id as string,
      url: r.secure_url as string,
      publicId: r.public_id as string,
      filename: (r.public_id as string).split('/').pop() || '',
      mimeType: r.resource_type === 'video' ? 'video/mp4' : 'image/jpeg',
      size: r.bytes as number,
      width: r.width as number | undefined,
      height: r.height as number | undefined,
      folder,
      createdAt: r.created_at as string,
    }));
  }
}
