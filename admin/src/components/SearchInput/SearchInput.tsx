import {
  InputAdornment,
  OutlinedInput,
  OutlinedInputProps,
  SxProps,
  Theme,
} from '@mui/material';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import React from 'react';

interface SearchInputProps<P> extends OutlinedInputProps {
  placeholder: string;
  value?: string;
  onChangeSearch?: (value: string) => void;
  onParamsChange?: (params: Partial<P>) => void;
  sx?: SxProps<Theme>;
  valueParams: keyof P;
}

export function SearchInput<P>({
  placeholder,
  value,
  onChangeSearch,
  onParamsChange,
  sx,
  valueParams,
  ...props
}: SearchInputProps<P>): React.JSX.Element {
  return (
    <OutlinedInput
      sx={{ maxWidth: '500px', ...sx }}
      fullWidth
      {...props}
      placeholder={placeholder}
      value={value ?? ''}
      onChange={(e) => onChangeSearch?.(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onParamsChange?.({
            [valueParams as keyof P]: value,
          } as Partial<P>);
        }
      }}
      startAdornment={
        <InputAdornment position="start">
          <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
        </InputAdornment>
      }
    />
  );
}
