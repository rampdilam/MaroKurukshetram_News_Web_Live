import React from "react";
import Slider, { CustomArrowProps } from "react-slick";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import apiClient from '@/api/apiClient';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// -------- Language Map --------
const LANGUAGE_MAP: Record<string, string> = {
  en: "5dd95034-d533-4b09-8687-cd2ed3682ab6",
  te: "90255d91-aead-47c9-ba76-ea85e75dc68b",
  hi: "d9badd6f-ffb3-4fff-91aa-b14c7af45e06",
  kn: "22172f29-f60e-4875-be34-1fdb05106e3d",
  ur: "ba9c4fc4-f346-470e-bdd4-8e3a6a0f3ed1",
  ta: "f316a270-bf20-4a2c-90ae-3cb19fae65fb",
};

// -------- API Function --------
const fetchBreakingNews = async (language_id: string): Promise<NewsItem[]> => {
  const response = await apiClient.get<ApiResponse>('/news/filter-multi-categories', {
    params: {
      categoryIds: '4a7781ef-f7d7-4fbf-bdd4-581482c47ccd,f26c2d2a-2de0-4036-ac09-eb8be2e1b5ae,9c70fa99-10a7-42c1-8dcb-db0cbfed8bb0,bd387718-9498-48a8-bbf1-b5a4253eac57,0e391f8c-3f08-434c-b5b5-9b4c17ea41bd,94ff8b97-489f-4080-9f1b-d16a4fd25e98,027382ac-f70d-4ef9-925a-b4cdd52e8dde,d2f52a8b-2fcb-47b7-8d85-defea6862b17',
      language_id,
      limit: 6,
      page: 1
    }
  });
  
  return response.data.result?.items || [];
};


// -------- Types --------
interface ApiResponse {
  status: number;
  message: string;
  result?: {
    status: number;
    message: string;
    items: NewsItem[];
  };
}

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  shortNewsContent?: string;
  categoryName?: string;
  media?: {
    id: string;
    mediaUrl: string;
    altText?: string;
    caption?: string;
  }[];
}

// -------- Custom Arrows --------
const PrevArrow: React.FC<CustomArrowProps> = ({ onClick }) => {
  const { t } = useTranslation();
  return (
    <button
      onClick={onClick}
      className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-white hover:bg-red-500 text-red-500 hover:text-white rounded-full w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center shadow-xl border-2 border-red-500 transition-all duration-300 hover:scale-110 hover:shadow-2xl"
      style={{ marginLeft: "-20px" }}
      aria-label={t("featured.prevSlide")}
    >
      <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
};

const NextArrow: React.FC<CustomArrowProps> = ({ onClick }) => {
  const { t } = useTranslation();
  return (
    <button
      onClick={onClick}
      className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-white hover:bg-red-500 text-red-500 hover:text-white rounded-full w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center shadow-xl border-2 border-red-500 transition-all duration-300 hover:scale-110 hover:shadow-2xl"
      style={{ marginRight: "-20px" }}
      aria-label={t("featured.nextSlide")}
    >
      <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
};

// -------- Breaking News Component --------
const BreakingNews: React.FC = () => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();

  const currentLang = i18n.language || "en";
  const language_id = LANGUAGE_MAP[currentLang] || LANGUAGE_MAP["en"];

  const { data: news, isLoading, isError } = useQuery({
    queryKey: ["breakingNews", language_id],
    queryFn: () => fetchBreakingNews(language_id),
  });

  // 👉 Navigate on card click
  const handleCardClick = (newsId: string) => {
    navigate(`/news/${newsId}`);
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 800,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      { 
        breakpoint: 1200, 
        settings: { 
          slidesToShow: 3, 
          slidesToScroll: 1,
          arrows: true,
          dots: false
        } 
      },
      { 
        breakpoint: 1024, 
        settings: { 
          slidesToShow: 2, 
          slidesToScroll: 1,
          arrows: false,
          dots: false
        } 
      },
      { 
        breakpoint: 768, 
        settings: { 
          slidesToShow: 2, 
          slidesToScroll: 1, 
          arrows: false,
          dots: false
        } 
      },
      { 
        breakpoint: 576, 
        settings: { 
          slidesToShow: 1, 
          slidesToScroll: 1, 
          arrows: false,
          dots: false
        } 
      },
    ],
  };

  if (isLoading) {
    return <p className="text-center py-6">{t("loadingNews")}</p>;
  }

  if (isError || !news?.length) {
    return <p className="text-center py-6 text-red-500">{t("fetchError")}</p>;
  }

  return (
    <section className="featured-post-area pt-12 pb-8 font-mandali">
      <div className="container mx-auto px-8 lg:px-12 relative">
        <Slider {...settings}>
          {news.map((item: NewsItem) => (
            <div
              key={item.id}
              className="px-2 relative cursor-pointer"
              onClick={() => handleCardClick(item.id)}
            >
              <div className="featured-post-item bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="featured-post-thumb relative overflow-hidden">
                  <img
                    src={item.media?.[0]?.mediaUrl || "/lovable-uploads/BreakingNews12.png"}
                    alt={item.media?.[0]?.altText || item.title}
                    className="w-full h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] xl:h-[550px] object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                  {/* Overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="featured-post-content p-4 sm:p-5">
                  <span className="inline-block text-xs sm:text-sm font-semibold mb-2 text-red-600 bg-red-50 px-2 py-1 rounded-full">
                    {item.categoryName || t("featured.breakingTag")}
                  </span>
                  <h2 className="post-title text-base sm:text-lg md:text-xl font-semibold leading-tight text-gray-900 line-clamp-2">
                    {item.title}
                  </h2>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default BreakingNews;