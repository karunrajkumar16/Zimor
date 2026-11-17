export interface UploadResult {
  id: string;
  url: string;
  publicId?: string;
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  folder: string;
  createdAt: string;
}

export interface MediaProvider {
  upload(file: Buffer, options: {
    filename: string;
    mimeType: string;
    folder: string;
    publicId?: string;
    alt?: string;
  }): Promise<UploadResult>;
  
  delete(publicId: string): Promise<boolean>;
  
  getUrl(publicId: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  }): string;
  
  listFiles(folder: string): Promise<UploadResult[]>;
}
