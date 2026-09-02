import type { HorizontalScrollItem } from '@/components/horizontalScroll/horizontalScroll.types';

interface HorizontalScrollCardProps {
  item: HorizontalScrollItem;
  cardRef?: (node: HTMLDivElement | null) => void;
}

export function HorizontalScrollCard({ item, cardRef }: HorizontalScrollCardProps) {
  return (
    <article ref={cardRef} className="horizontal-scroll-card" data-card-id={item.id}>
      <div className="horizontal-scroll-card__head">
        {item.number && <span className="horizontal-scroll-card__number">{item.number}</span>}
        <h3 className="horizontal-scroll-card__title">{item.title}</h3>
        <p className="horizontal-scroll-card__description">{item.description}</p>
      </div>

      <div className="horizontal-scroll-card__preview">
        {item.content ??
          (item.image ? (
            <img
              src={item.image}
              alt=""
              style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
            />
          ) : null)}
      </div>
    </article>
  );
}
