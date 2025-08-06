import { z } from 'zod';

export const userSchema = z.object({
  mezon_id: z
    .string({ message: 'Mezon id is required' })
    .min(1, { message: 'Mezon id is required' }),
  display_name: z
    .string({ message: 'Display name is required' })
    .min(1, { message: 'Display name is required' }),
  gold: z
    .number({ message: 'Gold is required!' })
    .min(-1, { message: 'Gold is required' }),
  diamond: z
    .number({ message: 'Diamond is required!' })
    .min(-1, { message: 'Diamond is required' }),
  role: z
    .number({ message: 'Role is required' })
    .min(-1, { message: 'Role is required' }),
  has_first_reward: z.boolean(),
  gender: z.string({ message: 'Gender is required' }),
});

export type UserInfo = z.infer<typeof userSchema>;
