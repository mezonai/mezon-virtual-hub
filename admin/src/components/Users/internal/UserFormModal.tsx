import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { ModalForm } from '../../../theme/components/modals/ModalForm';
import { Controller, useForm } from 'react-hook-form';
import { UserInfo, userSchema } from '../../../lib/schema/user/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { updateUser } from '../../../services/users/updateUser';
import { ActionFormType, Gender, Role } from '../../../types/user';
import { Toast } from '../../../theme/components/Toast/Toast';
import { ToastType } from '../../../types/toast/toast';
import { SharedTextField } from '../../../theme/components/SharedTextField/SharedTextField';
import { User } from '../../../types/user/user';
interface UserFormModalProps {
  open: boolean;
  selectedUser: User | undefined;
  action: ActionFormType | null;
  closeFormModal: () => void;
}

export const UserFormModal = ({
  open,
  selectedUser,
  action,
  closeFormModal,
}: UserFormModalProps) => {
  const { control, handleSubmit, reset, formState } = useForm<UserInfo>({
    resolver: zodResolver(userSchema),
    mode: 'onTouched',
    defaultValues: selectedUser,
  });

  useEffect(() => {
    if (selectedUser) {
      reset(selectedUser);
    }
  }, [selectedUser, reset]);

  const handleClose = () => {
    closeFormModal?.();
    reset(selectedUser);
  };

  const onSubmit = (data: UserInfo) => {
    const user_id = selectedUser?.id;
    updateUser(data, user_id).then((res) => {
      if (res) {
        Toast({
          message: 'Update User Successfully',
          type: ToastType.SUCCESS,
        });
        reset(data);
        closeFormModal?.();
      }
    });
  };

  return (
    <ModalForm
      open={open}
      onSubmit={handleSubmit(onSubmit)}
      onClose={handleClose}
      title={action === ActionFormType.EDIT ? 'Update User' : 'Add User'}
      cancelLabel="Cancel"
      submitLabel="Save"
      isDisableBtnSave={!formState.isDirty || !formState.isValid}
    >
      <Grid container size={12} spacing={3}>
        <Grid size={6}>
          <SharedTextField
            fullWidth
            label="ID"
            value={selectedUser?.id}
            margin="normal"
            disabled
            shrinkMode={true}
          />
        </Grid>
        <Grid size={6}>
          <Controller
            control={control}
            name="mezon_id"
            render={({ field }) => (
              <SharedTextField
                fullWidth
                label="Mezon ID"
                margin="normal"
                {...field}
                error={!!formState.errors.mezon_id}
                helperText={formState.errors.mezon_id?.message}
                shrinkMode="auto"
              />
            )}
          />
        </Grid>
      </Grid>
      <Grid container size={12} spacing={3}>
        <Grid size={6}>
          <SharedTextField
            fullWidth
            label="Username"
            margin="normal"
            disabled
            value={selectedUser?.username}
            shrinkMode={true}
          />
        </Grid>
        <Grid size={6}>
          <SharedTextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            disabled
            value={selectedUser?.email}
            shrinkMode={true}
          />
        </Grid>
      </Grid>
      <Grid container size={12} spacing={3}>
        <Grid size={6}>
          <Controller
            control={control}
            name="display_name"
            render={({ field }) => (
              <SharedTextField
                fullWidth
                label="Display Name"
                {...field}
                margin="normal"
                error={!!formState.errors.display_name}
                helperText={formState.errors.display_name?.message}
                shrinkMode="auto"
              />
            )}
          />
        </Grid>
        <Grid size={6}>
          <Controller
            control={control}
            name="gold"
            render={({ field }) => (
              <SharedTextField
                {...field}
                fullWidth
                label="Gold"
                type="number"
                margin="normal"
                onChange={(e) => field.onChange(Number(e.target.value))}
                error={!!formState.errors.gold}
                helperText={formState.errors.gold?.message}
                shrinkMode="auto"
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
              <SharedTextField
                fullWidth
                label="Diamond"
                margin="normal"
                type="number"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
                error={!!formState.errors.diamond}
                helperText={formState.errors.diamond?.message}
                shrinkMode="auto"
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
                  value={String(field.value)}
                  onChange={(e) => field.onChange(String(e.target.value))}
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
            render={({ field }) => {
              return (
                <FormControl
                  fullWidth
                  margin="normal"
                  error={!!formState.errors.role}
                >
                  <InputLabel>Role</InputLabel>
                  <Select
                    label="Role"
                    value={Number(field.value)}
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
              );
            }}
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
