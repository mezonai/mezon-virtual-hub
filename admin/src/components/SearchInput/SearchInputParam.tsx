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
import { useEffect, useState } from 'react';

interface SearchInputParamProps<P> extends OutlinedInputProps {
  placeholder: string;
  valueParams: keyof P | keyof IQueryParams;
  sx?: SxProps<Theme>;
}

export function SearchInputParam<P extends Record<string, any>>({
  placeholder,
  valueParams,
  sx,
  ...props
}: SearchInputParamProps<P>) {
  const [confirmSearch, setConfirmSearch] = useState<string>('');
  const { handleParamsChange, queryParam } = useTableQueryParams<P>();

  useEffect(() => {
    setConfirmSearch(queryParam?.[valueParams] ?? '');
  }, [queryParam?.[valueParams]]);

  return (
    <OutlinedInput
      fullWidth
      sx={{ height: CONTROL_HEIGHT, maxWidth: WIDTH_SEARCH_PARAMS, ...sx }}
      placeholder={placeholder}
      value={confirmSearch}
      onChange={(e) => setConfirmSearch(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleParamsChange({
            [valueParams as keyof P | keyof IQueryParams]: confirmSearch,
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
