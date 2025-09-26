import apiClient from "./apiClient";
import { Comment, CommentsResponse, PostCommentRequest } from "./apiTypes";

// Post a comment to a news article
export async function postComment(newsId: string, commentData: PostCommentRequest): Promise<Comment> {
  console.log('Posting comment with data:', {
    newsId,
    commentData,
    url: `/news/${newsId}/comments`
  });
  
  // Include newsId in the request body as well
  const requestData = {
    ...commentData,
    newsId: newsId
  };
  
  const response = await apiClient.post<Comment>(`/news/${newsId}/comments`, requestData);
  return response.data;
}

// Get all comments for a news article with pagination
export async function getComments(
  newsId: string, 
  page: number = 1, 
  perPage: number = 10
): Promise<CommentsResponse> {
  console.log('Fetching comments with data:', {
    newsId,
    page,
    perPage,
    url: `/news/${newsId}/comments`
  });
  
  try {
    const response = await apiClient.get<CommentsResponse>(`/news/${newsId}/comments`, {
      params: { page, perPage }
    });
    console.log('Comments response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in getComments:', error);
    throw error;
  }
}

// Get comment count for a news article
export async function getCommentCount(newsId: string): Promise<number> {
  console.log('Fetching comment count for newsId:', newsId);
  
  try {
    // First try the dedicated count endpoint
    const response = await apiClient.get<{ total: number }>(`/news/${newsId}/comments/count`);
    console.log('Comment count response:', response.data);
    return response.data.total || 0;
  } catch (error) {
    console.log('Count API not available, using comments API fallback');
    // Fallback: get count from comments API (this is more reliable)
    try {
      const commentsResponse = await getComments(newsId, 1, 1); // Just get 1 comment to get total count
      console.log('Comment count from comments API:', commentsResponse.total);
      return commentsResponse.total || 0;
    } catch (fallbackError) {
      console.error('Fallback comment count also failed:', fallbackError);
      return 0;
    }
  }
}
