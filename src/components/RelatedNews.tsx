import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFilteredNews } from "../api/news";
import { NewsItem } from "../api/apiTypes";

interface RelatedNewsProps {
  categoryId: string;
  language_id: string;
  state_id: string;
  district_id: string;
  currentNewsId?: string;
}

const RelatedNews: React.FC<RelatedNewsProps> = ({
  categoryId,
  language_id,
  state_id,
  district_id,
  currentNewsId,
}) => {
  const navigate = useNavigate();
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedNews = async () => {
      try {
        setLoading(true);
        const newsData = await getFilteredNews({
          language_id,
          categoryId,
          state_id,
          district_id,
          page: 1,
        });

        if (newsData?.items) {
          const filtered = newsData.items
            .filter((n) => n.id !== currentNewsId)
            .slice(0, 8);
          setRelatedNews(filtered);
        }
      } catch (err) {
        console.error("Error fetching related news:", err);
        setRelatedNews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRelatedNews();
  }, [categoryId, language_id, state_id, district_id, currentNewsId]);

  const handleClick = (news: NewsItem) => {
    navigate(`/news/${news.id}`);
  };

  if (loading) {
    return (
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Related Entertainment Updates:</h2>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!relatedNews.length) {
    return null;
  }

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4">Related News Updates:</h2>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {relatedNews.map((news) => (
          <div
            key={news.id}
            className="flex-shrink-0 w-48 cursor-pointer"
            onClick={() => handleClick(news)}
          >
            {/* Image */}
            <div className="w-full h-32 rounded-md overflow-hidden bg-gray-200">
              {news.media?.[0]?.mediaUrl ? (
                <img
                  src={news.media[0].mediaUrl}
                  alt={news.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span className="text-2xl">📰</span>
                </div>
              )}
            </div>
            {/* Title */}
            <h3 className="text-sm font-medium text-gray-800 mt-2 line-clamp-2">
              {news.title}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedNews;