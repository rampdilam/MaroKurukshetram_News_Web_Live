import apiClient from "./apiClient";
import { Category } from "../api/apiTypes";

interface CategoriesResponse {
  status: number;
  message: string;
  result: Category[];
}

export const getCategories = async (
  language_id: string | number
): Promise<Category[]> => {
  try {
    // 1) Prefer server-side filtering if supported
    const server = await apiClient.get<CategoriesResponse>(
      `/news/categories`,
      { params: { language_id } }
    );

    const serverList =
      server.data?.status === 1 && Array.isArray(server.data?.result)
        ? server.data.result
        : [];

    // If server already filtered by language, return active ones
    const serverLooksFiltered =
      serverList.length > 0 &&
      serverList.every(
        (c) => String(c.language_id ?? "") === String(language_id)
      );

    let filtered: Category[] = [];
    if (serverLooksFiltered) {
      filtered = serverList.filter((c) => c && c.is_active === 1);
    } else {
      // 2) Fallback: fetch all and filter client-side
      const all =
        serverLooksFiltered
          ? server
          : await apiClient.get<CategoriesResponse>("/news/categories");

      const allList =
        all.data?.status === 1 && Array.isArray(all.data?.result)
          ? all.data.result
          : [];

      filtered = allList.filter(
        (c) => String(c.language_id ?? "") === String(language_id) && c.is_active === 1
      );
    }

    // Deduplicate categories by ID to prevent duplicates
    const seen = new Set();
    const uniqueCategories = filtered.filter((category) => {
      const id = String(category.id);
      if (seen.has(id)) {
        console.warn(`Duplicate category found in API response: ${category.category_name} (ID: ${id})`);
        return false;
      }
      seen.add(id);
      return true;
    });

    // Debug logging
    if (filtered.length !== uniqueCategories.length) {
      console.log(`Categories deduplication: ${filtered.length} -> ${uniqueCategories.length} (removed ${filtered.length - uniqueCategories.length} duplicates)`);
    }

    return uniqueCategories;
  } catch (error) {
    console.error("Error fetching categories", error);
    throw error;
  }
};