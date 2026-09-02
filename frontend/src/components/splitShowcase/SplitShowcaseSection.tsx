import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitShowcaseSlide } from '@/components/splitShowcase/SplitShowcaseSlide';
import type { SplitShowcaseSectionProps } from '@/components/splitShowcase/splitShowcase.types';
import '@/components/splitShowcase/splitShowcase.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

function getScrollDistance(section: HTMLElement, track: HTMLElement) {
  return Math.max(0, track.scrollWidth - section.offsetWidth);
}

function updateSlidePresence(slides: HTMLDivElement[]) {
  const center = window.innerWidth / 2;

  slides.forEach((slide) => {
    const rect = slide.getBoundingClientRect();
    const slideCenter = rect.left + rect.width / 2;
    const distance = Math.abs(slideCenter - center);
    const presence = 1 - Math.min(1, distance / (window.innerWidth * 0.5));
    gsap.set(slide, {
      opacity: 0.82 + presence * 0.18,
      scale: 0.98 + presence * 0.02,
    });
  });
}

export function SplitShowcaseSection({ id, title, subtitle, items }: SplitShowcaseSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPinnedMode, setIsPinnedMode] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(min-width: 768px) and (prefers-reduced-motion: no-preference)').matches;
  });

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;

      const slides = items
        .map((item) => slidesRef.current.get(item.id))
        .filter((node): node is HTMLDivElement => node !== null);

      const mm = gsap.matchMedia();

      mm.add('(max-width: 767px), (prefers-reduced-motion: reduce)', () => {
        setIsPinnedMode(false);
        gsap.set(track, { clearProps: 'transform' });
        slides.forEach((slide) => gsap.set(slide, { clearProps: 'opacity,transform' }));
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
              updateSlidePresence(slides);
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
          updateSlidePresence(slides);
        };

        window.addEventListener('resize', onResize);
        updateSlidePresence(slides);

        return () => {
          window.removeEventListener('resize', onResize);
          tween.scrollTrigger?.kill();
          tween.kill();
          gsap.set(track, { clearProps: 'transform' });
          slides.forEach((slide) => gsap.set(slide, { clearProps: 'opacity,transform' }));
        };
      });

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [items] },
  );

  const sectionClass = ['split-showcase-section', isPinnedMode ? 'is-pinned' : 'is-static'].join(' ');

  return (
    <section ref={sectionRef} id={id} className={sectionClass}>
      <div className="split-showcase-section__header">
        <h2 className="split-showcase-section__title">{title}</h2>
        {subtitle && <p className="split-showcase-section__subtitle">{subtitle}</p>}
      </div>

      {isPinnedMode && items.length > 1 && (
        <div className="split-showcase-section__progress" aria-hidden>
          {items.map((item, index) => (
            <span
              key={item.id}
              className={[
                'split-showcase-section__progress-bar',
                index <= activeIndex ? (index === activeIndex ? 'is-active' : 'is-passed') : '',
              ]
                .filter(Boolean)
                .join(' ')}
            />
          ))}
        </div>
      )}

      <div className="split-showcase-section__viewport">
        <div ref={trackRef} className="split-showcase-section__track">
          {items.map((item) => (
            <SplitShowcaseSlide
              key={item.id}
              item={item}
              slideRef={(node) => slidesRef.current.set(item.id, node)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
