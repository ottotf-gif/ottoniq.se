interface Props {
  items: string[];
}

export default function Marquee({ items }: Props) {
  return (
    <div className="py-16 sm:py-20 border-y border-ink/10 bg-cream-deep/40 overflow-hidden">
      <div className="marquee">
        <div className="marquee__track" aria-hidden="false">
          {items.map((item, i) => (
            <span
              key={i}
              className="font-serif-italic text-3xl sm:text-4xl text-ink/85 whitespace-nowrap flex items-baseline gap-12 leading-[1.4] py-2"
            >
              {item}
              <span className="text-gold not-italic font-sans text-xl">✦</span>
            </span>
          ))}
        </div>
        <div className="marquee__track" aria-hidden="true">
          {items.map((item, i) => (
            <span
              key={i}
              className="font-serif-italic text-3xl sm:text-4xl text-ink/85 whitespace-nowrap flex items-baseline gap-12 leading-[1.4] py-2"
            >
              {item}
              <span className="text-gold not-italic font-sans text-xl">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}