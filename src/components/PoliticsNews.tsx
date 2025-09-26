import React, { useState, useEffect } from 'react';
import { Clock, User, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import apiClient from '@/api/apiClient';

interface NewsItem {
  id: string;
  title: string;
  shortNewsContent?: string;
  excerpt?: string;
  categoryName?: string;
  authorName?: string;
  createdAt: string;
  publishedAt?: string;
  districtName?: string;
  media?: Array<{
    mediaUrl: string;
    mediaType: string;
  }>;
  source?: string;
}

interface NewsResponse {
  status: number;
  result: {
    items: NewsItem[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  };
}

const getSelectedLanguageFromStorage = () => {
  try {
    const stored = localStorage.getItem('selectedLanguage');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error parsing stored language:', error);
  }
  return null;
};

const getlanguage_idFromI18n = () => {
  const language_idMap: Record<string, string> = {
    'en': '5dd95034-d533-4b09-8687-cd2ed3682ab6',
    'te': '90255d91-aead-47c9-ba76-ea85e75dc68b',
    'hi': 'd9badd6f-ffb3-4fff-91aa-b14c7af45e06',
    'kn': '22172f29-f60e-4875-be34-1fdb05106e3d',
    'ur': 'ba9c4fc4-f346-470e-bdd4-8e3a6a0f3ed1',
    'ta': 'f316a270-bf20-4a2c-90ae-3cb19fae65fb',
  };
  
  const currentLang = localStorage.getItem('i18nextLng') || 'en';
  return language_idMap[currentLang] || language_idMap['en'];
};

const PoliticsNews: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [politicsNews, setPoliticsNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<string>('English');
  const navigate = useNavigate();

  const politicsCategoryIds = [
    '288f3453-5f22-4909-a5ff-77d945714fbf',
    '4b99bb8b-849d-4e4d-bc1f-833ff18de8b5', 
    '316d058b-0234-49d9-82d0-b776fca559c9',
    '9cd87cb8-b0b6-4b5d-9e6b-02780925322e',
    'eedcf9f6-a7b9-4ba8-bfd4-2e2090943cfb',
    '245c6300-6948-4469-b1a0-7b1613827a7a',
    '917dc7f8-44a3-4f56-a57c-b635fb24bac5',
    '0cab1bb2-b628-4e4f-a401-d69ea375868f',

    "40c4b7ab-c38a-4cdc-9d97-6db86ec6d598"
  ];

  const getCurrentlanguage_id = (): string => {
    const storedLanguage = getSelectedLanguageFromStorage();
    if (storedLanguage && storedLanguage.id) {
      return storedLanguage.id;
    }
    return getlanguage_idFromI18n();
  };

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);

      const language_id = getCurrentlanguage_id();
      const storedLanguage = getSelectedLanguageFromStorage();
      
      if (storedLanguage?.languageName) {
        setCurrentLanguage(storedLanguage.languageName);
      } else {
        setCurrentLanguage('English');
      }

      console.log('Fetching politics news for language ID:', language_id);

      const response = await apiClient.get<NewsResponse>('/news/filter-multi-categories', {
        params: {
          categoryIds: politicsCategoryIds.join(','),
          language_id,
          limit: 9,
          page: 1
        }
      });

      if (response.data.status === 1 && response.data.result && response.data.result.items) {
        setPoliticsNews(response.data.result.items);
      } else {
        setError(t('errors.noNewsData'));
      }
    } catch (err: any) {
      console.error('Error fetching politics news:', err);
      
      // Handle different error types
      if (err?.type === 'NETWORK_ERROR') {
        setError('Network error. Please check your internet connection and try again.');
      } else if (err?.type === 'NOT_FOUND') {
        setError('News service is temporarily unavailable. Please try again later.');
      } else if (err?.type === 'SERVER_ERROR') {
        setError('Server error. Please try again in a few moments.');
      } else if (err?.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        setError('Unable to connect to the server. Please check your internet connection.');
      } else {
        setError(`Unable to load news. ${err?.message || 'Please try again later.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedLanguage' || e.key === 'i18nextLng') {
        fetchNews();
      }
    };

    const handleLanguageChange = () => {
      fetchNews();
    };

    window.addEventListener('storage', handleStorageChange);
    i18n.on('languageChanged', handleLanguageChange);

    const handleLanguageUpdate = () => {
      fetchNews();
    };
    
    window.addEventListener('languageUpdated', handleLanguageUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('languageUpdated', handleLanguageUpdate);
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date().getTime();
    const createdAt = new Date(dateString).getTime();
    const diffInHours = Math.floor((now - createdAt) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - createdAt) / (1000 * 60));
      return t('time.minutesAgo', { count: diffInMinutes });
    } else if (diffInHours < 24) {
      return t('time.hoursAgo', { count: diffInHours });
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return t('time.daysAgo', { count: diffInDays });
    }
  };

  const handleCardClick = (newsId: string) => {
    navigate(`/news/${newsId}`);
  };

  if (loading) {
    return (
      <section id="politics" className="font-mandali py-8 sm:py-12 bg-gray-50">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex flex-col items-center justify-center py-8 sm:py-12">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-blue-600 mb-3 sm:mb-4" />
            <span className="text-gray-600 text-sm sm:text-lg">{t('loading.newsLoading')}</span>
            {/* Loading skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mt-6 sm:mt-8 w-full">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-40 sm:h-48 md:h-52 lg:h-56 xl:h-60 bg-gray-200 animate-pulse"></div>
                  <div className="p-3 sm:p-4 md:p-6">
                    <div className="h-4 sm:h-5 md:h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse mb-3 sm:mb-4 w-3/4"></div>
                    <div className="flex justify-between gap-2">
                      <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-16 sm:w-20"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-12 sm:w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="politics" className="font-mandali py-8 sm:py-12 bg-gray-50">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex flex-col items-center justify-center py-8 sm:py-12">
            <div className="text-center">
              <div className="text-red-600 text-base sm:text-lg mb-2">{t('errors.newsLoadErrorTitle')}</div>
              <p className="text-gray-600 mb-4 sm:mb-6 max-w-md text-sm sm:text-base px-4">{error}</p>
              <button
                onClick={fetchNews}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                {loading ? 'Retrying...' : 'Try Again'}
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="politics" className="font-mandali py-8 sm:py-12 bg-gray-50 scroll-mt-24">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {t('headings.politicsLatestNews')}
            {currentLanguage !== 'English' && (
              <span className="text-sm sm:text-lg text-gray-600 ml-2">
                ({currentLanguage})
              </span>
            )}
          </h2>
          <p className="text-sm sm:text-base text-gray-600">{t('headings.latestUpdates')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {politicsNews.map((news) => {
            const imageUrl = news.media && news.media.length > 0
              ? news.media[0].mediaUrl
              : '/lovable-uploads/RRKCR5.webp';
            const summary = news.shortNewsContent || news.excerpt || t('labels.noDetails');
            const category = news.categoryName || t('labels.defaultCategory');
            const author = news.authorName || t('labels.unknownAuthor');
            const timeAgo = formatTimeAgo(news.createdAt);

            return (
              <Card
                key={news.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer transform hover:-translate-y-1 mobile-card"
                onClick={() => handleCardClick(news.id)}
              >
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt={news.title}
                    className="w-full h-40 sm:h-48 md:h-52 lg:h-56 xl:h-60 object-cover group-hover:scale-105 transition-transform duration-300 mobile-image"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/lovable-uploads/RRKCR5.webp';
                      target.onerror = null; // Prevent infinite loop
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                    <span className="bg-blue-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium line-clamp-1">
                      {category}
                    </span>
                  </div>
                </div>
                <CardContent className="p-3 sm:p-4 md:p-6 mobile-content">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {news.title}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3">
                    {summary}
                  </p>

                  <div className="flex flex-col gap-2 text-xs text-gray-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center min-w-0 flex-1">
                        <User className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate line-clamp-1">{author}</span>
                      </div>
                      <div className="flex items-center ml-2">
                        <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate line-clamp-1">{timeAgo}</span>
                      </div>
                    </div>
                    {news.districtName && (
  <div className="mt-2">
    <span className="inline-block bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs whitespace-nowrap">
      {news.districtName}
    </span>
  </div>
)}

                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {politicsNews.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-600 mb-2">
              {t('labels.noNewsAvailable')}
              {currentLanguage !== 'English' && (
                <span className="block text-sm mt-1">
                  No news available for {currentLanguage}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PoliticsNews;