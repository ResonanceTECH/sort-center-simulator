import { FOOTER_STACK_ITEMS } from '@/landing/constants/footerStackContent';
import { FooterStackIcon } from '@/landing/components/FooterStackIcon';

interface FooterStackBentoProps {
  title: string;
}

export function FooterStackBento({ title }: FooterStackBentoProps) {
  return (
    <div className="landing-footer__stack">
      <p className="landing-footer__stack-title">{title}</p>
      <div className="landing-footer__stack-bento">
        {FOOTER_STACK_ITEMS.map((item) => (
          <div
            key={item.id}
            className={[
              'landing-footer__stack-cell',
              item.span === 2 ? 'landing-footer__stack-cell--wide' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            title={item.name}
          >
            <FooterStackIcon id={item.icon} />
          </div>
        ))}
      </div>
    </div>
  );
}
