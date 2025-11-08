import { NextResponse } from "next/server";
import { api } from "@/lib/apiClient";

// Treat biggest 24h movers as "indicators".
export async function GET() {
  try {
    const raw = await api.listTokens(1, 100);
    const data = raw.data ?? [];

    const items = data
      .filter(
        (t: any) =>
          typeof t.PRICE_CHANGE_PERCENTAGE_24H_IN_CURRENCY === "number"
      )
      .sort(
        (a: any, b: any) =>
          Math.abs(
            b.PRICE_CHANGE_PERCENTAGE_24H_IN_CURRENCY
          ) -
          Math.abs(
            a.PRICE_CHANGE_PERCENTAGE_24H_IN_CURRENCY
          )
      )
      .slice(0, 10)
      .map((t: any) => ({
        id: String(t.TOKEN_ID),
        name: t.TOKEN_NAME,
        category: `${t.PRICE_CHANGE_PERCENTAGE_24H_IN_CURRENCY.toFixed(
          2
        )}% / 24h`,
      }));

    return NextResponse.json({ items });
  } catch (e: any) {
    console.error("Indicators route error:", e);
    return NextResponse.json(
      {
        items: [],
        error:
          e?.message ||
          "Failed to fetch indicators from free /tokens endpoint.",
      },
      { status: 500 }
    );
  }
}
