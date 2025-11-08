import { NextResponse } from "next/server";
import { api } from "@/lib/apiClient";
import { SeriesPoint } from "@/lib/types";

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const raw = await api.getTokenById(id);
    const token = raw.data?.[0];

    if (!token) {
      return NextResponse.json(
        { id, series: [], error: "Token not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    const basePrice = Number(token.CURRENT_PRICE ?? 0) || 1;
    const dailyPct =
      Number(token.PRICE_CHANGE_PERCENTAGE_24H_IN_CURRENCY ?? 0) / 100 || 0;

    const series: SeriesPoint[] = [];
    let price = basePrice;

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);

      if (i !== 29) {
        price =
          price * (1 + dailyPct / 40) +
          Math.sin(i / 3) * basePrice * 0.003;
      }

      series.push({
        t: fmt(d),
        v: Number(price.toFixed(6)),
      });
    }

    return NextResponse.json({
      id,
      name: token.TOKEN_NAME,
      symbol: token.TOKEN_SYMBOL,
      series,
      note:
        "30-day curve generated from free /tokens snapshot. Swap to paid indices/history endpoints via this route.",
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        id,
        series: [],
        error: e?.message || "Failed to build 30-day view",
      },
      { status: 500 }
    );
  }
}
