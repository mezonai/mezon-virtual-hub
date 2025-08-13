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
