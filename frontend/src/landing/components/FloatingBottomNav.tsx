import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { BOTTOM_NAV, BOTTOM_NAV_CTA } from '@/landing/constants/content';

function scrollToHash(href: string) {
  const id = href.replace('#', '');
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function FloatingBottomNav() {
  const [activeId, setActiveId] = useState<string>(BOTTOM_NAV[0].id);

  useEffect(() => {
    const sectionIds = BOTTOM_NAV.map((item) => item.id);
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: [0, 0.15, 0.4] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="landing-bottom-nav" aria-label="Навигация по секциям">
      <div className="landing-bottom-nav__links">
        {BOTTOM_NAV.map((item) => {
          const isActive = activeId === item.id;
          return (
            <a
              key={item.id}
              href={item.href}
              className={`landing-bottom-nav__link${isActive ? ' is-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              onClick={(event) => {
                event.preventDefault();
                scrollToHash(item.href);
              }}
            >
              {item.label}
            </a>
          );
        })}
      </div>

      <RouterLink to={BOTTOM_NAV_CTA.href} className="landing-bottom-nav__cta">
        {BOTTOM_NAV_CTA.label}
      </RouterLink>
    </nav>
  );
}
