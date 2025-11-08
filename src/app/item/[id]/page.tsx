// src/app/item/[id]/page.tsx

type SeriesPoint = { t: string; v: number };

async function fetchItem(id: string) {
  if (!id) return null;

  // Use absolute URL so Next.js/Node can parse it correctly on the server.
  const base =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const res = await fetch(`${base}/api/item/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json();
}

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
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
        <h1>30-day detail</h1>
        <p>Invalid item id.</p>
      </main>
    );
  }

  const data = await fetchItem(id);

  if (!data || data.error) {
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
        <h1>30-day detail for {id}</h1>
        <p>Unable to load data for this item.</p>
        {data?.error && (
          <p style={{ color: "#f88", marginTop: 8 }}>
            {String(data.error)}
          </p>
        )}
      </main>
    );
  }

  const series: SeriesPoint[] = data.series ?? [];

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
      <h1>
        {data.name || `Token ${data.id}`} – 30-day detail
      </h1>
      <p style={{ color: "#888", marginBottom: 16 }}>
        {data.note ??
          "30-day curve based on free /tokens snapshot. See README for how this maps to paid Indices APIs."}
      </p>

      <div
        style={{
          marginTop: 24,
          padding: "16px 12px",
          background: "#111",
          borderRadius: 8,
        }}
      >
        {series.length === 0 ? (
          <p>No data.</p>
        ) : (
          <svg
            width="100%"
            height="260"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {(() => {
              const ys = series.map((p) => p.v);
              const minY = Math.min(...ys);
              const maxY = Math.max(...ys);
              const range = maxY - minY || 1;

              const points = series
                .map((p, i) => {
                  const x =
                    (i / Math.max(series.length - 1, 1)) * 100;
                  const norm = (p.v - minY) / range;
                  const y = 100 - norm * 90 - 5;
                  return `${x},${y}`;
                })
                .join(" ");

              return (
                <polyline
                  fill="none"
                  stroke="#4ea1ff"
                  strokeWidth="0.8"
                  points={points}
                />
              );
            })()}
          </svg>
        )}
      </div>
    </main>
  );
}
