// lib/utils/format.ts

export function formatDate(timestamp: string | undefined | null): string {
  if (!timestamp) return "정보 없음";
  const date = new Date(timestamp);
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
