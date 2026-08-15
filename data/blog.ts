export interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  imageUrl?: string;
  author: string;
}

export const BLOG_POSTS: BlogPost[] = [];
