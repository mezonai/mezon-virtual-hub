import { ModalForm } from '@/components/modals';
import { SharedTextField } from '@/components/SharedTextField';
import { usePetPlayersStore } from '@/store/petPlayers/store';
import { ActionFormType } from '@/type/enum';
import {
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { usePetPlayersDetailParam } from '../hook/usePetPlayersDetailParam';
import { Spinner } from '@/components/Spinner';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  PetPlayerCreateInfo,
  petPlayerCreateSchema,
  petPlayersUpdateSchema,
  PetPlayerUpdateInfo,
} from '@/lib/schema/petPlayer/petPlayer';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Toast } from '@/components/Toast';
import { ToastType } from '@/type/toast/toast';

import {
  ANIMAL_RARITY_FIELD,
  PET_TYPE_FIELD,
} from '@/constant/table/tableConfig';
import {
  MAP_KEY_FIELD,
  SKILL_CODE_FIELD,
  SUB_MAP_FIELD,
} from '@/constant/petPlayers/petPlayer';
import { updatePetPlayer } from '@/services/petPlayers/updatePetPlayer';
import { createPetPlayer } from '@/services/petPlayers/createPetPlayer';

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
  const { handleParamPetPlayerDetail } = usePetPlayersDetailParam();
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
    PetPlayerCreateInfo & Partial<PetPlayerUpdateInfo>
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
      sub_map: '',
      quantity: 1,
    },
  });

  const mapValue = useWatch({ control, name: 'map' });

  const submitAction = (data: PetPlayerCreateInfo | PetPlayerUpdateInfo) => {
    return isEdit && 'id' in data
      ? updatePetPlayer(data)
      : createPetPlayer(data);
  };

  const onSubmit = (data: PetPlayerCreateInfo | PetPlayerUpdateInfo) => {
    submitAction(data).then((res) => {
      if (!res) return;
      Toast({
        message: isEdit
          ? 'Update Pet Player Successfully'
          : 'Create Pet Player Successfully',
        type: ToastType.SUCCESS,
      });
      reset();
      closeFormModal?.();
      handleParamPetPlayerDetail({ pet_player_id: '' });
    });
  };

  useEffect(() => {
    if (isEdit && petPlayersDetail) {
      const roomCode = petPlayersDetail.room_code ?? '';
      const [map, sub_map] = roomCode.split('-');
      reset({
        species: petPlayersDetail?.pet?.species ?? '',
        rarity: petPlayersDetail?.pet?.rarity ?? '',
        type: petPlayersDetail?.pet?.type ?? '',
        exp: petPlayersDetail?.exp ?? 0,
        user: {
          username: petPlayersDetail?.user?.username ?? '',
        },
        level: petPlayersDetail?.level ?? 1,
        battle_slot: petPlayersDetail?.battle_slot ?? 0,
        hp: petPlayersDetail?.hp ?? 0,
        individual_value: petPlayersDetail?.individual_value ?? 0,
        id: petPlayersDetail?.id ?? '',
        stars: petPlayersDetail?.stars ?? 0,
        skill_slot_1: {
          skill_code: petPlayersDetail?.skill_slot_1?.skill_code ?? '',
        },
        map: map ?? '',
        sub_map: sub_map ?? '',
        defense: petPlayersDetail?.defense ?? 0,
        skill_slot_2: {
          skill_code: petPlayersDetail?.skill_slot_2?.skill_code ?? '',
        },
        is_caught: petPlayersDetail?.is_caught ?? false,
        name: petPlayersDetail?.name ?? '',
        speed: petPlayersDetail?.speed ?? 0,
        skill_slot_3: {
          skill_code: petPlayersDetail?.skill_slot_3?.skill_code,
        },
        is_brought: petPlayersDetail?.is_brought ?? false,
        attack: petPlayersDetail?.attack ?? 0,
        skill_slot_4: {
          skill_code: petPlayersDetail?.skill_slot_4?.skill_code ?? '',
        },
        equipped_skill_codes: petPlayersDetail?.equipped_skill_codes ?? [],
      });
    }
  }, [isEdit, petPlayersDetail]);
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
      isDisableBtnSave={!formState.isValid}
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
            <Controller
              control={control}
              name="id"
              render={({ field }) => (
                <SharedTextField
                  label="ID"
                  fullWidth
                  disabled
                  value={field.value ?? ''}
                  shrinkMode={true}
                />
              )}
            />
          </Grid>
        )}

        {isEdit && (
          <Grid size={3}>
            <Controller
              control={control}
              name="battle_slot"
              render={({ field }) => (
                <SharedTextField
                  fullWidth
                  label="Battle Slot"
                  shrinkMode="auto"
                  type="number"
                  {...field}
                  value={field.value ?? 0}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  error={!!formState.errors.battle_slot}
                  helperText={formState?.errors?.battle_slot?.message}
                />
              )}
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
                  {Object.entries(PET_TYPE_FIELD).map(([key, value]) => (
                    <MenuItem key={key} value={key}>
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
            <Controller
              control={control}
              name="exp"
              render={({ field }) => (
                <SharedTextField
                  fullWidth
                  label="Exp"
                  type="number"
                  {...field}
                  value={field.value ?? 0}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  shrinkMode="auto"
                  error={!!formState.errors.exp}
                  helperText={formState?.errors?.exp?.message}
                />
              )}
            />
          </Grid>
        )}
        {isEdit && (
          <Grid size={3}>
            <Controller
              control={control}
              name="user.username"
              render={({ field }) => (
                <SharedTextField
                  fullWidth
                  label="User Name"
                  {...field}
                  shrinkMode="auto"
                />
              )}
            />
          </Grid>
        )}

        {isEdit && (
          <Grid size={3}>
            <Controller
              control={control}
              name="individual_value"
              render={({ field }) => (
                <SharedTextField
                  fullWidth
                  label="Individual Value"
                  shrinkMode="auto"
                  type="number"
                  {...field}
                  value={field.value ?? 0}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  error={!!formState.errors.individual_value}
                  helperText={formState.errors.individual_value?.message}
                />
              )}
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
            <Controller
              control={control}
              name="hp"
              render={({ field }) => (
                <SharedTextField
                  fullWidth
                  label="HP"
                  type="number"
                  {...field}
                  value={field.value ?? 0}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  error={!!formState.errors.hp}
                  helperText={formState.errors.hp?.message}
                  shrinkMode="auto"
                />
              )}
            />
          </Grid>
        )}

        {isEdit && (
          <Grid size={3}>
            <Controller
              control={control}
              name="skill_slot_1.skill_code"
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Skill Slot 1</InputLabel>
                  <Select
                    fullWidth
                    label="Skill Slot 1"
                    disabled
                    {...field}
                    value={field.value ?? ''}
                  >
                    {Object.entries(SKILL_CODE_FIELD).map(([key, value]) => (
                      <MenuItem key={key} value={key}>
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
        )}
        {isEdit && (
          <Grid size={3}>
            <Controller
              control={control}
              name="stars"
              render={({ field }) => (
                <SharedTextField
                  fullWidth
                  label="Stars"
                  type="number"
                  {...field}
                  value={field.value ?? 0}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  error={!!formState.errors.stars}
                  helperText={formState.errors.stars?.message}
                  shrinkMode="auto"
                />
              )}
            />
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
                  {Object.entries(ANIMAL_RARITY_FIELD).map(([key, value]) => (
                    <MenuItem key={key} value={key}>
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
            <Controller
              control={control}
              name="defense"
              render={({ field }) => (
                <SharedTextField
                  fullWidth
                  label="Defense"
                  type="number"
                  {...field}
                  value={field.value ?? 0}
                  shrinkMode="auto"
                  error={!!formState.errors.defense}
                  helperText={formState.errors.defense?.message}
                />
              )}
            />
          </Grid>
        )}
        {isEdit && (
          <Grid size={3}>
            <Controller
              control={control}
              name="skill_slot_2.skill_code"
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Skill Slot 2</InputLabel>
                  <Select
                    fullWidth
                    label="Skill Slot 2"
                    disabled
                    value={field.value ?? ''}
                  >
                    {Object.entries(SKILL_CODE_FIELD).map(([key, value]) => (
                      <MenuItem key={key} value={key}>
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
        )}

        {isEdit && (
          <Grid size={3}>
            <Controller
              control={control}
              name="is_caught"
              render={({ field }) => (
                <FormControl fullWidth error={!!formState.errors.is_caught}>
                  <InputLabel>Caught</InputLabel>
                  <Select
                    {...field}
                    label="Caught"
                    value={String(field.value ?? false)}
                    onChange={(e) => field.onChange(e.target.value === 'true')}
                  >
                    <MenuItem value="true">Yes</MenuItem>
                    <MenuItem value="false">No</MenuItem>
                  </Select>
                  {formState.errors.is_caught && (
                    <FormHelperText>
                      {formState.errors.is_caught.message}
                    </FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>
        )}

        {isEdit && (
          <Grid size={3}>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <SharedTextField
                  fullWidth
                  label="Name"
                  {...field}
                  value={field.value ?? ''}
                  shrinkMode="auto"
                  error={!!formState.errors.name}
                  helperText={formState.errors.name?.message}
                />
              )}
            />
          </Grid>
        )}

        {isEdit && (
          <Grid size={3}>
            <Controller
              control={control}
              name="speed"
              render={({ field }) => (
                <SharedTextField
                  fullWidth
                  label="Speed"
                  type="number"
                  {...field}
                  value={field.value ?? 0}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  shrinkMode="auto"
                  error={!!formState.errors.speed}
                  helperText={formState.errors.speed?.message}
                />
              )}
            />
          </Grid>
        )}
        {isEdit && (
          <Grid size={3}>
            <Controller
              control={control}
              name="skill_slot_3.skill_code"
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Skill Slot 3</InputLabel>
                  <Select
                    fullWidth
                    label="Skill Slot 3"
                    disabled
                    {...field}
                    value={field.value ?? ''}
                  >
                    {Object.entries(SKILL_CODE_FIELD).map(([key, value]) => (
                      <MenuItem key={key} value={key}>
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
        )}
        {isEdit && (
          <Grid size={3}>
            <Controller
              control={control}
              name="is_brought"
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Brought</InputLabel>
                  <Select
                    fullWidth
                    label="Brought"
                    value={String(field.value ?? false)}
                    onChange={(e) => field.onChange(e.target.value === 'true')}
                  >
                    <MenuItem value="true">Yes</MenuItem>
                    <MenuItem value="false">No</MenuItem>
                  </Select>
                  {formState.errors.is_brought && (
                    <FormHelperText>
                      {formState.errors.is_brought.message}
                    </FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>
        )}

        {isEdit && (
          <Grid size={3}>
            <Controller
              control={control}
              name="attack"
              render={({ field }) => (
                <SharedTextField
                  fullWidth
                  label="Attack"
                  type="number"
                  {...field}
                  value={field.value ?? 0}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  shrinkMode="auto"
                  error={!!formState.errors.attack}
                  helperText={formState.errors.attack?.message}
                />
              )}
            />
          </Grid>
        )}

        {isEdit && (
          <Grid size={3}>
            <Controller
              control={control}
              name="equipped_skill_codes"
              render={({ field }) => (
                <FormControl
                  fullWidth
                  error={!!formState.errors.equipped_skill_codes}
                >
                  <InputLabel>Equipped Skill Codes</InputLabel>
                  <Select
                    fullWidth
                    label="Equipped Skill Codes"
                    multiple
                    {...field}
                    value={field.value ?? []}
                    onChange={(e) => field.onChange(e.target.value as string[])}
                    renderValue={(selected) =>
                      (selected as string[])
                        .map((s) => `[${s ?? 'X'}]`)
                        .join(', ')
                    }
                    error={!!formState.errors.equipped_skill_codes}
                  >
                    {Object.entries(SKILL_CODE_FIELD).map(([key, value]) => (
                      <MenuItem key={key} value={key}>
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                  {formState?.errors?.equipped_skill_codes && (
                    <FormHelperText>
                      {formState.errors.equipped_skill_codes?.message}
                    </FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>
        )}
        {isEdit && (
          <Grid size={3}>
            <Controller
              control={control}
              name="skill_slot_4.skill_code"
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Skill Slot 4</InputLabel>
                  <Select
                    fullWidth
                    disabled
                    label="Skill Slot 4"
                    value={field.value ?? ''}
                  >
                    {Object.entries(SKILL_CODE_FIELD).map(([key, value]) => (
                      <MenuItem key={key} value={key}>
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
        )}
        {isEdit && (
          <Grid size={3}>
            <Controller
              control={control}
              name="level"
              render={({ field }) => (
                <SharedTextField
                  fullWidth
                  label="Level"
                  type="number"
                  {...field}
                  value={field.value ?? 1}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  shrinkMode="auto"
                  error={!!formState.errors.level}
                  helperText={formState.errors.level?.message}
                />
              )}
            />
          </Grid>
        )}

        <Grid size={isEdit ? 3 : 6}>
          <Controller
            control={control}
            name="map"
            render={({ field }) => (
              <FormControl fullWidth error={!!formState.errors.map}>
                <InputLabel>Map</InputLabel>
                <Select
                  fullWidth
                  label="Map"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                  error={!!formState.errors.map}
                >
                  {Object.entries(MAP_KEY_FIELD).map(([key, value]) => (
                    <MenuItem key={key} value={key}>
                      {value}
                    </MenuItem>
                  ))}
                </Select>
                {formState?.errors?.map && (
                  <FormHelperText>
                    {formState.errors.map.message}
                  </FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid size={isEdit ? 3 : 6}>
          <Controller
            control={control}
            name="sub_map"
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Sub Map</InputLabel>
                <Select
                  fullWidth
                  label="Sub Map"
                  {...field}
                  disabled={mapValue === '' ? true : false}
                  value={field.value ?? ''}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                >
                  {Object.entries(SUB_MAP_FIELD).map(([key, value]) => (
                    <MenuItem key={key} value={key}>
                      {value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>
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
