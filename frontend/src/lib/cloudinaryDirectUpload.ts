import { apiFetch } from './api';

export interface DirectUploadOptions {
  folder?: string;
  resourceType?: 'image' | 'video';
  allowedFormats?: string[];
  publicId?: string;
  alt?: string;
  onProgress?: (percent: number) => void;
}

export interface DirectUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  format?: string;
  duration?: number;
  resourceType: 'image' | 'video';
  folder: string;
  alt?: string;
}

/**
 * Uploads a file directly from the browser to Cloudinary using an authenticated
 * pre-signed upload signature from the backend API. Completely bypasses Vercel's
 * 4.5 MB request body limit.
 */
export async function uploadDirectToCloudinary(
  file: File,
  options: DirectUploadOptions = {}
): Promise<DirectUploadResult> {
  const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(file.name);
  const resourceType = options.resourceType || (isVideo ? 'video' : 'image');

  // 1. Request signature from backend (admin authenticated via apiFetch)
  const signRes = await apiFetch('/api/media/sign-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      folder: options.folder || 'zimor/products',
      resourceType,
      allowedFormats: options.allowedFormats?.join(','),
      publicId: options.publicId,
    }),
  });

  if (!signRes.ok) {
    const errData = await signRes.json().catch(() => ({}));
    throw new Error(errData.error || `Upload authorization failed with HTTP ${signRes.status}`);
  }

  const signData = await signRes.json();
  const { signature, timestamp, apiKey, cloudName, folder } = signData;

  if (!signature || !apiKey || !cloudName) {
    throw new Error('Incomplete upload authorization received from backend.');
  }

  // 2. Prepare FormData with signed params strictly matching the backend signature
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  formData.append('folder', folder);
  if (signData.allowedFormats) {
    formData.append('allowed_formats', signData.allowedFormats);
  }
  if (signData.publicId) {
    formData.append('public_id', signData.publicId);
  }

  // 3. Perform direct browser-to-Cloudinary upload with XHR for progress tracking
  const uploadEndpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  return new Promise<DirectUploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadEndpoint, true);

    if (options.onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          options.onProgress?.(percent);
        }
      };
    }

    xhr.onload = () => {
      try {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            url: response.secure_url || response.url,
            secureUrl: response.secure_url || response.url,
            publicId: response.public_id,
            filename: response.original_filename || file.name,
            originalFilename: file.name,
            mimeType: file.type || `${resourceType}/${response.format}`,
            size: response.bytes || file.size,
            width: response.width,
            height: response.height,
            format: response.format,
            duration: response.duration,
            resourceType,
            folder,
            alt: options.alt || file.name.replace(/\.[^/.]+$/, ''),
          });
        } else {
          const message = response.error?.message || `Cloudinary upload failed (HTTP ${xhr.status})`;
          reject(new Error(message));
        }
      } catch {
        reject(new Error(`Failed to parse Cloudinary response: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error occurred during direct Cloudinary upload.'));
    };

    xhr.ontimeout = () => {
      reject(new Error('Direct Cloudinary upload timed out.'));
    };

    xhr.send(formData);
  });
}

/**
 * Uploads a file directly to Cloudinary and immediately registers it in the
 * MongoDB MediaItem collection for full admin media library traceability.
 */
export async function uploadAndRegisterMedia(
  file: File,
  options: DirectUploadOptions = {}
): Promise<DirectUploadResult> {
  const result = await uploadDirectToCloudinary(file, options);

  try {
    await apiFetch('/api/media/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: result.secureUrl,
        publicId: result.publicId,
        filename: result.filename,
        originalName: result.originalFilename,
        mimeType: result.mimeType,
        size: result.size,
        width: result.width,
        height: result.height,
        folder: result.folder,
        alt: result.alt,
      }),
    });
  } catch (err) {
    console.warn('Failed to register uploaded media in database:', err);
  }

  return result;
}
