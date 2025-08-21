import {
  Grid,
  MenuItem,
  Select,
  SelectProps,
  SxProps,
  Theme,
} from '@mui/material';
import { SortOrder } from '@/type/enum/user';
import { useTableQueryParams } from '@/hooks/useTableQueryParams';
import { CONTROL_HEIGHT } from '@/constant/table/tableConfig';

type SortSelectParamProps<P> = SelectProps & {
  items: Record<string, string>;
  sxSelect?: SxProps<Theme>;
};

export function SortSelectParam<
  P extends { sort_by: string; order: SortOrder },
>({ items, sxSelect, ...props }: SortSelectParamProps<P>) {
  const { queryParam, handleParamsChange } = useTableQueryParams();
  return (
    <Grid container spacing={2}>
      <Grid size={6}>
        <Select
          fullWidth
          sx={{ height: CONTROL_HEIGHT, ...sxSelect }}
          value={queryParam.sort_by ?? ''}
          onChange={(e) => {
            handleParamsChange({
              sort_by: e.target.value as string,
            } as Partial<P>);
          }}
          {...props}
        >
          {Object.entries(items).map(([key, label]) => (
            <MenuItem key={key} value={key}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </Grid>
      <Grid size={6}>
        <Select
          fullWidth
          sx={{ height: CONTROL_HEIGHT, ...sxSelect }}
          value={queryParam?.order ?? ''}
          onChange={(e) => {
            handleParamsChange({
              order: e.target.value as string,
            } as Partial<P>);
          }}
          {...props}
        >
          {Object.entries(SortOrder).map(([key, value]) => (
            <MenuItem key={key} value={key}>
              {value}
            </MenuItem>
          ))}
        </Select>
      </Grid>
    </Grid>
  );
}
