import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import apiClient from '@/api/apiClient';

// Define the structure of media
interface Media {
  mediaUrl: string;
  caption?: string | null;
}

// Define the structure of each news item
interface NewsItem {
  id: string;
  title: string;
  shortNewsContent: string | null;
  media: Media[];
  categoryName: string;
  createdAt: string;
}

// Define the API response structure
interface ApiResponse {
  status: number;
  message: string;
  result: {
    status: number;
    message: string;
    items: NewsItem[];
  };
}

// Function to get selected language from localStorage
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

// Map i18n languages to language IDs
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

const SportsSection = () => {
  const { t, i18n } = useTranslation();
  const [sportsNews, setSportsNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentLanguage, setCurrentLanguage] = useState<string>("English");
  const navigate = useNavigate();

  // Sports category IDs
   const sportsCategoryIds = [
    "1ad88ec6-6730-42cd-ab01-256c80ee3152",
    "8d5953a6-b0c4-44e4-b52e-3e87fbd91781",
    "bf960e88-d18e-49fd-9083-3fab00dbcead",
    'bcbbb088-c504-4147-95f1-2d4883a8cb92',
    'eab908b8-eaf8-4812-ba02-cf7203a20865',
    '22ee5226-a422-4a30-a997-bac59ec24a29',

    "ebb9fd74-e14f-4908-a58f-57a3e745c042"
  ];

  // Get current language ID for API calls
  const getCurrentlanguage_id = (): string => {
    const storedLanguage = getSelectedLanguageFromStorage();
    if (storedLanguage && storedLanguage.id) {
      return storedLanguage.id;
    }
    return getlanguage_idFromI18n();
  };

  const fetchSportsNews = async () => {
    try {
      setLoading(true);
      const language_id = getCurrentlanguage_id();
      const storedLanguage = getSelectedLanguageFromStorage();

      // Update current language name for display
      if (storedLanguage && storedLanguage.languageName) {
        setCurrentLanguage(storedLanguage.languageName);
      } else {
        setCurrentLanguage("English");
      }

      const response = await apiClient.get<ApiResponse>('/news/filter-multi-categories', {
        params: {
          categoryIds: sportsCategoryIds.join(','),
          language_id,
          limit: 4,
          page: 1
        }
      });
      
      if (response.data.status === 1) {
        setSportsNews(response.data.result.items || []);
      }
    } catch (error) {
      console.error("Error fetching sports news:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSportsNews();
  }, []);

  // Listen for language change
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "selectedLanguage" || e.key === "i18nextLng") {
        fetchSportsNews();
      }
    };

    const handleLanguageChange = () => {
      fetchSportsNews();
    };

    window.addEventListener("storage", handleStorageChange);
    i18n.on("languageChanged", handleLanguageChange);

    window.addEventListener("languageUpdated", handleLanguageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("languageUpdated", handleLanguageChange);
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  const handleCardClick = (newsId: string) => {
    navigate(`/news/${newsId}`);
  };

  return (
    <section id="sports" className="font-mandali py-12 bg-white scroll-mt-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {t("sports.title")}
            {currentLanguage !== "English" && (
              <span className="text-lg text-gray-600 ml-2">
                ({currentLanguage})
              </span>
            )}
          </h2>
          <p className="text-gray-600">{t("sports.subtitle")}</p>
        </div>

        {/* Full-width sports news */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {t("sports.latestNews")}
          </h3>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-4"></div>
              <p className="text-gray-500 text-lg">{t("sports.loading")}</p>
              {/* Loading skeleton */}
              <div className="space-y-6 mt-8 w-full">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="md:flex">
                      <div className="md:w-2/5 h-48 md:h-80 bg-gray-200 animate-pulse"></div>
                      <div className="md:w-3/5 p-4 sm:p-6">
                        <div className="flex justify-between mb-3">
                          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="h-8 bg-gray-200 rounded animate-pulse mb-4"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : sportsNews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">{t("sports.noNews")}</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {sportsNews.map((news) => {
                const imageUrl = news.media && news.media.length > 0
                  ? news.media[0].mediaUrl
                  : "/lovable-uploads/Sports12.png";
                const summary = news.shortNewsContent || t("sports.noSummary");
                const category = news.categoryName || t("sports.defaultCategory");
                const time = new Date(news.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });

                return (
                  <Card
                    key={news.id}
                    className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                    onClick={() => handleCardClick(news.id)}
                  >
                    <div className="flex flex-col sm:flex-row h-full">
                      {/* Image */}
                      <div className="sm:w-2/5 h-48 sm:h-56 md:h-64 lg:h-72 flex-shrink-0 relative">
                        <img
                          src={imageUrl}
                          alt={news.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/lovable-uploads/Sports12.png";
                            target.onerror = null; // Prevent infinite loop
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                      </div>

                      {/* Text Content */}
                      <div className="sm:w-3/5 flex flex-col justify-between p-4 sm:p-6">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                              {category}
                            </span>
                            <div className="flex items-center text-gray-500 text-xs">
                              <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{time}</span>
                            </div>
                          </div>
                          <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 line-clamp-2">
                            {news.title}
                          </CardTitle>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm sm:text-base line-clamp-3">
                            {summary}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SportsSection;