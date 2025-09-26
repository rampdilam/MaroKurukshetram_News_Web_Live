import apiClient from "./apiClient";
import { Language, LanguageResponse } from "./apiTypes";

const getLanguages = async (): Promise<Language[]> => {
  try {
    const response = await apiClient.get<LanguageResponse>("/news/languages");
    if (response.data && Array.isArray(response.data.result)) {
      return response.data.result.map((l) => ({
        id: l.id,
        languageName: l.language_name,
        code: l.language_code,
        is_active: l.is_active,
        createdAt: l.created_at,
      }));
    } else {
      throw new Error("Invalid response structure");
    }
  } catch (error: any) {
    console.error("Failed to fetch languages:", error);
    throw new Error(error?.response?.data?.message || "Unable to fetch languages");
  }
};

export default getLanguages;