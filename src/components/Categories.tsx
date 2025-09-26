import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories } from "../api/categories";
import apiClient from '@/api/apiClient';

/** Types */
type Category = {
  id: string | number;
  category_name: string;
  icon?: string;
  color?: string;
  language_id?: string | number | null;
  languageName?: string;
  slug?: string;
  description?: string;
  is_active?: number | boolean | "1" | "0";
};

type Language = {
  id: string | number;
  code: string;
  name: string;
  languageName?: string;
};

type NewsItem = {
  id: string;
  title: string;
};

type ApiResponse<T> = {
  status: number;
  message: string;
  result: T[];
};

/** Fetch languages */
const fetchLanguages = async (): Promise<Language[]> => {
  const res = await apiClient.get<ApiResponse<Language>>("/news/languages");
  return Array.isArray(res.data?.result) ? res.data.result : [];
};

/** Join relative icon URLs to a base */
const resolveIconUrl = (src?: string): string | undefined => {
  if (!src) return undefined;
  if (/^https?:\/\//i.test(src)) return src;
  const base =
    (import.meta as any).env?.VITE_IMG_BASE_URL ||
    (import.meta as any).env?.VITE_API_BASE_URL ||
    "";
  if (!base) return src;
  return `${String(base).replace(/\/$/, "")}/${String(src).replace(/^\//, "")}`;
};

/** Bubble */
const CategoryBubble = ({ category }: { category: Category }) => {
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const iconUrl = resolveIconUrl(category.icon);
  const showImg = !!iconUrl && !imgError;

  const handleCardClick = async () => {
    if (!category.id) return;

    try {
      setLoading(true);

      interface NewsApiResponse {
        status: number;
        message: string;
        result: { items: NewsItem[] };
      }

      const res = await apiClient.get<NewsApiResponse>(
        '/news/filter-multi-categories',
        {
          params: { categoryIds: category.id, limit: 1, page: 1 },
        }
      );

      if (res.data.status === 1 && res.data.result.items.length > 0) {
        const firstNews = res.data.result.items[0];
        navigate(`/news/${firstNews.id}`);
      } else {
        alert("No news available for this category.");
      }
    } catch (err) {
      console.error("Error fetching news for category:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex-shrink-0 w-[180px] group flex flex-col items-center cursor-pointer transform transition-all duration-300 hover:scale-110"
      onClick={handleCardClick}
    >
      <div
        className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl flex items-center justify-center mb-4 overflow-hidden transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105 group-hover:border-white"
        style={{
          backgroundColor: category.color || "#3b82f6",
          boxShadow: `0 8px 25px ${(category.color || "#3b82f6")}40`,
        }}
        aria-label={category.category_name}
      >
        {showImg ? (
          <img
            src={iconUrl}
            alt={category.category_name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover" // ✅ makes image fill circle properly
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-white font-bold text-3xl drop-shadow-lg select-none">
            {category.category_name?.charAt(0) ?? "?"}
          </span>
        )}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      <div className="text-center">
        <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-300">
          {loading ? "Loading..." : category.category_name}
        </h3>
      </div>
    </div>
  );
};

const Categories = () => {
  const { t, i18n } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get selected language from localStorage (same as Header.tsx)
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);

  // Load selected language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("selectedLanguage");
    if (savedLanguage) {
      try {
        const parsedLanguage = JSON.parse(savedLanguage);
        setSelectedLanguage(parsedLanguage);
      } catch (error) {
        console.error("Error parsing saved language:", error);
        localStorage.removeItem("selectedLanguage");
      }
    }
  }, []);

  // Listen for language changes from Header.tsx
  useEffect(() => {
    const handleLanguageChange = () => {
      const savedLanguage = localStorage.getItem("selectedLanguage");
      if (savedLanguage) {
        try {
          const parsedLanguage = JSON.parse(savedLanguage);
          setSelectedLanguage(parsedLanguage);
        } catch (error) {
          console.error("Error parsing saved language:", error);
        }
      } else {
        setSelectedLanguage(null);
      }
    };

    // Listen to storage events (when language changes in another tab)
    window.addEventListener('storage', handleLanguageChange);
    
    // Listen to custom language change events (when language changes in same tab)
    window.addEventListener('languageChanged', handleLanguageChange);
    
    // Also check on focus (when user comes back to tab)
    window.addEventListener('focus', handleLanguageChange);

    return () => {
      window.removeEventListener('storage', handleLanguageChange);
      window.removeEventListener('languageChanged', handleLanguageChange);
      window.removeEventListener('focus', handleLanguageChange);
    };
  }, []);

  /** Categories */
  const {
    data: categories = [],
    isLoading: catLoading,
    error: catError,
  } = useQuery<Category[], Error>({
    queryKey: ["categories", selectedLanguage?.id],
    queryFn: async () => {
      if (!selectedLanguage?.id) return [];
      console.log(`[Categories.tsx] Fetching categories for language: ${selectedLanguage.id}`);
      const result = await getCategories(selectedLanguage.id);
      console.log(`[Categories.tsx] Received ${result?.length || 0} categories from API`);
      return result || [];
    },
    enabled: !!selectedLanguage?.id,
    retry: (failureCount) => failureCount < 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  /** Auto-scroll */
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || categories.length === 0) return;
    const scrollSpeed = 0.5;
    let animationFrame = 0;
    const scroll = () => {
      container.scrollLeft += scrollSpeed;
      if (
        container.scrollLeft >=
        container.scrollWidth - container.clientWidth
      ) {
        container.scrollLeft = 0;
      }
      animationFrame = requestAnimationFrame(scroll);
    };
    animationFrame = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrame);
  }, [categories]);

  /** Loading */
  if (catLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white font-mandali">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            {t("categories.title")}
          </h2>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-lg text-gray-700">
            {t("categories.loading")}
          </span>
        </div>
      </section>
    );
  }

  /** Error */
  if (catError) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white font-mandali">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            {t("categories.title")}
          </h2>
          <div className="flex items-center justify-center h-32">
            <AlertCircle className="h-8 w-8 mr-3 text-red-500" />
            <span className="text-lg text-gray-700">
              {t("categories.error")}
            </span>
          </div>
        </div>
      </section>
    );
  }

  if (!selectedLanguage) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white font-mandali">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            {t("categories.title")}
          </h2>
          <p className="text-gray-600 mb-4">
            {t("categories.selectLanguageFirst") ||
              "Please select a language first to view categories."}
          </p>
        </div>
      </section>
    );
  }

  if (!categories.length) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white font-mandali">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            {t("categories.title")}
          </h2>
          <p className="text-gray-600">{t("categories.noCategories")}</p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="categories"
      className="py-16 bg-gradient-to-b from-gray-50 to-white font-mandali scroll-mt-24"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t("categories.title")}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t("categories.subtitle")}
          </p>
          <div className="w-24 h-1 bg-blue-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Smooth auto-scroll container */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 md:gap-8 overflow-x-hidden scrollbar-hide"
        >
          {categories.map((category) => (
            <CategoryBubble key={category.id} category={category} />
          ))}
        </div>

        {/* Dots Animation */}
        <div className="flex justify-center mt-12 space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <div
            className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      </div>
    </section>
  );
};

export default Categories;