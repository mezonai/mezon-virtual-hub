export const paths = {
  home: '/',
  auth: {
    login: '/login',
    signUp: '/auth/sign-up',
    resetPassword: '/auth/reset-password',
  },
  dashboard: {
    overview: '/dashboard',
    users: '/dashboard/users',
    transaction: '/dashboard/transaction',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
