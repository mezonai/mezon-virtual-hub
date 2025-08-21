import { CONTROL_HEIGHT } from '@/constant/table/tableConfig';
import { useTableQueryParams } from '@/hooks/useTableQueryParams';
import {
  FormControl,
  InputLabel,
  InputLabelProps,
  MenuItem,
  Select,
  SelectProps,
  SxProps,
  Theme,
} from '@mui/material';

type SelectItemParamProps<P> = SelectProps & {
  valueParams: keyof P;
  items: Record<string, string>;
  label?: string;
  inputLabelProps?: InputLabelProps;
  sxSelect?: SxProps<Theme>;
  sxInput?: SxProps<Theme>;
};

export function SelectItemParam<P extends Record<string, any>>({
  items,
  label,
  valueParams,
  inputLabelProps,
  sxSelect,
  sxInput,
  ...props
}: SelectItemParamProps<P>) {
  const { queryParam, handleParamsChange } = useTableQueryParams<P>();
  return (
    <FormControl fullWidth>
      <InputLabel sx={{ top: '-3px', ...sxInput }} {...inputLabelProps}>
        {label}
      </InputLabel>
      <Select
        label={label}
        value={queryParam?.[valueParams] ?? ''}
        onChange={(e) => {
          handleParamsChange({
            [valueParams as keyof P]: e.target.value,
          } as Partial<P>);
        }}
        sx={{ height: CONTROL_HEIGHT, ...sxSelect }}
        {...props}
      >
        {Object.entries(items).map(([key, value]) => (
          <MenuItem key={key} value={key}>
            {value}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
