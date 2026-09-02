import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HalftoneBackground } from '@/landing/components/HalftoneBackground';
import { EMERGING_PANEL } from '@/landing/constants/emergingPanelContent';
import '@/landing/sections/emergingPanel.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

function BentoIcon({ children }: { children: ReactNode }) {
  return <span className="bento-card__icon">{children}</span>;
}

function BentoDotsBg() {
  return <div className="bento-card__dots-bg" aria-hidden />;
}

export function EmergingPanelSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { left, center, right } = EMERGING_PANEL;

  useGSAP(
    () => {
      const section = sectionRef.current;
      const panel = panelRef.current;
      if (!section || !panel) return;

      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(panel, { clearProps: 'transform' });
      });

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          panel,
          { y: 80 },
          {
            y: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top 88%',
              end: 'top 40%',
              scrub: 1,
            },
          },
        );

        return () => {
          gsap.set(panel, { clearProps: 'transform' });
        };
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id={EMERGING_PANEL.id} className="emerging-panel-section">
      <div className="emerging-panel-section__visual" aria-hidden>
        <div className="emerging-panel-section__halftone">
          <HalftoneBackground />
        </div>
      </div>

      <div ref={panelRef} className="emerging-panel-section__panel">
        <div className="emerging-panel-section__inner">
          <h2 className="emerging-panel-section__title">{EMERGING_PANEL.title}</h2>

          <div className="bento-grid">
            <article className="bento-card bento-card--stat bento-card--pos-stat-left">
              <BentoIcon>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M2 12c0-2.2 2.7-4 6-4s6 1.8 6 4M5 5.5a3 3 0 116 0 3 3 0 01-6 0z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                </svg>
              </BentoIcon>
              <div className="bento-card__stat-value">{left.stat.value}</div>
              <div className="bento-card__stat-label">{left.stat.label}</div>
              <div className="bento-card__logos">
                {left.stat.logos.map((logo) => (
                  <span key={logo} className="bento-card__logo">
                    {logo}
                  </span>
                ))}
              </div>
            </article>

            <article className="bento-card bento-card--landscape bento-card--pos-landscape">
              <BentoDotsBg />
              <div className="bento-card__landscape-ring" aria-hidden />
              <div className="bento-card__landscape-copy">
                <p className="bento-card__landscape-title">{left.landscape.title}</p>
                <p className="bento-card__landscape-sub">{left.landscape.subtitle}</p>
              </div>
            </article>

            <article className="bento-card bento-card--banner bento-card--pos-banner">
              <BentoDotsBg />
              <p className="bento-card__banner-text">{left.banner}</p>
            </article>

            <article className="bento-card bento-card--feature bento-card--pos-feature">
              <div className="bento-card__feature-head">
                <span className="bento-card__feature-avatar" aria-hidden />
                <div>
                  <p className="bento-card__feature-eyebrow">{center.eyebrow}</p>
                  <p className="bento-card__feature-meta">{center.quote}</p>
                </div>
              </div>
              <div className="bento-card__feature-media">
                <img src={center.image} alt="" loading="lazy" />
                <div className="bento-card__feature-caption">
                  <span className="bento-card__feature-name">{center.name}</span>
                  <span className="bento-card__feature-role">{center.role}</span>
                </div>
              </div>
            </article>

            <article className="bento-card bento-card--stat bento-card--pos-stat-right">
              <BentoIcon>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M3 8.5l3 3 7-7"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </BentoIcon>
              <div className="bento-card__stat-value">{right.stat.value}</div>
              <div className="bento-card__stat-label">{right.stat.label}</div>
            </article>

            <article className="bento-card bento-card--tags bento-card--pos-tags">
              <BentoIcon>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M3 5.5h10M3 8h7M3 10.5h5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              </BentoIcon>
              <div className="bento-card__tags-cloud">
                {right.skills.tags.map((tag) => (
                  <span
                    key={tag.label}
                    className={['bento-card__skill', tag.active ? 'is-active' : ''].filter(Boolean).join(' ')}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
              <div className="bento-card__tags-footer">
                <span className="bento-card__stat-value bento-card__stat-value--sm">
                  {right.skills.value}
                </span>
                <span className="bento-card__stat-label">{right.skills.label}</span>
              </div>
            </article>

            <article className="bento-card bento-card--pricing bento-card--pos-pricing">
              <div className="bento-card__pricing-copy">
                <p className="bento-card__pricing-title">{right.pricing.title}</p>
                <span className="bento-card__pricing-pill">{right.pricing.pill}</span>
              </div>
              <div className="bento-card__pricing-rock" aria-hidden>
                <BentoDotsBg />
                <span className="bento-card__pricing-face">:)</span>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
