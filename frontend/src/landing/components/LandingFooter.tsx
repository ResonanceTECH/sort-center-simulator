import { useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import LanguageOutlined from '@mui/icons-material/LanguageOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import { FOOTER_CONTENT, FOOTER_SOCIAL } from '@/landing/constants/footerContent';
import '@/landing/styles/landingFooter.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

function scrollToHash(href: string) {
  if (!href.startsWith('#')) return false;
  const id = href.replace('#', '');
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
}

function FooterLink({ href, label }: { href: string; label: string }) {
  const isExternal = href.startsWith('http') || href === '#';

  if (href.startsWith('/')) {
    return (
      <RouterLink to={href} className="landing-footer__link">
        {label}
      </RouterLink>
    );
  }

  return (
    <a
      href={href}
      className="landing-footer__link"
      {...(isExternal && href !== '#' ? { target: '_blank', rel: 'noreferrer' } : {})}
      onClick={(event) => {
        if (scrollToHash(href)) {
          event.preventDefault();
        }
      }}
    >
      {label}
    </a>
  );
}

export function LandingFooter() {
  const footerRef = useRef<HTMLElement>(null);
  const brandRef = useRef<HTMLParagraphElement>(null);
  const { contact, columns, brandWord } = FOOTER_CONTENT;

  useGSAP(
    () => {
      const brand = brandRef.current;
      const footer = footerRef.current;
      if (!brand || !footer) return;

      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(brand, { clearProps: 'transform' });
      });

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          brand,
          { scale: 0.92, y: 24 },
          {
            scale: 1,
            y: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: footer,
              start: 'top 90%',
              end: 'top 40%',
              scrub: 1,
            },
          },
        );

        return () => gsap.set(brand, { clearProps: 'transform' });
      });

      return () => mm.revert();
    },
    { scope: footerRef },
  );

  return (
    <footer ref={footerRef} className="landing-footer">
      <div className="landing-footer__top">
        <div>
          <div className="landing-footer__contact-card">
            <h2 className="landing-footer__contact-title">{contact.title}</h2>

            <div className="landing-footer__contact-row">
              <LanguageOutlined className="landing-footer__contact-icon" fontSize="inherit" />
              <span>{contact.address}</span>
            </div>
            <div className="landing-footer__contact-row">
              <PhoneOutlined className="landing-footer__contact-icon" fontSize="inherit" />
              <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="landing-footer__link">
                {contact.phone}
              </a>
            </div>
            <div className="landing-footer__contact-row">
              <EmailOutlined className="landing-footer__contact-icon" fontSize="inherit" />
              <a href={`mailto:${contact.email}`} className="landing-footer__link">
                {contact.email}
              </a>
            </div>

            <div className="landing-footer__social">
              {FOOTER_SOCIAL.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className="landing-footer__social-link"
                  aria-label={item.label}
                  title={item.label}
                >
                  {item.label.slice(0, 2)}
                </a>
              ))}
            </div>
          </div>

          <p className="landing-footer__hint">{contact.hint}</p>
        </div>

        <div className="landing-footer__links">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="landing-footer__column-title">{column.title}</h3>
              <ul className="landing-footer__link-list">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink href={link.href} label={link.label} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="landing-footer__brand-wrap" aria-hidden>
        <p ref={brandRef} className="landing-footer__brand">
          {brandWord}
        </p>
      </div>
    </footer>
  );
}
