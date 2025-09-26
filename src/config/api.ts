// Centralized API configuration for client-side code
// Prefer configuring API_BASE_URL in .env once. Vite exposes VITE_* vars to the client.

export const API_BASE_URL: string =
  (import.meta as any).env?.API_BASE_URL ||
  (import.meta as any).env?.VITE_API_BASE_URL ||
  "https://phpstack-1520234-5847937.cloudwaysapps.com/api/v1";

export const IMG_BASE_URL: string =
  (import.meta as any).env?.VITE_IMG_BASE_URL || API_BASE_URL;


