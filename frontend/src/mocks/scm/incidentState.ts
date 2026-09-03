import { getIncidentDetail } from '@/mocks/scm/scmData';
import type { IncidentComment, IncidentDetail } from '@/types/scm/incident';

const extraComments: Record<string, IncidentComment[]> = {};

export function getIncidentWithComments(id: string): IncidentDetail | null {
  const detail = getIncidentDetail(id);
  if (!detail) return null;
  const added = extraComments[id] ?? [];
  if (added.length === 0) return detail;
  return { ...detail, comments: [...detail.comments, ...added] };
}

export function addIncidentCommentState(
  incidentId: string,
  message: string,
  author: string,
  role: string,
): IncidentComment {
  const comment: IncidentComment = {
    id: `c-${Date.now()}`,
    author,
    role,
    message,
    timestamp: new Date().toISOString(),
  };
  extraComments[incidentId] = [...(extraComments[incidentId] ?? []), comment];
  return comment;
}
