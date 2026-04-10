export const API_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

export const API_V1 = `${API_BASE_URL}/api/v1`;

export function buildDefaultHeaders(baseUrl: string): HeadersInit {
  // Ngrok warning page 회피용 (로컬/일반 도메인에서도 무해)
  if (baseUrl.includes("ngrok")) {
    return { "ngrok-skip-browser-warning": "69420" };
  }
  return {};
}

