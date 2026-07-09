import { NextResponse } from "next/server";
import { invite } from "@/actions/invite";

export async function POST(request: Request): Promise<NextResponse> {
  if (process.env.E2E_TEST_MODE !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const { orderId, email } = (await request.json()) as { orderId: string; email: string };
  const formData = new FormData();
  formData.set("orderId", orderId);
  formData.set("email", email);
  const result = await invite(formData);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ joinUrl: result.data.joinUrl });
}
