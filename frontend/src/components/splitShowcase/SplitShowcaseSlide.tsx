import type { SplitShowcaseItem } from '@/components/splitShowcase/splitShowcase.types';

interface SplitShowcaseSlideProps {
  item: SplitShowcaseItem;
  slideRef?: (node: HTMLDivElement | null) => void;
}

export function SplitShowcaseSlide({ item, slideRef }: SplitShowcaseSlideProps) {
  return (
    <article ref={slideRef} className="split-showcase-slide" data-slide-id={item.id}>
      <div className="split-showcase-slide__visual">
        <img src={item.image} alt={item.title} loading="lazy" />
        <div className="split-showcase-slide__caption">{item.title}</div>
      </div>

      <div className="split-showcase-slide__panel">
        {item.number && <span className="split-showcase-slide__number">{item.number}</span>}
        <h3 className="split-showcase-slide__title">{item.title}</h3>
        <p className="split-showcase-slide__description">{item.description}</p>

        {item.stats && item.stats.length > 0 && (
          <div className="split-showcase-slide__stats">
            {item.stats.map((stat) => (
              <div key={stat.label} className="split-showcase-slide__stat">
                <span className="split-showcase-slide__stat-label">{stat.label}</span>
                <span className="split-showcase-slide__stat-value">{stat.value}</span>
              </div>
            ))}
          </div>
        )}

        {item.tags && item.tags.length > 0 && (
          <div className="split-showcase-slide__tags">
            {item.tags.map((tag) => (
              <span key={tag} className="split-showcase-slide__tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
