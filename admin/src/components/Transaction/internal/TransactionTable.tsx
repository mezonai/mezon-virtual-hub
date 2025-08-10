import {
  Box,
  Card,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import {
  Transaction,
  transactionParams,
} from '../../../types/transaction/transaction';
import { Spinner } from '../../../theme/components/spinner/Spinner';
import { formatDate } from '../../../utils/fortmat/formateDate';

interface TransactionProps {
  loading?: boolean;
  rows?: Transaction[];
  rowsPerPage?: number;
  count?: number;
  page?: number;
  onParamsChange: (params: Partial<transactionParams>) => void;
}

export const TransactionTable = ({
  rows = [],
  rowsPerPage = 0,
  count = 0,
  page = 0,
  loading,
  onParamsChange,
}: TransactionProps) => {
  if (loading) return <Spinner />;
  return (
    <Card>
      <TableContainer
        sx={{
          overflowX: 'auto',
          overflowY: 'auto',
          maxHeight: 400,
        }}
      >
        <Table sx={{ minWidth: '800px' }} stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Mezon Transaction ID</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Receiver ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Created At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow hover key={row.id}>
                <TableCell>
                  <Typography variant="subtitle2">
                    {row.mezon_transaction_id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2">{row.amount}</Typography>
                </TableCell>
                <TableCell>
                  <Typography>{row.type}</Typography>
                </TableCell>
                <TableCell>
                  <Typography>{row.currency}</Typography>
                </TableCell>
                <TableCell>
                  <Typography>{row.receiver_id}</Typography>
                </TableCell>
                <TableCell>{row.user?.username}</TableCell>
                <TableCell>
                  <Typography>
                    {formatDate({ date: row.created_at })}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Divider />
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={count}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, page: number) => {
          onParamsChange({ page: page });
        }}
        onRowsPerPageChange={(e) => {
          onParamsChange({ limit: Number(e.target.value) });
        }}
      />
    </Card>
  );
};
