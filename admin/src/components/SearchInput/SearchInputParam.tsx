import {
  CONTROL_HEIGHT,
  WIDTH_SEARCH_PARAMS,
} from '@/constant/table/tableConfig';
import { IQueryParams, useTableQueryParams } from '@/hooks/useTableQueryParams';
import {
  InputAdornment,
  OutlinedInput,
  OutlinedInputProps,
  SxProps,
  Theme,
} from '@mui/material';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';

interface SearchInputParamProps<P> extends OutlinedInputProps {
  placeholder: string;
  valueParams: keyof P | keyof IQueryParams;
  value?: string;
  sx?: SxProps<Theme>;
}

export function SearchInputParam<P extends Record<string, any>>({
  placeholder,
  valueParams,
  value,
  sx,
  ...props
}: SearchInputParamProps<P>) {
  const { handleParamsChange } = useTableQueryParams<P>();
  return (
    <OutlinedInput
      fullWidth
      sx={{ height: CONTROL_HEIGHT, maxWidth: WIDTH_SEARCH_PARAMS, ...sx }}
      placeholder={placeholder}
      value={value ?? ''}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleParamsChange({
            [valueParams as keyof P | keyof IQueryParams]: value,
          } as Partial<P>);
        }
      }}
      {...props}
      startAdornment={
        <InputAdornment position="start">
          <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
        </InputAdornment>
      }
    />
  );
}
