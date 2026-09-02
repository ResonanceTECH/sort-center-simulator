import { useState, type ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Stack, Typography } from '@mui/material';
import { InboxOutlined } from '@mui/icons-material';
import {
  KitBadge,
  KitButton,
  KitCard,
  KitContainer,
  KitDivider,
  KitEmptyState,
  KitField,
  KitPageHeader,
  KitSection,
  KitTag,
  kit,
  pageShellSx,
} from '@/ui-kit';

function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <Box sx={{ minWidth: 96 }}>
      <Box
        sx={{
          height: 56,
          borderRadius: kit.radius.button,
          bgcolor: value,
          border: `1px solid ${kit.color.border}`,
          mb: 1,
        }}
      />
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: kit.color.ink }}>
        {name}
      </Typography>
      <Typography sx={{ fontSize: '0.6875rem', color: kit.color.fog, fontFamily: 'ui-monospace, monospace' }}>
        {value}
      </Typography>
    </Box>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box sx={{ mb: 6 }}>
      <Typography
        sx={{
          fontSize: '0.75rem',
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: kit.color.fog,
          mb: 2,
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

export function UiKitPage() {
  const [email, setEmail] = useState('');

  return (
    <Box sx={pageShellSx}>
      <Box
        sx={{
          borderBottom: `1px solid ${kit.color.border}`,
          bgcolor: kit.color.snow,
          py: 2,
        }}
      >
        <KitContainer
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Typography
            component={RouterLink}
            to="/"
            sx={{
              fontWeight: 600,
              color: kit.color.ink,
              textDecoration: 'none',
              letterSpacing: '-0.02em',
              '&:hover': { color: kit.color.ember },
            }}
          >
            Конструктор СЦ
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: kit.color.muted }}>
            UI Kit · landing tokens
          </Typography>
        </KitContainer>
      </Box>

      <KitSection>
        <KitContainer>
          <KitPageHeader
            title="UI Kit"
            subtitle="Примитивы на токенах лендинга: zinc palette, Studio Grotesk, max-width 1200."
            mb={5}
          />

          <Block title="Color">
            <Stack direction="row" flexWrap="wrap" gap={2}>
              {(
                [
                  ['obsidian', kit.color.obsidian],
                  ['graphite', kit.color.graphite],
                  ['ember', kit.color.ember],
                  ['paper', kit.color.paper],
                  ['cloud', kit.color.cloud],
                  ['snow', kit.color.snow],
                  ['muted', kit.color.muted],
                  ['success', kit.color.success],
                ] as const
              ).map(([name, value]) => (
                <Swatch key={name} name={name} value={value} />
              ))}
            </Stack>
          </Block>

          <Block title="Typography">
            <Stack spacing={2}>
              <Typography sx={{ ...kit.typography.display, color: kit.color.ink }}>
                Display
              </Typography>
              <Typography sx={{ ...kit.typography.sectionTitle, color: kit.color.ink }}>
                Section title
              </Typography>
              <Typography sx={{ ...kit.typography.pageTitle, color: kit.color.ink }}>
                Page title
              </Typography>
              <Typography sx={{ ...kit.typography.body, color: kit.color.body }}>
                Body — проектируйте, моделируйте и сравнивайте сценарии СЦ.
              </Typography>
              <Typography sx={{ ...kit.typography.caption, color: kit.color.muted }}>
                Caption / muted supporting text
              </Typography>
            </Stack>
          </Block>

          <Block title="Buttons">
            <Stack direction="row" flexWrap="wrap" gap={1.5} alignItems="center">
              <KitButton variant="primary">Primary</KitButton>
              <KitButton variant="secondary">Secondary</KitButton>
              <KitButton variant="ghost">Ghost</KitButton>
              <KitButton variant="ghostPill">Ghost pill</KitButton>
              <KitButton variant="navCta">Nav CTA</KitButton>
              <KitButton variant="danger">Danger</KitButton>
              <KitButton variant="primary" loading>
                Loading
              </KitButton>
              <KitButton variant="primary" disabled>
                Disabled
              </KitButton>
            </Stack>
          </Block>

          <Block title="Badges / Tags">
            <Stack direction="row" flexWrap="wrap" gap={1}>
              <KitBadge variant="accent">Accent</KitBadge>
              <KitBadge variant="filled">Filled</KitBadge>
              <KitBadge variant="outline">Outline</KitBadge>
              <KitBadge variant="success">Success</KitBadge>
              <KitBadge variant="muted">Muted</KitBadge>
              <KitTag variant="outline">Tag</KitTag>
            </Stack>
          </Block>

          <Block title="Fields">
            <Box sx={{ maxWidth: 360 }}>
              <KitField
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                helperText="Landing-style input"
              />
            </Box>
          </Block>

          <Block title="Cards">
            <Stack direction={{ xs: 'column', md: 'row' }} gap={2}>
              <KitCard variant="marketing" padding="lg" sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 600, mb: 1, letterSpacing: '-0.02em' }}>
                  Marketing card
                </Typography>
                <Typography sx={{ color: kit.color.muted, fontSize: '0.9375rem' }}>
                  radius 36 · как на лендинге
                </Typography>
              </KitCard>
              <KitCard variant="panel" padding="md" sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 600, mb: 1, letterSpacing: '-0.02em' }}>
                  Panel card
                </Typography>
                <Typography sx={{ color: kit.color.muted, fontSize: '0.9375rem' }}>
                  radius 20 · app panels / tables
                </Typography>
              </KitCard>
              <KitCard variant="flat" padding="sm" sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 600, mb: 1, letterSpacing: '-0.02em' }}>
                  Flat card
                </Typography>
                <Typography sx={{ color: kit.color.muted, fontSize: '0.9375rem' }}>
                  radius 14 · dense UI
                </Typography>
              </KitCard>
            </Stack>
          </Block>

          <Block title="Page header">
            <KitCard variant="panel" padding="lg">
              <KitPageHeader
                title="Проекты"
                subtitle="Создавайте модели и сравнивайте сценарии"
                action={<KitButton variant="primary">Создать проект</KitButton>}
                mb={0}
              />
            </KitCard>
          </Block>

          <Block title="Empty state">
            <KitEmptyState
              icon={<InboxOutlined />}
              title="Пока пусто"
              description="Запустите симуляцию — здесь появятся отчёты и метрики."
              actionLabel="Запустить"
              onAction={() => undefined}
            />
          </Block>

          <KitDivider sx={{ my: 4 }} />

          <Typography sx={{ fontSize: '0.8125rem', color: kit.color.fog }}>
            Import from <code>@/ui-kit</code>. Tokens: <code>kit</code>. Landing still uses{' '}
            <code>LANDING</code> re-export.
          </Typography>
        </KitContainer>
      </KitSection>
    </Box>
  );
}
