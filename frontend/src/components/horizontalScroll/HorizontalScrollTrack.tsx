import type { RefObject } from 'react';
import { HorizontalScrollCard } from '@/components/horizontalScroll/HorizontalScrollCard';
import type { HorizontalScrollItem } from '@/components/horizontalScroll/horizontalScroll.types';

interface HorizontalScrollTrackProps {
  items: HorizontalScrollItem[];
  trackRef: RefObject<HTMLDivElement | null>;
  registerCard: (id: string, node: HTMLDivElement | null) => void;
}

export function HorizontalScrollTrack({ items, trackRef, registerCard }: HorizontalScrollTrackProps) {
  return (
    <div ref={trackRef} className="horizontal-scroll-section__track">
      {items.map((item) => (
        <HorizontalScrollCard
          key={item.id}
          item={item}
          cardRef={(node) => registerCard(item.id, node)}
        />
      ))}
    </div>
  );
}
