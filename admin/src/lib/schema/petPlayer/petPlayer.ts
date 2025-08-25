import { AnimalRarity, PetType } from '@/type/pet-players/petPlayers';
import z from 'zod';

export const petPlayerCreateSchema = z.object({
  species: z.string().min(1, { message: 'Species is required' }),
  rarity: z.enum(Object.values(AnimalRarity) as [string, ...string[]], {
    message: 'Rarity is required',
  }),
  type: z.enum(Object.values(PetType) as [string, ...string[]], {
    message: 'Pet Type is required',
  }),
  map: z.string({ message: 'Map is required' }),
  quantity: z
    .number({ message: 'Quantity is required' })
    .refine((val) => val >= 0, {
      message: 'Quantity must be positive',
    })
    .optional(),
});

export const petPlayersUpdateSchema = petPlayerCreateSchema.extend({
  pet_player_id: z.string().min(1, { message: 'Pet player id is required' }),
});

export type PetPlayerCreateInfo = z.infer<typeof petPlayerCreateSchema>;
export type PetPlayerUpdateInfo = z.infer<typeof petPlayersUpdateSchema>;
