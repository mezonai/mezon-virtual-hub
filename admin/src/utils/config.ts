import { NavItemConfig } from '../type/nav';
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
  {
    key: 'petPlayers',
    title: 'Pet Players',
    href: paths.dashboard.petPlayers,
    icon: 'dog',
  },
] satisfies NavItemConfig[];

export const GET_USERS = '/admin/users';
export const UPDATE_USER = '/admin/users';
export const GET_TRANSACTION = '/admin/transactions';
export const LOGIN = '/admin/auth/verify-oauth2';
export const REFRESH_TOKEN = '/admin/auth/refresh-token';
export const REDIRECT_OAUTH2 = '/admin/auth/redirect-oauth2';
export const GET_PET_PLAYERS = '/admin/pet-players';
