// Selects media provider based on USE_MOCK_MEDIA env var
// USE_MOCK_MEDIA=true  → local filesystem (dev only)
// USE_MOCK_MEDIA=false → Cloudinary (production)
import { MediaProvider } from './providers/interface.js';
import { LocalMediaProvider } from './providers/local-provider.js';
import { CloudinaryProvider } from './providers/cloudinary-provider.js';

let mediaProvider: MediaProvider | null = null;

export function getMediaProvider(): MediaProvider {
  if (mediaProvider) return mediaProvider;
  
  const useMock = process.env.USE_MOCK_MEDIA !== 'false';
  
  if (useMock && process.env.NODE_ENV === 'production') {
    throw new Error('USE_MOCK_MEDIA=true is not allowed in production. Configure Cloudinary credentials.');
  }
  
  if (useMock) {
    mediaProvider = new LocalMediaProvider();
  } else {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new Error('CLOUDINARY_CLOUD_NAME is required when USE_MOCK_MEDIA=false');
    }
    mediaProvider = new CloudinaryProvider();
  }
  
  return mediaProvider!;
}
