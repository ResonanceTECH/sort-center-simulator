import { HorizontalScrollSection } from '@/components/horizontalScroll/HorizontalScrollSection';
import { WORKFLOW_SCROLL, WORKFLOW_SCROLL_ITEMS } from '@/landing/constants/workflowScrollContent';

export function WorkflowScrollSection() {
  return (
    <HorizontalScrollSection
      id={WORKFLOW_SCROLL.id}
      title={WORKFLOW_SCROLL.title}
      subtitle={WORKFLOW_SCROLL.subtitle}
      items={WORKFLOW_SCROLL_ITEMS}
    />
  );
}
