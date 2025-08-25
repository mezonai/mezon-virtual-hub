import { useQueryParam } from '@/hooks/useQueryParam';

export interface IQueryParamPetPlayerDetail {
  pet_player_id: string;
}

export const usePetPlayersDetailParam = () => {
  const defaultParam: IQueryParamPetPlayerDetail = {
    pet_player_id: '',
  };
  const { queryParam, handleParamsChange } = useQueryParam<
    Partial<IQueryParamPetPlayerDetail>
  >({
    defaultParam: defaultParam,
  });

  return {
    queryParamPetPlayerDetail: queryParam,
    handleParamPetPlayerDetail: handleParamsChange,
  };
};
