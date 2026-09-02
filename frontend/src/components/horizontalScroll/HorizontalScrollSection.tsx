import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HorizontalScrollProgress } from '@/components/horizontalScroll/HorizontalScrollProgress';
import { HorizontalScrollTrack } from '@/components/horizontalScroll/HorizontalScrollTrack';
import type { HorizontalScrollSectionProps } from '@/components/horizontalScroll/horizontalScroll.types';
import '@/components/horizontalScroll/horizontalScroll.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

function getScrollDistance(section: HTMLElement, track: HTMLElement) {
  return Math.max(0, track.scrollWidth - section.offsetWidth);
}

function updateCardPresence(cards: HTMLDivElement[]) {
  const viewportCenter = window.innerWidth / 2;

  cards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    const cardCenter = rect.left + rect.width / 2;
    const distance = Math.abs(cardCenter - viewportCenter);
    const normalized = Math.min(1, distance / (window.innerWidth * 0.45));
    const presence = 1 - normalized;

    const opacity = 0.75 + presence * 0.25;
    const scale = 0.97 + presence * 0.03;

    gsap.set(card, { opacity, scale });
  });
}

export function HorizontalScrollSection({
  id,
  title,
  subtitle,
  items,
  className,
}: HorizontalScrollSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPinnedMode, setIsPinnedMode] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(min-width: 768px) and (prefers-reduced-motion: no-preference)').matches;
  });

  const registerCard = (cardId: string, node: HTMLDivElement | null) => {
    cardsRef.current.set(cardId, node);
  };

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;

      const cards = items
        .map((item) => cardsRef.current.get(item.id))
        .filter((node): node is HTMLDivElement => node !== null);

      const mm = gsap.matchMedia();

      mm.add('(max-width: 767px), (prefers-reduced-motion: reduce)', () => {
        setIsPinnedMode(false);
        gsap.set(track, { clearProps: 'transform' });
        cards.forEach((card) => gsap.set(card, { clearProps: 'opacity,transform' }));

        return () => {
          ScrollTrigger.getAll().forEach((trigger) => {
            if (trigger.trigger === section) trigger.kill();
          });
        };
      });

      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        setIsPinnedMode(true);

        const tween = gsap.to(track, {
          x: () => -getScrollDistance(section, track),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${getScrollDistance(section, track)}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              updateCardPresence(cards);

              const index = Math.min(
                items.length - 1,
                Math.max(0, Math.round(self.progress * (items.length - 1))),
              );
              setActiveIndex(index);
            },
          },
        });

        const onResize = () => {
          ScrollTrigger.refresh();
          updateCardPresence(cards);
        };

        window.addEventListener('resize', onResize);
        updateCardPresence(cards);

        return () => {
          window.removeEventListener('resize', onResize);
          tween.scrollTrigger?.kill();
          tween.kill();
          gsap.set(track, { clearProps: 'transform' });
          cards.forEach((card) => gsap.set(card, { clearProps: 'opacity,transform' }));
        };
      });

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [items] },
  );

  const sectionClassName = [
    'horizontal-scroll-section',
    isPinnedMode ? 'is-pinned' : 'is-static',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section ref={sectionRef} id={id} className={sectionClassName}>
      <div className="horizontal-scroll-section__header">
        <h2 className="horizontal-scroll-section__title">{title}</h2>
        {subtitle && <p className="horizontal-scroll-section__subtitle">{subtitle}</p>}
      </div>

      {isPinnedMode && items.length > 1 && (
        <div className="horizontal-scroll-section__progress-wrap">
          <HorizontalScrollProgress items={items} activeIndex={activeIndex} />
        </div>
      )}

      <div ref={viewportRef} className="horizontal-scroll-section__viewport">
        <HorizontalScrollTrack items={items} trackRef={trackRef} registerCard={registerCard} />
      </div>
    </section>
  );
}
