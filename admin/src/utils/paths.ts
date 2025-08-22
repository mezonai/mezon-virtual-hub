export const paths = {
  home: '/',
  auth: {
    login: '/login',
    signUp: '/auth/sign-up',
    resetPassword: '/auth/reset-password',
    callback: '/callback',
  },
  dashboard: {
    overview: '/dashboard',
    users: '/dashboard/users',
    transaction: '/dashboard/transaction',
    petPlayers: '/dashboard/pet-players',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
