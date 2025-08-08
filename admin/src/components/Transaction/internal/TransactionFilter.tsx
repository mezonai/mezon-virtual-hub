import {
  Grid,
  Card,
  OutlinedInput,
  InputAdornment,
  Select,
  MenuItem,
} from '@mui/material';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { SortOrder } from '../../../types/user';
import {
  Transaction,
  transactionParams,
} from '../../../types/transaction/transaction';

const transactionFieldChange: Record<string, string> = {
  id: 'ID',
  mezon_transaction_id: 'Mezon Transaction ID',
  amount: 'Amount',
  type: 'Type',
  currency: 'Currentcy',
  receiver_id: 'Receiver ID',
  extra_attribute: 'Extra Attribute',
  created_at: 'Created At',
} as const;

interface TransactionFilterProps {
  sortBy: string;
  order: SortOrder;
  confirmSearch: string;
  onParamsChange: (params: Partial<transactionParams>) => void;
  setConfirmSearch: React.Dispatch<React.SetStateAction<string>>;
}
export const TransactionFilter = ({
  sortBy,
  order,
  confirmSearch,
  onParamsChange,
  setConfirmSearch,
}: TransactionFilterProps) => {
  return (
    <Card sx={{ p: 2 }}>
      <Grid spacing={4} container>
        <OutlinedInput
          sx={{ maxWidth: '500px' }}
          fullWidth
          placeholder="Search transaction"
          onChange={(e) => setConfirmSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onParamsChange({ search: confirmSearch });
            }
          }}
          startAdornment={
            <InputAdornment position="start">
              <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
            </InputAdornment>
          }
        />
        <Select
          sx={{ minWidth: 120 }}
          value={sortBy}
          onChange={(e) =>
            onParamsChange({ sort_by: e.target.value as keyof Transaction })
          }
        >
          {Object.entries(transactionFieldChange).map(([key, label]) => (
            <MenuItem key={key} value={key}>
              {label}
            </MenuItem>
          ))}
        </Select>
        <Select
          sx={{ minWidth: 120 }}
          value={order}
          onChange={(e) => onParamsChange({ order: e.target.value })}
        >
          {Object.entries(SortOrder).map(([key, value]) => (
            <MenuItem key={key} value={key}>
              {value}
            </MenuItem>
          ))}
        </Select>
      </Grid>
    </Card>
  );
};
