import { useState } from 'react';
import { Box, Grid, TextField, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ActivityTimeline } from '@/components/common/ActivityTimeline';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EntityStates } from '@/components/common/EntityStates';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusChip } from '@/components/status/StatusChip';
import { COMMON, SECTION_LABELS } from '@/constants/platformRu';
import { useAddIncidentCommentMutation, useResolveIncidentMutation } from '@/hooks/scm/useScmMutations';
import { useIncidentQuery } from '@/hooks/scm/useScmQueries';
import { InternalLayout } from '@/layouts/InternalLayout';
import { KitButton } from '@/ui-kit/Button';
import { KitCard } from '@/ui-kit/Card';
import { kit } from '@/ui-kit/tokens';
import { INCIDENT_STATUS_LABELS } from '@/types/stateMachines';

export function IncidentDetailPage() {
  const { incidentId = '' } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useIncidentQuery(incidentId);
  const resolveIncident = useResolveIncidentMutation();
  const addComment = useAddIncidentCommentMutation();
  const [confirmResolve, setConfirmResolve] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handleAddComment = () => {
    const message = commentText.trim();
    if (!message) return;
    addComment.mutate(
      { incidentId, message },
      { onSuccess: () => setCommentText('') },
    );
  };

  return (
    <InternalLayout>
      <EntityStates loading={isLoading} error={error?.message} onRetry={() => void refetch()}>
        {data && (
          <>
            <PageHeader
              title={data.title}
              subtitle={data.id}
              breadcrumbs={[
                { label: 'Инциденты', to: '/incidents' },
                { label: data.id },
              ]}
              actions={
                <>
                  {data.shipmentId && (
                    <KitButton variant="ghost" onClick={() => navigate(`/shipments/${data.shipmentId}`)}>
                      {COMMON.openShipment}
                    </KitButton>
                  )}
                  {data.status !== 'RESOLVED' && data.status !== 'CLOSED' && (
                    <KitButton variant="primary" onClick={() => setConfirmResolve(true)}>
                      {COMMON.resolve}
                    </KitButton>
                  )}
                </>
              }
            />

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <KitCard sx={{ mb: 2 }}>
                  <Typography variant="overline" sx={{ color: kit.color.muted }}>Описание</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{data.description}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <StatusChip status={data.severity} label={data.severity} />
                    <StatusChip status="INFO" label={INCIDENT_STATUS_LABELS[data.status] ?? data.status} />
                  </Box>
                </KitCard>

                <KitCard sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{SECTION_LABELS.timeline}</Typography>
                  <ActivityTimeline items={data.timeline} />
                </KitCard>

                <KitCard>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{SECTION_LABELS.comments}</Typography>
                  {data.comments.length === 0 && (
                    <Typography variant="body2" sx={{ color: kit.color.muted, mb: 2 }}>
                      Комментариев пока нет
                    </Typography>
                  )}
                  {data.comments.map((c) => (
                    <Box key={c.id} sx={{ py: 1.5, borderBottom: kit.border.hairline }}>
                      <Typography variant="caption" sx={{ color: kit.color.muted }}>
                        {c.timestamp} · {c.author} ({c.role})
                      </Typography>
                      <Typography variant="body2">{c.message}</Typography>
                    </Box>
                  ))}
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Добавить комментарий..."
                    size="small"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={addComment.isPending}
                    sx={{ mt: 2 }}
                  />
                  <KitButton
                    variant="primary"
                    sx={{ mt: 1.5 }}
                    disabled={!commentText.trim() || addComment.isPending}
                    onClick={handleAddComment}
                  >
                    {addComment.isPending ? 'Отправка…' : 'Добавить комментарий'}
                  </KitButton>
                </KitCard>
              </Grid>

              <Grid item xs={12} md={4}>
                <KitCard sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>{SECTION_LABELS.details}</Typography>
                  <Typography variant="body2"><strong>{COMMON.owner}:</strong> {data.owner}</Typography>
                  <Typography variant="body2"><strong>Участники:</strong> {data.participants.join(', ')}</Typography>
                  {data.relatedExceptionId && (
                    <KitButton
                      variant="ghost"
                      sx={{ mt: 1 }}
                      onClick={() => navigate(`/exceptions/${data.relatedExceptionId}`)}
                    >
                      Связанное отклонение →
                    </KitButton>
                  )}
                </KitCard>

                <KitCard>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>{SECTION_LABELS.recommendedActions}</Typography>
                  {data.recommendedActions.map((a) => (
                    <Box key={a.id} sx={{ py: 1.5, borderBottom: kit.border.hairline }}>
                      <Typography variant="body2" fontWeight={600}>{a.label}</Typography>
                      <Typography variant="caption" sx={{ color: kit.color.muted }}>{a.description}</Typography>
                    </Box>
                  ))}
                </KitCard>
              </Grid>
            </Grid>

            <ConfirmDialog
              open={confirmResolve}
              title="Закрыть инцидент"
              message="Отметить инцидент как решённый?"
              confirmLabel={COMMON.resolve}
              loading={resolveIncident.isPending}
              onConfirm={() => {
                resolveIncident.mutate(incidentId, {
                  onSuccess: () => setConfirmResolve(false),
                });
              }}
              onCancel={() => setConfirmResolve(false)}
            />
          </>
        )}
      </EntityStates>
    </InternalLayout>
  );
}
