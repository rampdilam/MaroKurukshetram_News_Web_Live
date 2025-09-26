import apiClient from "./apiClient";

interface SingleNewsResponse {
  status: number;
  message: string;
  result: {
    data(data: any): unknown;
    state_id: string;
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    shortNewsContent: string;
    longNewsContent: {
      content: string;
    };
    language_id: string;
    editorId: string;
    authorId: string;
    authorName?: string; // Added this field
    categoryId: string;
    district_id: string;
    seoMeta: string | null;
    metaDescription: string | null;
    status: string;
    type: string;
    priority: string;
    isSticky: boolean;
    isFeatured: boolean;
    viewCount: number;
    uniqueViewCount: number;
    likeCount: number;
    dislikeCount: number;
    shareCount: number;
    commentCount: number;
    publishedAt: string | null;
    scheduledAt: string | null;
    expiresAt: string | null;
    readTime: number | null;
    source: string | null;
    sourceUrl: string | null;
    isApproved: boolean;
    approvedAt: string | null;
    approvedBy: string | null;
    lastModifiedBy: string | null;
    isDeleted: boolean;
    deletedAt: string | null;
    deletedBy: string | null;
    createdAt: string;
    updatedAt: string;
    media: Array<{
      id: string;
      mediaType: string;
      mediaUrl: string;
      caption: string;
    }>;
    categoryName: string;
    districtName: string;
    stateName: string;
    languageName: string;
  };
}

export const getSingleNews = async (newsId: string): Promise<SingleNewsResponse['result']> => {
  try {
    const response = await apiClient.get<SingleNewsResponse>(`/news/${newsId}`);
        
    if (response.data.status === 1) {
      return response.data.result;
    } else {
      throw new Error("Failed to fetch news");
    }
  } catch (error) {
    console.error("Error fetching single news", error);
    throw error;
  }
};