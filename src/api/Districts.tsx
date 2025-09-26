import apiClient from "./apiClient";

export interface District {
  id: string;
  name: string;
  state_id: string;
  language_id: string;
  createdAt: string;
  updatedAt: string;
  is_active: number;
}

export default async function getDistricts(state_id: string): Promise<District[]> {
  const res = await apiClient<{ status: number; result: any[] }>({
    url: `/news/districts?state_id=${state_id}`,
    method: "GET",
  });
  
  const districts = res.data.result || [];
  
  return districts.map((district) => ({
    id: district.id,
    name: district.name || district.district_name,
    state_id: district.state_id,
    language_id: district.language_id,
    createdAt: district.created_at || new Date().toISOString(),
    updatedAt: district.updated_at || new Date().toISOString(),
    is_active: district.is_active || 1,
  }));
}