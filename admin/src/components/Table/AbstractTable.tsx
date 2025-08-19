import {
  Box,
  Button,
  Card,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import React from 'react';
import { Spinner } from '../Spinner/Spinner';

export interface TableColumn<T> {
  key: keyof T | string;
  headerName: string;
  render?: (row: T) => React.ReactNode;
}

interface ActionButton<T> {
  onClick?: (row: T) => void;
  color?: 'success' | 'error';
  icon?: React.ReactNode;
}

interface AbstractTableProps<T, P> {
  columns: TableColumn<T>[];
  rows: T[];
  actionBtn?: ActionButton<T>[];
  count?: number;
  page?: number;
  rowsPerPage?: number;
  onParamsChange?: (params: Partial<P>) => void;
  loading?: boolean;
}

export function AbstractTable<
  T extends { id: string | number },
  P extends { page: number; limit: number },
>({
  columns,
  rows,
  actionBtn,
  count = 0,
  page = 0,
  rowsPerPage = 0,
  onParamsChange,
  loading,
}: AbstractTableProps<T, P>): React.JSX.Element {
  return (
    <Card>
      <Box sx={{ position: 'relative' }}>
        <TableContainer
          sx={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 400 }}
        >
          <Table sx={{ minWidth: '800px' }} stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((col, index) => (
                  <TableCell key={index}>{col.headerName}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow hover key={row.id}>
                  {columns.map((col, index) => {
                    if (col.key === 'action') {
                      return (
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            {actionBtn?.map((action, index) => (
                              <Button
                                variant="contained"
                                key={index}
                                onClick={() => action?.onClick?.(row)}
                                color={action.color || 'primary'}
                                sx={{
                                  justifyContent: 'flex-center',
                                  gap: 1.5,
                                  paddingLeft: 2,
                                }}
                              >
                                {action.icon}
                              </Button>
                            ))}
                          </Stack>
                        </TableCell>
                      );
                    } else {
                      return (
                        <TableCell key={index}>
                          {col.render ? (
                            col.render(row)
                          ) : (
                            <Typography variant="subtitle2">
                              {typeof col.key === 'string'
                                ? ((row as any)[col.key] ?? '')
                                : ''}
                            </Typography>
                          )}
                        </TableCell>
                      );
                    }
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {loading && <Spinner variant="absolute" />}
      </Box>
      <Divider />
      <TablePagination
        component="div"
        rowsPerPageOptions={[5, 10, 15]}
        count={count}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, page: number) => {
          onParamsChange?.({ page: page } as Partial<P>);
        }}
        onRowsPerPageChange={(e) => {
          onParamsChange?.({ limit: Number(e.target.value) } as Partial<P>);
        }}
      />
    </Card>
  );
}
