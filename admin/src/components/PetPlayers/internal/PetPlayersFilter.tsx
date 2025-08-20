import { SearchInput } from '@/components/SearchInput';
import { SelectCheckbox, SortSelect } from '@/components/Select';
import { SelectItem } from '@/components/Select/SelectItem';
import {
  ANIMAL_RARITY_FIELD,
  PET_PLAYERS_FIELD,
  PET_TYPE_FIELD,
} from '@/constant/table/tableConfig';
import { useTableQueryParams } from '@/hooks/useTableQueryParams';
import { IPaginationParams } from '@/type/api';
import {
  PetPlayers,
  PetPlayersFilterParams,
} from '@/type/pet-players/petPlayers';
import { Card, Grid } from '@mui/material';
import { usePetPlayersFilter } from '../hooks/usePetPlayersFilter';

const caughtItem = {
  true: 'Yes',
  false: 'No',
};

export const PetPlayersFilter = () => {
  const {
    sortBy,
    order,
    handleParamsChange,
    confirmSearch,
    setConfirmSearch,
    queryParam,
  } = useTableQueryParams<PetPlayersFilterParams>();

  const { confirmSearchSpecies, setConfirmSearchSpecies } =
    usePetPlayersFilter();

  return (
    <Card sx={{ p: 2 }}>
      <Grid container spacing={3}>
        <Grid size={4}>
          <SearchInput<IPaginationParams<PetPlayers>>
            sx={{ height: '50px' }}
            placeholder="Search pet players"
            valueParams="search"
            value={confirmSearch}
            onChangeSearch={setConfirmSearch}
            onParamsChange={handleParamsChange}
          />
        </Grid>
        <Grid size={4}>
          <SortSelect<IPaginationParams<PetPlayers>, PetPlayers>
            order={order}
            sortBy={sortBy}
            onParamsChange={handleParamsChange}
            items={PET_PLAYERS_FIELD}
            sx={{ height: '50px' }}
          />
        </Grid>
        <Grid size={2}>
          <SelectItem<PetPlayersFilterParams>
            label="Pet type"
            items={PET_TYPE_FIELD}
            inputLabelProps={{ id: 'pet-type' }}
            sxInput={{ top: '-3px' }}
            selectProps={{ labelId: 'pet-type', label: 'Pet Type' }}
            sxSelect={{ height: 50 }}
            value={queryParam.pet_type}
            valueParams="pet_type"
            onChangeSelect={handleParamsChange}
          />
        </Grid>
        <Grid size={2}>
          <SelectItem<PetPlayersFilterParams>
            label="Rarity"
            items={ANIMAL_RARITY_FIELD}
            inputLabelProps={{ id: 'rarity' }}
            sxInput={{ top: '-3px' }}
            selectProps={{ labelId: 'rarity', label: 'Rarity' }}
            sxSelect={{ height: 50 }}
            value={queryParam.rarity}
            valueParams="rarity"
            onChangeSelect={handleParamsChange}
          />
        </Grid>
        <Grid size={4}>
          <SearchInput<PetPlayersFilterParams>
            sx={{ height: '50px' }}
            placeholder="Search Species"
            value={confirmSearchSpecies}
            valueParams="species"
            onParamsChange={handleParamsChange}
            onChangeSearch={setConfirmSearchSpecies}
          />
        </Grid>
        <Grid size={2}>
          <SelectCheckbox<PetPlayersFilterParams>
            inputLabelProps={{
              id: 'caught-label',
            }}
            sxInput={{
              top: '-3px',
            }}
            sxSelect={{
              height: 50,
            }}
            selectProps={{
              labelId: 'caught-label',
              id: 'caught',
            }}
            label="Caught"
            items={caughtItem}
            value={queryParam.is_caught}
            valueParams="is_caught"
            onChangeSelect={handleParamsChange}
          />
        </Grid>
      </Grid>
    </Card>
  );
};
