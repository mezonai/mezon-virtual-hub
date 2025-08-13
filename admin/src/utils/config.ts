import { NavItemConfig } from '../types/nav';
import { paths } from './paths';

export const navItems = [
  {
    key: 'overview',
    title: 'Overview',
    href: paths.dashboard.overview,
    icon: 'chart-pie',
    disabled: true,
  },
  {
    key: 'users',
    title: 'Users',
    href: paths.dashboard.users,
    icon: 'users',
  },
  {
    key: 'transaction',
    title: 'Transactions',
    href: paths.dashboard.transaction,
    icon: 'current-circle-dollar',
  },
] satisfies NavItemConfig[];

export const UPDATE_USER = '/admin/users';
export const GET_TRANSACTION = '/admin/transactions';
export const LOGIN = '/auth/verify-oauth2';

export const API_URL = 'https://oauth2.mezon.ai/oauth2/auth';
export const STATE = Math.random().toString(36).substring(2, 15);
export const CLIENT_ID = '1955118881949356032';
export const RESPONSE_TYPE = 'code';
export const REDIRECT_URL = 'http://localhost:3000/callback';
export const SCOPE = 'openid offline';
