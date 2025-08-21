import {
  CONTROL_HEIGHT,
  TOP_INPUT_LABEL_PARAMS,
} from '@/constant/table/tableConfig';
import { useTableQueryParams } from '@/hooks/useTableQueryParams';
import {
  SelectProps,
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  SxProps,
  Theme,
} from '@mui/material';

type SelectCheckboxParamProps<P> = SelectProps & {
  items: Record<string, string>;
  valueParams: keyof P;
  label: string;
  sxSelect?: SxProps<Theme>;
  sxInputLabel?: SxProps<Theme>;
};

export function SelectCheckboxParam<P extends Record<string, any>>({
  items,
  valueParams,
  label,
  sxSelect,
  sxInputLabel,
  ...props
}: SelectCheckboxParamProps<P>) {
  const { queryParam, handleParamsChange } = useTableQueryParams<P>();

  return (
    <FormControl fullWidth>
      <InputLabel sx={{ top: TOP_INPUT_LABEL_PARAMS, ...sxInputLabel }}>
        {label}
      </InputLabel>
      <Select
        sx={{ height: CONTROL_HEIGHT, ...sxSelect }}
        value={queryParam?.[valueParams] ?? ''}
        onChange={(e) => {
          handleParamsChange({
            [valueParams]: e.target.value,
          } as Partial<P>);
        }}
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => items[selected as string] ?? ''}
        {...props}
      >
        {Object.entries(items).map(([key, item]) => (
          <MenuItem key={key} value={key}>
            <Checkbox checked={String(queryParam?.[valueParams]) === key} />
            <ListItemText primary={item} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
