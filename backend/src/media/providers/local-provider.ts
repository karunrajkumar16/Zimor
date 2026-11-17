// DEV ONLY: Local filesystem media storage
// In production, switch to Cloudinary via USE_MOCK_MEDIA=false
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { MediaProvider, UploadResult } from './interface';

const UPLOADS_DIR = path.join(process.cwd(), '.local-uploads');
const INDEX_FILE = path.join(UPLOADS_DIR, 'index.json');

function readIndex(): UploadResult[] {
  if (!fs.existsSync(INDEX_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
  } catch { return []; }
}

function writeIndex(items: UploadResult[]): void {
  fs.writeFileSync(INDEX_FILE, JSON.stringify(items, null, 2));
}

export class LocalMediaProvider implements MediaProvider {
  async upload(file: Buffer, options: {
    filename: string;
    mimeType: string;
    folder: string;
    publicId?: string;
    alt?: string;
  }): Promise<UploadResult> {
    const folderPath = path.join(UPLOADS_DIR, options.folder);
    fs.mkdirSync(folderPath, { recursive: true });
    
    const ext = path.extname(options.filename) || '.bin';
    const id = crypto.randomUUID();
    const savedFilename = `${id}${ext}`;
    const filePath = path.join(folderPath, savedFilename);
    
    fs.writeFileSync(filePath, file);
    
    const result: UploadResult = {
      id,
      url: `/api/media/local/${options.folder}/${savedFilename}`,
      publicId: options.publicId || `${options.folder}/${savedFilename}`,
      filename: savedFilename,
      mimeType: options.mimeType,
      size: file.length,
      folder: options.folder,
      createdAt: new Date().toISOString(),
    };
    
    const index = readIndex();
    index.push(result);
    writeIndex(index);
    
    return result;
  }
  
  async delete(publicId: string): Promise<boolean> {
    const index = readIndex();
    const item = index.find(i => i.publicId === publicId);
    if (!item) return false;
    
    const filePath = path.join(UPLOADS_DIR, item.folder, item.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    
    writeIndex(index.filter(i => i.publicId !== publicId));
    return true;
  }
  
  getUrl(publicId: string): string {
    const index = readIndex();
    const item = index.find(i => i.publicId === publicId);
    return item?.url || publicId;
  }
  
  async listFiles(folder: string): Promise<UploadResult[]> {
    return readIndex().filter(i => i.folder === folder);
  }
}
