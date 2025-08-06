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
import { useEffect } from 'react';
import { updateUser } from '../../../services/users/updateUser';
import { toast } from 'react-toastify';

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  selectedUser: User | undefined;
  action: ActionFormType | null;
}

export const UserFormModal = ({
  open,
  onClose,
  selectedUser,
  action,
}: UserFormModalProps) => {
  const { control, handleSubmit, reset, formState } = useForm<UserInfo>({
    resolver: zodResolver(userSchema),
    mode: 'onSubmit',
    defaultValues: selectedUser,
  });

  useEffect(() => {
    if (selectedUser) {
      reset({
        ...selectedUser,
        email: selectedUser.email ?? '',
      });
    }
  }, [selectedUser, reset]);

  const onSubmit = (data: UserInfo) => {
    if (action === ActionFormType.EDIT) {
      data.position_x = selectedUser?.map?.default_position_x;
      data.position_y = selectedUser?.map?.default_position_y;
    }
    updateUser(data).then((res) => {
      if (res) {
        onClose?.();
        toast.success('Update User Successfully', {
          position: 'top-right',
        });
      }
    });
  };
  return (
    <ModalForm
      open={open}
      onSubmit={handleSubmit(onSubmit, (err) => console.log(err))}
      onClose={onClose}
      title={action === ActionFormType.EDIT ? 'Update User' : 'Add User'}
      cancelLabel="Cancel"
      submitLabel="Save"
    >
      <Grid container size={12} spacing={3}>
        <Grid size={6}>
          <Controller
            control={control}
            name="id"
            render={({ field }) => (
              <TextField
                fullWidth
                label="ID"
                value={field?.value}
                onChange={field.onChange}
                margin="normal"
                disabled
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
          <Controller
            control={control}
            name="username"
            render={({ field }) => (
              <TextField
                fullWidth
                label="Username"
                margin="normal"
                disabled
                value={field?.value}
                onChange={field.onChange}
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
            name="email"
            render={({ field }) => (
              <TextField
                fullWidth
                label="Email"
                type="email"
                margin="normal"
                disabled
                value={field?.value}
                onChange={field.onChange}
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
                    NOT SPECIFIED
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
