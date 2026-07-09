import { headers } from "next/headers";
import { appBaseUrl } from "@/lib/config";

export async function buildJoinUrl(token: string): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const origin = `${protocol}://${host}`;
  return `${appBaseUrl(origin)}/join/${token}`;
}
