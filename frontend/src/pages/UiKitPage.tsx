import { useState, type ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Stack, Typography } from '@mui/material';
import { InboxOutlined, SearchOutlined } from '@mui/icons-material';
import {
  KitAlert,
  KitBadge,
  KitButton,
  KitCard,
  KitContainer,
  KitDivider,
  KitEmptyState,
  KitField,
  KitPageHeader,
  KitTag,
  kit,
  pageShellSx,
} from '@/ui-kit';

const TOC = [
  { id: 'colors', label: 'Color' },
  { id: 'radius', label: 'Radius' },
  { id: 'space', label: 'Space' },
  { id: 'layout', label: 'Layout' },
  { id: 'shadow', label: 'Shadow' },
  { id: 'border', label: 'Border' },
  { id: 'size', label: 'Size' },
  { id: 'type', label: 'Typography' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'badges', label: 'Badges' },
  { id: 'fields', label: 'Fields' },
  { id: 'cards', label: 'Cards' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'header', label: 'Page header' },
  { id: 'empty', label: 'Empty state' },
  { id: 'divider', label: 'Divider' },
  { id: 'section', label: 'Section' },
  { id: 'compose', label: 'Composition' },
] as const;

const COLOR_GROUPS: { title: string; keys: (keyof typeof kit.color)[] }[] = [
  {
    title: 'Zinc scale',
    keys: [
      'obsidian',
      'graphite',
      'slate',
      'iron',
      'steel',
      'fog',
      'ash',
      'mist',
      'cloud',
      'paper',
      'snow',
    ],
  },
  {
    title: 'Semantic surfaces',
    keys: ['canvas', 'card', 'subtle', 'border', 'darkSurface', 'darkCard'],
  },
  {
    title: 'Text',
    keys: ['ink', 'body', 'muted', 'faint'],
  },
  {
    title: 'Accent / status',
    keys: ['ember', 'accent', 'magenta', 'success', 'successBg', 'successBorder'],
  },
];

const RADIUS_META: { key: keyof typeof kit.radius; use: string }[] = [
  { key: 'badge', use: 'Badges, chips, small controls' },
  { key: 'button', use: 'Buttons, flat cards, inputs' },
  { key: 'input', use: 'Text fields (= button)' },
  { key: 'panel', use: 'App panels, toasts, stack card' },
  { key: 'card', use: 'Marketing / landing cards' },
  { key: 'pill', use: 'Pill buttons, nav CTA' },
];

const SPACE_KEYS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

function Label({ children }: { children: ReactNode }) {
  return (
    <Typography
      sx={{
        fontSize: '0.6875rem',
        fontWeight: 500,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: kit.color.fog,
        mb: 1.5,
      }}
    >
      {children}
    </Typography>
  );
}

function Block({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Box
      id={id}
      component="section"
      sx={{
        scrollMarginTop: 96,
        mb: 8,
        pb: 8,
        borderBottom: `1px solid ${kit.color.border}`,
      }}
    >
      <Typography
        sx={{
          fontSize: '1.25rem',
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: kit.color.ink,
          mb: description ? 0.75 : 2.5,
        }}
      >
        {title}
      </Typography>
      {description && (
        <Typography sx={{ ...kit.typography.body, color: kit.color.muted, mb: 2.5, maxWidth: 640 }}>
          {description}
        </Typography>
      )}
      {children}
    </Box>
  );
}

function Swatch({ name, value }: { name: string; value: string }) {
  const isLight = ['snow', 'paper', 'cloud', 'subtle', 'canvas', 'card', 'successBg', 'mist', 'border'].includes(
    name,
  );
  return (
    <Box sx={{ width: 112 }}>
      <Box
        sx={{
          height: 64,
          borderRadius: kit.radius.button,
          bgcolor: value,
          border: `1px solid ${kit.color.border}`,
          mb: 1,
          display: 'flex',
          alignItems: 'flex-end',
          p: 1,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.625rem',
            fontFamily: 'ui-monospace, monospace',
            color: isLight ? kit.color.fog : 'rgba(255,255,255,0.72)',
          }}
        >
          {value}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: kit.color.ink }}>{name}</Typography>
    </Box>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 2,
        py: 1,
        borderBottom: `1px solid ${kit.color.border}`,
        fontSize: '0.8125rem',
      }}
    >
      <Box component="span" sx={{ color: kit.color.muted }}>
        {label}
      </Box>
      <Box component="code" sx={{ color: kit.color.ink, fontFamily: 'ui-monospace, monospace' }}>
        {value}
      </Box>
    </Box>
  );
}

export function UiKitPage() {
  const [email, setEmail] = useState('hello@example.com');
  const [password, setPassword] = useState('');

  return (
    <Box sx={pageShellSx}>
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          borderBottom: `1px solid ${kit.color.border}`,
          bgcolor: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(10px)',
          py: 1.75,
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
            UI Kit · полный каталог токенов и примитивов
          </Typography>
        </KitContainer>
      </Box>

      <KitContainer sx={{ py: { xs: 4, md: 6 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '200px minmax(0, 1fr)' },
            gap: { xs: 4, lg: 5 },
            alignItems: 'start',
          }}
        >
          <Box
            component="nav"
            sx={{
              position: { lg: 'sticky' },
              top: 88,
              display: { xs: 'none', lg: 'flex' },
              flexDirection: 'column',
              gap: 0.5,
              maxHeight: 'calc(100vh - 112px)',
              overflow: 'auto',
              pr: 1,
            }}
          >
            <Typography
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: kit.color.fog,
                mb: 1,
              }}
            >
              Contents
            </Typography>
            {TOC.map((item) => (
              <Box
                key={item.id}
                component="a"
                href={`#${item.id}`}
                sx={{
                  fontSize: '0.8125rem',
                  color: kit.color.muted,
                  textDecoration: 'none',
                  py: 0.5,
                  px: 1,
                  borderRadius: kit.radius.badge,
                  '&:hover': { color: kit.color.ink, bgcolor: kit.color.paper },
                }}
              >
                {item.label}
              </Box>
            ))}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <KitPageHeader
              title="UI Kit"
              subtitle="Единый эталон: цвета, радиусы, отступы, тени, размеры, типографика и все примитивы из @/ui-kit."
              mb={5}
            />

            {/* ── Color ── */}
            <Block id="colors" title="Color" description="Полная палитра kit.color. Zinc + semantic + accent/status.">
              {COLOR_GROUPS.map((group) => (
                <Box key={group.title} sx={{ mb: 3.5 }}>
                  <Label>{group.title}</Label>
                  <Stack direction="row" flexWrap="wrap" gap={2}>
                    {group.keys.map((key) => (
                      <Swatch key={key} name={key} value={kit.color[key]} />
                    ))}
                  </Stack>
                </Box>
              ))}
            </Block>

            {/* ── Radius ── */}
            <Block id="radius" title="Radius" description="Все закругления kit.radius — от badge до pill.">
              <Stack spacing={2}>
                {RADIUS_META.map(({ key, use }) => (
                  <Box
                    key={key}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '140px 1fr 160px' },
                      gap: 2,
                      alignItems: 'center',
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>{key}</Typography>
                      <Typography
                        sx={{ fontSize: '0.75rem', fontFamily: 'ui-monospace, monospace', color: kit.color.fog }}
                      >
                        {kit.radius[key]}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        height: 56,
                        bgcolor: kit.color.snow,
                        border: `1.5px solid ${kit.color.ink}`,
                        borderRadius: kit.radius[key],
                      }}
                    />
                    <Typography sx={{ fontSize: '0.8125rem', color: kit.color.muted }}>{use}</Typography>
                  </Box>
                ))}
              </Stack>

              <Label>Сравнение бок о бок</Label>
              <Stack direction="row" flexWrap="wrap" gap={2} alignItems="flex-end" sx={{ mt: 1 }}>
                {RADIUS_META.map(({ key }) => (
                  <Box key={key} sx={{ textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: key === 'pill' ? 96 : 72,
                        height: 48,
                        bgcolor: kit.color.paper,
                        border: `1px solid ${kit.color.mist}`,
                        borderRadius: kit.radius[key],
                        mb: 0.75,
                      }}
                    />
                    <Typography sx={{ fontSize: '0.6875rem', color: kit.color.fog }}>{key}</Typography>
                  </Box>
                ))}
              </Stack>
            </Block>

            {/* ── Space ── */}
            <Block
              id="space"
              title="Space"
              description="Шкала kit.space (px) + именованные отступы sectionGap / cardPadding / pageX."
            >
              <Stack spacing={1.25} sx={{ mb: 4 }}>
                {SPACE_KEYS.map((key) => {
                  const px = kit.space[key];
                  return (
                    <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography
                        sx={{
                          width: 36,
                          fontSize: '0.75rem',
                          fontFamily: 'ui-monospace, monospace',
                          color: kit.color.fog,
                        }}
                      >
                        {key}
                      </Typography>
                      <Box
                        sx={{
                          height: 12,
                          width: px === 0 ? 2 : px,
                          maxWidth: '100%',
                          bgcolor: kit.color.obsidian,
                          borderRadius: 1,
                          opacity: 0.85,
                        }}
                      />
                      <Typography
                        sx={{ fontSize: '0.75rem', fontFamily: 'ui-monospace, monospace', color: kit.color.muted }}
                      >
                        {px}px
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>

              <KitCard variant="panel" padding="md">
                <MetaRow label="sectionGap" value={`${kit.space.sectionGap}px`} />
                <MetaRow label="cardPadding" value={`${kit.space.cardPadding}px`} />
                <MetaRow
                  label="pageX"
                  value={`xs ${kit.space.pageX.xs} · sm ${kit.space.pageX.sm} · md ${kit.space.pageX.md} (MUI units)`}
                />
              </KitCard>
            </Block>

            {/* ── Layout ── */}
            <Block id="layout" title="Layout" description="Ширина контейнера и сайдбара.">
              <KitCard variant="panel" padding="md" sx={{ mb: 2 }}>
                <MetaRow label="maxWidth" value={`${kit.layout.maxWidth}px`} />
                <MetaRow label="sidebarWidth" value={`${kit.layout.sidebarWidth}px`} />
              </KitCard>
              <Box
                sx={{
                  height: 56,
                  borderRadius: kit.radius.panel,
                  border: `1px dashed ${kit.color.mist}`,
                  bgcolor: kit.color.paper,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: kit.layout.sidebarWidth / 5,
                    bgcolor: kit.color.obsidian,
                    opacity: 0.12,
                  }}
                />
                <Typography
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    color: kit.color.muted,
                  }}
                >
                  content · max {kit.layout.maxWidth}px
                </Typography>
              </Box>
            </Block>

            {/* ── Shadow ── */}
            <Block id="shadow" title="Shadow" description="kit.shadow — primary (кнопки), soft (toast/меню), small/medium/large.">
              <Stack direction={{ xs: 'column', md: 'row' }} gap={2} flexWrap="wrap">
                {(
                  [
                    ['primary', kit.shadow.primary],
                    ['soft', kit.shadow.soft],
                    ['small', kit.shadow.small],
                    ['medium', kit.shadow.medium],
                    ['large', kit.shadow.large],
                  ] as const
                ).map(([name, value]) => (
                  <Box
                    key={name}
                    sx={{
                      flex: '1 1 160px',
                      minHeight: 100,
                      borderRadius: kit.radius.panel,
                      bgcolor: name === 'primary' ? kit.color.obsidian : kit.color.snow,
                      color: name === 'primary' ? kit.color.snow : kit.color.ink,
                      border: name === 'primary' ? kit.border.accent : kit.border.hairline,
                      boxShadow: value,
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{name}</Typography>
                  </Box>
                ))}
              </Stack>
            </Block>

            {/* ── Border ── */}
            <Block id="border" title="Border" description="kit.border — hairline / strong / focus / accent.">
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
                {(
                  [
                    ['hairline', kit.border.hairline],
                    ['strong', kit.border.strong],
                    ['focus', kit.border.focus],
                    ['accent', kit.border.accent],
                  ] as const
                ).map(([name, value]) => (
                  <Box
                    key={name}
                    sx={{
                      flex: 1,
                      minHeight: 72,
                      borderRadius: kit.radius.button,
                      bgcolor: kit.color.snow,
                      border: value,
                      p: 2,
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>{name}</Typography>
                    <Typography
                      sx={{ fontSize: '0.6875rem', fontFamily: 'ui-monospace, monospace', color: kit.color.fog }}
                    >
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Block>

            {/* ── Size ── */}
            <Block id="size" title="Size" description="Контролы и иконки kit.size.">
              <Stack direction="row" flexWrap="wrap" gap={3} alignItems="flex-end" sx={{ mb: 3 }}>
                {(
                  [
                    ['controlSm', kit.size.controlSm],
                    ['controlMd', kit.size.controlMd],
                    ['controlLg', kit.size.controlLg],
                  ] as const
                ).map(([name, h]) => (
                  <Box key={name} sx={{ textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 120,
                        height: h,
                        borderRadius: kit.radius.button,
                        bgcolor: kit.color.obsidian,
                        mb: 1,
                      }}
                    />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{name}</Typography>
                    <Typography sx={{ fontSize: '0.6875rem', color: kit.color.fog }}>{h}px</Typography>
                  </Box>
                ))}
              </Stack>
              <Stack direction="row" gap={2} alignItems="center">
                {(
                  [
                    ['iconSm', kit.size.iconSm],
                    ['iconMd', kit.size.iconMd],
                    ['iconLg', kit.size.iconLg],
                  ] as const
                ).map(([name, s]) => (
                  <Box key={name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: s,
                        height: s,
                        borderRadius: 1,
                        bgcolor: kit.color.iron,
                      }}
                    />
                    <Typography sx={{ fontSize: '0.75rem', color: kit.color.muted }}>
                      {name} · {s}px
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Block>

            {/* ── Typography ── */}
            <Block id="type" title="Typography" description="Семейства и шкалы kit.typography / kit.font.">
              <KitCard variant="panel" padding="md" sx={{ mb: 3 }}>
                <MetaRow label="font.sans" value={kit.font.sans} />
                <MetaRow label="font.display" value={kit.font.display} />
              </KitCard>
              <Stack spacing={2.5}>
                <Box>
                  <Label>display</Label>
                  <Typography sx={{ ...kit.typography.display, color: kit.color.ink, fontFamily: kit.font.display }}>
                    Display headline
                  </Typography>
                </Box>
                <Box>
                  <Label>sectionTitle</Label>
                  <Typography sx={{ ...kit.typography.sectionTitle, color: kit.color.ink }}>
                    Section title
                  </Typography>
                </Box>
                <Box>
                  <Label>pageTitle</Label>
                  <Typography sx={{ ...kit.typography.pageTitle, color: kit.color.ink }}>Page title</Typography>
                </Box>
                <Box>
                  <Label>body</Label>
                  <Typography sx={{ ...kit.typography.body, color: kit.color.body, maxWidth: 560 }}>
                    Body — проектируйте, моделируйте и сравнивайте сценарии сортировочного центра. Текст 15px /
                    1.5.
                  </Typography>
                </Box>
                <Box>
                  <Label>caption</Label>
                  <Typography sx={{ ...kit.typography.caption, color: kit.color.muted }}>
                    Caption / muted supporting text · 13px
                  </Typography>
                </Box>
              </Stack>
            </Block>

            {/* ── Buttons ── */}
            <Block id="buttons" title="Buttons" description="Все варианты KitButton + состояния.">
              <Label>Variants</Label>
              <Stack direction="row" flexWrap="wrap" gap={1.5} alignItems="center" sx={{ mb: 3 }}>
                <KitButton variant="primary">Primary</KitButton>
                <KitButton variant="secondary">Secondary</KitButton>
                <KitButton variant="ghost">Ghost</KitButton>
                <KitButton variant="ghostPill">Ghost pill</KitButton>
                <KitButton variant="navCta">Nav CTA</KitButton>
                <KitButton variant="danger">Danger</KitButton>
              </Stack>
              <Label>States · primary</Label>
              <Stack direction="row" flexWrap="wrap" gap={1.5} alignItems="center" sx={{ mb: 3 }}>
                <KitButton variant="primary">Default</KitButton>
                <KitButton variant="primary" loading>
                  Loading
                </KitButton>
                <KitButton variant="primary" disabled>
                  Disabled
                </KitButton>
              </Stack>
              <Label>States · secondary / ghost / danger</Label>
              <Stack direction="row" flexWrap="wrap" gap={1.5} alignItems="center">
                <KitButton variant="secondary" disabled>
                  Secondary disabled
                </KitButton>
                <KitButton variant="ghost" disabled>
                  Ghost disabled
                </KitButton>
                <KitButton variant="danger" disabled>
                  Danger disabled
                </KitButton>
                <KitButton variant="danger" loading>
                  Danger loading
                </KitButton>
              </Stack>
            </Block>

            {/* ── Badges ── */}
            <Block id="badges" title="Badges / Tags" description="KitBadge и KitTag — все варианты.">
              <Label>KitBadge</Label>
              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2.5 }}>
                <KitBadge variant="accent">Accent</KitBadge>
                <KitBadge variant="filled">Filled</KitBadge>
                <KitBadge variant="outline">Outline</KitBadge>
                <KitBadge variant="success">Success</KitBadge>
                <KitBadge variant="muted">Muted</KitBadge>
              </Stack>
              <Label>KitTag (крупнее)</Label>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                <KitTag variant="accent">Accent</KitTag>
                <KitTag variant="filled">Filled</KitTag>
                <KitTag variant="outline">Outline</KitTag>
                <KitTag variant="success">Success</KitTag>
                <KitTag variant="muted">Muted</KitTag>
              </Stack>
            </Block>

            {/* ── Fields ── */}
            <Block id="fields" title="Fields" description="KitField — default / focus / error / disabled / helper.">
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  gap: 2.5,
                  maxWidth: 720,
                }}
              >
                <KitField
                  label="Email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  helperText="Landing-style input · radius 14 · h 52"
                />
                <KitField
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <KitField label="С ошибкой" defaultValue="bad@" error helperText="Некорректный email" />
                <KitField label="Disabled" defaultValue="Нельзя менять" disabled helperText="Disabled state" />
                <KitField
                  label="С иконкой"
                  placeholder="Поиск проектов"
                  InputProps={{
                    startAdornment: (
                      <SearchOutlined sx={{ color: kit.color.fog, mr: 1, fontSize: 20 }} />
                    ),
                  }}
                />
              </Box>
            </Block>

            {/* ── Cards ── */}
            <Block
              id="cards"
              title="Cards"
              description="KitCard: marketing (36) / panel (20) / flat (14) × padding none|sm|md|lg."
            >
              <Stack direction={{ xs: 'column', md: 'row' }} gap={2} sx={{ mb: 3 }}>
                <KitCard variant="marketing" padding="lg" sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 600, mb: 1, letterSpacing: '-0.02em' }}>Marketing</Typography>
                  <Typography sx={{ color: kit.color.muted, fontSize: '0.9375rem' }}>
                    radius {kit.radius.card} · padding lg ({kit.space.cardPadding}px)
                  </Typography>
                </KitCard>
                <KitCard variant="panel" padding="md" sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 600, mb: 1, letterSpacing: '-0.02em' }}>Panel</Typography>
                  <Typography sx={{ color: kit.color.muted, fontSize: '0.9375rem' }}>
                    radius {kit.radius.panel} · padding md
                  </Typography>
                </KitCard>
                <KitCard variant="flat" padding="sm" sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 600, mb: 1, letterSpacing: '-0.02em' }}>Flat</Typography>
                  <Typography sx={{ color: kit.color.muted, fontSize: '0.9375rem' }}>
                    radius {kit.radius.button} · padding sm
                  </Typography>
                </KitCard>
              </Stack>
              <Label>Padding ladder · panel</Label>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
                {(['none', 'sm', 'md', 'lg'] as const).map((pad) => (
                  <KitCard key={pad} variant="panel" padding={pad} sx={{ flex: 1, minHeight: 72 }}>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>padding={pad}</Typography>
                  </KitCard>
                ))}
              </Stack>
            </Block>

            {/* ── Alerts ── */}
            <Block id="alerts" title="Alerts" description="KitAlert · toast (floating) и inline (forms/pages).">
              <Label>Toast</Label>
              <Box
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: kit.radius.panel,
                  bgcolor: kit.color.paper,
                  border: kit.border.hairline,
                }}
              >
                <Stack spacing={1.5} alignItems="flex-start">
                  <KitAlert severity="success" variant="toast" onClose={() => undefined}>
                    Проект удалён
                  </KitAlert>
                  <KitAlert severity="info" variant="toast" onClose={() => undefined}>
                    Скопировано
                  </KitAlert>
                  <KitAlert severity="warning" variant="toast" onClose={() => undefined}>
                    Параметры изменены
                  </KitAlert>
                  <KitAlert severity="error" variant="toast" onClose={() => undefined}>
                    Не удалось сохранить
                  </KitAlert>
                </Stack>
              </Box>
              <Label>Inline</Label>
              <Stack spacing={1.5} sx={{ maxWidth: 520 }}>
                <KitAlert severity="success" variant="inline">
                  Модель сохранена
                </KitAlert>
                <KitAlert severity="info" variant="inline">
                  Просмотр параметров. Редактирование недоступно.
                </KitAlert>
                <KitAlert severity="warning" variant="inline">
                  Приглашение скоро истечёт
                </KitAlert>
                <KitAlert severity="error" variant="inline">
                  Проверьте поля формы
                </KitAlert>
              </Stack>
            </Block>

            {/* ── Page header ── */}
            <Block id="header" title="Page header" description="KitPageHeader — title / subtitle / action.">
              <KitCard variant="panel" padding="lg" sx={{ mb: 2 }}>
                <KitPageHeader
                  title="Проекты"
                  subtitle="Создавайте модели и сравнивайте сценарии"
                  action={<KitButton variant="primary">Создать проект</KitButton>}
                  mb={0}
                />
              </KitCard>
              <KitCard variant="panel" padding="lg">
                <KitPageHeader title="Только заголовок" mb={0} />
              </KitCard>
            </Block>

            {/* ── Empty ── */}
            <Block id="empty" title="Empty state" description="KitEmptyState с иконкой, текстом и CTA.">
              <KitEmptyState
                icon={<InboxOutlined />}
                title="Пока пусто"
                description="Запустите симуляцию — здесь появятся отчёты и метрики."
                actionLabel="Запустить"
                onAction={() => undefined}
              />
            </Block>

            {/* ── Divider ── */}
            <Block id="divider" title="Divider" description="KitDivider — hairline separator.">
              <Typography sx={{ ...kit.typography.body, color: kit.color.body, mb: 2 }}>Контент сверху</Typography>
              <KitDivider sx={{ my: 2 }} />
              <Typography sx={{ ...kit.typography.body, color: kit.color.body }}>Контент снизу</Typography>
            </Block>

            {/* ── Section ── */}
            <Block id="section" title="Section" description="KitSection — light / dark, sectionGap padding.">
              <Box sx={{ borderRadius: kit.radius.panel, overflow: 'hidden', border: kit.border.hairline }}>
                <Box
                  sx={{
                    py: 4,
                    px: 3,
                    bgcolor: kit.color.canvas,
                    color: kit.color.ink,
                  }}
                >
                  <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Light section</Typography>
                  <Typography sx={{ fontSize: '0.875rem', color: kit.color.muted }}>
                    bgcolor canvas · text ink · vertical rhythm {kit.space.sectionGap}px
                  </Typography>
                </Box>
                <Box
                  sx={{
                    py: 4,
                    px: 3,
                    bgcolor: kit.color.darkSurface,
                    color: kit.color.snow,
                  }}
                >
                  <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Dark section</Typography>
                  <Typography sx={{ fontSize: '0.875rem', color: kit.color.ash }}>
                    bgcolor darkSurface · text snow
                  </Typography>
                </Box>
              </Box>
            </Block>

            {/* ── Composition ── */}
            <Block
              id="compose"
              title="Composition"
              description="Сборка: header + badges + field + actions + alert — как типичный app-блок."
            >
              <KitCard variant="panel" padding="lg">
                <KitPageHeader
                  title="Новый сценарий"
                  subtitle="Параметры модели и ограничения потока"
                  action={
                    <Stack direction="row" gap={1}>
                      <KitButton variant="ghost">Отмена</KitButton>
                      <KitButton variant="primary">Сохранить</KitButton>
                    </Stack>
                  }
                  mb={2.5}
                />
                <Stack direction="row" gap={1} sx={{ mb: 2.5 }}>
                  <KitBadge variant="success">Готов</KitBadge>
                  <KitBadge variant="muted">Draft</KitBadge>
                  <KitTag variant="outline">v2</KitTag>
                </Stack>
                <Box sx={{ maxWidth: 400, mb: 2.5 }}>
                  <KitField label="Название" defaultValue="Базовый поток A" helperText="Уникально в проекте" />
                </Box>
                <KitAlert severity="info" variant="inline">
                  Изменения применятся к следующим прогонам симуляции.
                </KitAlert>
              </KitCard>
            </Block>

            <Typography sx={{ fontSize: '0.8125rem', color: kit.color.fog, pb: 4 }}>
              Import from <code>@/ui-kit</code>. Tokens: <code>kit</code>. Страница:{' '}
              <code>/ui-kit</code>.
            </Typography>
          </Box>
        </Box>
      </KitContainer>
    </Box>
  );
}
