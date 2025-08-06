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
] satisfies NavItemConfig[];

export const UPDATE_USER = '/admin/users';
