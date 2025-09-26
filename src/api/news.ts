import apiClient from "./apiClient";
import { NewsResponse } from "./apiTypes";

interface ApiResponse<T> {
  status: number;
  message: string;
  result: T;
}

interface NewsFilterParams {
  language_id: string;
  categoryId: string;
  state_id: string;
  district_id: string;
  page?: number;
}

export const getFilteredNews = async (
  params: NewsFilterParams
): Promise<NewsResponse> => {
  try {
    // Tell Axios the expected type
    const response = await apiClient.get<ApiResponse<NewsResponse>>(
      "/news/filter-advanced",
      { params }
    );

    if (response.data.status === 1) {
      return response.data.result; // ✅ correctly typed
    } else {
      throw new Error("Failed to fetch news");
    }
  } catch (error) {
    console.error("Error fetching filtered news", error);
    throw error;
  }
};
