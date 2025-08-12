import { MenuItem, Select, SelectProps, SxProps, Theme } from '@mui/material';
import { SortOrder } from '../../../types/user';

type SortSelectProps<P> = SelectProps & {
  sortBy?: string;
  order?: string;
  sx?: SxProps<Theme>;
  onParamsChange?: (params: Partial<P>) => void;
  items: Record<string, string>;
};

export function SortSelect<
  P extends { sort_by: keyof T; order: SortOrder },
  T,
>({ items, sortBy, order, sx, onParamsChange, ...props }: SortSelectProps<P>) {
  return (
    <>
      <Select
        sx={{ minWidth: 120, ...sx }}
        value={sortBy}
        {...props}
        onChange={(e) => {
          onParamsChange?.({
            sort_by: e.target.value as keyof T,
          } as Partial<P>);
        }}
      >
        {Object.entries(items).map(([key, label]) => (
          <MenuItem key={key} value={key}>
            {label}
          </MenuItem>
        ))}
      </Select>
      <Select
        sx={{ minWidth: 120, ...sx }}
        value={order}
        {...props}
        onChange={(e) =>
          onParamsChange?.({ order: e.target.value } as Partial<P>)
        }
      >
        {Object.entries(SortOrder).map(([key, value]) => (
          <MenuItem key={key} value={key}>
            {value}
          </MenuItem>
        ))}
      </Select>
    </>
  );
}
