import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Box,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from '@mui/material';
import { LANDING } from '@/landing/styles/tokens';

export interface DataTableColumn<T> {
  id: string;
  header: string;
  sortable?: boolean;
  cell: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onRowClick?: (row: T) => void;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  onSortChange?: (sortBy: string, sortDir: 'asc' | 'desc') => void;
  loading?: boolean;
  emptyMessage?: string;
  getRowId?: (row: T) => string;
  /** Enable row virtualization for large in-page datasets */
  virtualized?: boolean;
  maxBodyHeight?: number;
  rowHeight?: number;
}

const DEFAULT_ROW_HEIGHT = 52;

export function DataTable<T>({
  data,
  columns,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onRowClick,
  sortBy,
  sortDir = 'asc',
  onSortChange,
  loading,
  emptyMessage = 'Нет данных',
  getRowId,
  virtualized = false,
  maxBodyHeight = 480,
  rowHeight = DEFAULT_ROW_HEIGHT,
}: DataTableProps<T>) {
  const [internalSort, setInternalSort] = useState<{ id: string; dir: 'asc' | 'desc' } | null>(
    null,
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeSortBy = sortBy ?? internalSort?.id;
  const activeSortDir = sortBy !== undefined ? sortDir : (internalSort?.dir ?? 'asc');
  const isControlledSort = Boolean(onSortChange);

  const handleSort = (columnId: string) => {
    const nextDir =
      activeSortBy === columnId && activeSortDir === 'asc' ? 'desc' : 'asc';
    if (onSortChange) {
      onSortChange(columnId, nextDir);
    } else {
      setInternalSort({ id: columnId, dir: nextDir });
    }
  };

  const showSortActive = (columnId: string) =>
    isControlledSort ? sortBy === columnId : activeSortBy === columnId;

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: 8,
    enabled: virtualized && data.length > 0,
  });

  if (loading) {
    return (
      <Paper variant="outlined" sx={{ borderRadius: LANDING.radiusCard, overflow: 'hidden' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} height={52} sx={{ transform: 'none' }} />
        ))}
      </Paper>
    );
  }

  const renderRow = (row: T, index: number, style?: CSSProperties) => (
    <TableRow
      key={getRowId?.(row) ?? index}
      hover
      onClick={onRowClick ? () => onRowClick(row) : undefined}
      sx={{ cursor: onRowClick ? 'pointer' : 'default', ...(style ?? {}) }}
    >
      {columns.map((column) => (
        <TableCell key={column.id}>{column.cell(row)}</TableCell>
      ))}
    </TableRow>
  );

  return (
    <Paper variant="outlined" sx={{ borderRadius: LANDING.radiusCard, overflow: 'hidden' }}>
      <TableContainer ref={virtualized ? scrollRef : undefined} sx={virtualized ? { maxHeight: maxBodyHeight, overflow: 'auto' } : undefined}>
        <Table size="small" stickyHeader={virtualized}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id} sx={{ fontWeight: 700, bgcolor: LANDING.paper }}>
                  {column.sortable ? (
                    <TableSortLabel
                      active={showSortActive(column.id)}
                      direction={showSortActive(column.id) ? activeSortDir : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.header}
                    </TableSortLabel>
                  ) : (
                    column.header
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6, color: LANDING.muted }}>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : virtualized ? (
              <>
                {virtualizer.getVirtualItems().length > 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      sx={{ height: virtualizer.getVirtualItems()[0]!.start, p: 0, border: 0 }}
                    />
                  </TableRow>
                )}
                {virtualizer.getVirtualItems().map((vRow) => {
                  const row = data[vRow.index]!;
                  return renderRow(row, vRow.index, { height: vRow.size });
                })}
                {virtualizer.getVirtualItems().length > 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      sx={{
                        height:
                          virtualizer.getTotalSize() -
                          (virtualizer.getVirtualItems().at(-1)?.end ?? 0),
                        p: 0,
                        border: 0,
                      }}
                    />
                  </TableRow>
                )}
              </>
            ) : (
              data.map((row, index) => renderRow(row, index))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ borderTop: `1px solid ${LANDING.border}` }}>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => onPageChange(newPage)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={
            onPageSizeChange
              ? (e) => onPageSizeChange(parseInt(e.target.value, 10))
              : undefined
          }
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="Строк:"
        />
      </Box>
    </Paper>
  );
}
