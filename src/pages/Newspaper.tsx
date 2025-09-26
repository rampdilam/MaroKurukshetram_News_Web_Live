import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { 
  Calendar, 
  Download, 
  FileText, 
  Loader2, 
  AlertCircle, 
  ExternalLink,
  RefreshCw,
  Newspaper as NewspaperIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getENewspapers, getLast7DaysDateRange, generateLast7Dates, formatDateForDisplay } from "../api/enewspapers";
import { ENewspaper, Language } from "../api/apiTypes";

interface Edition {
  id: string;
  date: string;
  displayDate: string;
  pdfUrl: string;
  isToday?: boolean;
  isYesterday?: boolean;
  isAvailable: boolean;
  title: string;
  subtitle: string;
  thumbnail: string;
  pages: number;
  size: string;
  language: any;
  addedBy: string;
  createdAt: string;
}

interface DateItem {
  date: string;
  dayName: string;
  dayNumber: string;
  monthName: string;
  isToday: boolean;
  fullDate: string;
}

const Newspaper = () => {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Utility function to handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, size: string = "400x600") => {
    const target = e.currentTarget;
    const [width, height] = size.split('x');
    target.src = `https://via.placeholder.com/${width}x${height}/f3f4f6/9ca3af?text=Newspaper`;
  };

  // Generate last 7 dates
  const last7Dates = useMemo(() => generateLast7Dates(), []);
  
  // Initialize selected date to today
  useEffect(() => {
    if (last7Dates.length > 0 && !selectedDate) {
      setSelectedDate(last7Dates[last7Dates.length - 1].date);
    }
  }, [last7Dates, selectedDate]);

  // Load selected language from localStorage
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

    window.addEventListener('storage', handleLanguageChange);
    window.addEventListener('languageChanged', handleLanguageChange);
    window.addEventListener('focus', handleLanguageChange);

    return () => {
      window.removeEventListener('storage', handleLanguageChange);
      window.removeEventListener('languageChanged', handleLanguageChange);
      window.removeEventListener('focus', handleLanguageChange);
    };
  }, []);

  // Get date range for last 7 days
  const dateRange = useMemo(() => getLast7DaysDateRange(), []);

  // Fetch e-newspapers
  const { data: newspapersData, isLoading, error, refetch } = useQuery({
    queryKey: ['e-newspapers', selectedLanguage?.id, dateRange.dateFrom, dateRange.dateTo],
    queryFn: () => {
      if (!selectedLanguage?.id) {
        throw new Error('No language selected');
      }
      return getENewspapers({
        language_id: selectedLanguage.id,
        dateFrom: dateRange.dateFrom,
        dateTo: dateRange.dateTo,
        type: "paper",
        page: 1,
        limit: 10
      });
    },
    enabled: !!selectedLanguage?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Transform API data to editions
  const editions: Edition[] = useMemo(() => {
    if (!newspapersData?.result?.items) return [];
    
    console.log('Processing newspapers data:', newspapersData.result.items);
    
    return newspapersData.result.items.map((newspaper: ENewspaper) => {
      const displayDate = formatDateForDisplay(newspaper.date, selectedLanguage?.code || "en");
      const today = new Date();
      const newspaperDate = new Date(newspaper.date);
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      
      // Log PDF URL for debugging
      console.log(`Newspaper for ${newspaper.date}:`, {
        id: newspaper.id,
        pdfUrl: newspaper.pdfUrl,
        pdfPath: newspaper.pdfPath,
        hasPdfUrl: !!newspaper.pdfUrl,
        hasPdfPath: !!newspaper.pdfPath
      });
      
      // Use pdfPath if pdfUrl is not available
      const finalPdfUrl = newspaper.pdfUrl || newspaper.pdfPath || '';
      
      return {
        id: newspaper.id,
        date: newspaper.date,
        displayDate,
        pdfUrl: finalPdfUrl,
        isToday: newspaperDate.toDateString() === today.toDateString(),
        isYesterday: newspaperDate.toDateString() === yesterday.toDateString(),
        isAvailable: !!(newspaper.pdfUrl || newspaper.pdfPath),
        title: "MARO KURUKSHETRAM",
        subtitle: "The Voice of Truth",
        thumbnail: newspaper.thumbnail || "https://via.placeholder.com/400x600/f3f4f6/9ca3af?text=Newspaper",
        pages: 12, // Default pages
        size: "2.5 MB", // Default size
        language: newspaper.language,
        addedBy: newspaper.addedBy,
        createdAt: newspaper.createdAt,
      };
    });
  }, [newspapersData, selectedLanguage?.code]);

  // Get newspaper data for a specific date
  const getNewspaperForDate = (date: string): Edition => {
    const newspaper = editions.find(n => n.date === date);
    
    if (newspaper) {
      console.log('Found newspaper for date:', date, 'PDF URL:', newspaper.pdfUrl);
      return newspaper;
    }
    
    console.log('No newspaper found for date:', date);
    // Fallback for dates without newspapers
    return {
      id: '',
      date: date,
      displayDate: formatDateForDisplay(date, selectedLanguage?.code || "en"),
      pdfUrl: '',
      isAvailable: false,
      title: "MARO KURUKSHETRAM",
      subtitle: "The Voice of Truth",
      thumbnail: "https://via.placeholder.com/400x600/f3f4f6/9ca3af?text=Newspaper",
      pages: 0,
      size: "0 MB",
      language: null,
      addedBy: '',
      createdAt: '',
    };
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleOpenInBrowser = async () => {
    if (selectedNewspaper.pdfUrl) {
      try {
        window.open(selectedNewspaper.pdfUrl, '_blank');
      } catch (error) {
        alert('Unable to open PDF. Please try again later.');
      }
    }
  };

  const handleDownloadPDF = (pdfUrl: string) => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `newspaper-${selectedDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const selectedNewspaper = getNewspaperForDate(selectedDate);

  // Check if we have any newspapers loaded
  const hasNewspapers = editions.length > 0;

  // Show message if no language is selected
  if (!selectedLanguage) {
    return (
      <main className="container mx-auto p-4">
        <div className="text-center py-8">
          <h2 className="text-2xl font-semibold mb-4">{t("newspaper.title")}</h2>
          <p className="text-gray-600 text-lg">
            {t("newspaper.selectLanguage")}
          </p>
        </div>
      </main>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <main className="container mx-auto p-4">
        <div className="text-center py-8">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-indigo-600" />
          <h2 className="text-2xl font-semibold mb-4">{t("newspaper.title")}</h2>
          <p className="text-gray-600">{t("newspaper.loadingNewspapers")}</p>
        </div>
      </main>
    );
  }

  // Show error state
  if (error) {
    return (
      <main className="container mx-auto p-4">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-semibold mb-4">{t("newspaper.title")}</h2>
          <p className="text-red-600 mb-4">{t("newspaper.errorLoading")}: {error.message}</p>
          <p className="text-gray-600 mb-4">{t("newspaper.checkApiEndpoint")}</p>
          <Button onClick={() => refetch()} className="bg-indigo-600 hover:bg-indigo-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("newspaper.tryAgain")}
          </Button>
        </div>
      </main>
    );
  }

  // Show empty state if no newspapers are loaded
  if (!isLoading && editions.length === 0) {
    return (
      <main className="container mx-auto p-4">
        <div className="text-center py-8">
          <NewspaperIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-semibold mb-4">{t("newspaper.title")}</h2>
          <p className="text-gray-600 mb-4">{t("newspaper.noNewspapersFound")}</p>
          <p className="text-gray-500 mb-4">{t("newspaper.tryDifferentDate")}</p>
          <Button onClick={() => refetch()} className="bg-indigo-600 hover:bg-indigo-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("newspaper.refresh")}
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">
          {t("newspaper.title")}
      </h2>
      </div>

          

      {/* Date Selector - Last 7 Days */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Calendar className="h-5 w-5" />
            {t("newspaper.selectDate")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center overflow-x-auto gap-3 pb-2">
            {last7Dates.map((dateItem) => (
              <Button
                key={dateItem.date}
                variant={selectedDate === dateItem.date ? "default" : "outline"}
                className={`flex items-center justify-center gap-2 p-3 min-w-[140px] h-16 relative rounded-lg ${
                  selectedDate === dateItem.date 
                    ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md" 
                    : "hover:bg-gray-50 text-gray-900"
                }`}
                onClick={() => handleDateSelect(dateItem.date)}
              >
                {/* Day Name */}
                <div className={`text-xs font-semibold uppercase tracking-wide ${
                  selectedDate === dateItem.date ? "text-white" : "text-gray-600"
                }`}>
                  {dateItem.dayName}
                </div>
                
                {/* Date Number */}
                <div className={`text-lg font-bold ${
                  selectedDate === dateItem.date ? "text-white" : "text-gray-900"
                }`}>
                  {dateItem.dayNumber}
                </div>
                
                {/* Month Name */}
                <div className={`text-xs font-medium ${
                  selectedDate === dateItem.date ? "text-white" : "text-gray-600"
                }`}>
                  {dateItem.monthName}
                </div>
                
                {/* Today Badge */}
                {dateItem.isToday && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 text-[8px] px-1.5 py-0.5 font-semibold">
                    {t("newspaper.today")}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* PDF Viewer */}
      <Card>
        <CardContent className="p-0">
          {selectedNewspaper.isAvailable && selectedNewspaper.pdfUrl ? (
            <div className="relative">
              {/* PDF Controls */}
              <div className="bg-gray-800 text-white p-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    {last7Dates.find(d => d.date === selectedDate)?.fullDate}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-black border-white bg-white"
                      onClick={handleOpenInBrowser}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      {t("newspaper.openInBrowser")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-black border-white bg-white"
                      onClick={() => handleDownloadPDF(selectedNewspaper.pdfUrl)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      {t("newspaper.download")}
                    </Button>
                  </div>
                </div>
              </div>

              {/* PDF Content */}
              <div className="relative bg-gray-100" style={{ height: '80vh' }}>
                {pdfLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p>{t("newspaper.loading")}</p>
                    </div>
                  </div>
                )}

                {pdfError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                    <div className="text-center">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                      <p className="text-lg font-medium mb-4">{pdfError}</p>
                      <div className="flex gap-4 justify-center">
                        <Button onClick={() => setPdfError(null)}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          {t("newspaper.retry")}
                        </Button>
                        <Button variant="outline" onClick={handleOpenInBrowser}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {t("newspaper.openInBrowser")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

          <iframe
                  src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(selectedNewspaper.pdfUrl)}`}
                  className="w-full h-full border-0"
                  onLoad={() => {
                    console.log('PDF loaded successfully via Google Docs viewer');
                    setPdfLoading(false);
                    setPdfError(null);
                  }}
                  onError={() => {
                    console.error('PDF load error via Google Docs');
                    setPdfLoading(false);
                    setPdfError('Failed to load PDF via Google Docs viewer');
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 bg-gray-100">
              <div className="text-center text-gray-500">
                <NewspaperIcon className="h-16 w-16 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">{t("newspaper.noNewspaperAvailable")}</p>
                <p className="text-sm text-gray-400">
                  {hasNewspapers ? t("newspaper.pdfNotAvailable") : t("newspaper.noNewspapersLoaded")}
              </p>
            </div>
          </div>
        )}
        </CardContent>
      </Card>


    </main>
  );
};

export default Newspaper;