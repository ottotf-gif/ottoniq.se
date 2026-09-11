interface MarqueeProps {
  items?: string[];
}

export default function Marquee({ items = [] }: MarqueeProps) {
  const doubled = [...items, ...items, ...items, ...items];
  return (
    <section className="border-y border-border-subtle bg-bg py-6 overflow-hidden">
      <div className="marquee">
        <div className="marquee__track">
          {doubled.map((item, i) => (
            <span key={i} className="flex items-center gap-12 text-text-dim text-sm tracking-wide whitespace-nowrap">
              {item}
              <span className="text-accent text-xs">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
