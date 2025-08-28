import { MapKey } from '@/type/enum';
import {
  AnimalRarity,
  PetType,
  SkillCode,
  SubMap,
} from '@/type/pet-players/petPlayers';
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
  exp: z.number({ message: 'Exp is required' }).refine((val) => val >= 0, {
    message: 'Exp must be positive',
  }),
  user: z
    .object({
      id: z.string().optional(),
      username: z.string().optional(),
    })
    .optional(),

  level: z.number({ message: 'Level is required' }).refine((val) => val >= 1, {
    message: 'Level must be greater than or equal to 1 ',
  }),
  battle_slot: z
    .number({ message: 'Battle Slot is required' })
    .refine((val) => val >= 0, {
      message: 'Battle slot must be positive',
    }),
  hp: z.number({ message: 'Hp is required' }).refine((val) => val >= 0, {
    message: 'Hp must be positive',
  }),
  individual_value: z
    .number({ message: 'Individual value is required' })
    .refine((val) => val >= 0, {
      message: 'Individual value must be positive',
    }),
  id: z.string().optional(),
  stars: z.number({ message: 'Stars is required' }).refine((val) => val >= 0, {
    message: 'Stars must be positive',
  }),
  skill_slot_1: z
    .object({
      skill_code: z.union([
        z.string(),
        z.enum(Object.values(SubMap) as [string, ...string[]]).optional(),
      ]),
    })
    .optional(),
  defense: z
    .number({ message: 'Defense is required' })
    .refine((val) => val >= 0, {
      message: 'Defense must be positive',
    }),
  skill_slot_2: z
    .object({
      skill_code: z.union([
        z.string(),
        z.enum(Object.values(SubMap) as [string, ...string[]]).optional(),
      ]),
    })
    .optional(),
  is_caught: z.boolean({
    message: 'Caught is required',
  }),
  name: z.string().min(1, { message: 'Name is required' }),
  speed: z.number({ message: 'Speed is required' }).refine((val) => val >= 0, {
    message: 'Speed must be positive',
  }),
  skill_slot_3: z
    .object({
      skill_code: z.union([
        z.string(),
        z.enum(Object.values(SubMap) as [string, ...string[]]).optional(),
      ]),
    })
    .optional(),
  is_brought: z.boolean({ message: 'Brought is required' }),
  attack: z
    .number({ message: 'Attack is required' })
    .refine((val) => val >= 0, {
      message: 'Attack must be positive',
    }),
  skill_slot_4: z
    .object({
      skill_code: z.union([
        z.string(),
        z.enum(Object.values(SubMap) as [string, ...string[]]).optional(),
      ]),
    })
    .optional(),
  equipped_skill_codes: z
    .array(z.nativeEnum(SkillCode).nullable())
    .nonempty({ message: 'Equipped skill code is required' }),
});

export type PetPlayerCreateInfo = z.infer<typeof petPlayerCreateSchema>;
export type PetPlayerUpdateInfo = z.infer<typeof petPlayersUpdateSchema>;
