import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { getLocalMandis, getLocalMandiCategories } from "../api/Localmandi";
import {
  LocalMandiItem,
  LocalMandiCategory,
  LocalMandiCategoriesResponse,
  State,
  Language,
} from "../api/apiTypes";
import getStates from "../api/States";
import getDistricts, { District } from "../api/Districts";

// Utility type for dropdown filtering
type Option = { id: string; name: string };

// Utility
function uniqueBy<T extends Option>(arr: T[], key: keyof T): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of arr) {
    const k = String(item[key]);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(item);
    }
  }
  return out;
}

// Trend helpers
function getTrendColor(trend: string) {
  if (trend === "up") return "bg-green-100 text-green-700";
  if (trend === "down") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-600";
}
function getTrendBgColor(trend: string) {
  if (trend === "up") return "bg-green-50";
  if (trend === "down") return "bg-red-50";
  return "";
}
function getTrendIcon(trend: string) {
  if (trend === "up") return <TrendingUp className="w-4 h-4" />;
  if (trend === "down") return <TrendingDown className="w-4 h-4" />;
  return <Minus className="w-4 h-4" />;
}

export default function LocalMandi() {
  const { t } = useTranslation();
  const [mandiItems, setMandiItems] = useState<LocalMandiItem[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [categories, setCategories] = useState<LocalMandiCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [state_id, setstate_id] = useState<string>("");
  const [district_id, setdistrict_id] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");

  const [showTable, setShowTable] = useState(false);

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

  // Load data based on selected language
  useEffect(() => {
    const loadData = async () => {
      if (!selectedLanguage) return;

      try {
        // Load categories for the selected language
        const catRes: LocalMandiCategoriesResponse = await getLocalMandiCategories(selectedLanguage.id);
        setCategories(catRes.result.categories || []);

        // Load states for the selected language
        const statesData = await getStates(selectedLanguage.id);
        setStates(statesData || []);

        // Clear districts when language changes
        setDistricts([]);
        setstate_id("");
        setdistrict_id("");
        setCategoryId("");
        setMandiItems([]);
        setShowTable(false);
      } catch (err) {
        console.error("Error fetching language-based data:", err);
        setStates([]);
        setDistricts([]);
        setCategories([]);
      }
    };

    loadData();
  }, [selectedLanguage]);

  // Load districts when state is selected
  useEffect(() => {
    const loadDistricts = async () => {
      if (!state_id || !selectedLanguage) return;

      try {
        const districtsData = await getDistricts(state_id);
        setDistricts(districtsData || []);
        // Clear district selection when state changes
        setdistrict_id("");
        setCategoryId("");
        setMandiItems([]);
        setShowTable(false);
      } catch (err) {
        console.error("Error fetching districts:", err);
        setDistricts([]);
      }
    };

    loadDistricts();
  }, [state_id, selectedLanguage]);

  // Fetch With Filters (only if all selected)
  const fetchFiltered = async (page: number = 1) => {
    if (!state_id || !district_id || !categoryId) {
      return; // 🚫 Stop if filters not selected
    }
    setLoading(true);
    try {
      const res = await getLocalMandis({
        page,
        limit: pagination.limit,
        categoryId,
        state_id,
        district_id,
      });
      
      if (res.status === 1) {
        setMandiItems(res.result.items);
        setPagination(res.result.pagination);
        setShowTable(true); // ✅ Show table only after fetching data
      } else {
        console.error("API Error:", res.message);
        setMandiItems([]);
      }
    } catch (err) {
      console.error("Error fetching filtered data:", err);
      setMandiItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Options
  const stateOptions = useMemo(() => (states || []).map((s) => ({ id: s.id, name: s.name })), [states]);
  const districtOptions = useMemo(
    () => (districts || []).filter((d) => (state_id ? d.state_id === state_id : true)).map((d) => ({ id: d.id, name: d.name })),
    [districts, state_id]
  );
  const categoryOptions = useMemo(() => (categories || []).map((c) => ({ id: c.id, name: c.categoryName })), [categories]);

  // Table Data
  const filteredData = useMemo(
    () =>
      (mandiItems || []).map((item) => ({
        name: item.name,
        icon: item.itemIcon ? "🧺" : "🍀",
        district: item.districtName,
        minPrice: `₹${item.minPrice}`,
        maxPrice: `₹${item.maxPrice}`,
        modalPrice: `₹${item.avgPrice}`,
        trend: Math.random() > 0.5 ? "up" : "down",
        change: `${Math.floor(Math.random() * 10)}%`,
        unit: item.unit || "N/A",
        quality: item.quality || "N/A",
        description: item.description || "",
        categoryName: item.categoryName || "N/A",
      })),
    [mandiItems]
  );

  const filtersSelected = state_id && district_id && categoryId;

  // Show message if no language is selected
  if (!selectedLanguage) {
    return (
      <div className="p-4 space-y-6">
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold mb-4">{t("localMandi.title")}</h1>
          <p className="text-gray-600 text-lg">
            Please select a language from the header to view local mandi data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-2">
        <h1 className="text-3xl font-bold">{t("localMandi.title")}</h1>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => fetchFiltered(1)} disabled={!filtersSelected}>
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">{t("localMandi.filterTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* State */}
            <Select onValueChange={(v) => setstate_id(v)}>
              <SelectTrigger>
                <SelectValue placeholder={t("localMandi.selectState")} />
              </SelectTrigger>
              <SelectContent>
                {stateOptions.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* District */}
            <Select onValueChange={(v) => setdistrict_id(v)} disabled={!state_id}>
              <SelectTrigger>
                <SelectValue placeholder={t("localMandi.selectDistrict")} />
              </SelectTrigger>
              <SelectContent>
                {districtOptions.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category */}
            <Select onValueChange={(v) => setCategoryId(v)} disabled={!district_id}>
              <SelectTrigger>
                <SelectValue placeholder={t("localMandi.selectCategory")} />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-center">
            <Button onClick={() => fetchFiltered(1)} disabled={!filtersSelected || loading}>
              {loading ? t("localMandi.loadingMarketData") : t("localMandi.getMarketData")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Show Table only after data fetch */}
      {showTable && (
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="text-xl font-bold text-center">
              {t("localMandi.tableTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b-2 border-gray-200">
                  <TableHead className="text-center font-bold text-gray-800 py-4">
                    {t("localMandi.tableHeaders.commodity")}
                  </TableHead>
                  <TableHead className="text-center font-bold text-gray-800">
                    {t("localMandi.tableHeaders.mandi")}
                  </TableHead>
                  <TableHead className="text-center font-bold text-gray-800">
                    {t("localMandi.tableHeaders.minPrice")}
                  </TableHead>
                  <TableHead className="text-center font-bold text-gray-800">
                    {t("localMandi.tableHeaders.maxPrice")}
                  </TableHead>
                  <TableHead className="text-center font-bold text-gray-800">
                    {t("localMandi.tableHeaders.modalPrice")}
                  </TableHead>
                  <TableHead className="text-center font-bold text-gray-800">
                    Unit
                  </TableHead>
                  <TableHead className="text-center font-bold text-gray-800">
                    Quality
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <TableRow
                      key={index}
                      className={`hover:bg-blue-50 transition-colors border-b border-gray-100 ${getTrendBgColor(item.trend)}`}
                    >
                      <TableCell className="text-center py-4">
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-2xl">{item.icon}</span>
                          <div className="text-left">
                            <div className="font-semibold text-gray-900">{item.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium text-gray-800">{item.district}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-xl font-bold text-gray-900">{item.minPrice}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-xl font-bold text-gray-900">{item.maxPrice}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-xl font-bold text-gray-900">{item.modalPrice}</span>
                          <div
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${getTrendColor(item.trend)}`}
                          >
                            {getTrendIcon(item.trend)}
                            <span>{item.change}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium text-gray-800">{item.unit}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium text-gray-800">{item.quality}</span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                      {t("localMandi.noData")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}