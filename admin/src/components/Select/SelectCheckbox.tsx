import {
  Checkbox,
  FormControl,
  InputLabel,
  InputLabelProps,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  SelectProps,
  SxProps,
  Theme,
} from '@mui/material';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 100,
    },
  },
};

interface SelectCheckboxProps<P> {
  label?: string;
  inputLabelProps?: InputLabelProps;
  sxInput?: SxProps<Theme>;
  sxSelect?: SxProps<Theme>;
  selectProps?: SelectProps;
  items: string[] | Record<string, string>;
  value?: string | string[] | boolean;
  valueParams: keyof P;
  onChangeSelect?: (params: Partial<P>) => void;
  multiple?: boolean;
}

export function SelectCheckbox<P>({
  label,
  inputLabelProps,
  sxInput,
  sxSelect,
  selectProps,
  items,
  value,
  valueParams,
  onChangeSelect,
  multiple,
}: SelectCheckboxProps<P>) {
  const options = Array.isArray(items)
    ? items.map((item) => [item, item])
    : Object.entries(items);

  return (
    <FormControl fullWidth>
      <InputLabel {...inputLabelProps} sx={{ ...sxInput }}>
        {label}
      </InputLabel>
      <Select
        sx={{ ...sxSelect }}
        {...selectProps}
        value={value ?? ''}
        input={<OutlinedInput label={label} />}
        multiple={multiple}
        MenuProps={MenuProps}
        renderValue={(selected) =>
          multiple
            ? (selected as string[])
                .map((s) => options.find(([key]) => key === s)?.[1] ?? s)
                .join(', ')
            : (options.find(([key]) => key === selected)?.[1] ?? '')
        }
        onChange={(e) => {
          const val = multiple
            ? typeof e.target.value === 'string'
              ? e.target.value.split(',')
              : (e.target.value as string[])
            : e.target.value;
          onChangeSelect?.({
            [valueParams]: val,
          } as Partial<P>);
        }}
      >
        {options.map(([key, val]) => (
          <MenuItem key={key} value={key}>
            <Checkbox
              checked={
                multiple
                  ? (value as any[])?.includes(key)
                  : String(value) === key
              }
            />
            <ListItemText primary={val} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
