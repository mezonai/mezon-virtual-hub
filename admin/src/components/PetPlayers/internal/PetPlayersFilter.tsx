import { SearchInputParam } from '@/components/SearchInput/SearchInputParam';
import { SelectCheckboxParam } from '@/components/Select/SelectCheckboxParam';
import { SelectItemParam } from '@/components/Select/SelectItemParam';
import { SortSelectParam } from '@/components/Select/SortSelectParam';
import {
  ANIMAL_RARITY_FIELD,
  PET_PLAYERS_FIELD,
  PET_TYPE_FIELD,
} from '@/constant/table/tableConfig';
import { IPaginationParams } from '@/type/api';
import {
  PetPlayers,
  PetPlayersFilterParams,
} from '@/type/pet-players/petPlayers';
import { Card, Grid } from '@mui/material';

const caughtItem = {
  true: 'Yes',
  false: 'No',
};

export const PetPlayersFilter = () => {
  return (
    <Card sx={{ p: 2 }}>
      <Grid container spacing={3}>
        <Grid size={4}>
          <SearchInputParam<IPaginationParams<PetPlayers>>
            placeholder="Search pet players"
            valueParams="search"
          />
        </Grid>
        <Grid size={4}>
          <SortSelectParam<IPaginationParams<PetPlayers>>
            items={PET_PLAYERS_FIELD}
          />
        </Grid>
        <Grid size={2}>
          <SelectItemParam<PetPlayersFilterParams>
            items={PET_TYPE_FIELD}
            label="Pet type"
            valueParams="pet_type"
          />
        </Grid>
        <Grid size={2}>
          <SelectItemParam<PetPlayersFilterParams>
            label="Rarity"
            items={ANIMAL_RARITY_FIELD}
            valueParams="rarity"
          />
        </Grid>
        <Grid size={4}>
          <SearchInputParam<PetPlayersFilterParams>
            placeholder="Search Species"
            valueParams="species"
          />
        </Grid>
        <Grid size={2}>
          <SelectCheckboxParam<PetPlayersFilterParams>
            items={caughtItem}
            valueParams="is_caught"
            label="Caught"
          />
        </Grid>
      </Grid>
    </Card>
  );
};
