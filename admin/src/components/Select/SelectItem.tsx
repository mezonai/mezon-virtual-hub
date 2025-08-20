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

type SelectItemProps<P> = {
  label?: string;
  sxSelect?: SxProps<Theme>;
  items: Record<string, string>;
  inputLabelProps?: InputLabelProps;
  selectProps?: SelectProps;
  sxInput?: SxProps<Theme>;
  value?: string;
  onChangeSelect?: (params: Partial<P>) => void;
  valueParams?: keyof P;
};

export function SelectItem<P>({
  label,
  sxSelect,
  items,
  inputLabelProps,
  selectProps,
  sxInput,
  value,
  onChangeSelect,
  valueParams,
}: SelectItemProps<P>) {
  return (
    <FormControl fullWidth>
      <InputLabel {...inputLabelProps} sx={{ ...sxInput }}>
        {label}
      </InputLabel>
      <Select
        sx={{ ...sxSelect }}
        {...selectProps}
        value={value ?? ''}
        onChange={(e) => {
          onChangeSelect?.({
            [valueParams as keyof P]: e.target.value,
          } as Partial<P>);
        }}
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
