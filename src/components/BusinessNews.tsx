import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TrendingUp, Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import apiClient from '@/api/apiClient';

// Function to get selected language from localStorage (same way Header.tsx stores it)
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

const getlanguage_idFromI18n = () => {
  // Default language mappings
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

interface MarketStat {
  labelKey: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

const BusinessNews = () => {
  const { t, i18n } = useTranslation();
  const [businessNews, setBusinessNews] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<string>("English");
  const navigate = useNavigate();

  const businessCategoryId = ["810133ef-03e2-45d0-9ed1-9f54fc51ebe9",
    'b15266d7-7bdd-47b1-aaba-d890e28c97ab',
    '4fa0bcdd-c669-400a-a089-69ba2f167c21',
    '600eb8ca-578d-4916-b081-ef5a139f46d4',
    '0aa7cc71-0925-4f46-a5f6-048d216bed45',
    '72f30614-e6ae-4bac-b9d6-6d41c03cd710',

    "afbe031c-6b2f-40fc-8feb-6e3b2a6c0fc8",
    "bfc5bf40-ae42-4bd6-af62-cd39a09dcb57"
  ]

  // const marketStats: MarketStat[] = [
  //   { labelKey: "SENSEX", value: "65,245", change: "+1.2%", trend: "up" },
  //   { labelKey: "NIFTY", value: "19,456", change: "+0.8%", trend: "up" },
  //   { labelKey: "USDINR", value: "83.15", change: "-0.3%", trend: "down" },
  // ];

  // get current language_id
  const getCurrentlanguage_id = (): string => {
    const storedLanguage = getSelectedLanguageFromStorage();
    if (storedLanguage && storedLanguage.id) {
      return storedLanguage.id;
    }
    return getlanguage_idFromI18n();
  };

  const fetchBusinessNews = async () => {
    try {
      setLoading(true);
      setError(null);

      const language_id = getCurrentlanguage_id();
      const storedLanguage = getSelectedLanguageFromStorage();

      if (storedLanguage?.languageName) {
        setCurrentLanguage(storedLanguage.languageName);
      } else {
        setCurrentLanguage("English");
      }

      const response = await apiClient.get('/news/filter-multi-categories', {
        params: {
          categoryIds: businessCategoryId.join(','),
          language_id,
          limit: 8,
          page: 1
        }
      });

      if ((response.data as any).status === 1) {
        setBusinessNews((response.data as any).result?.items || []);
      } else {
        throw new Error(t("fetchError") || "Failed to fetch news");
      }
    } catch (err: any) {
      setError(err.message || t("somethingWentWrong") || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessNews();
  }, [t]);

  // Re-fetch news when language changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "selectedLanguage" || e.key === "i18nextLng") {
        fetchBusinessNews();
      }
    };

    const handleLanguageChange = () => {
      fetchBusinessNews();
    };

    window.addEventListener("storage", handleStorageChange);
    i18n.on("languageChanged", handleLanguageChange);

    window.addEventListener("languageUpdated", fetchBusinessNews);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("languageUpdated", fetchBusinessNews);
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  const handleCardClick = (newsId: string) => {
    navigate(`/news/${newsId}`);
  };

  return (
    <section id="business" className="py-12 bg-gray-50 font-mandali scroll-mt-24">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t("businessNews")}
            {currentLanguage !== "English" && (
              <span className="text-lg text-gray-600 ml-2">
                ({currentLanguage})
              </span>
            )}
          </h2>
          <p className="text-gray-600">{t("latestMarketTrends")}</p>
        </div>

        {/* Market Stats */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {marketStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {t(stat.labelKey)}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`flex items-center ${
                      stat.trend === "up" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    <TrendingUp
                      className={`h-4 w-4 mr-1 ${
                        stat.trend === "down" ? "rotate-180" : ""
                      }`}
                    />
                    <span className="text-sm font-medium">{stat.change}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div> */}

        {/* Loading/Error */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
            <span className="text-gray-600">{t("loadingNews")}</span>
          </div>
        )}
        {error && <p className="text-center text-red-500">{error}</p>}

        {/* Business News */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {businessNews.map((news: any) => {
            const imageUrl =
              news.media?.length > 0
                ? news.media[0].mediaUrl
                : "https://via.placeholder.com/400x280?text=No+Image";
            const summary =
              news.shortNewsContent || news.excerpt || t("noSummary");
            const category = news.categoryName || t("business");
            const time = news.createdAt
              ? new Date(news.createdAt).toLocaleDateString("en-IN")
              : t("recently");

            return (
              <Card
                key={news.id}
                className="overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col md:flex-row"
                onClick={() => handleCardClick(news.id)}
              >
                {/* Image */}
                <div className="md:w-[53%] h-52 md:h-55 flex-shrink-0">
                  <img
                    src={imageUrl}
                    alt={news.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Text Content */}
                <div className="md:w-3/5 flex flex-col justify-between p-1 h-52 md:h-55">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        {category}
                      </span>
                      <div className="flex items-center text-gray-500 text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {time}
                      </div>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">
                      {news.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {summary}
                    </p>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>

        {businessNews.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-600">
            {t("labels.noNewsAvailable")}
            {currentLanguage !== "English" && (
              <span className="block text-sm mt-1">
                No news available for {currentLanguage}
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default BusinessNews;