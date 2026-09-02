import { useCallback, useState } from 'react';
import type { SplitShowcaseItem } from '@/components/splitShowcase/splitShowcase.types';
import '@/landing/sections/screensShowcase.css';

interface ScreensShowcaseSectionProps {
  id?: string;
  title: string;
  subtitle?: string;
  items: SplitShowcaseItem[];
}

function clampIndex(index: number, length: number) {
  return Math.min(length - 1, Math.max(0, index));
}

export function ScreensShowcaseSection({ id, title, subtitle, items }: ScreensShowcaseSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(clampIndex(index, items.length));
    },
    [items.length],
  );

  return (
    <section id={id} className="screens-showcase">
      <div className="screens-showcase__header">
        <h2 className="screens-showcase__title">{title}</h2>
        {subtitle && <p className="screens-showcase__subtitle">{subtitle}</p>}
      </div>

      <div className="screens-showcase__layout">
        <article className="screens-showcase__card" aria-live="polite">
          <div className="screens-showcase__preview">
            <div className="screens-showcase__preview-frame">
              {items.map((item, index) => (
                <img
                  key={item.id}
                  src={item.image}
                  alt={item.title}
                  loading={index <= 1 ? 'eager' : 'lazy'}
                  className={[
                    'screens-showcase__image',
                    index === activeIndex ? 'is-active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                />
              ))}
            </div>

            <div className="screens-showcase__preview-footer">
              <div className="screens-showcase__stepper" aria-live="polite">
                <span className="screens-showcase__step-num is-active">
                  {String(activeIndex + 1).padStart(2, '0')}
                </span>
                <span className="screens-showcase__step-dot is-active" aria-hidden />
                {activeIndex < items.length - 1 && (
                  <>
                    <span className="screens-showcase__step-line" aria-hidden />
                    <span className="screens-showcase__step-num">
                      {String(activeIndex + 2).padStart(2, '0')}
                    </span>
                    <span className="screens-showcase__step-dot" aria-hidden />
                  </>
                )}
              </div>

              <div className="screens-showcase__nav">
                <button
                  type="button"
                  className="screens-showcase__nav-btn"
                  onClick={() => goTo(activeIndex - 1)}
                  disabled={activeIndex === 0}
                  aria-label="Предыдущий экран"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="screens-showcase__nav-btn"
                  onClick={() => goTo(activeIndex + 1)}
                  disabled={activeIndex === items.length - 1}
                  aria-label="Следующий экран"
                >
                  →
                </button>
              </div>
            </div>
          </div>

          <div className="screens-showcase__copy">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={[
                  'screens-showcase__copy-panel',
                  index === activeIndex ? 'is-active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-hidden={index !== activeIndex}
              >
                {item.number && (
                  <span className="screens-showcase__number">{item.number}</span>
                )}
                <h3 className="screens-showcase__copy-title">{item.title}</h3>
                <p className="screens-showcase__copy-text">{item.description}</p>

                {item.stats && item.stats.length > 0 && (
                  <div className="screens-showcase__stats">
                    {item.stats.map((stat) => (
                      <div key={stat.label} className="screens-showcase__stat">
                        <span className="screens-showcase__stat-label">{stat.label}</span>
                        <span className="screens-showcase__stat-value">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
