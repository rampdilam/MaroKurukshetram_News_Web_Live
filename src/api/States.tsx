import apiClient from "./apiClient";
import { State } from "./apiTypes";

export interface StateApiResponse {
  status: number;
  message: string;
  result: Array<{
    id: string;
    state_name: string;
    state_code: string;
    language_id: string;
    is_active: number;
    created_by: string;
    updated_by: string;
    is_deleted: number;
    deleted_at: string | null;
    deleted_by: string | null;
    created_at: string;
    updated_at: string;
  }>;
}

export default async function getStates(language_id: string): Promise<State[]> {
  try {
    const response = await apiClient<StateApiResponse>({
      url: `/news/states?language_id=${language_id}`,
      method: "GET",
    });

    const states = response.data?.result || [];
    
    return states.map((state) => ({
      id: state.id,
      name: state.state_name, // Map state_name to name
      language_id: state.language_id,
      code: state.state_code, // Map state_code to code
      is_active: state.is_active === 1, // Convert number to boolean
      createdAt: state.created_at,
      updatedAt: state.updated_at,
      createdBy: state.created_by,
      updatedBy: state.updated_by,
      isDeleted: state.is_deleted === 1, // Convert number to boolean
      deletedAt: state.deleted_at,
      deletedBy: state.deleted_by,
    }));
  } catch (error: any) {
    console.error("Failed to fetch states:", error);
    throw new Error(error?.response?.data?.message || "Unable to fetch states");
  }
}

export type { State };