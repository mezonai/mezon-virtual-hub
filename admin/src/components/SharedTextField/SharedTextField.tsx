import { TextField, TextFieldProps } from '@mui/material';

export type ShrinkMode = undefined | true | false | 'auto';

type SharedTextFieldProps = TextFieldProps & {
  shrinkMode?: ShrinkMode;
};

export const resolveShrink = (
  shrinkMode: ShrinkMode,
  value: unknown,
): boolean | undefined => {
  if (shrinkMode === 'auto') {
    return value !== '' && value !== null && value !== undefined;
  }
  if (shrinkMode === true || shrinkMode === false) return shrinkMode;
  return undefined;
};

export const SharedTextField = ({
  shrinkMode,
  slotProps,
  value,
  ...props
}: SharedTextFieldProps) => {
  const resolveSlotProps: TextFieldProps['slotProps'] = {
    ...slotProps,
    inputLabel: {
      shrink: resolveShrink(shrinkMode, value),
      ...slotProps?.inputLabel,
    },
  };
  return <TextField {...props} value={value} slotProps={resolveSlotProps} />;
};
