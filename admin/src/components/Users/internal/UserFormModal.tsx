import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { ModalForm } from '../../../theme/components/modals/ModalForm';
import { Controller, useForm } from 'react-hook-form';
import { UserInfo, userSchema } from '../../../lib/schema/user/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { ActionFormType, Gender, Role, User } from '../../../models/user';
import { useEffect, useState } from 'react';
import { updateUser } from '../../../services/users/updateUser';
import { toast } from 'react-toastify';

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  selectedUser: User | undefined;
  action: ActionFormType | null;
  isDisableBtnSave: boolean;
  setIsDisableBtnSave: (isDisableBtnSave: boolean) => void;
}

export const UserFormModal = ({
  open,
  onClose,
  selectedUser,
  action,
  isDisableBtnSave,
  setIsDisableBtnSave,
}: UserFormModalProps) => {
  const { control, handleSubmit, reset, formState, watch } = useForm<UserInfo>({
    resolver: zodResolver(userSchema),
    mode: 'onSubmit',
    defaultValues: selectedUser,
  });
  const watchValue = watch();
  useEffect(() => {
    if (selectedUser) {
      reset(selectedUser);
    }
  }, [selectedUser, reset]);

  useEffect(() => {
    const originValue = {
      display_name: selectedUser?.display_name,
      mezon_id: selectedUser?.mezon_id,
      gold: selectedUser?.gold,
      gender: selectedUser?.gender,
      has_first_reward: selectedUser?.has_first_reward,
      role: selectedUser?.role,
      diamond: selectedUser?.diamond,
    };
    const currentValue = {
      display_name: watchValue.display_name,
      mezon_id: watchValue.mezon_id,
      gold: watchValue.gold,
      gender: watchValue.gender,
      has_first_reward: watchValue.has_first_reward,
      role: watchValue.role,
      diamond: watchValue.diamond,
    };
    const isChanged =
      JSON.stringify(currentValue) === JSON.stringify(originValue);
    setIsDisableBtnSave(!isChanged);
  }, [watchValue, selectedUser]);

  const onSubmit = (data: UserInfo) => {
    const user_id = selectedUser?.id;
    updateUser(data, user_id).then((res) => {
      if (res) {
        toast.success('Update User Successfully', {
          position: 'top-right',
        });
        setIsDisableBtnSave(true);
        onClose?.();
      }
    });
  };
  return (
    <ModalForm
      open={open}
      setIsDisableBtnSave={setIsDisableBtnSave}
      onSubmit={handleSubmit(onSubmit)}
      onClose={onClose}
      title={action === ActionFormType.EDIT ? 'Update User' : 'Add User'}
      cancelLabel="Cancel"
      submitLabel="Save"
      isDisableBtnSave={isDisableBtnSave}
    >
      <Grid container size={12} spacing={3}>
        <Grid size={6}>
          <TextField
            fullWidth
            label="ID"
            value={selectedUser?.id}
            margin="normal"
            disabled
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
        </Grid>
        <Grid size={6}>
          <Controller
            control={control}
            name="mezon_id"
            render={({ field }) => (
              <TextField
                fullWidth
                label="Mezon ID"
                margin="normal"
                value={field?.value}
                onChange={field.onChange}
                error={!!formState.errors.mezon_id}
                helperText={formState.errors.mezon_id?.message}
                slotProps={{
                  inputLabel: {
                    shrink: field?.value ? true : false,
                  },
                }}
              />
            )}
          />
        </Grid>
      </Grid>
      <Grid container size={12} spacing={3}>
        <Grid size={6}>
          <TextField
            fullWidth
            label="Username"
            margin="normal"
            disabled
            value={selectedUser?.username}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            disabled
            value={selectedUser?.email}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
        </Grid>
      </Grid>
      <Grid container size={12} spacing={3}>
        <Grid size={6}>
          <Controller
            control={control}
            name="display_name"
            render={({ field }) => (
              <TextField
                fullWidth
                label="Display Name"
                margin="normal"
                value={field?.value}
                onChange={field.onChange}
                error={!!formState.errors.display_name}
                helperText={formState.errors.display_name?.message}
                slotProps={{
                  inputLabel: {
                    shrink: field?.value ? true : false,
                  },
                }}
              />
            )}
          />
        </Grid>
        <Grid size={6}>
          <Controller
            control={control}
            name="gold"
            render={({ field }) => (
              <TextField
                fullWidth
                label="Gold"
                margin="normal"
                type="number"
                value={field?.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
                error={!!formState.errors.gold}
                helperText={formState.errors.gold?.message}
                slotProps={{
                  inputLabel: {
                    shrink: field?.value !== undefined,
                  },
                }}
              />
            )}
          />
        </Grid>
      </Grid>
      <Grid container size={12} spacing={3}>
        <Grid size={6}>
          <Controller
            control={control}
            name="diamond"
            render={({ field }) => (
              <TextField
                fullWidth
                label="Diamond"
                margin="normal"
                type="number"
                value={field?.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
                error={!!formState.errors.diamond}
                helperText={formState.errors.diamond?.message}
                slotProps={{
                  inputLabel: {
                    shrink: field?.value !== undefined,
                  },
                }}
              />
            )}
          />
        </Grid>
        <Grid size={6}>
          <Controller
            control={control}
            name="gender"
            render={({ field }) => (
              <FormControl
                fullWidth
                margin="normal"
                error={!!formState.errors.gender}
              >
                <InputLabel>Gender</InputLabel>
                <Select
                  label="Gender"
                  value={field?.value ?? ''}
                  onChange={field.onChange}
                  error={!!formState.errors.gender}
                >
                  <MenuItem value={Gender.MALE}>Male</MenuItem>
                  <MenuItem value={Gender.FEMALE}>Female</MenuItem>
                  <MenuItem value={Gender.NOT_SPECIFIED}>
                    Not Specified
                  </MenuItem>
                </Select>
                {formState?.errors?.gender && (
                  <FormHelperText>
                    {formState.errors.gender.message}
                  </FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>
      </Grid>
      <Grid container size={12} spacing={3}>
        <Grid size={6}>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <FormControl
                fullWidth
                margin="normal"
                error={!!formState.errors.role}
              >
                <InputLabel>Role</InputLabel>
                <Select
                  label="Role"
                  value={field?.value ?? ''}
                  onChange={field.onChange}
                >
                  <MenuItem value={Role.ADMIN}>Admin</MenuItem>
                  <MenuItem value={Role.USER}>User</MenuItem>
                </Select>
                {formState?.errors?.role && (
                  <FormHelperText>
                    {formState.errors.role.message}
                  </FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>
        <Grid size={6} sx={{ display: 'flex', alignItems: 'center' }}>
          <Controller
            control={control}
            name="has_first_reward"
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={field.onChange}
                    checked={field?.value === true ? true : false}
                  />
                }
                label="Has First Reward"
              />
            )}
          />
        </Grid>
      </Grid>
    </ModalForm>
  );
};
