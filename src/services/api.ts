
import apiClient from '@/api/apiClient';
import { fallbackData, getFallbackMessage } from './fallbackData';

export interface Language {
  id: string;
  languageName: string;
  code: string;
  icon: string;
  is_active: number;
}

export interface NewsCategory {
  id: string;
  name: string;
  language_id: string;
  icon: string;
  color: string;
  is_active: number;
}

export interface State {
  id: string;
  stateName: string;
  language_id: string;
  isDeleted: number;
  is_active: number;
}

export interface District {
  id: string;
  districtName: string;
  state_id: string;
  isDeleted: number;
  is_active: number;
}

export interface LocalMandiCategory {
  id: string;
  categoryName: string;
  categoryIcon: string;
}

export interface NewsItem {
  id: string;
  title: string;
  shortNewsContent: string;
  media: { mediaUrl: string }[];
  categoryName: string;
  districtName: string;
  stateName: string;
  readTime: string;
  authorName: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  result: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// Exact types for /states API response items
interface StateApiItem {
  id: string;
  name: string;
  code: string;
  language_id: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
}

type StatesApiResponse = ApiResponse<PaginatedResponse<StateApiItem>>;

// Retry function for failed requests
const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;
      
      // Only retry on network errors or 5xx errors
      if (error?.type === 'NETWORK_ERROR' || (error?.status >= 500 && error?.status < 600)) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
};

// API service functions
export const apiService = {
  // 1. Languages Dropdown
  async getLanguages(): Promise<Language[]> {
    try {
      const response = await retryRequest(() => 
        apiClient.get<ApiResponse<Language[]>>('/news/languages')
      );
      return response.data.result || [];
    } catch (error: any) {
      console.error('Error fetching languages:', error);
      console.warn('Using fallback data for languages');
      return fallbackData.languages as Language[];
    }
  },

  // 2. News Categories Dropdown
  async getNewsCategories(): Promise<NewsCategory[]> {
    try {
      const response = await retryRequest(() => 
        apiClient.get<ApiResponse<NewsCategory[]>>('/news/categories')
      );
      return response.data.result || [];
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      console.warn('Using fallback data for categories');
      return fallbackData.categories as NewsCategory[];
    }
  },

  // 3. States List
  async getStates(language_id: string): Promise<State[]> {
    try {
      const response = await retryRequest(() =>
        apiClient.get<StatesApiResponse>(`/news/states?language_id=${language_id}`)
      );
      const items = response.data.result?.items || [];
      return items.map((s: StateApiItem) => ({
        id: s.id,
        stateName: s.name,
        language_id: s.language_id,
        isDeleted: s.isDeleted ? 1 : 0,
        is_active: s.is_active ? 1 : 0,
      }));
    } catch (error: any) {
      console.error('Error fetching states:', error);
      console.warn('Using fallback data for states');
      return fallbackData.states as State[];
    }
  },

  // 4. Districts List
  async getDistricts(state_id: string): Promise<District[]> {
    try {
      const response = await retryRequest(() => 
        apiClient.get<ApiResponse<District[]>>(`/news/districts?state_id=${state_id}`)
      );
      return response.data.result?.filter(district => district.isDeleted !== 1) || [];
    } catch (error: any) {
      console.error('Error fetching districts:', error);
      console.warn('Using fallback data for districts');
      return fallbackData.districts as District[];
    }
  },

  // 5. Local Mandi Categories
  async getLocalMandiCategories(): Promise<LocalMandiCategory[]> {
    try {
      const response = await retryRequest(() => 
        apiClient.get<ApiResponse<{ items: LocalMandiCategory[] }>>('/local-mandi-categories')
      );
      return response.data.result?.items || [];
    } catch (error: any) {
      console.error('Error fetching local mandi categories:', error);
      return [];
    }
  },

  // Breaking News Section
  async getBreakingNews(): Promise<NewsItem[]> {
    try {
      const response = await retryRequest(() => 
        apiClient.get<ApiResponse<PaginatedResponse<NewsItem>>>('/news/filter-advanced')
      );
      return response.data.result?.items || [];
    } catch (error: any) {
      console.error('Error fetching breaking news:', error);
      console.warn('Using fallback data for breaking news');
      return fallbackData.newsItems as NewsItem[];
    }
  }
};
