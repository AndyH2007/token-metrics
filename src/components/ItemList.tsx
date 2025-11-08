import Link from "next/link";

type Props = {
  items: { id: string; name: string; symbol?: string }[];
  linkBase?: string; // if provided, make rows clickable for 30-day view
};

export default function ItemList({ items, linkBase }: Props) {
  if (!items?.length) return <p>No items.</p>;

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {items.map((it) => (
        <li
          key={it.id}
          style={{ padding: "8px 0", borderBottom: "1px solid #222" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <div>
              <strong>{it.name}</strong>{" "}
              {it.symbol && (
                <span style={{ color: "#888" }}>({it.symbol})</span>
              )}
            </div>
            {linkBase && (
              
<Link href={`/item/${encodeURIComponent(it.id)}`}>
  30-day view
</Link>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
