import { MapKey } from '@/type/enum';
import { AnimalRarity, PetType, SubMap } from '@/type/pet-players/petPlayers';
import z from 'zod';

export const petPlayerCreateSchema = z.object({
  species: z.string().min(1, { message: 'Species is required' }),
  rarity: z.enum(Object.values(AnimalRarity) as [string, ...string[]], {
    message: 'Rarity is required',
  }),
  type: z.enum(Object.values(PetType) as [string, ...string[]], {
    message: 'Pet Type is required',
  }),
  map: z.enum(Object.values(MapKey) as [string, ...string[]], {
    message: 'Map is required',
  }),
  sub_map: z
    .union([
      z.literal(''),
      z.enum(Object.values(SubMap) as [string, ...string[]]),
    ])
    .optional(),

  quantity: z
    .number({ message: 'Quantity is required' })
    .refine((val) => val >= 0, {
      message: 'Quantity must be positive',
    })
    .optional(),
});

export const petPlayersUpdateSchema = petPlayerCreateSchema.extend({
  pet_player_id: z.string().min(1, { message: 'Pet player id is required' }),
  exp: z.number({ message: 'Exp is required' }).optional(),
  user: z.object({
    id: z.string().optional(),
    name: z.string({ message: 'User name is required' }),
  }),
  hp: z.number({ message: 'Hp is required' }).optional(),
  individual_value: z
    .number({ message: 'Individual value is required' })
    .optional(),
  id: z.string().optional(),
  stars: z.number({ message: 'Stars is required' }).optional(),
  skill_slot_1: z.object({
    skill_code: z.string({ message: 'Skill code 1 is required' }).optional(),
  }),
  room_code: z.string({ message: 'Room code is required' }).optional(),
  defense: z.number({ message: 'Defense is required' }).optional(),
  skill_slot_2: z.object({
    skill_code: z.string({ message: 'Skill code 2 is required' }).optional(),
  }),
  is_caught: z.boolean({ message: 'Caught is required' }).optional(),
  name: z.string({ message: 'Name is required' }).optional(),
  speed: z.number({ message: 'Speed is required' }).optional(),
  skill_slot_3: z.object({
    skill_code: z.string({ message: 'Skill code 3 is required' }).optional(),
  }),
  is_brought: z.boolean({ message: 'Brought is required' }).optional(),
  create_at: z.string().optional(),
  attack: z.number({ message: 'Attack is required' }).optional(),
  skill_slot_4: z.object({
    skill_code: z.string({ message: 'Skill code 4 is required' }).optional(),
  }),
  equipped_skill_codes: z.array(z.string(), {
    message: 'Equipped skill codes is required',
  }),
});

export type PetPlayerCreateInfo = z.infer<typeof petPlayerCreateSchema>;
export type PetPlayerUpdateInfo = z.infer<typeof petPlayersUpdateSchema>;
