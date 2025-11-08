"use client";

import { useEffect, useState } from "react";
import ItemList from "@/components/ItemList";

type ListResp = { items: { id: string; name: string; symbol?: string }[] };

export default function HomePage() {
  const [indices, setIndices] = useState<ListResp>({ items: [] });
  const [indicators, setIndicators] = useState<ListResp>({ items: [] });
  const [alive, setAlive] = useState<string>("—");

  useEffect(() => {
    (async () => {
      const [a, b] = await Promise.all([
        fetch("/api/indices").then((r) => r.json()),
        fetch("/api/indicators").then((r) => r.json()),
      ]);
      setIndices(a);
      setIndicators(b);
    })();

    // if keeping SSE
    const es = new EventSource("/api/stream");
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.at) setAlive(data.at);
      } catch {}
    };
    return () => es.close();
  }, []);

  return (
    <main
      style={{
        maxWidth: 960,
        margin: "40px auto",
        padding: "0 16px",
        fontFamily: "system-ui, sans-serif",
        color: "#f5f5f5",
        backgroundColor: "#000",
      }}
    >
      <h1 style={{ fontSize: 48, fontWeight: 700 }}>Indices &amp; Indicators</h1>
      <p style={{ color: "#888" }}>
        Server freshness: <code>{alive}</code>
      </p>

      <section style={{ marginTop: 32 }}>
        <h2>Indices (top tokens by market cap)</h2>
        <ItemList items={indices.items} linkBase="/item" />
      </section>

      <section style={{ marginTop: 32 }}>
  <h2>Indicators (24h movers)</h2>
  <ItemList items={indicators.items} linkBase="/item" />
</section>

    </main>
  );
}
