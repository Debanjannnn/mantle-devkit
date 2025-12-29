import { configs } from "../../constants/oneinch";

/**
 * Get headers for 1inch API requests
 * 1inch uses Bearer token authentication (optional - for higher rate limits)
 * @returns Headers object with optional Authorization header
 */
export function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // 1inch API key is optional - used for higher rate limits
  if (configs.apiKey) {
    headers["Authorization"] = `Bearer ${configs.apiKey}`;
  }

  return headers;
}

