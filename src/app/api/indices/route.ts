import { NextResponse } from "next/server";
import { api } from "@/lib/apiClient";

// Treat top-cap tokens as "indices" for this exercise.
export async function GET() {
  try {
    const raw = await api.listTokens(1, 100);
    const data = raw.data ?? [];

    const items = data
      .filter((t: any) => typeof t.MARKET_CAP === "number")
      .sort((a: any, b: any) => b.MARKET_CAP - a.MARKET_CAP)
      .slice(0, 10)
      .map((t: any) => ({
        id: String(t.TOKEN_ID),
        name: t.TOKEN_NAME,
        symbol: t.TOKEN_SYMBOL,
      }));

    return NextResponse.json({ items });
  } catch (e: any) {
    console.error("Indices route error:", e);
    return NextResponse.json(
      {
        items: [],
        error:
          e?.message ||
          "Failed to fetch indices from free /tokens endpoint.",
      },
      { status: 500 }
    );
  }
}
