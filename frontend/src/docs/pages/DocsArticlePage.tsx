import { Box, Chip, Typography } from '@mui/material';
import { Link as RouterLink, Navigate, useParams } from 'react-router-dom';
import { DocsShell } from '@/docs/components/DocsShell';
import { getDocArticle } from '@/docs/registry';
import { kit } from '@/ui-kit/tokens';

const STATUS_LABEL: Record<string, string> = {
  implemented: 'Implemented',
  partial: 'Partial',
  mock: 'Mock / demo',
  planned: 'Planned',
};

export function DocsArticlePage() {
  const { '*': splat } = useParams();
  const slug = (splat ?? '').replace(/^\/+|\/+$/g, '');
  const article = slug ? getDocArticle(slug) : undefined;

  if (!article) {
    return <Navigate to="/docs" replace />;
  }

  const toc = article.sections.map((s) => ({ id: s.id, title: s.title }));

  return (
    <DocsShell toc={toc} activeSlug={article.slug}>
      <Box sx={{ mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <Typography variant="caption" sx={{ color: kit.color.faint }}>
          {article.category}
        </Typography>
        <Chip size="small" label={STATUS_LABEL[article.status] ?? article.status} variant="outlined" />
      </Box>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 1, letterSpacing: '-0.02em' }}>
        {article.title}
      </Typography>
      <Typography variant="body1" sx={{ color: kit.color.muted, mb: 3, lineHeight: 1.7 }}>
        {article.description}
      </Typography>
      <Typography variant="caption" sx={{ color: kit.color.faint, display: 'block', mb: 3 }}>
        Обновлено: {article.lastUpdated}
        {article.productRoutes?.length
          ? ` · Продукт: ${article.productRoutes.join(', ')}`
          : ''}
      </Typography>

      {article.sections.map((section) => (
        <Box key={section.id} id={section.id} sx={{ mb: 4, scrollMarginTop: 80 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
            {section.title}
          </Typography>
          {section.body}
        </Box>
      ))}

      <Box
        sx={{
          mt: 4,
          pt: 2,
          borderTop: kit.border.hairline,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        {article.prev ? (
          <Box
            component={RouterLink}
            to={`/docs/${article.prev}`}
            sx={{ color: kit.color.accent, textDecoration: 'none' }}
          >
            ← {getDocArticle(article.prev)?.title ?? 'Назад'}
          </Box>
        ) : (
          <span />
        )}
        {article.next ? (
          <Box
            component={RouterLink}
            to={`/docs/${article.next}`}
            sx={{ color: kit.color.accent, textDecoration: 'none' }}
          >
            {getDocArticle(article.next)?.title ?? 'Далее'} →
          </Box>
        ) : null}
      </Box>
    </DocsShell>
  );
}
