import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Typography,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import {
  WorkspaceError,
  WorkspaceLoading,
} from '@/components/project/WorkspaceStates';
import { PROJECTS_PAGE } from '@/constants/projects';
import { useProjectContext } from '@/context/projectContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import {
  fetchRunTrace,
  fetchRuns,
} from '@/services/projectWorkspaceService';
import type { TraceFrame } from '@/types/simulation';
import { WorkspacePageHeader } from '@/components/project/WorkspacePageHeader';
import { SIM_COLORS } from '@/constants/simColors';

const COMPLETED_STATUSES = new Set(['completed', 'completed_with_warnings', 'failed']);

const ZONE_COLORS: Record<string, string> = {
  B: SIM_COLORS.zones.B,
  C: SIM_COLORS.zones.C,
  D: SIM_COLORS.zones.D,
};

function TraceCanvas({ frame }: { frame: TraceFrame | null }) {
  const width = 720;
  const height = 220;

  const parcels = frame?.parcels ?? [];
  const robot = frame?.robot;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="2D trace">
      <rect x={0} y={80} width={width} height={40} fill={SIM_COLORS.surface} rx={4} />
      <text x={16} y={72} fill={SIM_COLORS.muted} fontSize={12}>
        Лента
      </text>

      {(['B', 'C', 'D'] as const).map((zone, index) => (
        <g key={zone}>
          <rect
            x={480 + index * 70}
            y={20}
            width={60}
            height={60}
            fill={`${ZONE_COLORS[zone]}22`}
            stroke={ZONE_COLORS[zone]}
            strokeWidth={2}
            rx={6}
          />
          <text
            x={510 + index * 70}
            y={55}
            textAnchor="middle"
            fill={ZONE_COLORS[zone]}
            fontSize={14}
            fontWeight={700}
          >
            {zone}
          </text>
        </g>
      ))}

      {parcels.map((parcel) => {
        const x = 40 + (parcel.x_mm / 1200) * 400;
        const y = 100;
        const color = parcel.zone ? ZONE_COLORS[parcel.zone] ?? SIM_COLORS.muted : SIM_COLORS.stroke;
        return (
          <g key={parcel.id}>
            <rect x={x} y={y - 12} width={24} height={24} fill={color} rx={4} />
            <text x={x + 12} y={y + 28} textAnchor="middle" fontSize={9} fill={SIM_COLORS.muted}>
              {parcel.product_id}
            </text>
          </g>
        );
      })}

      {robot && (
        <g>
          <circle cx={360} cy={40} r={18} fill={SIM_COLORS.body} />
          <text x={360} y={44} textAnchor="middle" fill="#fff" fontSize={10}>
            R
          </text>
          <text x={390} y={44} fill={SIM_COLORS.muted} fontSize={11}>
            {robot.phase}
            {robot.vacuum_on ? ' · vacuum' : ''}
          </text>
        </g>
      )}
    </svg>
  );
}

export function ProjectVisualizationPage() {
  const { project } = useProjectContext();
  const runsFetcher = useCallback(() => fetchRuns(project.id), [project.id]);
  const { data: runs, error: runsError, loading: runsLoading, retry } = useAsyncData(runsFetcher);

  const selectableRuns = useMemo(
    () => (runs ?? []).filter((run) => COMPLETED_STATUSES.has(run.status)),
    [runs],
  );

  const [selectedRunId, setSelectedRunId] = useState('');
  const [traceLoading, setTraceLoading] = useState(false);
  const [traceError, setTraceError] = useState<string | null>(null);
  const [frames, setFrames] = useState<TraceFrame[]>([]);
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const [liveStatus, setLiveStatus] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!selectedRunId && selectableRuns.length > 0) {
      setSelectedRunId(selectableRuns[0].id);
    }
  }, [selectableRuns, selectedRunId]);

  useEffect(() => {
    if (!selectedRunId || liveMode) {
      return undefined;
    }

    let cancelled = false;
    setTraceLoading(true);
    setTraceError(null);

    fetchRunTrace(project.id, selectedRunId)
      .then((trace) => {
        if (cancelled) return;
        setFrames(trace.frames ?? []);
        setFrameIndex(0);
        setPlaying(false);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setFrames([]);
          setTraceError(error instanceof Error ? error.message : 'Trace недоступен');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setTraceLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [project.id, selectedRunId, liveMode]);

  useEffect(() => {
    if (!playing || frames.length === 0) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setFrameIndex((prev) => {
        if (prev >= frames.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 50);
    return () => window.clearInterval(timer);
  }, [playing, frames.length]);

  useEffect(() => {
    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, []);

  const startLive = () => {
    if (!selectedRunId) return;

    wsRef.current?.close();
    setLiveMode(true);
    setFrames([]);
    setFrameIndex(0);
    setLiveStatus('Подключение…');
    setTraceError(null);

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(
      `${protocol}://${window.location.host}/api/v1/projects/${project.id}/runs/${selectedRunId}/live`,
    );
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data as string) as {
        type: string;
        frame?: TraceFrame;
        status?: string;
        message?: string;
      };

      if (payload.type === 'frame' && payload.frame) {
        setFrames((prev) => [...prev, payload.frame as TraceFrame]);
        setFrameIndex((prev) => prev + 1);
        setLiveStatus('Воспроизведение…');
      } else if (payload.type === 'done') {
        setLiveStatus(`Готово: ${payload.status ?? 'completed'}`);
        setLiveMode(false);
        ws.close();
      } else if (payload.type === 'error') {
        setTraceError(payload.message ?? 'WebSocket error');
        setLiveMode(false);
      }
    };

    ws.onerror = () => {
      setTraceError('Ошибка WebSocket');
      setLiveMode(false);
    };

    ws.onclose = () => {
      setLiveMode(false);
    };
  };

  const currentFrame = frames[frameIndex] ?? frames[frames.length - 1] ?? null;
  const currentTime = currentFrame?.t ?? 0;

  if (runsLoading && !runs) {
    return <WorkspaceLoading withShell={false} />;
  }

  if (runsError) {
    return <WorkspaceError withShell={false} message={runsError} onRetry={retry} />;
  }

  return (
    <Box>
      <WorkspacePageHeader title="Визуализация" subtitle="2D playback trace прогона" mb={2} />

      {selectableRuns.length === 0 ? (
        <Typography color="text.secondary">Нет прогонов с trace. Запустите расчёт.</Typography>
      ) : (
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 280 }}>
              <InputLabel id="viz-run-select">Прогон</InputLabel>
              <Select
                labelId="viz-run-select"
                label="Прогон"
                value={selectedRunId}
                onChange={(event) => setSelectedRunId(event.target.value)}
                disabled={liveMode}
              >
                {selectableRuns.map((run) => (
                  <MenuItem key={run.id} value={run.id}>
                    {run.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              onClick={() => (playing ? setPlaying(false) : setPlaying(true))}
              disabled={liveMode || frames.length === 0}
              startIcon={playing ? <PauseIcon /> : <PlayArrowIcon />}
            >
              {playing ? 'Пауза' : 'Play'}
            </Button>

            <Button variant="contained" onClick={startLive} disabled={liveMode || !selectedRunId}>
              Live (WS)
            </Button>
          </Stack>

          {traceLoading && <Typography color="text.secondary">Загрузка trace…</Typography>}
          {traceError && <Typography color="error.main">{traceError}</Typography>}
          {liveStatus && <Typography color="text.secondary">{liveStatus}</Typography>}

          <Paper elevation={0} sx={{ p: 2, border: `1px solid ${PROJECTS_PAGE.border}` }}>
            <TraceCanvas frame={currentFrame} />
            <Typography variant="body2" color="text.secondary" mt={1}>
              t = {currentTime.toFixed(2)} с · кадр {Math.min(frameIndex + 1, frames.length)} /{' '}
              {frames.length}
            </Typography>
            <Slider
              value={frames.length > 0 ? frameIndex : 0}
              min={0}
              max={Math.max(frames.length - 1, 0)}
              onChange={(_, value) => {
                setPlaying(false);
                setFrameIndex(value as number);
              }}
              disabled={frames.length === 0 || liveMode}
              sx={{ mt: 1 }}
            />
          </Paper>
        </Stack>
      )}
    </Box>
  );
}
