import React, { useState, useEffect } from "react";
import { Clock, User, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import apiClient from '@/api/apiClient';

interface NewsItem {
  id: string;
  title: string;
  shortNewsContent?: string;
  excerpt?: string;
  categoryName?: string;
  authorName?: string;
  createdAt: string;
  districtName?: string;
  media?: Array<{
    mediaUrl: string;
    mediaType: string;
  }>;
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

// Utility: Get stored language
const getSelectedLanguageFromStorage = () => {
  try {
    const stored = localStorage.getItem("selectedLanguage");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error parsing stored language:", error);
  }
  return null;
};

// Utility: Map i18n language to ID
const getlanguage_idFromI18n = () => {
  const language_idMap: Record<string, string> = {
    en: "5dd95034-d533-4b09-8687-cd2ed3682ab6",
    te: "90255d91-aead-47c9-ba76-ea85e75dc68b",
    hi: "d9badd6f-ffb3-4fff-91aa-b14c7af45e06",
    kn: "22172f29-f60e-4875-be34-1fdb05106e3d",
    ur: "ba9c4fc4-f346-470e-bdd4-8e3a6a0f3ed1",
    ta: "f316a270-bf20-4a2c-90ae-3cb19fae65fb",
  };

  const currentLang = localStorage.getItem("i18nextLng") || "en";
  return language_idMap[currentLang] || language_idMap["en"];
};

const TechAndEntertainmentNews: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [technologyNews, setTechnologyNews] = useState<NewsItem[]>([]);
  const [entertainmentNews, setEntertainmentNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState("English");

  // Categories for tech & entertainment
  const techCategoryIds = [
    // Example tech category IDs
    "a553d9b4-42ea-42e0-806f-8c69f703981a",
    "9c4bdb16-66a1-4e74-898d-ccaea3b68484"
  ];
  const entertainmentCategoryIds = [ // Example entertainment category IDs
    "9c1b079f-4acc-4d84-99f7-4f54693fa8c9",
    "f60379af-613c-42e6-9612-ee666555c0a1"
  ];

  // Get language ID for API
  const getCurrentlanguage_id = () => {
    const storedLanguage = getSelectedLanguageFromStorage();
    if (storedLanguage && storedLanguage.id) {
      return storedLanguage.id;
    }
    return getlanguage_idFromI18n();
  };

  // Fetch both news
  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);

      const language_id = getCurrentlanguage_id();
      const storedLanguage = getSelectedLanguageFromStorage();

      if (storedLanguage && storedLanguage.languageName) {
        setCurrentLanguage(storedLanguage.languageName);
      } else {
        setCurrentLanguage("English");
      }

      const [techRes, entRes] = await Promise.all([
        apiClient.get<NewsResponse>('/news/filter-multi-categories', {
          params: {
            categoryIds: techCategoryIds.join(','),
            language_id,
            limit: 6,
            page: 1
          }
        }),
        apiClient.get<NewsResponse>('/news/filter-multi-categories', {
          params: {
            categoryIds: entertainmentCategoryIds.join(','),
            language_id,
            limit: 3,
            page: 1
          }
        })
      ]);

      const techData = techRes.data;
      const entData = entRes.data;

      setTechnologyNews(techData.result?.items || []);
      setEntertainmentNews(entData.result?.items || []);
    } catch (err: any) {
      console.error(err);
      setError(t("errors.newsLoadError"));
    } finally {
      setLoading(false);
    }
  };

  // Format "time ago"
  const formatTimeAgo = (dateString: string) => {
    const now = Date.now();
    const createdAt = new Date(dateString).getTime();
    const diffInHours = Math.floor((now - createdAt) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - createdAt) / (1000 * 60));
      return t("time.minutesAgo", { count: diffInMinutes });
    } else if (diffInHours < 24) {
      return t("time.hoursAgo", { count: diffInHours });
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return t("time.daysAgo", { count: diffInDays });
    }
  };

  // Navigate to details
  const handleCardClick = (newsId: string) => {
    navigate(`/news/${newsId}`);
  };

  // Fetch on mount & language change
  useEffect(() => {
    fetchNews();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "selectedLanguage" || e.key === "i18nextLng") {
        fetchNews();
      }
    };

    i18n.on("languageChanged", fetchNews);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      i18n.off("languageChanged", fetchNews);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">{t("loading.newsLoading")}</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-6">{error}</div>;
  }

  return (
    <>
      {/* Technology Section */}
      <section id="technology" className="py-12 bg-gray-50 font-mandali scroll-mt-24">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 text-center">
            {t("headings.technologyLatestNews")}{" "}
            {currentLanguage !== "English" && (
              <span className="text-lg text-gray-600">({currentLanguage})</span>
            )}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technologyNews.map((news) => (
              <Card
                key={news.id}
                className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                onClick={() => handleCardClick(news.id)}
              >
                <div className="relative">
                  <img
                    src={
                      news.media?.[0]?.mediaUrl ||
                      "/lovable-uploads/default-tech.jpg"
                    }
                    alt={news.title}
                    className="w-full h-48 sm:h-56 md:h-64 lg:h-72 object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/lovable-uploads/default-tech.jpg";
                      target.onerror = null; // Prevent infinite loop
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <CardContent className="p-4 sm:p-5">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {news.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                    {news.shortNewsContent ||
                      news.excerpt ||
                      t("labels.noDetails")}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-xs text-gray-500">
                    <span className="flex items-center">
                      <User className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">
                        {news.authorName || t("labels.unknownAuthor")}
                      </span>
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                      {formatTimeAgo(news.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Entertainment Section */}
      <section id="entertainment" className="py-12 bg-white font-mandali scroll-mt-24">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 text-center">
            {t("headings.entertainmentLatestNews")}{" "}
            {currentLanguage !== "English" && (
              <span className="text-lg text-gray-600">({currentLanguage})</span>
            )}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entertainmentNews.map((news) => (
              <Card
                key={news.id}
                className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                onClick={() => handleCardClick(news.id)}
              >
                <div className="relative">
                  <img
                    src={
                      news.media?.[0]?.mediaUrl ||
                      "/lovable-uploads/default-ent.jpg"
                    }
                    alt={news.title}
                    className="w-full h-48 sm:h-56 md:h-64 lg:h-72 object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/lovable-uploads/default-ent.jpg";
                      target.onerror = null; // Prevent infinite loop
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <CardContent className="p-4 sm:p-5">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {news.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                    {news.shortNewsContent ||
                      news.excerpt ||
                      t("labels.noDetails")}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-xs text-gray-500">
                    <span className="flex items-center">
                      <User className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">
                        {news.authorName || t("labels.unknownAuthor")}
                      </span>
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                      {formatTimeAgo(news.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default TechAndEntertainmentNews;