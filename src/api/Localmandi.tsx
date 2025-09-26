import apiClient from "./apiClient";
import {
  LocalMandiResponse,
  LocalMandiCategoriesResponse,
  GetLocalMandisParams,
} from "./apiTypes";

// Fetch Mandis
export async function getLocalMandis(params: GetLocalMandisParams) {
  const res = await apiClient.get<LocalMandiResponse>("/local-mandi-categories/items", {
    params,
  });
  return res.data;
}

// Fetch Categories
export async function getLocalMandiCategories(language_id: string) {
  const res = await apiClient.get<LocalMandiCategoriesResponse>(
    "/local-mandi-categories",
    { params: { language_id } }
  );
  return res.data;
}
