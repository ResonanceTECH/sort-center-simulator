import type { HorizontalScrollItem } from '@/components/horizontalScroll/horizontalScroll.types';

interface HorizontalScrollProgressProps {
  items: HorizontalScrollItem[];
  activeIndex: number;
}

export function HorizontalScrollProgress({ items, activeIndex }: HorizontalScrollProgressProps) {
  return (
    <div className="horizontal-scroll-progress" aria-label="Прогресс по этапам">
      {items.map((item, index) => {
        const isActive = index === activeIndex;
        const isPassed = index < activeIndex;
        const number = item.number ?? String(index + 1).padStart(2, '0');

        return (
          <div key={item.id} className="horizontal-scroll-progress__item">
            <span
              className={`horizontal-scroll-progress__label${isActive ? ' is-active' : ''}`}
              aria-current={isActive ? 'step' : undefined}
            >
              {number}
            </span>
            <span
              className={`horizontal-scroll-progress__dot${isActive ? ' is-active' : ''}${isPassed ? ' is-passed' : ''}`}
            />
            {index < items.length - 1 && (
              <span className={`horizontal-scroll-progress__line${isPassed ? ' is-passed' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
