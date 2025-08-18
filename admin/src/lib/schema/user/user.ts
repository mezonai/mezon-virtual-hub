import { Role } from '@/type/enum';
import { z } from 'zod';


export const userSchema = z.object({
  mezon_id: z.string().min(1, { message: 'Mezon id is required' }),
  display_name: z.string().min(1, { message: 'Display name is required' }),
  gold: z
    .number({ message: 'Gold is required!' })
    .min(-1, { message: 'Gold is required' }),
  diamond: z
    .number({ message: 'Diamond is required!' })
    .min(-1, { message: 'Diamond is required' }),
  role: z.nativeEnum(Role).refine((val) => Object.values(Role).includes(val), {
    message: 'Invalid role selected.',
  }),
  has_first_reward: z.boolean(),
  gender: z.string({ message: 'Gender is required' }),
});

export type UserInfo = z.infer<typeof userSchema>;
