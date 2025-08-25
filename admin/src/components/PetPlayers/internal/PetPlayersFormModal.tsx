import { ModalForm } from '@/components/modals';
import { SharedTextField } from '@/components/SharedTextField';
import { usePetPlayersStore } from '@/store/petPlayers/store';
import { ActionFormType } from '@/type/enum';
import {
  AnimalRarity,
  PetType,
  SkillCode,
} from '@/type/pet-players/petPlayers';
import {
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { usePetPlayersDetailParam } from '../hook/usePetPlayersDetailParam';
import { formatDate } from '@/utils/format/formatDate';
import { Spinner } from '@/components/Spinner';
import { Controller, useForm } from 'react-hook-form';
import {
  PetPlayerCreateInfo,
  petPlayerCreateSchema,
  petPlayersUpdateSchema,
  PetPlayerUpdateInfo,
} from '@/lib/schema/petPlayer/petPlayer';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { createPetPlayers } from '@/services/petPlayers/createPetPlayers';
import { Toast } from '@/components/Toast';
import { ToastType } from '@/type/toast/toast';
import { updatePetPlayers } from '@/services/petPlayers/updatePetPlayers';

interface PetPlayersFormModalProps {
  open: boolean;
  action: ActionFormType | null;
  closeFormModal: () => void;
  loading: boolean;
}

export function PetPlayersFormModal({
  open,
  action,
  closeFormModal,
  loading,
}: PetPlayersFormModalProps) {
  const { petPlayersDetail } = usePetPlayersStore();
  const { handleParamPetPlayerDetail, queryParamPetPlayerDetail } =
    usePetPlayersDetailParam();
  const isEdit = action === ActionFormType.EDIT;

  const handleClose = () => {
    closeFormModal?.();
    if (!isEdit) {
      reset();
    } else {
      handleParamPetPlayerDetail({ pet_player_id: '' });
    }
  };

  const { control, formState, handleSubmit, reset } = useForm<
    PetPlayerCreateInfo | PetPlayerUpdateInfo
  >({
    resolver: zodResolver(
      isEdit ? petPlayersUpdateSchema : petPlayerCreateSchema,
    ),
    mode: 'onTouched',
    defaultValues: {
      species: '',
      rarity: '',
      type: '',
      map: '',
      quantity: 1,
    },
  });

  const submitAction = (
    data: PetPlayerCreateInfo | PetPlayerUpdateInfo,
    pet_player_id: string,
  ) => {
    if (isEdit) {
      return updatePetPlayers(data as PetPlayerUpdateInfo, pet_player_id);
    } else {
      return createPetPlayers(data as PetPlayerCreateInfo);
    }
  };

  const onSubmit = (data: PetPlayerCreateInfo | PetPlayerUpdateInfo) => {
    submitAction(data, petPlayersDetail.id).then((res) => {
      if (!res) return;
      Toast({
        message: isEdit
          ? 'Update Pet Player Successfully'
          : 'Create Pet Player Successfully',
        type: ToastType.SUCCESS,
      });
      reset();
      closeFormModal?.();
    });
  };

  useEffect(() => {
    if (isEdit && petPlayersDetail) {
      reset({
        species: petPlayersDetail?.pet?.species ?? '',
        rarity: petPlayersDetail?.pet?.rarity ?? '',
        type: petPlayersDetail?.pet?.type ?? '',
      });
    } else {
      reset({
        species: '',
        rarity: '',
        type: '',
        quantity: 0,
      });
    }
  }, [isEdit, petPlayersDetail, reset]);
  return (
    <ModalForm
      open={open}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)}
      title={
        action === ActionFormType.EDIT ? 'Update Pet Player' : 'Add Pet Player'
      }
      cancelLabel="Cancel"
      submitLabel="Save"
      isDisableBtnSave={!formState.isDirty || !formState.isValid}
    >
      {loading && <Spinner />}
      <Grid
        container
        size={12}
        spacing={3}
        sx={{
          overflowY: 'auto',
          maxHeight: '400px',
          paddingRight: '10px',
          paddingTop: '10px',
        }}
      >
        {isEdit && (
          <Grid size={3}>
            <SharedTextField
              fullWidth
              label="Exp"
              type="number"
              value={petPlayersDetail?.exp ?? ''}
              shrinkMode="auto"
            />
          </Grid>
        )}

        {isEdit && (
          <Grid size={3}>
            <SharedTextField
              fullWidth
              label="Battle Slot"
              shrinkMode="auto"
              type="number"
              value={petPlayersDetail?.battle_slot ?? ''}
            />
          </Grid>
        )}

        <Grid size={isEdit ? 3 : 6}>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <FormControl fullWidth error={!!formState.errors.type}>
                <InputLabel>Type</InputLabel>
                <Select
                  fullWidth
                  label="Type"
                  disabled={isEdit}
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                  error={!!formState.errors.type}
                >
                  {Object.entries(PetType).map(([key, value]) => (
                    <MenuItem key={key} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </Select>
                {formState?.errors?.type && (
                  <FormHelperText>
                    {formState.errors.type.message}
                  </FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        {isEdit && (
          <Grid size={3}>
            <SharedTextField
              fullWidth
              label="User Name"
              value={petPlayersDetail?.user?.username ?? ''}
              shrinkMode="auto"
            />
          </Grid>
        )}

        {isEdit && (
          <Grid size={3}>
            <SharedTextField
              fullWidth
              label="HP"
              type="number"
              value={petPlayersDetail?.hp ?? ''}
              shrinkMode="auto"
            />
          </Grid>
        )}

        {isEdit && (
          <Grid size={3}>
            <SharedTextField
              fullWidth
              label="Individual Value"
              shrinkMode="auto"
              type="number"
              value={petPlayersDetail?.individual_value ?? ''}
            />
          </Grid>
        )}

        <Grid size={isEdit ? 3 : 6}>
          <Controller
            control={control}
            name="species"
            render={({ field }) => (
              <SharedTextField
                fullWidth
                label="Species"
                disabled={isEdit}
                {...field}
                value={field.value ?? ''}
                onChange={(e) => {
                  field.onChange(e.target.value);
                }}
                error={!!formState.errors.species}
                helperText={formState.errors.species?.message}
                shrinkMode="auto"
              />
            )}
          />
        </Grid>

        {isEdit && (
          <Grid size={3}>
            <SharedTextField
              label="ID"
              fullWidth
              disabled
              value={petPlayersDetail?.id ?? ''}
              shrinkMode={true}
            />
          </Grid>
        )}

        {isEdit && (
          <Grid size={3}>
            <SharedTextField
              fullWidth
              label="Stars"
              type="number"
              value={petPlayersDetail?.stars ?? ''}
              shrinkMode="auto"
            />
          </Grid>
        )}

        {isEdit && (
          <Grid size={3}>
            <FormControl fullWidth>
              <InputLabel>Skill Slot 1</InputLabel>
              <Select
                fullWidth
                label="Skill Slot 1"
                value={petPlayersDetail?.skill_slot_1?.skill_code ?? ''}
              >
                {Object.entries(SkillCode).map(([key, value]) => (
                  <MenuItem key={key} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        <Grid size={isEdit ? 3 : 6}>
          <Controller
            control={control}
            name="rarity"
            render={({ field }) => (
              <FormControl fullWidth error={!!formState.errors.rarity}>
                <InputLabel>Rarity</InputLabel>
                <Select
                  fullWidth
                  label="Rarity"
                  disabled={isEdit}
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                  error={!!formState.errors.rarity}
                >
                  {Object.entries(AnimalRarity).map(([key, value]) => (
                    <MenuItem key={key} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </Select>
                {formState?.errors?.rarity && (
                  <FormHelperText>
                    {formState.errors.rarity.message}
                  </FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        {isEdit && (
          <Grid size={3}>
            <SharedTextField
              fullWidth
              label="Room Code"
              shrinkMode="auto"
              type="text"
              value={petPlayersDetail?.room_code ?? ''}
            />
          </Grid>
        )}

        {isEdit && (
          <Grid size={3}>
            <SharedTextField
              fullWidth
              label="Defense"
              type="number"
              value={petPlayersDetail?.defense ?? ''}
              shrinkMode="auto"
            />
          </Grid>
        )}
        {isEdit && (
          <Grid size={3}>
            <FormControl fullWidth>
              <InputLabel>Skill Slot 2</InputLabel>
              <Select
                fullWidth
                label="Skill Slot 2"
                value={petPlayersDetail?.skill_slot_2?.skill_code ?? ''}
              >
                {Object.entries(SkillCode).map(([key, value]) => (
                  <MenuItem key={key} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {isEdit && (
          <Grid size={3}>
            <FormControl fullWidth>
              <InputLabel>Caught</InputLabel>
              <Select
                fullWidth
                label="Caught"
                value={petPlayersDetail?.is_caught ? 'true' : 'false'}
              >
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}

        {isEdit && (
          <Grid size={3}>
            <SharedTextField
              fullWidth
              label="Name"
              value={petPlayersDetail?.name ?? ''}
              shrinkMode="auto"
            />
          </Grid>
        )}

        {isEdit && (
          <Grid size={3}>
            <SharedTextField
              fullWidth
              label="Speed"
              type="number"
              value={petPlayersDetail?.speed ?? ''}
              shrinkMode="auto"
            />
          </Grid>
        )}
        {isEdit && (
          <Grid size={3}>
            <FormControl fullWidth>
              <InputLabel>Skill Slot 3</InputLabel>
              <Select
                fullWidth
                label="Skill Slot 3"
                value={petPlayersDetail?.skill_slot_3?.skill_code ?? ''}
              >
                {Object.entries(SkillCode).map(([key, value]) => (
                  <MenuItem key={key} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
        {isEdit && (
          <Grid size={3}>
            <FormControl fullWidth>
              <InputLabel>Brought</InputLabel>
              <Select
                fullWidth
                label="Brought"
                value={petPlayersDetail?.is_brought ? 'true' : 'false'}
              >
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}

        {isEdit && (
          <Grid size={3}>
            <SharedTextField
              fullWidth
              label="Create At"
              disabled
              value={formatDate({ date: petPlayersDetail?.created_at }) ?? ''}
              shrinkMode="auto"
            />
          </Grid>
        )}

        {isEdit && (
          <Grid size={3}>
            <SharedTextField
              fullWidth
              label="Attack"
              type="number"
              value={petPlayersDetail?.attack ?? ''}
              shrinkMode="auto"
            />
          </Grid>
        )}

        {isEdit && (
          <Grid size={3}>
            <FormControl fullWidth>
              <InputLabel>Skill Slot 4</InputLabel>
              <Select
                fullWidth
                label="Skill Slot 4"
                value={petPlayersDetail?.skill_slot_4?.skill_code ?? ''}
              >
                {Object.entries(SkillCode).map(([key, value]) => (
                  <MenuItem key={key} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
        {isEdit && (
          <Grid size={3}>
            <FormControl fullWidth>
              <InputLabel>Equipped Skill Codes</InputLabel>
              <Select
                fullWidth
                label="Equipped Skill Codes"
                value={petPlayersDetail?.equipped_skill_codes ?? []}
                renderValue={(selected) =>
                  (selected as string[]).map((s) => `[${s ?? 'X'}]`).join(', ')
                }
              >
                {Object.entries(SkillCode).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
        {!isEdit && (
          <Grid size={6}>
            <Controller
              control={control}
              name="map"
              render={({ field }) => (
                <SharedTextField
                  fullWidth
                  label="Map"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                  error={!!formState.errors.map}
                  helperText={formState.errors?.map?.message}
                />
              )}
            />
          </Grid>
        )}
        {!isEdit && (
          <Grid size={6}>
            <Controller
              control={control}
              name="quantity"
              render={({ field }) => (
                <SharedTextField
                  fullWidth
                  label="Quantity"
                  type="number"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                  }}
                  error={!!formState.errors.quantity}
                  helperText={formState.errors.quantity?.message}
                />
              )}
            />
          </Grid>
        )}
      </Grid>
    </ModalForm>
  );
}
