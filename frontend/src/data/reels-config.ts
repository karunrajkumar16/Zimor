export interface ReelItem {
  id: string;
  title: string;
  videoUrl: string;
  posterUrl: string;
  instagramUrl?: string;
  productSlug?: string;
}

export const DEFAULT_REELS: ReelItem[] = [
  {
    id: 'video-1',
    title: 'Workday Essentials Pack',
    videoUrl: 'https://res.cloudinary.com/kbeyfu3d/video/upload/v1795527022/zimor/reels/reel-1.mp4',
    posterUrl: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1795527024/zimor/reels/poster-1.webp',
    instagramUrl: 'https://www.instagram.com/reel/Db7t3Ikx1C1/',
    productSlug: 'zimor-delo-tote',
  },
  {
    id: 'video-2',
    title: 'Café Days & Slow Afternoons',
    videoUrl: 'https://res.cloudinary.com/kbeyfu3d/video/upload/v1795527163/zimor/reels/reel-2.mp4',
    posterUrl: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1795527165/zimor/reels/poster-2.webp',
    instagramUrl: 'https://www.instagram.com/reel/DdWRTNIPvIt/',
    productSlug: 'zimor-classic-shoulder-bag',
  },
  {
    id: 'video-3',
    title: 'Effortless Workday Carry',
    videoUrl: 'https://res.cloudinary.com/kbeyfu3d/video/upload/v1795527171/zimor/reels/reel-3.mp4',
    posterUrl: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1795527173/zimor/reels/poster-3.webp',
    instagramUrl: 'https://www.instagram.com/reel/DdeBTWksCJM/',
    productSlug: 'zimor-rabota-tote',
  },
  {
    id: 'video-4',
    title: 'The Entire Day Packed',
    videoUrl: 'https://res.cloudinary.com/kbeyfu3d/video/upload/v1795527175/zimor/reels/reel-4.mp4',
    posterUrl: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1795527176/zimor/reels/poster-4.webp',
    instagramUrl: 'https://www.instagram.com/reel/DehSFkxvmew/',
    productSlug: 'zimor-delo-tote-noir',
  },
  {
    id: 'video-5',
    title: 'Structured Daily Essentials',
    videoUrl: 'https://res.cloudinary.com/kbeyfu3d/video/upload/v1795527178/zimor/reels/reel-5.mp4',
    posterUrl: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1795527180/zimor/reels/poster-5.webp',
    instagramUrl: 'https://www.instagram.com/reel/Dfw0jsbN4oi/',
    productSlug: 'zimor-rabota-tote-espresso',
  },
];
