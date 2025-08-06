import { z } from 'zod';

export const userSchema = z.object({
  id: z.string().optional(),
  username: z.string().optional(),
  email: z.string().optional(),
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
    .min(-1, { message: 'Gold is required' }),
  has_first_reward: z.boolean(),
  gender: z.string({ message: 'Gender is required' }),
  position_x: z.number().optional(),
  position_y: z.number().optional(),
});

export type UserInfo = z.infer<typeof userSchema>;
