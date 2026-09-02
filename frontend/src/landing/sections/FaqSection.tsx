import { useState } from 'react';
import { FAQ } from '@/landing/constants/faqContent';
import '@/landing/sections/faqSection.css';

export function FaqSection() {
  const [openId, setOpenId] = useState<string>(FAQ.items[0].id);

  const toggle = (id: string) => {
    setOpenId((current) => (current === id ? '' : id));
  };

  return (
    <section id={FAQ.id} className="faq-section">
      <div className="faq-section__inner">
        <h2 className="faq-section__title">{FAQ.title}</h2>

        <div className="faq-section__grid">
          {FAQ.items.map((item) => {
            const isOpen = openId === item.id;
            return (
              <article
                key={item.id}
                className={['faq-section__item', isOpen ? 'is-open' : ''].filter(Boolean).join(' ')}
              >
                <button
                  type="button"
                  className="faq-section__trigger"
                  aria-expanded={isOpen}
                  onClick={() => toggle(item.id)}
                >
                  <span className="faq-section__question">{item.question}</span>
                  <span className="faq-section__toggle" aria-hidden>
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                <div className="faq-section__answer-wrap">
                  <p className="faq-section__answer">{item.answer}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
