import { TableColumn } from '@/components/Table';
import { User } from '@/models/user';
import {
  AnimalRarity,
  PetPlayers,
  PetType,
} from '@/type/pet-players/petPlayers';
import { Transaction } from '@/type/transaction/transaction';
import { formatDate } from '@/utils/format/formatDate';

export const USER_TABLE_CONFIG: TableColumn<User>[] = [
  {
    key: 'mezon_id',
    headerName: 'Mezon ID',
  },
  {
    key: 'username',
    headerName: 'Username',
  },
  {
    key: 'email',
    headerName: 'Email',
  },
  {
    key: 'gender',
    headerName: 'Gender',
  },
  {
    key: 'map',
    headerName: 'Map',
    render: (row) => row?.map?.name ?? '-',
  },
  {
    key: 'display_name',
    headerName: 'Display name',
  },
  {
    key: 'gold',
    headerName: 'Gold',
  },
  {
    key: 'diamond',
    headerName: 'Diamond',
  },
  {
    key: 'created_at',
    headerName: 'Created At',
    render: (row) => formatDate({ date: row.created_at }),
  },
  {
    key: 'action',
    headerName: 'Action',
  },
];

export const USER_FIELDS: Record<string, string> = {
  id: 'ID',
  mezon_id: 'Mezon ID',
  username: 'Username',
  email: 'Email',
  display_name: 'Display Name',
  gold: 'Gold',
  diamond: 'Diamond',
  gender: 'Gender',
  has_first_reward: 'Has First Reward',
  created_at: 'Created At',
  updated_at: 'Updated At',
} as const;

export const TRANSACTION_TABLE_CONFIG: TableColumn<Transaction>[] = [
  {
    key: 'mezon_transaction_id',
    headerName: 'Mezon Transaction ID',
  },
  {
    key: 'amount',
    headerName: 'Amount',
  },
  {
    key: 'type',
    headerName: 'Type',
  },
  {
    key: 'currency',
    headerName: 'Currency',
  },
  {
    key: 'receiver_id',
    headerName: 'Receiver ID',
  },
  {
    key: 'user',
    headerName: 'User',
    render: (row) => row?.user?.username ?? '',
  },
  {
    key: 'created_at',
    headerName: 'Created At',
    render: (row) => formatDate({ date: row.created_at }),
  },
];

export const TRANSACTION_FIELDS: Record<string, string> = {
  id: 'ID',
  mezon_transaction_id: 'Mezon Transaction ID',
  amount: 'Amount',
  type: 'Type',
  currency: 'Currentcy',
  receiver_id: 'Receiver ID',
  extra_attribute: 'Extra Attribute',
  created_at: 'Created At',
} as const;

export const PET_PLAYERS_FIELD: Record<string, string> = {
  id: 'ID',
  name: 'Name',
  level: 'Level',
  stars: 'Stars',
  is_caught: 'Is Caught',
  equipped_skill_codes: 'Equipped Skill',
  created_at: 'Created At',
};

export const PET_PLAYERS_TABLE_CONFIG: TableColumn<PetPlayers>[] = [
  {
    key: 'id',
    headerName: 'ID',
  },
  {
    key: 'name',
    headerName: 'Name',
  },
  {
    key: 'level',
    headerName: 'Level',
  },
  {
    key: 'stars',
    headerName: 'Stars',
  },
  {
    key: 'is_caught',
    headerName: 'Is Caught',
  },
  {
    key: 'equipped_skill_codes',
    headerName: 'Equipped Skill',
  },
  {
    key: 'user',
    headerName: 'User',
    render: (row) => row?.user?.username ?? '',
  },
  {
    key: 'pet',
    headerName: 'Pet',
    render: (row) => row?.pet?.species ?? '',
  },
  {
    key: 'created_at',
    headerName: 'Created At',
    render: (row) => formatDate({ date: row.created_at }),
  },
  {
    key: 'action',
    headerName: 'Action',
  },
];

export const PET_TYPE_FIELD: Record<PetType, string> = {
  [PetType.NORMAL]: 'Normal',
  [PetType.FIRE]: 'Fire',
  [PetType.ICE]: 'Ice',
  [PetType.WATER]: 'Water',
  [PetType.ELECTRIC]: 'Electric',
  [PetType.GRASS]: 'Grass',
  [PetType.DRAGON]: 'Dragon',
};

export const ANIMAL_RARITY_FIELD: Record<AnimalRarity, string> = {
  [AnimalRarity.COMMON]: 'Common',
  [AnimalRarity.RARE]: 'Race',
  [AnimalRarity.EPIC]: 'Epic',
  [AnimalRarity.LEGENDARY]: 'Legendary',
};

export const CONTROL_HEIGHT = '50px';
export const WIDTH_SEARCH_PARAMS = '500px';
export const TOP_INPUT_LABEL_PARAMS = '-3px';
